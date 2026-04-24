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
// Deduplication de requests identicos en ventana de 2.5s para ahorrar CUs
const rpcCache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL_MS = 2500;

async function hashRequest(body: string): Promise<string> {
  let hash = 0;
  for (let i = 0; i < body.length; i++) {
    const char = body.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

const memoizedFetch = (url: string) => {
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    if (init?.method === 'POST' && typeof init.body === 'string') {
      try {
        const bodyObj = JSON.parse(init.body);
        const isReadMethod = Array.isArray(bodyObj)
          ? bodyObj.every(b => ['eth_call', 'eth_chainId', 'eth_blockNumber', 'eth_gasPrice'].includes(b.method))
          : ['eth_call', 'eth_chainId', 'eth_blockNumber', 'eth_gasPrice'].includes(bodyObj.method);

        if (isReadMethod) {
          const cacheKey = `${url}_${await hashRequest(init.body)}`;
          const cached = rpcCache.get(cacheKey);
          if (cached && cached.expiry > Date.now()) {
            return new Response(JSON.stringify(cached.data), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            });
          }
          const response = await fetch(input, init);
          if (response.ok) {
            const clone = response.clone();
            const data = await clone.json();
            rpcCache.set(cacheKey, { data, expiry: Date.now() + CACHE_TTL_MS });
          }
          return response;
        }
      } catch (e) {
        // Fallback a fetch normal si falla el parse
      }
    }
    return fetch(input, init);
  };
};

// ─── ENDPOINTS PREMIUM DE ÉLITE (Actualizados) ────────────────────────────────
const ETH_EP1 = process.env.ETH_RPC_URL || 'https://go.getblock.us/e0e9fc3bf3f74c4db2759392a55b2a98';
const ETH_WSS = process.env.GETBLOCK_ETH_WS || 'wss://go.getblock.us/9696e0f1b71f4631a0aeed3f21d64487';

const BNB_EP1 = process.env.BNB_RPC_URL || 'https://go.getblock.us/c39669e8418247d893bb024c0c552950';

// ─── Helper: construye transport con TODOS los endpoints en orden ─────────────
const makeTransport = (urls: string[]) =>
  fallback(
    urls.map(url =>
      http(url, {
        fetchOptions: { cache: 'no-store' },
        batch: { batchSize: 512, wait: 50 },
        fetchFn: memoizedFetch(url),
        retryCount: 2,
        retryDelay: 500,
        timeout: 8_000,
      })
    ),
    { rank: false }
  );

// ─── CLIENTES VIEM ─────────────────────────────────────────────────────────────

// Ethereum Mainnet — Premium Pool + Public Fallbacks
export const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: makeTransport([
    ETH_EP1,
    `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
    'https://cloudflare-eth.com',
    'https://rpc.ankr.com/eth',
    'https://eth.llamarpc.com',
  ]),
});

// Market Intel — Rotación cruzada para evitar rate-limit
export const marketIntelClient = createPublicClient({
  chain: mainnet,
  transport: makeTransport([
    ETH_EP1,
    `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
    'https://eth.drpc.org',
  ]),
});

// BNB Chain — Premium Pool + Public Fallbacks
export const bscClient = createPublicClient({
  chain: bsc,
  transport: makeTransport([
    BNB_EP1,
    'https://bsc-dataseed1.binance.org',
    'https://bsc-dataseed2.binance.org',
    'https://rpc.ankr.com/bsc',
    `https://bnb-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  ]),
});

// Optimism
export const optimismClient = createPublicClient({
  chain: optimism,
  transport: makeTransport([
    `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
    'https://mainnet.optimism.io',
    'https://rpc.ankr.com/optimism',
  ]),
});

// Base
export const baseClient = createPublicClient({
  chain: base,
  transport: makeTransport([
    `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
    'https://mainnet.base.org',
    'https://rpc.ankr.com/base',
    'https://base.drpc.org',
  ]),
});

// Polygon
export const polygonClient = createPublicClient({
  chain: polygon,
  transport: makeTransport([
    `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
    'https://polygon-rpc.com',
    'https://rpc.ankr.com/polygon',
    'https://polygon.llamarpc.com',
  ]),
});

// Arbitrum
export const arbitrumClient = createPublicClient({
  chain: arbitrum,
  transport: makeTransport([
    `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
    'https://arb1.arbitrum.io/rpc',
    'https://rpc.ankr.com/arbitrum',
  ]),
});

// Avalanche
export const avalancheClient = createPublicClient({
  chain: avalanche,
  transport: makeTransport([
    `https://avalanche-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
    'https://api.avax.network/ext/bc/C/rpc',
  ]),
});

// WorldChain
export const worldchainClient = createPublicClient({
  //@ts-ignore Custom chain def
  chain: worldchain,
  transport: makeTransport([
    `https://worldchain-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
    'https://worldchain-mainnet.g.alchemy.com/public',
  ]),
});

// ─── Helper de selección dinámica de chain ─────────────────────────────────
export const getClientForChain = (chainId: number): PublicClient => {
  switch (chainId) {
    case 1:     return mainnetClient as any;
    case 56:    return bscClient as any;
    case 10:    return optimismClient as any;
    case 8453:  return baseClient as any;
    case 137:   return polygonClient as any;
    case 42161: return arbitrumClient as any;
    case 43114: return avalancheClient as any;
    case 480:   return worldchainClient as any;
    default:    return mainnetClient as any;
  }
};
