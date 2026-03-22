import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { cashier } from '@/lib/wallet/deposit-watcher';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json().catch(() => ({}));
    const { walletAddress } = body;

    let userId = session?.user?.email;

    // Resolve User ID: Prefer direct walletAddress if provided (for WalletConnect users)
    // Fallback to session email linked to wallet
    if (walletAddress) {
        userId = walletAddress;
    } else if (session?.user?.email) {
        const authUser = await prisma.authUser.findUnique({
            where: { email: session.user.email },
            select: { walletAddress: true }
        });
        if (authUser?.walletAddress) userId = authUser.walletAddress;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized: No wallet or session found' }, { status: 401 });
    }

    // Ensure User exists in DB for foreign key constraints
    const existingUser = await prisma.user.findUnique({ where: { walletAddress: userId } });
    if (!existingUser) {
        await prisma.user.create({
            data: {
                walletAddress: userId,
                tier: 'INITIATE',
                lastActive: new Date()
            }
        });
    } else {
        await prisma.user.update({
            where: { walletAddress: userId },
            data: { lastActive: new Date() }
        });
    }

    // Trigger Sync (Only if it's a valid address)
    let result = null;
    if (userId.startsWith('0x')) {
        result = await cashier.syncUserBalance(userId, userId);
    }

    return NextResponse.json({
        success: true,
        ...(result || {})
    });

  } catch (error: any) {
    console.error('Wallet Sync Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

