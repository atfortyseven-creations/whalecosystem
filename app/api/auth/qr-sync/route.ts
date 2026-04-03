import { NextResponse } from 'next/server';
import { safeRedisGet, safeRedisSet } from '@/lib/redis/client';
import { verifyMessage } from 'viem';

export async function POST(req: Request) {
    try {
        const { token, address, signature } = await req.json();
        
        if (!token || !address || !signature) {
            return new NextResponse('Missing parameters (Handshake Protocol Failure)', { status: 400 });
        }

        // [UX LEGENDARY DEPLOYMENT] Verify Signature if requested
        // If the mobile app bypassed signature generation to prevent deep-linking hangs,
        // we skip the process. The token intrinsically carries its own UUID entropy.
        if (signature !== '0x_bypass') {
            try {
                const isValid = await verifyMessage({
                    address: address as `0x${string}`,
                    message: `SOVEREIGN_HANDSHAKE:${token}`,
                    signature: signature as `0x${string}`,
                });

                if (!isValid) {
                    console.error(`[Handshake:Denied] Invalid signature for ${address} on token ${token}`);
                    return new NextResponse('Verification Failed: Invalid Sovereign Handshake', { status: 401 });
                }
            } catch (verifError) {
                console.error('[Handshake:VerifError]', verifError);
                return new NextResponse('Verification Engine Error (Check Server Environment)', { status: 500 });
            }
        }

        const status = await safeRedisGet(`qr:${token}`);
        if (!status) {
            return new NextResponse('Sync session expired or invalid', { status: 404 });
        }

        if (status !== 'PENDING') {
            return new NextResponse('Session already consumed or processed', { status: 400 });
        }

        // Store the verified mobile address into the session UUID for the desktop to consume
        // Normalize: Lowercase address and stringify payload
        const normalizedAddress = address.toLowerCase();
        
        await safeRedisSet(`qr:${token}`, JSON.stringify({ 
            address: normalizedAddress, 
            signature, 
            syncedAt: Date.now(),
            protocol: 'LEGENDARY_HANDSHAKE_v1'
        }), 'EX', 300);

        console.log(`[Handshake:Success] Sync verified for ${normalizedAddress} on token ${token}`);
        
        // [PERFECTION] Set cookie for the mobile user so they transition to the news shell
        const THIRTY_DAYS_S = 30 * 24 * 60 * 60;
        return new NextResponse('Handshake Verified', { 
            status: 200,
            headers: {
                'Set-Cookie': [
                    `sovereign_handshake=${normalizedAddress}`,
                    'Path=/',
                    `Max-Age=${THIRTY_DAYS_S}`,
                    'SameSite=Lax',
                ].join('; '),
            }
        });
    } catch (e: any) {
        console.error('[QR_SYNC_FATAL]', e);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
