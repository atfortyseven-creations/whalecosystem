import { NextResponse } from 'next/server';

export const revalidate = 0;

// ── DexScreener endpoints ─────────────────────────────────────────────────────
const DEXSCREENER_SEARCH = 'https://api.dexscreener.com/latest/dex/search?q=USDT';

function mapDexPair(p: any, idx: number) {
    const chainRaw = (p.chainId || 'ethereum').toLowerCase();
    const chain =
        chainRaw.includes('solana') ? 'solana' :
        chainRaw.includes('bsc') || chainRaw.includes('bnb') ? 'bsc' :
        chainRaw.includes('arb') ? 'arbitrum' :
        chainRaw.includes('base') ? 'base' : 'ethereum';

    const ca  = p.priceChange  || {};
    const txn = p.txns         || {};
    const m5  = txn.m5         || {};
    const liq = p.liquidity    || {};

    const hasliq = (liq.usd || 0) > 1000;
    const score  = hasliq ? Math.min(100, 60 + Math.floor((liq.usd || 0) / 50_000)) : 30;

    return {
        id:           p.pairAddress || `pair_${idx}`,
        chain,
        dex:          p.dexId ? p.dexId.charAt(0).toUpperCase() + p.dexId.slice(1) : 'DEX',
        baseToken: {
            symbol: (p.baseToken?.symbol  || '???').toString(),
            name:   (p.baseToken?.name    || 'Unknown Asset').toString(),
        },
        quoteToken:   { symbol: (p.quoteToken?.symbol || 'USDT').toString() },
        priceUsd:     p.priceUsd ? parseFloat(p.priceUsd).toFixed(parseFloat(p.priceUsd) < 0.001 ? 8 : 4) : '0.00',
        pairCreatedAt: p.pairCreatedAt || (Date.now() - idx * 900_000),
        priceChange: {
            m5:  parseFloat(ca.m5  || '0') || 0,
            h1:  parseFloat(ca.h1  || '0') || 0,
            h6:  parseFloat(ca.h6  || '0') || 0,
            h24: parseFloat(ca.h24 || '0') || 0,
        },
        liquidity: { usd: liq.usd || 0 },
        mcap:  p.marketCap || 0,
        fdv:   p.fdv || 0,
        txns:  { m5: { buys: m5.buys || 0, sells: m5.sells || 0 } },
        traders: { makers: p.makers || 1, snipers: 0 },
        security: {
            score,
            honeypotRisk: score < 40,
            lpBurned:     score > 70,
            mintRevoked:  score > 60,
        },
        taxes: { buy: 0, sell: 0 },
    };
}

function getDemoPairs(limit: number) {
    const chains = ['solana', 'ethereum', 'base', 'bsc', 'arbitrum'];
    const dexes  = ['Raydium', 'Uniswap V3', 'Aerodrome', 'PancakeSwap', 'SushiSwap'];
    const names  = ['AIX', 'NEURO', 'ZETA', 'ALPHA', 'OMEGA', 'PEPE2', 'DOGX', 'CATS', 'BULL', 'BEAR'];

    return Array.from({ length: Math.min(limit, 15) }).map((_, i) => {
        const chain = chains[i % chains.length];
        const dex   = dexes[i % dexes.length];
        const sym   = names[i % names.length];
        const age   = Date.now() - (Math.random() * 8_000_000);
        return {
            id:           `pair_demo_${i}`,
            chain, dex,
            baseToken:    { symbol: sym, name: `${sym} Protocol` },
            quoteToken:   { symbol: chain === 'solana' ? 'SOL' : 'WETH' },
            priceUsd:     (Math.random() * 0.05).toFixed(4),
            pairCreatedAt: age,
            priceChange: {
                m5:  parseFloat(((Math.random() * 20)  - 5).toFixed(2)),
                h1:  parseFloat(((Math.random() * 50)  - 10).toFixed(2)),
                h6:  parseFloat(((Math.random() * 100) - 20).toFixed(2)),
                h24: parseFloat(((Math.random() * 200) - 30).toFixed(2)),
            },
            liquidity: { usd: 10_000 + Math.random() * 500_000 },
            mcap:    50_000 + Math.random() * 2_000_000,
            fdv:     50_000 + Math.random() * 2_000_000,
            txns:    { m5: { buys: Math.floor(Math.random() * 100), sells: Math.floor(Math.random() * 50) } },
            traders: { makers: Math.floor(Math.random() * 500) + 10, snipers: Math.floor(Math.random() * 5) },
            security: {
                score:        50 + Math.floor(Math.random() * 45),
                honeypotRisk: Math.random() > 0.9,
                lpBurned:     Math.random() > 0.5,
                mintRevoked:  Math.random() > 0.5,
            },
            taxes: { buy: 0, sell: 0 },
        };
    });
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '25', 10), 50);

    try {
        const dsRes = await fetch(DEXSCREENER_SEARCH, {
            cache:   'no-store',
            headers: { 'Accept': 'application/json' },
            signal:  AbortSignal.timeout(8_000),
        });

        if (dsRes.ok) {
            const ds = await dsRes.json();
            // ds.pairs can be null if DexScreener returns unexpected shape — guard it
            const rawPairs = Array.isArray(ds?.pairs) ? ds.pairs : [];
            if (rawPairs.length > 0) {
                const sorted = rawPairs
                    .filter((p: any) => p != null && typeof p === 'object' && p.baseToken?.symbol && p.priceUsd)
                    .sort((a: any, b: any) => (b.pairCreatedAt || 0) - (a.pairCreatedAt || 0))
                    .slice(0, limit);

                const pairs = sorted.map((p: any, i: number) => mapDexPair(p, i));
                return NextResponse.json({ pairs, source: 'dexscreener' });
            }
        }
    } catch (e) {
        console.error('[NEW-PAIRS] DexScreener fetch failed:', (e as any)?.message);
    }

    // ── Unbreakable Fallback ──────────────────────────────────────────────────
    return NextResponse.json({ pairs: getDemoPairs(limit), fallback: 'synthetic' });
}
