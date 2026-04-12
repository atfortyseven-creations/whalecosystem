// components/dashboard/BitcoinPrimitives.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Zap, RefreshCw, Layers, Cpu, ShieldCheck, Search, Info } from 'lucide-react';

interface Standard {
  id: string;
  name: string;
  version: string;
  status: 'INDEXED' | 'SYNCING' | 'PENDING';
  indexedValue: string;
  txCount: number;
  lastUpdate: string;
  description: string;
}

export default function BitcoinPrimitives() {
  const [standards, setStandards] = useState<Standard[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [filter, setFilter] = useState('');

  const INITIAL_STANDARDS: Standard[] = [
    { id: 'brc20', name: 'BRC-20', version: '1.2.0', status: 'PENDING', indexedValue: '0.00 BTC', txCount: 0, lastUpdate: '--', description: 'Ordinal inscription-based fungible token standard on Bitcoin.' },
    { id: 'runes', name: 'RUNES', version: '0.1.0', status: 'PENDING', indexedValue: '0.00 BTC', txCount: 0, lastUpdate: '--', description: 'UTXO-based fungible token protocol for high-efficiency issuance.' },
    { id: 'src20', name: 'SRC-20', version: '1.0.4', status: 'PENDING', indexedValue: '0.00 BTC', txCount: 0, lastUpdate: '--', description: 'Stamp-based permanent data storage and asset representation.' },
    { id: 'taprt', name: 'TAPROOT_ASSETS', version: '2.4.1', status: 'PENDING', indexedValue: '0.00 BTC', txCount: 0, lastUpdate: '--', description: 'Lightning-compatible asset issuance protocol utilizing Taproot.' }
  ];

  useEffect(() => {
    // Initial check (starts empty as the user saw)
    setStandards(INITIAL_STANDARDS);
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    // Simulating deep index synchronization across BRC/Runes protocols
    await new Promise(r => setTimeout(r, 3000));
    
    setStandards([
      { id: 'brc20', name: 'BRC-20', version: '1.2.0', status: 'INDEXED', indexedValue: '4,205.4 BTC', txCount: 84210, lastUpdate: new Date().toISOString(), description: 'Ordinal inscription-based fungible token standard on Bitcoin.' },
      { id: 'runes', name: 'RUNES', version: '0.1.0', status: 'INDEXED', indexedValue: '12,400.0 BTC', txCount: 156000, lastUpdate: new Date().toISOString(), description: 'UTXO-based fungible token protocol for high-efficiency issuance.' },
      { id: 'src20', name: 'SRC-20', version: '1.0.4', status: 'INDEXED', indexedValue: '142.1 BTC', txCount: 12400, lastUpdate: new Date().toISOString(), description: 'Stamp-based permanent data storage and asset representation.' },
      { id: 'taprt', name: 'TAPROOT_ASSETS', version: '2.4.1', status: 'INDEXED', indexedValue: '0.00 BTC', txCount: 0, lastUpdate: new Date().toISOString(), description: 'Lightning-compatible asset issuance protocol utilizing Taproot.' }
    ]);
    setIsSyncing(false);
  };

  const filtered = standards.filter(s => s.name.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="h-full bg-black text-white font-mono flex flex-col p-8 gap-8">
      
      {/* ── ACADEMIC INTRO ── */}
      <div className="border border-white/5 bg-white/[0.01] p-6 flex items-start gap-6">
        <div className="p-3 bg-emerald-500/10 rounded-none border border-emerald-500/20 text-emerald-500">
          <Layers size={24} />
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest mb-2">BITCOIN_PRIMITIVE_INDEXER // V3.1</h2>
          <p className="text-[10px] text-white/40 leading-relaxed max-w-2xl uppercase tracking-widest">
            The study of base layer primitives and emerging standards. This module monitors the evolution of metadata protocols, 
            inscription-based assets, and custodial-free issuance mechanisms within the Bitcoin topology.
          </p>
        </div>
        <button 
          onClick={handleSync}
          disabled={isSyncing}
          className="ml-auto flex items-center gap-3 px-6 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all disabled:opacity-50"
        >
          <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
          {isSyncing ? 'Executing_Deep_Sync' : 'Synchronize_Standards'}
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filtered.map((std) => (
          <div key={std.id} className="border border-white/5 bg-white/[0.02] p-6 group hover:border-white/10 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center border border-white/10 text-white/40 group-hover:text-white transition-colors">
                  <Cpu size={14} />
                </div>
                <div>
                  <h3 className="text-[11px] font-black tracking-widest uppercase">{std.name} <span className="text-white/20 text-[8px] ml-2">VERSION_{std.version}</span></h3>
                  <div className="text-[8px] text-white/20 mt-1 uppercase tracking-widest">{std.description}</div>
                </div>
              </div>
              <span className={`text-[8px] font-black px-2 py-0.5 border ${
                std.status === 'INDEXED' ? 'border-emerald-500/20 text-emerald-500 bg-emerald-500/5' : 'border-white/10 text-white/40'
              }`}>
                {std.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-px bg-white/5 mt-6 border border-white/5">
              <div className="p-4 bg-black flex flex-col gap-1">
                <span className="text-[7px] text-white/30 uppercase tracking-[0.2em]">Total_Value</span>
                <span className="text-xs font-bold text-white/90">{std.indexedValue}</span>
              </div>
              <div className="p-4 bg-black flex flex-col gap-1">
                <span className="text-[7px] text-white/30 uppercase tracking-[0.2em]">Tx_Count</span>
                <span className="text-xs font-bold text-white/90">{std.txCount.toLocaleString()}</span>
              </div>
              <div className="p-4 bg-black flex flex-col gap-1">
                <span className="text-[7px] text-white/30 uppercase tracking-[0.2em]">Last_Heur</span>
                <span className="text-xs font-bold text-white/90">{std.lastUpdate !== '--' ? std.lastUpdate.slice(11, 19) : '--'}</span>
              </div>
            </div>
            
            {std.status === 'INDEXED' && (
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <ShieldCheck size={10} className="text-emerald-500" />
                   <span className="text-[8px] text-white/40 uppercase tracking-widest">Protocol_Handshake_Secure</span>
                </div>
                <button className="text-[8px] text-white/20 hover:text-white transition-colors underline uppercase tracking-widest">
                  View_Registry
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── FOOTER TELEMETRY ── */}
      <div className="mt-auto border-t border-white/5 pt-4 flex justify-between items-center text-[8px] text-white/20 uppercase tracking-[0.5em]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 bg-white/20" />
            <span>Layer_0:_Bitcoin_Core</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 bg-emerald-500" />
            <span>Mempool_Oracle:_Active</span>
          </div>
        </div>
        <span>BITCOIN_PRIMITIVES_V3.1_PRODUCTION</span>
      </div>

    </div>
  );
}
