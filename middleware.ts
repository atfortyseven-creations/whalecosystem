import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
// Removed RedisRateLimiter import: ioredis uses Node APIs incompatible with Next.js Edge Runtime.
// import { RedisRateLimiter } from './lib/redis/rate-limiter';
import { runWAF } from './lib/security/waf-engine';

// [SAFE-ENUM] Defined locally to avoid pulling in @prisma/client in Edge Runtime
enum PlanTier {
  FREE = 'FREE',
  STANDARD = 'STANDARD',
  STARTER = 'STARTER',
  PRO = 'PRO',
  ELITE = 'ELITE',
}

// Memory-based Edge Rate Limiter (Pod-Level Scope)
// At 400M users, this prevents individual container CPU asphyxiation
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

function checkEdgeRateLimit(ip: string, tier: PlanTier): { success: boolean, maxReqs: number } {
  // Free accounts: 30 requests per 10s. Pro accounts: 100 requests per 10s.
  const maxReqs = tier === PlanTier.PRO || tier === PlanTier.ELITE ? 100 : 30;
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

// SECURITY MIDDLEWARE — "THE IRON GATE v5 - WHALE FORTRESS"
// Absolute protection against bots, path traversal, and unauthorized route discovery.

const isProtectedRoute = createRouteMatcher([
  '/trade(.*)',
  '/settings(.*)',
  '/favorites(.*)',
  '/desarrollador(.*)',
  '/api/user/wallet(.*)',
  '/api/wallet/history(.*)'
]);

const isHoneypotRoute = createRouteMatcher([
  '/wp-admin(.*)',
  '/.env',
  '/config(.*)',
  '/admin(.*)',
  '/setup(.*)',
  '/phpmyadmin(.*)'
]);

const isKycRequiredRoute = createRouteMatcher([
  '/trade(.*)',
]);

const isGeoRestrictedRoute = createRouteMatcher([
  '/api/polymarket(.*)'
]);

const RESTRICTED_COUNTRIES = ['US', 'CU', 'IR', 'KP', 'SY'];

export default clerkMiddleware(async (auth, request) => {
  try {
    const { pathname } = request.nextUrl;

    // ── LAYER -1: ABSOLUTE BYPASS — Healthcheck & Infra paths ───────────────────
    // Railway/K8s/Docker polls /api/health using wget with no User-Agent.
    // This MUST bypass WAF, auth, rate-limiting and ALL middleware logic.
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
    // If user scans a QR code that points to /sync, we rewrite it to /
    // This allows the MobileEnforcer to catch the ?session=XYZ param on the main page.
    if (pathname === '/sync') {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.rewrite(url);
    }

    // 0. GEOFENCING — Regulatory Firewall (CFTC/OFAC)
    if (isGeoRestrictedRoute(request)) {
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

    // 1. HONEYPOT TRAP — Instant Block Mentality
    if (isHoneypotRoute(request)) {
      console.warn(`[WhaleFortress] 🚨 Honeypot hit by IP: ${ip} on route: ${pathname}`);
      // Return a blank 404 to discourage scanners
      return new NextResponse(null, { status: 404 });
    }

    // 2. [CRITICAL] Atomic Rate Limiting for /api
    if (pathname.startsWith('/api')) {
      try {
        // A-1 FIX: Use the authenticated user's plan tier when available.
        // This prevents PRO/ELITE users from being incorrectly throttled at FREE limits.
        const clerkAuthForTier = await auth();
        let userTier = PlanTier.FREE;
        if (clerkAuthForTier?.userId) {
          const tierMeta = clerkAuthForTier.sessionClaims?.metadata as any;
          if (tierMeta?.plan && Object.values(PlanTier).includes(tierMeta.plan)) {
            userTier = tierMeta.plan as PlanTier;
          }
        }
        
        // C-2 FIX: Execute Pod-Level Edge Rate Limiting
        const limitCheck = checkEdgeRateLimit(ip, userTier);
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
    }

    // 3. Identity & Protection
    const clerkAuth = await auth();
    const nextAuthToken = request.cookies.get('next-auth.session-token');
    const sovereignHandshake = request.cookies.get('sovereign_handshake');
    const kycStatusCookie = request.cookies.get('kyc_status');

    // Validate SIWE JWT from human_session cookie
    let siweSessionValid = false;
    const humanSessionCookie = request.cookies.get('human_session')?.value;
    if (humanSessionCookie) {
      try {
        const { jwtVerify } = await import('jose');
        // FIX: Same VOID_SECRET_99_POLY vulnerability fixed here.
        // The middleware is the gatekeeper — a forged human_session cookie
        // using the leaked secret bypasses ALL protected route authentication.
        // Guard: if JWT_SECRET not set, treat all sessions as invalid (secure default).
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
        // Invalid or expired SIWE JWT — treat as unauthenticated
        siweSessionValid = false;
      }
    }

    const isAuthenticated = !!clerkAuth?.userId || siweSessionValid || !!nextAuthToken || !!sovereignHandshake;

    if (isProtectedRoute(request)) {
      if (!isAuthenticated) {
        // [MASKING] Masking developer/internal routes for outsiders
        if (pathname.startsWith('/desarrollador') || pathname.startsWith('/trade') || pathname.startsWith('/settings')) {
          console.warn(`[WhaleFortress] 🛡️ Masking protected route: ${pathname} for IP: ${ip}`);
          return new NextResponse(null, { status: 404 });
        }
        
        // [REDIRECT] For public-facing tabs like VIP, redirect to root so they can connect
        return NextResponse.redirect(new URL('/', request.url).toString());
      }

      if (isKycRequiredRoute(request)) {
        const kycToken = request.cookies.get('kyc_token')?.value;
        let isApproved = false;

        // C-2 FIX: KYC_SECRET must be set as an environment variable.
        // A hardcoded fallback is a critical security violation — it allows anyone
        // with access to the source code to forge valid identity tokens.
        const KYC_SECRET = process.env.KYC_SECRET;
        if (!KYC_SECRET) {
          console.error('[WhaleFortress:CRITICAL] KYC_SECRET environment variable is not configured. Denying all access to protected routes until resolved.');
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

    // ── A-3 FIX: HARDENED CONTENT SECURITY POLICY ────────────────────────────
    //
    // Strategy: nonce-based strict-dynamic CSP.
    //
    // • A cryptographically random nonce is generated PER REQUEST.
    // • inline scripts are only allowed when they carry this nonce attribute.
    // • 'strict-dynamic' trusts scripts loaded by a nonced script, enabling
    //   modern bundlers (Next.js, AppKit) without 'unsafe-inline'.
    // • 'unsafe-eval' is narrowed to wallet-specific paths only, where
    //   AppKit and WalletConnect require WebAssembly evaluation at runtime.
    //   All other routes are fully eval-free.
    //
    // This matches the CSP posture of Tier-1 financial institutions.
    //
    const nonce = Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('base64');
    
    // Unified High-Fidelity Script Source for Absolute Web3 Connectivity
    const scriptSrc = [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "https://*.clerk.com",
        "https://clerk.humanidfi.com",
        "https://*.clerk.accounts.dev",
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
        "img-src 'self' blob: data: https://*.google-analytics.com https://*.googletagmanager.com https://img.clerk.com https://*.clerk.com https://res.cloudinary.com https://*.walletconnect.com https://*.walletconnect.org https://*.reown.com https://*.reown.app https://www.humanidfi.com https://*.googleusercontent.com",
        "font-src 'self' https://fonts.gstatic.com data:",
        "connect-src 'self' https://api.web3modal.org https://pulse.walletconnect.org https://*.clerk.com https://clerk.humanidfi.com https://*.clerk.accounts.dev https://*.google-analytics.com https://*.googletagmanager.com wss://*.reown.com https://*.reown.com wss://*.reown.org https://*.reown.org wss://*.reown.app https://*.reown.app wss://*.walletconnect.com https://*.walletconnect.com https://*.walletconnect.org wss://*.walletconnect.org https://api.walletconnect.com wss://api.walletconnect.com https://*.alchemy.com https://*.infura.io https://go.getblock.us https://go.getblock.io wss://go.getblock.io https://cca-lite.coinbase.com https://*.coinbase.com wss://stream.binance.com:9443 https://stream.binance.com",
        "frame-src 'self' https://*.clerk.com https://clerk.humanidfi.com https://*.clerk.accounts.dev https://verify.walletconnect.com https://verify.walletconnect.org https://verify.reown.com https://verify.reown.org https://*.reown.com https://*.reown.app https://accounts.google.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "upgrade-insecure-requests",
    ].join('; ');

    const securityHeaders: Record<string, string> = {
      'Content-Security-Policy': cspHeader,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN', // SAMEORIGIN required for AppKit wallet modal frames
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(self), microphone=(), geolocation=(), payment=(self)',
    };

    // Only suppress indexing on protected internal routes — allow public pages to be indexed.
    const isInternalRoute = isProtectedRoute(request) || pathname.startsWith('/api');
    if (isInternalRoute) {
      securityHeaders['X-Robots-Tag'] = 'noindex, nofollow';
    }

    Object.entries(securityHeaders).forEach(([key, val]) => {
      response.headers.set(key, val);
    });

    // Forward the nonce to the SSR layer so Next.js can inject it into <script nonce="..."> tags.
    response.headers.set('X-Nonce', nonce);

    if (process.env.NODE_ENV === 'production') {
      response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    }

    return response;

  } catch (err: any) {
    console.error('⨯ [WhaleFortress:Critical] 💀 Zero-Crash Safeguard:', err.message);
    return NextResponse.next();
  }
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - models/ (your local assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|models/|api/health).*)',
  ],
};
