import { create } from 'zustand';

// -----------------------------------------------------------------------------
// 1. STRICT INTERFACES
// -----------------------------------------------------------------------------

export interface BinanceTradePayload {
  e: string;  // Event type
  E: number;  // Event time
  s: string;  // Symbol
  t: number;  // Trade ID
  p: string;  // Price
  q: string;  // Quantity
  b: number;  // Buyer order ID
  a: number;  // Seller order ID
  T: number;  // Trade time
  m: boolean; // Is the buyer the market maker?
  M: boolean; // Ignore
}

export interface Web3WhaleAlert {
  id: string;
  txHash: string;
  asset: string;
  amount: number;
  usdValue: number;
  from: string;
  to: string;
  chain: string;
  action: 'BUY' | 'SELL' | 'TRANSFER';
  timestamp: number;
}

export interface SniperFilters {
  minVolumeUsd: number;
  targetAssets: string[];
  chains: string[];
  autoExecute: boolean;
  slippageTolerance: number;
  gasLimitGwei: number;
}

export interface SniperMetrics {
  wsLatencyMs: number;
  lastUpdateTs: number;
  activeConnection: boolean;
  rpcStatus: 'HEALTHY' | 'DEGRADED' | 'DOWN';
}

interface SniperState {
  // Real-time Data Streams (Circular Buffer)
  currentPrice: number;
  alerts: Web3WhaleAlert[];
  
  // Tactical Configuration
  filters: SniperFilters;
  metrics: SniperMetrics;

  // HFT Actions
  setPrice: (price: number, latency?: number) => void;
  pushAlert: (alert: Web3WhaleAlert) => void;
  updateFilters: (updates: Partial<SniperFilters>) => void;
  setConnectionStatus: (status: boolean) => void;
}

// -----------------------------------------------------------------------------
// 2. ZUSTAND STORE (HFT OPTIMIZED - ZERO RENDER PROPAGATION)
// -----------------------------------------------------------------------------
const MAX_BUFFER_SIZE = 100;

export const useSniperStore = create<SniperState>((set) => ({
  // Initial State
  currentPrice: 0,
  alerts: [],
  filters: {
    minVolumeUsd: 1000000, // 1M USD Default
    targetAssets: ['ETH', 'BTC'],
    chains: ['ETHEREUM'],
    autoExecute: false,
    slippageTolerance: 0.5,
    gasLimitGwei: 50,
  },
  metrics: {
    wsLatencyMs: 0,
    lastUpdateTs: 0,
    activeConnection: false,
    rpcStatus: 'HEALTHY',
  },

  // Actions
  setPrice: (price, latency) => 
    set((state) => ({ 
      currentPrice: price,
      metrics: {
        ...state.metrics,
        wsLatencyMs: latency ?? state.metrics.wsLatencyMs,
        lastUpdateTs: Date.now(),
      }
    })),

  pushAlert: (alert) => 
    set((state) => {
      // Apply strict mathematical filtering before buffering
      if (alert.usdValue < state.filters.minVolumeUsd) return state;
      if (!state.filters.targetAssets.includes(alert.asset)) return state;

      // Circular Buffer implementation (unshift + slice)
      const newBuffer = [alert, ...state.alerts].slice(0, MAX_BUFFER_SIZE);
      return { alerts: newBuffer };
    }),

  updateFilters: (updates) => 
    set((state) => ({ filters: { ...state.filters, ...updates } })),

  setConnectionStatus: (status) =>
    set((state) => ({ metrics: { ...state.metrics, activeConnection: status } })),
}));
