import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// [SECURITY] Generate a random API key
function generateApiKey() {
  const prefix = 'wh_live_';
  const randomBytes = crypto.randomBytes(24).toString('hex');
  return `${prefix}${randomBytes}`;
}

export async function POST(req: NextRequest) {
  try {
    // [SECURITY] Authenticate User via Session
    const session = await getServerSession(authOptions);
    
    // Check if session exists and has a user with an email (or ID)
    if (!session || !session.user || !session.user.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Resolve User from DB to get the Wallet Address (ID)
    // Primary Key in User model is walletAddress.
    // We assume the session.user.email links to a User.
    // NOTE: In this schema, User.email is unique.
    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user) {
        return NextResponse.json({ error: 'User wallet not found' }, { status: 404 });
    }

    const key = generateApiKey();

    const apiKey = await prisma.apiKey.create({
      data: {
        key,
        userId: user.walletAddress, // Securely obtained from DB, not Body
        plan: 'whale', // Default to whale for early access
      }
    });

    return NextResponse.json({ apiKey });
  } catch (error) {
    console.error('Create API Key Error:', error);
    return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user) {
         return NextResponse.json({ keys: [] });
    }

    const keys = await prisma.apiKey.findMany({
      where: { userId: user.walletAddress, isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ keys });
  } catch (error) {
      console.error('List API Keys Error:', error);
      return NextResponse.json({ error: 'Failed to list keys' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { id } = await req.json();

        // Ensure the API key belongs to the user
        const apiKey = await prisma.apiKey.findUnique({ where: { id } });
        if (!apiKey || apiKey.userId !== user.walletAddress) {
            return NextResponse.json({ error: 'API Key not found or forbidden' }, { status: 403 });
        }

        await prisma.apiKey.update({
            where: { id },
            data: { isActive: false }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to revoke key' }, { status: 500 });
    }
}

