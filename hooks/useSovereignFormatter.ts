import { useSettingsStore } from '@/lib/store/useSettingsStore';
import { useMarketStream } from '@/context/MarketStreamContext';

const FIAT_RATES: Record<string, number> = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 153.20,
};

export function useSovereignFormatter() {
    const { settings } = useSettingsStore();
    const { markets } = useMarketStream();

    const formatMoney = (usdValue: number, decimals: number = 2) => {
        if (settings?.showBalances === false) return '***';

        const baseUnit = settings?.displayUnit || 'FIAT';
        
        // 1. If displaying in pure cryptocurrency amounts native to the ecosystem
        if (baseUnit === 'BTC') {
            const btcPriceStr = markets.get('BTCUSDT')?.lastPrice || '65000';
            const btcPrice = parseFloat(btcPriceStr);
            const inBtc = usdValue / btcPrice;
            return `₿${inBtc.toFixed(6)}`;
        }
        if (baseUnit === 'ETH') {
            const ethPriceStr = markets.get('ETHUSDT')?.lastPrice || '3500';
            const ethPrice = parseFloat(ethPriceStr);
            const inEth = usdValue / ethPrice;
            return `Ξ${inEth.toFixed(4)}`;
        }

        // 2. If displaying in FIAT (Default)
        const targetCurrency = settings?.currency || 'USD';
        const rate = FIAT_RATES[targetCurrency] || 1;
        const converted = usdValue * rate;

        const currencyMap: Record<string, string> = {
            USD: '$', EUR: '€', GBP: '£', JPY: '¥'
        };
        const symbol = currencyMap[targetCurrency] || '$';

        return `${symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
    };

    const formatLargeMoney = (usdValue: number) => {
        if (settings?.showBalances === false) return '***';

        const baseUnit = settings?.displayUnit || 'FIAT';
        if (baseUnit !== 'FIAT') {
            // Keep native formatting for crypto, don't use Billions/Millions acronyms
            return formatMoney(usdValue, 2);
        }

        const targetCurrency = settings?.currency || 'USD';
        const rate = FIAT_RATES[targetCurrency] || 1;
        const converted = usdValue * rate;
        
        const currencyMap: Record<string, string> = {
            USD: '$', EUR: '€', GBP: '£', JPY: '¥'
        };
        const symbol = currencyMap[targetCurrency] || '$';

        if (converted >= 1e9)  return `${symbol}${(converted / 1e9).toFixed(2)}B`;
        if (converted >= 1e6)  return `${symbol}${(converted / 1e6).toFixed(2)}M`;
        if (converted >= 1e3)  return `${symbol}${(converted / 1e3).toFixed(1)}K`;
        
        return `${symbol}${converted.toFixed(2)}`;
    };

    return { formatMoney, formatLargeMoney };
}
