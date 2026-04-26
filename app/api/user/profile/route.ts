import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateProfileSchema = z.object({
  walletAddress: z.string().min(10),
  displayName: z.string().max(50).optional(),
  avatarUrl: z.string().max(500).optional().or(z.literal('')),
  bio: z.string().max(250).optional().or(z.literal('')),
  theme: z.string().optional(),
  currency: z.string().optional(),
  language: z.string().optional(),
  displayUnit: z.string().optional(),
  gasPreset: z.string().optional(),
  mevProtection: z.boolean().optional(),
  stealthMode: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const walletAddress = searchParams.get('walletAddress');
    if (!walletAddress) return NextResponse.json({ error: 'walletAddress required' }, { status: 400 });

    // Try extended schema first, fall back to base columns
    let user: any = null;
    try {
      user = await (prisma as any).user.findUnique({
        where: { walletAddress },
        select: { 
          id: true, walletAddress: true, displayName: true, avatarUrl: true, bio: true, isPro: true, tier: true,
          theme: true, currency: true, language: true, displayUnit: true, gasPreset: true, mevProtection: true, stealthMode: true
        }
      });
    } catch {
      // Extended columns not yet in DB — use base
      user = await prisma.user.findUnique({
        where: { walletAddress },
        select: { id: true, walletAddress: true }
      });
      if (user) user = { ...user, displayName: null, avatarUrl: null, bio: null, isPro: false, tier: 'basic' };
    }

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
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
    if (!result.success) return NextResponse.json({ error: 'Invalid payload', details: result.error.format() }, { status: 400 });

    const { walletAddress, displayName, avatarUrl, bio, theme, currency, language, displayUnit, gasPreset, mevProtection, stealthMode } = result.data;

    // Try full upsert with all profile columns
    try {
      const user = await (prisma as any).user.upsert({
        where:  { walletAddress },
        update: {
          ...(displayName !== undefined && { displayName }),
          ...(avatarUrl !== undefined && { avatarUrl: avatarUrl === '' ? null : avatarUrl }),
          ...(bio !== undefined && { bio: bio === '' ? null : bio }),
          ...(theme !== undefined && { theme }),
          ...(currency !== undefined && { currency }),
          ...(language !== undefined && { language }),
          ...(displayUnit !== undefined && { displayUnit }),
          ...(gasPreset !== undefined && { gasPreset }),
          ...(mevProtection !== undefined && { mevProtection }),
          ...(stealthMode !== undefined && { stealthMode }),
        },
        create: {
          walletAddress,
          displayName: displayName || null,
          avatarUrl: avatarUrl === '' ? null : (avatarUrl || null),
          bio: bio === '' ? null : (bio || null),
          theme: theme || "light",
          currency: currency || "USD",
          language: language || "en-US",
          displayUnit: displayUnit || "FIAT",
          gasPreset: gasPreset || "STANDARD",
          mevProtection: mevProtection ?? false,
          stealthMode: stealthMode ?? false,
        }
      });
      return NextResponse.json({ success: true, data: user });
    } catch {
      // Extended columns don't exist yet — minimal fallback (walletAddress only)
      const fallbackUser = await prisma.user.upsert({
        where:  { walletAddress },
        update: {},
        create: { walletAddress }
      });
      return NextResponse.json({ success: true, data: fallbackUser, warning: 'Profile columns not yet in DB — run /api/admin/sync-db' });
    }
  } catch (error: any) {
    console.error('[API] PUT User Profile Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
