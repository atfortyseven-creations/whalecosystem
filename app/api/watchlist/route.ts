import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// ── Helper: resolve user by wallet address from request header ──────────────
// The client sends the connected wallet in the x-wallet-address header.
// We upsert on walletAddress so each wallet has its own persistent watchlist.
async function resolveUser(req: Request): Promise<string | null> {
    const walletAddress = req.headers.get('x-wallet-address')?.toLowerCase().trim();

    if (walletAddress && walletAddress.startsWith('0x') && walletAddress.length >= 42) {
        const user = await prisma.user.upsert({
            where: { walletAddress },
            update: {},
            create: { walletAddress }
        });
        return user.id;
    }

    // No wallet header — return null; caller decides how to handle
    return null;
}

export async function GET(req: Request) {
    try {
        const userId = await resolveUser(req);
        if (!userId) {
            return NextResponse.json({ success: true, count: 0, data: [], reason: 'no_wallet' });
        }

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

        if (!symbol || typeof symbol !== 'string') {
            return NextResponse.json({ success: false, error: 'symbol required' }, { status: 400 });
        }

        const userId = await resolveUser(req);
        if (!userId) {
            return NextResponse.json({ success: false, error: 'Wallet not connected' }, { status: 401 });
        }

        const added = await prisma.watchlist.create({
            data: {
                userId,
                symbol: symbol.toUpperCase().slice(0, 20),
                chain: (chain || 'multi').slice(0, 30)
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

        const userId = await resolveUser(req);
        if (!userId) return NextResponse.json({ success: false, error: 'Wallet not connected' }, { status: 401 });

        if (symbol) {
            await prisma.watchlist.deleteMany({
                where: { userId, symbol: symbol.toUpperCase() }
            });
        }
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ success: false, error: 'Failed to delete' }, { status: 500 });
    }
}
