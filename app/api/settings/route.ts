import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const address = req.nextUrl.searchParams.get('address')?.toLowerCase();
    if (!address) {
      return NextResponse.json({ error: 'Address required' }, { status: 400 });
    }

    let user = null;
    try {
        user = await prisma.user.findUnique({
          where: { walletAddress: address },
          select: {
              theme: true,
              currency: true,
              language: true,
              showBalances: true,
              allowAnalytics: true,
              testnetMode: true,
          }
        });
    } catch {
        // Fallback for schema mismatches during live deployments
        user = await prisma.user.findUnique({
            where: { walletAddress: address },
            select: {
                theme: true,
                currency: true,
                language: true,
            }
        });
    }

    if (!user) {
      return NextResponse.json({ error: 'User settings not found' }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('[Settings GET Error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { walletAddress, theme, currency, language, showBalances, allowAnalytics, testnetMode } = body;

    if (!walletAddress) {
      return NextResponse.json({ error: 'walletAddress required' }, { status: 400 });
    }

    const address = walletAddress.toLowerCase();

    // Create or update the user settings
    let updated = null;
    try {
        updated = await prisma.user.upsert({
          where: { walletAddress: address },
          update: {
            theme, currency, language, showBalances, allowAnalytics, testnetMode
          },
          create: {
            walletAddress: address,
            theme: theme || 'light',
            currency: currency || 'USD',
            language: language || 'es-ES',
            showBalances: showBalances !== undefined ? showBalances : true,
            allowAnalytics: allowAnalytics !== undefined ? allowAnalytics : true,
            testnetMode: testnetMode !== undefined ? testnetMode : false,
          }
        });
    } catch {
        // Fallback: update only original schema columns
        updated = await prisma.user.upsert({
          where: { walletAddress: address },
          update: {
            theme, currency, language
          },
          create: {
            walletAddress: address,
            theme: theme || 'light',
            currency: currency || 'USD',
            language: language || 'es-ES',
          }
        });
    }

    return NextResponse.json({ success: true, settings: updated }, { status: 200 });

  } catch (error) {
    console.error('[Settings POST Error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
