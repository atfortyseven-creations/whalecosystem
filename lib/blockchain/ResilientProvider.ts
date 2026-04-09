import { ethers } from 'ethers';

interface RPCEndpoint {
  url: string;
  weight: number;
  isHealthy: boolean;
  lastErrorTime?: number;
}

/**
 * ResilientProvider — wired to the 4 dedicated GetBlock endpoints from .env
 *
 * EP1: GETBLOCK_ETH_RPC_1  → User Portfolio (eth_getBalance + balanceOf)
 * EP2: GETBLOCK_ETH_WS_2   → Whale Detection (eth_subscribe large Transfers)
 * EP3: GETBLOCK_ETH_WS_3   → New Pairs (UniswapV3 PoolCreated subscribe)
 * EP4: GETBLOCK_ETH_RPC_4  → Market Intel (slot0 / getReserves top-20 pools)
 */

// ── GetBlock endpoints — hardcoded as requested ──────────────────────────────
// Primary ETH HTTP endpoints
const EP1_HTTP = 'https://go.getblock.io/441dd184fb9740e9af094500d43bd0f8'; // ETH JSON-RPC (portfolio)
const EP2_HTTP = 'https://go.getblock.io/28362d2830a5473a840edab3fda9fc3c'; // ETH JSON-RPC (market intel)
const EP3_HTTP = 'https://go.getblock.io/85f2e6644087439c8b2b0ddc9bc0d234'; // ETH JSON-RPC (backup 1)
const EP4_HTTP = 'https://go.getblock.io/31aef531b4e444f5bde76196502679da'; // ETH JSON-RPC (backup 2)
// Primary ETH WebSocket endpoints
const EP_WSS_1 = 'wss://go.getblock.io/d20bc88064f545478a74dc464c14a09a'; // ETH WS primary
const EP_WSS_2 = 'wss://go.getblock.io/95cb42a5aa444537a068031ce279d343'; // ETH WS secondary
const EP_WSS_3 = 'wss://go.getblock.io/36eed0bdbb894920b7eff3516a90f131'; // ETH WS backup
// Polygon
const POLYGON_HTTP = 'https://go.getblock.io/a2c976b8451b445b8cd4b2226b9a4e0d'; // Polygon JSON-RPC
// Legacy BSC/Base endpoints
const GETBLOCK_BSC_HTTPS  = 'https://go.getblock.us/bfb53e7124d44e55beaab2f172b43cfe';
const GETBLOCK_BASE_HTTPS = process.env.GETBLOCK_BASE_RPC || 'https://mainnet.base.org';

export class ResilientProvider {
  private primaryProvider: ethers.JsonRpcProvider;
  private fallbackProviders: ethers.JsonRpcProvider[] = [];
  private wsProvider?: ethers.WebSocketProvider;
  private endpoints: RPCEndpoint[] = [];

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

    this.endpoints = validUrls.map(url => ({ url, weight: 1, isHealthy: true }));
    this.primaryProvider = new ethers.JsonRpcProvider(validUrls[0], chainId, { staticNetwork: true });

    for (let i = 1; i < validUrls.length; i++) {
      this.fallbackProviders.push(
        new ethers.JsonRpcProvider(validUrls[i], chainId, { staticNetwork: true })
      );
    }

    // WebSocket is NO LONGER initialized in the constructor!
    // It will be loaded lazily to prevent Next.js SSR from crashing due to 402 errors on global scope.
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

  async call<T>(fn: (provider: ethers.JsonRpcProvider) => Promise<T>, retryCount = 0): Promise<T> {
    const MAX_RETRIES = 5;
    const BASE_DELAY  = 500;

    for (let i = 0; i < this.endpoints.length; i++) {
      if (this.endpoints[i].isHealthy) {
        try {
          const provider = i === 0 ? this.primaryProvider : this.fallbackProviders[i - 1];
          return await fn(provider);
        } catch (error: any) {
          const isRateLimit = error.message?.includes('429') || error.status === 429;
          if (isRateLimit && retryCount < MAX_RETRIES) {
            const delay = Math.min(BASE_DELAY * Math.pow(2, retryCount), 10_000) + Math.random() * 100;
            console.warn(`[CU-SHIELD] 429 — retrying in ${Math.round(delay)}ms (${retryCount + 1}/${MAX_RETRIES})`);
            await new Promise(r => setTimeout(r, delay));
            return this.call(fn, retryCount + 1);
          }
          console.warn(`⚠️ [ResilientProvider] RPC Error: ${this.endpoints[i].url}. Failing over...`);
          this.markUnhealthy(i);
        }
      }
    }

    this.resetHealth();
    return fn(this.primaryProvider);
  }

  private markUnhealthy(index: number) {
    this.endpoints[index].isHealthy = false;
    this.endpoints[index].lastErrorTime = Date.now();
    setTimeout(() => (this.endpoints[index].isHealthy = true), 60_000);
  }

  private resetHealth() {
    this.endpoints.forEach(e => (e.isHealthy = true));
  }

  getProvider(): ethers.JsonRpcProvider {
    return new Proxy(this.primaryProvider, {
      get: (target, prop, receiver) => {
        const originalValue = (target as any)[prop];
        if (typeof originalValue === 'function') {
          const resilienceMethods = [
            'send', 'call', 'getBalance', 'getCode', 'getStorage',
            'getTransactionCount', 'getBlock', 'getTransaction',
            'getTransactionReceipt', 'getBlockNumber', 'getLogs',
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
    
    // Lazy Initialization: Only create the WebSocket when actually requested by a daemon/worker.
    if (!this.wsProvider) {
        this.initWebSocket(this.wssUrl);
    }
    
    return this.wsProvider;
  }
}

// ── Ethereum: all HTTP RPCs + primary WS ──────────────────────────────────────
export const ethereumResilientProvider = new ResilientProvider(
  [EP1_HTTP, EP2_HTTP, EP3_HTTP, EP4_HTTP].filter(Boolean),
  1,
  EP_WSS_1
);

// ── BSC ───────────────────────────────────────────────────────────────────────
export const bscResilientProvider = new ResilientProvider(
  [GETBLOCK_BSC_HTTPS, 'https://binance.llamarpc.com'].filter(Boolean),
  56
);

// ── Base ──────────────────────────────────────────────────────────────────────
export const baseResilientProvider = new ResilientProvider(
  [GETBLOCK_BASE_HTTPS, 'https://mainnet.base.org'].filter(Boolean),
  8453
);

// ── Polygon ───────────────────────────────────────────────────────────────────
export const polygonResilientProvider = new ResilientProvider(
  [POLYGON_HTTP, 'https://polygon.llamarpc.com'].filter(Boolean),
  137
);
