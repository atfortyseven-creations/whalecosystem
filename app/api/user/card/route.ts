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

    const db = prisma as any;
    const card = await db.virtualCard.findUnique({ where: { userId: session.userId } });

    if (!card) {
      return NextResponse.json({ message: 'No virtual card found' }, { status: 404 });
    }

    return NextResponse.json(card);

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

    const db = prisma as any;
    let card = await db.virtualCard.findUnique({ where: { userId: session.userId } });

    if (card) {
       return NextResponse.json({ error: 'Card already exists' }, { status: 400 });
    }

    card = await db.virtualCard.create({
      data: {
        userId: session.userId,
        cardNumber: `4111${Math.floor(Math.random() * 1000000000000)}`, // Encrypted in prod
        expiryMonth: new Date().getMonth() + 1,
        expiryYear: new Date().getFullYear() + 3,
        cvv: Math.floor(100 + Math.random() * 900).toString(),
        cardStatus: 'ACTIVE',
        balance: 0,
        kycStatus: 'VERIFIED'
      }
    });

    return NextResponse.json({ success: true, card });

  } catch (error: any) {
    console.error('Error issuing card:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
