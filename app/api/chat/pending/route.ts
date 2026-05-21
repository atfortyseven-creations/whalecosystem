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

    const pending = await prisma.pendingChatMessage.findMany({
      where: {
        OR: [
          { sender: address.toLowerCase() },
          { recipient: address.toLowerCase() }
        ]
      },
      orderBy: { timestamp: 'asc' }
    });

    return NextResponse.json({ pending });
  } catch (error) {
    console.error('[Pending Chat] Error fetching:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sender, recipient, content } = await req.json();

    if (!sender || !recipient || !content) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    if (sender.toLowerCase() !== session.userId.toLowerCase()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const pending = await prisma.pendingChatMessage.create({
      data: {
        sender: sender.toLowerCase(),
        recipient: recipient.toLowerCase(),
        content
      }
    });

    return NextResponse.json({ success: true, pending });
  } catch (error) {
    console.error('[Pending Chat] Error saving:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
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

    await prisma.pendingChatMessage.deleteMany({
      where: { recipient: address.toLowerCase() }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Pending Chat] Error deleting:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
