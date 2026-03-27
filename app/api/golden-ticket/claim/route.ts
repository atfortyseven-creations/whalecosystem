import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// POST /api/golden-ticket/claim
// Claims a Golden Ticket for the authenticated user. One per wallet address.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { walletAddress, twitterHandle } = body;

    if (!walletAddress || typeof walletAddress !== 'string') {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
    }

    const address = walletAddress.toLowerCase();
    
    // Validate address format
    if (!/^0x[a-f0-9]{40}$/i.test(address)) {
      return NextResponse.json({ error: 'Malformed wallet address' }, { status: 400 });
    }

    // [SAFETY] Upsert user so foreign key constraint is satisfied even for new wallets
    await prisma.user.upsert({
      where: { walletAddress: address },
      update: { lastActive: new Date() },
      create: { walletAddress: address, tier: 'GHOST' },
    });

    // Check if user already has a ticket (DB-level unique enforces this too)
    const existing = await prisma.goldenTicket.findUnique({
      where: { userAddress: address },
    });

    if (existing) {
      return NextResponse.json({
        success: false,
        alreadyClaimed: true,
        ticket: existing,
        message: 'This wallet has already claimed its Genesis Ticket.'
      }, { status: 409 });
    }

    // Count existing tickets for serial code
    const totalTickets = await prisma.goldenTicket.count();
    const serialNumber = String(totalTickets + 1).padStart(6, '0');
    const serialCode = `WHALE-GEN-${serialNumber}`;

    const ticket = await prisma.goldenTicket.create({
      data: {
        userAddress: address,
        serialCode,
        tier: 'GENESIS',
        badgeColor: 'GOLD',
        networkLaunchEligible: true,
        twitterHandle: twitterHandle?.replace(/^@/, '') || null,
      },
    });

    return NextResponse.json({
      success: true,
      ticket,
      message: 'Genesis Ticket claimed successfully. Your golden badge is reserved.'
    }, { status: 201 });

  } catch (error: any) {
    // Handle unique constraint violation (race condition)
    if (error?.code === 'P2002') {
      return NextResponse.json({
        success: false,
        alreadyClaimed: true,
        message: 'This wallet has already claimed its Genesis Ticket.'
      }, { status: 409 });
    }
    console.error('[Golden Ticket Claim Error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/golden-ticket/claim?address=0x...
// Returns the ticket status for a given address
export async function GET(req: NextRequest) {
  try {
    const address = req.nextUrl.searchParams.get('address')?.toLowerCase();

    if (!address) {
      return NextResponse.json({ error: 'Address required' }, { status: 400 });
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
      }
    });

    // Also return total claimed for social proof
    const totalClaimed = await prisma.goldenTicket.count();

    return NextResponse.json({
      hasClaimed: !!ticket,
      ticket: ticket || null,
      totalClaimed,
    });

  } catch (error) {
    console.error('[Golden Ticket GET Error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
