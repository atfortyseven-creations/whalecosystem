import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    // ── Priority 1: Sovereign JWT session (human_session cookie) ────────────
    const humanSession = request.cookies.get('human_session')?.value;
    if (humanSession) {
      try {
        const payload = await verifyJWT(humanSession);
        const walletAddress = (payload.address || payload.sub) as string | undefined;
        if (walletAddress) {
          const user = await prisma.user.findUnique({
            where: { walletAddress: walletAddress.toLowerCase() },
            select: { walletAddress: true, tier: true, humanityScore: true, createdAt: true },
          });
          return NextResponse.json({
            authenticated: true,
            user: {
              id: walletAddress,
              email: '',
              tier: user?.tier || (payload.tier as string) || 'FREE',
              humanityScore: user?.humanityScore || 0,
              walletAddress: walletAddress.toLowerCase(),
            },
          });
        }
      } catch {
        // JWT expired or invalid — fall through
      }
    }

    // ── Priority 2: sovereign_handshake cookie (raw wallet address) ─────────
    const handshake = request.cookies.get('sovereign_handshake')?.value;
    if (handshake && /^0x[a-fA-F0-9]{40}$/.test(handshake)) {
      const user = await prisma.user.findUnique({
        where: { walletAddress: handshake.toLowerCase() },
        select: { walletAddress: true, tier: true, humanityScore: true, createdAt: true },
      });
      return NextResponse.json({
        authenticated: !!user,
        user: user
          ? { id: handshake, email: '', tier: user.tier, humanityScore: user.humanityScore, walletAddress: user.walletAddress }
          : null,
      });
    }

    return NextResponse.json({ authenticated: false, user: null });
  } catch (error) {
    console.error('[Session API] Error:', error);
    return NextResponse.json({ authenticated: false, user: null });
  }
}

