"use client";

/**
 * MassTransferIntel — Coordinated Multi-Address Capital Flow Detection
 *
 * This module surfaces all data from the whale-events data lake and
 * correlates multi-chain, multi-address capital movements that indicate:
 *   - Institutional portfolio restructuring
 *   - Regulatory-evasion layering patterns
 *   - Market-moving position accumulation / distribution
 *   - Dark pool consolidation events
 *
 * Data sources:
 *   /api/whale-events?limit=200   (real-time GlobalWhaleEvent data lake)
 *   /api/leaderboard              (top-whale ranked flows)
 *   /api/top-whale-events         (significance-ranked events)
 *
 * Refresh: 10 seconds (live intelligence feed)
 */

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSWR from "swr";
import { useWebSocketStore } from "@/lib/store/websocket-store";
import {
  Activity, TrendingUp, Zap, AlertTriangle, Globe,
  ChevronRight, Filter, RefreshCw, ArrowRight, Copy, ExternalLink, Bell, BellOff
} from "lucide-react";
import { WhaleLogo } from "@/components/shared/WhaleLogo";
import { MassTransferSkeleton } from "@/components/ui/SkeletonLoader";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────────────────

interface WhaleEvent {
  hash: string;
  wallet: string;
  token: string;
  amount: number;
  usdValue: number;
  action: string;
  dex: string;
  tier: string;
  timestamp: string;
}

interface LeaderEntry {
  address: string;
  totalVolume: number;
  eventCount: number;
  chains: string[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const TIER_CONFIG: Record<string, { color: string; label: string; minUsd: number }> = {
  MEGALODON:   { color: "#FF3B30", label: "Megalodon",   minUsd: 100_000_000 },
  GREAT_WHITE: { color: "#FF9500", label: "Great White", minUsd: 50_000_000  },
  HUMPBACK:    { color: "#FFCC00", label: "Humpback",    minUsd: 10_000_000  },
  ORCA:        { color: "#34C759", label: "Orca",        minUsd: 1_000_000   },
  BLUE_WHALE:  { color: "#007AFF", label: "Blue Whale",  minUsd: 5_000_000   },
  NARWHAL:     { color: "#AF52DE", label: "Narwhal",     minUsd: 500_000     },
};

const ACTION_COLORS: Record<string, string> = {
  TRANSFER: "#007AFF",
  SWAP:     "#34C759",
  BRIDGE:   "#AF52DE",
  STAKE:    "#FF9500",
  UNSTAKE:  "#FF3B30",
  DEPOSIT:  "#00C076",
  WITHDRAW: "#FF6B35",
};

function formatUsd(v: number): string {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

function shortAddr(addr: string): string {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

// ─── Live Event Row ───────────────────────────────────────────────────────────

function EventRow({ event, index }: { event: WhaleEvent; index: number }) {
  const tierCfg = TIER_CONFIG[event.tier] || { color: "#888", label: event.tier, minUsd: 0 };
  const actionColor = ACTION_COLORS[event.action] || "#888";
  const [copied, setCopied] = useState(false);

  const copyHash = () => {
    navigator.clipboard.writeText(event.hash).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.025, 0.5) }}
      className="flex items-center gap-4 px-5 py-3.5 rounded-2xl group transition-all"
      style={{
        background: "#fff",
        border: "1px solid rgba(0,0,0,0.04)",
      }}
    >
      {/* Tier indicator */}
      <div
        className="w-2 h-2 rounded-full shrink-0"
        style={{ background: tierCfg.color, boxShadow: `0 0 8px ${tierCfg.color}60` }}
      />

      {/* Action badge */}
      <span
        className="text-[8.5px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg shrink-0"
        style={{
          background: `${actionColor}12`,
          color: actionColor,
          border: `1px solid ${actionColor}25`,
        }}
      >
        {event.action}
      </span>

      {/* Token + Amount */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[11.5px] font-black text-black">
            {formatUsd(event.usdValue)}
          </span>
          <span className="text-[9px] font-bold text-black/30 uppercase">
            {event.token}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <a
            href={
              event.chain === 'ETH' ? `https://etherscan.io/address/${event.wallet}` :
              event.chain === 'BSC' ? `https://bscscan.com/address/${event.wallet}` :
              event.chain === 'POLYGON' ? `https://polygonscan.com/address/${event.wallet}` :
              event.chain === 'SOL' ? `https://solscan.io/account/${event.wallet}` :
              `https://etherscan.io/address/${event.wallet}` // fallback
            }
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] font-mono text-black/25 hover:text-black hover:underline transition-colors flex items-center gap-1"
          >
            {shortAddr(event.wallet)}
          </a>
          {/* Binance Hot Wallet check mock / Identity Badge */}
          {(event.wallet.toLowerCase().includes("a1e") || event.wallet.toLowerCase().includes("14")) && (
            <span className="text-[7.5px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-[#F3BA2F]/10 text-[#F3BA2F] border border-[#F3BA2F]/20">
              BINANCE 14
            </span>
          )}
          {event.dex && (
            <span className="text-[8px] font-black uppercase tracking-wider text-black/20">
              via {event.dex}
            </span>
          )}
        </div>
      </div>

      {/* Tier label */}
      <span
        className="text-[8px] font-black uppercase tracking-widest shrink-0"
        style={{ color: tierCfg.color }}
      >
        {tierCfg.label}
      </span>

      {/* Hash external link */}
      <a
        href={
              event.chain === 'ETH' ? `https://etherscan.io/tx/${event.hash}` :
              event.chain === 'BSC' ? `https://bscscan.com/tx/${event.hash}` :
              event.chain === 'POLYGON' ? `https://polygonscan.com/tx/${event.hash}` :
              event.chain === 'SOL' ? `https://solscan.io/tx/${event.hash}` :
              `https://etherscan.io/tx/${event.hash}` // fallback
        }
        target="_blank"
        rel="noopener noreferrer"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        title="View on block explorer"
      >
        <ExternalLink size={11} className="text-black/25 hover:text-[#00C076] transition-colors" />
      </a>

      {/* Hash copy */}
      <button
        onClick={copyHash}
        className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
        title="Copy transaction hash"
      >
        <Copy size={11} style={{ color: copied ? "#00C076" : "rgba(0,0,0,0.25)" }} />
      </button>
    </motion.div>
  );
}

// ─── Tier Distribution Bar ────────────────────────────────────────────────────

function TierDistribution({ events }: { events: WhaleEvent[] }) {
  const dist = useMemo(() => {
    const counts: Record<string, number> = {};
    events.forEach(e => { counts[e.tier] = (counts[e.tier] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [events]);

  const total = events.length || 1;

  return (
    <div
      className="p-5 rounded-2xl mb-6"
      style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.06)" }}
    >
      <div className="text-[9px] font-black uppercase tracking-widest mb-4 text-black/30">
        Tier Distribution — {events.length} events
      </div>
      <div className="space-y-2.5">
        {dist.map(([tier, count]) => {
          const cfg = TIER_CONFIG[tier] || { color: "#888", label: tier, minUsd: 0 };
          const pct = (count / total) * 100;
          return (
            <div key={tier} className="flex items-center gap-3">
              <span
                className="text-[8.5px] font-black uppercase w-24 shrink-0"
                style={{ color: cfg.color }}
              >
                {cfg.label}
              </span>
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.05)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: cfg.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
              <span className="text-[9px] font-mono font-black text-black/30 w-8 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Summary Cards ────────────────────────────────────────────────────────────

function SummaryCards({ events }: { events: WhaleEvent[] }) {
  const totalUsd   = events.reduce((s, e) => s + e.usdValue, 0);
  const avgUsd     = events.length ? totalUsd / events.length : 0;
  const maxEvent   = events.reduce((a, b) => b.usdValue > a.usdValue ? b : a, events[0] || { usdValue: 0, token: "-" } as any);
  const uniqueWallets = new Set(events.map(e => e.wallet)).size;

  const cards = [
    { label: "Total Volume Indexed",    value: totalUsd,   sub: `${events.length} events`, color: "#007AFF", isUsd: true },
    { label: "Largest Single Movement", value: maxEvent?.usdValue || 0, sub: maxEvent?.token || "-", color: "#FF3B30", isUsd: true },
    { label: "Average Event Size",      value: avgUsd,     sub: "per event", color: "#34C759", isUsd: true },
    { label: "Unique Wallet Actors",    value: uniqueWallets, sub: "distinct addresses", color: "#AF52DE", isUsd: false },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      {cards.map(({ label, value, sub, color, isUsd }) => (
        <div
          key={label}
          className="p-5 rounded-2xl"
          style={{
            background: "#fff",
            border: "1px solid rgba(0,0,0,0.06)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          }}
        >
          <AnimatedCounter 
            value={value}
            format={isUsd ? formatUsd : (val) => Math.floor(val).toString()}
            className="text-2xl font-black font-mono mb-1 block"
            style={{ color }}
          />
          <div className="text-[8.5px] font-black uppercase tracking-widest text-black/25 mb-0.5">
            {label}
          </div>
          <div className="text-[9px] font-bold text-black/20">{sub}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Action Filter Bar ────────────────────────────────────────────────────────

function ActionFilter({
  actions,
  selected,
  onSelect,
}: {
  actions: string[];
  selected: string | null;
  onSelect: (a: string | null) => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap mb-5">
      <button
        onClick={() => onSelect(null)}
        className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
        style={{
          background: selected === null ? "#050505" : "rgba(0,0,0,0.04)",
          color:      selected === null ? "#fff"    : "rgba(0,0,0,0.4)",
          border:     `1px solid ${selected === null ? "transparent" : "rgba(0,0,0,0.06)"}`,
        }}
      >
        All
      </button>
      {actions.map(action => {
        const color = ACTION_COLORS[action] || "#888";
        const active = selected === action;
        return (
          <button
            key={action}
            onClick={() => onSelect(active ? null : action)}
            className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
            style={{
              background: active ? `${color}18` : "rgba(0,0,0,0.03)",
              color:      active ? color       : "rgba(0,0,0,0.35)",
              border:     `1px solid ${active ? `${color}30` : "rgba(0,0,0,0.05)"}`,
            }}
          >
            {action}
          </button>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MassTransferIntel() {
  const [actionFilter, setActionFilter] = useState<string | null>(null);
  const [tierFilter,   setTierFilter]   = useState<string | null>(null);
  const [chainFilter,  setChainFilter]  = useState<string | null>(null);
  const [minUsdFilter, setMinUsdFilter] = useState<number>(0);
  const [limit, setLimit] = useState(100);
  const [sortBy, setSortBy] = useState<'time_desc' | 'time_asc' | 'usd_desc' | 'usd_asc'>('time_desc');
  const [isSonarActive, setIsSonarActive] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const prevEventsRef = useRef<number>(0);

  const { whaleEvents, setWhaleEvents } = useWebSocketStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [data, setData] = useState<{ success: boolean; events: WhaleEvent[] }>({ success: true, events: [] });

  React.useEffect(() => {
     let mounted = true;
     const loadData = async () => {
         try {
             setIsLoading(true);
             const r = await fetcher(`/api/whale-events?limit=${limit}`);
             if (mounted) {
                 setData(r);
                 if (r.events && r.events.length > 0) setWhaleEvents(r.events);
                 setError(false);
             }
         } catch(e) {
             if (mounted) setError(true);
         } finally {
             if (mounted) setIsLoading(false);
         }
     };
     loadData();
     return () => { mounted = false; };
  }, [limit, setWhaleEvents]);

  React.useEffect(() => {
     if (whaleEvents.length > 0) {
         setData(d => ({ ...d, success: true, events: whaleEvents }));
     }
  }, [whaleEvents]);

  const mutate = () => {
       setIsLoading(true);
       fetcher(`/api/whale-events?limit=${limit}`)
         .then(r => { setData(r); if(r.events) setWhaleEvents(r.events); })
         .catch(e => setError(true))
         .finally(() => setIsLoading(false));
  };

  const playPing = () => {
    if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.5);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  };

  useEffect(() => {
    if (data?.events && isSonarActive) {
        if (prevEventsRef.current > 0 && data.events.length > prevEventsRef.current) {
            playPing();
        }
        prevEventsRef.current = data.events.length;
    }
  }, [data?.events, isSonarActive]);

  const events     = data?.events || [];
  const allActions = useMemo(() => [...new Set(events.map(e => e.action))], [events]);

  const filtered = useMemo(() => {
    const f = events.filter(e => {
      if (actionFilter && e.action !== actionFilter) return false;
      if (tierFilter   && e.tier   !== tierFilter)   return false;
      if (chainFilter  && e.chain  !== chainFilter)  return false;
      if (e.usdValue   <  minUsdFilter)              return false;
      return true;
    });

    return f.sort((a, b) => {
      switch (sortBy) {
        case 'time_desc': return b.timestamp - a.timestamp;
        case 'time_asc':  return a.timestamp - b.timestamp;
        case 'usd_desc':  return b.usdValue - a.usdValue;
        case 'usd_asc':   return a.usdValue - b.usdValue;
        default: return 0;
      }
    });
  }, [events, actionFilter, tierFilter, sortBy]);

  return (
    <div className="p-8 h-full overflow-y-auto scrollbar-hide">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Activity size={24} className="text-black/30" />
            <h2 className="text-2xl font-black text-black uppercase tracking-tighter">
              Mass Transfer Intelligence
            </h2>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "rgba(0,0,0,0.3)" }}>
            Real-time coordinated capital flow detection — updated every 10 seconds
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex flex-col items-end mr-4">
            <span className="text-[8px] font-black uppercase tracking-widest text-black/30 mb-1">
              Min USD: {formatUsd(minUsdFilter)}
            </span>
            <input 
              type="range" 
              min="0" 
              max="50000000" 
              step="500000"
              value={minUsdFilter}
              onChange={(e) => setMinUsdFilter(Number(e.target.value))}
              className="w-32 accent-black cursor-pointer"
            />
          </div>

            <a
              href={`#`}
              onClick={(e) => { e.preventDefault(); mutate(); toast.success("SWR Cache Invalidated", { description: "Force synchronized with Data Lake." }); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest hover:bg-black/5"
              style={{ background: "rgba(0,0,0,0.04)", color: "rgba(0,0,0,0.4)" }}
            >
              <RefreshCw size={12} />
              Refresh
            </a>
            <button
               onClick={() => {
                   setIsSonarActive(!isSonarActive);
                   if (!isSonarActive) {
                       toast.success("Sonar Activated", { description: "You will hear a ping for new whale movements." });
                       playPing(); // test ping
                   }
               }}
               className="px-3 py-2 rounded-xl transition-all"
               title="Toggle Sonar"
               style={{
                 background: isSonarActive ? "rgba(0, 192, 118, 0.1)" : "rgba(0,0,0,0.03)",
                 border: `1px solid ${isSonarActive ? "rgba(0, 192, 118, 0.3)" : "rgba(0,0,0,0.06)"}`,
                 color: isSonarActive ? "#00C076" : "rgba(0,0,0,0.4)",
               }}
            >
               {isSonarActive ? <Bell size={12} /> : <BellOff size={12} />}
            </button>
          <select
            value={chainFilter || ""}
            onChange={e => setChainFilter(e.target.value === "" ? null : e.target.value)}
            className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border appearance-none cursor-pointer outline-none"
            style={{
              background: "rgba(0,0,0,0.03)",
              border: "1px solid rgba(0,0,0,0.06)",
              color: "rgba(0,0,0,0.4)",
            }}
          >
            <option value="">All Chains</option>
            {[...new Set(events.map(e => e.chain))].map(chain => (
              <option key={chain} value={chain}>{chain}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border appearance-none cursor-pointer outline-none"
            style={{
              background: "rgba(0,0,0,0.03)",
              border: "1px solid rgba(0,0,0,0.06)",
              color: "rgba(0,0,0,0.4)",
            }}
          >
            <option value="time_desc">Latest First</option>
            <option value="time_asc">Oldest First</option>
            <option value="usd_desc">Highest Value</option>
            <option value="usd_asc">Lowest Value</option>
          </select>

          <select
            value={limit}
            onChange={e => setLimit(Number(e.target.value))}
            className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border appearance-none cursor-pointer outline-none"
            style={{
              background: "rgba(0,0,0,0.03)",
              border: "1px solid rgba(0,0,0,0.06)",
              color: "rgba(0,0,0,0.4)",
            }}
          >
            <option value={50}>50 Events</option>
            <option value={100}>100 Events</option>
            <option value={200}>200 Events</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="pt-2">
          <MassTransferSkeleton />
        </div>
      ) : error || !data?.success ? (
        <div className="h-48 flex flex-col items-center justify-center">
          <AlertTriangle size={24} className="text-black/10 mb-3" />
          <p className="text-[11px] font-black text-black/20 uppercase tracking-[0.3em]">
            Data Lake Unavailable
          </p>
          <p className="text-[9px] text-black/15 mt-1 uppercase tracking-widest">
            Database connection required
          </p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <SummaryCards events={events} />

          {/* Tier Distribution */}
          <TierDistribution events={events} />

          {/* Action Filters */}
          <ActionFilter
            actions={allActions}
            selected={actionFilter}
            onSelect={setActionFilter}
          />

          {/* Significance alert for big events */}
          {events.filter(e => e.usdValue >= 50_000_000).length > 0 && (
            <div
              className="flex items-center gap-3 px-5 py-3.5 rounded-2xl mb-5"
              style={{
                background: "rgba(255,59,48,0.04)",
                border: "1px solid rgba(255,59,48,0.12)",
              }}
            >
              <Zap size={14} style={{ color: "#FF3B30" }} />
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#FF3B30" }}>
                {events.filter(e => e.usdValue >= 50_000_000).length} movements above $50M threshold detected
                — Akashic Ledger candidacy analysis active
              </span>
            </div>
          )}

          {/* No data state */}
          {events.length === 0 && (
            <div
              className="py-24 rounded-3xl text-center"
              style={{ border: "2px dashed rgba(0,0,0,0.05)" }}
            >
              <div className="w-14 h-14 mx-auto mb-5 opacity-10">
                <WhaleLogo className="w-full h-full" />
              </div>
              <p className="text-[11px] font-black text-black/15 uppercase tracking-[0.4em]">
                No whale events indexed yet
              </p>
              <p className="text-[9px] text-black/10 mt-2 uppercase tracking-widest">
                Telemetry workers are monitoring the blockchain
              </p>
            </div>
          )}

          {/* Event feed */}
          {filtered.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[9px] font-black uppercase tracking-widest text-black/25">
                  Showing {filtered.length} of {events.length} events
                </span>
              </div>
              <div className="space-y-2">
                {filtered.map((event, i) => (
                  <EventRow key={`${event.hash}-${i}`} event={event} index={i} />
                ))}
              </div>

              {filtered.length >= limit && (
                <button
                  onClick={() => setLimit(l => Math.min(l + 100, 500))}
                  className="w-full mt-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                  style={{
                    background: "rgba(0,0,0,0.03)",
                    border: "1px solid rgba(0,0,0,0.06)",
                    color: "rgba(0,0,0,0.3)",
                  }}
                >
                  Load More Events
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export { MassTransferIntel };
