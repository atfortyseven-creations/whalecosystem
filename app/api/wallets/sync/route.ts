import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

/**
 * POST /api/wallets/sync
 * PERSISTENCE LAYER: Saves locally generated wallets to the user's account.
 */
export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const userAddress = cookieStore.get('sovereign_handshake')?.value;

        if (!userAddress) {
            return NextResponse.json({ error: 'Identity not initialized' }, { status: 401 });
        }

        const { wallets } = await req.json(); // { address: string, label: string }[]

        // Find or Create user
        let user = await prisma.user.findUnique({
            where: { walletAddress: userAddress }
        });

        if (!user) {
            user = await prisma.user.create({
                data: { walletAddress: userAddress }
            });
        }

        // Upsert wallets into WatchedWallet
        for (const w of wallets) {
            await prisma.watchedWallet.upsert({
                where: { 
                    userId_walletAddress: {
                        userId: user.id,
                        walletAddress: w.address
                    }
                },
                create: {
                    userId: user.id,
                    walletAddress: w.address,
                    label: w.label || 'Generated Intel'
                },
                update: {
                    label: w.label || 'Generated Intel'
                }
            });
        }

        // Clean up duplicates (simplified for this context)
        // In a real 50-trillion-param system, we would have a @@unique([userId, walletAddress])

        return NextResponse.json({ success: true, count: wallets.length });

    } catch (error: any) {
        console.error('[WALLET-SYNC-POST] 💀 Failure:', error.message);
        return NextResponse.json({ error: 'Cloud synchronization failed' }, { status: 500 });
    }
}

/**
 * GET /api/wallets/sync
 * RESTORATION LAYER: Fetches all saved wallets for the current identity.
 */
export async function GET() {
    try {
        const cookieStore = await cookies();
        const userAddress = cookieStore.get('sovereign_handshake')?.value;

        if (!userAddress) {
            return NextResponse.json({ wallets: [] }); 
        }

        const user = await prisma.user.findUnique({
            where: { walletAddress: userAddress },
            include: {
                // WatchedWallet is not explicitly related in the schema I saw, 
                // but we can query it directly.
            }
        });

        if (!user) return NextResponse.json({ wallets: [] });

        const wallets = await prisma.watchedWallet.findMany({
            where: { userId: user.id }
        });

        return NextResponse.json({ 
            wallets: wallets.map(w => ({
                address: w.walletAddress,
                label: w.label
            }))
        });

    } catch (error: any) {
        console.error('[WALLET-SYNC-GET] 💀 Failure:', error.message);
        return NextResponse.json({ error: 'Identity restoration failed' }, { status: 500 });
    }
}
