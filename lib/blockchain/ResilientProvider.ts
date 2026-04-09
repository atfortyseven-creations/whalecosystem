import { ethers } from 'ethers';

interface RPCEndpoint {
  url: string;
  isHealthy: boolean;
  exhausted: boolean;
  errorCount: number;
  exhaustedAt?: number;
}

/**
 * ResilientProvider — Pool de 6 GetBlock endpoints con failover automático.
 *
 * Cuando un endpoint devuelve 401 (CU agotados), 429 (rate limit),
 * o falla repetidamente, se marca como exhausto y el sistema pasa al siguiente.
 * Después de 3 minutos de cooldown el endpoint se restaura automáticamente.
 *
 * EP1: https://go.getblock.us/0ac57185ddeb447ca7d3e9da9634899f
 * EP2: https://go.getblock.io/1dcc5db2c6f44108a6e1e3a00b9a3f0d
 * EP3: https://go.getblock.us/88747de304e04365ac4c85789ba4fe54
 * EP4: https://go.getblock.us/4ee0dd8f4e8346cbaad50e5a63274b24
 * EP5: https://go.getblock.io/85f2e6644087439c8b2b0ddc9bc0d234
 * EP6: https://go.getblock.io/a2c976b8451b445b8cd4b2226b9a4e0d
 */

// ── Todos los GetBlock endpoints del usuario ─────────────────────────────────
const GETBLOCK_POOL = [
  'https://go.getblock.us/0ac57185ddeb447ca7d3e9da9634899f', // EP1
  'https://go.getblock.io/1dcc5db2c6f44108a6e1e3a00b9a3f0d', // EP2
  'https://go.getblock.us/88747de304e04365ac4c85789ba4fe54', // EP3
  'https://go.getblock.us/4ee0dd8f4e8346cbaad50e5a63274b24', // EP4
  'https://go.getblock.io/85f2e6644087439c8b2b0ddc9bc0d234', // EP5
  'https://go.getblock.io/a2c976b8451b445b8cd4b2226b9a4e0d', // EP6
];

// Endpoints públicos de fallback cuando todos los GetBlock estén exhaustos
const BSC_PUBLIC_FALLBACKS = [
  'https://bsc-dataseed1.binance.org',
  'https://bsc-dataseed2.binance.org',
  'https://bsc-dataseed1.defibit.io',
];

const BASE_PUBLIC_FALLBACKS = [
  'https://mainnet.base.org',
  'https://base.llamarpc.com',
];

const POLYGON_PUBLIC_FALLBACKS = [
  'https://polygon.llamarpc.com',
  'https://polygon-rpc.com',
];

const ETH_PUBLIC_FALLBACKS = [
  'https://eth.llamarpc.com',
  'https://cloudflare-eth.com',
];

const EXHAUSTION_COOLDOWN_MS = 3 * 60 * 1000; // 3 minutos

export class ResilientProvider {
  private endpoints: RPCEndpoint[];
  private providers: ethers.JsonRpcProvider[];
  private wsProvider?: ethers.WebSocketProvider;
  private wssUrl?: string;
  private chainId: number;
  private networkCache?: ethers.Network;

  constructor(urls: string[], chainId: number = 1, wssUrl?: string) {
    this.chainId = chainId;
    this.wssUrl = wssUrl;

    const validUrls = urls.filter(u => u && u.startsWith('http'));
    if (validUrls.length === 0) {
      throw new Error('ResilientProvider: No valid RPC URLs provided');
    }

    this.endpoints = validUrls.map(url => ({
      url,
      isHealthy: true,
      exhausted: false,
      errorCount: 0,
    }));

    this.providers = validUrls.map(url =>
      new ethers.JsonRpcProvider(url, chainId, { staticNetwork: true })
    );
  }

  private getActiveEndpoints(): number[] {
    const now = Date.now();
    // Restaurar endpoints que han completado el cooldown
    for (const ep of this.endpoints) {
      if (ep.exhausted && ep.exhaustedAt && now - ep.exhaustedAt > EXHAUSTION_COOLDOWN_MS) {
        ep.exhausted = false;
        ep.errorCount = 0;
        ep.isHealthy = true;
        console.log(`[ResilientProvider] ♻️  Endpoint restaurado (chain ${this.chainId}): ${ep.url.slice(0, 50)}`);
      }
    }
    // Retornar índices de endpoints disponibles
    return this.endpoints
      .map((ep, i) => ({ ep, i }))
      .filter(({ ep }) => !ep.exhausted && ep.isHealthy)
      .map(({ i }) => i);
  }

  private markExhausted(index: number, reason: string) {
    const ep = this.endpoints[index];
    ep.exhausted = true;
    ep.isHealthy = false;
    ep.exhaustedAt = Date.now();
    console.warn(
      `[ResilientProvider] 💀 Agotado (chain ${this.chainId}) — ${reason}: ${ep.url.slice(0, 50)}`
    );
  }

  private markError(index: number) {
    this.endpoints[index].errorCount++;
    if (this.endpoints[index].errorCount >= 3) {
      this.markExhausted(index, 'errorCount >= 3');
    }
  }

  async call<T>(fn: (provider: ethers.JsonRpcProvider) => Promise<T>): Promise<T> {
    let activeIndices = this.getActiveEndpoints();

    if (activeIndices.length === 0) {
      console.warn(`[ResilientProvider] ⚠️ Todos los endpoints exhaustos (chain ${this.chainId}). Reseteando...`);
      this.endpoints.forEach(ep => {
        ep.exhausted = false;
        ep.isHealthy = true;
        ep.errorCount = 0;
      });
      activeIndices = this.endpoints.map((_, i) => i);
    }

    for (const i of activeIndices) {
      try {
        const result = await fn(this.providers[i]);
        this.endpoints[i].errorCount = 0; // Éxito — resetear contador
        return result;
      } catch (error: any) {
        const msg = error?.message ?? '';
        const code = error?.code ?? '';
        const status = error?.status ?? error?.statusCode ?? 0;

        // Detectar CU agotados / auth inválida
        const isExhausted =
          status === 401 || status === 429 || status === 402 ||
          msg.includes('401') || msg.includes('429') || msg.includes('402') ||
          msg.includes('Unknown token') || msg.includes('quota') ||
          msg.includes('limit exceeded') || msg.includes('unauthorized') ||
          code === '-32005' || code === '-32001';

        if (isExhausted) {
          this.markExhausted(i, `HTTP/RPC auth error: ${msg.slice(0, 80)}`);
          continue; // Pasar al siguiente endpoint
        }

        // Error de red / DNS → también agotar
        if (msg.includes('ENOTFOUND') || msg.includes('fetch failed') || msg.includes('network')) {
          this.markExhausted(i, 'network error');
          continue;
        }

        // Error temporal → incrementar contador
        this.markError(i);
        console.warn(`⚠️ [ResilientProvider] Error en endpoint ${i} (chain ${this.chainId}): ${msg.slice(0, 100)}`);
      }
    }

    // Si todos los de alta prioridad fallaron, usar el primero disponible como último recurso
    const lastResort = this.providers.find((_, i) => !this.endpoints[i].exhausted) || this.providers[0];
    return fn(lastResort);
  }

  private initWebSocket(url: string) {
    try {
      console.log(`📡 [WS:SHIELD] Initializing stream for chain ${this.chainId}`);
      this.wsProvider = new ethers.WebSocketProvider(url);

      this.wsProvider.on('error', (err: any) => {
        console.warn(`⚠️ [WS:SHIELD] Stream Error (${this.chainId}):`, err.message);
        if (err.message.includes('401') || err.message.includes('403')) {
          console.error(`💀 [WS:SHIELD] Auth failure for chain ${this.chainId}. Disabling WS.`);
          this.wsProvider = undefined;
          return;
        }
        this.reconnectWS();
      });
    } catch (e: any) {
      console.error(`💀 [WS:SHIELD] Failed to init:`, e.message);
    }
  }

  private reconnectWS() {
    if (!this.wssUrl) return;
    console.log(`🔄 [WS:SHIELD] Reconnecting for chain ${this.chainId}...`);
    setTimeout(() => this.initWebSocket(this.wssUrl!), 5000);
  }

  getProvider(): ethers.JsonRpcProvider {
    return new Proxy(this.providers[0], {
      get: (target, prop, receiver) => {
        const originalValue = (target as any)[prop];
        if (typeof originalValue === 'function') {
          const resilienceMethods = [
            'send', 'call', 'getBalance', 'getCode', 'getStorage',
            'getTransactionCount', 'getBlock', 'getTransaction',
            'getTransactionReceipt', 'getBlockNumber', 'getLogs',
            'estimateGas', 'getFeeData',
          ];
          if (resilienceMethods.includes(prop as string)) {
            return (...args: any[]) => this.call(p => (p as any)[prop](...args));
          }
          if (prop === 'getNetwork') {
            return async () => {
              if (this.networkCache) return this.networkCache;
              this.networkCache = await this.call(p => p.getNetwork());
              return this.networkCache;
            };
          }
          return originalValue.bind(target);
        }
        return Reflect.get(target, prop, receiver);
      },
    });
  }

  getWsProvider(): ethers.WebSocketProvider | undefined {
    if (!this.wssUrl) return undefined;
    if (!this.wsProvider) this.initWebSocket(this.wssUrl);
    return this.wsProvider;
  }

  /** Debug: estado de todos los endpoints */
  getStatus() {
    return this.endpoints.map(ep => ({
      url: ep.url.slice(0, 55),
      healthy: ep.isHealthy,
      exhausted: ep.exhausted,
      errorCount: ep.errorCount,
    }));
  }
}

// ── WebSocket endpoints ── ─────────────────────────────────────────────────
const EP_WSS_1 = 'wss://go.getblock.io/d20bc88064f545478a74dc464c14a09a';
const EP_WSS_2 = 'wss://go.getblock.io/95cb42a5aa444537a068031ce279d343';
const EP_WSS_3 = 'wss://go.getblock.io/36eed0bdbb894920b7eff3516a90f131';

// ── Singleton instances ───────────────────────────────────────────────────────

// Ethereum: todos los 6 GetBlock EPs + fallbacks públicos
export const ethereumResilientProvider = new ResilientProvider(
  [...GETBLOCK_POOL, ...ETH_PUBLIC_FALLBACKS].filter(Boolean),
  1,
  EP_WSS_1
);

// BSC: todos los 6 GetBlock EPs + dataseed públicos de Binance
export const bscResilientProvider = new ResilientProvider(
  [...GETBLOCK_POOL, ...BSC_PUBLIC_FALLBACKS].filter(Boolean),
  56
);

// Base: todos los 6 GetBlock EPs + fallbacks públicos
export const baseResilientProvider = new ResilientProvider(
  [...GETBLOCK_POOL, ...BASE_PUBLIC_FALLBACKS].filter(Boolean),
  8453
);

// Polygon: todos los 6 GetBlock EPs + fallbacks públicos
export const polygonResilientProvider = new ResilientProvider(
  [...GETBLOCK_POOL, ...POLYGON_PUBLIC_FALLBACKS].filter(Boolean),
  137
);
