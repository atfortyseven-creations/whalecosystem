import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * [Elite] Transaction Registration API
 * Creates a PENDING entry in the DB immediately after broadcast.
 */
export async function POST(req: Request) {
    try {
        const data = await req.json();
        const { hash, userId, type, fromChain, toChain, fromToken, toToken, fromAmount, metadata } = data;

        if (!hash || !userId) {
            return NextResponse.json({ error: 'Missing hash or userId' }, { status: 400 });
        }

        const tx = await prisma.blockchainTransaction.upsert({
            where: { hash },
            update: {
                status: data.status || 'PENDING_RELAY',
                updatedAt: new Date()
            },
            create: {
                hash,
                userId,
                type: type || 'SWAP',
                fromChain,
                toChain,
                fromToken,
                toToken,
                fromAmount: fromAmount.toString(),
                status: 'PENDING_RELAY',
                metadata: metadata || {}
            }
        });

        console.log(`[ORCHESTRATOR] Registered transaction: ${hash}`);
        return NextResponse.json(tx);
    } catch (error: any) {
        console.error('[ORCHESTRATOR] API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * Gets user transactions
 */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        const transactions = await prisma.blockchainTransaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        return NextResponse.json(transactions);
    } catch (error: any) {
        console.warn('[TransactionsAPI] DB Connection failed, returning empty list.', error.message);
        return NextResponse.json([]); // Return empty list instead of crashing
    }
}

