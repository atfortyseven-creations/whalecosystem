/**
 * GET /api/top-whale-events
 *
 * Serves the Top 50 Whale Events of the last 24h from the pre-computed
 * Redis aggregation index (idx:whaleevents:top:24h).
 *
 * On cache-miss, falls back to a direct Prisma query and repopulates the index.
 */

import { NextRequest, NextResponse } from 'next/server';
import { safeRedisGet, safeRedisSet } from '@/lib/redis/client';
import { AGGREGATION_KEYS } from '@/lib/indexer/aggregation-service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
    try {
        // ── Fast path: pre-computed aggregation index ─────────────────────────
        const cached = await safeRedisGet(AGGREGATION_KEYS.TOP_WHALE_EVENTS_24H);
        if (cached) {
            return NextResponse.json(JSON.parse(cached), {
                headers: { 'X-Cache': 'HIT', 'Cache-Control': 'no-store' },
            });
        }

        // ── Cache miss: direct Prisma query + repopulate ──────────────────────
        const { prisma } = await import('@/lib/prisma');
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const events = await prisma.globalWhaleEvent.findMany({
            where: { timestamp: { gte: since } },
            orderBy: { amountUSD: 'desc' },
            take: 50,
        });

        const payload = {
            updatedAt: new Date().toISOString(),
            data: events,
        };

        // Repopulate the index for 30 seconds
        await safeRedisSet(
            AGGREGATION_KEYS.TOP_WHALE_EVENTS_24H,
            JSON.stringify(payload),
            'EX', 30
        );

        return NextResponse.json(payload, {
            headers: { 'X-Cache': 'MISS', 'Cache-Control': 'no-store' },
        });

    } catch (err: any) {
        return NextResponse.json(
            { error: 'Top whale events unavailable', detail: err?.message },
            { status: 503 }
        );
    }
}
