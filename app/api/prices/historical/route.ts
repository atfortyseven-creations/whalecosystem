import { NextRequest, NextResponse } from 'next/server';
import rateLimit from '@/lib/rate-limit';

const limiter = rateLimit({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 500,
});

/**
 * CoinGecko Historical Price Data API
 * Free tier: 50 calls/minute
 */

interface PriceDataPoint {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface HistoricalResponse {
  symbol: string;
  currency: string;
  data: PriceDataPoint[];
  currentPrice: number;
}

// CoinGecko coin ID mapping - Expanded for 30 trading pairs logic
const COIN_MAP: Record<string, string> = {
  'ETH': 'ethereum',
  'BTC': 'bitcoin',
  'MATIC': 'matic-network',
  'ARB': 'arbitrum',
  'OP': 'optimism',
  'BASE': 'ethereum', 
  'USDC': 'usd-coin',
  'USDT': 'tether',
  'DAI': 'dai',
  'SOL': 'solana',
  'XRP': 'ripple',
  'ADA': 'cardano',
  'AVAX': 'avalanche-2',
  'DOT': 'polkadot',
  'LINK': 'chainlink',
  'UNI': 'uniswap',
  'BNB': 'binancecoin',
  'LTC': 'litecoin',
  'BCH': 'bitcoin-cash',
  'XLM': 'stellar',
  'ALGO': 'algorand',
  'FIL': 'filecoin',
  'FET': 'fetch-ai',
  'RNDR': 'render-token',
  'NEAR': 'near',
  'INJ': 'injective-protocol',
  'PEPE': 'pepe',
  'WLD': 'worldcoin-wld',
};

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    try {
        await limiter.check(50, ip); // 50 requests per minute
    } catch {
        return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol')?.toUpperCase() || 'ETH';
    const days = parseInt(searchParams.get('days') || '7');
    const currency = searchParams.get('currency') || 'usd';

    const coinId = COIN_MAP[symbol];
    if (!coinId) {
      return NextResponse.json(
        { error: `Unsupported symbol: ${symbol}` },
        { status: 400 }
      );
    }

    // CoinGecko API (free tier or authenticated)
    const baseUrl = 'https://api.coingecko.com/api/v3';
    const apiKey = process.env.NEXT_PUBLIC_COINGECKO_KEY;
    const authParam = apiKey ? `&x_cg_demo_api_key=${apiKey}` : '';
    
    // Fetch OHLC data
    const ohlcUrl = `${baseUrl}/coins/${coinId}/ohlc?vs_currency=${currency}&days=${days}${authParam}`;
    console.log(`[HistoricalAPI] Fetching OHLC for ${coinId} (${days} days)...`);
    
    const ohlcRes = await fetch(ohlcUrl, {
      cache: 'no-store', // Avoid caching provider errors/limitations
    });

    if (!ohlcRes.ok) {
      if (ohlcRes.status === 429) {
          console.error(`[HistoricalAPI] CoinGecko Rate Limit Hit`);
          return NextResponse.json({ error: 'Market data provider rate limit hit. Using fallback cache...' }, { status: 429 });
      }
      throw new Error(`CoinGecko OHLC Error: ${ohlcRes.status}`);
    }

    const ohlcData = await ohlcRes.json();
    
    // Transform to our format
    const priceData: PriceDataPoint[] = ohlcData.map((point: any[]) => ({
      timestamp: point[0],
      open: point[1],
      high: point[2],
      low: point[3],
      close: point[4],
      volume: 0, // OHLC endpoint doesn't include volume
    }));

    // Get current price
    const currentPriceUrl = `${baseUrl}/simple/price?ids=${coinId}&vs_currencies=${currency}${authParam}`;
    const priceRes = await fetch(currentPriceUrl, {
      next: { revalidate: 60 },
    });
    const currentPriceRaw = await priceRes.json();
    const currentPrice = currentPriceRaw[coinId]?.[currency] || 0;

    const response: HistoricalResponse = {
      symbol,
      currency: currency.toUpperCase(),
      data: priceData,
      currentPrice,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Price fetch error:', error);
    
    // Return empty state if API fails, avoid fictitious data at all costs
    return NextResponse.json(
      { 
        symbol: 'UNKNOWN',
        currency: 'USD',
        data: [],
        currentPrice: 0,
        error: "Real-time market data currently unavailable"
      }, 
      { status: 503 }
    );
  }
}

