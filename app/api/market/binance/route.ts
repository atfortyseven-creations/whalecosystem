import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const res = await fetch('https://api.binance.com/api/v3/ticker/24hr', {
            next: { revalidate: 10 }, // Cache for 10 seconds
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });
        
        if (!res.ok) {
            throw new Error(`Binance API responded with status: ${res.status}`);
        }
        
        const data = await res.json();
        
        // Return only USDT pairs with high volume to save bandwidth
        const validData = data
            .filter((d: any) => d.symbol.endsWith('USDT') && parseFloat(d.quoteVolume) > 10000000)
            .slice(0, 100);
            
        return NextResponse.json(validData);
    } catch (error) {
        console.error("RPC Relayer Ticker Error:", error);
        return NextResponse.json({ error: "Failed to fetch telemetry data" }, { status: 500 });
    }
}
