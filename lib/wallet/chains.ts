/**
 * Multi-Chain Support
 * Support for Ethereum, Polygon, Base, Arbitrum, Optimism, and more
 */

import { Chain } from 'wagmi/chains';
import { mainnet, polygon, base, arbitrum, optimism, polygonZkEvm, avalanche, bsc } from 'wagmi/chains';

export interface ChainConfig {
  id: number;
  name: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrl: string;
  logo: string;
  color: string;
}

/**
 * Supported blockchain networks
 */
export const SUPPORTED_CHAINS: Record<string, ChainConfig> = {
  ethereum: {
    id: 1,
    name: 'Ethereum',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: [
      `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
      'https://eth.llamarpc.com',
    ],
    blockExplorerUrl: 'https://etherscan.io',
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
    color: '#627EEA',
  },
  polygon: {
    id: 137,
    name: 'Polygon',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: [
      `https://polygon-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
      'https://polygon-rpc.com',
    ],
    blockExplorerUrl: 'https://polygonscan.com',
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/info/logo.png',
    color: '#8247E5',
  },
  base: {
    id: 8453,
    name: 'Base',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: [
      'https://mainnet.base.org',
      'https://base.llamarpc.com',
    ],
    blockExplorerUrl: 'https://basescan.org',
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/info/logo.png',
    color: '#0052FF',
  },
  arbitrum: {
    id: 42161,
    name: 'Arbitrum One',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: [
      `https://arb-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
      'https://arb1.arbitrum.io/rpc',
    ],
    blockExplorerUrl: 'https://arbiscan.io',
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/info/logo.png',
    color: '#28A0F0',
  },
  optimism: {
    id: 10,
    name: 'Optimism',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: [
      `https://opt-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
      'https://mainnet.optimism.io',
    ],
    blockExplorerUrl: 'https://optimistic.etherscan.io',
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/optimism/info/logo.png',
    color: '#FF0420',
  },
  avalanche: {
    id: 43114,
    name: 'Avalanche C-Chain',
    nativeCurrency: {
      name: 'AVAX',
      symbol: 'AVAX',
      decimals: 18,
    },
    rpcUrls: [
      'https://api.avax.network/ext/bc/C/rpc',
    ],
    blockExplorerUrl: 'https://snowtrace.io',
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/avalanchec/info/logo.png',
    color: '#E84142',
  },
  bsc: {
    id: 56,
    name: 'BNB Smart Chain',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    rpcUrls: [
      'https://bsc-dataseed1.binance.org',
    ],
    blockExplorerUrl: 'https://bscscan.com',
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/info/logo.png',
    color: '#F3BA2F',
  },
  bitcoin: {
    id: 0,
    name: 'Bitcoin',
    nativeCurrency: {
      name: 'Bitcoin',
      symbol: 'BTC',
      decimals: 8,
    },
    rpcUrls: [],
    blockExplorerUrl: 'https://mempool.space',
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/bitcoin/info/logo.png',
    color: '#F7931A',
  },
};

/**
 * Get Wagmi chain object by chain ID
 */
export function getWagmiChain(chainId: number): Chain | undefined {
  const chainMap: Record<number, Chain> = {
    [mainnet.id]: mainnet,
    [polygon.id]: polygon,
    [base.id]: base,
    [arbitrum.id]: arbitrum,
    [optimism.id]: optimism,
    [avalanche.id]: avalanche,
    [bsc.id]: bsc,
  };
  
  return chainMap[chainId];
}

/**
 * Get chain config by ID
 */
export function getChainById(chainId: number): ChainConfig | undefined {
  return Object.values(SUPPORTED_CHAINS).find(chain => chain.id === chainId);
}

/**
 * Get chain name by ID
 */
export function getChainName(chainId: number): string {
  const chain = getChainById(chainId);
  return chain?.name || 'Unknown Chain';
}

export const CHAIN_LOGOS: Record<number, string> = {
  1: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
  137: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/info/logo.png',
  10: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/optimism/info/logo.png',
  42161: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/info/logo.png',
  8453: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/info/logo.png',
  84532: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/info/logo.png',
  43114: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/avalanchec/info/logo.png',
  56: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/info/logo.png',
  42220: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/celo/info/logo.png',
  250: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/fantom/info/logo.png',
  324: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/zksync/info/logo.png',
  300: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/zksync/info/logo.png',
  100: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/xdai/info/logo.png',
  1101: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/info/logo.png',
  5000: 'https://icons.llamao.fi/icons/chains/rsz_mantle',
  81457: 'https://icons.llamao.fi/icons/chains/rsz_blast',
  34443: 'https://icons.llamao.fi/icons/chains/rsz_mode',
  169: 'https://icons.llamao.fi/icons/chains/rsz_manta',
  167000: 'https://icons.llamao.fi/icons/chains/rsz_taiko',
  2020: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ronin/info/logo.png',
  2222: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/kava/info/logo.png',
  1313161554: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/aurora/info/logo.png',
  1088: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/metis/info/logo.png',
  7777777: 'https://icons.llamao.fi/icons/chains/rsz_zora',
  1329: 'https://icons.llamao.fi/icons/chains/rsz_sei',
  30: 'https://icons.llamao.fi/icons/chains/rsz_rsk',
  59144: 'https://icons.llamao.fi/icons/chains/rsz_linea',
  534352: 'https://icons.llamao.fi/icons/chains/rsz_scroll',
  0: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/bitcoin/info/logo.png'
};

/**
 * Get chain logo by ID
 */
export function getChainLogo(chainId: number): string {
  if (CHAIN_LOGOS[chainId]) return CHAIN_LOGOS[chainId];
  const chain = getChainById(chainId);
  return chain?.logo || 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png';
}

/**
 * Get chain color by ID
 */
export function getChainColor(chainId: number): string {
  const chain = getChainById(chainId);
  return chain?.color || '#1F1F1F';
}

/**
 * Get block explorer URL for address
 */
export function getExplorerAddressUrl(chainId: number, address: string): string {
  const chain = getChainById(chainId);
  return chain ? `${chain.blockExplorerUrl}/address/${address}` : '';
}

/**
 * Get block explorer URL for transaction
 */
export function getExplorerTxUrl(chainId: number, txHash: string): string {
  const chain = getChainById(chainId);
  return chain ? `${chain.blockExplorerUrl}/tx/${txHash}` : '';
}

/**
 * Check if chain is supported
 */
export function isChainSupported(chainId: number): boolean {
  return Object.values(SUPPORTED_CHAINS).some(chain => chain.id === chainId);
}

/**
 * Get all supported chain IDs
 */
export function getSupportedChainIds(): number[] {
  return Object.values(SUPPORTED_CHAINS).map(chain => chain.id);
}

/**
 * Get native currency symbol for chain
 */
export function getNativeCurrencySymbol(chainId: number): string {
  const chain = getChainById(chainId);
  return chain?.nativeCurrency.symbol || 'ETH';
}

