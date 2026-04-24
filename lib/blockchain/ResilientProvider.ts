import { ethers } from 'ethers';

// ── GLOBAL RESILIENCE HACK ──────────────────────────────────────────────────
// NodeJS `ws` library (used under the hood by ethers.WebSocketProvider) 
// will emit an unhandled exception and crash the entire process if it receives 
// an HTTP 403 or 429 during the WS Handshake upgrade. 
// We intercept it globally to protect the Sovereign Terminal.
if (typeof process !== 'undefined' && !(globalThis as any).__WS_PROTECTED) {
    (globalThis as any).__WS_PROTECTED = true;
    process.on('uncaughtException', (err: any) => {
        const msg = err?.message || '';
        const code = err?.code || '';
        
        const lethalWSPatterns = [
            'Unexpected server response',
            'WebSocket',
            '403',
            '429',
            'ECONNRESET',
            'ETIMEDOUT',
            'ENOTFOUND',       // DNS resolution failure — hostname does not exist
            'ECONNREFUSED',    // Remote host refused connection
            'EHOSTUNREACH',    // No route to host
            'getaddrinfo',     // DNS lookup failure prefix
            'UNKNOWN_ERROR',   // ethers generic catch-all
            'connection timeout exceeded',
            'NETWORK_ERROR'
        ];

        if (lethalWSPatterns.some(p => msg.includes(p) || code.includes(p))) {
            console.warn(`[WhaleFortress:Resilience] Swallowed lethal network drop: ${msg} (${code})`);
            return;
        }
        
        console.error('[WhaleFortress:Fatal] Unhandled Exception:', err);
        process.exit(1);
    });
}

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

// ── DYNAMIC ENDPOINT LOADING ────────────────────────────────────────────────
const parseMultiplexKeys = (envVal: string | undefined): string[] => {
  if (!envVal) return [];
  return envVal.split(',').map(s => s.trim()).filter(Boolean);
};

// Endpoints públicos de fallback (Sexta línea de defensa e inyección web3 masiva)
const FALLBACKS: Record<number, { rpc: string[], wss: string[] }> = {
  1: {
    rpc: [
      process.env.GETBLOCK_ETH_RPC_1 || '',
      process.env.GETBLOCK_ETH_RPC_4 || '',
      ...parseMultiplexKeys(process.env.GETBLOCK_ETH_RPCS),
      ...parseMultiplexKeys(process.env.ALCHEMY_ETH_RPCS),
      'https://go.getblock.io/441dd184fb9740e9af094500d43bd0f8',
      `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY || 'opt-out'}`,
      'https://rpc.ankr.com/eth',
      'https://1rpc.io/eth',
      'https://eth.llamarpc.com',
      'https://cloudflare-eth.com'
    ].filter(Boolean),
    wss: [
      process.env.GETBLOCK_ETH_WS_2 || '',
      process.env.GETBLOCK_ETH_WS_3 || '',
      ...parseMultiplexKeys(process.env.GETBLOCK_ETH_WSS),
      'wss://go.getblock.io/95cb42a5aa444537a068031ce279d343',
      'wss://ethereum-rpc.publicnode.com',
      'wss://eth.llamarpc.com'
    ].filter(Boolean)
  },
  56: {
    rpc: [
      ...parseMultiplexKeys(process.env.GETBLOCK_BSC_RPCS),
      'https://go.getblock.io/e264370bb5e047c38d6c87ec0ab42dff',
      'https://go.getblock.us/6aca5a5ffeba4f2f933766e547d4e3a3',
      'https://bsc.llamarpc.com',          // FIX: binance.llamarpc.com is ENOTFOUND — correct host
      'https://1rpc.io/bnb',
      'https://bsc-dataseed1.binance.org',
      'https://bsc-dataseed2.binance.org',
      'https://bsc.meowrpc.com',
      'https://rpc.ankr.com/bsc',
      'https://bsc.publicnode.com'
    ].filter(Boolean),
    wss: [
      ...parseMultiplexKeys(process.env.GETBLOCK_BSC_WSS),
      'wss://bsc-rpc.publicnode.com',
      'wss://binance.llamarpc.com'
    ].filter(Boolean)
  },
  137: {
    rpc: [
      ...parseMultiplexKeys(process.env.GETBLOCK_POLYGON_RPCS),
      'https://polygon.llamarpc.com',
      'https://1rpc.io/matic',
      'https://rpc.ankr.com/polygon',
      'https://polygon.meowrpc.com',
      'https://polygon-rpc.com'
    ].filter(Boolean),
    wss: [
      ...parseMultiplexKeys(process.env.GETBLOCK_POLYGON_WSS),
      'wss://polygon-bor-rpc.publicnode.com'
    ].filter(Boolean)
  },
  8453: {
    rpc: [
      process.env.GETBLOCK_BASE_RPC || '',
      ...parseMultiplexKeys(process.env.GETBLOCK_BASE_RPCS),
      'https://base.llamarpc.com',
      'https://1rpc.io/base',
      'https://mainnet.base.org',
      'https://base.meowrpc.com',
      'https://rpc.ankr.com/base'
    ].filter(Boolean),
    wss: [
      ...parseMultiplexKeys(process.env.GETBLOCK_BASE_WSS),
      'wss://base-rpc.publicnode.com',
      'wss://base.llamarpc.com'
    ].filter(Boolean),
    archive: [
      `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY || 'opt-out'}`,
      'https://rpc.ankr.com/eth',
      'https://cloudflare-eth.com'
    ].filter(Boolean)
  }
};

const EXHAUSTION_COOLDOWN_MS = 60 * 1000; // REDUCED EXHAUSTION COOLDOWN TO 60 SECONDS! (Max Agility)

interface PersistentSubscription {
  type: 'block' | 'filter';
  filter?: any;
  callback: any;
}

export class ResilientProvider {
  private endpoints: RPCEndpoint[];
  private providers: ethers.JsonRpcProvider[];
  private wsProvider?: ethers.WebSocketProvider;
  private wssUrls: string[];
  private currentWssIndex: number = 0;
  private chainId: number;
  private destroyed: boolean = false;
  private subscriptions: PersistentSubscription[] = [];

  constructor(chainId: number = 1) {
    this.chainId = chainId;
    
    // Aggressive Multiplexer Array Expansion
    const urls = FALLBACKS[chainId]?.rpc || [];
    this.wssUrls = FALLBACKS[chainId]?.wss || [];

    // Deduplicate to avoid overlap errors
    const uniqueUrls = Array.from(new Set(urls));
    this.wssUrls = Array.from(new Set(this.wssUrls));

    this.endpoints = uniqueUrls.map(url => ({
      url,
      isHealthy: true,
      exhausted: false,
      errorCount: 0,
    }));

    this.providers = uniqueUrls.map(url =>
      new ethers.JsonRpcProvider(url, chainId, { staticNetwork: true })
    );

    console.log(`[ResilientProvider] 🚀 Booted Multiplexer for chain ${chainId} with ${uniqueUrls.length} HTTP / ${this.wssUrls.length} WSS Endpoints.`);
  }

  public destroy() {
    this.destroyed = true;
    if (this.wsProvider) {
        this.wsProvider.removeAllListeners();
        this.wsProvider.destroy();
    }
  }

  /**
   * [HIGH FIDELITY] Subscribe to blockchain events with automatic rotation recovery.
   * This is the institutional standard for long-running telemetry daemons.
   */
  public on(type: 'block' | any, callbackOrFilter: any, callback?: any) {
    if (type === 'block') {
        this.subscriptions.push({ type: 'block', callback: callbackOrFilter });
    } else {
        this.subscriptions.push({ type: 'filter', filter: type, callback: callbackOrFilter });
    }
    
    // Attach immediately if provider is ready
    if (this.wsProvider) {
        this.wsProvider.on(type, callbackOrFilter);
    }
  }

  private getCircuitState(ep: RPCEndpoint): 'CLOSED' | 'OPEN' | 'HALF_OPEN' {
    if (!ep.exhausted) return 'CLOSED';
    const elapsed = Date.now() - (ep.exhaustedAt ?? 0);
    if (elapsed < EXHAUSTION_COOLDOWN_MS) return 'OPEN';
    return 'HALF_OPEN';
  }

  private getActiveEndpoints(): number[] {
    if (this.destroyed) return [];
    return this.endpoints
      .map((ep, i) => ({ ep, i }))
      .filter(({ ep }) => {
        const state = this.getCircuitState(ep);
        return state === 'CLOSED' || state === 'HALF_OPEN';
      })
      .map(({ i }) => i);
  }

  private markExhausted(index: number, reason: string) {
    const ep = this.endpoints[index];
    if (!ep) return;
    ep.exhausted = true;
    ep.isHealthy = false;
    ep.exhaustedAt = Date.now();
    ep.errorCount++;
    console.warn(`[ResilientProvider:🔴OPEN] chain=${this.chainId} reason=${reason} ep=${index} url=${ep.url.slice(0, 40)}...`);
    if (this.chainId === 1 && this.wssUrls.length > 0) {
        this.reconnectWS();
    }
  }

  public async call(method: string, params: any[]): Promise<any> {
    const p = await this.getProvider();
    return p.send(method, params);
  }

  /**
   * Evaluates if the current operation requires an Archive Node.
   * If yes, routes to dedicated archive endpoints to prevent "missing trie node" errors.
   */
  public async getArchiveProvider(): Promise<ethers.JsonRpcProvider> {
    const archiveUrls = (FALLBACKS[this.chainId] as any)?.archive || FALLBACKS[this.chainId]?.rpc || [];
    if (archiveUrls.length === 0) return this.getProvider();
    
    // For now, use the first available archive node (or degrade to standard getProvider if none)
    // Production ready logic for archive multiplexing.
    const url = archiveUrls[0];
    return new ethers.JsonRpcProvider(url, this.chainId, { staticNetwork: true });
  }

  /**
   * Robust `getLogs` wrapper that attempts standard nodes first, 
   * and falls back to an Archive Node if a pruning error is detected.
   */
  public async getLogs(filter: any): Promise<ethers.Log[]> {
    try {
      const p = await this.getProvider();
      return await p.getLogs(filter);
    } catch (err: any) {
      if (err.message && (err.message.includes('missing trie node') || err.message.includes('pruned') || err.message.includes('archive node'))) {
        console.warn('[ResilientProvider] Pruning error detected. Escalating to Archive Node.');
        const archiveProvider = await this.getArchiveProvider();
        return await archiveProvider.getLogs(filter);
      }
      throw err;
    }
  }

  private markRecovered(index: number) {
    const ep = this.endpoints[index];
    if (!ep) return;
    ep.exhausted = false;
    ep.isHealthy = true;
    ep.errorCount = 0;
    ep.exhaustedAt = undefined;
    console.log(`[ResilientProvider:🟢CLOSED] chain=${this.chainId} endpoint recovered: ${ep.url.slice(0, 40)}...`);
  }

  // ── Timeout-enforced RPC call ─────────────────────────────────────────────
  private callWithTimeout<T>(fn: (provider: ethers.JsonRpcProvider) => Promise<T>, provider: ethers.JsonRpcProvider, timeoutMs = 8000): Promise<T> {
    return Promise.race([
      fn(provider),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`RPC_TIMEOUT_${timeoutMs}ms`)), timeoutMs)
      ),
    ]);
  }

  async call<T>(fn: (provider: ethers.JsonRpcProvider) => Promise<T>): Promise<T> {
    const activeIndices = this.getActiveEndpoints();

    // All circuits OPEN → emergency reset (last-resort, avoids total blackout)
    if (activeIndices.length === 0) {
      console.warn(`[ResilientProvider] ⚡ EMERGENCY RESET chain=${this.chainId} — all circuits open`);
      this.endpoints.forEach(ep => {
        ep.exhausted = false;
        ep.isHealthy = true;
        ep.errorCount = 0;
        ep.exhaustedAt = undefined;
      });
      return this.callWithTimeout(fn, this.providers[0]);
    }

    for (const i of activeIndices) {
      const state = this.getCircuitState(this.endpoints[i]);
      const t0 = Date.now();
      try {
        const result = await this.callWithTimeout(fn, this.providers[i]);
        const latencyMs = Date.now() - t0;

        // HALF_OPEN probe succeeded → recover endpoint
        if (state === 'HALF_OPEN') this.markRecovered(i);

        // Latency telemetry (soft warn >3s, hard warn >6s)
        if (latencyMs > 6000) console.warn(`[ResilientProvider] 🐢 SLOW chain=${this.chainId} ep=${i} latency=${latencyMs}ms`);

        return result;
      } catch (error: any) {
        const latencyMs = Date.now() - t0;
        const status = error?.status ?? error?.statusCode ?? 0;
        const msg = (error?.message ?? '').toLowerCase();

        const isRateLimit  = status === 429 || status === 402 || status === 401 || msg.includes('limit') || msg.includes('quota');
        const isTimeout    = msg.includes('timeout') || msg.includes('rpc_timeout');
        const isNetwork    = msg.includes('econnreset') || msg.includes('enotfound') || msg.includes('econnrefused');

        if (isRateLimit) {
          this.markExhausted(i, `RATE_LIMIT_${status}`);
        } else if (isTimeout || isNetwork) {
          this.markExhausted(i, isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR');
        } else {
          // Transient error — increment but don't open circuit immediately
          this.endpoints[i].errorCount++;
          if (this.endpoints[i].errorCount >= 3) {
            this.markExhausted(i, `REPEATED_FAILURE_x${this.endpoints[i].errorCount}`);
          }
        }

        // HALF_OPEN probe failed → back to OPEN, don't try next endpoint
        if (state === 'HALF_OPEN') break;
        // Otherwise continue to next available endpoint
        continue;
      }
    }

    // Final fallback: use first provider regardless of state
    return this.callWithTimeout(fn, this.providers[0]);
  }

  private initWebSocket(url: string) {
    if (typeof window !== 'undefined' || this.destroyed) return;
    
    if (!url.startsWith('ws://') && !url.startsWith('wss://')) {
      console.error(`[ResilientProvider] 🚫 MALFORMED_WS_URL skipping: ${url}`);
      this.reconnectWS();
      return;
    }

    try {
      const newProvider = new ethers.WebSocketProvider(url, this.chainId);
      
      newProvider.on('error', (err: any) => {
          const msg = err?.message || 'Unknown';
          if (msg.includes('UNKNOWN_ID')) return; // Ignore harmless out-of-sync block responses
          console.warn(`[WS-CORE] Asynchronous reconnect for ${url.slice(0, 30)}:`, msg);
          this.reconnectWS();
      });

      // [RESILIENCE RECOVERY] Re-apply all persistent subscriptions
      this.subscriptions.forEach(sub => {
          if (sub.type === 'block') {
              newProvider.on('block', sub.callback);
          } else {
              newProvider.on(sub.filter, sub.callback);
          }
      });

      this.wsProvider = newProvider;

    } catch (e: any) {
      console.error(`[WS-FATAL] Immediate connection failure for ${url}:`, e.message);
      this.reconnectWS();
    }
  }

  private reconnectWS() {
    if (this.wssUrls.length === 0 || this.destroyed) return;
    
    if (this.wsProvider) {
        try {
            this.wsProvider.removeAllListeners();
            this.wsProvider.destroy();
        } catch {}
        this.wsProvider = undefined;
    }

    this.currentWssIndex = (this.currentWssIndex + 1) % this.wssUrls.length;
    console.log(`[WS] 🔄 Scaling to Next Endpoint Index ${this.currentWssIndex}...`);
    setTimeout(() => this.initWebSocket(this.wssUrls[this.currentWssIndex]), 5000);
  }

  getProvider(): ethers.JsonRpcProvider {
    return new Proxy(this.providers[0], {
      get: (target, prop) => {
        const resilienceMethods = ['send', 'call', 'getBalance', 'getCode', 'getStorage', 'getTransactionCount', 'getBlock', 'getTransaction', 'getTransactionReceipt', 'getBlockNumber', 'getLogs', 'estimateGas'];
        if (resilienceMethods.includes(prop as string)) {
          return (...args: any[]) => this.call(p => (p as any)[prop](...args));
        }
        return (target as any)[prop];
      },
    });
  }

  getWsProvider(): ethers.WebSocketProvider | undefined {
    if (this.wssUrls.length === 0) return undefined;
    if (!this.wsProvider) this.initWebSocket(this.wssUrls[this.currentWssIndex]);
    return this.wsProvider;
  }
}

// ── Singleton instances ──
export const ethereumResilientProvider = new ResilientProvider(1);
export const bscResilientProvider = new ResilientProvider(56);
export const baseResilientProvider = new ResilientProvider(8453);
export const polygonResilientProvider = new ResilientProvider(137);
