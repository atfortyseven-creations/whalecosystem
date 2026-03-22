import useSWR from 'swr';

const COINGECKO_IDS: Record<string, string> = {
    BTC: 'bitcoin', ETH: 'ethereum', BNB: 'binancecoin', SOL: 'solana', XRP: 'ripple',
    ADA: 'cardano', DOGE: 'dogecoin', SHIB: 'shiba-inu', DOT: 'polkadot', LINK: 'chainlink',
    MATIC: 'matic-network', AVAX: 'avalanche-2', TRX: 'tron', UNI: 'uniswap', PEPE: 'pepe',
    FET: 'fetch-ai', DAI: 'dai', APE: 'apecoin', LDO: 'lido-dao', ARB: 'arbitrum',
    OP: 'optimism', STRK: 'starknet-2', WLD: 'worldcoin-wld', NEAR: 'near'
};

const COINGECKO_API_URL = `https://api.coingecko.com/api/v3/simple/price?ids=${Object.values(COINGECKO_IDS).join(',')}&vs_currencies=usd&include_24hr_change=true`;

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useTokenPrice() {
    const { data, error, isLoading } = useSWR(COINGECKO_API_URL, fetcher, {
        refreshInterval: 60000,
        dedupingInterval: 60000,
    });

    const prices: Record<string, number> = {};
    const changes: Record<string, number> = {};

    if (data) {
        Object.entries(COINGECKO_IDS).forEach(([symbol, id]) => {
            prices[symbol] = data[id]?.usd || 0;
            changes[symbol] = data[id]?.usd_24h_change || 0;
        });
    }

    return {
        prices,
        changes,
        isLoading,
        error,
    };
}

