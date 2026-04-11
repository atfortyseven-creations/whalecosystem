import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Redis from 'ioredis';

// Sanitize and reconstruct REDIS_URL for high-performance direct access
function getSanitizedRedisUrl(): string {
    const rawUrl = (process.env.REDIS_URL || '').toString().trim().replace(/^["']|["']$/g, '');
    if (rawUrl.startsWith('redis://') || rawUrl.startsWith('rediss://')) return rawUrl;
    
    const host = process.env.REDISHOST || process.env.REDIS_HOST || process.env.RAILWAY_REDIS_HOST;
    const port = process.env.REDISPORT || process.env.REDIS_PORT || '6379';
    const user = process.env.REDISUSER || process.env.REDIS_USER || 'default';
    const pass = process.env.REDISPASSWORD || process.env.REDIS_PASSWORD || rawUrl;
    
    if (host) {
        const protocol = (process.env.REDIS_TLS === 'true' || port === '6380' || rawUrl.includes('rediss')) ? 'rediss' : 'redis';
        const auth = pass ? `${user}:${pass}@` : '';
        return `${protocol}://${auth}${host}:${port}`;
    }
    return '';
}

const REDIS_URL = getSanitizedRedisUrl();
const redis = REDIS_URL ? new Redis(REDIS_URL, { family: 4 }) : null;

export async function GET() {
    try {
        if (redis) {
            const cache = await redis.get('institutional:stats');
            if (cache) return NextResponse.json(JSON.parse(cache));
        }

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


        if (redis) {
            await redis.set('institutional:stats', JSON.stringify(stats), 'EX', 15);
        }

        return NextResponse.json(stats);
    } catch (error: any) {
        const traceId = crypto.randomUUID();
        console.error(`[INSTITUTIONAL-STATS] 💀 Failure (Trace: ${traceId}):`, error.message);
        return NextResponse.json({ 
            error: 'Institutional metric aggregation unavailable', 
            code: 'SVC_STATS_UNAVAILABLE',
            traceId,
            status: 503 
        }, { status: 503 });
    }
}
