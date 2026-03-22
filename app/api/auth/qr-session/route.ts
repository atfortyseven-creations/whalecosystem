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
        const data = JSON.parse(val);
        if (data.address) {
            // Authing the session via cookie
            const cookieStore = await cookies();
            cookieStore.set('human_session', data.address, {
                httpOnly: false, // The frontend might need to verify
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24 * 7 // 7 days
            });
            
            // Delete the consumed token
            await safeRedisSet(`qr:${id}`, 'CONSUMED', 'EX', 10);
            return NextResponse.json({ status: 'complete', address: data.address });
        }
    } catch (e) {
        return NextResponse.json({ status: 'error', message: 'Payload invalid' }, { status: 500 });
    }
    
    return NextResponse.json({ status: 'pending' });
}
