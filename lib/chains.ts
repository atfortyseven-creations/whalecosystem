/**
 * Multi-Chain Configuration for Expert-Level Whale Tracking
 * Supports: Ethereum, Base, Polygon, Arbitrum, Optimism
 */

export interface ChainConfig {
  id: number;
  name: string;
  shortName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
  iconUrl: string;
  color: string;
  isTestnet: boolean;
}

export const SUPPORTED_CHAINS: Record<string, ChainConfig> = {
  ethereum: {
    id: 1,
    name: 'Ethereum Mainnet',
    shortName: 'ETH',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: [
      process.env.ETH_RPC_URL || 'https://go.getblock.us/81ed63d96d704589999ff99c9a1ff64b',
      'https://cloudflare-eth.com',
      'https://rpc.ankr.com/eth',
    ],
    blockExplorerUrls: ['https://etherscan.io'],
    iconUrl: '/chains/ethereum.svg',
    color: '#627EEA',
    isTestnet: false,
  },
  bnb: {
    id: 56,
    name: 'BNB Smart Chain',
    shortName: 'BSC',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    rpcUrls: [
      process.env.BNB_RPC_URL || 'https://go.getblock.us/8405bc34194e4343a10cdc7a76360793',
      'https://bsc-dataseed1.binance.org',
      'https://rpc.ankr.com/bsc',
    ],
    blockExplorerUrls: ['https://bscscan.com'],
    iconUrl: '/chains/bsc.svg',
    color: '#F3BA2F',
    isTestnet: false,
  },
  base: {
    id: 8453,
    name: 'Base',
    shortName: 'BASE',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: [
      'https://base-mainnet.g.alchemy.com/v2/',
      'https://base.llamarpc.com',
      'https://developer-access-mainnet.base.org',
      'https://mainnet.base.org',
    ],
    blockExplorerUrls: ['https://basescan.org'],
    iconUrl: '/chains/base.svg',
    color: '#0052FF',
    isTestnet: false,
  },
  polygon: {
    id: 137,
    name: 'Polygon',
    shortName: 'MATIC',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: [
      'https://polygon-mainnet.g.alchemy.com/v2/',
      'https://polygon-rpc.com',
      'https://rpc.ankr.com/polygon',
    ],
    blockExplorerUrls: ['https://polygonscan.com'],
    iconUrl: '/chains/polygon.svg',
    color: '#8247E5',
    isTestnet: false,
  },
  arbitrum: {
    id: 42161,
    name: 'Arbitrum One',
    shortName: 'ARB',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: [
      'https://arb-mainnet.g.alchemy.com/v2/',
      'https://arb1.arbitrum.io/rpc',
      'https://rpc.ankr.com/arbitrum',
    ],
    blockExplorerUrls: ['https://arbiscan.io'],
    iconUrl: '/chains/arbitrum.svg',
    color: '#28A0F0',
    isTestnet: false,
  },
  optimism: {
    id: 10,
    name: 'Optimism',
    shortName: 'OP',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: [
      'https://opt-mainnet.g.alchemy.com/v2/',
      'https://mainnet.optimism.io',
      'https://rpc.ankr.com/optimism',
    ],
    blockExplorerUrls: ['https://optimistic.etherscan.io'],
    iconUrl: '/chains/optimism.svg',
    color: '#FF0420',
    isTestnet: false,
  },
  bitcoin: {
    id: 0, 
    name: 'Bitcoin',
    shortName: 'BTC',
    nativeCurrency: {
      name: 'Bitcoin',
      symbol: 'BTC',
      decimals: 8,
    },
    // Use the custom GetBlock endpoint if available, otherwise fallback
    rpcUrls: [
        process.env.NEXT_PUBLIC_BITCOIN_RPC_URL || 'https://mempool.space/api', 
        'https://mempool.space/api'
    ], 
    blockExplorerUrls: ['https://mempool.space'],
    iconUrl: '/chains/bitcoin.svg',
    color: '#F7931A',
    isTestnet: false,
  },
  solana: {
    id: 101, // Custom ID for internal use
    name: 'Solana',
    shortName: 'SOL',
    nativeCurrency: {
      name: 'Solana',
      symbol: 'SOL',
      decimals: 9,
    },
    rpcUrls: ['https://api.mainnet-beta.solana.com'],
    blockExplorerUrls: ['https://solscan.io'],
    iconUrl: '/chains/solana.svg',
    color: '#14F195',
    isTestnet: false,
  },
  worldchain: {
    id: 480,
    name: 'World Chain',
    shortName: 'WLD',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: [
      `https://worldchain-mainnet.g.alchemy.com/v2/`,
      'https://rpc.worldchain.org'
    ],
    blockExplorerUrls: ['https://worldscan.org'],
    iconUrl: '/chains/worldchain.svg', // Assuming this exists or will be added
    color: '#000000',
    isTestnet: false,
  },
  scroll: {
    id: 534352,
    name: 'Scroll',
    shortName: 'SCROLL',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: [
      'https://rpc.scroll.io',
      'https://scroll-mainnet.public.blastapi.io',
      'https://1rpc.io/scroll'
    ],
    blockExplorerUrls: ['https://scrollscan.com'],
    iconUrl: '/chains/scroll.svg',
    color: '#FFDBB0',
    isTestnet: false,
  }
};

export const getChainById = (chainId: number): ChainConfig | undefined => {
  return Object.values(SUPPORTED_CHAINS).find(chain => chain.id === chainId);
};

export const getChainByName = (name: string): ChainConfig | undefined => {
  return SUPPORTED_CHAINS[name.toLowerCase()];
};

export const getAllChains = (): ChainConfig[] => {
  return Object.values(SUPPORTED_CHAINS);
};

export const getMainnetChains = (): ChainConfig[] => {
  return Object.values(SUPPORTED_CHAINS).filter(chain => !chain.isTestnet);
};

export const formatChainName = (chainId: number): string => {
  const chain = getChainById(chainId);
  return chain ? chain.shortName : `Chain ${chainId}`;
};

export const getExplorerUrl = (chainId: number, address: string, type: 'address' | 'tx' = 'address'): string => {
  const chain = getChainById(chainId);
  if (!chain) return '#';
  
  const baseUrl = chain.blockExplorerUrls[0];
  return `${baseUrl}/${type}/${address}`;
};

