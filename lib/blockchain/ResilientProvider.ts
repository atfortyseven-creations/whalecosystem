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

// ── DYNAMIC ENDPOINT LOADING ────────────────────────────────────────────────
const GETBLOCK_PAIRS = [
  { 
    rpc: process.env.GETBLOCK_ETH_RPC_1, 
    wss: process.env.GETBLOCK_ETH_WS_2 
  },
  { 
    rpc: process.env.GETBLOCK_ETH_RPC_4, 
    wss: process.env.GETBLOCK_ETH_WS_3 
  },
].filter(p => p.rpc && p.wss);

// Endpoints públicos de fallback (Sexta línea de defensa e inyección web3 masiva)
const FALLBACKS: Record<number, { rpc: string[], wss: string[] }> = {
  1: {
    rpc: [
      `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY || 'opt-out'}`,
      'https://rpc.ankr.com/eth',
      'https://1rpc.io/eth',
      'https://eth.llamarpc.com',
      'https://cloudflare-eth.com'
    ],
    wss: [
      'wss://ethereum-rpc.publicnode.com'
    ]
  },
  56: {
    rpc: [
      'https://binance.llamarpc.com',
      'https://1rpc.io/bnb',
      'https://bsc-dataseed1.binance.org',
      'https://bsc-dataseed2.binance.org',
      'https://bsc.meowrpc.com'
    ],
    wss: [
      'wss://bsc-rpc.publicnode.com'
    ]
  },
  137: {
    rpc: [
      'https://polygon.llamarpc.com',
      'https://1rpc.io/matic',
      'https://polygon.meowrpc.com',
      'https://polygon-rpc.com'
    ],
    wss: [
      'wss://polygon-bor-rpc.publicnode.com'
    ]
  },
  8453: {
    rpc: [
      process.env.GETBLOCK_BASE_RPC || '',
      'https://base.llamarpc.com',
      'https://1rpc.io/base',
      'https://mainnet.base.org',
      'https://base.meowrpc.com'
    ].filter(Boolean),
    wss: [
      'wss://base-rpc.publicnode.com'
    ]
  }
};

const EXHAUSTION_COOLDOWN_MS = 10 * 60 * 1000; // 10 minutos para 402/429

export class ResilientProvider {
  private endpoints: RPCEndpoint[];
  private providers: ethers.JsonRpcProvider[];
  private wsProvider?: ethers.WebSocketProvider;
  private wssUrls: string[];
  private currentWssIndex: number = 0;
  private chainId: number;
  private networkCache?: ethers.Network;

  constructor(chainId: number = 1) {
    this.chainId = chainId;
    
    // Unificar pares específicos de GetBlock + Fallbacks por cadena
    const urls = [
      ...(chainId === 1 ? GETBLOCK_PAIRS.map(p => p.rpc!) : []),
      ...(FALLBACKS[chainId]?.rpc || [])
    ].filter(Boolean);

    this.wssUrls = [
      ...(chainId === 1 ? GETBLOCK_PAIRS.map(p => p.wss!) : []),
      ...(FALLBACKS[chainId]?.wss || [])
    ].filter(Boolean);

    this.endpoints = urls.map(url => ({
      url,
      isHealthy: true,
      exhausted: false,
      errorCount: 0,
    }));

    this.providers = urls.map(url =>
      new ethers.JsonRpcProvider(url, chainId, { staticNetwork: true })
    );

    console.log(`[ResilientProvider] 🚀 Booted for chain ${chainId} with ${urls.length} endpoints.`);
  }

  private getActiveEndpoints(): number[] {
    const now = Date.now();
    for (const ep of this.endpoints) {
      if (ep.exhausted && ep.exhaustedAt && now - ep.exhaustedAt > EXHAUSTION_COOLDOWN_MS) {
        ep.exhausted = false;
        ep.errorCount = 0;
        ep.isHealthy = true;
      }
    }
    return this.endpoints
      .map((ep, i) => ({ ep, i }))
      .filter(({ ep }) => !ep.exhausted && ep.isHealthy)
      .map(({ i }) => i);
  }

  private markExhausted(index: number, reason: string) {
    const ep = this.endpoints[index];
    if (ep.exhausted) return; // Prevent log spam if already exhausted

    ep.exhausted = true;
    ep.isHealthy = false;
    ep.exhaustedAt = Date.now();
    console.warn(`[ResilientProvider] 💀 BLACKLISTED (${this.chainId}) — ${reason}: ${ep.url.slice(0, 40)}...`);
    
    // Si era un WSS activo, rotar
    if (this.chainId === 1 && index < this.wssUrls.length) {
        this.reconnectWS();
    }
  }

  async call<T>(fn: (provider: ethers.JsonRpcProvider) => Promise<T>): Promise<T> {
    const activeIndices = this.getActiveEndpoints();

    if (activeIndices.length === 0) {
      // Emergency reset
      this.endpoints.forEach(ep => { ep.exhausted = false; ep.isHealthy = true; });
      return fn(this.providers[0]);
    }

    for (const i of activeIndices) {
      try {
        const result = await fn(this.providers[i]);
        return result;
      } catch (error: any) {
        const status = error?.status ?? error?.statusCode ?? 0;
        const msg = error?.message?.toLowerCase() ?? '';

        // CIRCUIT BREAKER: 402/429/401 → Instant skip
        if (status === 402 || status === 429 || status === 401 || msg.includes('402') || msg.includes('quota') || msg.includes('limit')) {
          this.markExhausted(i, `API_LIMIT_${status}`);
          continue;
        }

        this.endpoints[i].errorCount++;
        if (this.endpoints[i].errorCount >= 2) {
            this.markExhausted(i, 'REPEATED_FAILURE');
        }
      }
    }
    return fn(this.providers[activeIndices[0]]);
  }

    if (typeof window !== 'undefined') return; // Server-side only
    
    // [SECURITY FIX] Ensure we don't try to connect to an HTTP URL as a WebSocket
    // This prevents "Unexpected server response: 200" from ethers.
    if (!url.startsWith('ws://') && !url.startsWith('wss://')) {
      console.error(`[ResilientProvider] 🚫 MALFORMED_WS_URL skipping: ${url}`);
      this.reconnectWS();
      return;
    }

    try {
      this.wsProvider = new ethers.WebSocketProvider(url);
      this.wsProvider.on('error', () => this.reconnectWS());
    } catch (e) {
      this.reconnectWS();
    }
  }

  private reconnectWS() {
    if (this.wssUrls.length === 0) return;
    this.currentWssIndex = (this.currentWssIndex + 1) % this.wssUrls.length;
    console.log(`[WS] 🔄 Rotating to Pair Index ${this.currentWssIndex}`);
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
