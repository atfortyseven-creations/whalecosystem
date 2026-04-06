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

// ── 4 dedicated GetBlock endpoints (from .env) ────────────────────────────────
const EP1_HTTP = process.env.GETBLOCK_ETH_RPC_1 || 'https://eth.llamarpc.com';
const EP2_WSS  = process.env.GETBLOCK_ETH_WS_2  || '';
const EP3_WSS  = process.env.GETBLOCK_ETH_WS_3  || '';
const EP4_HTTP = process.env.GETBLOCK_ETH_RPC_4 || 'https://eth.llamarpc.com';

// ── Legacy / BSC / Base fallbacks ────────────────────────────────────────────
const GETBLOCK_BSC_HTTPS  = process.env.GETBLOCK_BSC_RPC   || 'https://go.getblock.us/3cdeadc7f4174c23b37daee85bc0d517';
const GETBLOCK_BASE_HTTPS = process.env.GETBLOCK_BASE_RPC  || 'https://go.getblock.us/69668586f4a84e3597c5dd658514121a';

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

    if (wssUrl && (wssUrl.startsWith('wss://') || wssUrl.startsWith('ws://'))) {
      this.initWebSocket(wssUrl);
    }
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
    return this.wsProvider;
  }
}

// ── Ethereum: EP1 (HTTP portfolio) + EP4 (HTTP market intel) + EP2 WS (whale detection) ──
export const ethereumResilientProvider = new ResilientProvider(
  [EP1_HTTP, EP4_HTTP, 'https://eth.llamarpc.com'].filter(Boolean),
  1,
  EP2_WSS || undefined
);

// ── BSC: legacy endpoint ───────────────────────────────────────────────────────
export const bscResilientProvider = new ResilientProvider(
  [GETBLOCK_BSC_HTTPS, 'https://binance.llamarpc.com'].filter(Boolean),
  56
);

// ── Base: legacy GetBlock Base endpoint ───────────────────────────────────────
export const baseResilientProvider = new ResilientProvider(
  [GETBLOCK_BASE_HTTPS, 'https://mainnet.base.org'].filter(Boolean),
  8453
);
