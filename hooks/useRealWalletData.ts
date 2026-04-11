import { useAccount, useBalance } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { matchNewsToMarket } from '@/utils/news-matcher';
import { Asset, NewsItem, Position, Transaction } from '@/types/wallet';
import { useAuth } from '@/hooks/useAuth';
import { useWalletStore } from '@/lib/store/wallet-store';

import { safeToFixed, safeToLocaleString } from '@/lib/utils/number-format';
// Dirección de Bridged USDC en Polygon
const USDC_ADDRESS = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';

export const useRealWalletData = (recentNews: NewsItem[] = [], overrideAddress?: string) => {
    const { address: web3Address, isConnected: isWeb3Connected } = useAccount();
    const { isAuthenticated } = useAuth();
    
    // Unified connection state
    const isConnected = isWeb3Connected || isAuthenticated;
    
    // Fetch managed wallet if not connected via Web3
    const { data: managedWallet } = useQuery({
        queryKey: ['managed-wallet', isAuthenticated, isWeb3Connected],
        queryFn: async () => {
            if (!isAuthenticated || isWeb3Connected) return null;
            try {
                const { data } = await axios.get('/api/user/wallet');
                return data;
            } catch (error) {
                return null;
            }
        },
        enabled: isAuthenticated && !isWeb3Connected
    });

    const { address: sovereignAddress } = useWalletStore();
    
    // Priority: 1. Manual override, 2. Web3 Connected, 3. Sovereign Store, 4. Managed/Auth
    const effectiveAddress = overrideAddress || web3Address || sovereignAddress || managedWallet?.address;

    // [DEBUG] Monitor address resolution changes
    // console.log('[useRealWalletData] Address Resolution:', { effectiveAddress, isConnected, isAuthenticated, isWeb3Connected });

    // 1. On-Chain Balance (Wagmi ya maneja su propio caché/reactividad)
    const { data: balanceData, isLoading: isBalanceLoading } = useBalance({
        address: effectiveAddress,
        token: USDC_ADDRESS,
        chainId: 137, // Polygon
        query: {
            enabled: !!effectiveAddress,
            refetchInterval: 10000, // Sync on-chain balance every 10s
        }
    });

    // 2. Posiciones Off-Chain (Vía nuestro Proxy)
    const isValidAddress = effectiveAddress && effectiveAddress.startsWith('0x') && effectiveAddress.length === 42 && !effectiveAddress.includes('Virtual');
    
    const { data: positionsRaw, isLoading: isPositionsLoading } = useQuery({
        queryKey: ['positions', effectiveAddress],
        queryFn: async () => {
             // Si llegamos aquí sin check de 'enabled', evitamos la llamada igual
            if (!isValidAddress) return []; 
            const { data } = await axios.get(`/api/wallet/positions?userAddress=${effectiveAddress}`);
            return data;
        },
        enabled: !!isValidAddress,
        refetchInterval: 15000, // Sync prediction positions every 15s
    });

    // 3. Historial (History) - Enriched On-Chain History
    const { data: historyRaw, isLoading: isHistoryLoading } = useQuery({
        queryKey: ['enriched-history', effectiveAddress],
        queryFn: async () => {
             if (!isValidAddress) return [];
             try {
                const { data } = await axios.get(`/api/wallet/history/enriched?userAddress=${effectiveAddress}`);
                return data.activities || [];
             } catch (e) {
                console.error("Enriched history fetch failed:", e);
                return [];
             }
        },
        enabled: !!isValidAddress,
        refetchInterval: 30000,
    });


    // 4. Elite Multi-Chain Assets (Improved!)
    const { data: assetsData, isLoading: isAssetsLoading } = useQuery({
        queryKey: ['portfolio-assets', effectiveAddress],
        queryFn: async () => {
            if (!effectiveAddress) return null;
            // Fetch from Elite grade portfolio API
            const { data } = await axios.get(`/api/wallet/portfolio?address=${effectiveAddress}`);
            return data;
        },
        enabled: !!effectiveAddress,
            refetchInterval: 30_000, // Prevent RPC hammering at scale (was 5s)
    });

    // 5. Procesamiento y Enriquecimiento de Datos
    const positions: Position[] = (Array.isArray(positionsRaw) ? positionsRaw : []).map((pos: any) => {
        // Fix for crash reported by user: outcomePrices might be undefined
        const prices = pos.market?.outcomePrices;
        const currentPrice = prices ? parseFloat(prices[pos.outcomeIndex]) : 0;
        const avgPrice = parseFloat(pos.avgPrice) || currentPrice;
        const size = parseFloat(pos.size);

        // Cálculo PnL
        const value = size * currentPrice;
        const cost = size * avgPrice;
        const pnl = value - cost;
        const pnlPercent = cost > 0 ? (pnl / cost) * 100 : 0;

        // News Matching
        const newsContext = matchNewsToMarket(pos.market?.question || "", recentNews);

        return {
            id: pos.assetId,
            marketTitle: pos.market?.question || "Unknown Market",
            outcome: pos.outcome,
            shares: size,
            value,
            pnl,
            pnlPercent,
            newsContext // String title or undefined
        };
    }) || [];

    const transactions: Transaction[] = (Array.isArray(historyRaw) ? historyRaw : []).map((tx: any) => ({
        id: tx.id || tx.hash,
        type: tx.type === 'SWAP' ? 'SWAP' : tx.type === 'BRIDGE' ? 'BRIDGE' : (tx.type === 'SEND' ? 'SELL' : tx.type === 'RECEIVE' ? 'DEPOSIT' : 'TRANSFER'),
        amount: tx.value ? safeToFixed(parseFloat(tx.value), 4) : '0',
        asset: tx.asset || 'ETH',
        date: tx.timestamp ? new Date(tx.timestamp).toLocaleString() : 'Recently',
        status: 'COMPLETED',
        hash: tx.hash,
        chainId: tx.chainId,
        from: tx.from,
        to: tx.to,
        platform: tx.platform
    })) || [];

    // Assets processing (Mapped from Elite service)
    const assets: Asset[] = (assetsData?.tokens || []).map((t: any) => ({
        symbol: t.symbol,
        name: t.name,
        balance: t.balance,
        balanceNumeric: t.balanceNumeric,
        balanceFormatted: t.balanceFormatted || t.balanceNumeric?.toLocaleString(undefined, { maximumFractionDigits: 6 }) || "0",
        price: t.price || t.priceUSD || 0,
        valueUSD: t.valueUsd || t.valueUSD || 0,
        logoURI: t.logo || t.logoURI,
        chainId: t.chainId,
        change24h: t.change24h || 0
    }));

    // Totals
    const portfolioValue = positions.reduce((acc: number, curr: any) => acc + curr.value, 0);
    const multiChainBalance = assetsData?.totalValueUsd || 0;
    const usdcBalance = parseFloat(balanceData?.formatted || '0');
    
    // For "Rainbow" feel, we use the unified balance from the portfolio API
    // which already includes tokens, perps, and predictions.
    const totalNetWorth = multiChainBalance;

    return {
        address: effectiveAddress,
        isConnected,
        usdcBalance: safeToFixed(usdcBalance, 2),
        portfolioValue: safeToFixed(portfolioValue, 2),
        totalBalance: safeToFixed(totalNetWorth, 2),
        positions,
        transactions,
        stats: historyRaw?.stats || null, // New Stats object
        assets,
        perps: assetsData?.perps || [],
        predictions: assetsData?.predictions || [],
        claimables: assetsData?.claimables || [],
        isAssetsLoading,
        isHistoryLoading,
        isLoading: isBalanceLoading || isPositionsLoading || isHistoryLoading || isAssetsLoading,
        change24hUSD: assetsData?.change24hUSD || 0,
        change24hPercent: assetsData?.change24hPercent || 0,
        legendaryScore: assetsData?.legendaryScore || 0,
        strategicInsight: assetsData?.strategicInsight || '',
        backendAccounts: [] // Handled by separate sync if needed
    };
};

