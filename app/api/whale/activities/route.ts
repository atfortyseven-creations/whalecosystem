import { NextRequest, NextResponse } from 'next/server';
import { Alchemy, Network, AssetTransfersCategory, SortingOrder } from 'alchemy-sdk';
import { prisma } from '@/lib/prisma';
import rateLimit from '@/lib/rate-limit';
import { withCache, CacheTTL } from '@/src/lib/cache/redis-cache';
import { formatErrorResponse } from '@/src/lib/errors/error-handler';

// Global rate limiter (server-side per instance)
const limiter = rateLimit({
    interval: 60 * 1000, // 60 seconds
    uniqueTokenPerInterval: 500, // Max 500 users per second
});

// Configure Alchemy with GetBlock RPC
const config = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_ID || process.env.ALCHEMY_API_KEY,
  network: Network.BASE_MAINNET,
  url: process.env.BASE_RPC_URL || undefined,
};

// HACK: Fix for Alchemy SDK "Referrer 'client' is not a valid URL" in Next.js Server
const originalFetch = global.fetch;
global.fetch = (url, init) => {
    if (init && init.referrer === 'client') {
        delete init.referrer;
    }
    return originalFetch(url, init);
};

const alchemyBase = new Alchemy({ ...config, network: Network.BASE_MAINNET });
const alchemyEth = new Alchemy({ ...config, network: Network.ETH_MAINNET });
const alchemyPoly = new Alchemy({ ...config, network: Network.MATIC_MAINNET });

const KNOWN_WHALES: Record<string, string> = {
  '0x28C6c06298d514Db089934071355E5743bf21d60': 'Binance Hot Wallet',
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb': 'Coinbase',
  '0x833589f CD6eDb6E08f4c7C32D4f71b54bdA02913': 'USDC Contract',
};

export async function GET(req: NextRequest) {
  try {
    // [SECURITY] Apply Rate Limiting
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    try {
        await limiter.check(20, ip); // 20 requests per minute per IP
    } catch {
        return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // Fetch from cache or database
    const cacheKey = 'whale:activities:recent';
    
    const activitiesData = await withCache(
      cacheKey,
      async () => {
        // [PRODUCTION] Fetch from database (where the telegram bot saves signals)
        // Wrapped in try-catch to allow API to survive DB hiccups
        let activities: any[] = [];
        try {
            activities = await prisma.whaleActivity.findMany({
                orderBy: { timestamp: 'desc' },
                take: 30, // Last 30 whales
            });
        } catch (dbError) {
            console.error('[API RESILIENCE] Database fetch failed for whales:', dbError);
            // Return empty array if DB is down, we have cache anyway if it was previously successful
            activities = [];
        }

        const processedActivities = activities.map((tx: any) => ({
            id: tx.transactionHash,
            walletAddress: tx.walletAddress,
            walletLabel: KNOWN_WHALES[tx.walletAddress] || `${tx.walletAddress.slice(0, 6)}...${tx.walletAddress.slice(-4)}`,
            type: tx.type || 'TRANSFER',
            token: tx.token,
            amount: Number(tx.amount),
            usdValue: Number(tx.usdValue),
            timestamp: tx.timestamp,
            txHash: tx.transactionHash,
            chain: tx.token === 'BTC' ? 'bitcoin' : (tx.transactionHash.startsWith('0x') ? 'base' : 'ethereum')
        }));

        return {
          activities: processedActivities,
          timestamp: Date.now(),
        };
      },
      { ttl: CacheTTL.WHALE_ACTIVITY }
    );

    return NextResponse.json(activitiesData);
  } catch (error: any) {
    console.error('[API ERROR] Whale activities:', error);
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(
      errorResponse,
      { status: errorResponse.statusCode }
    );
  }
}

