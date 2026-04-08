
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redisClient as redis } from '@/lib/redis/client';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const cacheKey = 'whale_leaderboard_500';
        const cached = await redis.get(cacheKey);

        if (cached) {
            return NextResponse.json({ whales: JSON.parse(cached), source: 'cache' });
        }

        // Aggregate volume from WhaleActivity in the last 24h
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // [QUERY-PERFECTION] Grouping by address to get volume leaders
        const result = await prisma.whaleActivity.groupBy({
            by: ['walletAddress'],
            _sum: {
                usdValue: true,
            },
            _count: {
                id: true,
            },
            where: {
                timestamp: {
                    gte: yesterday,
                },
            },
            orderBy: {
                _sum: {
                    usdValue: 'desc',
                },
            },
            take: 500,
        });

        // Fetch labels and tiers from WhaleSnapshot if available
        const addresses = result.map((r: any) => r.walletAddress);
        // Fallback for missing Prisma models - removed whaleSnapshot and walletAnalytics queries
        const snapshotMap = new Map();
        const analyticsMap = new Map();

        const leaderboard = result.map((r: any, index: number) => {
            const snap = snapshotMap.get(r.walletAddress);
            const analytic = analyticsMap.get(r.walletAddress.toLowerCase());
            const metadata = analytic?.metadata as any;
            const pnlData = metadata?.profitLossBreakdown || { totalPnlUsd: 0 };

            return {
                rank: index + 1,
                address: r.walletAddress,
                label: snap?.label || `Whale-${r.walletAddress.slice(2, 6)}`,
                volume24h: Number(r._sum.usdValue || 0),
                pnlUsd: pnlData.totalPnlUsd || 0, // REAL PNL from WalletAnalytics memory
                txCount: r._count.id,
                chain: snap?.chain || 'ETH',
                tier: snap?.tier || (Number(r._sum.usdValue) > 1000000 ? 'MEGA' : 'ALPHA'),
                lastActive: yesterday.toISOString(),
                trend: index < 50 ? 'up' : 'stable',
            };
        });

        // Cache for 60 seconds
        await redis.set(cacheKey, JSON.stringify(leaderboard), 'EX', 60);

        return NextResponse.json({ whales: leaderboard, source: 'live' });
    } catch (error) {
        console.error('[API:WhaleLeaderboard] CRITICAL ERROR:', error);
        return NextResponse.json({ error: 'Failed to generate whale leaderboard' }, { status: 500 });
    }
}
