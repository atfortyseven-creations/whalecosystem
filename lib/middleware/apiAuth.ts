import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../prisma';
import { RedisRateLimiter } from '../redis/rate-limiter';
import { SAAS_PLANS } from '../saas/plans';
import * as crypto from 'crypto';

export interface ApiAuthResult {
  userId: string;
  tier: string;
  keyId: string;
  rateLimit: {
    limit: number;
    remaining: number;
    current: number;
  };
}

/**
 * Universal Access Control Middleware for SaaS API Endpoints
 * 1. API Key Auth
 * 2. IP Whitelisting (Pro/Elite)
 * 3. HMAC Signature Validation (Pro/Elite)
 * 4. Redis Sliding Window Rate Limiting (FREE, STD: 5k, STR: 10k, PRO: 500k, INST: ∞)
 */
export async function withApiAuth(
  req: NextRequest, 
  validateHmac: boolean = false
): Promise<{ auth?: ApiAuthResult; error?: NextResponse }> {
  const apiKeyHdr = req.headers.get('x-api-key');

  if (!apiKeyHdr) {
    return { error: NextResponse.json({ error: 'Missing x-api-key header' }, { status: 401 }) };
  }

  // 1. Fetch Key and User Tier (We cache this in Redis in a real prod env)
  const apiKeyRecord = await prisma.apiKey.findUnique({
    where: { key: apiKeyHdr },
    include: {
      user: {
        include: { subscriptions: true }
      }
    }
  });

  if (!apiKeyRecord || !apiKeyRecord.isActive) {
    return { error: NextResponse.json({ error: 'Invalid or inactive API key' }, { status: 401 }) };
  }

  const activeSub = apiKeyRecord.user.subscriptions.find(s => s.status === 'ACTIVE');
  const userTier = activeSub ? activeSub.tier : 'FREE';
  const planConfig = SAAS_PLANS[userTier];

  // 2. IP Whitelisting Validation (If enabled on Key)
  if (apiKeyRecord.ipWhitelist.length > 0) {
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    // Naive check. In prod, we parse CIDR blocks.
    if (!apiKeyRecord.ipWhitelist.includes(clientIp) && clientIp !== '::1' && clientIp !== '127.0.0.1') {
      return { error: NextResponse.json({ error: 'IP Address not whitelisted for this API Key' }, { status: 403 }) };
    }
  }

  // 3. HMAC Signature Validation (Strict requirement for advanced features)
  if (validateHmac && planConfig.features.hmacRequired) {
    const signature = req.headers.get('x-hmac-signature');
    const timestamp = req.headers.get('x-timestamp');
    
    if (!signature || !timestamp) {
       return { error: NextResponse.json({ error: 'Missing HMAC signature or timestamp headers' }, { status: 401 }) };
    }

    // Protect against replay attacks (5 minute window)
    const timeDiff = Math.abs(Date.now() - parseInt(timestamp));
    if (timeDiff > 300000) {
        return { error: NextResponse.json({ error: 'Request timestamp is outside of acceptable window (5m)' }, { status: 401 }) };
    }

    if (!apiKeyRecord.hmacSecret) {
        return { error: NextResponse.json({ error: 'HMAC Secret not configured for this API Key. Please rotate your key in the dashboard.' }, { status: 403 }) };
    }

    // Verify signature (Method + URL path + Timestamp + Body if any)
    const rawBody = await req.clone().text();
    const url = new URL(req.url);
    const payload = `${req.method}\n${url.pathname}\n${timestamp}\n${rawBody}`;
    
    const expectedSig = crypto
        .createHmac('sha256', apiKeyRecord.hmacSecret)
        .update(payload)
        .digest('hex');

    if (signature !== expectedSig) {
        return { error: NextResponse.json({ error: 'Invalid HMAC signature' }, { status: 401 }) };
    }
  }

  // 4. Rate Limiting via Redis
  const rateLimitResult = await RedisRateLimiter.check(apiKeyRecord.id, userTier);

  // Background async tracking: record usage stat
  // (In a real high-freq system, we buffer these to ClickHouse, not Postgres directly on every req)
  prisma.apiKey.update({
    where: { id: apiKeyRecord.id },
    data: { lastUsedAt: new Date() }
  }).catch(() => {});

  if (!rateLimitResult.success) {
    return { 
      error: NextResponse.json(
        { error: `Rate limit exceeded for tier ${userTier}. Limit is ${rateLimitResult.limit} requests per day.` }, 
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'Retry-After': '86400' // Simple 24h reset
          }
        }
      ) 
    };
  }

  return {
    auth: {
      userId: apiKeyRecord.userId,
      tier: userTier,
      keyId: apiKeyRecord.id,
      rateLimit: {
        limit: rateLimitResult.limit,
        remaining: rateLimitResult.remaining,
        current: rateLimitResult.current
      }
    }
  };
}

/**
 * Helper to attach Rate Limit headers to a successful response
 */
export function withRateLimitHeaders(response: NextResponse, authInfo: ApiAuthResult) {
    response.headers.set('X-RateLimit-Limit', authInfo.rateLimit.limit.toString());
    response.headers.set('X-RateLimit-Remaining', authInfo.rateLimit.remaining.toString());
    response.headers.set('X-RateLimit-Used', authInfo.rateLimit.current.toString());
    return response;
}

