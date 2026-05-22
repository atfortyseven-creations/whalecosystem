import { NextResponse } from 'next/server';

export async function GET() {
  const res = NextResponse.json({ ok: true, message: 'System session terminated.' });

  // Clear all SIWE/session cookies
  const cookiesToClear = [
    'siwe-nonce',
    'human_session',
    'human.session-token',
    'wallet-auth',
    'system_handshake',
    'wallet-auth',
  ];

  for (const name of cookiesToClear) {
    res.cookies.set(name, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0, // Immediate expiry
    });
  }

  return res;
}
