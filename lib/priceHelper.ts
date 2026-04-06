/**
 * Whale-Grade Price Helper
 * ZERO-LATENCY Binance/DexScreener Hybrid Fetcher
 */

interface PriceCache {
  [symbol: string]: {
    price: number;
    change24h?: number;
    timestamp: number;
  };
}

const priceCache: PriceCache = {};
const CACHE_DURATION = 15 * 1000; // 15 seconds cache for backend reads (UI uses 0ms WS)

// Binance Symbol Mapping (Whale-Grade Core Assets)
const BINANCE_MAP: Record<string, string> = {
  'BTC': 'BTCUSDT', 'ETH': 'ETHUSDT', 'BNB': 'BNBUSDT', 'SOL': 'SOLUSDT', 'XRP': 'XRPUSDT',
  'ADA': 'ADAUSDT', 'DOGE': 'DOGEUSDT', 'SHIB': 'SHIBUSDT', 'DOT': 'DOTUSDT', 'LINK': 'LINKUSDT',
  'MATIC': 'MATICUSDT', 'POL': 'POLUSDT', 'AVAX': 'AVAXUSDT', 'TRX': 'TRXUSDT', 'UNI': 'UNIUSDT', 
  'PEPE': 'PEPEUSDT', 'FET': 'FETUSDT', 'DAI': 'DAIUSDT', 'APE': 'APEUSDT', 'LDO': 'LDOUSDT', 
  'ARB': 'ARBUSDT', 'OP': 'OPUSDT', 'STRK': 'STRKUSDT', 'WLD': 'WLDUSDT', 'NEAR': 'NEARUSDT',
  'FTM': 'FTMUSDT', 'TAO': 'TAOUSDT', 'INJ': 'INJUSDT', 'RNDR': 'RNDRUSDT', 'RENDER': 'RENDERUSDT', 
  'JUP': 'JUPUSDT', 'SUI': 'SUIUSDT', 'APT': 'APTUSDT', 'TIA': 'TIAUSDT', 'SEI': 'SEIUSDT',
  'ENA': 'ENAUSDT', 'PENDLE': 'PENDLEUSDT', 'AAVE': 'AAVEUSDT', 'MKR': 'MKRUSDT', 'CRV': 'CRVUSDT',
  'WIF': 'WIFUSDT', 'BONK': 'BONKUSDT', 'FLOKI': 'FLOKIUSDT', 'SNX': 'SNXUSDT', 'IMX': 'IMXUSDT',
  'GRT': 'GRTUSDT', '1INCH': '1INCHUSDT', 'STETH': 'ETHUSDT' // Staked ETH mapped to ETH for parity
};

const REVERSE_MAP: Record<string, string> = {};
Object.entries(BINANCE_MAP).forEach(([key, val]) => {
  REVERSE_MAP[val] = key;
});

export const STEEL_DOME_FALLBACKS: Record<string, number> = {};

async function getDexScreenerPrice(symbol: string): Promise<number> {
  try {
    const url = `https://api.dexscreener.com/latest/dex/search?q=${symbol}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return 0;
    const json = await res.json();
    const pairs: any[] = json.pairs || [];
    const best = pairs
      .filter(p => p.baseToken?.symbol?.toUpperCase() === symbol.toUpperCase())
      .sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];
    return best?.priceUsd ? parseFloat(best.priceUsd) : 0;
  } catch {
    return 0;
  }
}

export async function getRealTimePrice(symbol: string): Promise<number> {
  const upperSymbol = symbol.toUpperCase();
  const cached = priceCache[upperSymbol];
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.price;
  }

  const cacheAndReturn = (price: number): number => {
    if (price > 0) priceCache[upperSymbol] = { price, timestamp: Date.now() };
    return price;
  };

  try {
    const binanceSymbol = BINANCE_MAP[upperSymbol];
    if (binanceSymbol) {
      const url = `https://api.binance.com/api/v3/ticker/price?symbol=${binanceSymbol}`;
      const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
      if (response.ok) {
        const data = await response.json();
        const price = parseFloat(data.price);
        if (price > 0) return cacheAndReturn(price);
      }
    }
  } catch (e) {
    console.warn(`[PriceHelper] Binance fetch failed for ${upperSymbol}`);
  }

  const dexPrice = await getDexScreenerPrice(upperSymbol);
  if (dexPrice > 0) return cacheAndReturn(dexPrice);

  return cached?.price || 0;
}

export async function getBulkPrices(symbols: string[], skipCache: boolean = false): Promise<Record<string, number>> {
  const result = await getBulkPricesWithChange(symbols, skipCache);
  const justPrices: Record<string, number> = {};
  for (const [sym, data] of Object.entries(result)) {
      justPrices[sym] = data.price;
  }
  return justPrices;
}

export async function getPriceWithChange(symbol: string): Promise<{ price: number; change24h: number }> {
    const upperSymbol = symbol.toUpperCase();
    const cached = priceCache[upperSymbol];
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return { price: cached.price, change24h: cached.change24h || 0 };
    }

    try {
        const binanceSymbol = BINANCE_MAP[upperSymbol];
        if (binanceSymbol) {
            const url = `https://api.binance.com/api/v3/ticker/24hr?symbol=${binanceSymbol}`;
            const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
            if (res.ok) {
                const data = await res.json();
                const price = parseFloat(data.lastPrice);
                const change24h = parseFloat(data.priceChangePercent);
                
                priceCache[upperSymbol] = { price, change24h, timestamp: Date.now() };
                return { price, change24h };
            }
        }
    } catch {
        // Fallback below
    }

    const dexPrice = await getDexScreenerPrice(upperSymbol);
    if (dexPrice > 0) {
        priceCache[upperSymbol] = { price: dexPrice, change24h: 0, timestamp: Date.now() };
        return { price: dexPrice, change24h: 0 };
    }

    return { price: cached?.price || 0, change24h: cached?.change24h || 0 };
}

export async function getBulkPricesWithChange(symbols: string[], skipCache: boolean = false): Promise<Record<string, { price: number, change24h: number }>> {
  if (symbols.length === 0) return {};

  const result: Record<string, { price: number, change24h: number }> = {};
  const binanceSymbolsToFetch: string[] = [];

  // Parse required tokens
  symbols.forEach(symbol => {
    const s = symbol.toUpperCase();
    const binanceSymbol = BINANCE_MAP[s];

    if (!skipCache && priceCache[s] && (Date.now() - priceCache[s].timestamp < CACHE_DURATION)) {
        result[s] = { price: priceCache[s].price, change24h: priceCache[s].change24h || 0 };
    } else if (binanceSymbol) {
        binanceSymbolsToFetch.push(binanceSymbol);
    } else {
        // Fallback for non-binance assets. They will just get zero or cached logic
        result[s] = { price: priceCache[s]?.price || 0, change24h: priceCache[s]?.change24h || 0 };
    }
  });

  if (binanceSymbolsToFetch.length > 0) {
      try {
          // Binance allows batching symbols if formatted exactly as JSON array string
          // e.g. ["BTCUSDT","ETHUSDT"]
          // Note: Max 100 symbols per request, but we only have ~40 mapped anyway.
          const symbolsQuery = encodeURIComponent(JSON.stringify(binanceSymbolsToFetch));
          const url = `https://api.binance.com/api/v3/ticker/24hr?symbols=${symbolsQuery}`;
          
          const response = await fetch(url, { signal: AbortSignal.timeout(5000), cache: 'no-store' });
          if (response.ok) {
              const data = await response.json();
              if (Array.isArray(data)) {
                  data.forEach((item: any) => {
                      const sym = REVERSE_MAP[item.symbol];
                      if (sym) {
                          const price = parseFloat(item.lastPrice);
                          const change24h = parseFloat(item.priceChangePercent);
                          result[sym] = { price, change24h };
                          priceCache[sym] = { price, change24h, timestamp: Date.now() };
                      }
                  });
              }
          }
      } catch (error) {
          console.error('[Binance API] Bulk fetch failed, falling back to cache');
      }
  }

  // Ensure all requested symbols have some return value
  symbols.forEach(s => {
      const upper = s.toUpperCase();
      if (!result[upper]) {
         result[upper] = { price: priceCache[upper]?.price || 0, change24h: priceCache[upper]?.change24h || 0 };
      }
  });

  return result;
}

