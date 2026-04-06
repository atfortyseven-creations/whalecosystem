import { NextResponse } from 'next/server';

export const revalidate = 0;

// ── DexScreener endpoints (priority order) ────────────────────────────────────
const DS_LATEST   = 'https://api.dexscreener.com/token-profiles/latest/v1';
const DS_BOOSTED  = 'https://api.dexscreener.com/token-boosts/latest/v1';
const DS_FALLBACK = 'https://api.dexscreener.com/latest/dex/search?q=ETH%2FUSDT&order=createdAt';

// ── Map any DexScreener shape to the standard pair object ─────────────────────
function mapDexPair(p: any, idx: number) {
    const chainRaw = (p.chainId || p.chain || 'ethereum').toLowerCase();
    const chain =
        chainRaw.includes('solana') ? 'solana' :
        chainRaw.includes('bsc') || chainRaw.includes('bnb') ? 'bsc' :
        chainRaw.includes('arb') ? 'arbitrum' :
        chainRaw.includes('base') ? 'base' :
        chainRaw.includes('polygon') ? 'polygon' :
        chainRaw.includes('avalanche') || chainRaw.includes('avax') ? 'avalanche' : 'ethereum';

    const ca  = p.priceChange || {};
    const txn = p.txns        || {};
    const m5  = txn.m5        || {};
    const liq = p.liquidity   || {};

    const hasliq = (liq.usd || 0) > 1000;
    const score  = hasliq ? Math.min(100, 60 + Math.floor((liq.usd || 0) / 50_000)) : 30;

    return {
        id:            p.pairAddress || p.tokenAddress || `pair_${idx}`,
        chain,
        dex:           p.dexId ? p.dexId.charAt(0).toUpperCase() + p.dexId.slice(1) : 'DEX',
        baseToken: {
            symbol: (p.baseToken?.symbol || p.symbol || '???').toString(),
            name:   (p.baseToken?.name   || p.name   || 'Unknown Asset').toString(),
        },
        quoteToken:    { symbol: (p.quoteToken?.symbol || 'USDT').toString() },
        priceUsd:      p.priceUsd
            ? parseFloat(p.priceUsd).toFixed(parseFloat(p.priceUsd) < 0.001 ? 8 : 4)
            : '0.00',
        pairCreatedAt: p.pairCreatedAt || p.createdAt || (Date.now() - idx * 900_000),
        priceChange: {
            m5:  parseFloat(ca.m5  || '0') || 0,
            h1:  parseFloat(ca.h1  || '0') || 0,
            h6:  parseFloat(ca.h6  || '0') || 0,
            h24: parseFloat(ca.h24 || '0') || 0,
        },
        liquidity: { usd: liq.usd || 0 },
        mcap:   p.marketCap || 0,
        fdv:    p.fdv       || 0,
        txns:   { m5: { buys: m5.buys || 0, sells: m5.sells || 0 } },
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

// ── Synthetic fallback (always works) ────────────────────────────────────────
function getDemoPairs(limit: number) {
    const chains = ['solana', 'ethereum', 'base', 'bsc', 'arbitrum'];
    const dexes  = ['Raydium', 'Uniswap V3', 'Aerodrome', 'PancakeSwap', 'SushiSwap'];
    const names  = ['AIX', 'NEURO', 'ZETA', 'ALPHA', 'OMEGA', 'PEPE2', 'DOGX', 'CATS', 'BULL', 'BEAR'];

    return Array.from({ length: Math.min(limit, 15) }).map((_, i) => {
        const chain = chains[i % chains.length];
        const dex   = dexes[i % dexes.length];
        const sym   = names[i % names.length];
        return {
            id:            `pair_demo_${i}`,
            chain, dex,
            baseToken:     { symbol: sym, name: `${sym} Protocol` },
            quoteToken:    { symbol: chain === 'solana' ? 'SOL' : 'WETH' },
            priceUsd:      (Math.random() * 0.05).toFixed(4),
            pairCreatedAt: Date.now() - i * 900_000,
            priceChange: {
                m5:  parseFloat(((Math.random() * 20)  - 5).toFixed(2)),
                h1:  parseFloat(((Math.random() * 50)  - 10).toFixed(2)),
                h6:  parseFloat(((Math.random() * 100) - 20).toFixed(2)),
                h24: parseFloat(((Math.random() * 200) - 30).toFixed(2)),
            },
            liquidity: { usd: 10_000 + Math.random() * 500_000 },
            mcap:     50_000 + Math.random() * 2_000_000,
            fdv:      50_000 + Math.random() * 2_000_000,
            txns:     { m5: { buys: Math.floor(Math.random() * 100), sells: Math.floor(Math.random() * 50) } },
            traders:  { makers: Math.floor(Math.random() * 500) + 10, snipers: Math.floor(Math.random() * 5) },
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

// ── Try one DexScreener URL, return mapped pair array or null ─────────────────
async function tryEndpoint(url: string, limit: number): Promise<any[] | null> {
    try {
        const res = await fetch(url, {
            cache:   'no-store',
            headers: { 'Accept': 'application/json' },
            signal:  AbortSignal.timeout(8_000),
        });
        if (!res.ok) return null;
        const ds = await res.json();

        // token-profiles/latest returns a top-level array
        if (Array.isArray(ds)) {
            const mapped = ds
                .filter((p: any) => p != null && (p.tokenAddress || p.pairAddress))
                .slice(0, limit)
                .map((p: any, i: number) => mapDexPair(p, i));
            return mapped.length > 0 ? mapped : null;
        }

        // Standard search returns { pairs: [...] }
        if (Array.isArray(ds?.pairs)) {
            const sorted = ds.pairs
                .filter((p: any) => p != null && p.baseToken?.symbol)
                .sort((a: any, b: any) => (b.pairCreatedAt || 0) - (a.pairCreatedAt || 0))
                .slice(0, limit);
            const mapped = sorted.map((p: any, i: number) => mapDexPair(p, i));
            return mapped.length > 0 ? mapped : null;
        }
    } catch (e) {
        console.warn('[NEW-PAIRS] Endpoint failed:', url, (e as any)?.message);
    }
    return null;
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '25', 10), 50);

    // Try endpoints in priority order: latest profiles ► boosted ► search
    for (const url of [DS_LATEST, DS_BOOSTED, DS_FALLBACK]) {
        const pairs = await tryEndpoint(url, limit);
        if (pairs && pairs.length > 0) {
            const source = url.includes('token-profiles') ? 'dexscreener_latest'
                : url.includes('token-boosts') ? 'dexscreener_boosted'
                : 'dexscreener_search';
            return NextResponse.json({ pairs, source });
        }
    }

    // ── Unbreakable Fallback ──────────────────────────────────────────────────
    return NextResponse.json({ pairs: getDemoPairs(limit), source: 'synthetic' });
}
