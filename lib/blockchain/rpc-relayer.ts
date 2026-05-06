// lib/blockchain/rpc-relayer.ts
/**
 * RpcRelayerManager — Multi-Chain RPC Load Balancer
 *
 * Distribuye requests entre todos los endpoints GetBlock del registry
 * usando Round-Robin con cooldown automático en caso de 429/500.
 *
 * Clusters soportados (20 slots):
 *   ETH_RPC, ETH_WSS, ETH_MEV
 *   SOL_RPC, SOL_WSS
 *   BASE_RPC, BASE_WSS
 *   POL_RPC, POL_WSS
 *   BSC_RPC, BSC_WSS
 *   ARB_RPC, ARB_WSS
 *   OP_RPC
 *   WORLD_RPC
 *   BTC_RPC
 *   AVAX_RPC
 *   HYPEREVM_RPC
 *   BERA_RPC
 */

export type NetworkTag =
  | 'ETH'
  | 'SOL'
  | 'BASE'
  | 'POL'
  | 'BSC'
  | 'ARB'
  | 'OP'
  | 'WORLD'
  | 'BTC'
  | 'AVAX'
  | 'HYPEREVM'
  | 'BERA';

export type ProtocolType = 'RPC' | 'WSS' | 'MEV';

interface Endpoint {
  url: string;
  failures: number;
  lastFailedAt: number | null;
}

// Fallbacks públicos por red, usados si el cluster GetBlock está vacío
const PUBLIC_FALLBACKS: Partial<Record<string, string>> = {
  ETH_RPC:      'https://eth.llamarpc.com',
  ETH_WSS:      'wss://ethereum-rpc.publicnode.com',
  SOL_RPC:      'https://api.mainnet-beta.solana.com',
  SOL_WSS:      'wss://api.mainnet-beta.solana.com',
  BASE_RPC:     'https://mainnet.base.org',
  BASE_WSS:     'wss://base-rpc.publicnode.com',
  POL_RPC:      'https://polygon-rpc.com',
  POL_WSS:      'wss://polygon-bor-rpc.publicnode.com',
  BSC_RPC:      'https://bsc-dataseed1.binance.org',
  BSC_WSS:      'wss://bsc-rpc.publicnode.com',
  ARB_RPC:      'https://arb1.arbitrum.io/rpc',
  ARB_WSS:      'wss://arbitrum-one-rpc.publicnode.com',
  OP_RPC:       'https://mainnet.optimism.io',
  WORLD_RPC:    'https://worldchain-mainnet.g.alchemy.com/public',
  BTC_RPC:      'https://mempool.space/api',
  AVAX_RPC:     'https://api.avax.network/ext/bc/C/rpc',
  HYPEREVM_RPC: 'https://rpc.hyperliquid.xyz/evm',
  BERA_RPC:     'https://rpc.berachain.com',
};

export class RpcRelayerManager {
  private static endpoints: Record<string, Endpoint[]> = {};
  private static indices: Record<string, number> = {};

  /** Cooldown de 5 min antes de reintentar un endpoint fallido */
  private static readonly COOLDOWN_MS = 5 * 60 * 1000;

  static {
    this.initialize();
  }

  private static initialize() {
    // ── ETH ──────────────────────────────────────────────────────────────────
    this.loadCluster('ETH_RPC', [
      process.env.GB_ETH_RPC_1,
      process.env.GB_ETH_RPC_2,
      process.env.RPC_CLUSTER_ETH_RPC,  // legacy comma-separated
    ]);
    this.loadCluster('ETH_WSS', [
      process.env.GB_ETH_WSS_1,
      process.env.RPC_CLUSTER_ETH_WSS,  // legacy comma-separated
    ]);
    this.loadCluster('ETH_MEV', [process.env.GB_ETH_MEV_RPC]);

    // ── SOLANA ────────────────────────────────────────────────────────────────
    this.loadCluster('SOL_RPC', [
      process.env.GB_SOL_RPC_1,
      process.env.RPC_CLUSTER_SOL_RPC,  // legacy comma-separated
    ]);
    this.loadCluster('SOL_WSS', [process.env.GB_SOL_WSS_1]);

    // ── BASE ──────────────────────────────────────────────────────────────────
    this.loadCluster('BASE_RPC', [process.env.GB_BASE_RPC_1]);
    this.loadCluster('BASE_WSS', [process.env.GB_BASE_WSS_1]);

    // ── POLYGON ───────────────────────────────────────────────────────────────
    this.loadCluster('POL_RPC', [
      process.env.GB_POL_RPC_1,
      process.env.RPC_CLUSTER_POLYGON_RPC,
    ]);
    this.loadCluster('POL_WSS', [
      process.env.GB_POL_WSS_1,
      process.env.RPC_CLUSTER_POLYGON_WSS,
    ]);

    // ── BSC ───────────────────────────────────────────────────────────────────
    this.loadCluster('BSC_RPC', [
      process.env.GB_BSC_RPC_1,
      process.env.RPC_CLUSTER_BSC_RPC,
    ]);
    this.loadCluster('BSC_WSS', [
      process.env.GB_BSC_WSS_1,
      process.env.RPC_CLUSTER_BSC_WSS,
    ]);

    // ── ARBITRUM ──────────────────────────────────────────────────────────────
    this.loadCluster('ARB_RPC', [
      process.env.GB_ARB_RPC_1,
      process.env.RPC_CLUSTER_ARB_RPC,  // legacy comma-separated (2 URLs)
    ]);
    this.loadCluster('ARB_WSS', [process.env.GB_ARB_WSS_1]);

    // ── OPTIMISM ──────────────────────────────────────────────────────────────
    this.loadCluster('OP_RPC', [process.env.GB_OP_RPC_1]);

    // ── WORLDCHAIN ────────────────────────────────────────────────────────────
    this.loadCluster('WORLD_RPC', [process.env.GB_WORLD_RPC_1]);

    // ── BITCOIN ───────────────────────────────────────────────────────────────
    this.loadCluster('BTC_RPC', [process.env.GB_BTC_RPC_1]);

    // ── AVALANCHE ─────────────────────────────────────────────────────────────
    this.loadCluster('AVAX_RPC', [process.env.GB_AVAX_RPC_1]);

    // ── META-CHAINS 2025 ──────────────────────────────────────────────────────
    this.loadCluster('HYPEREVM_RPC', [process.env.GB_HYPEREVM_RPC_1]);
    this.loadCluster('BERA_RPC',     [process.env.GB_BERA_RPC_1]);

    // ── Startup log ────────────────────────────────────────────────────────────
    const totalActive = Object.values(this.endpoints).reduce(
      (acc, cluster) => acc + cluster.length, 0
    );
    console.log(`[RpcRelayer] 🚀 Initialized — ${totalActive} total endpoint slots loaded.`);
  }

  /**
   * Carga un cluster desde un array de strings o variables env.
   * Soporta valores con comas (legacy RPC_CLUSTER_*="url1,url2").
   * Filtra duplicados y placeholders vacíos.
   */
  private static loadCluster(key: string, sources: (string | undefined)[]) {
    const urls = new Set<string>();

    for (const source of sources) {
      if (!source) continue;
      // Soporta comas (legacy formato RPC_CLUSTER_*)
      source.split(',').forEach(u => {
        const clean = u.trim().replace(/^["']|["']$/g, '');
        if (clean.length > 10) urls.add(clean);
      });
    }

    this.endpoints[key] = Array.from(urls).map(url => ({
      url,
      failures: 0,
      lastFailedAt: null,
    }));
    this.indices[key] = 0;

    if (this.endpoints[key].length > 0) {
      console.log(`[RpcRelayer] ✅ ${key}: ${this.endpoints[key].length} endpoint(s)`);
    }
  }

  /**
   * Obtiene el siguiente URL disponible (Round-Robin).
   * Salta endpoints en cooldown por 429/500.
   * Si todos están caídos, devuelve el fallback público.
   */
  static getRpcUrl(network: NetworkTag, protocol: ProtocolType = 'RPC'): string {
    const key = `${network}_${protocol}`;
    const cluster = this.endpoints[key];
    const fallback = PUBLIC_FALLBACKS[key] ?? '';

    if (!cluster || cluster.length === 0) {
      console.warn(`[RpcRelayer] No endpoints for ${key} — using public fallback.`);
      return fallback;
    }

    const now = Date.now();
    const startIndex = this.indices[key];

    for (let i = 0; i < cluster.length; i++) {
      const idx = (startIndex + i) % cluster.length;
      const ep = cluster[idx];

      if (ep.lastFailedAt && now - ep.lastFailedAt < this.COOLDOWN_MS) {
        continue; // Aún en cooldown
      }

      if (ep.lastFailedAt) {
        // Cooldown expirado — recuperar endpoint
        ep.lastFailedAt = null;
        ep.failures = 0;
      }

      // Avanzar índice Round-Robin para la próxima llamada
      this.indices[key] = (idx + 1) % cluster.length;
      return ep.url;
    }

    // Todos en cooldown — intentar con el primero de todos modos
    console.error(`[RpcRelayer] ⚠️ ALL nodes cooling down for ${key} — forcing primary.`);
    return cluster[0].url;
  }

  /**
   * Reporta un fallo (429/500/timeout) — pone el endpoint en cooldown.
   */
  static reportFailure(network: NetworkTag, protocol: ProtocolType, url: string): void {
    const key = `${network}_${protocol}`;
    const cluster = this.endpoints[key];
    if (!cluster) return;

    const ep = cluster.find(e => e.url === url);
    if (ep) {
      ep.failures += 1;
      ep.lastFailedAt = Date.now();
      console.warn(`[RpcRelayer] 🔴 COOLDOWN → ${url.slice(0, 50)} | Fails: ${ep.failures}`);
    }
  }

  /**
   * Estado completo de todos los clusters para el dashboard de monitorización.
   */
  static getClusterStatus(): Record<string, { total: number; healthy: number; endpoints: { url: string; failures: number; inCooldown: boolean }[] }> {
    const now = Date.now();
    const result: ReturnType<typeof this.getClusterStatus> = {};

    for (const [key, cluster] of Object.entries(this.endpoints)) {
      const endpoints = cluster.map(ep => ({
        url: ep.url.replace(/\/([a-f0-9]{20,})/, '/****'),
        failures: ep.failures,
        inCooldown: ep.lastFailedAt !== null && now - ep.lastFailedAt < this.COOLDOWN_MS,
      }));
      result[key] = {
        total: cluster.length,
        healthy: endpoints.filter(e => !e.inCooldown).length,
        endpoints,
      };
    }

    return result;
  }
}
