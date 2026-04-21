import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMessage } from 'viem';

export const dynamic = 'force-dynamic';

const MAX_SUPPLY = 200;

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/golden-ticket/claim
// One ticket per wallet address, enforced at DB + logic level.
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { walletAddress, twitterHandle, signatureData, cryptoSignature } = body;

    if (!walletAddress || typeof walletAddress !== 'string') {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
    }

    // Validate hex address — accept both lower and checksummed
    const address = walletAddress.toLowerCase();
    if (!/^0x[a-f0-9]{40}$/.test(address)) {
      return NextResponse.json({ error: 'Malformed wallet address' }, { status: 400 });
    }

    if (!cryptoSignature) {
      return NextResponse.json({ error: 'Missing cryptographic signature' }, { status: 400 });
    }

    // Verify mathematical signature ownership
    try {
      const isValidSig = await verifyMessage({
        address: walletAddress as `0x${string}`,
        message: `WHALE ALERT NETWORK GOLD ACCESS: ${walletAddress}`,
        signature: cryptoSignature as `0x${string}`,
      });
      if (!isValidSig) {
         return NextResponse.json({ error: 'Cryptographic signature is invalid or forged' }, { status: 401 });
      }
    } catch (e) {
      return NextResponse.json({ error: 'Failed to verify cryptographic signature' }, { status: 401 });
    }

    // Check for existing claim BEFORE opening a transaction (fast path)
    const existing = await prisma.goldenTicket.findUnique({
      where: { userAddress: address },
      select: { id: true, ticketNumber: true, serialCode: true, tier: true, badgeColor: true,
                networkLaunchEligible: true, twitterHandle: true, isActive: true, claimedAt: true }
    });
    if (existing) {
      return NextResponse.json({
        success: false, alreadyClaimed: true, ticket: existing,
        serial: existing.ticketNumber,
        message: 'This wallet has already claimed its Genesis Ticket.',
      }, { status: 409 });
    }

    // FIX: Interactive transactions over PgBouncer are aggressively dropping connections,
    // causing 'Allocation failure' in production. By decoupling into sequential execution,
    // we sacrifice strict atomicity to guarantee 100% operational success.
    
    const totalClaimed = await prisma.goldenTicket.count();
    if (totalClaimed >= MAX_SUPPLY) {
      throw new Error('MAX_SUPPLY_REACHED');
    }

    // Ensure the User row exists
    await prisma.user.upsert({
      where:  { walletAddress: address },
      update: {},
      create: { walletAddress: address },
    });

    // Create the ticket
    const ticket = await prisma.goldenTicket.create({
      data: {
        userAddress: address,
        serialCode: `PENDING-${address}-${Date.now()}`,
        tier: 'GENESIS',
        badgeColor: 'GOLD',
        networkLaunchEligible: true,
        twitterHandle: twitterHandle?.replace(/^@/, '') || null,
        signatureData: signatureData || null,
      },
    });

    // Finalise the human-readable serial code
    const serialNumber = String(ticket.ticketNumber).padStart(4, '0');
    const finalTicket = await prisma.goldenTicket.update({
      where: { id: ticket.id },
      data:  { serialCode: `WGT-GENESIS-${serialNumber}` },
    });

    return NextResponse.json({
      success: true,
      ticket: finalTicket,
      serial: finalTicket.ticketNumber,
      totalClaimed: totalClaimed + 1,
      message: 'Whale Gold Ticket claimed successfully.',
    }, { status: 201 });

  } catch (error: any) {
    if (error?.message === 'MAX_SUPPLY_REACHED') {
      return NextResponse.json({
        error: 'Max supply reached. All 200 Whale Gold Tickets have been minted.',
      }, { status: 410 });
    }
    if (error?.code === 'P2002') {
      return NextResponse.json({
        success: false, alreadyClaimed: true,
        message: 'This wallet has already claimed its Genesis Ticket.',
      }, { status: 409 });
    }
    console.error('[Golden Ticket POST Error]', error);
    return NextResponse.json({ error: `Internal server error: ${error?.message || String(error)}` }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/golden-ticket/claim
// ?address=0x...  → per-wallet status + global supply
// (no address)    → global supply stats only (for public counter)
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const address = req.nextUrl.searchParams.get('address')?.toLowerCase();
    const totalClaimed = await prisma.goldenTicket.count();
    const remaining = Math.max(0, MAX_SUPPLY - totalClaimed);

    const feedRaw = await prisma.goldenTicket.findMany({
      where: { isActive: true },
      select: {
        userAddress: true,
        claimedAt: true,
        signatureData: true,
        serialCode: true,
        tier: true,
        badgeColor: true,
        networkLaunchEligible: true,
        twitterHandle: true,
      },
      orderBy: { claimedAt: 'desc' },
      take: 30, // Top 30 recent mints for the Ledger
    });

    if (!address) {
      return NextResponse.json({ 
        hasClaimed: false, ticket: null, totalClaimed, remaining, maxSupply: MAX_SUPPLY, feed: feedRaw
      });
    }

    const ticket = await prisma.goldenTicket.findUnique({
      where: { userAddress: address },
      select: {
        id: true,
        ticketNumber: true,
        serialCode: true,
        tier: true,
        badgeColor: true,
        networkLaunchEligible: true,
        twitterHandle: true,
        signatureData: true,
        isActive: true,
        claimedAt: true,
      },
    });

    return NextResponse.json({
      hasClaimed: !!ticket,
      ticket: ticket || null,
      serial: ticket?.ticketNumber ?? null,
      totalClaimed,
      remaining,
      maxSupply: MAX_SUPPLY,
      feed: feedRaw,
    });

  } catch (error) {
    console.error('[Golden Ticket GET Error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
