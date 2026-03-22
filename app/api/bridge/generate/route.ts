import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import crypto from 'crypto';

const TOKEN_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

// In-memory token store — works on Railway single-replica
// Key: token, Value: { sessionId, expiresAt }
const tokenStore = new Map<string, { sessionId: string; expiresAt: number }>();

// Clean expired tokens periodically
setInterval(() => {
    const now = Date.now();
    for (const [token, entry] of tokenStore) {
        if (entry.expiresAt < now) tokenStore.delete(token);
    }
}, 60_000);

// POST /api/bridge/generate — PC generates a short-lived QR token
// Works with or without Clerk session (uses sessionId fallback)
export async function POST(request: NextRequest) {
    try {
        // Try Clerk first
        let sessionId: string;
        try {
            const { userId } = await auth();
            sessionId = userId ?? request.headers.get('x-session-id') ?? `anon-${crypto.randomBytes(8).toString('hex')}`;
        } catch {
            sessionId = request.headers.get('x-session-id') ?? `anon-${crypto.randomBytes(8).toString('hex')}`;
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = Date.now() + TOKEN_EXPIRY_MS;

        tokenStore.set(token, { sessionId, expiresAt });

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.humanidfi.com';
        const linkUrl = `${baseUrl}/bridge?token=${token}`;

        return NextResponse.json({
            token,
            linkUrl,
            expiresAt: new Date(expiresAt).toISOString(),
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

        const entry = tokenStore.get(token);

        if (!entry) {
            return NextResponse.json({ valid: false, error: 'Token not found or already used.' }, { status: 404 });
        }

        if (entry.expiresAt < Date.now()) {
            tokenStore.delete(token);
            return NextResponse.json({ valid: false, error: 'Token expired. Generate a new QR on your PC.' }, { status: 410 });
        }

        // Token is valid — mark as used (one-time use)
        tokenStore.delete(token);

        return NextResponse.json({
            valid: true,
            sessionId: entry.sessionId,
            message: 'Bridge established! Your mobile is now linked to this PC session.',
        });
    } catch (err) {
        console.error('[Bridge/GET]', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
