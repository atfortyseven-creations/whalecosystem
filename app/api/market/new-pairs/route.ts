import { NextResponse } from 'next/server';
import Redis from 'ioredis';

export const revalidate = 0;

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// ── DexScreener "latest" pairs endpoint ────────────────────────────────────
// Returns the freshest pairs across chains with full metadata
const DEXSCREENER_URL = 'https://api.dexscreener.com/latest/dex/search?q=USDT';
const DEXSCREENER_NEW = 'https://api.dexscreener.com/token-profiles/latest/v1';

function mapDexPair(p: any, idx: number) {
    const chain = (p.chainId || 'ethereum').toLowerCase().replace('bsc', 'bsc');
    const ca = p.priceChange || {};
    const txns = p.txns || {};
    const m5 = txns.m5 || {};
    const liq = p.liquidity || {};
    
    // Derive a security score heuristic from available data
    const hasliq = (liq.usd || 0) > 1000;
    const score = hasliq ? Math.min(100, 60 + Math.floor((liq.usd || 0) / 50000)) : 30;
    
    return {
        id: p.pairAddress || `pair_${idx}`,
        chain: chain.includes('solana') ? 'solana' :
               chain.includes('bsc') || chain.includes('bnb') ? 'bsc' :
               chain.includes('arb') ? 'arbitrum' :
               chain.includes('base') ? 'base' :
               chain.includes('opt') ? 'ethereum' : 'ethereum',
        dex: p.dexId ? p.dexId.charAt(0).toUpperCase() + p.dexId.slice(1) : 'DEX',
        baseToken: {
            symbol: p.baseToken?.symbol || '???',
            name: p.baseToken?.name || 'Unknown Asset',
        },
        quoteToken: { symbol: p.quoteToken?.symbol || 'USDT' },
        priceUsd: p.priceUsd ? parseFloat(p.priceUsd).toFixed(p.priceUsd < 0.001 ? 8 : 4) : '0.00',
        pairCreatedAt: p.pairCreatedAt || (Date.now() - idx * 900000),
        priceChange: {
            m5:  parseFloat(ca.m5  || '0'),
            h1:  parseFloat(ca.h1  || '0'),
            h6:  parseFloat(ca.h6  || '0'),
            h24: parseFloat(ca.h24 || '0'),
        },
        liquidity: { usd: liq.usd || 0 },
        mcap: p.marketCap || 0,
        fdv:  p.fdv || 0,
        txns: { m5: { buys: m5.buys || 0, sells: m5.sells || 0 } },
        traders: { makers: p.makers || 1, snipers: 0 },
        security: {
            score,
            honeypotRisk: score < 40,
            lpBurned: score > 70,
            mintRevoked: score > 60,
        },
        taxes: { buy: 0, sell: 0 },
    };
}

function getDemoPairs(limit: number) {
    const chains = ['solana', 'ethereum', 'base', 'bsc', 'arbitrum'];
    const dexes = ['Raydium', 'Uniswap V3', 'Aerodrome', 'PancakeSwap', 'SushiSwap'];
    const names = ['AIX', 'NEURO', 'ZETA', 'ALPHA', 'OMEGA', 'PEPE2', 'DOGX', 'CATS', 'BULL', 'BEAR'];
    
    return Array.from({ length: Math.min(limit, 15) }).map((_, i) => {
        const chain = chains[i % chains.length];
        const dex = dexes[i % dexes.length];
        const sym = names[i % names.length];
        const age = Date.now() - (Math.random() * 8000000);
        return {
            id: `pair_demo_${i}`,
            chain, dex,
            baseToken: { symbol: sym, name: `${sym} Protocol` },
            quoteToken: { symbol: chain === 'solana' ? 'SOL' : 'WETH' },
            priceUsd: (Math.random() * 0.05).toFixed(4),
            pairCreatedAt: age,
            priceChange: {
                m5: parseFloat(((Math.random() * 20) - 5).toFixed(2)),
                h1: parseFloat(((Math.random() * 50) - 10).toFixed(2)),
                h6: parseFloat(((Math.random() * 100) - 20).toFixed(2)),
                h24: parseFloat(((Math.random() * 200) - 30).toFixed(2))
            },
            liquidity: { usd: 10000 + Math.random() * 500000 },
            mcap: 50000 + Math.random() * 2000000,
            fdv: 50000 + Math.random() * 2000000,
            txns: { m5: { buys: Math.floor(Math.random() * 100), sells: Math.floor(Math.random() * 50) } },
            traders: { makers: Math.floor(Math.random() * 500) + 10, snipers: Math.floor(Math.random() * 5) },
            security: {
                score: 50 + Math.floor(Math.random() * 45),
                honeypotRisk: Math.random() > 0.9,
                lpBurned: Math.random() > 0.5,
                mintRevoked: Math.random() > 0.5
            },
            taxes: { buy: 0, sell: 0 }
        };
    });
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '25', 10);
    
    let nativeWeb3Pairs: any[] = [];
    try {
        const raw = await redis.get('latest_defi_pairs');
        if (raw) nativeWeb3Pairs = JSON.parse(raw);
    } catch (e) {
        console.warn("[NEW-PAIRS] Secondary Web3 cache unreachable");
    }

    try {
        // ── Primary: DexScreener latest pairs across all chains ──
        const dsRes = await fetch(
            'https://api.dexscreener.com/latest/dex/search?q=USDT',
            { cache: 'no-store', headers: { 'Accept': 'application/json' }, signal: AbortSignal.timeout(8000) }
        );

        if (dsRes.ok) {
            const ds = await dsRes.json();
            if (ds?.pairs && Array.isArray(ds.pairs) && ds.pairs.length > 0) {
                // Sort by pairCreatedAt descending — newest first
                const sorted = [...ds.pairs]
                    .filter(p => p?.baseToken?.symbol && p?.priceUsd)
                    .sort((a, b) => (b.pairCreatedAt || 0) - (a.pairCreatedAt || 0))
                    .slice(0, limit);

                const pairs = sorted.map((p, i) => mapDexPair(p, i));
                
                // Merge True Web3 Scanned Pairs + Aggregated Pairs
                const combined = [...nativeWeb3Pairs, ...pairs].slice(0, limit);
                
                return NextResponse.json({ pairs: combined, source: 'hybrid_web3_dexscreener' });
            }
        }
    } catch (e) {
        console.error('[NEW-PAIRS] DexScreener fetch failed:', e);
    }

    // Unbreakable Fallback
    const fallbackPairs = getDemoPairs(limit);
    const combined = [...nativeWeb3Pairs, ...fallbackPairs].slice(0, limit);
    return NextResponse.json({ pairs: combined, fallback: 'synthetic' });
}
