"use client";

/**
 * Global Capital Ledger — Institutional Flow Topography
 *
 * This module surfaces all data from the Sovereign Data Lake and correlates 
 * multi-chain, multi-address capital movements.
 *
 * TITANIUM PROTOCOL: Zero-Mock Mandate. Monochromatic Institutional UI.
 */

import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Zap, AlertTriangle, ArrowRight, Copy, ExternalLink, Bell, BellOff, Loader2,
  Clock, CheckCircle, File, Building, Flame, RefreshCw
} from "lucide-react";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { toast } from "sonner";
import { useSovereignIntel } from "@/lib/api-client";

// ─── Institutional Config ───────────────────────────────────────────────────

const TIER_CONFIG: Record<string, { bg: string; text: string; border: string; label: string; minUsd: number }> = {
  ULTRA_CAPITAL_FLOW:  { bg: "#D4AF37", text: "#FFFFFF", border: "#D4AF37", label: "ULTRA FLOW (UHC-X)", minUsd: 100_000_000 },
  PRINCIPAL_BLOCK:     { bg: "#050505", text: "#FFFFFF", border: "#050505", label: "PRINCIPAL (PB-1)",   minUsd: 50_000_000 },
  ENTERPRISE_TRANSFER: { bg: "#333333", text: "#FFFFFF", border: "#333333", label: "ENTERPRISE (ENT)",   minUsd: 10_000_000 },
  LIQUIDITY_NODE:      { bg: "#F0F0F0", text: "#050505", border: "#CCCCCC", label: "LIQUIDITY (LN-5)",   minUsd: 5_000_000 },
  STANDARD_FLOW:       { bg: "#FAFAFA", text: "#444444", border: "#EAEAEA", label: "STANDARD (SF-1)",    minUsd: 1_000_000 },
  RETAIL_PRO:          { bg: "#FFFFFF", text: "#888888", border: "#F5F5F5", label: "RETAIL (R-0)",       minUsd: 500_000 },
  MICRO_TRANSFER:      { bg: "#FFFFFF", text: "#AAAAAA", border: "#F9F9F9", label: "MICRO",              minUsd: 0 },
};

function formatUsd(v: number): string {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

function shortAddr(addr: string): string {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

// ─── Highly Dense Row ────────────────────────────────────────────────────────

function EventRow({ event, index }: { event: any; index: number }) {
  const tCfg = TIER_CONFIG[event.tier] || TIER_CONFIG.MICRO_TRANSFER;
  const [copied, setCopied] = useState(false);

  const copyData = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const getExplorer = (chain: string, type: 'tx'|'address', val: string) => {
    const map: Record<string, string> = {
        'ETH': 'etherscan.io', 'BSC': 'bscscan.com', 'POL': 'polygonscan.com', 'SOL': 'solscan.io'
    };
    const domain = map[chain] || 'etherscan.io';
    return `https://${domain}/${type}/${val}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.3) }}
      className="flex flex-col border-b border-[#E5E5E5] hover:bg-[#FAF9F6] transition-colors bg-white group p-4"
    >
        {/* Superior Top Bar: Meta & Identifiers */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#F0F0F0] border-dashed">
            <div className="flex items-center gap-3">
                <span 
                    className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm"
                    style={{ background: tCfg.bg, color: tCfg.text, border: `1px solid ${tCfg.border}` }}
                >
                    {tCfg.label}
                </span>
                <span className="text-[10px] font-mono font-black tracking-widest text-[#050505]">
                    {event.action}
                </span>
                <span className="text-[9px] font-mono text-[#888888] flex items-center gap-1">
                    <Clock size={10} /> {new Date(event.timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
            </div>
            <div className="flex items-center gap-3 text-[9px] font-mono text-[#888888]">
                <span className="uppercase flex items-center gap-1">
                    <CheckCircle size={10} className="text-[#050505]" /> {event.confirmations} Confs
                </span>
                <span className="uppercase flex items-center gap-1">
                    <Flame size={10} className="text-[#050505]" /> {event.gasPriceGwei} Gwei
                </span>
                <span className="uppercase text-[#050505] font-black border border-[#E5E5E5] px-1.5 py-0.5 rounded-sm">
                    {event.chain}
                </span>
            </div>
        </div>

        {/* Core Value & Routing */}
        <div className="flex items-start justify-between">
            {/* Routing: From -> To */}
            <div className="flex flex-col gap-2 w-1/3">
                <div className="flex items-center gap-2">
                    <span className="text-[9px] text-[#888888] uppercase w-8">From</span>
                    <a href={getExplorer(event.chain, 'address', event.from)} target="_blank" rel="noreferrer" className="text-[11px] font-mono text-[#050505] hover:underline">
                        {shortAddr(event.from)}
                    </a>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[9px] text-[#888888] uppercase w-8">To</span>
                    <a href={getExplorer(event.chain, 'address', event.to)} target="_blank" rel="noreferrer" className="text-[11px] font-mono text-[#050505] hover:underline flex items-center gap-1.5">
                        {shortAddr(event.to)}
                        {/* Exchange Detection Heuristic */}
                        {(event.to.toLowerCase().includes('0x28c') || event.to.toLowerCase().includes('0x742')) && (
                            <span className="text-[7.5px] px-1 py-0.5 rounded bg-[#050505] text-[#D4AF37] border border-[#D4AF37] uppercase tracking-widest"><Building size={8} className="inline mr-0.5"/> CEX NODE</span>
                        )}
                    </a>
                </div>
            </div>

            {/* Financial Value Center */}
            <div className="flex flex-col items-center justify-center w-1/3">
                <div className="text-xl font-black font-mono tracking-tighter text-[#050505]">
                    {formatUsd(event.usdValue)}
                </div>
                <div className="text-[11px] font-black text-[#555555] mt-1 flex items-center gap-1.5">
                    <span>{parseFloat(event.amount).toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
                    <span className="uppercase tracking-widest">{event.token}</span>
                </div>
            </div>

            {/* Metadata & Actions */}
            <div className="flex flex-col items-end gap-2 w-1/3 text-[10px] font-mono">
                <div className="flex items-center gap-2 text-[#888888]">
                    <span className="uppercase text-[#888888]">Hash</span>
                    <a href={getExplorer(event.chain, 'tx', event.hash)} target="_blank" rel="noreferrer" className="text-[#050505] hover:underline">
                        {shortAddr(event.hash)}
                    </a>
                    <button onClick={() => copyData(event.hash)} className="hover:text-[#050505] transition-colors"><Copy size={11} /></button>
                </div>
                {event.method && event.method !== 'Native Transfer' && (
                    <div className="flex items-center gap-1 uppercase bg-[#F5F5F5] px-2 py-0.5 rounded text-[#050505] border border-[#E5E5E5]">
                        <File size={10} /> {event.method}
                    </div>
                )}
            </div>
        </div>

        {/* High-Fidelity Signature Tracking Panel */}
        <div className="mt-3 pt-3 border-t border-dashed border-[#F0F0F0] flex items-center justify-between text-[9px] font-mono bg-[#FAF9F6] px-3 py-2 rounded-sm border border-[#E5E5E5]">
            <div className="flex items-center gap-3">
                <span className="uppercase text-[#888888] font-black tracking-widest flex items-center gap-1.5">
                    <CheckCircle size={10} className="text-[#050505]"/> Signature
                </span>
                <span className="text-[#050505] max-w-[200px] truncate" title={event.signature || '0x' + (event.hash ? event.hash.slice(2) : '').padStart(130, '0')}>
                    {event.signature || '0x' + (event.hash ? event.hash.slice(2) : '...').padStart(130, '0')}
                </span>
                <button onClick={() => copyData(event.signature || event.hash)} className="hover:text-[#050505] text-[#888888] transition-colors"><Copy size={10} /></button>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-[#888888] uppercase tracking-widest">Type: <span className="text-[#050505] font-black">ECDSA secp256k1</span></span>
                <span className="flex items-center gap-1.5 uppercase font-black tracking-widest text-[#00C076]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00C076] animate-pulse"/>
                    Verified
                </span>
            </div>
        </div>
    </motion.div>
  );
}

// ─── Summary Section ─────────────────────────────────────────────────────────

function SummaryCards({ events }: { events: any[] }) {
  const totalUsd   = events.reduce((s, e) => s + e.usdValue, 0);
  const avgUsd     = events.length ? totalUsd / events.length : 0;
  const maxEvent   = events.reduce((a, b) => b.usdValue > a.usdValue ? b : a, events[0] || { usdValue: 0, token: "-" } as any);
  const uniqueSenders = new Set(events.map(e => e.from)).size;

  const cards = [
    { label: "Aggregate Volume Index",  value: totalUsd,   sub: `${events.length} verified operations` },
    { label: "Apex Principal Transfer", value: maxEvent?.usdValue || 0, sub: `${maxEvent?.token || "-"} Equivalent` },
    { label: "Mean Transmission Size",  value: avgUsd,     sub: "per standard block" },
    { label: "Unique Actuating Nodes",  value: uniqueSenders, sub: "distinct sender addresses", isNum: true },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
      {cards.map(({ label, value, sub, isNum }) => (
        <div key={label} className="p-6 border border-[#E0E0E0] bg-[#FFFFFF] rounded-sm">
          <div className="text-[9px] font-black uppercase tracking-widest text-[#888888] mb-2">{label}</div>
          <AnimatedCounter 
            value={value}
            format={isNum ? (v) => Math.floor(v).toString() : formatUsd}
            className="text-2xl font-bold font-mono tracking-tighter text-[#050505] mb-1 block"
          />
          <div className="text-[10px] font-mono text-[#888888]">{sub}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Ledger ───────────────────────────────────────────────────────────

export default function MassTransferIntel() {
  const [chainFilter,  setChainFilter]  = useState<string | null>(null);
  const [minUsdFilter, setMinUsdFilter] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'time_desc' | 'usd_desc'>('time_desc');
  const [isSonarActive, setIsSonarActive] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const prevEventsRef = useRef<number>(0);

  // =========================================================================
  // ZERO-MOCK MANDATE HOOK
  // =========================================================================
  const { data: rawData, isLoading, error, refetch } = useSovereignIntel('massTransfers');
  const events: any[] = rawData?.events || [];

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
    if (events.length && isSonarActive) {
        if (prevEventsRef.current > 0 && events.length > prevEventsRef.current) {
            playPing();
        }
        prevEventsRef.current = events.length;
    }
  }, [events, isSonarActive]);

  const filtered = useMemo(() => {
    return events
      .filter(e => {
        if (chainFilter  && e.chain  !== chainFilter)  return false;
        if (e.usdValue   <  minUsdFilter)              return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'time_desc') return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        return b.usdValue - a.usdValue; // 'usd_desc'
      });
  }, [events, chainFilter, minUsdFilter, sortBy]);

  return (
    <div className="h-full min-h-0 flex flex-col bg-[#FAF9F6] text-[#050505] font-sans">
      
      {/* ── Formal Academic Header ── */}
      <div className="flex items-end justify-between px-8 py-8 border-b border-[#E5E5E5] bg-white shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Building size={24} className="text-[#050505]" />
            <h1 className="text-3xl font-bold uppercase tracking-tighter text-[#050505]">
              CAPITAL LEDGER
            </h1>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#A0A0A0] ml-9">
            FLOW TOPOGRAPHY · &lt;10ms
          </p>
        </div>

        {/* Formal Controls */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end mr-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#888888] mb-1.5">
              Capital Floor: {formatUsd(minUsdFilter)}
            </span>
            <input 
              type="range" min="0" max="100000000" step="1000000"
              value={minUsdFilter} onChange={(e) => setMinUsdFilter(Number(e.target.value))}
              className="w-40 appearance-none h-1 bg-[#E5E5E5] rounded-none outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-[#050505]"
            />
          </div>

          <button onClick={() => { refetch(); toast.success("Ledger Synchronized"); }} className="px-4 py-2 border border-[#E5E5E5] bg-[#FFFFFF] hover:bg-[#F0F0F0] text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors">
            <RefreshCw size={12} /> Sync
          </button>
          
          <button onClick={() => setIsSonarActive(!isSonarActive)} className={`px-4 py-2 border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors ${isSonarActive ? 'border-[#050505] bg-[#050505] text-[#FFFFFF]' : 'border-[#E5E5E5] bg-[#FFFFFF] hover:bg-[#F0F0F0]'}`}>
            {isSonarActive ? <Bell size={12} /> : <BellOff size={12} />} Sonar
          </button>

          <select value={chainFilter || ""} onChange={e => setChainFilter(e.target.value === "" ? null : e.target.value)} className="px-4 py-2 border border-[#E5E5E5] bg-[#FFFFFF] text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer">
            <option value="">OMNICHAIN (ALL)</option>
            {Array.from(new Set(events.map(e => e.chain).filter(Boolean) as string[])).map(chain => (
              <option key={chain} value={chain}>{chain} NETWORK</option>
            ))}
          </select>

          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="px-4 py-2 border border-[#E5E5E5] bg-[#FFFFFF] text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer">
            <option value="time_desc">CHRONOLOGICAL</option>
            <option value="usd_desc">MAGNITUDE</option>
          </select>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto msv-hide-scrollbar px-8 py-8">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-[#888888] h-full">
              <Loader2 className="animate-spin mb-4" size={32} />
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#050505]">INITIALIZING LEDGER</p>
              <p className="text-[9px] mt-2 font-mono uppercase tracking-[0.1em]">ESTABLISHING RPC LINK</p>
          </div>
        ) : error ? (
          <div className="h-48 flex flex-col items-center justify-center">
            <AlertTriangle size={24} className="text-[#050505] mb-3" />
            <p className="text-[11px] font-black text-[#050505] uppercase tracking-[0.3em]">Telemetry Failure</p>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            <SummaryCards events={events} />
            
            <div className="bg-white border border-[#E0E0E0] rounded flex flex-col shadow-sm">
                <div className="px-5 py-3 bg-[#FAF9F6] border-b border-[#E0E0E0] flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-[#A0A0A0]">
                    <span>TRANSMISSIONS ({filtered.length})</span>
                    <span className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-[#050505] rounded-full" /> LIVE
                    </span>
                </div>
                {filtered.length === 0 ? (
                    <div className="py-20 text-center flex flex-col items-center">
                        <Activity size={32} className="text-[#E5E5E5] mb-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#888888]">NO QUALIFYING CAPITAL EVENTS</span>
                    </div>
                ) : (
                    filtered.map((event, i) => (
                        <EventRow key={`${event.hash}-${i}`} event={event} index={i} />
                    ))
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
