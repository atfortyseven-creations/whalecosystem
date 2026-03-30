import { NextRequest, NextResponse } from 'next/server';
import rateLimit from '@/lib/rate-limit';
import { withCache, CacheTTL } from '@/src/lib/cache/redis-cache';
import { fetchRealWhaleTransfers } from '@/lib/blockchain/WhaleFlowService';

/**
 * Whale Activities API Route
 * 100% real on-chain data from Alchemy Asset Transfers.
 * No synthetic data. No mock fills. Every row is verifiable on-chain.
 *
 * Data source: Alchemy getAssetTransfers — ETH Mainnet, Base, Arbitrum, Polygon
 * Threshold: > $100,000 USD per transaction
 */

const limiter = rateLimit({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 500,
});

export async function GET(req: NextRequest) {
    try {
        const ip = req.headers.get('x-forwarded-for') || 'anonymous';
        try {
            await limiter.check(20, ip);
        } catch {
            return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
        }

        const cacheKey = 'whale:activities:onchain:v2';

        const data = await withCache(
            cacheKey,
            async () => {
                // Pull real transfers directly from Alchemy — no DB padding
                const activities = await fetchRealWhaleTransfers(40);
                return {
                    activities,
                    timestamp: Date.now(),
                    source: 'alchemy_on_chain',
                    chains: ['ethereum', 'base', 'arbitrum', 'polygon'],
                    threshold_usd: 100000,
                };
            },
            // 15-second cache to avoid hammering Alchemy; enough for near-real-time
            { ttl: 15 }
        );

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('[API ERROR] Whale activities:', error);
        return NextResponse.json(
            { error: error.message, activities: [], timestamp: Date.now() },
            { status: 500 }
        );
    }
}
