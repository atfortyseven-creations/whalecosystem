import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) return NextResponse.json([], { status: 401 });

    const variables = await prisma.variable.findMany({
      where: { userId: wallet },
      orderBy: { updatedAt: 'desc' }
    });
    return NextResponse.json(variables);
  } catch (error) {
    console.error('[VARIABLES_GET]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { key, value, description, wallet } = body;

    if (!key || !value || !wallet) {
      return new NextResponse("Key, Value, and Wallet identity are required", { status: 400 });
    }

    try {
        await prisma.user.upsert({
            where: { walletAddress: wallet },
            update: { lastActive: new Date() },
            create: { walletAddress: wallet, tier: 'GHOST' }
        });
    } catch(e) {}

    // Upsert using the composite unique constraint: @@unique([userId, key])
    const variable = await prisma.variable.upsert({
      where: {
         userId_key: {
            userId: wallet,
            key: key
         }
      },
      update: { value, description },
      create: { userId: wallet, key, value, description }
    });

    return NextResponse.json(variable);
  } catch (error) {
    console.error('[VARIABLES_POST]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
