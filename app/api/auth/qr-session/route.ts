import { NextResponse } from 'next/server';
import { safeRedisGet, safeRedisSet } from '@/lib/redis/client';
import { cookies } from 'next/headers';

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
    
    if (!val) {
        return NextResponse.json({ status: 'expired' });
    }
    
    if (val === 'PENDING') {
        return NextResponse.json({ status: 'pending' });
    }

    try {
        const valStr = val as string;
        if (valStr.startsWith('{')) {
            const data = JSON.parse(valStr);
            if (data.address) {
                // [SESSION] Establish verified handshake cookie on the PC browser
                const cookieStore = await cookies();
                cookieStore.set('sovereign_handshake', data.address, {
                    maxAge: 30 * 24 * 60 * 60, // Extend to 30 days for institutional persistence
                    path: '/',
                    secure: true, // Always secure for institutional protocol
                    sameSite: 'lax', // Lax for better compatibility with wallet redirects
                    httpOnly: false // Accessible by client-side hooks
                });

                // Delete the consumed token from Redis
                await safeRedisSet(`qr:${id}`, 'CONSUMED', 'EX', 10);
                return NextResponse.json({ status: 'complete', address: data.address });
            }
        }
    } catch (e) {
        console.error('[QR_SESSION_PARSE_ERROR]', e);
        return NextResponse.json({ status: 'error', message: 'Payload invalid' }, { status: 500 });
    }
    
    return NextResponse.json({ status: 'pending' });
}
