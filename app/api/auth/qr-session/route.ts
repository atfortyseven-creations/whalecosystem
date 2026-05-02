import { NextResponse } from 'next/server';
import { safeRedisGet, safeRedisSet, redisClient } from '@/lib/redis/client';
import { verifyMessage } from 'viem';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
        try {
            const body = await request.json();
            if (body && body.address) {
                // ── Path A: Full EIP-191 signature provided → verify cryptographically ──
                if (body.signature && body.message) {
                    try {
                        const isValid = await verifyMessage({
                            address: body.address as `0x${string}`,
                            message: body.message,
                            signature: body.signature as `0x${string}`
                        });
                        if (!isValid) throw new Error("Invalid signature");
                    } catch(e) {
                        return NextResponse.json({ error: 'Signature verification failed' }, { status: 401 });
                    }
                } else {
                    // ── Path B: No signature → validate via sovereign_handshake cookie ──
                    // The user already completed EIP-191 auth during establishSession().
                    // The cookie proves their identity without requiring a second wallet popup.
                    const cookieHeader = request.headers.get('cookie') || '';
                    const cookieMatch = cookieHeader.match(/sovereign_handshake=(0x[0-9a-fA-F]{40,})/i);
                    const cookieAddress = cookieMatch?.[1]?.toLowerCase();
                    if (!cookieAddress || cookieAddress !== body.address.toLowerCase()) {
                        return NextResponse.json({ error: 'Unauthorized: no valid session cookie' }, { status: 401 });
                    }
                }

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
