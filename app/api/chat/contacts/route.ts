import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');

    if (!address || address.toLowerCase() !== session.userId.toLowerCase()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const contacts = await prisma.chatContact.findMany({
      where: { owner: address.toLowerCase() },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json({ peers: contacts.map(c => c.peer) });
  } catch (error) {
    console.error('[Chat Contacts] Error fetching:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { address, peers } = await req.json();

    if (!address || !peers || !Array.isArray(peers)) {
      return NextResponse.json({ error: 'Missing or invalid parameters' }, { status: 400 });
    }

    if (address.toLowerCase() !== session.userId.toLowerCase()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const owner = address.toLowerCase();

    // Upsert each peer
    const promises = peers.map(async (peerAddr: string) => {
      const peer = peerAddr.toLowerCase();
      return prisma.chatContact.upsert({
        where: {
          owner_peer: { owner, peer }
        },
        update: { updatedAt: new Date() },
        create: { owner, peer }
      });
    });

    await Promise.all(promises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Chat Contacts] Error saving:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
