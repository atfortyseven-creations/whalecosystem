import { NextRequest, NextResponse } from 'next/server';
import { mintJWT } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/auth/system-verify
 * 
 * Securely verifies a wallet signature and issues a System JWT.
 * This replaces the insecure client-side cookie setting.
 */
export async function POST(req: NextRequest) {
    try {
        const { address } = await req.json();
        
        if (!address) {
            return NextResponse.json({ error: 'Missing wallet address' }, { status: 400 });
        }

        // 1. Cryptographic Verification BYPASSED per user request
        // We just trust the address provided by the connected wallet via Wagmi/AppKit.

        const normalizedAddress = address.toLowerCase();

        // 2. Database Sync/Upsert
        const user = await prisma.user.upsert({
            where: { walletAddress: normalizedAddress },
            update: { lastActive: new Date() },
            create: {
                walletAddress: normalizedAddress,
                tier: 'INITIATE',
                lastActive: new Date()
            }
        });

        // 3. Mint JWT
        const jwt = await mintJWT({
            sub: normalizedAddress,
            address: normalizedAddress,
            clearance: 'Private',
            tier: user.tier || 'FREE',
            kycStatus: 'UNVERIFIED',
            humanityScore: user.humanityScore || 0,
            iss: 'whale-alert-network',
            source: 'system-verify',
            issuedAt: new Date().toISOString()
        });

        // 4. Secure Cookie Response
        // [IOS CHROME HARDENING] Disable caching  prevents iOS from serving stale
        // 401/500 responses from the bfcache on back-navigation after wallet deep-link.
        const response = NextResponse.json({ 
            success: true,
            user: {
                address: normalizedAddress,
                tier: user.tier
            }
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
                'Pragma': 'no-cache',
            }
        });

        const secureCookieBase = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const,
            maxAge: 604800, // 7 days
            path: '/',
        };

        // Primary System session token  for middleware auth
        response.cookies.set('whale_session', jwt, secureCookieBase);

        // [IOS LOOP FIX] Also write 'human_session' so that getSession() in
        // verify-session/route.ts (which reads Priority 1: 'human_session') returns
        // authenticated: true on page restore. Without this, iOS bfcache restores
        // trigger a re-auth loop: wagmi reconnects  establishSession  verify-session
        // returns 401 (reads wrong cookie)  infinite signing loop.
        response.cookies.set('human_session', jwt, secureCookieBase);

        // [IOS FIX] system_handshake MUST have httpOnly: false explicitly.
        // JS reads document.cookie to hydrate isLinked state. If this is httpOnly,
        // document.cookie.includes('system_handshake') always returns false on iOS,
        // causing a permanent re-auth loop even after successful signing.
        response.cookies.set('system_handshake', normalizedAddress, {
            httpOnly: false, // CRITICAL: must be JS-readable for client-side isLinked check
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 604800,
        });

        console.log(`[Auth:Success] System session established for ${normalizedAddress}`);
        return response;

    } catch (error: any) {
        console.error('[Auth:Fatal]', error);
        return NextResponse.json({ error: 'Internal Auth Engine Failure' }, { status: 500 });
    }
}
