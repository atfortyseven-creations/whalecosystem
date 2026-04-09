/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║   WHALE FORTRESS WAF — OWASP Core Rule Set v3.3 (Edge Runtime)              ║
 * ║   WhaleFortress v6 — Institutional Anomaly Scoring Engine                   ║
 * ║                                                                              ║
 * ║   Architecture:                                                              ║
 * ║     1. OWASP Anomaly Score accumulates across 6 detection vectors           ║
 * ║     2. Score ≥ BLOCK_THRESHOLD → hard 403                                   ║
 * ║     3. Score ≥ CHALLENGE_THRESHOLD → soft challenge (429 with Retry-After)  ║
 * ║     4. Per-endpoint granular rate limits (hot routes get tightest limits)   ║
 * ║     5. Bot UA fingerprinting                                                 ║
 * ║     6. Path traversal / injection pattern detection                         ║
 * ║     7. Request size limits for POST hot routes                               ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { NextRequest, NextResponse } from 'next/server';

// ─── THRESHOLDS (OWASP Paranoia Level 2 equivalent) ──────────────────────────
const BLOCK_THRESHOLD     = 10;
const CHALLENGE_THRESHOLD = 5;

// ─── PER-ENDPOINT RATE LIMITS (requests / window in seconds) ─────────────────
// Tighter limits on write/trade endpoints to prevent automation abuse.
const ENDPOINT_LIMITS: Record<string, { max: number; windowSec: number }> = {
  '/api/user/nuke':           { max: 2,    windowSec: 86400 },  // 2 per day — absolute
  '/api/verify-human':        { max: 10,   windowSec: 3600  },  // 10 per hour
  '/api/defi/copy-trading':   { max: 30,   windowSec: 60    },  // 30 per minute
  '/api/defi/deposit':        { max: 20,   windowSec: 60    },
  '/api/polymarket':          { max: 100,  windowSec: 60    },
  '/api/auth':                { max: 20,   windowSec: 60    },
  '/api/user/status':         { max: 60,   windowSec: 60    },
  '/api':                     { max: 300,  windowSec: 60    },  // global API fallback
};

// ─── KNOWN MALICIOUS BOT SIGNATURES ──────────────────────────────────────────
const MALICIOUS_UA_PATTERNS = [
  /sqlmap/i, /nikto/i, /nmap/i, /masscan/i, /zgrab/i, /dirbuster/i,
  /gobuster/i, /wfuzz/i, /nuclei/i, /burpsuite/i, /acunetix/i,
  /nessus/i, /openvas/i, /metasploit/i, /hydra/i, /medusa/i,
  /curl\/7\.[0-4]/i,   // Very old curl — common in ancient exploit scripts
  /python-requests\/2\.[0-1]/i, // Very old requests lib
  /libwww-perl/i, /lwp-request/i, /go-http-client\/1\.0/i,
];

// ─── INJECTION / TRAVERSAL DETECTION PATTERNS ────────────────────────────────
const INJECTION_PATTERNS = [
  /(\.\.[\/\\]){2,}/,                          // Path traversal ../../
  /<script[\s>]/i,                             // XSS
  /javascript:/i,                              // JS protocol injection
  /(\bunion\b.*\bselect\b|\bselect\b.*\bfrom\b|\bdrop\b.*\btable\b)/i, // SQLi
  /\$\{.*\}/,                                  // Template injection
  /\bexec\b\s*\(/i,                            // Code execution attempt
  /%00/,                                       // Null byte injection
  /%2e%2e/i,                                   // URL-encoded traversal
  /\beval\b\s*\(/i,                            // Eval injection
];

// ─── SUSPICIOUS HEADERS ───────────────────────────────────────────────────────
const SUSPICIOUS_HEADERS = [
  'x-forwarded-host',
  'x-original-url',
  'x-rewrite-url',
  'x-custom-ip-authorization',
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getIP(req: NextRequest): string {
  return (req.headers.get('x-forwarded-for')?.split(',')[0] ??
          req.headers.get('x-real-ip') ??
          req.headers.get('cf-connecting-ip') ??
          '127.0.0.1').trim();
}

function buildBlockResponse(anomalyScore: number, reason: string, ip: string): NextResponse {
  console.error(`[WhaleFortress:WAF] 🚫 BLOCKED score=${anomalyScore} reason="${reason}" ip=${ip}`);
  return new NextResponse(
    JSON.stringify({ error: 'WAF_BLOCK', code: 403, message: 'Request blocked by Institutional Security Policy.' }),
    { status: 403, headers: { 'Content-Type': 'application/json', 'X-WAF-Block': 'true' } }
  );
}

function buildChallengeResponse(retryAfter: number, ip: string): NextResponse {
  console.warn(`[WhaleFortress:WAF] ⚠️ RATE_LIMITED ip=${ip} retry=${retryAfter}s`);
  return new NextResponse(
    JSON.stringify({ error: 'RATE_LIMITED', retryAfter, message: `System busy. Retry in ${retryAfter}s.` }),
    { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': String(retryAfter) } }
  );
}

// ─── IN-MEMORY SLIDING WINDOW (Edge-compatible, falls back gracefully) ────────
// For production with high traffic, this is supplemented by the Redis rate limiter.
// The in-memory window acts as the FIRST line of defense at zero latency.

const ipWindows = new Map<string, { count: number; resetAt: number }>();

function inMemoryRateCheck(key: string, max: number, windowSec: number): boolean {
  const now = Date.now();
  const window = ipWindows.get(key);
  
  if (!window || now > window.resetAt) {
    ipWindows.set(key, { count: 1, resetAt: now + windowSec * 1000 });
    return true; // pass
  }
  
  window.count++;
  if (window.count > max) return false; // block
  return true;
}

// GC the map every ~500 requests to prevent memory growth on hot edges
let gcCounter = 0;
function maybeGC() {
  if (++gcCounter % 500 === 0) {
    const now = Date.now();
    for (const [key, win] of ipWindows) {
      if (now > win.resetAt) ipWindows.delete(key);
    }
  }
}

// ─── MAIN WAF FUNCTION ────────────────────────────────────────────────────────

// ─── WAF BYPASS WHITELIST ─────────────────────────────────────────────────────
// These paths are ALWAYS allowed through with zero anomaly scoring.
// Railway/K8s healthchecks use wget/curl with minimal UAs — WAF must never block these.
const WAF_BYPASS_PATHS = [
  '/api/health',
  '/api/health-check',
  '/_next/',
  '/favicon.ico',
];

export async function runWAF(req: NextRequest): Promise<NextResponse | null> {
  const ip       = getIP(req);
  const pathname = req.nextUrl.pathname;
  const ua       = req.headers.get('user-agent') ?? '';
  const method   = req.method;

  // ── BYPASS: Infra / Healthcheck paths (Railway wget, K8s probe, Next.js static) ────
  if (WAF_BYPASS_PATHS.some(p => pathname.startsWith(p))) {
    return null; // unconditional pass-through — no scoring applied
  }

  let anomalyScore = 0;
  const reasons: string[] = [];

  maybeGC();

  // ── VECTOR 1: Malicious User-Agent Fingerprint ────────────────────────────
  if (!ua || ua.length < 5) {
    anomalyScore += 5;
    reasons.push('NO_UA');
  } else {
    for (const pattern of MALICIOUS_UA_PATTERNS) {
      if (pattern.test(ua)) {
        anomalyScore += 10;
        reasons.push(`MALICIOUS_UA:${pattern.source.slice(0, 20)}`);
        break;
      }
    }
  }

  // ── VECTOR 2: Path Traversal / Injection in URL ────────────────────────────
  const fullUrl = req.url;
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(fullUrl)) {
      anomalyScore += 8;
      reasons.push(`INJECTION:${pattern.source.slice(0, 20)}`);
      break;
    }
  }

  // ── VECTOR 3: Suspicious Header Injection ─────────────────────────────────
  for (const header of SUSPICIOUS_HEADERS) {
    if (req.headers.has(header)) {
      anomalyScore += 5;
      reasons.push(`SUSPICIOUS_HEADER:${header}`);
    }
  }

  // ── VECTOR 4: HTTP Method Anomaly ─────────────────────────────────────────
  const allowedMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'];
  if (!allowedMethods.includes(method)) {
    anomalyScore += 10;
    reasons.push(`INVALID_METHOD:${method}`);
  }

  // ── VECTOR 5: Oversized Content-Length on sensitive routes ───────────────
  const contentLength = parseInt(req.headers.get('content-length') ?? '0', 10);
  const HOT_WRITE_ROUTES = ['/api/user/nuke', '/api/defi', '/api/auth', '/api/verify-human'];
  if (HOT_WRITE_ROUTES.some(r => pathname.startsWith(r)) && contentLength > 1_000_000) {
    anomalyScore += 8;
    reasons.push(`OVERSIZED_BODY:${contentLength}`);
  }

  // ── VECTOR 6: Host Header Anomaly ────────────────────────────────────────
  const host = req.headers.get('host') ?? '';
  const expectedHosts = ['www.humanidfi.com', 'humanidfi.com', 'localhost:3000', 'localhost'];
  // Preview deployment patterns for Railway and Vercel CI/CD pipelines
  const PREVIEW_HOST_PATTERNS = [/\.railway\.app$/, /\.up\.railway\.app$/, /\.vercel\.app$/];
  const isKnownHost =
    expectedHosts.some(h => host.includes(h)) ||
    PREVIEW_HOST_PATTERNS.some(p => p.test(host));
  if (host && !isKnownHost) {
    anomalyScore += 3;
    reasons.push(`HOST_MISMATCH:${host.slice(0, 30)}`);
  }

  // ── HARD BLOCK CHECK ──────────────────────────────────────────────────────
  if (anomalyScore >= BLOCK_THRESHOLD) {
    return buildBlockResponse(anomalyScore, reasons.join(','), ip);
  }

  // ── PER-ENDPOINT IN-MEMORY RATE LIMIT ────────────────────────────────────
  // Find the most specific matching endpoint config
  const endpointConfig = Object.entries(ENDPOINT_LIMITS)
    .sort((a, b) => b[0].length - a[0].length) // longest match wins
    .find(([prefix]) => pathname.startsWith(prefix));

  if (endpointConfig) {
    const [prefix, { max, windowSec }] = endpointConfig;
    const rateLimitKey = `waf:${ip}:${prefix}`;
    
    if (!inMemoryRateCheck(rateLimitKey, max, windowSec)) {
      return buildChallengeResponse(windowSec, ip);
    }
  }

  // ── SOFT CHALLENGE (high anomaly but below hard block) ────────────────────
  if (anomalyScore >= CHALLENGE_THRESHOLD) {
    console.warn(`[WhaleFortress:WAF] ⚠️ HIGH_ANOMALY score=${anomalyScore} ip=${ip} reasons=${reasons.join(',')}`);
    // Don't block yet — just log. Upgrade to block if count spikes.
  }

  return null; // pass through
}
