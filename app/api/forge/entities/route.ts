import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { FORGE_ENABLED } from '@/forge';
import { WhaleSeedProcessor } from '@/forge/triggers/whale-seed-processor';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!FORGE_ENABLED) return NextResponse.json({ entities: [] });

  try {
    const limit = 50;
    const entities = await prisma.cosmicEntity.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      where: {
         status: { in: ['ACTIVE', 'HIBERNATING', 'MERGED'] }
      }
    });

    return NextResponse.json({ entities });
  } catch (error) {
    console.error('Failed to fetch entities', error);
    return NextResponse.json({ entities: [] }, { status: 500 });
  }
}

// POST endpoint for the Dev Sandbox Simulator
export async function POST() {
  if (!FORGE_ENABLED) return NextResponse.json({ success: false, error: 'Forge disabled' }, { status: 400 });

  if (process.env.NODE_ENV === 'production') {
     return NextResponse.json({ success: false, error: 'Simulator only available in development mode' }, { status: 403 });
  }

  try {
     const dummyEventId = `sim-${Date.now()}`;
     const dummyUsd = Math.random() * (150_000_000 - 1_000_000) + 1_000_000;
     const chains = ['ETHEREUM', 'SOLANA', 'BITCOIN', 'BASE', 'ARBITRUM'];
     const chain = chains[Math.floor(Math.random() * chains.length)];

     await WhaleSeedProcessor.tryInjectSeed(dummyEventId, dummyUsd, chain);

     return NextResponse.json({ success: true, simulatedEvent: dummyEventId });
  } catch (error) {
     return NextResponse.json({ success: false }, { status: 500 });
  }
}
