import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const skip = (page - 1) * limit;

    // We fetch the latest blocks and their associated transactions
    const blocks = await prisma.humanityLedgerBlock.findMany({
      take: limit,
      skip,
      orderBy: { timestamp: 'desc' },
      include: {
        transactions: {
          take: 10,
          orderBy: { value: 'desc' }
        }
      }
    });

    const totalBlocks = await prisma.humanityLedgerBlock.count();
    const totalTransactions = await prisma.humanityLedgerTransaction.count();

    // Since BigInt cannot be serialized by standard JSON.stringify,
    // we use a custom replacer to convert BigInts to strings.
    const jsonStr = JSON.stringify({ 
      ok: true, 
      blocks,
      stats: {
        totalBlocks,
        totalTransactions
      }
    }, (_, v) => typeof v === 'bigint' ? v.toString() : v);

    return new NextResponse(jsonStr, { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error: unknown) {
    console.error('[API Humanity Ledger]', error);
    return NextResponse.json({ ok: false, error: 'Database synchronization failed' }, { status: 500 });
  }
}
