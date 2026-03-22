import { safeRedisGet, safeRedisSet } from '../redis/client';

/**
 * MORALIS_API_KEY from Environment
 */
const MORALIS_API_KEY = process.env.MORALIS_API_KEY || '';

/**
 * Chain mapping for Moralis API
 */
export const MORALIS_CHAINS = {
  1: 'eth',
  137: 'polygon',
  56: 'bsc',
  43114: 'avalanche',
  42161: 'arbitrum',
  10: 'optimism',
  8453: 'base',
  480: 'worldchain' 
} as const;

export type MoralisChain = typeof MORALIS_CHAINS[keyof typeof MORALIS_CHAINS];

interface MoralisRequestOptions {
  endpoint: string;
  params?: Record<string, any>;
  method?: 'GET' | 'POST';
}

/**
 * LEGENDARY Moralis Service
 * Unified blockchain data access via Moralis Deep Index API
 */
export class MoralisService {
  private baseURL = 'https://deep-index.moralis.io/api/v2.2';
  private apiKey: string;
  
  // Tracking active fetches to collapse duplicate concurrent requests (Thundering Herd Protection)
  private activeFetches: Map<string, Promise<any>> = new Map();

  // Rate limiting & Quota tracking
  private requestCount = 0;
  private resetTime = Date.now() + 60000;
  private quotaExhaustedUntil = 0;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || '';
    
    // Check if key is available now, or will be loaded later via getter
    const currentKey = this.getApiKey();
    if (!currentKey) {
      console.warn('[Moralis] ⚠️ MORALIS_API_KEY is currently MISSING! It must be set in .env');
    } else {
      console.log('[Moralis] ✅ Service initialized');
    }
  }

  /**
   * Lazy load API Key from environment
   */
  private getApiKey(): string {
    if (this.apiKey) return this.apiKey;
    return process.env.MORALIS_API_KEY || '';
  }

  /**
   * Generic request handler with rate limiting & caching
   */
  private async request<T>(options: MoralisRequestOptions): Promise<T> {
    const { endpoint, params = {}, method = 'GET' } = options;
    
    // Build cache key
    const cacheKey = `moralis:${method}:${endpoint}:${JSON.stringify(params)}`;
    
    // ─── Phase 1: Redis Persistent Cache ─────────────────────
    const cached = await safeRedisGet(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached) as T;
      } catch (e) {
        console.warn(`[Moralis:Cache] Error parsing for ${endpoint}, fetching fresh.`);
      }
    }

    // ─── Phase 2: Thundering Herd Protection (Deduplication) ───
    if (this.activeFetches.has(cacheKey)) {
      return this.activeFetches.get(cacheKey);
    }

    const fetchPromise = (async () => {
        // 🛡️ [CIRCUIT BREAKER] If quota was exhausted, don't even try until timer expires
        if (Date.now() < this.quotaExhaustedUntil) {
            throw new Error('MORALIS_QUOTA_EXHAUSTED');
        }

        // Rate limit check (Moralis: ~2400 req/min on Pro)
        if (Date.now() > this.resetTime) {
            this.requestCount = 0;
            this.resetTime = Date.now() + 60000;
        }
        
        if (this.requestCount > 2000) {
            console.warn('[Moralis] ⚠️ Approaching rate limit, throttling...');
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        this.requestCount++;

        // Build URL
        const url = new URL(`${this.baseURL}${endpoint}`);
        if (method === 'GET') {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    url.searchParams.append(key, String(value));
                }
            });
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // Institutional 10s Timeout

            const response = await fetch(url.toString(), {
                method,
                headers: {
                    'Accept': 'application/json',
                    'X-API-Key': this.getApiKey()
                },
                body: method === 'POST' ? JSON.stringify(params) : undefined,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorText = await response.text();
                
                // 🔥 [LEGENDARY QUOTA SHIELD] If throttled or quota exhausted
                if (response.status === 429 || response.status === 403 || errorText.toLowerCase().includes('plan') || errorText.toLowerCase().includes('consumed')) {
                    console.warn(`[Moralis] 🛡️ Quota Limit Hit (${response.status}). Attempting stale fallback for ${endpoint}...`);
                    this.quotaExhaustedUntil = Date.now() + 5 * 60 * 1000; // 5 minute cooldown
                }
                throw new Error(`Moralis API Error (${response.status}): ${errorText}`);
            }

            const data = await response.json();
            
            // ─── Phase 3: Selective Persistence ─────────────────
            // Historical data (history, token transfers) gets longer TTL
            // Balances and Prices get shorter TTL
            let ttl = 60; // 60s default
            if (endpoint.includes('history') || endpoint.includes('transfers')) ttl = 300; // 5m
            if (endpoint.includes('ohlcv')) ttl = 3600; // 1h
            
            await safeRedisSet(cacheKey, JSON.stringify(data), 'EX', ttl);
            
            return data as T;
        } catch (error: any) {
            console.error(`[Moralis] Request failed for ${endpoint}:`, error.message);
            // If we have any cached data reachable through Redis (even if expired, but we already tried get)
            // In a more complex setup we could use stale-while-revalidate but here we just throw or fallback.
            throw error;
        } finally {
            this.activeFetches.delete(cacheKey);
        }
    })();

    this.activeFetches.set(cacheKey, fetchPromise);
    return fetchPromise;
  }

  /**
   * 🔥 WALLET API: Get token balances with prices (single call!)
   */
  async getWalletBalances(address: string, chain: MoralisChain, cursor?: string) {
    return this.request<any>({
      endpoint: `/wallets/${address}/tokens`,
      params: { chain, cursor, exclude_spam: false }
    });
  }

  /**
   * 🔥 TOKEN API: Get token transfers (Whale Scanning)
   */
  async getTokenTransfers(address: string, chain: MoralisChain, limit: number = 100) {
    return this.request<any>({
      endpoint: `/erc20/${address}/transfers`,
      params: { chain, limit }
    });
  }

  /**
   * 🔥 WALLET API: Get native balance
   */
  async getNativeBalance(address: string, chain: MoralisChain) {
    return this.request<{balance: string}>({
      endpoint: `/${address}/balance`,
      params: { chain }
    });
  }

  /**
   * 🔥 WALLET API: Get net worth across all chains
   */
  async getWalletNetWorth(address: string, excludeSpam?: boolean, excludeUnverifiedContracts?: boolean) {
    return this.request<{
      total_networth_usd: string;
      chains: Array<{
        chain: string;
        native_balance: string;
        native_balance_formatted: string;
        native_balance_usd: string;
        token_balance_usd: string;
        networth_usd: string;
      }>;
    }>({
      endpoint: `/wallets/${address}/net-worth`,
      params: { 
        exclude_spam: excludeSpam ?? true,
        exclude_unverified_contracts: excludeUnverifiedContracts ?? true
      }
    });
  }

  /**
   * 🔥 WALLET API: Get wallet profitability (PnL)
   */
  async getWalletProfitability(address: string, days?: number) {
    return this.request<{
      total_realized_profit_usd: string;
      total_unrealized_profit_usd: string;
      total_profit_usd: string;
      total_tokens_sold: number;
      total_tokens_bought: number;
      result: Array<any>;
    }>({
      endpoint: `/wallets/${address}/profitability`,
      params: { days: days ?? 'all' }
    });
  }

  /**
   * 🔥 WALLET API: Get wallet stats
   */
  async getWalletStats(address: string, chain?: MoralisChain) {
    return this.request<{
      nfts_sold: number;
      nft_bought: number;
      transactions: number;
    }>({
      endpoint: `/wallets/${address}/stats`,
      params: chain ? { chain } : {}
    });
  }

  /**
   * 🔥 WALLET API: Get active chains
   */
  async getWalletActiveChains(address: string) {
    return this.request<{
      address: string;
      active_chains: Array<{
        chain: string;
        chain_id: string;
        first_transaction: {
          block_timestamp: string;
        };
        last_transaction: {
          block_timestamp: string;
        };
      }>;
    }>({
      endpoint: `/wallets/${address}/chains`
    });
  }

  /**
   * 🔥 WALLET API: Get wallet history
   */
  async getWalletHistory(address: string, chain: MoralisChain, limit: number = 100) {
    return this.request<any>({
      endpoint: `/wallets/${address}/history`,
      params: { chain, limit, order: 'DESC' }
    });
  }

  /**
   * 🔥 WALLET API: Get NFTs
   */
  async getWalletNFTs(address: string, chain: MoralisChain, limit: number = 100) {
    return this.request<any>({
      endpoint: `/${address}/nft`,
      params: { 
        chain, 
        limit,
        exclude_spam: true,
        media_items: true
      }
    });
  }

  /**
   * 🔥 DEFI API: Get DeFi positions summary
   */
  async getDefiPositions(address: string) {
    return this.request<{
      total_usd_value: number;
      protocols: Array<{
        protocol_id: string;
        protocol_name: string;
        protocol_logo: string;
        total_usd_value: number;
        position_details: Array<{
          position: string;
          label: string;
          tokens: Array<{
            symbol: string;
            balance: string;
            balance_formatted: string;
            usd_value: number;
          }>;
          usd_value: number;
        }>;
      }>;
    }>({
      endpoint: `/wallets/${address}/defi/positions`
    });
  }

  /**
   * 🔥 DEFI API: Get DeFi summary
   */
  async getDefiSummary(address: string) {
    return this.request<{
      total_usd_value: number;
      protocols: Array<{
        protocol_name: string;
        protocol_id: string;
        total_usd_value: number;
        total_positions: number;
      }>;
    }>({
      endpoint: `/wallets/${address}/defi/summary`
    });
  }

  /**
   * 🔥 PRICE API: Get token price
   */
  async getTokenPrice(address: string, chain: MoralisChain) {
    return this.request<{
      usdPrice: number;
      usdPriceFormatted: string;
      '24hrPercentChange': string;
      exchangeAddress: string;
      exchangeName: string;
    }>({
      endpoint: `/erc20/${address}/price`,
      params: { chain }
    });
  }

  /**
   * 🔥 PRICE API: Get multiple token prices (bulk)
   */
  async getMultipleTokenPrices(tokens: Array<{ address: string; chain: MoralisChain }>) {
    return this.request<Array<{
      tokenAddress: string;
      usdPrice: number;
      usdPriceFormatted: string;
      '24hrPercentChange': string;
      exchangeAddress: string;
      exchangeName: string;
    }>>({
      endpoint: '/erc20/prices',
      method: 'POST',
      params: {
        tokens: tokens.map(t => ({
          token_address: t.address,
          chain: t.chain
        }))
      }
    });
  }

  /**
   * 🔥 NFT API: Get floor price
   */
  async getNFTFloorPrice(address: string, chain: MoralisChain) {
    return this.request<{
      floor_price_usd: string;
      floor_price: string;
      floor_price_symbol: string;
    }>({
      endpoint: `/nft/${address}/floor-price`,
      params: { chain }
    });
  }

  /**
   * 🔥 DOMAIN API: Resolve ENS domain
   */
  async resolveENSDomain(domain: string) {
    return this.request<{ address: string }>({
      endpoint: `/resolve/ens/${domain}`
    });
  }

  /**
   * 🔥 DOMAIN API: Reverse resolve address to ENS
   */
  async resolveAddress(address: string) {
    return this.request<{ name: string }>({
      endpoint: `/resolve/${address}/reverse`
    });
  }

  /**
   * 🔥 DOMAIN API: Resolve Unstoppable domain
   */
  async resolveUnstoppableDomain(domain: string) {
    return this.request<{ address: string }>({
      endpoint: `/resolve/${domain}`
    });
  }

  /**
   * 🔥 TOKEN API: Get token price history (OHLCV)
   */
  async getOHLCV(address: string, chain: MoralisChain, timeframe: string = '1h', limit: number = 100) {
    return this.request<any>({
      endpoint: `/erc20/${address}/ohlcv`,
      params: { chain, timeframe, limit }
    });
  }

  /**
   * 🔥 TRANSACTION API: Get transaction details
   */
  async getTransaction(transactionHash: string, chain: MoralisChain = 'eth') {
    return this.request<any>({
      endpoint: `/transaction/${transactionHash}`,
      params: { chain }
    });
  }

  /**
   * Helper: Convert ChainId to Moralis chain name
   */
  getChainName(chainId: number): MoralisChain {
    return MORALIS_CHAINS[chainId as keyof typeof MORALIS_CHAINS] || 'eth';
  }
}

// Singleton instance
export const moralisService = new MoralisService();

