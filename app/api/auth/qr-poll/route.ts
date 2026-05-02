import { NextRequest, NextResponse } from 'next/server';
import { safeRedisGet } from '@/lib/redis/client';

export async function GET(req: NextRequest) {
  const uuid = req.nextUrl.searchParams.get('uuid');
  if (!uuid) return NextResponse.json({ error: 'Missing uuid' }, { status: 400 });
  
  const data = await safeRedisGet(`qr-session:${uuid}`);
  if (!data) return NextResponse.json({ pending: true });
  
  return NextResponse.json(JSON.parse(data));
}
