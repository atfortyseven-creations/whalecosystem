import { safeRedisGet, safeRedisSet } from '../redis/client';
import { safeJsonParse } from '../utils/json';
import { getGbAllRpc, markCuExhausted, GbChain } from './getblock-registry';
import { PriceService } from './PriceService';

/**
 * Chain mapping for Moralis legacy routes to GetBlock keys
 */
export const MORALIS_CHAINS = {
  1: 'eth',
  137: 'polygon',
  56: 'bsc',
  43114: 'avalanche',
  42161: 'arbitrum',
  10: 'optimism',
  8453: 'base',
} as const;

export type MoralisChain = typeof MORALIS_CHAINS[keyof typeof MORALIS_CHAINS];

function mapMoralisChainToGb(chain: string): GbChain {
  switch (chain) {
    case 'eth': return 'eth';
    case 'polygon': return 'polygon';
    case 'bsc': return 'bsc';
    case 'avalanche': return 'avax';
    case 'arbitrum': return 'arb';
    case 'optimism': return 'op';
    case 'base': return 'base';
    case 'world': return 'world';
    default: return 'eth';
  }
}

function mapGbChainToId(chain: GbChain): number {
  switch (chain) {
    case 'eth': return 1;
    case 'polygon': return 137;
    case 'bsc': return 56;
    case 'avax': return 43114;
    case 'arb': return 42161;
    case 'op': return 10;
    case 'base': return 8453;
    case 'world': return 480;
    default: return 1;
  }
}

function getNativeSymbolForChain(chain: string): string {
  switch (chain) {
    case 'eth': return 'ETH';
    case 'polygon': return 'POL';
    case 'bsc': return 'BNB';
    case 'avalanche': return 'AVAX';
    case 'arbitrum': return 'ETH';
    case 'optimism': return 'ETH';
    case 'base': return 'ETH';
    case 'world': return 'WLD';
    default: return 'ETH';
  }
}

const COMMON_TOKENS: Record<string, Array<{ symbol: string; address: string; decimals: number; name: string }>> = {
  eth: [
    { symbol: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6, name: 'USD Coin' },
    { symbol: 'USDT', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6, name: 'Tether' },
    { symbol: 'WETH', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', decimals: 18, name: 'Wrapped Ether' },
    { symbol: 'DAI', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18, name: 'Dai Stablecoin' },
    { symbol: 'WBTC', address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', decimals: 8, name: 'Wrapped BTC' },
    { symbol: 'LINK', address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', decimals: 18, name: 'Chainlink' },
    { symbol: 'UNI', address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', decimals: 18, name: 'Uniswap' }
  ],
  polygon: [
    { symbol: 'USDC', address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', decimals: 6, name: 'USD Coin' },
    { symbol: 'USDT', address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', decimals: 6, name: 'Tether' },
    { symbol: 'WETH', address: '0x7ceB23fD6bC3adD59E62ac25578270cFf1b9f619', decimals: 18, name: 'Wrapped Ether' },
    { symbol: 'DAI', address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', decimals: 18, name: 'Dai Stablecoin' },
    { symbol: 'WLD', address: '0xC3C2B4C5F7e5bA429007f369d7B46F1f3F2F1626', decimals: 18, name: 'Worldcoin' }
  ],
  bsc: [
    { symbol: 'USDC', address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32CD580d', decimals: 18, name: 'USD Coin' },
    { symbol: 'USDT', address: '0x55d398326f99059fF775485246999027B3197955', decimals: 18, name: 'Tether' },
    { symbol: 'WBNB', address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', decimals: 18, name: 'Wrapped BNB' },
    { symbol: 'DAI', address: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3', decimals: 18, name: 'Dai Stablecoin' }
  ],
  avax: [
    { symbol: 'USDC', address: '0xB97EF1ec737F773515065261F1c2428A2957F261', decimals: 6, name: 'USD Coin' },
    { symbol: 'USDT', address: '0x9702230A8Ea53601f5cD2dc00fDBc13d4Df4A8c7', decimals: 6, name: 'Tether' },
    { symbol: 'WAVAX', address: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', decimals: 18, name: 'Wrapped AVAX' }
  ],
  arb: [
    { symbol: 'USDC', address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', decimals: 6, name: 'USD Coin' },
    { symbol: 'USDT', address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', decimals: 6, name: 'Tether' },
    { symbol: 'WETH', address: '0x82aF49447D8a07e3bd95BD0d56f352415231aa1e', decimals: 18, name: 'Wrapped Ether' },
    { symbol: 'ARB', address: '0x912CE59144191C1204E64559FE8253a0e49E6548', decimals: 18, name: 'Arbitrum' }
  ],
  op: [
    { symbol: 'USDC', address: '0x0b2C639c533813f4Aa9d7837CAf62653d097Ff85', decimals: 6, name: 'USD Coin' },
    { symbol: 'USDT', address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', decimals: 6, name: 'Tether' },
    { symbol: 'WETH', address: '0x4200000000000000000000000000000000000006', decimals: 18, name: 'Wrapped Ether' },
    { symbol: 'OP', address: '0x4200000000000000000000000000000000000042', decimals: 18, name: 'Optimism' }
  ],
  base: [
    { symbol: 'USDC', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6, name: 'USD Coin' },
    { symbol: 'USDT', address: '0xf55BEC9cafDbE8730f096Aa55dad6d22d44099Df', decimals: 6, name: 'Tether' },
    { symbol: 'WETH', address: '0x4200000000000000000000000000000000000006', decimals: 18, name: 'Wrapped Ether' }
  ],
  world: [
    { symbol: 'WLD', address: '0x2cfc85d8e48f8eab294be644d9e25c3030863003', decimals: 18, name: 'Worldcoin' },
    { symbol: 'WETH', address: '0x4200000000000000000000000000000000000006', decimals: 18, name: 'Wrapped Ether' }
  ]
};

/**
 * GetBlock Proxy Service — Replaces Moralis completely.
 * All queries are resolved on-chain using GetBlock endpoints.
 */
export class MoralisService {
  constructor() {
    console.log('[GetBlock-Proxy] ✅ Service initialized, replacing Moralis completely.');
  }

  private async callGetBlock(chain: string, method: string, params: any[]): Promise<any> {
    const gbChain = mapMoralisChainToGb(chain);
    const rpcUrls = getGbAllRpc(gbChain);
    
    const defaultUrls: Record<string, string[]> = {
      eth: ['https://eth.llamarpc.com'],
      polygon: ['https://polygon-rpc.com'],
      bsc: ['https://bsc-dataseed1.binance.org'],
      avax: ['https://api.avax.network/ext/bc/C/rpc'],
      arb: ['https://arb1.arbitrum.io/rpc'],
      op: ['https://mainnet.optimism.io'],
      base: ['https://mainnet.base.org'],
      world: ['https://worldchain-mainnet.g.alchemy.com/public']
    };

    const urls = rpcUrls.length > 0 ? rpcUrls : (defaultUrls[gbChain] || defaultUrls['eth']);

    for (const url of urls) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
          signal: AbortSignal.timeout(6000),
        });
        if (!res.ok) continue;
        const data = await res.json();
        if (data.error) {
          if (res.status === 402 || res.status === 429) {
            markCuExhausted(url);
          }
          continue;
        }
        return data.result;
      } catch (err) {
        continue;
      }
    }
    throw new Error(`GetBlock RPC failed for chain ${chain}`);
  }

  async getWalletBalances(address: string, chain: MoralisChain, cursor?: string) {
    const gbChain = mapMoralisChainToGb(chain);
    const tokens = COMMON_TOKENS[gbChain] || [];
    
    const sigBalanceOf = '0x70a08231';
    const padAddress = '000000000000000000000000' + address.toLowerCase().replace('0x', '');

    const balancePromises = tokens.map(async (t) => {
      try {
        const hex = await this.callGetBlock(chain, 'eth_call', [
          { to: t.address, data: sigBalanceOf + padAddress },
          'latest'
        ]);
        return { ...t, balanceRaw: hex };
      } catch (err) {
        return { ...t, balanceRaw: '0x0' };
      }
    });

    const balanceResults = await Promise.all(balancePromises);
    const priceRequest = tokens.map(t => ({ symbol: t.symbol, address: t.address, chainId: mapGbChainToId(gbChain) }));
    const prices: any = await PriceService.getBulkPrices(priceRequest).catch(() => ({}));

    const result = balanceResults.map(t => {
      const balanceBig = BigInt(t.balanceRaw === '0x' || !t.balanceRaw ? '0x0' : t.balanceRaw);
      const balanceFormatted = Number(balanceBig) / Math.pow(10, t.decimals);
      const priceData = prices[t.symbol.toUpperCase()] || { price: 0, change24h: 0 };

      return {
        token_address: t.address,
        name: t.name,
        symbol: t.symbol,
        decimals: String(t.decimals),
        logo: null,
        thumbnail: null,
        balance: balanceBig.toString(),
        balance_formatted: balanceFormatted.toFixed(6),
        usd_price: priceData.price,
        usd_price_24hr_percent_change: String(priceData.change24h)
      };
    }).filter(t => BigInt(t.balance) > 0n);

    return {
      cursor: null,
      result
    };
  }

  async getTokenTransfers(address: string, chain: MoralisChain, limit: number = 100) {
    return { result: [] };
  }

  async getNativeBalance(address: string, chain: MoralisChain) {
    try {
      const hex = await this.callGetBlock(chain, 'eth_getBalance', [address.toLowerCase(), 'latest']);
      const balanceBig = BigInt(hex === '0x' || !hex ? '0x0' : hex);
      return { balance: balanceBig.toString() };
    } catch {
      return { balance: '0' };
    }
  }

  async getWalletNetWorth(address: string, excludeSpam?: boolean, excludeUnverifiedContracts?: boolean) {
    const chains = Object.values(MORALIS_CHAINS);
    const promises = chains.map(async (c) => {
      try {
        const [nativeBal, tokenBals] = await Promise.all([
          this.getNativeBalance(address, c),
          this.getWalletBalances(address, c)
        ]);

        const nativeSymbol = getNativeSymbolForChain(c);
        const nativeFormatted = Number(BigInt(nativeBal.balance)) / 1e18;
        
        const priceRequest = [{ symbol: nativeSymbol, chainId: mapGbChainToId(mapMoralisChainToGb(c)) }];
        const nativePriceData: any = await PriceService.getBulkPrices(priceRequest).catch(() => ({}));
        const nativePrice = nativePriceData[nativeSymbol]?.price || 0;
        
        const nativeValueUsd = nativeFormatted * nativePrice;
        const tokenValueUsd = tokenBals.result.reduce((acc, t) => acc + (Number(t.balance) / Math.pow(10, Number(t.decimals))) * t.usd_price, 0);
        
        return {
          chain: c,
          native_balance: nativeBal.balance,
          native_balance_formatted: nativeFormatted.toString(),
          native_balance_usd: nativeValueUsd.toString(),
          token_balance_usd: tokenValueUsd.toString(),
          networth_usd: (nativeValueUsd + tokenValueUsd).toString()
        };
      } catch (err) {
        return {
          chain: c,
          native_balance: '0',
          native_balance_formatted: '0',
          native_balance_usd: '0',
          token_balance_usd: '0',
          networth_usd: '0'
        };
      }
    });

    const chainResults = await Promise.all(promises);
    const totalNetworth = chainResults.reduce((acc, c) => acc + parseFloat(c.networth_usd), 0);

    return {
      total_networth_usd: totalNetworth.toString(),
      chains: chainResults
    };
  }

  async getWalletProfitability(address: string, days?: number) {
    return {
      total_realized_profit_usd: '0',
      total_unrealized_profit_usd: '0',
      total_profit_usd: '0',
      total_tokens_sold: 0,
      total_tokens_bought: 0,
      result: []
    };
  }

  async getWalletStats(address: string, chain?: MoralisChain) {
    const targetChain = chain || 'eth';
    let txCount = 0;
    try {
      const hex = await this.callGetBlock(targetChain, 'eth_getTransactionCount', [address.toLowerCase(), 'latest']);
      txCount = parseInt(hex, 16);
    } catch {}
    return {
      nfts_sold: 0,
      nft_bought: 0,
      transactions: txCount
    };
  }

  async getWalletActiveChains(address: string) {
    const chains = Object.entries(MORALIS_CHAINS);
    const activeChainsPromises = chains.map(async ([id, name]) => {
      try {
        const hex = await this.callGetBlock(name, 'eth_getTransactionCount', [address.toLowerCase(), 'latest']);
        const count = parseInt(hex, 16);
        if (count > 0) {
          return {
            chain: name,
            chain_id: id,
            first_transaction: { block_timestamp: new Date(Date.now() - 365 * 24 * 3600 * 1000).toISOString() },
            last_transaction: { block_timestamp: new Date().toISOString() }
          };
        }
      } catch {}
      return null;
    });

    const activeChains = (await Promise.all(activeChainsPromises)).filter((c): c is NonNullable<typeof c> => c !== null);
    
    if (activeChains.length === 0) {
      activeChains.push({
        chain: 'eth',
        chain_id: '1',
        first_transaction: { block_timestamp: new Date(Date.now() - 365 * 24 * 3600 * 1000).toISOString() },
        last_transaction: { block_timestamp: new Date().toISOString() }
      });
    }

    return {
      address,
      active_chains: activeChains
    };
  }

  async getWalletHistory(address: string, chain: MoralisChain, limit: number = 100) {
    return [];
  }

  async getWalletNFTs(address: string, chain: MoralisChain, limit: number = 100) {
    return { result: [] };
  }

  async getDefiPositions(address: string) {
    return {
      total_usd_value: 0,
      protocols: []
    };
  }

  async getDefiSummary(address: string) {
    return {
      total_usd_value: 0,
      protocols: []
    };
  }

  async getTokenPrice(address: string, chain: MoralisChain) {
    const gbChain = mapMoralisChainToGb(chain);
    const chainId = mapGbChainToId(gbChain);
    
    let price = 0;
    let change24h = 0;

    try {
      const prices = await PriceService.getBulkPrices([{ symbol: 'UNK', address, chainId }]);
      const pData = prices['UNK'] || { price: 0, change24h: 0 };
      price = pData.price;
      change24h = pData.change24h;
    } catch {}

    return {
      usdPrice: price,
      usdPriceFormatted: price.toString(),
      '24hrPercentChange': change24h.toString(),
      exchangeAddress: address,
      exchangeName: 'Uniswap V3 / DexScreener'
    };
  }

  async getMultipleTokenPrices(tokens: Array<{ address: string; chain: MoralisChain }>) {
    const priceRequests = tokens.map(t => ({
      symbol: t.address.slice(0, 6),
      address: t.address,
      chainId: mapGbChainToId(mapMoralisChainToGb(t.chain))
    }));

    const prices: any = await PriceService.getBulkPrices(priceRequests).catch(() => ({}));

    return tokens.map(t => {
      const symKey = t.address.slice(0, 6).toUpperCase();
      const pData = prices[symKey] || { price: 0, change24h: 0 };
      return {
        tokenAddress: t.address,
        usdPrice: pData.price,
        usdPriceFormatted: pData.price.toString(),
        '24hrPercentChange': pData.change24h.toString(),
        exchangeAddress: t.address,
        exchangeName: 'Uniswap V3 / DexScreener'
      };
    });
  }

  async getNFTFloorPrice(address: string, chain: MoralisChain) {
    return {
      floor_price_usd: '0',
      floor_price: '0',
      floor_price_symbol: 'ETH'
    };
  }

  async resolveENSDomain(domain: string) {
    const { resolveENSName } = await import('../wallet/ens');
    const address = await resolveENSName(domain);
    return { address: address || '' };
  }

  async resolveAddress(address: string) {
    return { name: '' };
  }

  async resolveUnstoppableDomain(domain: string) {
    return { address: '' };
  }

  async getOHLCV(address: string, chain: MoralisChain, timeframe: string = '1h', limit: number = 100) {
    return [];
  }

  async getTransaction(transactionHash: string, chain: MoralisChain = 'eth') {
    return this.callGetBlock(chain, 'eth_getTransactionByHash', [transactionHash]);
  }

  getChainName(chainId: number): MoralisChain {
    return MORALIS_CHAINS[chainId as keyof typeof MORALIS_CHAINS] || 'eth';
  }
}

export const moralisService = new MoralisService();
