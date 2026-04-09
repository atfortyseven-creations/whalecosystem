/**
 * GetBlock Engine — 6-Endpoint Rotating Pool with Exhaustion Failover
 *
 * Pool de 6 endpoints. Cuando un endpoint devuelve 401 (CU agotados),
 * 429 (rate limit), o cualquier HTTP error, se marca como exhausto y
 * el sistema pasa automáticamente al siguiente disponible.
 *
 * EP1: https://go.getblock.us/0ac57185ddeb447ca7d3e9da9634899f
 * EP2: https://go.getblock.io/1dcc5db2c6f44108a6e1e3a00b9a3f0d
 * EP3: https://go.getblock.us/88747de304e04365ac4c85789ba4fe54
 * EP4: https://go.getblock.us/4ee0dd8f4e8346cbaad50e5a63274b24
 * EP5: https://go.getblock.io/85f2e6644087439c8b2b0ddc9bc0d234
 * EP6: https://go.getblock.io/a2c976b8451b445b8cd4b2226b9a4e0d
 */

// ── Endpoint pool completo ───────────────────────────────────────────────────
const ALL_ENDPOINTS = [
  'https://go.getblock.us/0ac57185ddeb447ca7d3e9da9634899f', // EP1
  'https://go.getblock.io/1dcc5db2c6f44108a6e1e3a00b9a3f0d', // EP2
  'https://go.getblock.us/88747de304e04365ac4c85789ba4fe54', // EP3
  'https://go.getblock.us/4ee0dd8f4e8346cbaad50e5a63274b24', // EP4
  'https://go.getblock.io/85f2e6644087439c8b2b0ddc9bc0d234', // EP5
  'https://go.getblock.io/a2c976b8451b445b8cd4b2226b9a4e0d', // EP6
];

// ── Estado de salud por endpoint ─────────────────────────────────────────────
interface EndpointHealth {
  url: string;
  exhausted: boolean;
  exhaustedAt?: number;
  errorCount: number;
}

// Estado en módulo (persiste entre requests en el mismo proceso Node)
const endpointHealth: EndpointHealth[] = ALL_ENDPOINTS.map(url => ({
  url,
  exhausted: false,
  errorCount: 0,
}));

// Tiempo de cooldown antes de reintentar un endpoint exhausto: 3 minutos
const EXHAUSTION_COOLDOWN_MS = 3 * 60 * 1000;

function getActiveEndpoints(): EndpointHealth[] {
  const now = Date.now();
  // Restaurar endpoints que han pasado el cooldown
  for (const ep of endpointHealth) {
    if (ep.exhausted && ep.exhaustedAt && now - ep.exhaustedAt > EXHAUSTION_COOLDOWN_MS) {
      ep.exhausted = false;
      ep.errorCount = 0;
      console.log(`[GetBlock] ♻️  Endpoint restaurado: ${ep.url.slice(0, 50)}`);
    }
  }
  return endpointHealth.filter(ep => !ep.exhausted);
}

function markExhausted(url: string, reason: string) {
  const ep = endpointHealth.find(e => e.url === url);
  if (!ep) return;
  ep.exhausted = true;
  ep.exhaustedAt = Date.now();
  console.warn(`[GetBlock] 💀 Endpoint agotado (${reason}): ${url.slice(0, 50)}`);
}

// ── JSON-RPC core con failover automático ────────────────────────────────────
async function rpcWithFailover(
  method: string,
  params: unknown[],
  id = 1,
): Promise<string> {
  const active = getActiveEndpoints();

  if (active.length === 0) {
    // Todos exhaustos — resetear y reintentar con el primero como último recurso
    console.error('[GetBlock] ⚠️ Todos los endpoints agotados. Reseteando estado...');
    endpointHealth.forEach(ep => { ep.exhausted = false; ep.errorCount = 0; });
    active.push(...endpointHealth);
  }

  for (const ep of active) {
    try {
      const res = await fetch(ep.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', method, params, id }),
        signal: AbortSignal.timeout(8000),
        // @ts-ignore
        cache: 'no-store',
      });

      // 401 = CU agotados, 429 = rate limit → marcar y pasar al siguiente
      if (res.status === 401 || res.status === 429 || res.status === 402) {
        markExhausted(ep.url, `HTTP ${res.status}`);
        continue;
      }

      if (!res.ok) {
        ep.errorCount++;
        if (ep.errorCount >= 3) markExhausted(ep.url, `HTTP ${res.status} x3`);
        continue;
      }

      const json = await res.json() as { result?: string; error?: any };

      if (json.error) {
        const code = json.error?.code;
        const msg = JSON.stringify(json.error);
        // Códigos de RPC que indican CU agotados o auth inválida
        if (code === -32005 || code === -32001 || msg.includes('Unknown token') ||
            msg.includes('quota') || msg.includes('limit') || msg.includes('unauthorized')) {
          markExhausted(ep.url, `RPC error: ${msg.slice(0, 60)}`);
          continue;
        }
        throw new Error(`RPC error: ${msg}`);
      }

      // ✅ Éxito — resetear error count
      ep.errorCount = 0;
      return json.result as string;

    } catch (err: any) {
      if (err.name === 'TimeoutError' || err.name === 'AbortError') {
        ep.errorCount++;
        if (ep.errorCount >= 2) markExhausted(ep.url, 'timeout');
        console.warn(`[GetBlock] ⏱ Timeout en ${ep.url.slice(0, 50)}`);
        continue;
      }
      // Error de red / DNS
      if (err.message?.includes('ENOTFOUND') || err.message?.includes('fetch failed')) {
        markExhausted(ep.url, 'network error');
        continue;
      }
      throw err;
    }
  }

  throw new Error('[GetBlock] Todos los endpoints fallaron o están exhaustos.');
}

// ── Pad address to 32-byte ABI encoding ─────────────────────────────────────
function padAddr(addr: string) {
  return '000000000000000000000000' + addr.toLowerCase().replace('0x', '');
}

// ERC-20 ABI selectors (4-byte keccak)
const SIG_BALANCE_OF = '0x70a08231'; // balanceOf(address)
const SIG_SLOT0      = '0x3850c7bd'; // slot0() Uniswap V3

// ────────────────────────────────────────────────────────────────────────────
// Portfolio: eth_getBalance + batched balanceOf — usa failover en cada call
// ────────────────────────────────────────────────────────────────────────────

const KNOWN_ERC20: { symbol: string; address: string; decimals: number }[] = [
  { symbol: 'USDC',  address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6  },
  { symbol: 'USDT',  address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6  },
  { symbol: 'WETH',  address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', decimals: 18 },
  { symbol: 'DAI',   address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18 },
  { symbol: 'WBTC',  address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', decimals: 8  },
  { symbol: 'LINK',  address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', decimals: 18 },
  { symbol: 'UNI',   address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', decimals: 18 },
  { symbol: 'ARB',   address: '0xB50721BCf8d664c30412Cfbc6cf7a15145234ad1', decimals: 18 },
  { symbol: 'OP',    address: '0x4200000000000000000000000000000000000042', decimals: 18 },
  { symbol: 'PEPE',  address: '0x6982508145454Ce325dDbE47a25d4ec3d2311933', decimals: 18 },
  { symbol: 'SHIB',  address: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE', decimals: 18 },
  { symbol: 'MATIC', address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0', decimals: 18 },
  { symbol: 'LDO',   address: '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32', decimals: 18 },
  { symbol: 'MKR',   address: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2', decimals: 18 },
  { symbol: 'AAVE',  address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', decimals: 18 },
];

export interface PortfolioToken {
  symbol:   string;
  address:  string;
  balance:  number;
  decimals: number;
  chain:    string;
}

/** Fetch ETH + top ERC-20 balances con failover automático entre los 6 endpoints */
export async function getUserPortfolio(walletAddress: string): Promise<{
  ethBalance: number;
  tokens: PortfolioToken[];
}> {
  const addr = walletAddress.toLowerCase();

  const [ethHex, ...erc20Results] = await Promise.all([
    rpcWithFailover('eth_getBalance', [addr, 'latest']),
    ...KNOWN_ERC20.map(t =>
      rpcWithFailover('eth_call', [
        { to: t.address, data: SIG_BALANCE_OF + padAddr(addr) },
        'latest',
      ]).catch(() => '0x0')
    ),
  ]);

  const ethBalance = parseInt(ethHex, 16) / 1e18;

  const tokens: PortfolioToken[] = KNOWN_ERC20.map((t, i) => {
    const raw = erc20Results[i] || '0x0';
    const balance = parseInt(raw, 16) / Math.pow(10, t.decimals);
    return { ...t, balance, chain: 'ethereum' };
  }).filter(t => t.balance > 0);

  return { ethBalance, tokens };
}

// ────────────────────────────────────────────────────────────────────────────
// Market Intel: UniswapV3 slot0() on-chain prices con failover
// ────────────────────────────────────────────────────────────────────────────

const TOP_POOLS_V3: { symbol: string; pool: string; token0Decimals: number; token1Decimals: number }[] = [
  { symbol: 'ETH/USDC',  pool: '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640', token0Decimals: 6,  token1Decimals: 18 },
  { symbol: 'ETH/USDT',  pool: '0x4e68Ccd3E89f51C3074ca5072bbAC773960dFa36', token0Decimals: 18, token1Decimals: 6  },
  { symbol: 'WBTC/ETH',  pool: '0xCBCdF9626bC03E24f779434178A73a0B4bad62eD', token0Decimals: 8,  token1Decimals: 18 },
  { symbol: 'LINK/ETH',  pool: '0xa6Cc3C2531FdaA6Ae1A3CA84c2855806728693e8', token0Decimals: 18, token1Decimals: 18 },
  { symbol: 'UNI/ETH',   pool: '0x1d42064Fc4Beb5F8aaf85F4617AE8b3b5B8Bd801', token0Decimals: 18, token1Decimals: 18 },
];

export interface PoolPrice {
  symbol:       string;
  pool:         string;
  sqrtPriceX96: string;
  tick:         number;
  price:        number;
}

/** Read slot0() para cada pool UniswapV3 — precios on-chain reales */
export async function getPoolPrices(): Promise<PoolPrice[]> {
  const results = await Promise.all(
    TOP_POOLS_V3.map(p =>
      rpcWithFailover('eth_call', [{ to: p.pool, data: SIG_SLOT0 }, 'latest'])
        .catch(() => null)
    )
  );

  return TOP_POOLS_V3.map((p, i) => {
    const raw = results[i];
    if (!raw || raw === '0x') return { ...p, sqrtPriceX96: '0', tick: 0, price: 0 };
    const sqrtPriceX96 = BigInt('0x' + raw.slice(2, 66));
    const tick = parseInt(raw.slice(66, 72), 16);
    const price = Number(
      (sqrtPriceX96 * sqrtPriceX96 * BigInt(Math.pow(10, p.token0Decimals))) /
      (BigInt(2) ** BigInt(192) * BigInt(Math.pow(10, p.token1Decimals)))
    );
    return { symbol: p.symbol, pool: p.pool, sqrtPriceX96: sqrtPriceX96.toString(), tick, price };
  });
}

/** Exponer estado de salud de endpoints para debug / monitoring */
export function getEndpointStatus() {
  return endpointHealth.map(ep => ({
    url: ep.url.slice(0, 55) + '...',
    exhausted: ep.exhausted,
    errorCount: ep.errorCount,
    exhaustedAt: ep.exhaustedAt ? new Date(ep.exhaustedAt).toISOString() : null,
  }));
}
