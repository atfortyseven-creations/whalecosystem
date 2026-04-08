import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const MAX_SUPPLY = 200;

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/golden-ticket/claim
// One ticket per wallet address, enforced at DB + logic level.
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { walletAddress, twitterHandle } = body;

    if (!walletAddress || typeof walletAddress !== 'string') {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
    }

    const address = walletAddress.toLowerCase();

    if (!/^0x[a-f0-9]{40}$/i.test(address)) {
      return NextResponse.json({ error: 'Malformed wallet address' }, { status: 400 });
    }

    // Guard: max supply
    const totalClaimed = await prisma.goldenTicket.count();
    if (totalClaimed >= MAX_SUPPLY) {
      return NextResponse.json({ error: 'Max supply reached. All 200 Whale Gold Tickets have been minted.' }, { status: 410 });
    }

    // Upsert user (only fields that exist in schema)
    await prisma.user.upsert({
      where: { walletAddress: address },
      update: {},
      create: { walletAddress: address },
    });

    // Check existing
    const existing = await prisma.goldenTicket.findUnique({ where: { userAddress: address } });
    if (existing) {
      return NextResponse.json({
        success: false,
        alreadyClaimed: true,
        ticket: existing,
        serial: existing.ticketNumber,
        message: 'This wallet has already claimed its Genesis Ticket.',
      }, { status: 409 });
    }

    // Create with temp serialCode to avoid race P2002
    const ticket = await prisma.goldenTicket.create({
      data: {
        userAddress: address,
        serialCode: `PENDING-${address}-${Date.now()}`,
        tier: 'GENESIS',
        badgeColor: 'GOLD',
        networkLaunchEligible: true,
        twitterHandle: twitterHandle?.replace(/^@/, '') || null,
      },
    });

    const serialNumber = String(ticket.ticketNumber).padStart(4, '0');
    const finalTicket = await prisma.goldenTicket.update({
      where: { id: ticket.id },
      data: { serialCode: `WGT-GENESIS-${serialNumber}` },
    });

    return NextResponse.json({
      success: true,
      ticket: finalTicket,
      serial: finalTicket.ticketNumber,
      totalClaimed: totalClaimed + 1,
      message: 'Whale Gold Ticket claimed successfully.',
    }, { status: 201 });

  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({
        success: false,
        alreadyClaimed: true,
        message: 'This wallet has already claimed its Genesis Ticket.',
      }, { status: 409 });
    }
    console.error('[Golden Ticket POST Error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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

    if (!address) {
      return NextResponse.json({ hasClaimed: false, ticket: null, totalClaimed, remaining, maxSupply: MAX_SUPPLY });
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
    });

  } catch (error) {
    console.error('[Golden Ticket GET Error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
