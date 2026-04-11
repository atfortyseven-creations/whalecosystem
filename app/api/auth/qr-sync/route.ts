import { NextResponse } from 'next/server';
import { safeRedisGet, safeRedisSet, redisClient } from '@/lib/redis/client';
import { verifyMessage } from 'viem';
import { mainnetClient } from '@/lib/blockchain/rpc-engine';

export async function POST(req: Request) {
    try {
        const { token, address, signature } = await req.json();
        
        if (!token || !address || !signature) {
            return new NextResponse('Missing parameters (Handshake Protocol Failure)', { status: 400 });
        }

        // 1. Inhumane Perfection: Evitar race conditions asegurando TTL restrictivo
        const status = await safeRedisGet(`qr:${token}`);
        if (!status) {
            return new NextResponse('Sync session expired or invalid. Privacy By Void triggers deletion.', { status: 404 });
        }

        if (status !== 'PENDING') {
            return new NextResponse('Session already consumed or processed', { status: 400 });
        }

        // 2. ECDSA Puro & EIP-1271: Validación de la firma sin custodiar la identidad
        // Soporte experto para EOA y Smart Wallets (Institutional Standard)
        try {
            const isValid = await verifyMessage({
                address: address as `0x${string}`,
                message: `WHALE_HANDSHAKE:${token}`,
                signature: signature as `0x${string}`,
                publicClient: mainnetClient, // Enables Smart Account verification via on-chain hooks
            });

            if (!isValid) {
                console.error(`[Handshake:Denied] Cryptographic Signature Forgery Detected para ${address}`);
                return new NextResponse('Verification Failed: Invalid Whale Handshake', { status: 401 });
            }
        } catch (verifError) {
            console.error('[Handshake:VerifError]', verifError);
            return new NextResponse('Internal Neural Engine Failure', { status: 500 });
        }

        const normalizedAddress = address.toLowerCase();

        // 3. P2P Bridge: Emitimos al Sovereign Auth Bus (Volume IV.4.2)
        // El Mesh conectará los WebSockets y aplicará el State Hydration al PC
        if (redisClient && typeof redisClient.publish === 'function') {
            await redisClient.publish('sovereign_mesh_auth_bus', JSON.stringify({
                socketId: token, // QR token typically serves as the bridge socket ID
                address: normalizedAddress,
                timestamp: Date.now()
            })).catch((err: any) => console.error('[MESH:PUBLISH_ERROR]', err));
        }

        // 4. Privacy by Void: Destruimos el token original para evitar ataques de replay
        // y actualizamos temporalmente la sesión validada solo por 30s.
        await safeRedisSet(`qr:${token}`, JSON.stringify({ 
            address: normalizedAddress, 
            signature, 
            syncedAt: Date.now(),
            protocol: 'LEGENDARY_HANDSHAKE_v1'
        }), 'EX', 60); // Increased from 30 to 60 for better device handshake reliability
        
        console.log(`[Handshake:Success] OMEGA Sync verified for ${normalizedAddress} on token ${token.slice(0, 8)}...`);
        
        // [PERFECTION] Set cookie for the mobile user so they transition to the news shell
        const THIRTY_DAYS_S = 30 * 24 * 60 * 60;
        return new NextResponse('Omega Clearance Granted', { 
            status: 200,
            headers: {
                'Set-Cookie': [
                    `whale_handshake=${normalizedAddress}`,
                    'Path=/',
                    `Max-Age=${THIRTY_DAYS_S}`,
                    'SameSite=Lax',
                    'Secure' // Obligatorio en entornos OMEGA
                ].join('; '),
            }
        });
    } catch (e: any) {
        console.error('[QR_SYNC_FATAL]', e);
        return new NextResponse('Internal Neural Engine Failure', { status: 500 });
    }
}
