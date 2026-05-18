import { NextRequest, NextResponse } from 'next/server';
import { safeRedisGet } from '@/lib/redis/client';

export async function GET(request: NextRequest) {
    try {
        const token = request.nextUrl.searchParams.get('token');
        if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 });

        const status = await safeRedisGet(`bridge:status:${token}`);
        
        return NextResponse.json({
            linked: status === 'linked'
        });
    } catch (err) {
        console.error('[Bridge/Status]', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
