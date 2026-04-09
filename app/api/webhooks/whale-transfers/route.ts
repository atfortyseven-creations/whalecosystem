import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createRedisClient } from '@/lib/redis/client';

const redis = createRedisClient({ name: 'Whale-Webhook' });

// This endpoint receives HTTP POST requests from an on-chain indexing service like Alchemy Custom Webhooks or QuickNode Destinatioms.
export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Security: Verify Alchemy signature based on x-alchemy-signature header in a real production environment.
        const authHeader = req.headers.get('authorization') || req.headers.get('x-alchemy-signature');
        if (!authHeader && process.env.NODE_ENV === 'production') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // Parse Payload - Expecting an array of transfers.
        // Alchemy format often comes as body.event.activity
        const activities = body?.event?.activity || body?.transfers || [body];

        for (const activity of activities) {
            const { fromAddress, toAddress, value, asset, hash, category } = activity;
            const threshold = 500000; // $500k Whale Threshold for notifications

            // Rough estimation if missing fiat value (assuming stablecoin or ETH payload mostly)
            const usdValue = activity.usdValue || (asset === 'ETH' ? value * 3000 : value);

            if (usdValue >= threshold) {
                const txHash = hash || activity.transactionHash || `0xWeb3Tx${Date.now()}`;
                const safeAsset = asset || 'UNKNOWN';

                // 1. Create a Persistent DB Alert Record
                const alertEntry = await prisma.alert.create({
                    data: {
                        userId: 'GLOBAL_BROADCAST', // Pseudo-ID for global feed
                        message: `🚨 ${usdValue >= 1000000 ? 'MEGALODON' : 'WHALE'} ${category || 'TRANSFER'}: ${parseFloat(value).toFixed(2)} ${safeAsset} ($${usdValue.toLocaleString()})`,
                        type: 'WHALE_TX',
                        txHash: txHash
                    }
                });

                // 2. Push to Redis for immediate WebSocket Engine pickup
                const streamPayload = {
                    id: alertEntry.id,
                    type: 'WHALE',
                    asset: safeAsset,
                    usdValue: usdValue,
                    from: fromAddress,
                    to: toAddress,
                    txHash: txHash,
                    timestamp: new Date().toISOString()
                };

                await redis.publish('whale_alerts_stream', JSON.stringify(streamPayload));
                
                // Keep the last 100 cached for late-joiners
                const cacheKey = 'latest_whale_alerts';
                const cachedRaw = await redis.get(cacheKey);
                let cachedAlerts = cachedRaw ? JSON.parse(cachedRaw) : [];
                cachedAlerts.unshift(streamPayload);
                if (cachedAlerts.length > 100) cachedAlerts = cachedAlerts.slice(0, 100);
                await redis.set(cacheKey, JSON.stringify(cachedAlerts), 'EX', 86400); // 24h
                
                console.log(`[WHALE WEBHOOK] Processed TX: ${txHash} -> $${usdValue.toLocaleString()}`);
            }
        }

        return NextResponse.json({ success: true, processed: activities.length });
    } catch (error) {
        console.error('[WHALE WEBHOOK ERROR]', error);
        return NextResponse.json({ success: false, error: 'Internal processing failure' }, { status: 500 });
    }
}
