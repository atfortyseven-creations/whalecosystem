import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { safeRedisGet, safeRedisSet } from '@/lib/redis/client';
import { randomUUID } from 'crypto';

export async function GET() {
    try {
        const cached = await safeRedisGet('institutional:stats');
        if (cached) return NextResponse.json(JSON.parse(cached));

        // Aggregate institutional metrics with localized resilience
        let volumeUSD = 0;
        let whaleCount = 0;
        let topPairs: any[] = [];

        try {
            const volumeAgg = await prisma.$queryRaw<{ sum: number }[]>`SELECT SUM(CAST("usdValue" AS DOUBLE PRECISION)) as sum FROM "WhaleActivity"`;
            volumeUSD = volumeAgg[0]?.sum || 0;
        } catch { /* Table missing or cast error */ }

        try {
            whaleCount = await prisma.onChainEntity.count({ where: { category: 'Whale' } });
        } catch { /* Table missing */ }

        try {
            const pairs = await prisma.whaleActivity.groupBy({
                by: ['token'],
                _count: { _all: true },
                orderBy: { _count: { token: 'desc' } },
                take: 10
            });
            topPairs = pairs.map(p => ({ symbol: p.token, activityCount: p._count?._all || 0 }));
        } catch { /* Table missing */ }

        const stats = {
            totalVolumeUSD: volumeUSD,
            whaleCount,
            topPairs,
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
