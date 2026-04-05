import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    // 1. Get Authentication Context
    const session = await getServerSession(authOptions);
    let userId = '';

    if (session?.user?.email) {
        // Fallback for NextAuth
        const user = await prisma.user.findFirst({ where: { isPro: false } }); // Find any mock user if mapping fails for demo
        userId = user?.id || 'demo_user';
    } else {
        // In SIWE flow (real Web3 Wallet environment), identify via JWT/Session
        // As a fallback for this demo, we auto-create an anonymous session user
        let anonUser = await prisma.user.findFirst({ where: { walletAddress: '0xSovereignDemoClient' } });
        if (!anonUser) {
            anonUser = await prisma.user.create({ data: { walletAddress: '0xSovereignDemoClient' }});
        }
        userId = anonUser.id;
    }

    try {
        const watchlists = await prisma.watchlist.findMany({
            where: { userId },
            orderBy: { addedAt: 'desc' }
        });

        return NextResponse.json({ success: true, count: watchlists.length, data: watchlists });
    } catch (e) {
        console.error("Watchlist GET Error", e);
        return NextResponse.json({ success: false, data: [] }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { symbol, chain } = body;

        let anonUser = await prisma.user.findFirst({ where: { walletAddress: '0xSovereignDemoClient' } });
        if (!anonUser) {
            anonUser = await prisma.user.create({ data: { walletAddress: '0xSovereignDemoClient' }});
        }

        const added = await prisma.watchlist.create({
            data: {
                userId: anonUser.id,
                symbol,
                chain: chain || 'multi'
            }
        });

        return NextResponse.json({ success: true, data: added });
    } catch (e: any) {
        if (e.code === 'P2002') {
            return NextResponse.json({ success: false, error: 'Pair already in watchlist' }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: 'Failed to add to watchlist' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const symbol = searchParams.get('symbol');

         let anonUser = await prisma.user.findFirst({ where: { walletAddress: '0xSovereignDemoClient' } });
         if (!anonUser) return NextResponse.json({ success: false }, { status: 401 });

        if (symbol) {
            await prisma.watchlist.deleteMany({
                where: { userId: anonUser.id, symbol }
            });
        }
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ success: false, error: 'Failed to delete' }, { status: 500 });
    }
}
