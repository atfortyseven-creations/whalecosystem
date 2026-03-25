import { NextResponse } from 'next/server';
import { safeRedisGet, safeRedisSet } from '@/lib/redis/client';

export async function POST(req: Request) {
    try {
        const { token, address, signature } = await req.json();
        
        if (!token || !address || !signature) {
            return new NextResponse('Missing parameters (Handshake Protocol Failure)', { status: 400 });
        }

        // [SECURITY] Verify Signature of the token (Session ID)
        // This ensures the mobile user intentionally authorized THIS specific PC session.
        try {
            const { verifyMessage } = await import('viem');
            const isValid = await verifyMessage({
                address: address as `0x${string}`,
                message: `SOVEREIGN_HANDSHAKE:${token}`,
                signature: signature as `0x${string}`,
            });

            if (!isValid) {
                return new NextResponse('Verification Failed: Invalid Sovereign Handshake', { status: 401 });
            }
        } catch (verifError) {
            console.error('[QR_SYNC_VERIF_ERROR]', verifError);
            return new NextResponse('Verification Engine Error', { status: 500 });
        }

        const status = await safeRedisGet(`qr:${token}`);
        if (!status) {
            return new NextResponse('Sync session expired or invalid', { status: 404 });
        }

        if (status !== 'PENDING') {
            return new NextResponse('Session already consumed or processed', { status: 400 });
        }

        // Store the verified mobile address into the session UUID for the desktop to consume
        await safeRedisSet(`qr:${token}`, JSON.stringify({ address, signature, syncedAt: Date.now() }), 'EX', 300);

        return new NextResponse('Handshake Verified', { status: 200 });
    } catch (e: any) {
        console.error('[QR_SYNC_FATAL]', e);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
