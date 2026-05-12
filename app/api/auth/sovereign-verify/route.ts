import { NextRequest, NextResponse } from 'next/server';
import { verifyMessage } from 'viem';
import { mintJWT } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/auth/sovereign-verify
 * 
 * Securely verifies a wallet signature and issues a Sovereign JWT.
 * This replaces the insecure client-side cookie setting.
 */
export async function POST(req: NextRequest) {
    try {
        const { address, signature, message } = await req.json();

        if (!address || !signature || !message) {
            return NextResponse.json({ error: 'Missing verification data' }, { status: 400 });
        }

        // 1. Cryptographic Verification
        const isValid = await verifyMessage({
            address: address as `0x${string}`,
            message,
            signature: signature as `0x${string}`
        });

        if (!isValid) {
            console.warn(`[Auth:Reject] Invalid signature for ${address}`);
            return NextResponse.json({ error: 'Invalid cryptographic proof' }, { status: 401 });
        }

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
            clearance: 'SOVEREIGN',
            tier: user.tier || 'FREE',
            kycStatus: 'UNVERIFIED',
            humanityScore: user.humanityScore || 0,
            iss: 'whale-alert-network',
            source: 'sovereign-verify',
            issuedAt: new Date().toISOString()
        });

        // 4. Secure Cookie Response
        const response = NextResponse.json({ 
            success: true,
            user: {
                address: normalizedAddress,
                tier: user.tier
            }
        });

        // Secure httpOnly JWT cookie
        response.cookies.set('human_session', jwt, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 604800, // 7 days
            path: '/',
        });

        // Public convenience cookie (for UI routing)
        response.cookies.set('sovereign_handshake', normalizedAddress, {
            path: '/',
            maxAge: 604800,
            sameSite: 'lax',
        });

        console.log(`[Auth:Success] Sovereign session established for ${normalizedAddress}`);
        return response;

    } catch (error: any) {
        console.error('[Auth:Fatal]', error);
        return NextResponse.json({ error: 'Internal Auth Engine Failure' }, { status: 500 });
    }
}
