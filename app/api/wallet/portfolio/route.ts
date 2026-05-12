import { NextRequest, NextResponse } from 'next/server';
import { portfolioService } from '@/lib/blockchain/PortfolioService';
import { ChainId } from '@/lib/blockchain/BlockchainService';

/** Safe serializer — avoids JSON.stringify crash on BigInt values */
function safeSerialize(data: unknown): string {
  return JSON.stringify(data, (_, v) =>
    typeof v === 'bigint' ? v.toString() : v
  );
}

/**
 * GET /api/wallet/portfolio
 * Fetches multi-chain portfolio with BigInt-safe serialization and a hard
 * global timeout that guarantees a response within 12 seconds.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'Address required' }, { status: 400 });
  }

  const requestedChains = searchParams.get('chainIds')
    ?.split(',')
    .map(id => parseInt(id))
    .filter(id => !isNaN(id));

  const chains = (requestedChains && requestedChains.length > 0
    ? requestedChains
    : [
        ChainId.MAINNET, ChainId.POLYGON, ChainId.BASE,
        ChainId.ARBITRUM, ChainId.OPTIMISM, ChainId.AVALANCHE,
        ChainId.BSC, ChainId.WORLDCHAIN,
      ]) as ChainId[];

  // Hard 12-second global guard — ensures the API always returns before
  // Next.js serverless function timeout, even if all RPCs are slow.
  const GLOBAL_TIMEOUT_MS = 12_000;

  const timeoutResult = new Promise<any>((resolve) =>
    setTimeout(() => resolve({
      totalValueUsd: 0,
      change24hPercent: 0,
      change24hUSD: 0,
      tokens: [],
      chainBreakdown: {},
      address,
      status: 'TIMEOUT',
      error: 'GLOBAL_TIMEOUT — partial data only.',
    }), GLOBAL_TIMEOUT_MS)
  );

  try {
    const portfolio = await Promise.race([
      portfolioService.getMultiChainPortfolio(address, chains),
      timeoutResult,
    ]);

    console.log(`[API-Portfolio] ${address}: ${portfolio?.tokens?.length ?? 0} tokens | $${portfolio?.totalValueUsd?.toFixed(2)} | status: ${portfolio?.status ?? 'OK'}`);

    return new NextResponse(safeSerialize(portfolio), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    console.error('[API-Portfolio] Unhandled error:', error.message);
    return new NextResponse(
      safeSerialize({
        totalValueUsd: 0,
        tokens: [],
        chainBreakdown: {},
        address,
        error: error.message ?? 'FETCH_FAILED',
      }),
      {
        status: 200, // Return 200 so the UI shows empty state, not a red error
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
