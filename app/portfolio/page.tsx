"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet, RefreshCw, ArrowUpRight, ArrowDownRight,
  Eye, EyeOff, Globe, Copy, Search,
  ArrowDownLeft, Repeat, CreditCard, Plus,
  Check, Loader2, ShieldCheck, Activity, ShieldAlert,
  BarChart2, MessageSquare, Menu, X, LogOut, ArrowLeft
} from 'lucide-react';
import { useLivePortfolio } from '@/hooks/useLivePortfolio';
import { useAccount, useSwitchChain, useConnect, useDisconnect } from 'wagmi';
import { useWalletStore } from '@/lib/store/wallet-store';
import { mainnet, base, optimism, arbitrum, polygon } from 'wagmi/chains';
import { useAppKit } from '@reown/appkit/react';
import { safeToFixed, safeToLocaleString } from '@/lib/utils/number-format';
import { LegendaryTransactionModal } from '@/components/rainbow/LegendaryTransactionModal';
import { DepositModal } from '@/components/rainbow/DepositModal';
import { toast } from 'sonner';
import { ChainActivityPanel } from '@/components/portfolio/ChainActivityPanel';
import { SovereignFooter } from '@/components/landing/SovereignFooter';
import { RemoteLottie } from '@/components/ui/RemoteLottie';
import { QuantumAuthGate } from '@/components/auth/QuantumAuthGate';

// ── Palette — dark-mode first (wallpaper is black) ─────────────────────────
const BG   = "transparent";
const INK  = "#F5F5F5";         // white text on dark bg
const MUTED = "rgba(255,255,255,0.45)";
const BORDER = "rgba(255,255,255,0.08)";
const CARD  = "rgba(0, 0, 0, 0.65)";

// ── Chain color map ──────────────────────────────────────────────────────────
const CHAIN_COLORS: Record<string, string> = {
  "Ethereum": "#627EEA", "Base": "#0052FF", "Arbitrum One": "#12AAFF", "Arbitrum": "#12AAFF",
  "OP Mainnet": "#FF0420", "Optimism": "#FF0420", "Polygon": "#8247E5", "BNB Smart Chain": "#F0B90B",
  "Avalanche": "#E84142", "Solana": "#9945FF", "World Chain": "#000000",
};

// ── Supported networks for Switch Network ────────────────────────────────────
const SUPPORTED_CHAINS = [
  { caipId: "eip155:1",     name: "Ethereum",    color: "#627EEA", symbol: "ETH",  id: 1 },
  { caipId: "eip155:8453",  name: "Base",        color: "#0052FF", symbol: "ETH",  id: 8453 },
  { caipId: "eip155:10",    name: "Optimism",    color: "#FF0420", symbol: "ETH",  id: 10 },
  { caipId: "eip155:42161", name: "Arbitrum",    color: "#12AAFF", symbol: "ETH",  id: 42161 },
  { caipId: "eip155:137",   name: "Polygon",     color: "#8247E5", symbol: "POL",  id: 137 },
  { caipId: "eip155:480",   name: "World Chain", color: "#000000", symbol: "WLD",  id: 480 },
];

/** Fetch EUR/USD rate (cached in module scope so it refreshes every 5 min) */
let _eurRate: number = 0.93; // sensible default
let _eurFetched = 0;
async function fetchEURRate() {
  if (Date.now() - _eurFetched < 5 * 60_000) return _eurRate;
  try {
    const r = await fetch('https://open.er-api.com/v6/latest/USD', { cache: 'no-store' });
    const d = await r.json();
    if (d?.rates?.EUR) { _eurRate = d.rates.EUR; _eurFetched = Date.now(); }
  } catch { /* keep cached */ }
  return _eurRate;
}

function formatEUR(val: number, rate: number) {
  if (!val || isNaN(val)) return "€0,00";
  const eur = val * rate;
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(eur);
}

function useEURRate() {
  const [rate, setRate] = useState(_eurRate || 0.93);
  useEffect(() => {
    fetchEURRate().then(setRate);
    const t = setInterval(() => fetchEURRate().then(setRate), 5 * 60_000);
    return () => clearInterval(t);
  }, []);
  return rate;
}

function formatAddr(addr: string | null | undefined) {
  if (!addr || typeof addr !== 'string') return "—";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

// ── Asset Row ────────────────────────────────────────────────────────────────
function AssetRow({ asset, idx, hidden, eurRate }: { asset: any; idx: number; hidden: boolean; eurRate: number }) {
  const isPos = (asset.change24h ?? 0) >= 0;
  const chainColor = CHAIN_COLORS[asset.network] ?? "#888";
  const valueEUR = formatEUR(asset.valueUSD ?? 0, eurRate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.035 }}
      className="flex items-center gap-4 px-5 py-4 rounded-2xl border hover:bg-black/[0.02] transition-all cursor-pointer"
      style={{ borderColor: BORDER, background: CARD }}
    >
      {/* Token badge */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-[11px] shrink-0 border"
        style={{ background: `${chainColor}14`, borderColor: `${chainColor}25`, color: chainColor }}
      >
        {typeof asset.symbol === 'string' ? asset.symbol.slice(0, 3) : "?"}
      </div>

      {/* Name + network */}
      <div className="flex-1 min-w-0">
        <div className="font-black text-sm tracking-tight truncate" style={{ color: INK }}>{asset.symbol}</div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: chainColor }} />
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: chainColor }}>
            {asset.network ?? "—"}
          </span>
        </div>
      </div>

      {/* Token balance */}
      <div className="text-right hidden sm:block">
        <div className="text-[11px] font-mono" style={{ color: MUTED }}>
          {hidden ? "••••" : `${safeToFixed(asset.balance ?? 0, 4)} ${asset.symbol}`}
        </div>
      </div>

      {/* 24h change */}
      <div className={`text-right hidden md:block w-20 text-xs font-black ${isPos ? "text-emerald-600" : "text-rose-500"}`}>
        <div className="flex items-center justify-end gap-0.5">
          {isPos ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {safeToFixed(Math.abs(asset.change24h ?? 0), 2)}%
        </div>
      </div>

      {/* EUR value */}
      <div className="text-right w-28 shrink-0">
        <div className="font-black font-mono text-sm" style={{ color: INK }}>
          {hidden ? "••••••" : valueEUR}
        </div>
      </div>
    </motion.div>
  );
}

// ── Wallet action button ─────────────────────────────────────────────────────
function WalletAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: any;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 group"
    >
      <div
        className="w-14 h-14 rounded-2xl border flex items-center justify-center transition-all group-hover:bg-black/5 group-active:scale-95"
        style={{ borderColor: BORDER, background: CARD }}
      >
        <Icon size={20} style={{ color: INK }} strokeWidth={1.75} />
      </div>
      <span className="text-[10px] font-black uppercase tracking-[0.15em]" style={{ color: MUTED }}>
        {label}
      </span>
    </button>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function PortfolioPage() {
  const router = useRouter();
  const eurRate = useEURRate();
  const fmt = useCallback((v: number) => formatEUR(v, eurRate), [eurRate]);
  const [hidden, setHidden] = useState(false);
  const [search, setSearch] = useState("");
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [transferMode, setTransferMode] = useState<"send" | "swap" | "bridge" | "buy">("send");
  const [showNetworkSwitch, setShowNetworkSwitch] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);
  const [sessionUnlocked, setSessionUnlocked] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      if (typeof window !== 'undefined' && sessionStorage.getItem('portfolio_unlocked') === 'true') {
        setSessionUnlocked(true);
      }
    } catch(e) {}
  }, []);

  const { totalPnl, assets, change24hUSD, change24hPercent, isLoading, isConnected: isLiveConnected, address: userAddress } = useLivePortfolio();
  const { chain, isConnected: wagmiConnected } = useAccount();
  const { privateKey, address: storeAddress } = useWalletStore();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const { open: openAppKit } = useAppKit();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey(k => k + 1);

  const isPositive = (change24hUSD ?? 0) >= 0;

  const filteredAssets = (assets ?? [])
    .filter((a: any) =>
      !search ||
      a.symbol?.toLowerCase()?.includes(search.toLowerCase()) ||
      a.network?.toLowerCase()?.includes(search.toLowerCase())
    )
    .sort((a: any, b: any) => (b.valueUSD ?? 0) - (a.valueUSD ?? 0));

  const openMode = (m: "send" | "swap" | "bridge" | "buy") => {
    setTransferMode(m);
    setIsTransferOpen(true);
  };

  const handleCreateOnChainAccount = async () => {
    setCreatingAccount(true);
    try {
      // Open AppKit modal — user picks Coinbase Smart Wallet from the list
      openAppKit();
      toast.success('Wallet modal opened', { description: 'Select Coinbase Smart Wallet to create your on-chain account.' });
      setAccountCreated(true);
    } catch (e: any) {
      toast.error('Account creation failed', { description: e.message });
    } finally {
      setCreatingAccount(false);
    }
  };

  let hasKeystore = false;
  try { hasKeystore = typeof window !== 'undefined' ? !!localStorage.getItem('sovereign_keystore') : false; } catch(e) {}
  const isQuantumUnlocked = !!privateKey;

  // ── GATE LOGIC ──────────────────────────────────────────────────────────────
  // Wait for client mount to avoid SSR hydration mismatch (wagmi state is client-only)
  if (!mounted) return null;

  // sessionUnlocked: user completed QuantumAuthGate this session (stored in sessionStorage)
  // isQuantumUnlocked: local vault was decrypted and private key is in memory
  // wagmiConnected: MetaMask / WalletConnect is live
  const needsGate = !isQuantumUnlocked && !wagmiConnected && !sessionUnlocked;

  if (needsGate) {
    return (
      <div className="w-full flex-1 flex flex-col bg-[#FAFAF8] text-[#0A0A0A] h-full min-h-0 overflow-hidden relative">
        <Link href="/" className="absolute top-6 left-6 z-50 w-10 h-10 rounded-full bg-white/50 backdrop-blur-md border border-black/10 flex items-center justify-center text-black/40 hover:text-black hover:bg-white transition-all shadow-sm" title="Return to Landing Page">
          <ArrowLeft size={20} />
        </Link>
        <QuantumAuthGate onComplete={() => {
          sessionStorage.setItem('portfolio_unlocked', 'true');
          setSessionUnlocked(true);
          refresh();
        }} />
      </div>
    );
  }

  const handleDisconnect = () => {
    disconnect();
    sessionStorage.removeItem('portfolio_unlocked');
    sessionStorage.removeItem('sovereign_wallet_addr');
    setSessionUnlocked(false);
    refresh();
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-black/40 text-[#F5F5F5]">

      {/* ── HEADER ── */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b w-full"
        style={{
          background: "rgba(0, 0, 0, 0.60)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderColor: BORDER
        }}
      >
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 rounded-xl border transition-all hover:bg-black/5" style={{ borderColor: BORDER, background: CARD, color: MUTED }} title="Return to Landing Page">
            <ArrowLeft size={16} />
          </Link>
          {/* 🔒 Lock Lottie — visible above Portfolio title */}
          <div className="w-10 h-10 shrink-0 pointer-events-none">
            <RemoteLottie path="/system-shots/Lock Loading.json" className="w-full h-full" />
          </div>
          <div>
            <div className="font-black text-sm uppercase tracking-tight" style={{ color: INK }}>Portfolio</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* 🐳 WHALE 300% — floats above address, perfectly centered & pegada */}
          <div className="hidden sm:flex flex-col items-center gap-0 relative">
            <div className="w-24 h-24 pointer-events-none -mb-3">
              <RemoteLottie path="/system-shots/Whale Mission.json" className="w-full h-full object-contain" />
            </div>
            {/* Address directly below whale — zero gap */}
            <div className="flex items-center gap-2 px-3 py-1 border rounded-full" style={{ borderColor: BORDER, background: CARD }}>
              <span className="font-mono text-[10px]" style={{ color: MUTED }}>{userAddress ? formatAddr(userAddress) : '—'}</span>
              <button
                onClick={() => { navigator.clipboard.writeText(userAddress ?? ''); toast.success('Copied!'); }}
                style={{ color: MUTED }}
                className="hover:opacity-100 transition-opacity opacity-50"
              >
                <Copy size={10} />
              </button>
            </div>
          </div>

          {/* Refresh */}
          <button
            onClick={refresh}
            className="p-2 rounded-xl border transition-all hover:bg-black/5"
            style={{ borderColor: BORDER, background: CARD, color: MUTED }}
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={() => openAppKit()}
            className="px-4 py-2 rounded-xl border font-mono text-[10px] font-black uppercase tracking-widest transition-all hover:bg-black/5"
            style={{ borderColor: BORDER, background: CARD, color: MUTED }}
          >
            {userAddress ? formatAddr(userAddress) : 'Connect'}
          </button>
        </div>
      </header>

      <div className="w-full px-6 md:px-12 pb-24 pt-8 space-y-6 text-left items-start">

        {/* ── EMPTY STATE / WELCOME HERO (NESTR STYLE) ── */}
        {!userAddress && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full bg-white/40 backdrop-blur-3xl rounded-[3rem] border border-black/5 shadow-sm p-8 md:p-12 mb-10 flex flex-col lg:flex-row items-center gap-12 overflow-hidden relative">
                <div className="w-full lg:w-1/2 relative z-10 space-y-6 md:space-y-8">
                    <div className="inline-flex items-center gap-3 px-5 py-2 bg-white border border-black/5 rounded-full shadow-sm">
                        <Activity size={14} className="text-[#0044CC]" />
                    </div>
                    <h2 className="text-[40px] md:text-[56px] font-black uppercase text-[#0A0A0A] leading-[0.95] tracking-tighter">
                        Track liquidity. <br /><span className="text-[#0044CC]">Zero noise.</span>
                    </h2>
                    <p className="font-serif text-[16px] md:text-[18px] text-slate-500 leading-relaxed">
                        Connect your wallet to instantiate the Dashboard. Our heuristic engine will map your holdings across 14 networks instantly, computing your exposure profile and aggregating stablecoin dominance.
                    </p>
                    <button onClick={() => openAppKit()} className="px-8 py-4 bg-[#0A0A0A] text-white rounded-xl font-mono text-[12px] font-black uppercase tracking-[0.2em] hover:bg-black/80 transition-colors shadow-lg flex items-center justify-center gap-3 w-full sm:w-auto">
                        Connect Dashboard <ArrowUpRight size={16} />
                    </button>
                </div>
                <div className="w-full lg:w-1/2 relative aspect-square md:aspect-video flex items-center justify-center bg-white/40 dark:bg-[#050505]/40 backdrop-blur-3xl rounded-3xl border border-black/5 dark:border-white/5 shadow-sm p-6 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FAFAF8] dark:from-[#050505] via-transparent to-transparent z-10 hidden lg:block" />
                    <div className="flex flex-col items-center justify-center gap-4 text-[#0a0a0a] dark:text-white opacity-20 relative z-0">
                        <BarChart2 size={64} strokeWidth={1} />
                        <span className="font-mono text-sm tracking-widest uppercase font-bold">Liquidity Matrix</span>
                    </div>
                </div>
            </motion.div>
        )}

        {/* ── BALANCE CARD ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border overflow-hidden backdrop-blur-3xl"
          style={{ borderColor: BORDER, background: CARD }}
        >
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <span className="text-[10px] font-mono font-black uppercase tracking-[0.3em]" style={{ color: MUTED }}>
                Total Portfolio Value · EUR
              </span>
              <button
                onClick={() => setHidden(h => !h)}
                className="p-1.5 rounded-lg transition-colors hover:bg-black/5"
                style={{ color: MUTED }}
              >
                {hidden ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            {/* Big number */}
            <div className="flex items-end gap-5 flex-wrap mb-8">
              <div className="text-6xl md:text-7xl font-black tracking-tighter font-mono" style={{ color: INK }}>
                {hidden ? <span style={{ color: MUTED }}>••••••••</span> : fmt(Number(totalPnl) ?? 0)}
              </div>

              {/* 24h pill */}
              <div
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-black text-sm border ${
                  isPositive ? "text-emerald-400 bg-emerald-950/60 border-emerald-700/40" : "text-rose-400 bg-rose-950/60 border-rose-700/40"
                }`}
              >
                {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {hidden ? "••••" : `${isPositive ? "+" : ""}${fmt(Number(change24hUSD) ?? 0)}`}
                <span className="opacity-60 text-xs">
                  ({hidden ? "••" : `${safeToFixed(Number(change24hPercent) ?? 0, 2)}%`})
                </span>
                <span className="text-[9px] font-mono opacity-40 ml-1">24H</span>
              </div>
            </div>

            {/* Stats — no "Status Live" */}
            <div className="grid grid-cols-2 gap-6 pt-6 border-t" style={{ borderColor: BORDER }}>
              {[
                { label: "Assets", value: hidden ? "••" : String(assets?.length ?? 0) },
                { label: "Networks", value: hidden ? "••" : String(new Set(assets?.map((a: any) => a.network)).size ?? 0) },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col gap-1">
                  <span className="text-[9px] font-mono font-black uppercase tracking-widest" style={{ color: MUTED }}>{label}</span>
                  <div className="font-black font-mono text-2xl" style={{ color: INK }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── WALLET ACTION STRIP ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="rounded-3xl border p-6"
          style={{ borderColor: BORDER, background: CARD }}
        >
          <div className="text-[9px] font-mono font-black uppercase tracking-[0.3em] mb-6" style={{ color: MUTED }}>
            Wallet
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-10 py-2">
            <WalletAction icon={ArrowUpRight}   label="Send"   onClick={() => openMode("send")}   />
            <WalletAction icon={ArrowDownLeft}  label="Receive" onClick={() => setIsDepositOpen(true)} />
            <WalletAction icon={Repeat}         label="Swap"   onClick={() => openMode("swap")}   />
            <WalletAction icon={Globe}          label="Bridge" onClick={() => openMode("bridge")} />
            <WalletAction icon={CreditCard}     label="Buy"    onClick={() => openMode("buy")}    />
            <WalletAction icon={Globe}          label="Network" onClick={() => setShowNetworkSwitch(s => !s)} />
            <WalletAction icon={Plus}           label="New Account" onClick={() => setShowCreateAccount(s => !s)} />
            <WalletAction icon={LogOut}         label="Disconnect" onClick={handleDisconnect} />
          </div>
        </motion.div>

        {/* ── SWITCH NETWORK PANEL ── */}
        <AnimatePresence>
          {showNetworkSwitch && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-3xl border overflow-hidden backdrop-blur-3xl"
              style={{ borderColor: BORDER, background: CARD }}
            >
              <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: BORDER }}>
                <div className="flex items-center gap-3">
                  <div className="w-1 h-5 rounded-full" style={{ background: INK }} />
                  <h2 className="font-black uppercase tracking-tight text-sm" style={{ color: INK }}>Switch Network</h2>
                  {chain && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-black border" style={{ borderColor: BORDER, color: MUTED }}>
                      Active: {chain.name}
                    </span>
                  )}
                </div>
                <button onClick={() => setShowNetworkSwitch(false)} style={{ color: MUTED }} className="text-[10px] font-mono font-black uppercase tracking-widest hover:opacity-100 opacity-50 transition-opacity">Close</button>
              </div>
              <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SUPPORTED_CHAINS.map(({ caipId, name, color, symbol, id }) => {
                  const isActive = chain?.id === id;
                  return (
                    <button
                      key={id}
                      onClick={async () => {
                        if (isActive) return;
                        toast.info(`Switching to ${name}...`);
                        try {
                          await switchChain({ chainId: id });
                          toast.success(`Connected to ${name}`);
                        } catch (e: any) {
                          toast.error("Failed to switch network");
                        }
                      }}
                      disabled={isActive || isSwitching}
                      className="flex items-center gap-3 p-4 rounded-2xl border transition-all hover:shadow-sm group disabled:cursor-default"
                      style={{
                        borderColor: isActive ? color : BORDER,
                        background: isActive ? `${color}10` : BG,
                      }}
                    >
                      <div className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ background: color }} />
                      <div className="text-left flex-1 min-w-0">
                        <div className="font-black text-xs truncate" style={{ color: INK }}>{name}</div>
                        <div className="text-[9px] font-mono uppercase tracking-wider" style={{ color: MUTED }}>{symbol}</div>
                      </div>
                      {isActive && <Check size={12} className="text-emerald-500 shrink-0" />}
                      {isSwitching && !isActive && <Loader2 size={12} className="animate-spin shrink-0" style={{ color: MUTED }} />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── CREATE ON-CHAIN ACCOUNT PANEL ── */}
        <AnimatePresence>
          {showCreateAccount && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-3xl border overflow-hidden backdrop-blur-3xl"
              style={{ borderColor: BORDER, background: CARD }}
            >
              <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: BORDER }}>
                <div className="flex items-center gap-3">
                  <div className="w-1 h-5 rounded-full" style={{ background: INK }} />
                  <h2 className="font-black uppercase tracking-tight text-sm" style={{ color: INK }}>Create On-Chain Account</h2>
                </div>
                <button onClick={() => { setShowCreateAccount(false); setAccountCreated(false); }} style={{ color: MUTED }} className="text-[10px] font-mono font-black uppercase tracking-widest hover:opacity-100 opacity-50 transition-opacity">Close</button>
              </div>
              <div className="p-8 flex flex-col gap-8 max-w-xl mx-auto items-center">
                {accountCreated ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4 py-8">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                      <ShieldCheck size={28} className="text-emerald-500" />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="font-black text-sm uppercase tracking-tight" style={{ color: INK }}>Account Initiated</p>
                      <p className="text-xs" style={{ color: MUTED }}>Complete the setup in your wallet to finalize your on-chain account.</p>
                    </div>
                    <button onClick={() => { setShowCreateAccount(false); setAccountCreated(false); }} className="px-6 py-2 border rounded-full font-mono text-[10px] uppercase tracking-widest transition-all hover:bg-black/5" style={{ borderColor: BORDER, color: MUTED }}>Dismiss</button>
                  </motion.div>
                ) : (
                  <>
                    <div className="text-center space-y-2">
                       <h3 className="text-2xl font-black uppercase tracking-tight" style={{ color: INK }}>Select Account Type</h3>
                       <p className="text-xs max-w-sm" style={{ color: MUTED }}>Deploy a smart account or connect a universal EOA. Both options give you full cryptographic ownership.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                      {/* Smart Wallet */}
                      <button
                        onClick={handleCreateOnChainAccount}
                        disabled={creatingAccount}
                        className="group relative flex flex-col items-center text-center p-6 rounded-3xl border transition-all hover:border-blue-500/50 hover:bg-blue-500/5 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ borderColor: BORDER, background: CARD }}
                      >
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg group-hover:scale-105 transition-transform">
                          {creatingAccount ? <Loader2 size={24} className="animate-spin" /> : <ShieldCheck size={24} />}
                        </div>
                        <div className="font-black text-sm uppercase tracking-widest mb-1" style={{ color: INK }}>Smart Wallet</div>
                        <p className="text-[10px] font-mono leading-relaxed" style={{ color: MUTED }}>Passkey-enabled, gasless deployment, multi-chain compatibility.</p>
                      </button>

                      {/* Universal Connect */}
                      <button
                         onClick={() => openAppKit()}
                         className="group relative flex flex-col items-center text-center p-6 rounded-3xl border transition-all hover:border-[#F5F5F5]/30 hover:bg-[#F5F5F5]/5 overflow-hidden"
                         style={{ borderColor: BORDER, background: CARD }}
                      >
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-[#F5F5F5] text-black shadow-lg group-hover:scale-105 transition-transform">
                          <Wallet size={24} />
                        </div>
                        <div className="font-black text-sm uppercase tracking-widest mb-1" style={{ color: INK }}>Universal Wallet</div>
                        <p className="text-[10px] font-mono leading-relaxed" style={{ color: MUTED }}>Connect via MetaMask, Phantom, or WalletConnect standard.</p>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── HOLDINGS ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-3xl border overflow-hidden backdrop-blur-3xl"
          style={{ borderColor: BORDER, background: "transparent" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: BORDER, background: CARD }}>
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 rounded-full" style={{ background: INK }} />
              <h2 className="font-black uppercase tracking-tight text-sm" style={{ color: INK }}>Holdings</h2>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border"
                style={{ borderColor: BORDER, color: MUTED }}
              >
                {filteredAssets.length}
              </span>
            </div>

            <div className="relative hidden sm:block">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search asset..."
                className="pl-8 pr-4 py-2 border rounded-xl text-xs focus:outline-none transition-colors w-40"
                style={{
                  borderColor: BORDER,
                  background: BG,
                  color: INK,
                }}
              />
            </div>
          </div>

          {/* Column labels */}
          <div className="flex items-center gap-4 px-5 py-3 border-b" style={{ borderColor: BORDER }}>
            <div className="w-11 shrink-0" />
            <div className="flex-1 text-[9px] font-mono font-black uppercase tracking-widest" style={{ color: MUTED }}>Asset</div>
            <div className="w-28 text-right text-[9px] font-mono font-black uppercase tracking-widest hidden sm:block" style={{ color: MUTED }}>Balance</div>
            <div className="w-20 text-right text-[9px] font-mono font-black uppercase tracking-widest hidden md:block" style={{ color: MUTED }}>24H</div>
            <div className="w-28 text-right text-[9px] font-mono font-black uppercase tracking-widest" style={{ color: MUTED }}>Value (EUR)</div>
          </div>

          {/* Rows */}
          <div className="p-4 space-y-2 max-h-[600px] overflow-y-auto" style={{ background: BG }}>
            {isLoading && filteredAssets.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <RefreshCw size={22} className="mx-auto animate-spin" style={{ color: MUTED }} />
                <p className="text-sm font-bold uppercase tracking-widest" style={{ color: MUTED }}>Loading on-chain data</p>
              </div>
            ) : filteredAssets.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl border flex items-center justify-center" style={{ borderColor: BORDER, background: CARD }}>
                  <Wallet size={26} style={{ color: MUTED }} strokeWidth={1.5} />
                </div>
                <div className="space-y-1">
                  <p className="font-black uppercase tracking-widest text-sm" style={{ color: MUTED }}>No assets detected</p>
                  <p className="text-xs" style={{ color: MUTED }}>Connect a wallet with on-chain holdings.</p>
                </div>
                <button
                  onClick={refresh}
                  className="px-6 py-2.5 border rounded-full font-mono text-[10px] uppercase tracking-widest transition-all hover:bg-black/5"
                  style={{ borderColor: BORDER, color: MUTED }}
                >
                  Refresh
                </button>
              </div>
            ) : (
              filteredAssets.map((asset: any, i: number) => (
                <AssetRow key={`${asset.symbol}-${asset.network}-${i}`} asset={asset} idx={i} hidden={hidden} eurRate={eurRate} />
              ))
            )}
          </div>

        </motion.div>

        {/* ── ALLOCATION ── */}
        {filteredAssets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="rounded-3xl border overflow-hidden backdrop-blur-3xl"
            style={{ borderColor: BORDER, background: CARD }}
          >
            <div className="px-6 py-5 border-b flex items-center gap-3" style={{ borderColor: BORDER }}>
              <div className="w-1 h-5 rounded-full" style={{ background: INK }} />
              <h2 className="font-black uppercase tracking-tight text-sm" style={{ color: INK }}>Allocation</h2>
            </div>
            <div className="p-6 space-y-3">
              {filteredAssets.slice(0, 8).map((asset: any, i: number) => {
                const pctTotal = Number(totalPnl);
                const pct = pctTotal > 0 ? ((asset.valueUSD ?? 0) / pctTotal) * 100 : 0;
                const chainColor = CHAIN_COLORS[asset.network] ?? "#888";
                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: chainColor }} />
                        <span className="font-bold" style={{ color: INK }}>{asset.symbol}</span>
                        <span className="font-mono" style={{ color: MUTED }}>{asset.network}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono" style={{ color: MUTED }}>{safeToFixed(pct, 1)}%</span>
                        <span className="font-mono font-black" style={{ color: INK }}>{hidden ? "••••" : formatEUR(asset.valueUSD ?? 0, eurRate)}</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(5,5,5,0.07)" }}>
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

        {/* ── RISK PROFILE & EXPOSURE ── */}
        {filteredAssets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 }}
            className="rounded-3xl border overflow-hidden backdrop-blur-3xl"
            style={{ borderColor: BORDER, background: CARD }}
          >
            <div className="px-6 py-5 border-b flex items-center gap-3" style={{ borderColor: BORDER }}>
              <div className="w-1 h-5 rounded-full" style={{ background: INK }} />
              <h2 className="font-black uppercase tracking-tight text-sm" style={{ color: INK }}>Exposure Profile</h2>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
               {(() => {
                  const total = Number(totalPnl) || 1; // avoid division by zero
                  const sorted = [...filteredAssets].sort((a, b) => (b.valueUSD ?? 0) - (a.valueUSD ?? 0));
                  const topAsset = sorted[0];
                  const topPct = topAsset ? ((topAsset.valueUSD ?? 0) / total) * 100 : 0;
                  
                  const stablecoins = ['USDC', 'USDT', 'DAI', 'USDe', 'FRAX', 'FDUSD'];
                  const stableValue = filteredAssets.filter(a => a.symbol && stablecoins.includes(a.symbol.toUpperCase())).reduce((sum, a) => sum + (a.valueUSD ?? 0), 0);
                  const stablePct = (stableValue / total) * 100;

                  let riskClass = "MODERATE";
                  let riskColor = "text-amber-500";
                  if (stablePct > 50) { riskClass = "CONSERVATIVE"; riskColor = "text-emerald-500"; }
                  else if (topPct > 60) { riskClass = "AGGRESSIVE"; riskColor = "text-rose-500"; }

                  return (
                    <>
                      <div className="space-y-2 border-r border-white/5 last:border-0 pr-4">
                        <div className="flex items-center gap-2 text-[9px] font-mono font-black uppercase tracking-widest text-white/40">
                           <Activity size={12} /> Dominance
                        </div>
                        <div className="text-xl font-black font-mono text-white">
                           {safeToFixed(topPct, 1)}% <span className="text-[11px] uppercase ml-1 opacity-50">{topAsset?.symbol || 'N/A'}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 border-r border-white/5 last:border-0 pr-4">
                        <div className="flex items-center gap-2 text-[9px] font-mono font-black uppercase tracking-widest text-white/40">
                           <ShieldCheck size={12} /> Stablecoin Hedge
                        </div>
                        <div className="text-xl font-black font-mono text-white">
                           {safeToFixed(stablePct, 1)}%
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[9px] font-mono font-black uppercase tracking-widest text-black/40">
                           <ShieldAlert size={12} /> Risk Classification
                        </div>
                        <div className={`text-xl font-black font-mono ${riskColor}`}>
                           {riskClass}
                        </div>
                      </div>
                    </>
                  );
               })()}
            </div>
          </motion.div>
        )}

        {/* ── CHAIN ACTIVITY (Uniswap-style on-chain history) ── */}
        {userAddress && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26 }}
          >
            <ChainActivityPanel address={userAddress} />
          </motion.div>
        )}
      </div>

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
      <SovereignFooter />
      
      {/* Semantic spacer so SovereignFooter content is not hidden behind the fixed mobile bottom nav */}
      <div className="lg:hidden w-full" style={{ height: 'calc(64px + env(safe-area-inset-bottom, 0px))' }} />

      {/* ─── Bottom Tab Navigation (Mobile Only) ─── */}
      <nav className="mobile-bottom-nav lg:hidden fixed bottom-0 left-0 right-0 border-t border-black/10 dark:border-white/10 bg-white/90 dark:bg-[#111111]/90 backdrop-blur-md flex items-center justify-around px-1 shrink-0 z-50 transition-colors w-full" style={{ minHeight: 'calc(64px + env(safe-area-inset-bottom, 0px))', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
           {[
              { id: 'markets',     icon: <BarChart2 size={18} />,     label: 'Telemetry' },
              { id: 'portfolio',   icon: <BarChart2 size={18} />,      label: 'Portfolio' },
              { id: 'chat',        icon: <MessageSquare size={18} />, label: 'Chat' },
              { id: 'menu',        icon: <Menu size={18} />,          label: 'Menu' },
          ].map(tab => {
              const isActive = tab.id === 'portfolio';
              return (
                  <button
                      key={tab.id}
                      onClick={() => {
                          if (tab.id === 'menu') {
                              router.push('/dashboard?tab=menu');
                          }
                          else if (tab.id === 'chat') router.push('/chat');
                          else if (tab.id === 'portfolio') router.push('/portfolio');
                          else router.push('/dashboard?tab=markets');
                      }}
                      style={{ minHeight: 0, minWidth: 0 }}
                      className={`relative flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-colors ${
                          isActive ? 'text-black dark:text-white' : 'text-[#888888] hover:text-black dark:hover:text-white'
                      }`}
                  >
                      {isActive && (
                          <span className="absolute top-1 left-1/2 -translate-x-1/2 w-5 h-[3px] rounded-full bg-[#050505] dark:bg-white" />
                      )}
                      <span className={isActive ? 'scale-110 transition-transform' : 'transition-transform'}>
                          {tab.icon}
                      </span>
                      <span className={`text-[10px] font-bold ${isActive ? 'opacity-100 font-black' : 'opacity-60'}`}>{tab.label}</span>
                  </button>
              );
          })}
      </nav>
    </div>
  );
}
