import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

/**
 * POST: Associate a Synthetix Account ID with the authenticated user's wallet.
 */
export async function POST(req: NextRequest) {
    try {
        const { userId: clerkId } = getAuth(req);
        
        if (!clerkId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { snxAccountId, walletAddress } = await req.json();

        if (!snxAccountId || !walletAddress) {
            return NextResponse.json({ error: 'snxAccountId and walletAddress are required' }, { status: 400 });
        }

        // 🛡️ [SECURITY] Hard-bind to the authenticated Clerk user
        const user = await prisma.user.update({
            where: { 
                clerkId: clerkId,
                walletAddress: walletAddress.toLowerCase() 
            },
            data: { 
                snxAccountId: snxAccountId.toString(),
                lastActive: new Date()
            }
        });

        return NextResponse.json({ 
            success: true, 
            message: 'Synthetix Account synchronized',
            snxAccountId: user.snxAccountId
        });

    } catch (error: any) {
        console.error('[SNX_ACCOUNT_SYNC_ERROR]', error);
        return NextResponse.json({ 
            error: 'Failed to synchronize account', 
            details: error.message 
        }, { status: 500 });
    }
}

/**
 * GET: Retrieve the SNX account for the user
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');

    if (!address) {
        return NextResponse.json({ snxAccountId: null });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { walletAddress: address.toLowerCase() },
            select: { snxAccountId: true }
        });
        return NextResponse.json({ snxAccountId: user?.snxAccountId || null });
    } catch (e) {
        return NextResponse.json({ snxAccountId: null });
    }
}

