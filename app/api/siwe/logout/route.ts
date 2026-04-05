import { NextResponse } from 'next/server';

export async function GET() {
    const res = NextResponse.json({ ok: true });
    
    // Clear cookies securely
    res.cookies.delete('siwe-nonce');
    res.cookies.delete('human.session-token');
    res.cookies.delete('wallet-auth');
    
    return res;
}
