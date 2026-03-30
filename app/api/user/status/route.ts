import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SignJWT } from 'jose';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const address = searchParams.get('address');

        if (!address) {
            return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { walletAddress: address.toLowerCase() },
            select: {
                tier: true,
                worldIdNullifierHash: true
            }
        });

        // Verification Logic
        const isVerified = user?.tier === 'HUMAN' || user?.tier === 'SOVEREIGN' || !!user?.worldIdNullifierHash;

        // 2. Prepare Response
        const response = NextResponse.json({
            verified: isVerified,
            tier: user?.tier || 'GHOST',
            nullifierHash: user?.worldIdNullifierHash || null
        });

        // 3. Auto-Hydrate Security Cookies for Middleware if record exists
        if (isVerified) {
            const cookieOptions = {
                path: '/',
                maxAge: 60 * 60 * 24 * 7,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax' as const
            };
            
            const JWT_SECRET = new TextEncoder().encode(process.env.KYC_SECRET || 'WhaleAlert_KYC_MasterKey_2026_Secure');
            const token = await new SignJWT({ address: address.toLowerCase(), status: 'APPROVED' })
                .setProtectedHeader({ alg: 'HS256' })
                .setIssuedAt()
                .setExpirationTime('7d')
                .sign(JWT_SECRET);

            response.cookies.set('kyc_token', token, cookieOptions); // Cryptographically secure token
            response.cookies.set('kyc_status', 'APPROVED', { ...cookieOptions, httpOnly: false }); // Only for UI checks
            response.cookies.set('human_session', 'true', cookieOptions);
        }

        return response;

    } catch (error: any) {
        console.warn("[UserStatusAPI] DB Connection failed, returning defaults.", error.message);
        return NextResponse.json({
            verified: false,
            tier: 'GHOST',
            nullifierHash: null,
            warning: 'Database offline. Using temporary profile.'
        });
    }
}

