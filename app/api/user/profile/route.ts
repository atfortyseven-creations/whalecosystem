import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateProfileSchema = z.object({
  walletAddress: z.string().min(10),
  displayName: z.string().max(50).optional(),
  avatarUrl: z.string().url().max(500).optional().or(z.literal('')),
  bio: z.string().max(250).optional().or(z.literal('')),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json({ error: 'walletAddress required' }, { status: 400 });
    }

    const user = await (prisma as any).user.findUnique({
      where: { walletAddress },
      select: {
        id: true,
        walletAddress: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        isPro: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    console.error('[API] GET User Profile Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const result = updateProfileSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: result.error.format() },
        { status: 400 }
      );
    }

    const { walletAddress, displayName, avatarUrl, bio } = result.data;

    // Upsert to ensure user exists
    const user = await (prisma as any).user.upsert({
      where: { walletAddress },
      update: {
        ...(displayName !== undefined && { displayName }),
        ...(avatarUrl !== undefined && { avatarUrl: avatarUrl === '' ? null : avatarUrl }),
        ...(bio !== undefined && { bio: bio === '' ? null : bio }),
      },
      create: {
        walletAddress,
        displayName: displayName || 'Sovereign User',
        avatarUrl: avatarUrl === '' ? null : avatarUrl,
        bio: bio === '' ? null : bio,
      }
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    console.error('[API] PUT User Profile Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
