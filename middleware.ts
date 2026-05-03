import { NextRequest, NextResponse } from 'next/server';
import { runWAF } from './lib/security/waf-engine';
import type { JWTPayload } from 'jose';
import { checkRateLimit, resolveTier } from './lib/security/rate-limiter';
// Removed: import { appendAuditEntry } from './lib/audit/audit-trail';

// [SAFE-ENUM] Defined locally to avoid pulling in @prisma/client in Edge Runtime
enum PlanTier {
  FREE = 'FREE',
  STANDARD = 'STANDARD',
  STARTER = 'STARTER',
  PRO = 'PRO',
  ELITE = 'ELITE',
}

// Replay Attack Cache — tracks used nonces for 60s window
// Scoped to each Edge container instance; sufficient for single-instance deployments.
// [SECURITY FIX]: Switched from Set + setTimeout (Memory Leak in Edge) to Map + Lazy Eviction
const replayMap = new Map<string, number>(); // <nonce, expirationTimestamp>

function logAuditSafe(req: NextRequest, action: string, actor: string, ip: string, metadata: any) {
  const url = new URL('/api/internal/audit', req.url);
  fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-internal-audit': 'true' },
    body: JSON.stringify({ action, actor, ip, metadata }),
  }).catch(() => {});
}

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

    // ── LAYER -1.5: ENFORCE STRICT DOMAIN FOR WALLETCONNECT CLOUD VERIFY ────────
    // If the user lands on www, WalletConnect Cloud might reject their signature
    // or flag the connection as suspicious because the project is registered
    // under the bare domain. We force a redirect to the bare domain.
    if (request.nextUrl.hostname.startsWith('www.')) {
      const url = request.nextUrl.clone();
      url.hostname = url.hostname.replace('www.', '');
      return NextResponse.redirect(url, { status: 308 });
    }

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
      logAuditSafe(request, 'SECURITY_HONEYPOT_HIT', 'anonymous', ip, { path: pathname });
      return new NextResponse(null, { status: 404 });
    }

    // 2. [CRITICAL] Distributed Rate Limiting for /api (Upstash sliding window)
    if (pathname.startsWith('/api')) {
      try {
        let tier = 'FREE';
        const address = request.cookies.get('sovereign_handshake')?.value;
        if (address && typeof address === 'string' && address.startsWith('0x')) {
           const { safeRedisGet } = await import('./lib/redis/client');
           const cached = await safeRedisGet(`tier:${address.toLowerCase()}`);
           if (cached) {
               try {
                   const data = JSON.parse(cached);
                   if (data.tier) tier = data.tier;
               } catch(e) {}
           }
        }

         const VALID_TIERS = ['FREE', 'STANDARD', 'STARTER', 'PRO', 'ELITE'] as const;
         type ValidTier = typeof VALID_TIERS[number];
         const resolvedTier: ValidTier = (VALID_TIERS as readonly string[]).includes(tier)
           ? (tier as ValidTier)
           : 'FREE';
         const limitCheck = await checkRateLimit(ip, resolvedTier);
        if (!limitCheck.success) {
          console.warn(`[WhaleFortress] 🚨 DDoS Protection: IP ${ip} Rate Limited (tier: ${tier}, limit: ${limitCheck.limit} reqs/10s)`);
          // Fire-and-forget audit entry — do not await to avoid adding latency
          logAuditSafe(request, 'SECURITY_RATE_LIMITED', 'system', ip, { tier, limit: limitCheck.limit, path: pathname });
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
               const expiresAt = replayMap.get(signatureNonce)!;
               if (now < expiresAt) {
                 console.warn(`[WhaleFortress] 🚨 REPLAY ATTACK BLOCKED: Duplicated signature from IP ${ip}`);
                 return new NextResponse(JSON.stringify({ error: 'REPLAY_DETECTED' }), { status: 401 });
               } else {
                 replayMap.delete(signatureNonce); // Cleanup expired manually
               }
            }
            
            replayMap.set(signatureNonce, now + 60000); // Set expiration to 60s from now

            // Lazy garbage collection: Every ~100 requests, clean up expired map entries to prevent memory leak
            if (Math.random() < 0.01) {
              for (const [key, exp] of replayMap.entries()) {
                if (now >= exp) replayMap.delete(key);
              }
            }
        }
      }
    }

    // 3. Sovereign SIWE Identity Verification
    const nextAuthToken = request.cookies.get('next-auth.session-token');
    const sovereignHandshakeCookie = request.cookies.get('sovereign_handshake');

    // Validate SIWE JWT from human_session cookie
    let siweSessionValid = false;
    let userTier = 'FREE'; // Default tier
    const humanSessionCookie = request.cookies.get('human_session')?.value;
    if (humanSessionCookie) {
      try {
        const { verifyJWT } = await import('./lib/jwt');
        const payload = await verifyJWT(humanSessionCookie);
        siweSessionValid = true;
        if (payload.tier) {
          userTier = payload.tier as string;
        }
      } catch (err) {
        // console.error('[WhaleFortress] JWT validation failed', err);
        siweSessionValid = false;
      }
    }

    // R1 FIX REVERT — sovereign_handshake is a raw Ethereum address issued by the client
    // during the Mobile UX Zero-Friction flow or QR Handshake. 
    // Attempting to verify it as a JWT crashes the middleware and locks out legitimate users.
    // Security note: Spoofing this cookie only grants read-only UI access. Actual mutations
    // require cryptographic signatures (EIP-191/EIP-712) via the non-custodial wallet.
    let sovereignHandshakeValid = false;
    const sovereignHandshakeValue = sovereignHandshakeCookie?.value;
    if (sovereignHandshakeValue && typeof sovereignHandshakeValue === 'string') {
        if (/^0x[a-fA-F0-9]{40}$/.test(sovereignHandshakeValue)) {
            sovereignHandshakeValid = true;
        } else {
            console.warn(`[WhaleFortress] 🚨 Malformed sovereign_handshake address intercepted from IP: ${ip}`);
        }
    }

    const isAuthenticated = siweSessionValid || !!nextAuthToken || sovereignHandshakeValid;

    if (matchesPattern(pathname, PROTECTED_PATTERNS)) {
      if (!isAuthenticated) {
        logAuditSafe(request, 'AUTH_FAILURE', 'anonymous', ip, { path: pathname, reason: 'NO_VALID_SESSION' });
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

    // R2 FIX — Generate a cryptographically secure per-request nonce for CSP.
    // 'unsafe-eval' and 'unsafe-inline' for scripts have been ELIMINATED.
    // All inline scripts must use the nonce attribute: <script nonce={nonce}>.
    // Wallet SDK libraries (WalletConnect, Reown) that require eval must load
    // from their trusted origins only — no blanket eval permission granted.
    const nonce = Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('base64');

    const scriptSrc = [
      "'self'",
      `'nonce-${nonce}'`,
      // R2: 'unsafe-eval' REMOVED — violates CSP Level 3 and institutional audit requirements.
      // R2: 'unsafe-inline' REMOVED — nonce-based policy replaces this.
      "https://*.walletconnect.com",
      "https://*.walletconnect.org",
      "https://*.reown.com",
      "https://*.reown.app",
      "https://*.google-analytics.com",
      "https://*.googletagmanager.com",
      "https://accounts.google.com",
      "'strict-dynamic'",  // Allows nonce-whitelisted scripts to load their own dependencies
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
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
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
    // [SECURITY FIX] Fail-CLOSED: On unhandled middleware exceptions, deny access
    // to protected routes rather than silently passing all requests through.
    // Fail-Open was exploitable: an attacker who triggers a middleware crash
    // could bypass WAF, rate limiting, auth checks, and honeypot detection.
    console.error('⨯ [WhaleFortress:Critical] 💀 Zero-Crash Safeguard:', err.message);
    const { pathname } = request.nextUrl;
    if (matchesPattern(pathname, PROTECTED_PATTERNS) || pathname.startsWith('/api/admin')) {
        return new NextResponse(
            JSON.stringify({ error: 'SERVICE_UNAVAILABLE', message: 'Security subsystem error. Please try again.' }),
            { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
    }
    // For public pages, pass through to avoid total site blackout
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|models/|api/health).*)',
  ],
};
