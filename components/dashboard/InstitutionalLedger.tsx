// components/dashboard/InstitutionalLedger.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Shield, ExternalLink, Hash, Clock, Landmark, Activity, Zap, Cpu, Waves } from 'lucide-react';

interface LedgerEntry {
  id: string;
  immutableId: string;
  timestamp: string;
  entityName: string;
  usdValue: string;
  valueBTC: number;
  chain: string;
  transactionHash: string;
  institutional: boolean;
  confirmed: boolean;
  type?: string;
}

interface Stats {
  total24hVolume: number;
  total24hBtc: number;
  transactionCount: number;
  institutionalRatio: number;
  whaleThroughput: number;
  liquidityBreachDelta: number;
  supernovaDetected: boolean;
  hazardLevel: 'LOW' | 'MEDIUM' | 'CRITICAL';
  readLatencyMs: string;
  alphaScore: number;
  topEntities: { name: string; count: number }[];
}

export default function InstitutionalLedger() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'IDLE' | 'READING' | 'SYNCED'>('IDLE');
  const [lastCheckTime, setLastCheckTime] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setSyncStatus('READING');
      const start = Date.now();
      try {
        const [ledgerRes, statsRes] = await Promise.all([
          fetch('/api/institutional/ledger'),
          fetch('/api/institutional/stats')
        ]);
        
        const ledgerData = await ledgerRes.json();
        const statsData = await statsRes.json();
        
        setEntries(ledgerData.entries || []);
        setStats(statsData);
        setLastCheckTime(Date.now() - start);
        setSyncStatus('SYNCED');
        setTimeout(() => setSyncStatus('IDLE'), 2000);
      } catch (err) {
        console.error('[LEDGER_FETCH_ERROR]', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 15000); // Institutional 15s sync
    return () => clearInterval(interval);
  }, []);

  const isSupernova = stats?.supernovaDetected;

  return (
    <div className={`flex-1 flex flex-col relative bg-black font-mono text-[10px] uppercase overflow-hidden transition-all duration-1000 ${isSupernova ? 'shadow-[inset_0_0_100px_rgba(244,63,94,0.15)]' : ''}`}>
      
      {/* ── COSMIC BACKGROUND LAYER ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <img 
          src="/patron-cosmico-4k.png" 
          alt="Cosmic Grid" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay scale-110 animate-[pulse_10s_infinite]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      </div>

      {/* ── SUPERNOVA ALERT BANNER ── */}
      <AnimatePresence>
        {isSupernova && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-rose-600 text-white font-black text-[9px] py-1 px-6 flex items-center justify-between tracking-[0.5em] z-50 shadow-[0_4px_20px_rgba(225,29,72,0.4)]"
          >
            <div className="flex items-center gap-4">
              <span className="animate-pulse">⚠️ [CRITICAL] SUPERNOVA_BREACH_DETECTED</span>
              <span className="opacity-50">LARGE_SCALE_LIQUIDITY_DRAIN_IN_PROGRESS</span>
            </div>
            <div className="flex items-center gap-2">
               <Skull size={10} className="animate-bounce" />
               <span>SYSTEM_ALERT: {stats?.hazardLevel}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TELEMETRY HUD ── */}
      <div className={`h-6 transition-colors duration-500 px-6 flex items-center justify-between text-[8px] font-black tracking-[0.4em] z-10 border-b ${isSupernova ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
             <Cpu size={10} />
             <span>REACTION_TIME: {stats?.readLatencyMs || '0.00'}MS</span>
          </div>
          <div className="flex items-center gap-2">
             <Zap size={10} />
             <span>THROUGHPUT: {stats?.whaleThroughput || 0} WHS/HR</span>
          </div>
          <div className="flex items-center gap-2 border-l border-white/10 pl-6">
             <span>HAZARD_LVL: <span className={isSupernova ? 'text-rose-500 underline' : ''}>{stats?.hazardLevel || 'LOW'}</span></span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-white/40">
           <Waves size={10} />
           <span>SOV_MESH_1.2.0-ALFA</span>
        </div>
      </div>

      {/* ── SOV-ALPHA INSIGHT GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-white/5 border-b border-white/5 shrink-0 z-10">
         <div className="bg-black/60 backdrop-blur-xl p-6 flex flex-col gap-1 relative overflow-hidden group">
            <span className="text-[8px] font-black text-white/30 tracking-[0.4em]">24H_WHALE_VOLUME</span>
            <span className="text-2xl font-black text-white translate-y-1">
               ${((stats?.total24hVolume || 0) / 1e6).toFixed(1)}M
            </span>
            <div className="h-1 bg-white/5 mt-4 overflow-hidden rounded-full">
               <motion.div 
                 initial={{ x: "-100%" }}
                 animate={{ x: "0%" }}
                 transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                 className={`h-full w-full ${isSupernova ? 'bg-rose-500' : 'bg-emerald-500/40'}`} 
               />
            </div>
         </div>

         <div className={`backdrop-blur-xl p-6 flex flex-col gap-1 relative overflow-hidden group transition-colors duration-1000 ${isSupernova ? 'bg-rose-500/10' : 'bg-black/60'}`}>
            <div className="absolute top-0 right-0 p-3 opacity-10">
               <Zap size={40} className={isSupernova ? 'text-rose-500' : 'text-emerald-500'} />
            </div>
            <span className={`text-[8px] font-black tracking-[0.4em] ${isSupernova ? 'text-rose-500' : 'text-white/30'}`}>LIQUIDITY_BREACH_DELTA</span>
            <span className={`text-2xl font-black ${isSupernova ? 'text-rose-500' : 'text-white'}`}>
               -${((stats?.liquidityBreachDelta || 0) / 1e6).toFixed(1)}M
            </span>
            <span className="text-[8px] text-white/20 font-black mt-2 tracking-widest uppercase italic">SUPPLY_SHOCK_VIBRATION</span>
         </div>

         <div className="bg-black/60 backdrop-blur-xl p-6 flex flex-col gap-1 relative overflow-hidden group">
            <span className="text-[8px] font-black text-white/30 tracking-[0.4em]">DOMINANT_INST_ENTITY</span>
            <span className="text-2xl font-black text-white truncate">
               {stats?.topEntities[0]?.name || 'SCANNING...'}
            </span>
            <span className="text-[8px] text-white/20 font-black mt-2 tracking-widest">MAJOR_RECORD_DENSITY</span>
         </div>

         <div className={`${isSupernova ? 'bg-rose-500/5 shadow-[inset_0_0_40px_rgba(244,63,94,0.05)]' : 'bg-emerald-500/5'} backdrop-blur-3xl p-6 flex flex-col gap-1 relative overflow-hidden group border-l border-white/5`}>
            <span className={`text-[8px] font-black tracking-[0.4em] ${isSupernova ? 'text-rose-500' : 'text-emerald-500'}`}>SOV_ALPHA_SCORE</span>
            <div className="flex items-baseline gap-2">
               <span className="text-4xl font-black text-white/90">{stats?.alphaScore || 0}</span>
               <span className="text-xs text-white/20">/100</span>
            </div>
            <div className="mt-2 text-[7px] text-white/10 uppercase tracking-[0.2em] leading-relaxed italic">
               Network pressure weight. High delta indicates imminent supply crunch.
            </div>
         </div>
      </div>

      {/* ── COLUMN HEADERS ── */}
      <div className="grid grid-cols-[160px_100px_1fr_120px_80px_40px] gap-4 px-8 py-3 bg-white/[0.02] border-b border-white/10 text-[9px] font-black text-white/40 tracking-[0.3em] shrink-0 z-10">
         <span>[SOV-ID]</span>
         <span>TIMESTAMP</span>
         <span>ENTITY_ATTRIBUTION</span>
         <span className="text-right">NET_VAL_USD</span>
         <span className="text-center">STATION</span>
         <span className="text-center">PROOF</span>
      </div>

      {/* ── LEDGER FLOW (Supernova Ready) ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar z-10">
        <AnimatePresence mode="popLayout">
          {entries.map((entry, idx) => {
            const isEntrySupernova = parseFloat(entry.usdValue) >= 500_000_000;
            return (
              <motion.div
                key={entry.immutableId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03, duration: 0.4 }}
                className={`grid grid-cols-[160px_100px_1fr_120px_80px_40px] gap-4 px-8 py-4 border-b border-white/[0.03] hover:bg-white/[0.05] transition-all items-center group relative ${isEntrySupernova ? 'bg-rose-600/10' : ''}`}
              >
                {isEntrySupernova && (
                   <motion.div 
                     animate={{ opacity: [0.3, 0.6, 0.3] }}
                     transition={{ duration: 2, repeat: Infinity }}
                     className="absolute inset-0 bg-rose-600/5 pointer-events-none" 
                   />
                )}
                {entry.type === 'CEX_OUTFLOW' && (
                   <div className={`absolute inset-y-0 left-0 w-1 ${isEntrySupernova ? 'bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.8)]' : 'bg-rose-500/40'}`} />
                )}
                
                <span className={`font-bold tracking-tighter truncate ${isEntrySupernova ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {entry.immutableId.split('-')[0]}
                </span>
                
                <span className="text-white/30 text-[9px]">
                  {new Date(entry.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>

                <div className="flex items-center gap-3">
                  <span className={`text-[11px] font-black tracking-widest ${isEntrySupernova ? "text-rose-500" : "text-white"}`}>
                    {entry.entityName}
                  </span>
                  {isEntrySupernova && (
                    <span className="px-2 py-0.5 bg-rose-500 text-white text-[7px] font-black rounded-[2px] shadow-[0_0_15px_rgba(244,63,94,0.6)] animate-pulse">SUPERNOVA</span>
                  )}
                  {entry.institutional && !isEntrySupernova && (
                    <span className="px-2 py-0.5 bg-white text-black text-[7px] font-black rounded-[2px]">INST</span>
                  )}
                </div>

                <div className="text-right flex flex-col items-end">
                  <span className={`text-[12px] font-black tracking-tighter ${isEntrySupernova ? 'text-rose-500' : 'text-white'}`}>
                    ${(parseFloat(entry.usdValue) / 1e6).toFixed(1)}M
                  </span>
                  <span className="text-white/10 text-[8px] font-bold">
                    {entry.valueBTC.toFixed(3)} BTC
                  </span>
                </div>

                <span className="text-center font-black text-blue-400 text-[9px] tracking-widest opacity-60">
                   {entry.chain}
                </span>

                <a
                  href={`https://mempool.space/tx/${entry.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-6 h-6 rounded border border-white/5 bg-white/[0.02] text-white/20 hover:text-white transition-all"
                >
                  <Database size={10} />
                </a>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] text-white/10 gap-4">
             <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
             <span className="text-[8px] font-bold tracking-[0.5em]">Synchronizing Permanent Historian...</span>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes wave {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
