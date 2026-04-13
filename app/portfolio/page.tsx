"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet, RefreshCw, TrendingUp, TrendingDown, Activity,
  Globe, Eye, EyeOff, ArrowUpRight, ArrowDownRight, Zap,
  PieChart, Shield, Copy, ExternalLink, ChevronDown, Search
} from 'lucide-react';
import { LegendaryLoader } from '@/components/ui/LegendaryLoader';
import { useLivePortfolio } from '@/hooks/useLivePortfolio';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { safeToFixed, safeToLocaleString } from '@/lib/utils/number-format';
import { ActionCluster } from '@/components/rainbow/ActionCluster';
import { LegendaryTransactionModal } from '@/components/rainbow/LegendaryTransactionModal';
import { DepositModal } from '@/components/rainbow/DepositModal';
import { toast } from 'sonner';
import "@/app/dashboard/dashboard.css";

// ── Chain color map ──────────────────────────────────────────────────────────
const CHAIN_COLORS: Record<string, string> = {
  "Ethereum": "#627EEA", "Base": "#0052FF", "Arbitrum One": "#12AAFF",
  "OP Mainnet": "#FF0420", "Polygon": "#8247E5", "BNB Smart Chain": "#F0B90B",
  "Avalanche": "#E84142", "Solana": "#9945FF",
};

// ── Helper ───────────────────────────────────────────────────────────────────
function formatUSD(val: number) {
  if (!val || isNaN(val)) return "$0.00";
  return `$${safeToLocaleString(val, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatAddr(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

// ── Asset Row ────────────────────────────────────────────────────────────────
function AssetRow({ asset, idx, hidden }: { asset: any; idx: number; hidden: boolean }) {
  const isPos = (asset.change24h ?? 0) >= 0;
  const chainColor = CHAIN_COLORS[asset.network] ?? "#888";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.04 }}
      className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-all group cursor-pointer"
    >
      {/* Icon / Initials */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border"
        style={{ background: `${chainColor}18`, borderColor: `${chainColor}30`, color: chainColor }}
      >
        {asset.symbol?.slice(0, 3) ?? "?"}
      </div>

      {/* Name + network */}
      <div className="flex-1 min-w-0">
        <div className="font-black text-white text-sm tracking-tight truncate">{asset.symbol}</div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: chainColor }} />
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: chainColor }}>
            {asset.network ?? "—"}
          </span>
        </div>
      </div>

      {/* Balance */}
      <div className="text-right hidden sm:block">
        <div className="text-[11px] font-mono text-white/50">
          {hidden ? "••••" : `${safeToFixed(asset.balance ?? 0, 4)} ${asset.symbol}`}
        </div>
      </div>

      {/* 24h change */}
      <div className={`text-right hidden md:block w-20 ${isPos ? "text-green-400" : "text-red-400"}`}>
        <div className="flex items-center justify-end gap-0.5 text-xs font-black">
          {isPos ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {safeToFixed(Math.abs(asset.change24h ?? 0), 2)}%
        </div>
      </div>

      {/* USD Value */}
      <div className="text-right w-28 shrink-0">
        <div className="font-black font-mono text-white text-sm">
          {hidden ? "••••••" : formatUSD(asset.value ?? 0)}
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function PortfolioPage() {
  const [mounted, setMounted] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [search, setSearch] = useState("");
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [transferMode, setTransferMode] = useState<"send" | "swap" | "bridge" | "buy">("send");

  const { totalPnl, assets, change24hUSD, change24hPercent, isLoading } = useLivePortfolio();
  const { address: userAddress, isConnected } = useAppKitAccount();
  const { open } = useAppKit();
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey(k => k + 1);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <LegendaryLoader title="Portfolio" subtitle="Loading on-chain data..." />;

  const isPositive = (change24hUSD ?? 0) >= 0;

  const filteredAssets = (assets ?? [])
    .filter((a: any) =>
      !search ||
      a.symbol?.toLowerCase().includes(search.toLowerCase()) ||
      a.network?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a: any, b: any) => (b.value ?? 0) - (a.value ?? 0));

  const handleAction = (action: string, mode?: string) => {
    if (action === "Send" || action === "Swap" || action === "Buy" || action === "Bridge" || action === "Sell") {
      setTransferMode(action === "Sell" ? "swap" : action === "Swap" ? "swap" : action === "Buy" ? "buy" : mode === "bridge" ? "bridge" : "send");
      setIsTransferOpen(true);
    } else if (action === "Receive") {
      setIsDepositOpen(true);
    }
  };

  // ── Not connected ──
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#0B0E11] flex items-center justify-center px-6">
        {/* Grid bg */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.04]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 60px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 60px)' }} />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full max-w-sm text-center space-y-8"
        >
          <div className="w-24 h-24 mx-auto rounded-3xl bg-white/[0.05] border border-white/10 flex items-center justify-center">
            <Wallet size={40} className="text-white/40" strokeWidth={1.5} />
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Portfolio</h1>
            <p className="text-white/40 text-sm leading-relaxed">
              Connect your wallet to view your on-chain holdings, track performance, and manage assets.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => open()}
              className="w-full py-4 bg-white text-black font-black rounded-2xl uppercase tracking-[0.15em] text-[11px] hover:bg-white/90 transition-all shadow-xl shadow-white/10"
            >
              Connect Wallet
            </button>
            <div className="scale-90 origin-center">
              <ConnectButton />
            </div>
          </div>

          <p className="text-white/20 text-[10px] uppercase tracking-widest">
            Non-custodial · On-chain · Real-time
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0E11] text-white">
      {/* Grid background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.04]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 60px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 60px)' }} />

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b border-white/[0.06]"
        style={{ background: "rgba(11,14,17,0.92)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            <PieChart size={16} className="text-white/60" />
          </div>
          <div>
            <div className="font-black text-white text-sm uppercase tracking-tight">Portfolio</div>
            <div className="text-[9px] font-mono text-white/30 uppercase tracking-widest">On-chain Intelligence</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Address badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="font-mono text-[10px] text-white/60">{userAddress ? formatAddr(userAddress) : "—"}</span>
            <button onClick={() => { navigator.clipboard.writeText(userAddress ?? ""); toast.success("Copied!"); }}
              className="text-white/20 hover:text-white/60 transition-colors">
              <Copy size={10} />
            </button>
          </div>

          {/* Refresh */}
          <button onClick={refresh}
            className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/10 transition-all text-white/40 hover:text-white">
            <RefreshCw size={14} className={isLoading ? "animate-spin text-[#00F2EA]" : ""} />
          </button>

          <div className="scale-90 origin-right">
            <ConnectButton accountStatus="avatar" chainStatus="none" showBalance={false} />
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-4 pb-32 pt-8 space-y-6">

        {/* ── HERO BALANCE CARD ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/[0.08] overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)" }}
        >
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-white/30" />
                <span className="text-[10px] font-mono font-black text-white/30 uppercase tracking-[0.3em]">
                  Total Portfolio Value
                </span>
              </div>
              <button onClick={() => setHidden(h => !h)}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/30 hover:text-white">
                {hidden ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            {/* Big value */}
            <div className="flex items-end gap-5 flex-wrap mb-8">
              <div className="text-6xl md:text-7xl font-black tracking-tighter font-mono text-white">
                {hidden ? (
                  <span className="text-white/30">••••••••</span>
                ) : (
                  formatUSD(totalPnl ?? 0)
                )}
              </div>

              {/* 24h change pill */}
              <div className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-black text-sm border ${
                isPositive
                  ? "bg-green-500/10 border-green-500/20 text-green-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}>
                {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {hidden ? "••••" : `${isPositive ? "+" : ""}${formatUSD(change24hUSD ?? 0)}`}
                <span className="opacity-70 text-xs">
                  ({hidden ? "••" : `${safeToFixed(change24hPercent ?? 0, 2)}%`})
                </span>
                <span className="text-[9px] font-mono opacity-50 ml-1">24H</span>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/[0.06]">
              {[
                { label: "Assets", value: hidden ? "••" : String(assets?.length ?? 0), icon: PieChart, color: "#00F2EA" },
                { label: "Networks", value: hidden ? "••" : String(new Set(assets?.map((a: any) => a.network)).size ?? 0), icon: Globe, color: "#627EEA" },
                { label: "Status", value: "Live", icon: Activity, color: "#00C076" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    <Icon size={11} style={{ color }} />
                    <span className="text-[9px] font-mono font-black text-white/30 uppercase tracking-widest">{label}</span>
                  </div>
                  <div className="font-black font-mono text-2xl text-white" style={label === "Status" ? { color } : {}}>
                    {label === "Status" ? (
                      <span className="flex items-center gap-2 text-base">
                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: color }} />
                        {value}
                      </span>
                    ) : value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── ACTION CLUSTER ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <ActionCluster onAction={handleAction} />
        </motion.div>

        {/* ── ASSET LIST ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-3xl border border-white/[0.08] overflow-hidden"
          style={{ background: "rgba(255,255,255,0.02)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 rounded-full" style={{ background: "#00F2EA" }} />
              <h2 className="font-black text-white uppercase tracking-tight">Holdings</h2>
              <span className="px-2 py-0.5 bg-white/[0.06] rounded-full text-[10px] font-mono text-white/40 font-bold">
                {filteredAssets.length} assets
              </span>
            </div>

            {/* Search */}
            <div className="relative hidden sm:block">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search asset..."
                className="pl-8 pr-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-colors w-44"
              />
            </div>
          </div>

          {/* Column headers */}
          <div className="flex items-center gap-4 px-5 py-3 border-b border-white/[0.04]">
            <div className="w-11 shrink-0" />
            <div className="flex-1 text-[9px] font-mono font-black text-white/20 uppercase tracking-widest">Asset</div>
            <div className="w-28 text-right text-[9px] font-mono font-black text-white/20 uppercase tracking-widest hidden sm:block">Balance</div>
            <div className="w-20 text-right text-[9px] font-mono font-black text-white/20 uppercase tracking-widest hidden md:block">24H</div>
            <div className="w-28 text-right text-[9px] font-mono font-black text-white/20 uppercase tracking-widest">Value</div>
          </div>

          {/* Rows */}
          <div className="p-4 space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
            {isLoading && (filteredAssets.length === 0) ? (
              <div className="py-16 text-center space-y-3">
                <RefreshCw size={24} className="text-white/20 mx-auto animate-spin" />
                <p className="text-white/30 text-sm font-bold uppercase tracking-widest">Loading on-chain data...</p>
              </div>
            ) : filteredAssets.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                  <Wallet size={28} className="text-white/20" strokeWidth={1.5} />
                </div>
                <div className="space-y-1">
                  <p className="text-white/50 font-black uppercase tracking-widest text-sm">No Assets Detected</p>
                  <p className="text-white/20 text-xs">Connect a wallet with on-chain holdings to view your portfolio.</p>
                </div>
                <button onClick={refresh}
                  className="px-6 py-2.5 bg-white/[0.06] border border-white/10 rounded-full text-white/50 font-mono text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">
                  Refresh
                </button>
              </div>
            ) : (
              filteredAssets.map((asset: any, i: number) => (
                <AssetRow key={`${asset.symbol}-${asset.network}-${i}`} asset={asset} idx={i} hidden={hidden} />
              ))
            )}
          </div>

          {/* Footer */}
          {filteredAssets.length > 0 && (
            <div className="px-6 py-4 border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-[10px] font-mono text-white/25 uppercase tracking-widest">
                Live on-chain data · Updates every 30s
              </span>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[10px] font-mono text-green-400/60 uppercase tracking-widest">Connected</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* ── ALLOCATION BREAKDOWN ── */}
        {filteredAssets.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="rounded-3xl border border-white/[0.08] overflow-hidden p-6"
            style={{ background: "rgba(255,255,255,0.02)" }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-5 rounded-full" style={{ background: "#627EEA" }} />
              <h2 className="font-black text-white uppercase tracking-tight">Allocation</h2>
            </div>

            <div className="space-y-3">
              {filteredAssets.slice(0, 8).map((asset: any, i: number) => {
                const pct = totalPnl > 0 ? ((asset.value ?? 0) / totalPnl) * 100 : 0;
                const chainColor = CHAIN_COLORS[asset.network] ?? "#888";
                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: chainColor }} />
                        <span className="font-bold text-white/70">{asset.symbol}</span>
                        <span className="font-mono text-white/30">{asset.network}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-white/40">{safeToFixed(pct, 1)}%</span>
                        <span className="font-mono font-black text-white">{hidden ? "••••" : formatUSD(asset.value ?? 0)}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(pct, 100)}%` }}
                        transition={{ duration: 0.8, delay: 0.3 + i * 0.05, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ background: chainColor }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

      </main>

      {/* ── MODALS ── */}
      <LegendaryTransactionModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        balances={assets ?? []}
        initialMode={transferMode}
        initialSubMode="standard"
      />
      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        address={userAddress ?? ""}
      />
    </div>
  );
}
