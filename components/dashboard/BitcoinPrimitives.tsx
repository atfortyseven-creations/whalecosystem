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
    <div className="h-full flex flex-col p-6 gap-6 overflow-y-auto">

      {/* ── HEADER ── */}
      <div className="flex items-center justify-between gap-4 p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <Layers size={22} style={{ color: '#00F2EA' }} />
          </div>
          <div>
            <h2 className="text-[13px] font-black uppercase tracking-[0.15em] text-white mb-1">Bitcoin Network Primitives</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed max-w-2xl" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Monitoring base layer primitives, inscription-based assets, and custodial-free issuance mechanisms.
            </p>
          </div>
        </div>
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="flex items-center gap-2.5 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 shrink-0 text-black"
          style={{ background: '#fff', boxShadow: '0 4px 20px rgba(255,255,255,0.08)' }}
        >
          <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
          {isSyncing ? 'Executing Sync' : 'Re-index Standards'}
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((std) => (
          <div key={std.id} className="rounded-2xl p-6 group hover:scale-[1.01] transition-all cursor-pointer" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-xl transition-all" style={{ background: 'rgba(0,242,234,0.08)', border: '1px solid rgba(0,242,234,0.15)' }}>
                  <Cpu size={18} style={{ color: '#00F2EA' }} />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-tight uppercase text-white">{std.name} <span className="text-[9px] ml-2 tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>REV_{std.version}</span></h3>
                  <div className="text-[9px] mt-0.5 uppercase tracking-widest font-bold leading-tight max-w-[200px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{std.description}</div>
                </div>
              </div>
              <span className={`text-[9px] font-black px-3 py-1 rounded-full border ${
                std.status === 'INDEXED'
                  ? 'border-[#00C076]/25 text-[#00C076]'
                  : 'text-white/25 border-white/10'
              }`} style={{ background: std.status === 'INDEXED' ? 'rgba(0,192,118,0.1)' : 'rgba(255,255,255,0.04)' }}>
                {std.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-px rounded-xl overflow-hidden mt-4" style={{ background: 'rgba(255,255,255,0.04)' }}>
              {[
                { label: 'Valuation', value: std.indexedValue },
                { label: 'Entropy', value: std.txCount.toLocaleString() },
                { label: 'Last Sync', value: std.lastUpdate !== '--' ? std.lastUpdate.slice(11, 19) : '--' },
              ].map(item => (
                <div key={item.label} className="p-4 flex flex-col gap-1" style={{ background: 'rgba(13,16,20,0.8)' }}>
                  <span className="text-[8px] uppercase tracking-[0.2em] font-black" style={{ color: 'rgba(255,255,255,0.25)' }}>{item.label}</span>
                  <span className="text-[13px] font-black font-mono text-white">{item.value}</span>
                </div>
              ))}
            </div>

            {std.status === 'INDEXED' && (
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={12} style={{ color: '#00C076' }} />
                  <span className="text-[9px] uppercase tracking-widest font-black" style={{ color: 'rgba(255,255,255,0.25)' }}>PRIMITIVE_HANDSHAKE_OK</span>
                </div>
                <button className="text-[9px] font-black uppercase tracking-widest transition-colors" style={{ color: '#00F2EA' }}>
                  EXPLORE REGISTRY &gt;
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── FOOTER ── */}
      <div className="pt-4 flex justify-between items-center text-[9px] uppercase tracking-[0.3em] font-bold" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.2)' }}>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
            <span>L0: BTC_MAINNET</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00C076' }} />
            <span>ORACLE_STREAMS: ACTIVE</span>
          </div>
        </div>
        <span>BITCOIN_PRIMITIVES_V3.1</span>
      </div>
    </div>
  );
}
