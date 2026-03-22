"use client";

import { useEffect, useState, useMemo, useCallback } from 'react';
import useSWR from 'swr';
import { useAccount, useBalance, useReadContracts } from 'wagmi';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useAppKit } from '@reown/appkit/react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { LegendaryLoader } from '@/components/ui/LegendaryLoader';
import { UniversalEliteWallpaper } from '@/components/shared/UniversalEliteWallpaper';
import PaperPortfolioView from '@/components/rainbow/PaperPortfolioView';
import { formatUnits } from 'viem';
import { safeToLocaleString } from '@/lib/utils/number-format';
import Image from 'next/image';

// ERC-20 minimal ABI for balanceOf
const erc20Abi = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function'
  }
] as const;

const fetcher = (url: string) => fetch(url).then(r => {
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
});

export default function PortfolioPage() {
  const { t } = useLanguage();
  const { address, isConnected, status } = useAccount();
  const { open } = useAppKit();
  const { isLoaded, isAuthenticated } = useAuth();
  const router = useRouter();
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (mounted) {
      console.log(`[Portfolio:Debug] Status: ${status}, isConnected: ${isConnected}, address: ${address}, isLoaded: ${isLoaded}, isAuthenticated: ${isAuthenticated}`);
    }
  }, [isConnected, address, isLoaded, isAuthenticated, status, mounted]);

  // ─── 1. Backend Metadata (Moralis: Prices + All Tokens) ──────────────────
  const { data: stats, mutate: refreshStats } = useSWR(
    isConnected && address ? `/api/user/portfolio?address=${address}` : null,
    fetcher,
    {
      refreshInterval: 60000,
      revalidateOnFocus: true,
      dedupingInterval: 5000,
      onErrorRetry: (err, _key, _config, revalidate, { retryCount }) => {
        if (retryCount >= 2) return;
        setTimeout(() => revalidate({ retryCount }), 5000);
      }
    }
  );

  // ─── 2. DIRECT RPC: Real balances without API key ─────────────────────────
  // This endpoint reads directly from the blockchain via public RPCs
  const { data: onchainData, mutate: refreshOnchain, error: onchainError } = useSWR(
    isConnected && address ? `/api/wallet/onchain-balances?address=${address}` : null,
    fetcher,
    {
      refreshInterval: 30000,    // Every 30s for onchain data
      revalidateOnFocus: true,
      dedupingInterval: 15000,
      onErrorRetry: (err, _key, _config, revalidate, { retryCount }) => {
        if (retryCount >= 2) return;
        setTimeout(() => revalidate({ retryCount }), 5000);
      }
    }
  );

  // ─── 3. LIVE ON-CHAIN: Native Balance (wagmi hook vía RPC del wallet) ────
  const { data: nativeBalance, refetch: refetchNative } = useBalance({ address });

  // ─── 4. LIVE ON-CHAIN: ERC20 via multicall (wagmi) ───────────────────────
  const erc20Tokens = useMemo(() => {
    return stats?.tokens?.filter((t: any) => t.address !== 'native') || [];
  }, [stats]);

  const { data: erc20Balances, refetch: refetchErc20 } = useReadContracts({
    contracts: erc20Tokens.map((t: any) => ({
      address: t.address as `0x${string}`,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [address as `0x${string}`],
      chainId: t.chainId
    })) as any,
    query: {
      enabled: erc20Tokens.length > 0 && !!address,
      refetchInterval: 15000,
    }
  });

  // ─── 5. FUSION ENGINE: Fusionar Moralis + RPC Directo + Wagmi Live ───────
  useEffect(() => {
    const buildPortfolio = () => {
      // Base tokens: Priority Moralis → Direct RPC
      let baseTokens: any[] = [];
      let baseTotalUsd = 0;

      const hasMoralisData = stats?.tokens && stats.tokens.length > 0;
      const hasOnchainData = onchainData?.tokens && onchainData.tokens.length > 0;

      // 🔥 [SAFEGUARD] If we are still waiting but it's taking too long, or error, proceed
      if (!stats && !onchainData && loading) {
        return;
      }

      if (hasMoralisData) {
        // Moralis responded with data
        baseTokens = stats.tokens;
        baseTotalUsd = stats.totalValue || 0;
      } else if (hasOnchainData) {
        // Moralis failed or hasn't responded yet → use direct RPC as immediate primary source
        console.log('[Portfolio] 🔄 Using direct RPC as primary source');
        baseTokens = onchainData.tokens;
        baseTotalUsd = onchainData.totalValueUsd || 0;
      }

      let liveTotalUsd = 0;
      let liveTotalChangeUsd = 0;

      // Enrich base tokens with live balances from RPC and wagmi
      const mergedTokens = baseTokens.map((token: any) => {
        let liveBalanceNumeric = token.balanceNumeric || 0;
        let pToUse = token.price || 0;

        // 1. Prioridad: ¿Tenemos este token en el escaneo RPC directo (onchainData)?
        if (hasOnchainData) {
          const rpcToken = onchainData.tokens.find(
            (t: any) => t.symbol === token.symbol && t.chainId === token.chainId &&
              (t.address?.toLowerCase() === token.address?.toLowerCase() || (t.address === 'native' && token.address === 'native'))
          );
          if (rpcToken) {
            liveBalanceNumeric = rpcToken.balanceNumeric;
            if (rpcToken.price > 0) pToUse = rpcToken.price;
          }
        }

        // 2. Ultra-Real-Time: Overrides from connected wallet (wagmi)
        if (token.address === 'native' && nativeBalance) {
          liveBalanceNumeric = Number(nativeBalance.formatted);
        } else if (token.address !== 'native' && erc20Balances) {
          const erc20Index = erc20Tokens.findIndex(
            (t: any) => t.address?.toLowerCase() === token.address?.toLowerCase() && t.chainId === token.chainId
          );
          if (erc20Index !== -1 && erc20Balances[erc20Index]?.status === 'success') {
            const rawBalance = erc20Balances[erc20Index].result as bigint;
            liveBalanceNumeric = Number(formatUnits(rawBalance, token.decimals || 18));
          }
        }

        // Price fallback if still 0
        if (!pToUse && token.valueUsd && token.balanceNumeric) {
          pToUse = token.valueUsd / token.balanceNumeric;
        }

        const liveValueUsd = liveBalanceNumeric * pToUse;
        liveTotalUsd += liveValueUsd;
        liveTotalChangeUsd += liveValueUsd * ((token.change24h || 0) / 100);

        return {
          ...token,
          balanceNumeric: liveBalanceNumeric,
          balanceFormatted: safeToLocaleString(liveBalanceNumeric, { maximumFractionDigits: 4 }),
          valueUsd: liveValueUsd,
          price: pToUse
        };
      });

      // 🔥 LEGENDARY: Add RPC direct tokens NOT in Moralis (e.g. WLD on Worldchain)
      if (hasOnchainData) {
        for (const rpToken of onchainData.tokens) {
          const alreadyExists = mergedTokens.some(
            (t: any) => t.symbol === rpToken.symbol && t.chainId === rpToken.chainId &&
              (t.address?.toLowerCase() === rpToken.address?.toLowerCase() || (t.address === 'native' && rpToken.address === 'native'))
          );
          if (!alreadyExists && rpToken.balanceNumeric > 0.000001) {
            console.log(`[Portfolio] ➕ Merging ${rpToken.symbol} (${rpToken.chainId}) from RPC channel`);
            mergedTokens.push(rpToken);
            liveTotalUsd += rpToken.valueUsd || 0;
            liveTotalChangeUsd += (rpToken.valueUsd || 0) * ((rpToken.change24h || 0) / 100);
          }
        }
      }

      // If consolidated totals are $0 but RPC has value, force RPC value
      if (liveTotalUsd === 0 && hasOnchainData && onchainData.totalValueUsd > 0) {
        liveTotalUsd = onchainData.totalValueUsd;
        liveTotalChangeUsd = onchainData.change24hUsd || 0;
      }

      const globalChangePct = liveTotalUsd > 0 ? (liveTotalChangeUsd / liveTotalUsd) * 100 : 0;

      setPortfolioData({
        totalValue: liveTotalUsd,
        balances: mergedTokens
          .filter((t: any) => t.balanceNumeric > 0.000001 || t.source === 'rpc-direct')
          .sort((a: any, b: any) => b.valueUsd - a.valueUsd),
        prices: {},
        pnl24h: liveTotalChangeUsd,
        change24h: globalChangePct,
        degraded: stats?.error === 'GLOBAL_TIMEOUT' || onchainError
      });
      
      // Stop loading if we have some data or if we clearly failed
      if (stats || onchainData || onchainError) {
          setLoading(false);
      }
    };

    buildPortfolio();
  }, [stats, nativeBalance, erc20Balances, erc20Tokens, onchainData, onchainError]);

  // ─── 6. [SARE-GUARD] Fail-Safe Timeout ───────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.warn('[Portfolio] 🛡️ Safeguard timeout reached. Forcing loading state to clear.');
        setLoading(false);
      }
    }, 2000); // 2s MAX loading screen time

    return () => clearTimeout(timer);
  }, [loading]);

  // If onchain data arrived but Moralis hasn't, stop loading
  useEffect(() => {
    if (onchainData && loading) {
      setLoading(false);
    }
  }, [onchainData, loading]);

  // If no connection, stop loading to avoid waiting in vain
  useEffect(() => {
    if (isLoaded && (!isConnected || !address) && loading) {
      setLoading(false);
    }
  }, [isLoaded, isConnected, address, loading]);

  // ─── Force Sync ──────────────────────────────────────────────────────────
  const handleForceSync = useCallback(async () => {
    setLoading(true);
    await Promise.all([refreshStats(), refreshOnchain(), refetchNative(), refetchErc20()]);
    setLoading(false);
  }, [refreshStats, refreshOnchain, refetchNative, refetchErc20]);

  // ─── ESTADOS DE CARGA ─────────────────────────────────────────────────────
  if (!mounted || !isLoaded) {
    return (
      <LegendaryLoader 
        title={t.portfolio.syncing} 
        subtitle={t.portfolio.encryption} 
      />
    );
  }

  if (!isConnected || !address) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
        {/* Universal White Background */}
        <div className="fixed inset-0 z-0 bg-white" />
        <div className="relative z-10 text-center p-12 max-w-2xl">
          <div className="w-[32rem] h-[32rem] flex items-center justify-center mx-auto mb-4 overflow-hidden">
              <img 
                src="/models/update/nft_collectables.jpg" 
                alt="Welcome" 
                className="w-full h-full object-contain mix-blend-multiply transition-all duration-700" 
              />
          </div>
           <p className="text-slate-400 mb-12 text-[10px] font-black tracking-[0.4em] uppercase leading-loose max-w-md mx-auto">
            {t.portfolio.notConnectedDesc || 'Initialize secure connection to resolve asset profile'}
          </p>
          <div className="flex flex-col gap-4">
            <button 
                onClick={() => open()}
                className="inline-block px-10 py-4 bg-cyan-500 text-black rounded-2xl hover:bg-cyan-400 transition-all font-black text-xs uppercase tracking-widest active:scale-95 shadow-[0_0_30px_rgba(6,182,212,0.3)]"
            >
                {t.nav.connect || 'Connect Wallet'}
            </button>
            <a href="/" className="inline-block px-10 py-4 bg-slate-50 text-slate-400 border border-slate-100 rounded-2xl hover:bg-slate-100 transition-all font-black text-xs uppercase tracking-widest active:scale-95">
                {t.nav.start || 'Return to Terminal'}
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PaperPortfolioView
      totalValue={portfolioData?.totalValue || 0}
      balances={portfolioData?.balances || []}
      prices={portfolioData?.prices || {}}
      change24hValue={portfolioData?.pnl24h || 0}
      change24hPercent={portfolioData?.change24h || 0}
      onForceSync={handleForceSync}
      address={address}
    />
  );
}

