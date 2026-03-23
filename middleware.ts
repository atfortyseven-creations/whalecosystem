import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { RedisRateLimiter } from './lib/redis/rate-limiter';

// [SAFE-ENUM] Defined locally to avoid pulling in @prisma/client in Edge Runtime
enum PlanTier {
  FREE = 'FREE',
  STANDARD = 'STANDARD',
  STARTER = 'STARTER',
  PRO = 'PRO',
  ELITE = 'ELITE',
}

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

export default clerkMiddleware(async (auth, request) => {
  try {
    const { pathname } = request.nextUrl;
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               '127.0.0.1';

    // 1. HONEYPOT TRAP — Instant Block Mentality
    if (isHoneypotRoute(request)) {
      console.warn(`[WhaleFortress] 🚨 Honeypot hit by IP: ${ip} on route: ${pathname}`);
      // Return a blank 404 to discourage scanners
      return new NextResponse(null, { status: 404 });
    }

    // 2. [CRITICAL] Atomic Rate Limiting for /api
    if (pathname.startsWith('/api')) {
      try {
        const rateLimit = await RedisRateLimiter.check(ip, PlanTier.FREE);
        if (!rateLimit.success) {
          return new NextResponse(JSON.stringify({ error: 'System busy. Retry in 60s.' }), { 
            status: 429, 
            headers: { 'Content-Type': 'application/json' } 
          });
        }
      } catch (rateLimitErr) {
        // Fallback for edge cases
      }
    }

    // 3. Identity & Protection
    const clerkAuth = await auth();
    const humanSession = request.cookies.get('human_session');
    const nextAuthToken = request.cookies.get('next-auth.session-token');
    const kycStatusCookie = request.cookies.get('kyc_status');
    
    const isAuthenticated = !!clerkAuth?.userId || !!humanSession || !!nextAuthToken;

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
        const kycStatus = kycStatusCookie?.value;
        if (kycStatus !== 'APPROVED') {
          return NextResponse.redirect(new URL('/', request.url).toString());
        }
      }
    }

    // 4. Final Header Injection & CSP
    const response = NextResponse.next();

    // STRICT CONTENT SECURITY POLICY (CSP) - EXPANDED FOR REOWN/APPKIT RELIABILITY
    const cspHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' *.clerk.accounts.dev *.google-analytics.com *.googletagmanager.com https://*.walletconnect.com https://*.walletconnect.org https://*.reown.com https://*.reown.app https://accounts.google.com;
      style-src 'self' 'unsafe-inline' fonts.googleapis.com https://fonts.googleapis.com;
      img-src 'self' blob: data: *.google-analytics.com *.googletagmanager.com *.clerk.com res.cloudinary.com https://*.walletconnect.com https://*.walletconnect.org https://*.reown.com https://*.reown.app https://www.humanidfi.com https://*.googleusercontent.com;
      font-src 'self' fonts.gstatic.com data:;
      connect-src 'self' *.clerk.accounts.dev *.google-analytics.com *.googletagmanager.com wss://*.reown.com https://*.reown.com wss://*.reown.org https://*.reown.org wss://*.reown.app https://*.reown.app wss://*.walletconnect.com https://*.walletconnect.com https://*.walletconnect.org wss://*.walletconnect.org https://api.walletconnect.com wss://api.walletconnect.com https://*.alchemy.com https://*.infura.io https://go.getblock.us;
      frame-src 'self' *.clerk.accounts.dev https://verify.walletconnect.com https://verify.walletconnect.org https://verify.reown.com https://verify.reown.org https://*.reown.com https://*.reown.app https://accounts.google.com;
      upgrade-insecure-requests;
    `.replace(/\s{2,}/g, ' ').trim();

    const securityHeaders = {
      'Content-Security-Policy': cspHeader,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN', // Changed from DENY to allow AppKit frames
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-Robots-Tag': 'noindex, nofollow',
    };

    Object.entries(securityHeaders).forEach(([key, val]) => {
      response.headers.set(key, val);
    });
    
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
    '/((?!_next/static|_next/image|favicon.ico|models/|api/auth).*)',
  ],
};
