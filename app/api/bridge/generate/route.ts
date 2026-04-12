import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import crypto from 'crypto';
import { safeRedisGet, safeRedisSet } from '@/lib/redis/client';

const TOKEN_EXPIRY_S = 5 * 60; // 5 minutes in seconds

// POST /api/bridge/generate — PC generates a short-lived QR token
export async function POST(request: NextRequest) {
    try {
        let sessionId: string;
        try {
            const { userId } = await auth();
            sessionId = userId ?? request.headers.get('x-session-id') ?? `anon-${crypto.randomBytes(8).toString('hex')}`;
        } catch {
            sessionId = request.headers.get('x-session-id') ?? `anon-${crypto.randomBytes(8).toString('hex')}`;
        }

        const token = crypto.randomBytes(32).toString('hex');
        
        // Use Redis for cross-replica and restart persistence
        await safeRedisSet(`bridge:token:${token}`, sessionId, 'EX', TOKEN_EXPIRY_S);

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.humanidfi.com';
        const linkUrl = `${baseUrl}/bridge?token=${token}`;

        return NextResponse.json({
            token,
            linkUrl,
            expiresAt: new Date(Date.now() + TOKEN_EXPIRY_S * 1000).toISOString(),
            sessionId,
        });
    } catch (err) {
        console.error('[Bridge/POST]', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// GET /api/bridge/generate?token=xxx — Mobile validates scanned token
export async function GET(request: NextRequest) {
    try {
        const token = request.nextUrl.searchParams.get('token');
        if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 });

        const sessionId = await safeRedisGet(`bridge:token:${token}`);

        if (!sessionId || sessionId === 'TIMEOUT') {
            return NextResponse.json({ 
                valid: false, 
                error: sessionId === 'TIMEOUT' ? 'Bridge temporary unavailable' : 'Token not found or expired.' 
            }, { status: sessionId === 'TIMEOUT' ? 503 : 404 });
        }

        // Return validity. Note: We keep the token for the duration of the 5m window 
        // to allow for re-scans if mobile page reloads, rather than strict one-time use
        // which can be brittle on spotty mobile connections.

        return NextResponse.json({
            valid: true,
            sessionId,
            message: 'Bridge established! Your mobile is now linked to this PC session.',
        });
    } catch (err) {
        console.error('[Bridge/GET]', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
