import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Using CoinCap to bypass Binance geo-blocking (HTTP 451) on US-hosted servers
        const res = await fetch('https://api.coincap.io/v2/assets?limit=100', {
            next: { revalidate: 10 }, // Cache for 10 seconds
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            }
        });
        
        if (!res.ok) {
            throw new Error(`Market Data API responded with status: ${res.status}`);
        }
        
        const json = await res.json();
        
        // Map to Binance payload structure so the client doesn't need to change
        const validData = json.data.map((asset: any) => ({
            symbol: `${asset.symbol}USDT`,
            lastPrice: asset.priceUsd || "0",
            priceChangePercent: asset.changePercent24Hr || "0",
            quoteVolume: asset.volumeUsd24Hr || "0"
        }));
            
        return NextResponse.json(validData);
    } catch (error) {
        console.error("RPC Relayer Ticker Error:", error);
        return NextResponse.json({ error: "Failed to fetch telemetry data" }, { status: 500 });
    }
}
