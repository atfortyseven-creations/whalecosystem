import { createPublicClient, http, fallback, PublicClient } from 'viem';
import { mainnet, bsc, optimism, base, polygon, arbitrum, avalanche } from 'viem/chains';

// ─── ALCHEMY FALLBACK KEY ───────────────────────────────────────────────────
const ALCHEMY_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || 'demo';

// ─── WORLDCHAIN (chainId=480) ─────────────────────────────────────────────────
const worldchain = {
  id: 480,
  name: 'World Chain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://worldchain-mainnet.g.alchemy.com/public'] },
  },
};

// ─── ADVANCED RPC CACHE INTERCEPTOR ───────────────────────────────────────────
// This caching layer memorizes identical JSON-RPC reads (e.g. eth_call, eth_chainId)
// for a few seconds to dramatically crush CU usage when multiple components request the same data.

const rpcCache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL_MS = 2500; // 2.5 seconds cache deduplication for extreme CU savings

const crypto = globalThis.crypto;

async function hashRequest(body: string): Promise<string> {
    // A quick hash of the RPC body to serve as cache key
    // Using simple hashing for speed rather than full SHA-256
    let hash = 0;
    for (let i = 0; i < body.length; i++) {
        const char = body.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
}

const memoizedFetch = (url: string) => {
    return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        // Only intercept POST JSON-RPC requests
        if (init?.method === 'POST' && typeof init.body === 'string') {
            try {
                const bodyObj = JSON.parse(init.body);
                // Only cache safe read methods
                const isReadMethod = Array.isArray(bodyObj) 
                    ? bodyObj.every(b => ['eth_call', 'eth_chainId', 'eth_blockNumber', 'eth_gasPrice'].includes(b.method))
                    : ['eth_call', 'eth_chainId', 'eth_blockNumber', 'eth_gasPrice'].includes(bodyObj.method);

                if (isReadMethod) {
                    const cacheKey = `${url}_${await hashRequest(init.body)}`;
                    const cached = rpcCache.get(cacheKey);
                    
                    if (cached && cached.expiry > Date.now()) {
                        // console.log(`[RPC-ENGINE] CU SAVED! 🛡️ Cache hit for ${url}`);
                        return new Response(JSON.stringify(cached.data), {
                            status: 200,
                            headers: { 'Content-Type': 'application/json' }
                        });
                    }

                    // Execute real network request
                    const response = await fetch(input, init);
                    if (response.ok) {
                        const clone = response.clone();
                        const data = await clone.json();
                        rpcCache.set(cacheKey, { data, expiry: Date.now() + CACHE_TTL_MS });
                    }
                    return response;
                }
            } catch (e) {
                // Fallback to normal fetch if parsing fails
            }
        }
        return fetch(input, init);
    }
}

// Helper to create hyper-optimized HTTP transports
const createOptimizedTransport = (primaryUrl: string, fallbackUrl?: string) => {
    const transports = [
        http(primaryUrl, {
            fetchOptions: { cache: 'no-store' },
            batch: {
                batchSize: 4096,
                wait: 100 // 100ms multicall gathering
            },
            fetchFn: memoizedFetch(primaryUrl)
        })
    ];

    if (fallbackUrl) {
        transports.push(
            http(fallbackUrl, {
                fetchOptions: { cache: 'no-store' },
                batch: { batchSize: 4096, wait: 100 },
                fetchFn: memoizedFetch(fallbackUrl)
            })
        );
    }

    return fallback(transports, { rank: false });
};

// ─── HYPER-OPTIMIZED VIEM CLIENTS ─────────────────────────────────────────────

// GetBlock EP1 JSON-RPC (User Portfolio / primary reads) + EP4 (Market Intel) + Alchemy (Fallback)
const GETBLOCK_EP1 = process.env.GETBLOCK_ETH_RPC_1 || 'https://go.getblock.io/441dd184fb9740e9af094500d43bd0f8';
const GETBLOCK_EP4 = process.env.GETBLOCK_ETH_RPC_4 || 'https://go.getblock.io/28362d2830a5473a840edab3fda9fc3c';

export const mainnetClient = createPublicClient({
    chain: mainnet,
    transport: createOptimizedTransport(
        GETBLOCK_EP1,
        `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`
    )
});

// Dedicated market-intel client using EP4 (slot0/getReserves calls)
export const marketIntelClient = createPublicClient({
    chain: mainnet,
    transport: createOptimizedTransport(
        GETBLOCK_EP4,
        GETBLOCK_EP1  // Fallback to EP1 if EP4 is rate-limited
    )
});

export const bscClient = createPublicClient({
    chain: bsc,
    transport: createOptimizedTransport(
        'https://go.getblock.us/bfb53e7124d44e55beaab2f172b43cfe',
        `https://bsc-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}` // Fallback if GetBlock has issues
    )
});

export const optimismClient = createPublicClient({
    chain: optimism,
    transport: createOptimizedTransport(`https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`)
});

export const baseClient = createPublicClient({
    chain: base,
    transport: createOptimizedTransport(`https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`)
});

export const polygonClient = createPublicClient({
    chain: polygon,
    transport: createOptimizedTransport(`https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`)
});

export const arbitrumClient = createPublicClient({
    chain: arbitrum,
    transport: createOptimizedTransport(`https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`)
});

export const avalancheClient = createPublicClient({
    chain: avalanche,
    transport: createOptimizedTransport(`https://avalanche-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`)
});

export const worldchainClient = createPublicClient({
    //@ts-ignore Custom chain def
    chain: worldchain,
    transport: createOptimizedTransport(`https://worldchain-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`)
});

// Helper for dynamic chain selection
export const getClientForChain = (chainId: number): PublicClient => {
    switch (chainId) {
        case 1: return mainnetClient as any;
        case 56: return bscClient as any;
        case 10: return optimismClient as any;
        case 8453: return baseClient as any;
        case 137: return polygonClient as any;
        case 42161: return arbitrumClient as any;
        case 43114: return avalancheClient as any;
        case 480: return worldchainClient as any;
        default: return mainnetClient as any; // Fallback to mainnet
    }
};
