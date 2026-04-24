import { NextResponse } from 'next/server';
import { safeRedisGet, safeRedisSet, redisClient } from '@/lib/redis/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
        try {
            const body = await request.json();
            if (body && body.address) {
                await safeRedisSet(`qr:${id}`, JSON.stringify({ 
                    status: 'SUCCESS', 
                    address: body.address 
                }), 'EX', 120);

                // Publish to the mesh bus so the SSE stream picks it up
                if (redisClient && typeof redisClient.publish === 'function') {
                    await redisClient.publish('sovereign_mesh_auth_bus', JSON.stringify({
                        socketId: id,
                        address: body.address,
                        timestamp: Date.now()
                    })).catch((err: any) => console.error('[MESH:PUBLISH_ERROR]', err));
                }

                return NextResponse.json({ success: true });
            }
        } catch (e) {
            console.error('[QR_SESSION_FULFILL_ERROR]', e);
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }
    }

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
    
    // Create base response headers for Absolute Zero-Cache
    const headers = new Headers();
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');

    // ─── INSTITUTIONAL RESILIENCE ───────────────────────────────────────────
    if (val === 'TIMEOUT') {
        return NextResponse.json({ status: 'waiting' }, { headers });
    }

    if (!val) {
        return NextResponse.json({ status: 'expired' }, { headers });
    }

    if (val === 'PENDING') {
        return NextResponse.json({ status: 'pending' }, { headers });
    }

    try {
        const valStr = val as string;
        let data: any = null;
        
        if (valStr.startsWith('{')) {
            data = JSON.parse(valStr);
        }

        // If data is available, it means the handshake was successful (either fresh or locked)
        if (data && data.address) {
            // Institutional State Lock: Instead of 'CONSUMED' (which loses data), we 
            // maintain the 'LOCKED_RESULT' state for 120s to ensure the client reloads successfully.
            if (data.status !== 'LOCKED_RESULT') {
                await safeRedisSet(`qr:${id}`, JSON.stringify({ 
                    ...data, 
                    status: 'LOCKED_RESULT' 
                }), 'EX', 120);
            }

            const response = NextResponse.json(
                { status: 'complete', address: data.address },
                { status: 200, headers }
            );

            // ─── ABSOLUTE PERSISTENCE ──────────────────────────────────────
            response.cookies.set('sovereign_handshake', data.address, {
                path: '/',
                maxAge: 604800,
                sameSite: 'lax',
            });

            return response;
        }
    } catch (e) {
        console.error('[QR_SESSION_PARSE_ERROR]', e);
        return NextResponse.json({ status: 'error', message: 'Payload invalid' }, { status: 500, headers });
    }

    return NextResponse.json({ status: 'pending' }, { headers });
}
