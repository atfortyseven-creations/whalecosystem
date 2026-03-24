import { ethers } from 'ethers';

interface RPCEndpoint {
  url: string;
  weight: number;
  isHealthy: boolean;
  lastErrorTime?: number;
}

/** Pre-configured Resilient Providers for the Whale Alert ecosystem (CU-SHIELD) */
const GETBLOCK_ETH_HTTPS = 'https://go.getblock.us/d9f5f9207ac44e5d9faf8d3017ca9fff';
const GETBLOCK_BSC_HTTPS = 'https://go.getblock.us/3cdeadc7f4174c23b37daee85bc0d517';

/**
 * ResilientProvider
 * [LEGENDARY] Infrastructure Shield for Whale Alert Pro.
 */
export class ResilientProvider {
  private primaryProvider: ethers.JsonRpcProvider;
  private fallbackProviders: ethers.JsonRpcProvider[] = [];
  private wsProvider?: ethers.WebSocketProvider;
  private endpoints: RPCEndpoint[] = [];

  private wssUrl?: string;
  private chainId: number;
  private networkCache?: ethers.Network;

  constructor(urls: string[], chainId: number = 8453, wssUrl?: string) {
    this.chainId = chainId;
    this.wssUrl = wssUrl;
    this.endpoints = urls.map(url => ({
      url,
      weight: 1,
      isHealthy: true
    }));

    if (urls.length === 0) {
      throw new Error('ResilientProvider: No RPC URLs provided');
    }

    this.primaryProvider = new ethers.JsonRpcProvider(urls[0], chainId, { staticNetwork: true });
    
    for (let i = 1; i < urls.length; i++) {
      this.fallbackProviders.push(new ethers.JsonRpcProvider(urls[i], chainId, { staticNetwork: true }));
    }

    if (wssUrl) {
        this.initWebSocket(wssUrl);
    }
  }

  private initWebSocket(url: string) {
    try {
        console.log(`📡 [WS:SHIELD] Initializing stream for chain ${this.chainId} at ${url}`);
        this.wsProvider = new ethers.WebSocketProvider(url);
        
        this.wsProvider.on("error", (err) => {
            console.warn(`⚠️ [WS:SHIELD] Stream Error (${this.chainId}):`, err.message);
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

  /**
   * Execute a provider call with Exponential Backoff + Jitter for 429s (CU Limit Protection)
   */
  async call<T>(fn: (provider: ethers.JsonRpcProvider) => Promise<T>, retryCount = 0): Promise<T> {
    const MAX_RETRIES = 5;
    const BASE_DELAY = 500;

    for (let i = 0; i < this.endpoints.length; i++) {
        if (this.endpoints[i].isHealthy) {
            try {
                const provider = i === 0 ? this.primaryProvider : this.fallbackProviders[i-1];
                return await fn(provider);
            } catch (error: any) {
                const isRateLimit = error.message?.includes('429') || error.status === 429;
                
                if (isRateLimit && retryCount < MAX_RETRIES) {
                    const delay = Math.min(BASE_DELAY * Math.pow(2, retryCount), 10000) + (Math.random() * 100);
                    console.warn(`[CU-SHIELD] 429 Rate Limit hit. Retrying in ${Math.round(delay)}ms... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
                    await new Promise(r => setTimeout(r, delay));
                    return this.call(fn, retryCount + 1);
                }

                console.warn(`⚠️ [ResilientProvider] RPC Error: ${this.endpoints[i].url}. Failing over...`);
                this.markUnhealthy(i);
            }
        }
    }

    this.resetHealth();
    return await fn(this.primaryProvider);
  }

  private markUnhealthy(index: number) {
    this.endpoints[index].isHealthy = false;
    this.endpoints[index].lastErrorTime = Date.now();
    setTimeout(() => this.endpoints[index].isHealthy = true, 60000);
  }

  private resetHealth() {
    this.endpoints.forEach(e => e.isHealthy = true);
  }

  getProvider(): ethers.JsonRpcProvider {
    return new Proxy(this.primaryProvider, {
      get: (target, prop, receiver) => {
        const originalValue = (target as any)[prop];
        
        if (typeof originalValue === 'function') {
            const resilienceMethods = [
                'send', 'call', 'getBalance', 'getCode', 'getStorage', 
                'getTransactionCount', 'getBlock', 'getTransaction', 
                'getTransactionReceipt', 'getBlockNumber', 'getLogs'
            ];

            if (resilienceMethods.includes(prop as string)) {
                return (...args: any[]) => this.call((provider) => (provider as any)[prop](...args));
            }
            
            // [CU OPTIMIZATION] Cache network and chainId to prevent redundant calls
            if (prop === 'getNetwork') {
                return async () => {
                    if (this.networkCache) return this.networkCache;
                    this.networkCache = await this.call((p) => p.getNetwork());
                    return this.networkCache;
                };
            }

            return originalValue.bind(target);
        }
        return Reflect.get(target, prop, receiver);
      }
    });
  }

  getWsProvider(): ethers.WebSocketProvider | undefined {
      return this.wsProvider;
  }
}

export const ethereumResilientProvider = new ResilientProvider([
    GETBLOCK_ETH_HTTPS,
    process.env.ETH_RPC_URL || '',
    'https://eth.llamarpc.com'
].filter(Boolean), 1, GETBLOCK_ETH_HTTPS.replace('https://', 'wss://'));

export const bscResilientProvider = new ResilientProvider([
    GETBLOCK_BSC_HTTPS,
    process.env.BSC_RPC_URL || '',
    'https://binance.llamarpc.com'
].filter(Boolean), 56, GETBLOCK_BSC_HTTPS.replace('https://', 'wss://'));

export const baseResilientProvider = new ResilientProvider([
  process.env.GETBLOCK_BASE_RPC || 'https://go.getblock.us/889c09939a894084931a2f6417724a9e',
  'https://mainnet.base.org'
].filter(Boolean), 8453, 'wss://go.getblock.us/889c09939a894084931a2f6417724a9e');
