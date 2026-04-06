import { generateNonce } from 'siwe';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  const nonce = generateNonce(); // Cryptographically secure nonce (8+ chars)

  const res = new NextResponse(nonce, {
    status: 200,
    headers: { 'Content-Type': 'text/plain' },
  });

  // Store nonce in HTTP-only cookie (secure, per-request, short TTL)
  res.cookies.set('siwe-nonce', nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 10, // 10 minutes — nonce expires after one use window
  });

  return res;
}
