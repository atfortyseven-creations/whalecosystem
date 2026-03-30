/**
 * CoinGecko Price Helper
 * Real-time crypto price fetching with caching
 */

interface PriceCache {
  [symbol: string]: {
    price: number;
    timestamp: number;
  };
}

const priceCache: PriceCache = {};
const CACHE_DURATION = 30 * 1000; // 30 seconds — institutional real-time requirement

// CoinGecko coin ID mapping (expanded)
const COIN_ID_MAP: Record<string, string> = {
  'ETH': 'ethereum',
  'WETH': 'ethereum',
  'BTC': 'bitcoin',
  'WBTC': 'wrapped-bitcoin',
  'MATIC': 'matic-network',
  'POL': 'matic-network',
  'ARB': 'arbitrum',
  'OP': 'optimism',
  'USDC': 'usd-coin',
  'USDC.e': 'usd-coin',
  'USDT': 'tether',
  'DAI': 'dai',
  'STETH': 'staked-ether',
  'WSTETH': 'wrapped-staked-ether',
  'RPL': 'rocket-pool',
  'LDO': 'lido-dao',
  'UNI': 'uniswap',
  'AAVE': 'aave',
  'LINK': 'chainlink',
  'PEPE': 'pepe',
  'SHIB': 'shiba-inu',
  'BONK': 'bonk',
  'WIF': 'dogwifcoin',
  'FLOKI': 'floki',
  'NEAR': 'near',
  'FTM': 'fantom',
  'IMX': 'immutable-x',
  'SNX': 'havven',
  'CRV': 'curve-dao-token',
  'MKR': 'maker',
  'GNO': 'gnosis',
  '1INCH': '1inch',
  'GRT': 'the-graph',
  'RNDR': 'render-token',
  'FET': 'fetch-ai',
  'TAO': 'bittensor',
  'TIA': 'celestia',
  'SEI': 'sei-network',
  'SUI': 'sui',
  'APT': 'aptos',
  'INJ': 'injective-protocol',
  'ROSE': 'oasis-network',
  'OCEAN': 'ocean-protocol',
  'WOO': 'woo-network',
  'JUP': 'jupiter-exchange-solana',
  'RAY': 'raydium',
  'RENDER': 'render-token',
  'OM': 'mantra-dao',
  'ENA': 'ethena',
  'WLD': 'worldcoin-wld',
  'WORLDCOIN': 'worldcoin-wld',
  'PENDLE': 'pendle',
  'STRK': 'starknet',
  'ZRO': 'layerzero',
  'ENS': 'ethereum-name-service',
  'BLUR': 'blur',
  'PYTH': 'pyth-network',
  'JTO': 'jito-governance-token',
  'METIS': 'metis-token',
  'MANTLE': 'mantle',
  'MNT': 'mantle',
  'BEAM': 'beam-2',
  'PRIME': 'echelon-prime',
  'ILV': 'illuvium',
  'SUPER': 'superfarm',
  'AERO': 'aerodrome-finance',
  'BRETT': 'brett-based',
  'DEGEN': 'degen-base',
  'CBETH': 'coinbase-wrapped-staked-eth',
  'VIRTUAL': 'virtual-protocol',
  'TOSHI': 'toshi',
  'HIGHER': 'higher',
  'MOG': 'mog-coin',
  'KEYCAT': 'keyboard-cat',
  'TYBG': 'base-god',
  'EIGEN': 'eigenlayer',
  'MEW': 'cat-in-a-dogs-world',
  'GIGA': 'giga-chad',
  'FWOG': 'fwog',
  'MOODENG': 'moo-deng',
  'GOAT': 'goatseus-maximus',
  'ZEREBRO': 'zerebro',
  'AI16Z': 'ai16z',
  'GRASS': 'grass',
  'DRIFT': 'drift-protocol',
  'CLOUD': 'cloud',
  'HYPE': 'hyperliquid',
  'BNB': 'binancecoin',
  'AVAX': 'avalanche-2',
  'SOL': 'solana',
  'ANON': 'anon',
  'HOLY': 'holy',
  'RTK': 'retara',
  'UNA': 'unagi-token',
  'TWEET': 'tweet',
  'USDEBT': 'united-states-debt',
  'AURA': 'aura-network',
  'BRAINLET': 'brainlet',
  'MUSHY': 'mushy',
  'CULT': 'milady-cult-coin',
  'MNEP': 'minereum-ethereum-polyfill',
  'SUPERGROK': 'supergrok',
  'NABLA': 'nabla',
  'WMATIC': 'wrapped-matic',
  'YUP': 'yup',
  'CROW': 'crow',
  'TRUMP': 'official-trump',
  'MELANIA': 'melania-trump',
  'FARTCOIN': 'fartcoin',
  'SWARMS': 'swarms',
};

// [PHASE 6] STEEL DOME ERADICATED
// Hardcoded prices are non-compliant with 100% Real-Time policy.
export const STEEL_DOME_FALLBACKS: Record<string, number> = {};

/**
 * Get real-time price from CoinGecko API
 * FREE tier: No API key needed for simple price queries
 */
/**
 * Fetch live price from DexScreener (works for any EVM token, great for L2s).
 * Returns 0 if not found.
 */
async function getDexScreenerPrice(symbol: string): Promise<number> {
  try {
    const url = `https://api.dexscreener.com/latest/dex/search?q=${symbol}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return 0;
    const json = await res.json();
    const pairs: any[] = json.pairs || [];
    // Pick the pair with the highest USD liquidity for this symbol
    const best = pairs
      .filter(p => p.baseToken?.symbol?.toUpperCase() === symbol.toUpperCase())
      .sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];
    return best?.priceUsd ? parseFloat(best.priceUsd) : 0;
  } catch {
    return 0;
  }
}

/**
 * Get real-time price — 3-tier waterfall:
 *   TIER 1: CoinGecko (authoritative, rate-limited)
 *   TIER 2: DexScreener (L2 tokens, high liquidity pairs)
 *   TIER 3: Final Resort (No fallback allowed)
 */
export async function getRealTimePrice(symbol: string): Promise<number> {
  const upperSymbol = symbol.toUpperCase();
  
  // Check 5-minute local cache
  const cached = priceCache[upperSymbol];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.price;
  }

  const cacheAndReturn = (price: number): number => {
    if (price > 0) priceCache[upperSymbol] = { price, timestamp: Date.now() };
    return price;
  };

  // ─── TIER 1: CoinGecko ────────────────────────────────────────────────────
  try {
    const coinId = COIN_ID_MAP[upperSymbol];
    if (coinId) {
      const apiKey = process.env.NEXT_PUBLIC_COINGECKO_KEY;
      const authParam = apiKey ? `&x_cg_demo_api_key=${apiKey}` : '';
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd${authParam}`;
      
      const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (response.ok) {
        const data = await response.json();
        const price = data[coinId]?.usd;
        if (price && price > 0) {
          console.log(`[PriceHelper] CoinGecko ✅ ${upperSymbol}: $${price}`);
          return cacheAndReturn(price);
        }
      } else if (response.status === 429) {
        console.warn(`[PriceHelper] CoinGecko rate-limited for ${upperSymbol} — escalating to DexScreener`);
      }
    }
  } catch (e: any) {
    console.warn(`[PriceHelper] CoinGecko failed for ${upperSymbol}: ${e.message}`);
  }

  // ─── TIER 2: DexScreener ──────────────────────────────────────────────────
  const dexPrice = await getDexScreenerPrice(upperSymbol);
  if (dexPrice > 0) {
    console.log(`[PriceHelper] DexScreener ✅ ${upperSymbol}: $${dexPrice}`);
    return cacheAndReturn(dexPrice);
  }

  // ─── TIER 3: Last Resort (0% Simulation) ──────────────────────────────────
  // No hardcoded prices allowed in TIER 3 per Phase 6 policy.
  
  // Return stale cached value if all sources fail, otherwise 0
  return cached?.price || 0;
}


/**
 * Get multiple prices efficiently in single requests where possible
 */
export async function getBulkPrices(symbols: string[], skipCache: boolean = false): Promise<Record<string, number>> {
  if (symbols.length === 0) return {};

  const result: Record<string, number> = {};
  const coinIdsToFetch: string[] = [];
  const symbolToId: Record<string, string> = {};

  symbols.forEach(symbol => {
    const s = symbol.toUpperCase();
    const id = COIN_ID_MAP[s];
    if (id) {
        if (!skipCache) {
            const cached = priceCache[s];
            if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
                result[s] = cached.price;
                return;
            }
        }
        coinIdsToFetch.push(id);
        symbolToId[id] = s;
    } else {
        result[s] = 0;
    }
  });

  if (coinIdsToFetch.length === 0) return result;

  try {
    // Fetch in chunks of 50 to stay safe
    const CHUNK_SIZE = 50;
    for (let i = 0; i < coinIdsToFetch.length; i += CHUNK_SIZE) {
      const chunk = coinIdsToFetch.slice(i, i + CHUNK_SIZE);
      const ids = chunk.join(',');
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`;

      const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
      
      if (!response.ok) {
        const text = await response.text();
        if (text.includes('Throttled')) {
            console.warn('[CoinGecko] Bulk price request throttled.');
            continue; // Skip this chunk but keep going
        }
        throw new Error(`CoinGecko Bulk API error: ${response.status}`);
      }

      const data = await response.json();
      
      chunk.forEach(id => {
        const price = data[id]?.usd || 0;
        const sym = symbolToId[id];
        result[sym] = price;
        
        // Update cache
        priceCache[sym] = {
            price,
            timestamp: Date.now()
        };
      });
    }
  } catch (error) {
    console.error('Error fetching bulk prices:', error);
  }

  return result;
}

/**
 * Get real-time price AND 24h change from CoinGecko API
 */
/**
 * Get real-time price AND 24h change from CoinGecko API
 */
export async function getPriceWithChange(symbol: string): Promise<{ price: number; change24h: number }> {
    // ... (keep existing implementation or redirect to bulk)
    // For specific single calls, we can keep the existing one or wrap bulk.
    // Let's keep existing for backward compat, but add bulk below.
    const upperSymbol = symbol.toUpperCase();
    const coinId = COIN_ID_MAP[upperSymbol];
    
    if (!coinId) return { price: 0, change24h: 0 };

    try {
        const apiKey = process.env.NEXT_PUBLIC_COINGECKO_KEY;
        const authParam = apiKey ? `&x_cg_demo_api_key=${apiKey}` : '';
        const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true${authParam}`;
        // [REAL-TIME] cache:no-store forces fresh data on every call — no Next.js Data Cache
        const res = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(5000) });
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json();
        return { 
            price: data[coinId]?.usd || 0, 
            change24h: data[coinId]?.usd_24h_change || 0 
        };
    } catch (e) {
        console.error(`Error fetching ${symbol}:`, e);
        return { price: 0, change24h: 0 };
    }
}

/**
 * Get multiple prices AND 24h changes efficiently in single requests
 */
export async function getBulkPricesWithChange(symbols: string[], skipCache: boolean = false): Promise<Record<string, { price: number, change24h: number }>> {
  if (symbols.length === 0) return {};

  const result: Record<string, { price: number, change24h: number }> = {};
  const coinIdsToFetch: string[] = [];
  const symbolToId: Record<string, string> = {};

  // 1. Check Cache First
  symbols.forEach(symbol => {
    const s = symbol.toUpperCase();
    const id = COIN_ID_MAP[s];
    if (id) {
        const cached = priceCache[s];
        // Legendary Caching: Return cached even if slightly expired if we are in high-frequency update mode
        if (!skipCache && cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
            result[s] = { price: cached.price, change24h: (cached as any).change24h || 0 };
        } else {
            coinIdsToFetch.push(id);
            symbolToId[id] = s;
        }
    } else {
        result[s] = { price: 0, change24h: 0 };
    }
  });

  if (coinIdsToFetch.length === 0) return result;

  try {
    // Fetch in chunks of 50 to stay safe
    const CHUNK_SIZE = 50;
    for (let i = 0; i < coinIdsToFetch.length; i += CHUNK_SIZE) {
      const chunk = coinIdsToFetch.slice(i, i + CHUNK_SIZE);
      const ids = chunk.join(',');
      const apiKey = process.env.NEXT_PUBLIC_COINGECKO_KEY;
      const authParam = apiKey ? `&x_cg_demo_api_key=${apiKey}` : '';
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true${authParam}`;

      // [REAL-TIME] Always use cache:no-store for institutional-grade freshness (≤30s)
      const fetchOptions: any = { cache: 'no-store' };
      
      try {
        const response = await fetch(url, { 
          ...fetchOptions,
          signal: AbortSignal.timeout(8000)
        });
        
        if (!response.ok) {
          const text = await response.text();
          const isThrottled = response.status === 429 || text.toLowerCase().includes('throttled');
          
          if (isThrottled) {
              console.warn(`[CoinGecko] Bulk price request throttled (429).`);
              chunk.forEach(id => {
                  const sym = symbolToId[id];
                  result[sym] = { 
                      price: 0, 
                      change24h: 0, 
                      error: 'PRICE_THROTTLED', 
                      errorMessage: 'Price feed is currently rate-limited by CoinGecko' 
                  } as any;
              });
              continue;
          }
          throw new Error(`API Error ${response.status}`);
        }

        const data = await response.json();
        
        chunk.forEach(id => {
          const item = data[id];
          const sym = symbolToId[id];
          if (item) {
              const price = item.usd || 0;
              const change24h = item.usd_24h_change || 0;
              result[sym] = { price, change24h };
              
              // Update cache with change data
              priceCache[sym] = {
                  price,
                  timestamp: Date.now(),
                  ...({ change24h } as any)
              };
          } else {
               // Fallback to stale cache if API returned nothing for this ID
               const stale = priceCache[sym];
               result[sym] = stale ? { price: stale.price, change24h: (stale as any).change24h || 0 } : { price: 0, change24h: 0 };
          }
        });
      } catch (chunkError) {
        console.error(`[CoinGecko] Error in chunk:`, chunkError);
        chunk.forEach(id => {
            const sym = symbolToId[id];
            const stale = priceCache[sym];
            
            // 🔥 [STEEL DOME] Last Resilience: Use hardcoded fallback for majors
            const fallback = STEEL_DOME_FALLBACKS[sym];
            
            result[sym] = stale 
              ? { price: stale.price, change24h: (stale as any).change24h || 0 } 
              : (fallback ? { price: fallback, change24h: 0 } : { price: 0, change24h: 0 });
        });
      }
    }
  } catch (error) {
    console.error('Error fetching bulk prices:', error);
    // Global fallback already handled by chunk-level catch
  }

  return result;
}

