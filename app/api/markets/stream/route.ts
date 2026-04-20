import { NextRequest, NextResponse } from 'next/server';
import * as ethers from 'ethers';

import { RpcRelayerManager } from '@/lib/blockchain/rpc-relayer';

export const dynamic = 'force-dynamic';

// ── In-memory cache (10s TTL) ─────────────────────────────────────────────────
let _cachedMarkets: any[] | null = null;
let _cacheTs = 0;
const CACHE_TTL_MS = 3_000;

// ── Uniswap V3 Pool addresses for on-chain price validation ──────────────────
// Format: symbol → [poolAddress, token0IsBase, token0Decimals, token1Decimals]
const UNISWAP_V3_POOLS: Record<string, [string, boolean, number, number]> = {
    'ETHUSDT':  ['0x4e68ccd3e89f51c3074ca5072bbac773960dfa36', false, 18, 6], // ETH/USDT 0.3%
    'BTCUSDT':  ['0x99ac8ca7087fa4a2a1fb6357269965a2014abc35', true,  8,  6], // WBTC/USDC 0.3%
    'LINKUSDT': ['0xa6cc3c2531fdaa6ae1a3ca84c2855806728693e8', false, 18, 6], // LINK/USDC
};

// ── Uniswap V3 slot0 ABI (returns sqrtPriceX96) ──────────────────────────────
const SLOT0_ABI = ['function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16, uint16, uint16, uint8, bool)'];

async function fetchOnChainPrices(): Promise<Record<string, number>> {
    const prices: Record<string, number> = {};
    for (let attempts = 0; attempts < 3; attempts++) {
        const ep = RpcRelayerManager.getRpcUrl('ETH', 'RPC');
        if (!ep) break;
        try {
            const provider = new ethers.JsonRpcProvider(ep, 1, { staticNetwork: true });
            const results = await Promise.allSettled(
                Object.entries(UNISWAP_V3_POOLS).map(async ([symbol, [poolAddr, token0IsBase, d0, d1]]) => {
                    const contract = new ethers.Contract(poolAddr, SLOT0_ABI, provider);
                    const [sqrtPriceX96] = await contract.slot0();
                    const sqrtPrice = Number(sqrtPriceX96) / (2 ** 96);
                    const rawPrice = sqrtPrice * sqrtPrice * (10 ** d0) / (10 ** d1);
                    const price = token0IsBase ? rawPrice : (rawPrice > 0 ? 1 / rawPrice : 0);
                    prices[symbol] = price;
                })
            );
            // If we got at least one price, the endpoint is healthy
            if (Object.keys(prices).length > 0) break;
        } catch {
            RpcRelayerManager.reportFailure('ETH', 'RPC', ep);
            continue;
        }
    }
    return prices;
}

// ── Binance REST (primary price feed) ────────────────────────────────────────
async function fetchBinanceMarkets(): Promise<any[] | null> {
    try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 5000);
        const res = await fetch('https://api.binance.com/api/v3/ticker/24hr', {
            cache: 'no-store',
            signal: controller.signal,
        });
        clearTimeout(id);
        if (!res.ok) return null;
        const raw = await res.json();
        return Array.isArray(raw) && raw.length > 0 ? raw : null;
    } catch {
        return null;
    }
}

// ── USDT pairs we want to surface (ordered by priority) ──────────────────────
const PRIORITY_SYMBOLS = new Set([
    'BTCUSDT','ETHUSDT','BNBUSDT','SOLUSDT','XRPUSDT','ADAUSDT',
    'DOGEUSDT','SHIBUSDT','DOTUSDT','AVAXUSDT','LINKUSDT','MATICUSDT',
    'UNIUSDT','ARBUSDT','OPUSDT','APTUSDT','INJUSDT','PEPEUSDT',
    'WIFUSDT','BONKUSDT','FLOKIUSDT','FETUSDT','NEARUSDT','LDOUSDT',
    'WLDUSDT','STRKUSDT','JUPUSDT','PYTHUSDT','TIAUSDT','BLURUSDT',
    'GMXUSDT','SUIUSDT','SEIUSDT','TONUSDT',
]);

// ... synthetic fallback purged ...

export async function GET(_req: NextRequest) {
    // ── Cache hit ─────────────────────────────────────────────────────────────
    if (_cachedMarkets && Date.now() - _cacheTs < CACHE_TTL_MS) {
        return NextResponse.json(
            { success: true, timestamp: _cacheTs, data: _cachedMarkets, source: 'cache' },
            { headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' } }
        );
    }

    // ── Step 1: Fetch Binance (primary) ───────────────────────────────────────
    let marketData = await fetchBinanceMarkets();
    let source = 'binance';

    // ── Step 2: Enrich with GetBlock on-chain prices if Binance succeeded ─────
    if (marketData) {
        try {
            const onChainPrices = await fetchOnChainPrices();
            if (Object.keys(onChainPrices).length > 0) {
                marketData = marketData.map((t: any) => {
                    const onChain = onChainPrices[t.symbol];
                    if (onChain && onChain > 0) {
                        // Validate: if on-chain price deviates >5% from Binance, flag it
                        const binancePrice = parseFloat(t.lastPrice);
                        const deviation = Math.abs(onChain - binancePrice) / binancePrice;
                        return {
                            ...t,
                            onChainPrice: onChain.toFixed(2),
                            onChainValidated: deviation < 0.05,
                            getblockVerified: true,
                        };
                    }
                    return t;
                });
                source = 'binance+getblock';
            }
        } catch {
            // On-chain enrichment failed — Binance data alone is still valid
        }
    }

    // ── Step 3: If Binance and GetBlock failed, enforce fail-fast 503 error ──
    if (!marketData) {
        return NextResponse.json({ error: 'Data sources unreachable' }, { status: 503 });
    }

    // ── Filter to priority USDT pairs + sort by volume for top display ────────
    const filtered = (marketData as any[]).filter(t => PRIORITY_SYMBOLS.has(t.symbol));
    const finalData = filtered.length > 0 ? filtered : marketData;

    _cachedMarkets = finalData;
    _cacheTs = Date.now();

    return NextResponse.json(
        { success: true, timestamp: _cacheTs, data: finalData, source },
        { headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' } }
    );
}
