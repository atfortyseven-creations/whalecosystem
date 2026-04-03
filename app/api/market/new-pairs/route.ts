import { NextResponse } from 'next/server';

// Ultra-Precision New Pairs Engine — DexScreener Parity
// Generates: realistic tokens, 5m/1h/6h/24h changes, makers, sniper count, security scores
const REALISTIC_NAMES = [
    ['BONK', 'Bonk'], ['PEPE', 'Pepe'], ['DOGE2', 'Doge 2.0'], ['SHIB2', 'Shiba 2'],
    ['FLOKI', 'Floki Inu'], ['WOJAK', 'Wojak'], ['CHAD', 'Chad Coin'], ['MOON', 'MoonShot'],
    ['TURBO', 'Turbo'], ['MEME', 'MemeToken'], ['BASED', 'Based'], ['SIGMA', 'Sigma Male'],
    ['GIGABRAIN', 'Gigabrain'], ['APE2', 'Ape 2024'], ['RUG', 'Rug Pull Inu'], ['SAFE', 'SafeMoon V3'],
];
const DEX_NAMES = ['Uniswap V3', 'Raydium', 'PancakeSwap', 'Aerodrome', 'Orca', 'Camelot'];

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '25');

        const pairs = Array.from({ length: Math.min(limit, 25) }).map((_, i) => {
            const ageMins = Math.floor(Math.random() * 119) + 1;      // 1–119 mins
            const mcap = Math.random() * 2_000_000 + 8_000;           // $8K–$2M
            const fdv  = mcap * (Math.random() * 2 + 1);              // FDV > MCap
            const liq  = mcap * (Math.random() * 0.45 + 0.05);        // 5–50% of MCap

            const isScam      = Math.random() > 0.62;                 // ~38% verified
            const nameIdx     = Math.floor(Math.random() * REALISTIC_NAMES.length);
            const dexName     = DEX_NAMES[Math.floor(Math.random() * DEX_NAMES.length)];
            const chains      = ['solana', 'base', 'ethereum', 'arbitrum', 'bsc'];
            const chain       = chains[Math.floor(Math.random() * chains.length)];
            const isSolana    = chain === 'solana';

            // Realistic price movement deltas
            const priceRaw = Math.random() * 0.009 + 0.000001;
            const pct5m  = parseFloat(((Math.random() - 0.45) * 40).toFixed(2));   // -18% to +22%
            const pct1h  = parseFloat(((Math.random() - 0.40) * 120).toFixed(2));  // -48% to +72%
            const pct6h  = parseFloat(((Math.random() - 0.38) * 200).toFixed(2));  // -76% to +124%
            const pct24h = parseFloat(((Math.random() - 0.35) * 400).toFixed(2));  // -140% to +260%

            // Trader analytics
            const makers     = Math.floor(Math.random() * 980 + 20);               // 20–1000 unique wallets
            const snipers    = isScam ? Math.floor(Math.random() * 60 + 20) : Math.floor(Math.random() * 8);
            const insiders   = isScam ? Math.floor(Math.random() * 10 + 2)  : 0;
            const buyTax     = isScam ? Math.floor(Math.random() * 15 + 1)  : Math.floor(Math.random() * 2);
            const sellTax    = isScam ? Math.floor(Math.random() * 25 + 1)  : Math.floor(Math.random() * 2);

            // Buys vs Sells
            const m5Buys    = Math.floor(Math.random() * 200 + 5);
            const m5Sells   = Math.floor(Math.random() * (isScam ? 180 : 80) + 3);
            const h1Buys    = Math.floor(Math.random() * 1200 + 10);
            const h1Sells   = Math.floor(h1Buys * (isScam ? 0.8 : 0.6));

            return {
                id:       `pair-${Date.now()}-${i}`,
                pairAddress: `0x${Math.random().toString(16).slice(2).padEnd(40, '0')}`,
                baseToken: {
                    address: isSolana
                        ? `${Math.random().toString(36).substring(2, 8).toUpperCase()}...${Math.random().toString(36).substring(2, 6).toUpperCase()}`
                        : `0x${Math.random().toString(16).slice(2).padEnd(40, '0')}`,
                    name:   REALISTIC_NAMES[nameIdx][1],
                    symbol: REALISTIC_NAMES[nameIdx][0],
                },
                quoteToken: {
                    symbol: isSolana ? 'SOL' : chain === 'bsc' ? 'WBNB' : 'WETH',
                },
                chain,
                dex: dexName,
                priceUsd:    priceRaw.toFixed(8),
                priceChange: { m5: pct5m, h1: pct1h, h6: pct6h, h24: pct24h },
                txns: {
                    m5: { buys: m5Buys, sells: m5Sells },
                    h1: { buys: h1Buys, sells: h1Sells },
                },
                volume: {
                    m5:  parseFloat((liq * Math.random() * 0.3).toFixed(2)),
                    h1:  parseFloat((liq * Math.random() * 2.0).toFixed(2)),
                    h6:  parseFloat((liq * Math.random() * 5.0).toFixed(2)),
                    h24: parseFloat((liq * Math.random() * 10.0).toFixed(2)),
                },
                liquidity: { usd: parseFloat(liq.toFixed(2)) },
                fdv:  parseFloat(fdv.toFixed(2)),
                mcap: parseFloat(mcap.toFixed(2)),
                pairCreatedAt: Date.now() - ageMins * 60_000,
                traders: { makers, snipers, insiders },
                taxes:   { buy: buyTax, sell: sellTax },
                security: {
                    lpBurned:            !isScam,
                    mintRevoked:         !isScam,
                    top10HoldersPercent: isScam
                        ? parseFloat((Math.random() * 40 + 55).toFixed(1))
                        : parseFloat((Math.random() * 20 + 8).toFixed(1)),
                    honeypotRisk:        isScam && Math.random() > 0.6,
                    contractVerified:    !isScam,
                    score:               isScam ? Math.floor(Math.random() * 35) : Math.floor(Math.random() * 35 + 65),
                },
            };
        });

        // Sort newest first
        pairs.sort((a, b) => b.pairCreatedAt - a.pairCreatedAt);

        return NextResponse.json({ pairs, generatedAt: new Date().toISOString() });

    } catch (e: any) {
        console.error('New Pairs API Error:', e);
        return NextResponse.json({ error: 'Failed to fetch new pairs stream' }, { status: 500 });
    }
}
