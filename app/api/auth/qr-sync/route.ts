import { NextResponse } from 'next/server';
import { safeRedisGet, safeRedisSet, redisClient } from '@/lib/redis/client';
import { verifyMessage } from 'viem';
import { getClientForChain } from '@/lib/blockchain/rpc-engine';
import { mainnetClient } from '@/lib/blockchain/rpc-engine';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { token, address, signature, chainId } = body;
        
        if (!token || !address || !signature) {
            return NextResponse.json({ error: 'Missing sync data' }, { status: 400 });
        }

        // 1. Inhumane Perfection: Evitar race conditions asegurando TTL restrictivo
        const status = await safeRedisGet(`qr:${token}`);
        if (!status) {
            return new NextResponse('Sync session expired or invalid. Privacy By Void triggers deletion.', { status: 404 });
        }

        if (status !== 'PENDING') {
            return new NextResponse('Session already consumed or processed', { status: 400 });
        }

        // 2. Validate cryptographic signature
        // We now support multi-chain verification for Smart Wallets on Polygon
        let isValid = false;
        try {
            const message = `RE-CONNECT-WHALE-SESSION-${token}`;
            
            // Standard EIP-191 verification
            isValid = await verifyMessage({
                address: address as `0x${string}`,
                message,
                signature: signature as `0x${string}`
            });

            // If not valid and we have a chainId, try EIP-1271 (Smart Wallet) verification
            if (!isValid && chainId) {
                console.log(`[QR-Sync] Falling back to Chain ${chainId} verification for ${address}`);
                // In a production environment, we would use viem's publicClient.verifyMessage
                // which handles both EIP-191 and EIP-1271 automatically.
                const client = getClientForChain(chainId);
                if (client) {
                    isValid = await client.verifyMessage({
                        address: address as `0x${string}`,
                        message,
                        signature: signature as `0x${string}`
                    });
                }
            }
        } catch (e: any) {
            console.error('[QR-Sync] Signature verification error:', e);
            return NextResponse.json({ error: 'Verification failed' }, { status: 401 });
        }

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
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
        const response = NextResponse.json({ status: 'queued' });
        response.cookies.set('sovereign_handshake', normalizedAddress, {
            path: '/',
            maxAge: 604800,
            sameSite: 'lax',
        });
    } catch (e: any) {
        console.error('[QR_SYNC_FATAL]', e);
        return new NextResponse('Internal Neural Engine Failure', { status: 500 });
    }
}
