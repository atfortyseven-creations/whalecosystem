import { NextRequest, NextResponse } from 'next/server';
import { portfolioService } from '@/lib/blockchain/PortfolioService';
import { ChainId } from '@/lib/blockchain/BlockchainService';
import { withCache, addressCacheKey, CacheTTL } from '@/src/lib/cache/redis-cache';
import { withRetry, formatErrorResponse, circuitBreakers } from '@/src/lib/errors/error-handler';

/**
 * GET /api/wallet/portfolio
 * Fetches Elite-grade portfolio data with caching and error handling.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');
    
    if (!address) {
      return NextResponse.json({ error: 'Address required' }, { status: 400 });
    }
    
    const chains = searchParams.get('chainIds')?.split(',').map(id => parseInt(id)) || [
      ChainId.MAINNET, ChainId.POLYGON, ChainId.BASE, 
      ChainId.ARBITRUM, ChainId.OPTIMISM, ChainId.AVALANCHE, 
      ChainId.BSC, ChainId.WORLDCHAIN
    ];

    // Generate cache key
    const cacheKey = addressCacheKey(address, `portfolio:${chains.join(',')}`);

    // Fetch with caching and retry logic
    const portfolio = await withCache(
      cacheKey,
      () => withRetry(
        () => circuitBreakers.alchemy.general.execute(
          () => portfolioService.getMultiChainPortfolio(address, chains as ChainId[])
        ),
        {
          maxRetries: 2,
          delay: 500,
          backoff: true
        }
      ),
      { ttl: CacheTTL.PORTFOLIO_BALANCE }
    );

    console.log(`[API-Portfolio] Result for ${address}:`, { 
      tokenCount: portfolio?.tokens?.length, 
      totalValue: portfolio?.totalValueUsd,
      chainCount: Object.keys(portfolio?.chainBreakdown || {}).length,
      cached: portfolio?._cached || false
    });
    
    return NextResponse.json(portfolio);
  } catch (error: any) {
    console.error('[API-Portfolio] Error:', error);
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(
      errorResponse,
      { status: errorResponse.statusCode }
    );
  }
}

