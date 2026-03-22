"use client";

import { motion } from "framer-motion";
import { AmbientBackground } from "./AmbientBackground";
import { GlassCard } from "./GlassCard";
import { TokenRow } from "./TokenRow";
import { ActionCluster } from "./ActionCluster";
import { History, Wallet, RefreshCw, Loader2 } from "lucide-react";
import { useAppKitAccount } from "@reown/appkit/react";

interface PortfolioViewProps {
  totalValue: number;
  balances: any[];
  prices: Record<string, number>;
  change24hValue: number;
  change24hPercent: number;
}

import { useState, useEffect } from "react";
import { LegendaryTransactionModal } from "./LegendaryTransactionModal";
import { LegendaryActivityFeed } from "./LegendaryActivityFeed";
import { DepositModal } from "./DepositModal";
import { PortfolioService } from "@/lib/blockchain/PortfolioService";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { useSmartWebSockets } from "@/hooks/useSmartWebSockets";
import { OptimisticExecutionIndicator } from "./OptimisticExecutionIndicator";

import { safeToFixed, safeToLocaleString } from '@/lib/utils/number-format';
const SkeletonRow = () => (
  <GlassCard className="p-4 mb-3 flex items-center justify-between opacity-50 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-white/10 rounded-full" />
      <div>
        <div className="h-4 w-24 bg-white/10 rounded mb-2" />
        <div className="h-3 w-16 bg-white/10 rounded" />
      </div>
    </div>
    <div className="text-right">
      <div className="h-5 w-20 bg-white/10 rounded mb-2" />
      <div className="h-3 w-12 bg-white/10 rounded ml-auto" />
    </div>
  </GlassCard>
);

const SkeletonActivity = () => (
    <div className="space-y-4 p-4">
        {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between opacity-50 animate-pulse">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-xl" />
                    <div>
                        <div className="h-4 w-32 bg-white/10 rounded mb-2" />
                        <div className="h-3 w-20 bg-white/10 rounded" />
                    </div>
                </div>
                <div className="h-4 w-16 bg-white/10 rounded" />
            </div>
        ))}
    </div>
);

export default function PortfolioView({ totalValue, balances, prices, change24hValue, change24hPercent }: PortfolioViewProps) {
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferMode, setTransferMode] = useState<"send" | "swap" | "bridge" | "buy">("send");
  const [transferSubMode, setTransferSubMode] = useState<string>("standard");
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);
  const { address: userAddress, isConnected } = useAppKitAccount();
  const { mutate } = useSWRConfig();
  
  // Enable WebSocket monitoring for real-time updates
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Synchronize dynamic updates with the existing WebSocket logic
  // and fetch historical data on mount/address change
  useEffect(() => {
    if (!userAddress) return;

    const fetchHistory = async () => {
      setHistoryLoading(true);
      try {
        // 1. Fetch persisted history (unified source of truth)
        const historyRes = await fetch(`/api/wallet/history/deep?address=${userAddress}`);
        const historyData = await historyRes.json();
        
        if (historyData.history) {
             const formattedHistory = historyData.history.map((tx: any) => ({
                 hash: tx.hash,
                 from: tx.from,
                 to: tx.to,
                 value: parseFloat(tx.value),
                 asset: tx.tokenSymbol || 'ETH',
                 type: tx.type === 'SEND' ? 'SEND' : (tx.type === 'RECEIVE' ? 'RECEIVE' : tx.type), // Map enum
                 status: tx.status,
                 chainId: tx.chainId,
                 timestamp: new Date(tx.timestamp),
                 source: tx.source
             }));
             setHistory(formattedHistory);
        }
      } catch (e) {
        console.error("Failed to fetch history", e);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchHistory();
    // Poll less frequently since we have real-time sockets for new stuff
    const interval = setInterval(fetchHistory, 30000); 
    return () => clearInterval(interval);
  }, [userAddress]);

  const { lastTx, connected: wsConnected } = useSmartWebSockets(userAddress || undefined);

  const handleAction = (action: string, mode?: string) => {
      console.log(`[LEGENDARY] Action: ${action} Mode: ${mode}`);
      
      if (action === "Send" || action === "Buy" || action === "Sell") {
        const m = action === "Sell" ? "swap" : 
                  action === "Buy" ? "buy" : 
                  (mode === "bridge" ? "bridge" : "send");
        
        setTransferMode(m as any);
        setTransferSubMode(mode || "standard");
        setIsTransferOpen(true);
      } else if (action === "Receive") {
        setIsDepositOpen(true);
      }
    };
  
    // ELITE FORMATTING HELPERS
    const formatValue = (val: any) => {
      const num = typeof val === 'string' ? parseFloat(val) : Number(val);
      if (isNaN(num)) return "$0,00 (€0,00)";
      const eur = num * 0.92;
      const usdStr = num.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const eurStr = eur.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      return `$${usdStr} (€${eurStr})`;
    };

    const formatAmount = (val: any) => {
        const num = typeof val === 'string' ? parseFloat(val) : Number(val);
        if (isNaN(num)) return "0";
        return num.toLocaleString('de-DE', { maximumFractionDigits: 6 });
    };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      if (!userAddress) return;
      await fetch('/api/wallet/sync', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: userAddress })
      });
      await mutate('portfolio-assets', undefined, { revalidate: true });
      toast.success("Wallet Synchronized", { description: "Balances updated with real-time blockchain data." });
    } catch (e) {
      toast.error("Sync Failed");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleManualRefresh = async () => {
    const now = Date.now();
    const DEBOUNCE_TIME = 5000; // 5 seconds

    // Debounce to prevent spam
    if (now - lastRefreshTime < DEBOUNCE_TIME) {
      toast.error('Too Fast!', { description: `Please wait ${Math.ceil((DEBOUNCE_TIME - (now - lastRefreshTime)) / 1000)}s` });
      return;
    }

    setIsRefreshing(true);
    setLastRefreshTime(now);

    try {
      // Force SWR to bypass cache and re-fetch
      await mutate('portfolio-assets', undefined, { revalidate: true });
      toast.success('Portfolio Refreshed! ✨', { 
        description: 'Latest balances loaded from blockchain',
        duration: 3000 
      });
    } catch (error) {
      console.error('[Refresh] Failed:', error);
      toast.error('Refresh Failed', { description: 'Please try again' });
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  // Keyboard shortcut: Cmd/Ctrl + R
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'r') {
        e.preventDefault();
        handleManualRefresh();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lastRefreshTime]);
// Future: Add specialized modals for bridge, private, cross-chain-swap
  

  return (
    <div className="relative min-h-screen text-white overflow-hidden font-sans selection:bg-purple-500/30 bg-[#0B0E11]">
      {/* 🚀 [LEGENDARY] Animated Background Aura */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/5 blur-[100px] rounded-full pointer-events-none" />

      {/* 🔄 [LEGENDARY] Floating Refresh Button */}
      <motion.button
        onClick={handleManualRefresh}
        disabled={isRefreshing}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed top-24 right-6 z-50 bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl hover:shadow-purple-500/20 transition-all group disabled:opacity-50"
        title="Manual Refresh (Cmd/Ctrl + R)"
      >
        <motion.div
          animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
          transition={isRefreshing ? { repeat: Infinity, duration: 1, ease: "linear" } : {}}
        >
          <RefreshCw size={20} className={`${isRefreshing ? 'text-purple-400' : 'text-white/60 group-hover:text-white'} transition-colors`} />
        </motion.div>
        
        {/* Connection Status Indicator */}
        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-gray-500'} ring-2 ring-black`} />
      </motion.button>
      
      {/* Modals */}
        <LegendaryTransactionModal 
            isOpen={isTransferOpen} 
            onClose={() => setIsTransferOpen(false)} 
            balances={balances}
            initialMode={transferMode}
            initialSubMode={transferSubMode}
        />
        
        <DepositModal 
            isOpen={isDepositOpen} 
            onClose={() => setIsDepositOpen(false)} 
            address={userAddress || ""}
        />

      <main className="relative z-10 max-w-7xl mx-auto min-h-screen flex flex-col pt-20 px-6 pb-24">
        
        {/* Total Balance (Elite Hero) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", duration: 1, bounce: 0.5 }}
          className="text-center mb-12 relative"
        >
          <div className="text-white/40 font-black mb-1 tracking-[0.3em] uppercase text-[10px]">Net Worth</div>
          <motion.h1 
            initial={{ filter: "blur(10px)" }}
            animate={{ filter: "blur(0px)" }}
            className="text-5xl md:text-7xl font-black tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40 break-words"
          >
            ${safeToLocaleString(totalValue, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 font-black text-xs tracking-widest shadow-xl ${change24hValue >= 0 ? 'text-green-400' : 'text-red-400'}`}
          >
            <div className={`w-2 h-2 rounded-full animate-pulse ${change24hValue >= 0 ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>{change24hValue >= 0 ? '+' : '-'}${Math.abs(change24hValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="opacity-40 whitespace-nowrap">24H CHANGE ({safeToFixed(change24hPercent, 2)}%)</span>
          </motion.div>
        </motion.div>


        {/* Actions (Legendary Cluster) */}
        <ActionCluster onAction={handleAction} />

        {/* 📊 [NEW] Net Worth Breakdown Visual */}
        <div className="flex justify-between items-center px-4 mb-4">
            <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent mx-4" />
            <div className="text-[10px] font-black text-white/30 tracking-[0.4em] uppercase">Blockchain Ledger</div>
            <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent mx-4" />
        </div>

        {/* Assets List (Metamask-Style Awareness) */}
        <div className="flex-1 mt-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Asset List */}
          <div>
            <div className="flex items-center justify-between mb-8 px-4">
              <h2 className="font-black text-2xl tracking-tighter uppercase italic text-white/90">Elite Assets</h2>
            </div>
            
            <div className="space-y-1 max-h-[500px] lg:max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
              {isRefreshing && balances.length === 0 ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : balances.length === 0 ? (
                <div className="py-20 text-center bg-white/5 border border-dashed border-white/5 rounded-[2.5rem]">
                  <Wallet size={48} className="mx-auto mb-4 opacity-10" />
                  <p className="text-white/20 font-black uppercase tracking-widest text-[10px]">No Liquidity Detected</p>
                </div>
              ) : (
                balances.map((bal: any, i: number) => (
                  <motion.div
                    key={`${bal.symbol}-${bal.chainId}-${i}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <TokenRow 
                      symbol={bal.symbol}
                      name={bal.name}
                      balance={formatAmount(bal.balanceFormatted || bal.balance)}
                      value={formatValue(bal.value)}
                      change24h={bal.change24h}
                      chainId={bal.chainId}
                      icon={bal.logo}
                    />
                  </motion.div>
                ))
              )}
            </div>

          </div>

          {/* Activity Feed */}
          <div>
            <div className="flex items-center justify-between mb-8 px-4">
              <h2 className="font-black text-2xl tracking-tighter uppercase italic text-white/90">Recent Activity</h2>
              <button onClick={handleSync} disabled={isSyncing} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                <History size={20} className={isSyncing ? "animate-spin text-purple-400" : "text-white/40"} />
              </button>
            </div>
                {historyLoading && history.length === 0 ? (
                    <SkeletonActivity />
                ) : (
                    <LegendaryActivityFeed history={history} />
                )}

          </div>
        </div>
      </main>

      {/* [ORCHESTRATOR] Real-time Execution Status */}
      <OptimisticExecutionIndicator userId={userAddress || ""} />
    </div>
  );
}

