import { NextRequest, NextResponse } from 'next/server';
import { safeRedisSet, safeRedisGet } from '@/lib/redis/client';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    
    // Distributed Strict Rate Limiting (Anti-DDoS via Redis)
    const rlKey = `kyc-rate-limit:${ip}`;
    const lastRequestStr = await safeRedisGet(rlKey);
    const now = Date.now();
    
    if (lastRequestStr) {
      const lastRequest = parseInt(lastRequestStr, 10);
      if (now - lastRequest < 1000) {
        return NextResponse.json({ error: 'Too Many Requests. Core Defense Activated.' }, { status: 429 });
      }
    }
    
    // TTL 2s to automatically clear the rate limit key
    await safeRedisSet(rlKey, now.toString(), 'EX', 2);

    const { uuid, encryptedPayload } = await req.json();
    
    if (!uuid || !encryptedPayload) {
      return NextResponse.json({ error: 'Malformed payload. Sovereign node rejected.' }, { status: 400 });
    }

    // Check if session already exists and is success to prevent overwrite replay attacks
    const existing = await safeRedisGet(`kyc-session:${uuid}`);
    if (existing && existing !== 'PENDING') {
      return NextResponse.json({ error: 'Session immutable.' }, { status: 403 });
    }

    // TTL 120s (EX 120) strictly enforced at DB level
    await safeRedisSet(`kyc-session:${uuid}`, encryptedPayload, 'EX', 120);

    return NextResponse.json({ success: true, timestamp: Date.now() });

  } catch (error: any) {
    console.error('[KYC-QR-SESSION] Mutation Fault:', error);
    return NextResponse.json({ error: 'Internal Cryptographic Fault' }, { status: 500 });
  }
}
