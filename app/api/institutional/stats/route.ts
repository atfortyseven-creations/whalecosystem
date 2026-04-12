// app/api/institutional/stats/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 1. Aggregated Volume (24h)
    const stats24h = await db.whaleActivity.aggregate({
      where: {
        timestamp: { gte: last24h },
        usdValue: { gte: '50000000' }
      },
      _sum: {
        valueBTC: true
      },
      _count: {
        id: true
      }
    });

    // 2. Aggregated Volume (USD Projection) - sum of strings is tricky in Prisma 
    // We'll fetch the records and sum them for absolute precision on high-value items
    const records24h = await db.whaleActivity.findMany({
      where: { timestamp: { gte: last24h }, usdValue: { gte: '50000000' } },
      select: { usdValue: true, institutional: true, entityName: true }
    });

    const totalUsdVolume = records24h.reduce((acc, curr) => acc + parseFloat(curr.usdValue), 0);
    const institutionalRatio = records24h.length > 0 
      ? records24h.filter(r => r.institutional).length / records24h.length 
      : 0;

    // 3. Top Active Entities
    const entityCounts: Record<string, number> = {};
    records24h.forEach(r => {
      if (r.entityName !== 'Unknown Whale') {
        entityCounts[r.entityName] = (entityCounts[r.entityName] || 0) + 1;
      }
    });

    const topEntities = Object.entries(entityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));

    // 4. Whale Sentiment (Heuristic)
    // If institutional ratio > 0.6 and volume > $500M = Aggressive Accumulation
    let sentiment = 'NEUTRAL';
    if (totalUsdVolume > 500_000_000 && institutionalRatio > 0.6) sentiment = 'AGGRESSIVE ACCUMULATION';
    else if (totalUsdVolume > 200_000_000 && institutionalRatio > 0.4) sentiment = 'MODERATE ACCUMULATION';
    else if (records24h.length > 10) sentiment = 'ACTIVE DISTRIBUTION';

    // 5. SOV-ALPHA Score (0-100)
    const alphaScore = Math.min(Math.floor((totalUsdVolume / 1_000_000_000) * 40 + institutionalRatio * 60), 100);

    return NextResponse.json({
      total24hVolume: totalUsdVolume,
      total24hBtc: stats24h._sum.valueBTC || 0,
      transactionCount: stats24h._count.id,
      institutionalRatio,
      sentiment,
      topEntities,
      alphaScore,
      lastUpdated: now.toISOString()
    });
  } catch (err: any) {
    console.error('[API_STATS_ERROR]', err);
    return NextResponse.json({ error: 'Alpha Engine Fail', details: err.message }, { status: 500 });
  }
}
