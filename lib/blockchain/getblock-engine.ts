/**
 * GetBlock Engine — Dedicated Ethereum Node
 *
 * Utilizamos nuestro Interstellar Node dedicado para Ethereum
 * para resolver consultas de balances de manera confiable.
 *
 * EP1: https://go.getblock.us/81ed63d96d704589999ff99c9a1ff64b
 */

// ── DYNAMIC ENDPOINT LOADING ────────────────────────────────────────────────
const ALL_ENDPOINTS = [
  process.env.ETH_RPC_URL || 'https://go.getblock.us/81ed63d96d704589999ff99c9a1ff64b',
  process.env.GETBLOCK_ETH_RPC_1,
].filter(Boolean) as string[];

// ── Estado de salud por endpoint ─────────────────────────────────────────────
interface EndpointHealth {
  url: string;
  exhausted: boolean;
  exhaustedAt?: number;
  errorCount: number;
}

const endpointHealth: EndpointHealth[] = ALL_ENDPOINTS.map(url => ({
  url,
  exhausted: false,
  errorCount: 0,
}));

// Cooldown de 10 min para 402/429
const EXHAUSTION_COOLDOWN_MS = 10 * 60 * 1000;

function getActiveEndpoints(): EndpointHealth[] {
  const now = Date.now();
  for (const ep of endpointHealth) {
    if (ep.exhausted && ep.exhaustedAt && now - ep.exhaustedAt > EXHAUSTION_COOLDOWN_MS) {
      ep.exhausted = false;
      ep.errorCount = 0;
    }
  }
  return endpointHealth.filter(ep => !ep.exhausted);
}

function markExhausted(url: string, reason: string) {
  const ep = endpointHealth.find(e => e.url === url);
  if (!ep) return;
  ep.exhausted = true;
  ep.exhaustedAt = Date.now();
  console.warn(`[GetBlock-Engine] 💀 BLACKLISTED (${reason}): ${url.slice(0, 40)}...`);
}

// ── JSON-RPC core con failover automático ────────────────────────────────────
async function rpcWithFailover(method: string, params: unknown[], id = 1): Promise<string> {
  const active = getActiveEndpoints();

  if (active.length === 0) {
    // Si todo GetBlock falló, intentar fallback público de emergencia por fetch
    return fetch('https://eth.llamarpc.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', method, params, id })
    }).then(r => r.json()).then(j => j.result as string).catch(() => '0x0');
  }

  for (const ep of active) {
    try {
      const res = await fetch(ep.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', method, params, id }),
        signal: AbortSignal.timeout(8000),
      });

      if (res.status === 402 || res.status === 429 || res.status === 401) {
        markExhausted(ep.url, `HTTP_${res.status}`);
        continue;
      }

      if (!res.ok) continue;

      const json = await res.json() as { result?: string; error?: any };
      if (json.error) {
          const msg = JSON.stringify(json.error);
          if (msg.includes('quota') || msg.includes('limit') || msg.includes('unauthorized')) {
              markExhausted(ep.url, 'RPC_LIMIT');
              continue;
          }
          throw new Error(msg);
      }

      return json.result as string;
    } catch (err: any) {
        continue;
    }
  }
  return '0x0'; // Fallback de silencio absoluto
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
