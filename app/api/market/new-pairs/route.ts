import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Mock a real simulation to mimic DexScreener format
        // since setting up actual connection to websockets here is beyond the scope of this file
        // but it provides the right schema for the frontend.
        const res = await fetch('https://api.binance.com/api/v3/ticker/24hr', { cache: 'no-store' });
        if (res.ok) {
            const data = await res.json();
            const pairs = data.slice(50, 75).map((d: any, i: number) => ({
                id: d.symbol,
                chain: ['ethereum', 'solana', 'base', 'arbitrum', 'bsc'][i % 5],
                dex: ['Uniswap v3', 'Raydium', 'Aerodrome', 'Camelot', 'PancakeSwap'][i % 5],
                baseToken: { symbol: d.symbol.replace('USDT', ''), name: d.symbol.replace('USDT', '') + ' Token' },
                quoteToken: { symbol: 'USDT' },
                priceUsd: parseFloat(d.lastPrice).toFixed(6),
                pairCreatedAt: Date.now() - Math.random() * 86400000,
                priceChange: {
                    m5: parseFloat(d.priceChangePercent) / 10,
                    h1: parseFloat(d.priceChangePercent) / 4,
                    h6: parseFloat(d.priceChangePercent) / 2,
                    h24: parseFloat(d.priceChangePercent)
                },
                liquidity: { usd: parseFloat(d.quoteVolume) * 0.1 },
                mcap: parseFloat(d.quoteVolume) * 0.5,
                fdv: parseFloat(d.quoteVolume) * 0.6,
                txns: { m5: { buys: Math.floor(Math.random() * 500), sells: Math.floor(Math.random() * 400) } },
                traders: { makers: Math.floor(Math.random() * 100), snipers: Math.floor(Math.random() * 10) },
                security: { score: 50 + Math.floor(Math.random() * 50), honeypotRisk: Math.random() > 0.9, lpBurned: true, mintRevoked: true },
                taxes: { buy: 0, sell: 0 }
            }));
            return NextResponse.json({ pairs });
        }
    } catch {}
    return NextResponse.json({ pairs: [] });
}
