import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

// ZERO-MOCK MANDATE: The VirtualCard model does not exist in schema.prisma.
// The Striga KYC integration is pending. Both GET and POST are gated with 501.

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      error: 'VIRTUAL_CARD_NOT_IMPLEMENTED',
      message: 'Virtual card requires Striga KYC integration and VirtualCard schema model. Feature pending.'
    }, { status: 501 });

  } catch (error: any) {
    console.error('Error fetching card:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      error: 'VIRTUAL_CARD_NOT_IMPLEMENTED',
      message: 'Virtual card issuance requires Striga KYC + on-chain compliance integration. Feature pending GetBlock RPC wiring.'
    }, { status: 501 });

  } catch (error: any) {
    console.error('Error issuing card:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
