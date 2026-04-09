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

// ─── TODOS LOS ENDPOINTS GETBLOCK ─────────────────────────────────────────────
// 6 endpoints en rotación — viem los usa en orden, pasando al siguiente
// cuando recibe error HTTP (401, 429, 5xx, timeout)
const GB_EP1 = 'https://go.getblock.us/0ac57185ddeb447ca7d3e9da9634899f';
const GB_EP2 = 'https://go.getblock.io/1dcc5db2c6f44108a6e1e3a00b9a3f0d';
const GB_EP3 = 'https://go.getblock.us/88747de304e04365ac4c85789ba4fe54';
const GB_EP4 = 'https://go.getblock.us/4ee0dd8f4e8346cbaad50e5a63274b24';
const GB_EP5 = 'https://go.getblock.io/85f2e6644087439c8b2b0ddc9bc0d234';
const GB_EP6 = 'https://go.getblock.io/a2c976b8451b445b8cd4b2226b9a4e0d';

// ─── Helper: construye transport con TODOS los endpoints en orden ─────────────
// rank: false → usa el primero disponible en orden, no el más rápido
// retryCount: 3 → reintenta 3 veces antes de pasar al siguiente transport
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

// Ethereum Mainnet — todos los GetBlock EPs + Alchemy como último recurso
export const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: makeTransport([
    GB_EP1, GB_EP2, GB_EP3, GB_EP4, GB_EP5, GB_EP6,
    `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
    'https://eth.llamarpc.com',
  ]),
});

// Market Intel client — mismo pool, orden diferente para distribución de carga
export const marketIntelClient = createPublicClient({
  chain: mainnet,
  transport: makeTransport([
    GB_EP3, GB_EP4, GB_EP5, GB_EP6, GB_EP1, GB_EP2,
    `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  ]),
});

// BSC — GetBlock EPs + fallbacks públicos
export const bscClient = createPublicClient({
  chain: bsc,
  transport: makeTransport([
    GB_EP1, GB_EP2, GB_EP3, GB_EP4, GB_EP5, GB_EP6,
    'https://bsc-dataseed1.binance.org',
    'https://bsc-dataseed2.binance.org',
    'https://bsc-dataseed1.defibit.io',
    `https://bnb-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  ]),
});

// Optimism
export const optimismClient = createPublicClient({
  chain: optimism,
  transport: makeTransport([
    GB_EP2, GB_EP4, GB_EP6,
    `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
    'https://mainnet.optimism.io',
  ]),
});

// Base
export const baseClient = createPublicClient({
  chain: base,
  transport: makeTransport([
    GB_EP1, GB_EP3, GB_EP5,
    `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
    'https://mainnet.base.org',
  ]),
});

// Polygon
export const polygonClient = createPublicClient({
  chain: polygon,
  transport: makeTransport([
    GB_EP6, GB_EP4, GB_EP2,
    `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
    'https://polygon.llamarpc.com',
  ]),
});

// Arbitrum
export const arbitrumClient = createPublicClient({
  chain: arbitrum,
  transport: makeTransport([
    GB_EP5, GB_EP3, GB_EP1,
    `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
    'https://arb1.arbitrum.io/rpc',
  ]),
});

// Avalanche
export const avalancheClient = createPublicClient({
  chain: avalanche,
  transport: makeTransport([
    GB_EP2, GB_EP4,
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
