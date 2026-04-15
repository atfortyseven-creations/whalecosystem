// components/dashboard/InstitutionalLedger.tsx
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Shield, ExternalLink, Hash, Clock, Landmark, Activity, Zap, Cpu, Search, RefreshCw, BarChart3 } from 'lucide-react';

interface UTXOEntry {
  id: string;
  txid: string;
  vout: number;
  valueBTC: number;
  usdValue: number;
  timestamp: string;
  confirmations: number;
  entityName: string;
  category: 'INSTITUTIONAL' | 'WHALE' | 'EXCHANGE' | 'MINER';
  status: 'UNSPENT' | 'SPENT' | 'PENDING';
}

interface UTXOStats {
  totalMonitored: number;
  whaleConcentrationPct: number;
  dormantSupplyBTC: number;
  liquidityDelta24h: number;
  lastBlockIndex: number;
  activeObservers: number;
}

export default function InstitutionalLedger() {
  const [entries, setEntries] = useState<UTXOEntry[]>([]);
  const [stats, setStats] = useState<UTXOStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/scanner/btc/utxos');
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries || []);
        setStats(data.stats || null);
      } else {
        setEntries([]);
      }
    } catch (err) {
      setEntries([]);
    } finally {
      setLoading(false);
      setTimeout(() => setIsSyncing(false), 2000);
    }
  };

  const filteredEntries = useMemo(() => {
    return entries.filter(e => 
      e.entityName.toLowerCase().includes(filter.toLowerCase()) || 
      e.txid.toLowerCase().includes(filter.toLowerCase())
    );
  }, [entries, filter]);

  return (
    <div className="h-full flex flex-col bg-[#000000] text-white font-mono selection:bg-white selection:text-black">
      
      {/* ── ACADEMIC HEADER ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-8 border-b border-white/5 bg-white/[0.01]">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] text-white/20 uppercase tracking-[0.3em]">Concentration_Index</span>
          <span className="text-xl font-bold">{stats?.whaleConcentrationPct || 0}%</span>
          <div className="h-0.5 bg-white/5 mt-1 overflow-hidden">
            <motion.div 
              className="h-full bg-emerald-500" 
              initial={{ width: 0 }} 
              animate={{ width: `${stats?.whaleConcentrationPct || 0}%` }} 
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[9px] text-white/20 uppercase tracking-[0.3em]">Dormant_Supply</span>
          <span className="text-xl font-bold">{stats?.dormantSupplyBTC.toLocaleString() || 0} BTC</span>
          <span className="text-[8px] text-emerald-500/50">STABLE_EQUILIBRIUM</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[9px] text-white/20 uppercase tracking-[0.3em]">Liquidity_Delta_24H</span>
          <span className={`text-xl font-bold ${stats && stats.liquidityDelta24h < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
            {stats?.liquidityDelta24h.toLocaleString() || 0} BTC
          </span>
          <span className="text-[8px] text-white/10 uppercase">Net Flow Observation</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[9px] text-white/20 uppercase tracking-[0.3em]">Observer_Count</span>
          <span className="text-xl font-bold">{stats?.activeObservers || 0} Nodes</span>
          <span className="text-[8px] text-white/10 uppercase">Telemetry Active</span>
        </div>
      </div>

      {/* ── TOOLBAR ── */}
      <div className="px-8 py-4 border-b border-white/5 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={12} />
          <input 
            type="text" 
            placeholder="FILTER_BY_ENTITY_OR_TXID..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-none px-10 py-2 text-[10px] outline-none focus:border-white/20 transition-all uppercase tracking-widest"
          />
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={fetchData}
            className="flex items-center gap-2 text-[9px] text-white/40 hover:text-white transition-colors uppercase tracking-widest"
          >
            <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
            {isSyncing ? 'Synchronizing...' : 'Force_Sync'}
          </button>
          <div className="h-4 w-[1px] bg-white/10" />
          <div className="flex items-center gap-2 text-[9px] text-emerald-500/80">
            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
            LIVE_TELEMETRY
          </div>
        </div>
      </div>

      {/* ── LEDGER VIEW ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 relative">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-black z-10 border-b border-white/10">
            <tr className="text-[9px] text-white/20 uppercase tracking-[0.3em] text-left">
              <th className="px-8 py-4 font-normal">[TX_ATTRIBUTION]</th>
              <th className="px-4 py-4 font-normal">TIMESTAMP</th>
              <th className="px-4 py-4 font-normal">ENTITY</th>
              <th className="px-4 py-4 font-normal text-right">VALUE_BTC</th>
              <th className="px-4 py-4 font-normal text-right">USD_EQUIVALENT</th>
              <th className="px-8 py-4 font-normal text-center">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            <AnimatePresence>
              {filteredEntries.map((entry, idx) => (
                <motion.tr 
                  key={entry.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-white/[0.02] group transition-colors"
                >
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <Hash size={10} className="text-white/20" />
                      <span className="text-[10px] text-white/60 font-mono tracking-tighter">
                        {entry.txid.slice(0, 16)}...{entry.txid.slice(-8)}
                      </span>
                      <a href={`https://mempool.space/tx/${entry.txid}`} target="_blank" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink size={8} className="text-emerald-500" />
                      </a>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-white/40 text-[10px]">
                    {new Date(entry.timestamp).toLocaleTimeString([], { hour12: false })}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-bold text-white/90">{entry.entityName}</span>
                      <span className="text-[8px] text-white/20 tracking-widest">{entry.category}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-[11px] font-bold text-white font-mono">{entry.valueBTC.toLocaleString()} BTC</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-[11px] font-bold text-emerald-500 font-mono">${(entry.usdValue / 1e6).toFixed(2)}M</span>
                  </td>
                  <td className="px-8 py-4 text-center">
                    <span className={`text-[8px] font-black px-2 py-0.5 border ${
                      entry.status === 'UNSPENT' ? 'border-emerald-500/20 text-emerald-500 bg-emerald-500/5' : 'border-white/10 text-white/40'
                    }`}>
                      {entry.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        {filteredEntries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-white/10 uppercase tracking-[0.5em] text-[10px]">
            No records indexed under current filters
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div className="px-8 py-3 border-t border-white/5 bg-white/[0.01] flex justify-between items-center z-10">
        <div className="flex items-center gap-6 text-[8px] text-white/30 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 bg-emerald-500" />
            <span>Monitored:_842k_UTXOs</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 bg-blue-500" />
            <span>Network:_Bitcoin_Mainnet</span>
          </div>
        </div>
        <div className="text-[8px] text-white/20 uppercase tracking-[0.4em]">
          Whale_Telemetry_Layer_v3.1_Active
        </div>
      </div>
    </div>
  );
}
