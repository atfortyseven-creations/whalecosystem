import { NextRequest, NextResponse } from 'next/server';
import { withApiAuth, withRateLimitHeaders } from '@/lib/middleware/apiAuth';
import { isTokenAllowed } from '@/lib/saas/plans';
import { PlanTier } from '@prisma/client';

export async function GET(request: NextRequest) {
    // True enables HMAC signature enforcement if the user's tier requires it
    const access = await withApiAuth(request, true);
    if (access.error) return access.error;

    const { tier, rateLimit } = access.auth!;

    // 1. Parse Query Params
    const url = new URL(request.url);
    const symbol = url.searchParams.get('symbol') || 'BTC';
    const resolution = url.searchParams.get('resolution') || '1d';

    // 2. Validate Token Access Based on Tier
    if (!isTokenAllowed(tier as PlanTier, symbol)) {
        const response = NextResponse.json(
             { error: `Access to token ${symbol} is not included in the ${tier} plan.` },
             { status: 403 }
        );
        return withRateLimitHeaders(response, access.auth!);
    }

    // 3. Mock Data Payload (In prod, fetch from TimescaleDB/ClickHouse)
    const mockData = {
        symbol,
        resolution,
        timestamp: Date.now(),
        provider: 'HumanDeFi Elite Engine',
        tier,
        data: [
            { time: Date.now() - 86400000, open: 65000, high: 66000, low: 64000, close: 65500, volume: 1500 }
        ]
    };

    // 4. Return with Rate Limit Headers injected
    const response = NextResponse.json(mockData);
    return withRateLimitHeaders(response, access.auth!);
}

