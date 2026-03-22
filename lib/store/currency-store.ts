import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CurrencyCode = 'USD' | 'EUR' | 'BTC'

interface CurrencyState {
  currency: CurrencyCode;
  rates: Record<CurrencyCode, number>;
  lastUpdated: number;
  setCurrency: (currency: CurrencyCode) => void;
  updateRates: (newRates: Partial<Record<CurrencyCode, number>>) => void;
  fetchRates: () => Promise<void>;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      currency: 'USD',
      rates: {
        USD: 1,
        EUR: 0.92,
        BTC: 0.000015,
      },
      lastUpdated: 0,
      setCurrency: (currency) => set({ currency }),
      updateRates: (newRates) => set((state) => ({ 
        rates: { ...state.rates, ...newRates },
        lastUpdated: Date.now()
      })),
      fetchRates: async () => {
        try {
          // 1. Fetch BTC/USD from existing market ticker
          const tickerRes = await fetch('/api/market/ticker');
          const tickerData = await tickerRes.json();
          
          const newRates: Partial<Record<CurrencyCode, number>> = {};
          
          if (tickerData.BTC?.price) {
            newRates.BTC = 1 / tickerData.BTC.price;
          }

          // 2. Fetch EUR/USD from a public API
          const forexRes = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
          const forexData = await forexRes.json();
          if (forexData?.rates?.EUR) {
            newRates.EUR = forexData.rates.EUR;
          }

          set((state) => ({
            rates: { ...state.rates, ...newRates },
            lastUpdated: Date.now()
          }));
        } catch (e) {
          console.error('[CurrencyStore] Failed to fetch live rates:', e);
        }
      }
    }),
    {
      name: 'whale-currency-storage',
    }
  )
)
