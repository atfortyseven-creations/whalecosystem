import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const limitParam = searchParams.get('limit');
        const takeLimit = limitParam ? parseInt(limitParam) : 50;

        // Extraction from Data Lake
        const whaleEvents = await prisma.globalWhaleEvent.findMany({
            take: takeLimit,
            orderBy: {
                timestamp: 'desc'
            },
            select: {
                hash: true,
                wallet: true,
                token: true,
                amount: true,
                usdValue: true,
                action: true,
                dex: true,
                tier: true,
                timestamp: true,
            }
        });

        // Convert Decimal types from Prisma and return
        const formattedEvents = whaleEvents.map(ev => ({
            ...ev,
            usdValue: Number(ev.usdValue),
        }));

        return NextResponse.json({ success: true, events: formattedEvents });

    } catch (error) {
        console.error("Data Lake Retrieval Error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch indexed whale events." },
            { status: 500 }
        );
    }
}
