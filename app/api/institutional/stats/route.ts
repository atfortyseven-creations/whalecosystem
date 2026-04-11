import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { safeRedisGet, safeRedisSet } from '@/lib/redis/client';
import { randomUUID } from 'crypto';

export async function GET() {
    try {
        const cached = await safeRedisGet('institutional:stats');
        if (cached) return NextResponse.json(JSON.parse(cached));

        // Aggregate institutional metrics
        const [volumeAgg, whaleCount, topPairs] = await prisma.$transaction([
            prisma.$queryRaw<{ sum: number }[]>`SELECT SUM(CAST("usdValue" AS DOUBLE PRECISION)) as sum FROM "WhaleActivity"`,
            prisma.onChainEntity.count({
                where: { category: 'Whale' }
            }),
            prisma.whaleActivity.groupBy({
                by: ['token'],
                _count: {
                    _all: true
                },
                orderBy: {
                    _count: {
                        token: 'desc'
                    }
                },
                take: 10
            })
        ]);

        const stats = {
            totalVolumeUSD: volumeAgg[0]?.sum || 0,
            whaleCount,
            topPairs: (topPairs as any[]).map(p => ({
                symbol: p.token,
                activityCount: p._count?._all || 0
            })),
            timestamp: new Date().toISOString()
        };


        await safeRedisSet('institutional:stats', JSON.stringify(stats), 'EX', 15);

        return NextResponse.json(stats);
    } catch (error: any) {
        const traceId = randomUUID();
        console.error(`[INSTITUTIONAL-STATS] 💀 Failure (Trace: ${traceId}):`, error.message);
        return NextResponse.json({ 
            error: 'Institutional metric aggregation unavailable', 
            code: 'SVC_STATS_UNAVAILABLE',
            traceId,
            status: 503 
        }, { status: 503 });
    }
}
