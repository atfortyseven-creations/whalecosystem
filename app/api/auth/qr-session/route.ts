import { NextResponse } from 'next/server';
import { safeRedisGet, safeRedisSet } from '@/lib/redis/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST() {
    const sessionId = crypto.randomUUID();
    // Valid for 5 minutes
    await safeRedisSet(`qr:${sessionId}`, 'PENDING', 'EX', 300);
    return NextResponse.json({ sessionId });
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Missing Session ID' }, { status: 400 });
    }

    const val = await safeRedisGet(`qr:${id}`);
    
    // ─── INSTITUTIONAL RESILIENCE ───────────────────────────────────────────
    // If Redis timed out, do NOT tell the client 'expired'. Tell them 'waiting'
    // so they maintain the current QR instead of refreshing it inappropriately.
    if (val === 'TIMEOUT') {
        return NextResponse.json({ status: 'waiting' });
    }

    if (!val) {
        return NextResponse.json({ status: 'expired' });
    }

    if (val === 'PENDING') {
        return NextResponse.json({ status: 'pending' });
    }

    // Already consumed (rapid double-poll) — still report complete to unblock the desktop gate
    if (val === 'CONSUMED') {
        return NextResponse.json({ status: 'complete' });
    }

    try {
        const valStr = val as string;
        if (valStr.startsWith('{')) {
            const data = JSON.parse(valStr);
            if (data.address) {
                // Mark consumed immediately — prevents race condition on concurrent polls
                await safeRedisSet(`qr:${id}`, 'CONSUMED', 'EX', 60);

                // ─── CRITICAL FIX ───────────────────────────────────────────────
                // cookies().set() from 'next/headers' does NOT work inside a GET
                // Route Handler in Next.js App Router — it throws "Cookies can only
                // be modified in a Server Action or Route Handler" at runtime.
                // The correct approach for any Route Handler verb is to use
                // NextResponse with the Set-Cookie header directly.
                // ────────────────────────────────────────────────────────────────
                const THIRTY_DAYS_S = 30 * 24 * 60 * 60;
                const response = NextResponse.json(
                    { status: 'complete', address: data.address },
                    {
                        headers: {
                            'Set-Cookie': [
                                `sovereign_handshake=${data.address}`,
                                'Path=/',
                                `Max-Age=${THIRTY_DAYS_S}`,
                                'SameSite=Lax',
                                // Intentionally NOT HttpOnly — the client gate reads
                                // document.cookie to detect an existing handshake.
                            ].join('; '),
                        },
                    }
                );

                console.log(`[QR_SESSION:Complete] Token consumed, cookie set for ${data.address}`);
                return response;
            }
        }
    } catch (e) {
        console.error('[QR_SESSION_PARSE_ERROR]', e);
        return NextResponse.json({ status: 'error', message: 'Payload invalid' }, { status: 500 });
    }

    // Unexpected state — treat as still pending
    return NextResponse.json({ status: 'pending' });
}
