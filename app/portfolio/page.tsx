"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet, RefreshCw, ArrowUpRight, ArrowDownRight,
  Eye, EyeOff, PieChart, Globe, Copy, Search,
  ArrowDownLeft, Repeat, CreditCard, Plus, ChevronDown,
  Check, Loader2, ShieldCheck, ExternalLink
} from 'lucide-react';
import { useLivePortfolio } from '@/hooks/useLivePortfolio';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { useAccount, useSwitchChain } from 'wagmi';
import { mainnet, base, optimism, arbitrum, polygon, worldchain } from 'wagmi/chains';
import { safeToFixed, safeToLocaleString } from '@/lib/utils/number-format';
import { LegendaryTransactionModal } from '@/components/rainbow/LegendaryTransactionModal';
import { DepositModal } from '@/components/rainbow/DepositModal';
import { coinbaseWallet } from 'wagmi/connectors';
import { useConnect } from 'wagmi';
import { toast } from 'sonner';

// ── Palette ──────────────────────────────────────────────────────────────────
const BG   = "#FAF9F6";
const INK  = "#050505";
const MUTED = "rgba(5,5,5,0.45)";
const BORDER = "rgba(5,5,5,0.08)";
const CARD  = "#FFFFFF";

// ── Chain color map ──────────────────────────────────────────────────────────
const CHAIN_COLORS: Record<string, string> = {
  "Ethereum": "#627EEA", "Base": "#0052FF", "Arbitrum One": "#12AAFF",
  "OP Mainnet": "#FF0420", "Polygon": "#8247E5", "BNB Smart Chain": "#F0B90B",
  "Avalanche": "#E84142", "Solana": "#9945FF",
};

// ── Supported networks for Switch Network ────────────────────────────────────
const SUPPORTED_CHAINS = [
  { chain: mainnet,    name: "Ethereum",    color: "#627EEA", symbol: "ETH" },
  { chain: base,       name: "Base",        color: "#0052FF", symbol: "ETH" },
  { chain: optimism,   name: "Optimism",    color: "#FF0420", symbol: "ETH" },
  { chain: arbitrum,   name: "Arbitrum",    color: "#12AAFF", symbol: "ETH" },
  { chain: polygon,    name: "Polygon",     color: "#8247E5", symbol: "POL" },
  { chain: worldchain, name: "World Chain", color: "#000000", symbol: "WLD" },
];

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
        {asset.symbol?.slice(0, 3) ?? "?"}
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

      {/* USD value */}
      <div className="text-right w-28 shrink-0">
        <div className="font-black font-mono text-sm" style={{ color: INK }}>
          {hidden ? "••••••" : formatUSD(asset.value ?? 0)}
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
  const [hidden, setHidden] = useState(false);
  const [search, setSearch] = useState("");
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [transferMode, setTransferMode] = useState<"send" | "swap" | "bridge" | "buy">("send");
  const [showNetworkSwitch, setShowNetworkSwitch] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);

  const { totalPnl, assets, change24hUSD, change24hPercent, isLoading } = useLivePortfolio();
  const { address: userAddress, isConnected } = useAppKitAccount();
  const { chain } = useAccount();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const { connect } = useConnect();
  const { open } = useAppKit();
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey(k => k + 1);

  const isPositive = (change24hUSD ?? 0) >= 0;

  const filteredAssets = (assets ?? [])
    .filter((a: any) =>
      !search ||
      a.symbol?.toLowerCase().includes(search.toLowerCase()) ||
      a.network?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a: any, b: any) => (b.value ?? 0) - (a.value ?? 0));

  const openMode = (m: "send" | "swap" | "bridge" | "buy") => {
    setTransferMode(m);
    setIsTransferOpen(true);
  };

  const handleCreateOnChainAccount = async () => {
    setCreatingAccount(true);
    try {
      // Coinbase Smart Wallet — creates a new on-chain account for the user
      connect({ connector: coinbaseWallet({ preference: 'smartWalletOnly' }) });
      toast.success("Smart Wallet initiated", { description: "Follow the prompts to create your on-chain account." });
      setAccountCreated(true);
    } catch (e: any) {
      toast.error("Account creation failed", { description: e.message });
    } finally {
      setCreatingAccount(false);
    }
  };

  // ── Not connected ──
  if (!isConnected) {
    return (
      <div
        className="flex items-center justify-center px-6"
        style={{ background: BG, minHeight: '100%' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm text-center space-y-8"
        >
          <div
            className="w-20 h-20 mx-auto rounded-3xl border flex items-center justify-center"
            style={{ borderColor: BORDER, background: CARD }}
          >
            <Wallet size={32} style={{ color: MUTED }} strokeWidth={1.5} />
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl font-black tracking-tighter uppercase" style={{ color: INK }}>Portfolio</h1>
            <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
              Connect your wallet to view your on-chain holdings, track performance, and manage assets.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3">
            <button
              onClick={() => open()}
              className="w-full py-4 rounded-2xl font-black uppercase tracking-[0.15em] text-[11px] transition-all hover:opacity-80 shadow-lg"
              style={{ background: "#0052FF", color: "#FFFFFF" }}
            >
              Connect Wallet
            </button>
            <div className="scale-90 origin-center">
              <appkit-button />
            </div>
          </div>

          <p className="text-[10px] uppercase tracking-widest" style={{ color: MUTED }}>
            Non-custodial · On-chain · Real-time
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ background: BG, color: INK }}>

      {/* ── HEADER ── */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b"
        style={{
          background: "rgba(250,249,246,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderColor: BORDER
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl border flex items-center justify-center" style={{ borderColor: BORDER, background: CARD }}>
            <PieChart size={15} style={{ color: MUTED }} />
          </div>
          <div>
            <div className="font-black text-sm uppercase tracking-tight" style={{ color: INK }}>Portfolio</div>
            <div className="text-[9px] font-mono uppercase tracking-widest" style={{ color: MUTED }}>On-chain Intelligence</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Address badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 border rounded-full" style={{ borderColor: BORDER, background: CARD }}>
            <span className="font-mono text-[10px]" style={{ color: MUTED }}>{userAddress ? formatAddr(userAddress) : "—"}</span>
            <button
              onClick={() => { navigator.clipboard.writeText(userAddress ?? ""); toast.success("Copied!"); }}
              style={{ color: MUTED }}
              className="hover:opacity-100 transition-opacity opacity-50"
            >
              <Copy size={10} />
            </button>
          </div>

          {/* Refresh */}
          <button
            onClick={refresh}
            className="p-2 rounded-xl border transition-all hover:bg-black/5"
            style={{ borderColor: BORDER, background: CARD, color: MUTED }}
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          </button>

          <div className="scale-90 origin-right">
            <appkit-button />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pb-8 pt-8 space-y-5">

        {/* ── BALANCE CARD ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border overflow-hidden"
          style={{ borderColor: BORDER, background: CARD }}
        >
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <span className="text-[10px] font-mono font-black uppercase tracking-[0.3em]" style={{ color: MUTED }}>
                Total Portfolio Value
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
                {hidden ? <span style={{ color: MUTED }}>••••••••</span> : formatUSD(Number(totalPnl) ?? 0)}
              </div>

              {/* 24h pill */}
              <div
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-black text-sm border ${
                  isPositive ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-rose-600 bg-rose-50 border-rose-200"
                }`}
              >
                {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {hidden ? "••••" : `${isPositive ? "+" : ""}${formatUSD(Number(change24hUSD) ?? 0)}`}
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
          <div className="flex flex-wrap justify-around gap-2">
            <WalletAction icon={ArrowUpRight}   label="Send"   onClick={() => openMode("send")}   />
            <WalletAction icon={ArrowDownLeft}  label="Receive" onClick={() => setIsDepositOpen(true)} />
            <WalletAction icon={Repeat}         label="Swap"   onClick={() => openMode("swap")}   />
            <WalletAction icon={Globe}          label="Bridge" onClick={() => openMode("bridge")} />
            <WalletAction icon={CreditCard}     label="Buy"    onClick={() => openMode("buy")}    />
            <WalletAction icon={Globe}          label="Network" onClick={() => setShowNetworkSwitch(s => !s)} />
            <WalletAction icon={Plus}           label="New Account" onClick={() => setShowCreateAccount(s => !s)} />
          </div>
        </motion.div>

        {/* ── SWITCH NETWORK PANEL ── */}
        <AnimatePresence>
          {showNetworkSwitch && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-3xl border overflow-hidden"
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
                {SUPPORTED_CHAINS.map(({ chain: c, name, color, symbol }) => {
                  const isActive = chain?.id === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        switchChain({ chainId: c.id });
                        toast.info(`Switching to ${name}...`);
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
              className="rounded-3xl border overflow-hidden"
              style={{ borderColor: BORDER, background: CARD }}
            >
              <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: BORDER }}>
                <div className="flex items-center gap-3">
                  <div className="w-1 h-5 rounded-full" style={{ background: INK }} />
                  <h2 className="font-black uppercase tracking-tight text-sm" style={{ color: INK }}>Create On-Chain Account</h2>
                </div>
                <button onClick={() => { setShowCreateAccount(false); setAccountCreated(false); }} style={{ color: MUTED }} className="text-[10px] font-mono font-black uppercase tracking-widest hover:opacity-100 opacity-50 transition-opacity">Close</button>
              </div>
              <div className="p-6">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Coinbase Smart Wallet */}
                      <div className="rounded-2xl border p-5 flex flex-col justify-between hover:shadow-md transition-shadow" style={{ borderColor: BORDER, background: CARD }}>
                        <div className="flex items-start gap-4 mb-6">
                          <div className="w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 overflow-hidden" style={{ borderColor: BORDER, background: "#FAF9F6" }}>
                            <img src="/wallets/coinbase.png" alt="Coinbase" className="w-8 h-8 object-contain" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-black text-sm" style={{ color: INK }}>Smart Wallet</div>
                            <div className="text-[10px] font-bold uppercase tracking-wider mt-0.5" style={{ color: MUTED }}>Passkeys · No Seed</div>
                            <p className="text-[11px] mt-2 leading-relaxed" style={{ color: MUTED }}>Free on-chain account powered by Account Abstraction. Sign in effortlessly with passkeys.</p>
                          </div>
                        </div>
                        <button
                          onClick={handleCreateOnChainAccount}
                          disabled={creatingAccount}
                          className="w-full py-3 rounded-xl font-black text-[11px] uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                          style={{ background: "#0052FF", color: '#FFFFFF' }}
                        >
                          {creatingAccount ? <><Loader2 size={14} className="animate-spin" /> Creating...</> : <><Plus size={14} /> Create Account</>}
                        </button>
                      </div>

                      {/* AppKit Universal */}
                      <div className="rounded-2xl border p-5 flex flex-col justify-between hover:shadow-md transition-shadow" style={{ borderColor: BORDER, background: CARD }}>
                        <div className="flex items-start gap-4 mb-6">
                          <div className="w-12 h-12 rounded-xl border flex items-center justify-center shrink-0" style={{ borderColor: BORDER, background: "#FAF9F6" }}>
                            <Globe size={22} style={{ color: MUTED }} strokeWidth={1.5} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-black text-sm" style={{ color: INK }}>Universal Account</div>
                            <div className="text-[10px] font-bold uppercase tracking-wider mt-0.5" style={{ color: MUTED }}>Web3 Standard</div>
                            <p className="text-[11px] mt-2 leading-relaxed" style={{ color: MUTED }}>Connect or create a new account using any supported Web3 provider via WalletConnect.</p>
                          </div>
                        </div>
                        <button
                          onClick={() => open()}
                          className="w-full py-3 rounded-xl font-black text-[11px] uppercase tracking-[0.15em] transition-all hover:bg-black/5 flex items-center justify-center gap-2 border shadow-sm"
                          style={{ borderColor: BORDER, background: "#FAF9F6", color: INK }}
                        >
                          <ExternalLink size={14} /> Open Browser
                        </button>
                      </div>
                    </div>

                    <p className="mt-5 text-[9px] font-mono uppercase tracking-widest text-center" style={{ color: MUTED }}>
                      Non-custodial · Institutional Grade · Zero server access
                    </p>
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
          className="rounded-3xl border overflow-hidden"
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
            <div className="w-28 text-right text-[9px] font-mono font-black uppercase tracking-widest" style={{ color: MUTED }}>Value</div>
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
                <AssetRow key={`${asset.symbol}-${asset.network}-${i}`} asset={asset} idx={i} hidden={hidden} />
              ))
            )}
          </div>

          {/* Footer */}
          {filteredAssets.length > 0 && (
            <div className="px-6 py-3 border-t" style={{ borderColor: BORDER, background: CARD }}>
              <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: MUTED }}>
                Live on-chain data · Updates every 30s
              </span>
            </div>
          )}
        </motion.div>

        {/* ── ALLOCATION ── */}
        {filteredAssets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="rounded-3xl border overflow-hidden"
            style={{ borderColor: BORDER, background: CARD }}
          >
            <div className="px-6 py-5 border-b flex items-center gap-3" style={{ borderColor: BORDER }}>
              <div className="w-1 h-5 rounded-full" style={{ background: INK }} />
              <h2 className="font-black uppercase tracking-tight text-sm" style={{ color: INK }}>Allocation</h2>
            </div>
            <div className="p-6 space-y-3">
              {filteredAssets.slice(0, 8).map((asset: any, i: number) => {
                const pctTotal = Number(totalPnl);
                const pct = pctTotal > 0 ? ((asset.value ?? 0) / pctTotal) * 100 : 0;
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
                        <span className="font-mono font-black" style={{ color: INK }}>{hidden ? "••••" : formatUSD(asset.value ?? 0)}</span>
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
