/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║   GETBLOCK REGISTRY — 22 ENDPOINTS | 11 CUENTAS FREE                  ║
 * ║   Budget: 11 × 550,000 CU/día = 6,050,000 CU/día total               ║
 * ║                                                                        ║
 * ║   ANTI-BAN — CU Circuit Breaker:                                       ║
 * ║   Si GetBlock responde 402/429 → ese endpoint se bloquea               ║
 * ║   automáticamente hasta el reset diario (00:00 UTC).                   ║
 * ║   Si TODOS los endpoints de una chain se agotan → fallback público.    ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

export type GbChain = 'eth' | 'sol' | 'polygon' | 'bsc' | 'arb' | 'base';
export type GbProtocol = 'rpc' | 'wss';

export interface GbEndpoint {
  slot: number;
  account: number;
  chain: GbChain;
  protocol: GbProtocol;
  isActive: boolean;
  envKey: string;
  url: string;
}

// ─── Constructor ─────────────────────────────────────────────────────────────

function ep(
  slot: number,
  account: number,
  chain: GbChain,
  protocol: GbProtocol,
  envKey: string,
): GbEndpoint {
  const raw = (process.env[envKey] ?? '').trim().replace(/^["']|["']$/g, '');
  const isActive = raw.length > 10 && (raw.startsWith('https://') || raw.startsWith('wss://'));
  return { slot, account, chain, protocol, isActive, envKey, url: raw };
}

// ─── REGISTRY — 24 slots (22 principales + 2 extras de SOL/POL) ───────────────

export const GB_REGISTRY: GbEndpoint[] = [
  // CUENTA 1 — ETH primario
  ep(1,  1, 'eth', 'rpc', 'GB_ETH_RPC_1'),
  ep(2,  1, 'eth', 'wss', 'GB_ETH_WSS_1'),

  // CUENTA 2 — ETH secundario
  ep(3,  2, 'eth', 'rpc', 'GB_ETH_RPC_2'),
  ep(4,  2, 'eth', 'wss', 'GB_ETH_WSS_2'),

  // CUENTA 3 — ETH terciario (2x HTTP)
  ep(5,  3, 'eth', 'rpc', 'GB_ETH_RPC_3'),
  ep(6,  3, 'eth', 'rpc', 'GB_ETH_RPC_4'),

  // CUENTA 4 — SOL primario (HTTP + HTTP extra — GetBlock no dio WSS)
  ep(7,  4, 'sol', 'rpc', 'GB_SOL_RPC_1'),
  ep(8,  4, 'sol', 'rpc', 'GB_SOL_RPC_EXTRA'),   // URL https:// tratada como HTTP
  ep(9,  4, 'sol', 'wss', 'GB_SOL_WSS_1'),        // vacío hasta tener URL wss://

  // CUENTA 5 — SOL redundancia
  ep(10, 5, 'sol', 'rpc', 'GB_SOL_RPC_2'),
  ep(11, 5, 'sol', 'rpc', 'GB_SOL_RPC_3'),

  // CUENTA 6 — POLYGON primario (HTTP + HTTP extra — GetBlock no dio WSS)
  ep(12, 6, 'polygon', 'rpc', 'GB_POL_RPC_1'),
  ep(13, 6, 'polygon', 'rpc', 'GB_POL_RPC_EXTRA'), // URL https:// tratada como HTTP
  ep(14, 6, 'polygon', 'wss', 'GB_POL_WSS_1'),      // vacío hasta tener URL wss://

  // CUENTA 7 — POLYGON redundancia (pendiente)
  ep(15, 7, 'polygon', 'rpc', 'GB_POL_RPC_2'),
  ep(16, 7, 'polygon', 'rpc', 'GB_POL_RPC_3'),

  // CUENTA 8 — BSC primario
  ep(17, 8, 'bsc', 'rpc', 'GB_BSC_RPC_1'),
  ep(18, 8, 'bsc', 'wss', 'GB_BSC_WSS_1'),

  // CUENTA 9 — BSC redundancia
  ep(19, 9, 'bsc', 'rpc', 'GB_BSC_RPC_2'),
  ep(20, 9, 'bsc', 'rpc', 'GB_BSC_RPC_3'),

  // CUENTA 10 — ARBITRUM
  ep(21, 10, 'arb', 'rpc', 'GB_ARB_RPC_1'),
  ep(22, 10, 'arb', 'wss', 'GB_ARB_WSS_1'),

  // CUENTA 11 — BASE
  ep(23, 11, 'base', 'rpc', 'GB_BASE_RPC_1'),
  ep(24, 11, 'base', 'wss', 'GB_BASE_WSS_1'),
];

// ─── CU CIRCUIT BREAKER — Anti-Ban ───────────────────────────────────────────
/**
 * Cuando GetBlock responde 402 (quota) o 429 (rate limit):
 *   1. El endpoint se marca como EXHAUSTED
 *   2. El sistema lo salta automáticamente
 *   3. Se resetea al próximo reset diario de GetBlock (00:00 UTC)
 *
 * Esto previene bans al nunca reintentar un endpoint agotado.
 */

interface CuState {
  exhausted: boolean;
  exhaustedAt: number;
  quota402Count: number;
}

const cuState = new Map<string, CuState>();

/** Milisegundos hasta el próximo 00:00 UTC */
function msUntilMidnightUtc(): number {
  const now = new Date();
  const midnight = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0, 0
  ));
  return midnight.getTime() - now.getTime();
}

function getOrCreateCuState(url: string): CuState {
  if (!cuState.has(url)) {
    cuState.set(url, { exhausted: false, exhaustedAt: 0, quota402Count: 0 });
  }
  return cuState.get(url)!;
}

/**
 * Llamar cuando GetBlock responde 402 o 429.
 * Bloquea el endpoint hasta medianoche UTC (reset de GetBlock).
 */
export function markCuExhausted(url: string): void {
  const state = getOrCreateCuState(url);
  state.exhausted = true;
  state.exhaustedAt = Date.now();
  state.quota402Count += 1;

  const resetIn = Math.round(msUntilMidnightUtc() / 1000 / 60);
  console.warn(
    `[GetBlock CB] 🔴 CU AGOTADO → ${url.slice(0, 52)}... | ` +
    `Reset en ~${resetIn} min (00:00 UTC) | Switching to fallback.`
  );

  // Auto-reset a medianoche UTC
  setTimeout(() => {
    const s = cuState.get(url);
    if (s) {
      s.exhausted = false;
      console.info(`[GetBlock CB] 🟢 CU RESET → ${url.slice(0, 52)}...`);
    }
  }, msUntilMidnightUtc());
}

/** True si el endpoint está operativo (no agotado) */
export function isCuAvailable(url: string): boolean {
  return !getOrCreateCuState(url).exhausted;
}

// ─── Getters con Circuit Breaker integrado ────────────────────────────────────

/** Todos los RPCs activos Y disponibles (no agotados) para una chain */
export function getGbAllRpc(chain: GbChain): string[] {
  return GB_REGISTRY
    .filter(e => e.chain === chain && e.protocol === 'rpc' && e.isActive && isCuAvailable(e.url))
    .map(e => e.url);
}

/** Todos los WSS activos Y disponibles para una chain */
export function getGbAllWss(chain: GbChain): string[] {
  return GB_REGISTRY
    .filter(e => e.chain === chain && e.protocol === 'wss' && e.isActive && isCuAvailable(e.url))
    .map(e => e.url);
}

/** Primer RPC disponible para la chain */
export function getGbRpc(chain: GbChain): string {
  return getGbAllRpc(chain)[0] ?? '';
}

/** Primer WSS disponible para la chain */
export function getGbWss(chain: GbChain): string {
  return getGbAllWss(chain)[0] ?? '';
}

// ─── Monitoring ───────────────────────────────────────────────────────────────

export interface EndpointSummary {
  slot: number;
  account: number;
  chain: GbChain;
  protocol: GbProtocol;
  isActive: boolean;
  cuExhausted: boolean;
  envKey: string;
  urlMasked: string;
}

export function getEndpointSummary(): EndpointSummary[] {
  return GB_REGISTRY.map(ep => ({
    slot: ep.slot,
    account: ep.account,
    chain: ep.chain,
    protocol: ep.protocol,
    isActive: ep.isActive,
    cuExhausted: !isCuAvailable(ep.url),
    envKey: ep.envKey,
    urlMasked: ep.isActive
      ? ep.url.replace(/\/([a-f0-9]{20,})/, '/****')
      : 'NOT_CONFIGURED',
  }));
}

export function getActiveCount(): number {
  return GB_REGISTRY.filter(e => e.isActive).length;
}

export function getAvailableCount(): number {
  return GB_REGISTRY.filter(e => e.isActive && isCuAvailable(e.url)).length;
}

export function getCoveredChains(): GbChain[] {
  return [...new Set(
    GB_REGISTRY.filter(e => e.isActive && e.protocol === 'rpc' && isCuAvailable(e.url)).map(e => e.chain)
  )];
}

export const CU_BUDGET: Record<GbChain, number> = {
  eth:     3 * 550_000,
  sol:     2 * 550_000,
  polygon: 2 * 550_000,
  bsc:     2 * 550_000,
  arb:     1 * 550_000,
  base:    1 * 550_000,
};

export function getTotalCuBudget(): number {
  return 11 * 550_000;
}

// ─── Startup log ─────────────────────────────────────────────────────────────

if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'test') {
  const active = getActiveCount();
  const chains = getCoveredChains();
  const missing = GB_REGISTRY.filter(e => !e.isActive).map(e => e.envKey);

  console.log(`[GetBlock] ✅ ${active}/${GB_REGISTRY.length} slots activos | Chains: ${chains.join(', ')}`);
  if (missing.length > 0) {
    console.log(`[GetBlock] ⚠️  Slots pendientes (${missing.length}): ${missing.join(', ')}`);
  }
}
