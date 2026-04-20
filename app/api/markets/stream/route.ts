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
            const results = await Promise.allSettled(
                Object.entries(UNISWAP_V3_POOLS).map(async ([symbol, [poolAddr, token0IsBase, d0, d1]]) => {
                    const res = await fetch(ep, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            jsonrpc: "2.0",
                            id: 1,
                            method: "eth_call",
                            params: [{
                                to: poolAddr,
                                data: "0x3850c7bd" // slot0()
                            }, "latest"]
                        }),
                        cache: 'no-store'
                    });
                    
                    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
                    const nodeData = await res.json();
                    if (nodeData.error) throw new Error(nodeData.error.message);
                    if (!nodeData.result) throw new Error("No result in RPC response");
                    
                    // sqrtPriceX96 is the first 32 bytes (64 hex chars + 2 for '0x')
                    const sqrtPriceX96Hex = "0x" + nodeData.result.substring(2, 66);
                    const sqrtPriceX96 = BigInt(sqrtPriceX96Hex);
                    
                    const sqrtPrice = Number(sqrtPriceX96) / (2 ** 96);
                    const rawPrice = sqrtPrice * sqrtPrice * (10 ** d0) / (10 ** d1);
                    const price = token0IsBase ? rawPrice : (rawPrice > 0 ? 1 / rawPrice : 0);
                    prices[symbol] = price;
                })
            );
            // If we got at least one price, the endpoint is healthy
            if (Object.keys(prices).length > 0) break;
            else {
                console.warn(`[API] RPC ${ep} returns empty slot0 results.`);
            }
        } catch (e) {
            console.error('[API] Provider exception:', e);
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

    // ── Step 2: Fallback or Enrich with GetBlock on-chain prices ─────
    const onChainPrices = await fetchOnChainPrices();

    if (marketData) {
        // ENRICH EXISTING DATA
        if (Object.keys(onChainPrices).length > 0) {
            marketData = marketData.map((t: any) => {
                const onChain = onChainPrices[t.symbol];
                if (onChain && onChain > 0) {
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
    } else {
        // TRUE ON-CHAIN FALLBACK (Zero-Mock strictness)
        if (Object.keys(onChainPrices).length > 0) {
            marketData = [];
            for (const [symbol, price] of Object.entries(onChainPrices)) {
                marketData.push({
                    symbol,
                    lastPrice: price.toFixed(6),
                    priceChangePercent: "0.00",
                    quoteVolume: "0.00",
                    source: 'getblock-onchain',
                    getblockVerified: true,
                    onChainPrice: price.toFixed(6),
                    onChainValidated: true,
                });
            }
            source = 'getblock-onchain';
            
            // Add other priority symbols with 0 data to prevent UI breakage
            for (const pSym of Array.from(PRIORITY_SYMBOLS)) {
                 if (!marketData.find(m => m.symbol === pSym)) {
                     marketData.push({
                         symbol: pSym,
                         lastPrice: "0.00",
                         priceChangePercent: "0.00",
                         quoteVolume: "0.00",
                         source: 'getblock-degraded'
                     });
                 }
            }
        }
    }

    // ── Step 3: If ALL sources failed, enforce fail-fast 503 error ──
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
