import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

// Gamification API - XP and Levels
// ZERO-MOCK MANDATE: XP data must come from real DB once gamification schema is implemented.
// For now gate the endpoint with the session check and return 501 for unimplemented reads.

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // PENDING: XP and level data will be sourced from GamificationRecord model
    // once the schema is finalized and GetBlock event-sourcing is integrated.
    return NextResponse.json({
      error: 'GAMIFICATION_NOT_IMPLEMENTED',
      message: 'XP and level data pending on-chain event sourcing integration.'
    }, { status: 501 });

  } catch (error) {
    console.error('[API ERROR] Gamification data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      error: 'GAMIFICATION_NOT_IMPLEMENTED',
      message: 'XP award logic pending on-chain event sourcing integration.'
    }, { status: 501 });

  } catch (error) {
    console.error('[API ERROR] Award XP:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
