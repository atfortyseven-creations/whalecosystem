import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
// Cache globally at edge/server level every 5 minutes to avoid rate limits
export const revalidate = 300; 

export async function GET() {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/global', {
      next: { revalidate: 300 },
      headers: {
        'Accept': 'application/json',
        // Optional: add your Pro API key here if you have one
        // 'x-cg-pro-api-key': process.env.COINGECKO_API_KEY || ''
      }
    });

    if (!res.ok) {
      throw new Error(`CoinGecko API error: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[MARKET_GLOBAL_ERROR]', error);
    // Return a graceful fallback if the rate limit is hit, preventing the client from failing
    // Zero mock data requirement: We will just return an error and the client can handle it
    return NextResponse.json({ error: 'Failed to fetch global market data' }, { status: 500 });
  }
}
