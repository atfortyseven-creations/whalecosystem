import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// FIX Bug 13: Complete rewrite. Replaced 100% mock generated leaderboard with
// a real database query against WhaleActivity. Ranks wallets by actual on-chain
// USD volume ingested by the EVM/SOL/BTC workers. No more fake users, no Math.random().
// The leaderboard only shows data that exists in the database.

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const type  = searchParams.get('type')  || 'volume';
        const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

        if (type === 'volume') {
            // Aggregate real on-chain whale volume from the database
            const grouped = await prisma.$queryRaw<
                Array<{ walletAddress: string; totalUsd: number; txCount: bigint }>
            >`
                SELECT 
                    "walletAddress",
                    SUM(CAST("usdValue" AS FLOAT)) AS "totalUsd",
                    COUNT(*) AS "txCount"
                FROM "WhaleActivity"
                GROUP BY "walletAddress"
                ORDER BY "totalUsd" DESC
                LIMIT ${limit}
            `;

            const entries = grouped.map((row, i) => ({
                rank:          i + 1,
                walletAddress: row.walletAddress,
                // Truncate address for display; never invent one
                username:      `${row.walletAddress.slice(0, 6)}…${row.walletAddress.slice(-4)}`,
                value:         Number(row.totalUsd).toFixed(2),
                txCount:       Number(row.txCount),
                badge:         i < 3 ? (['gold', 'silver', 'bronze'] as const)[i] : null,
            }));

            return NextResponse.json({
                type,
                entries,
                totalEntries: entries.length,
                source: 'on-chain',
                timestamp: Date.now(),
            });
        }

        // For other types (winRate, alpha) — return empty until real scoring exists
        // rather than fake data that misleads users.
        return NextResponse.json({
            type,
            entries: [],
            source: 'pending',
            message: `Leaderboard type '${type}' requires additional on-chain analytics indexing not yet available.`,
            timestamp: Date.now(),
        });

    } catch (error: any) {
        console.error('[API ERROR] Leaderboard:', error);
        return NextResponse.json(
            { error: 'Internal server error', entries: [] },
            { status: 500 }
        );
    }
}
