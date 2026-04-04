import { NextResponse } from 'next/server';

export const revalidate = 0;

export async function GET() {
    try {
        const res = await fetch('https://api.binance.com/api/v3/ticker/24hr', { cache: 'no-store' });
        if (res.ok) {
            const data = await res.json();
            return NextResponse.json({ success: true, data });
        }
    } catch {}
    return NextResponse.json({ success: false }, { status: 500 });
}
