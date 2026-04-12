// components/dashboard/InstitutionalLedger.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Shield, ExternalLink, Hash, Clock, Landmark, Activity } from 'lucide-react';

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
}

interface Stats {
  total24hVolume: number;
  total24hBtc: number;
  transactionCount: number;
  institutionalRatio: number;
  sentiment: string;
  topEntities: { name: string; count: number }[];
  alphaScore: number;
}

export default function InstitutionalLedger() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [totalIndexed, setTotalIndexed] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ledgerRes, statsRes] = await Promise.all([
          fetch('/api/institutional/ledger'),
          fetch('/api/institutional/stats')
        ]);
        
        const ledgerData = await ledgerRes.json();
        const statsData = await statsRes.json();
        
        setEntries(ledgerData.entries || []);
        setTotalIndexed(ledgerData.totalIndexed || 0);
        setStats(statsData);
      } catch (err) {
        console.error('[LEDGER_FETCH_ERROR]', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // 1 min sync
    return () => clearInterval(interval);
  }, []);

  if (loading && entries.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-white/20 gap-4">
        <Activity size={32} className="animate-pulse" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Synchronizing Permanent Historian...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-black/40 font-mono text-[10px] uppercase overflow-hidden">
      {/* ── SOV-ALPHA INSIGHT GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-white/5 border-b border-white/5 shrink-0">
         <div className="bg-black/60 p-5 flex flex-col gap-1 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
               <Activity size={40} className="text-emerald-500" />
            </div>
            <span className="text-[8px] font-black text-white/30 tracking-[0.3em]">24H_INSTITUTIONAL_FLOW</span>
            <span className="text-xl font-black text-white">
               ${((stats?.total24hVolume || 0) / 1e6).toFixed(1)}M
            </span>
            <div className="flex items-center gap-2 mt-2">
               <div className="h-1 flex-1 bg-white/5 overflow-hidden">
                  <motion.div 
                    initial={{ x: "-100%" }}
                    animate={{ x: "0%" }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="h-full w-full bg-emerald-500/40" 
                  />
               </div>
               <span className="text-[8px] text-emerald-500/60 font-black">ACTIVE</span>
            </div>
         </div>

         <div className="bg-black/60 p-5 flex flex-col gap-1 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-10">
               <Shield size={40} className="text-amber-500" />
            </div>
            <span className="text-[8px] font-black text-white/30 tracking-[0.3em]">WHALE_SENTIMENT</span>
            <span className="text-[14px] font-black text-amber-500 truncate" title={stats?.sentiment}>
               {stats?.sentiment || 'INITIALIZING'}
            </span>
            <span className="text-[8px] text-white/20 font-black mt-2 tracking-widest">
               RATIO: {( (stats?.institutionalRatio || 0) * 100).toFixed(1)}% INST.
            </span>
         </div>

         <div className="bg-black/60 p-5 flex flex-col gap-1 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-10">
               <Landmark size={40} className="text-blue-500" />
            </div>
            <span className="text-[8px] font-black text-white/30 tracking-[0.3em]">DOMINANT_ENTITY_24H</span>
            <span className="text-xl font-black text-white">
               {stats?.topEntities[0]?.name || 'SCANNING...'}
            </span>
            <span className="text-[8px] text-white/20 font-black mt-2 tracking-widest">
               {stats?.topEntities[0]?.count || 0} MAJOR_TXS
            </span>
         </div>

         <div className="bg-[#0A0A0A] p-5 flex flex-col gap-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-emerald-500/[0.01] pointer-events-none" />
            <span className="text-[8px] font-black text-white/30 tracking-[0.3em]">SOV-ALPHA_SCORE</span>
            <div className="flex items-baseline gap-2">
               <span className="text-3xl font-black text-white/90">{stats?.alphaScore || 0}</span>
               <span className="text-xs text-white/20">/100</span>
            </div>
            <div className="mt-2 text-[7px] text-white/10 uppercase tracking-[0.2em] leading-relaxed">
               Proprietary weight of volume, frequency, and institutional correlation depth.
            </div>
         </div>
      </div>

      {/* ── COLUMN HEADERS ── */}
      <div className="grid grid-cols-[160px_100px_1fr_120px_80px_40px] gap-4 px-6 py-2 border-b border-white/5 bg-white/[0.01] text-white/30 font-black tracking-widest shrink-0">
         <span>[SOVEREIGN-ID]</span>
         <span>TIMESTAMP</span>
         <span>ENTITY_ATTRIBUTION</span>
         <span className="text-right">NET_VALUE_USD</span>
         <span>STATION</span>
         <span className="text-center">PROOF</span>
      </div>

      {/* ── LEDGER FLOW ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {entries.map((entry) => (
            <motion.div
              key={entry.immutableId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="grid grid-cols-[160px_100px_1fr_120px_80px_40px] gap-4 px-6 py-3 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors items-center group"
            >
              <span className="text-emerald-500 font-black tracking-wider truncate" title={entry.immutableId}>
                {entry.immutableId}
              </span>
              
              <span className="text-white/40">
                {new Date(entry.timestamp).toLocaleTimeString([], { hour12: false })}
              </span>

              <div className="flex items-center gap-3">
                <span className={entry.institutional ? "text-amber-400 font-bold" : "text-white/60"}>
                  {entry.entityName}
                </span>
                {entry.institutional && (
                  <span className="px-1.5 py-0.5 bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[8px] rounded-sm">INSTITUTIONAL</span>
                )}
              </div>

              <div className="text-right flex flex-col items-end gap-0.5">
                <span className="text-white font-black tracking-tight text-[11px]">
                  ${(parseFloat(entry.usdValue) / 1e6).toFixed(1)}M
                </span>
                <span className="text-white/20 text-[8px] tracking-widest">
                  {entry.valueBTC.toFixed(2)} BTC
                </span>
              </div>

              <span className="text-blue-400 font-black tracking-widest">{entry.chain}</span>

              <a
                href={entry.chain === 'BTC' ? `https://blockchair.com/bitcoin/transaction/${entry.transactionHash}` : `https://etherscan.io/tx/${entry.transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-6 h-6 rounded border border-white/5 bg-white/[0.03] text-white/20 hover:text-emerald-400 hover:border-emerald-400/20 transition-all"
              >
                <Hash size={10} />
              </a>
            </motion.div>
          ))}
        </AnimatePresence>

        {entries.length === 0 && !loading && (
          <div className="p-20 text-center space-y-4">
             <div className="text-white/10 uppercase tracking-[0.5em] font-black italic">No records detected in latest block generation.</div>
             <p className="text-[9px] text-white/20 max-w-sm mx-auto uppercase leading-relaxed">
               The permanent historian only indexes movements exceeding $50M. Ensure the genesis node is fully synchronized with the global mempool.
             </p>
          </div>
        )}
      </div>

      {/* ── FOOTER STATUS ── */}
      <div className="px-6 py-2 border-t border-white/5 bg-black/60 flex items-center justify-between text-[9px] font-bold text-white/20 tracking-[0.2em]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
             <span>HISTORIAN_CLIENT: ACTIVE</span>
          </div>
          <span>SYNC_LATENCY: 1.2S</span>
        </div>
        <div className="flex items-center gap-2">
           <Database size={10} />
           <span>SOVEREIGN_MESH_DB_L2</span>
        </div>
      </div>
    </div>
  );
}
