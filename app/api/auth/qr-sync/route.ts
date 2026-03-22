import { NextResponse } from 'next/server';
import { safeRedisGet, safeRedisSet } from '@/lib/redis/client';

export async function POST(req: Request) {
    try {
        const { token, address } = await req.json();
        
        if (!token || !address) {
            return new NextResponse('Missing parameters', { status: 400 });
        }

        const status = await safeRedisGet(`qr:${token}`);
        if (!status) {
            return new NextResponse('Sync session expired or invalid', { status: 404 });
        }

        if (status !== 'PENDING') {
            return new NextResponse('Session already consumed or processed', { status: 400 });
        }

        // Store the verified mobile address into the session UUID for the desktop to consume
        await safeRedisSet(`qr:${token}`, JSON.stringify({ address, syncedAt: Date.now() }), 'EX', 300);

        return new NextResponse('OK', { status: 200 });
    } catch (e: any) {
        console.error('[QR_SYNC_FATAL]', e);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
