import { NextRequest, NextResponse } from 'next/server';
import { runWAF } from './lib/security/waf-engine';

// [SAFE-ENUM] Defined locally to avoid pulling in @prisma/client in Edge Runtime
enum PlanTier {
  FREE = 'FREE',
  STANDARD = 'STANDARD',
  STARTER = 'STARTER',
  PRO = 'PRO',
  ELITE = 'ELITE',
}

// Memory-based Edge Rate Limiter & Replay Attack Cache
// At 400M users, this prevents individual container CPU asphyxiation
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();
const replayMap = new Set<string>(); // Tracks used nonces/signatures for 60s

function checkEdgeRateLimit(ip: string, tier: PlanTier): { success: boolean, maxReqs: number } {
  // Free accounts: 100 requests per 10s. Pro/Elite: 300 requests per 10s.
  const maxReqs = tier === PlanTier.PRO || tier === PlanTier.ELITE ? 300 : 100;
  const now = Date.now();
  const windowMs = 10000; // 10 seconds

  // OOM Protection for massive 100M+ scale botnets
  if (rateLimitMap.size > 50000) {
    rateLimitMap.clear();
  }

  const record = rateLimitMap.get(ip);
  if (!record || now > record.expiresAt) {
    rateLimitMap.set(ip, { count: 1, expiresAt: now + windowMs });
    return { success: true, maxReqs };
  }

  if (record.count >= maxReqs) {
    return { success: false, maxReqs };
  }

  record.count++;
  return { success: true, maxReqs };
}

// Routine to prevent memory leakage in the map
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.expiresAt) {
      rateLimitMap.delete(ip);
    }
  }
}, 60000);

// ─────────────────────────────────────────────────────────────────────────────
// Route Matchers (Inline — replaces clerkMiddleware createRouteMatcher)
// ─────────────────────────────────────────────────────────────────────────────

function matchesPattern(pathname: string, patterns: string[]): boolean {
  return patterns.some((p) => {
    const regex = new RegExp('^' + p.replace(/\(\.\*\)/g, '.*').replace(/\*/g, '[^/]+'));
    return regex.test(pathname);
  });
}

const PROTECTED_PATTERNS = [
  '/trade(.*)',
  '/settings(.*)',
  '/favorites(.*)',
  '/desarrollador(.*)',
  '/api/user/wallet(.*)',
  '/api/wallet/history(.*)',
];

const HONEYPOT_PATTERNS = [
  // CMS/framework scanner probes
  '/wp-admin(.*)',
  '/wp-login(.*)',
  '/phpMyAdmin(.*)',
  '/phpmyadmin(.*)',
  '/.env(.*)',
  '/config(.*)',
  '/admin(.*)',
  '/setup(.*)',
  // API scanner probes — paths legitimate traffic NEVER hits
  '/api/admin(.*)',
  '/api/debug(.*)',
  '/api/env(.*)',
  '/api/keys(.*)',
  '/api/secret(.*)',
  '/api/internal(.*)',
  '/api/private(.*)',
  '/api/management(.*)',
  '/api/v1/admin(.*)',
  '/api/swagger(.*)',
  // GraphQL introspection abuse
  '/api/graphql/introspection(.*)',
  // Common path traversal probes
  '/etc/passwd(.*)',
  '/.git(.*)',
  '/.svn(.*)',
];

const KYC_REQUIRED_PATTERNS = ['/trade(.*)'];
const GEO_RESTRICTED_PATTERNS = ['/api/polymarket(.*)'];
const RESTRICTED_COUNTRIES = ['US', 'CU', 'IR', 'KP', 'SY'];

// SECURITY MIDDLEWARE — "THE IRON GATE v6 - WHALE FORTRESS SOVEREIGN"
// Absolute protection. Zero Clerk dependency. SIWE-native authentication.

export default async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    // ── LAYER -1: ABSOLUTE BYPASS — Healthcheck & Infra paths ───────────────────
    if (pathname === '/api/health' || pathname === '/api/health-check') {
      return NextResponse.next();
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               '127.0.0.1';
    const country = request.headers.get('x-vercel-ip-country') ||
                    request.headers.get('cf-ipcountry') ||
                    'UNKNOWN';

    // ── LAYER 0: OWASP WAF ENGINE (Before EVERYTHING) ──────────────────────
    const wafBlock = await runWAF(request);
    if (wafBlock) return wafBlock;

    // [VIRTUAL ROUTE] Canonical Sync Bridge
    if (pathname === '/sync') {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.rewrite(url);
    }

    // 0. GEOFENCING — Regulatory Firewall (CFTC/OFAC)
    if (matchesPattern(pathname, GEO_RESTRICTED_PATTERNS)) {
      if (RESTRICTED_COUNTRIES.includes(country)) {
        console.warn(`[WhaleFortress] 🚨 Geoblocked Restricted Access from Country: ${country}, IP: ${ip}`);
        return new NextResponse(
          JSON.stringify({
            error: 'RESTRICTED_JURISDICTION',
            message: `Regulatory constraint: Market data and trading features are blocked for your jurisdiction (${country}).`
          }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // 1. HONEYPOT TRAP — Instant Block
    if (matchesPattern(pathname, HONEYPOT_PATTERNS)) {
      console.warn(`[WhaleFortress] 🚨 Honeypot hit by IP: ${ip} on route: ${pathname}`);
      return new NextResponse(null, { status: 404 });
    }

    // 2. [CRITICAL] Atomic Rate Limiting for /api
    if (pathname.startsWith('/api')) {
      try {
        const limitCheck = checkEdgeRateLimit(ip, PlanTier.FREE);
        if (!limitCheck.success) {
          console.warn(`[WhaleFortress] 🚨 DDoS Protection: IP ${ip} Rate Limited (${limitCheck.maxReqs} reqs/10s)`);
          return new NextResponse(
            JSON.stringify({ error: 'SYSTEM_BUSY', message: 'Rate limit exceeded. Retry in 10s.' }),
            { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': '10' } }
          );
        }
      } catch (rateLimitErr) {
        console.error('[WhaleFortress:CRITICAL] Rate limiter evaluation block failed.', rateLimitErr);
      }

      // 2.5 [CRITICAL] Anti-Replay Attack Engine (POST State Mutations)
      if (request.method === 'POST') {
        const signatureNonce = request.headers.get('x-sovereign-nonce');
        const txTimestamp = request.headers.get('x-sovereign-timestamp');
        
        // Only enforce on critical mutation endpoints if they opt-in via headers, 
        // or forcefully block if headers exist but are duplicated/old.
        if (signatureNonce && txTimestamp) {
            const txTime = parseInt(txTimestamp, 10);
            const now = Date.now();
            
            // Reject if older than 60 seconds (Replay window expired)
            if (now - txTime > 60000) {
               console.warn(`[WhaleFortress] 🚨 REPLAY ATTACK BLOCKED: Expired payload from IP ${ip}`);
               return new NextResponse(JSON.stringify({ error: 'PAYLOAD_EXPIRED' }), { status: 401 });
            }
            
            // Reject if nonce was already used in this rolling window
            if (replayMap.has(signatureNonce)) {
               console.warn(`[WhaleFortress] 🚨 REPLAY ATTACK BLOCKED: Duplicated signature from IP ${ip}`);
               return new NextResponse(JSON.stringify({ error: 'REPLAY_DETECTED' }), { status: 401 });
            }
            
            replayMap.add(signatureNonce);
            setTimeout(() => replayMap.delete(signatureNonce), 60000); // Clear after validity window
        }
      }
    }

    // 3. Sovereign SIWE Identity Verification
    const nextAuthToken = request.cookies.get('next-auth.session-token');
    const sovereignHandshake = request.cookies.get('sovereign_handshake');

    // Validate SIWE JWT from human_session cookie
    let siweSessionValid = false;
    const humanSessionCookie = request.cookies.get('human_session')?.value;
    if (humanSessionCookie) {
      try {
        const { jwtVerify } = await import('jose');
        const rawSecret = process.env.JWT_SECRET;
        if (!rawSecret) {
          console.error('[WhaleFortress:CRITICAL] JWT_SECRET not set. All session cookies treated as invalid.');
          siweSessionValid = false;
        } else {
          const JWT_KEY = new TextEncoder().encode(rawSecret);
          await jwtVerify(humanSessionCookie, JWT_KEY);
          siweSessionValid = true;
        }
      } catch {
        siweSessionValid = false;
      }
    }

    const isAuthenticated = siweSessionValid || !!nextAuthToken || !!sovereignHandshake;

    if (matchesPattern(pathname, PROTECTED_PATTERNS)) {
      if (!isAuthenticated) {
        if (
          pathname.startsWith('/desarrollador') ||
          pathname.startsWith('/trade') ||
          pathname.startsWith('/settings')
        ) {
          console.warn(`[WhaleFortress] 🛡️ Masking protected route: ${pathname} for IP: ${ip}`);
          return new NextResponse(null, { status: 404 });
        }
        return NextResponse.redirect(new URL('/', request.url).toString());
      }

      if (matchesPattern(pathname, KYC_REQUIRED_PATTERNS)) {
        const kycToken = request.cookies.get('kyc_token')?.value;
        let isApproved = false;

        const KYC_SECRET = process.env.KYC_SECRET;
        if (!KYC_SECRET) {
          console.error('[WhaleFortress:CRITICAL] KYC_SECRET environment variable is not configured. Denying all access to protected routes.');
          return NextResponse.redirect(new URL('/', request.url).toString());
        }

        if (kycToken) {
          try {
            const JWT_SECRET = new TextEncoder().encode(KYC_SECRET);
            const { jwtVerify } = await import('jose');
            const { payload } = await jwtVerify(kycToken, JWT_SECRET);
            if (payload.status === 'APPROVED') isApproved = true;
          } catch(e) {
            console.warn(`[WhaleFortress] 🚨 Spoofed/Invalid KYC token intercepted from IP: ${ip}`);
          }
        }

        if (!isApproved) {
          console.warn(`[WhaleFortress] 🛡️ Blocked unauthorized access to KYC route: ${pathname}`);
          return NextResponse.redirect(new URL('/', request.url).toString());
        }
      }
    }

    // 4. Final Header Injection & CSP
    const response = NextResponse.next();

    const nonce = Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('base64');

    const scriptSrc = [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      "https://*.walletconnect.com",
      "https://*.walletconnect.org",
      "https://*.reown.com",
      "https://*.reown.app",
      "https://*.google-analytics.com",
      "https://*.googletagmanager.com",
      "https://accounts.google.com"
    ].join(' ');

    const cspHeader = [
      "default-src 'self'",
      `script-src ${scriptSrc}`,
      "worker-src 'self' blob:",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' blob: data: https://*.google-analytics.com https://*.googletagmanager.com https://res.cloudinary.com https://*.walletconnect.com https://*.walletconnect.org https://*.reown.com https://*.reown.app https://www.humanidfi.com https://*.googleusercontent.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "connect-src 'self' https://api.web3modal.org https://pulse.walletconnect.org https://*.google-analytics.com https://*.googletagmanager.com wss://*.reown.com https://*.reown.com wss://*.reown.org https://*.reown.org wss://*.reown.app https://*.reown.app wss://*.walletconnect.com https://*.walletconnect.com https://*.walletconnect.org wss://*.walletconnect.org https://api.walletconnect.com wss://api.walletconnect.com https://*.alchemy.com https://*.infura.io https://go.getblock.us https://go.getblock.io wss://go.getblock.io https://cca-lite.coinbase.com https://*.coinbase.com wss://stream.binance.com:9443 https://stream.binance.com https://cdn.jsdelivr.net https://raw.githubusercontent.com https://*.githubusercontent.com",
      "frame-src 'self' https://verify.walletconnect.com https://verify.walletconnect.org https://verify.reown.com https://verify.reown.org https://*.reown.com https://*.reown.app https://accounts.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join('; ');

    const securityHeaders: Record<string, string> = {
      'Content-Security-Policy': cspHeader,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(self), microphone=(), geolocation=(), payment=(self)',
      'Expect-CT': 'enforce, max-age=86400',
      'X-Permitted-Cross-Domain-Policies': 'none',
    };

    const isInternalRoute = matchesPattern(pathname, PROTECTED_PATTERNS) || pathname.startsWith('/api');
    if (isInternalRoute) {
      securityHeaders['X-Robots-Tag'] = 'noindex, nofollow';
    }

    Object.entries(securityHeaders).forEach(([key, val]) => {
      response.headers.set(key, val);
    });

    response.headers.set('X-Nonce', nonce);

    if (process.env.NODE_ENV === 'production') {
      response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    }

    return response;

  } catch (err: any) {
    console.error('⨯ [WhaleFortress:Critical] 💀 Zero-Crash Safeguard:', err.message);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|models/|api/health).*)',
  ],
};
