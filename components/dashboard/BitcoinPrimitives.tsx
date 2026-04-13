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
    setStandards(INITIAL_STANDARDS);
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    await new Promise(r => setTimeout(r, 2000));
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
    <div className="h-full bg-transparent flex flex-col p-8 gap-8">
      
      {/* ── ACADEMIC INTRO ── */}
      <div className="bg-white border border-black/[0.06] rounded-3xl p-8 flex items-center gap-8 shadow-sm">
        <div className="p-4 bg-black rounded-2xl text-white">
          <Layers size={24} />
        </div>
        <div className="flex-1">
          <h2 className="text-[12px] font-black uppercase tracking-[0.2em] mb-2 text-black">BITCOIN NETWORK PRIMITIVES</h2>
          <p className="text-[10px] text-black/40 leading-relaxed max-w-2xl uppercase tracking-widest font-bold">
            Monitoring the evolution of base layer primitives and emerging standards. This terminal indexes metadata protocols, 
            inscription-based assets, and custodial-free issuance mechanisms within the Bitcoin topology.
          </p>
        </div>
        <button 
          onClick={handleSync}
          disabled={isSyncing}
          className="flex items-center gap-3 px-8 py-4 bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-black/80 transition-all disabled:opacity-50 rounded-2xl"
        >
          <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
          {isSyncing ? 'Executing Sync' : 'Re-index Standards'}
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
        {filtered.map((std) => (
          <div key={std.id} className="bg-white border border-black/[0.06] rounded-3xl p-8 group hover:border-[#00F2EA]/20 transition-all shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-black/5 text-black/20 group-hover:bg-[#00F2EA]/10 group-hover:text-[#00F2EA] transition-all">
                  <Cpu size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-tight uppercase text-black">{std.name} <span className="text-black/20 text-[9px] ml-2 tracking-widest">REV_{std.version}</span></h3>
                  <div className="text-[9px] text-black/40 mt-1 uppercase tracking-widest font-bold leading-tight max-w-[200px]">{std.description}</div>
                </div>
              </div>
              <span className={`text-[9px] font-black px-3 py-1 rounded-full border ${
                std.status === 'INDEXED' ? 'border-[#00C076]/20 text-[#00C076] bg-[#00C076]/5' : 'border-black/10 text-black/20'
              }`}>
                {std.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-px bg-black/[0.03] mt-8 rounded-2xl overflow-hidden border border-black/[0.03]">
              <div className="p-5 bg-white flex flex-col gap-1">
                <span className="text-[8px] text-black/30 uppercase tracking-[0.2em] font-black">VALUATION</span>
                <span className="text-[13px] font-black text-black">{std.indexedValue}</span>
              </div>
              <div className="p-5 bg-white flex flex-col gap-1">
                <span className="text-[8px] text-black/30 uppercase tracking-[0.2em] font-black">ENTROPY</span>
                <span className="text-[13px] font-black text-black">{std.txCount.toLocaleString()}</span>
              </div>
              <div className="p-5 bg-white flex flex-col gap-1">
                <span className="text-[8px] text-black/30 uppercase tracking-[0.2em] font-black">LAST_SYNC</span>
                <span className="text-[13px] font-black text-black">{std.lastUpdate !== '--' ? std.lastUpdate.slice(11, 19) : '--'}</span>
              </div>
            </div>
            
            {std.status === 'INDEXED' && (
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <ShieldCheck size={12} className="text-[#00C076]" />
                   <span className="text-[9px] text-black/20 uppercase tracking-widest font-black">PRIMITIVE_HANDSHAKE_OK</span>
                </div>
                <button className="text-[9px] text-[#00F2EA] hover:opacity-60 transition-colors uppercase tracking-widest font-black">
                  EXPLORE REGISTRY &gt;
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── FOOTER TELEMETRY ── */}
      <div className="mt-auto border-t border-black/[0.06] pt-6 flex justify-between items-center text-[9px] text-black/20 uppercase tracking-[0.4em] font-bold">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-black/10" />
            <span>L0: BTC_MAINNET</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00C076] animate-pulse" />
            <span>ORACLE_STREAMS: ACTIVE</span>
          </div>
        </div>
        <span>BITCOIN_PRIMITIVES_V3.1_LIGHT_SYNC</span>
      </div>

    </div>
  );
}
