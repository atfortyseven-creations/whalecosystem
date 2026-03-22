import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const address = searchParams.get('address');

        if (!address) {
            return NextResponse.json({ error: 'Missing address' }, { status: 400 });
        }

        const positions = await prisma.exchangePosition.findMany({
            where: { userId: address, status: 'OPEN' }
        });

        let totalPnL = 0;
        const enrichedPositions = positions.map(pos => {
            const unrealized = Number(pos.unrealizedPnl);
            totalPnL += unrealized;
            return {
                ...pos,
                unrealizedPnl: unrealized
            };
        });

        return NextResponse.json({ totalPnL, positions: enrichedPositions });
    } catch (e: any) {
        console.error('[API/PNL] Error:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

