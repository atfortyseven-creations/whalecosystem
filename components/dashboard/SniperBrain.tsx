"use client";

import React, { useState } from 'react';
import { useSniperStore } from '@/store/useSniperStore';
import { Filter, Database, TrendingUp, Settings2, History } from 'lucide-react';

export default function SniperBrain() {
  const filters = useSniperStore((state) => state.filters);
  const updateFilters = useSniperStore((state) => state.updateFilters);
  const executedTrades = useSniperStore((state) => state.executedTrades);

  // Local state for input handling before pushing to global Zustand store 
  // (Prevents re-renders on every keystroke in the global store)
  const [localVol, setLocalVol] = useState(filters.minVolumeUsd.toString());

  const handleVolumeSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const val = parseInt(localVol.replace(/,/g, ''), 10);
      if (!isNaN(val) && val >= 0) {
        updateFilters({ minVolumeUsd: val });
        setLocalVol(val.toString());
      }
    }
  };

  const toggleAsset = (asset: string) => {
    const current = filters.targetAssets;
    if (current.includes(asset)) {
      if (current.length > 1) updateFilters({ targetAssets: current.filter(a => a !== asset) });
    } else {
      updateFilters({ targetAssets: [...current, asset] });
    }
  };

  return (
    <div className="absolute inset-0 p-4 lg:p-6 flex flex-col gap-6 font-sans text-[#050505] overflow-y-auto custom-scrollbar bg-[#FAF9F6]">
      
      {/* ── MIN VOLUME THRESHOLD ── */}
      <div className="space-y-2">
        <label className="text-[9px] uppercase font-bold text-[#888888] tracking-[0.2em] flex items-center gap-2">
          <Filter size={12} /> Minimum USD Volume Threshold
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#050505]/40 font-mono text-sm">$</span>
          <input 
            type="text"
            value={localVol}
            onChange={(e) => setLocalVol(e.target.value)}
            onKeyDown={handleVolumeSubmit}
            onBlur={() => updateFilters({ minVolumeUsd: parseInt(localVol.replace(/,/g, '') || '0', 10) })}
            className="w-full bg-white border border-[#E5E5E5] rounded-lg py-3 pl-8 pr-4 text-base font-bold focus:outline-none focus:border-[#050505] transition-colors shadow-sm font-mono text-[#050505]"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-[#A0A0A0] uppercase font-bold">Press Enter</div>
        </div>
      </div>

      {/* ── TARGET ASSETS ── */}
      <div className="space-y-2 mt-2">
         <label className="text-[9px] uppercase font-bold tracking-[0.2em] flex items-center gap-2 text-[#888888]">
          <Database size={12} /> Tactical Asset Pool
        </label>
        <div className="flex flex-wrap gap-2">
          {['BTC', 'ETH', 'SOL', 'USDT', 'USDC'].map((asset) => {
            const isActive = filters.targetAssets.includes(asset);
            return (
              <button
                key={asset}
                onClick={() => toggleAsset(asset)}
                className={`px-4 py-2 text-[10px] font-bold rounded-lg border transition-all ${
                  isActive 
                    ? 'bg-[#050505] border-[#050505] text-white shadow-sm' 
                    : 'bg-white text-[#888888] border-[#E5E5E5] hover:border-[#050505]/30 hover:text-[#050505]'
                }`}
              >
                {asset}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-[#E5E5E5] my-2" />

      {/* ── EXECUTION PARAMETERS ── */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[9px] uppercase font-bold tracking-[0.2em] flex items-center gap-2 text-[#888888]">
            <TrendingUp size={12} /> Slippage Tolerance
          </label>
          <div className="relative">
            <input 
              type="number"
              value={filters.slippageTolerance}
              onChange={(e) => updateFilters({ slippageTolerance: parseFloat(e.target.value) || 0.5 })}
              className="w-full bg-white border border-[#E5E5E5] rounded-lg py-3 px-3 text-sm font-bold focus:outline-none focus:border-[#050505] transition-colors shadow-sm font-mono text-[#050505]"
              step="0.1"
              min="0.1"
              max="5.0"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#050505]/40 font-bold">%</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[9px] uppercase font-bold tracking-[0.2em] flex items-center gap-2 text-[#888888]">
            <Settings2 size={12} /> Max Gas / GWEI
          </label>
          <div className="relative">
            <input 
              type="number"
              value={filters.gasLimitGwei}
              onChange={(e) => updateFilters({ gasLimitGwei: parseInt(e.target.value, 10) || 50 })}
              className="w-full bg-white border border-[#E5E5E5] rounded-lg py-3 px-3 text-sm font-bold focus:outline-none focus:border-[#050505] transition-colors shadow-sm font-mono text-[#050505]"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-[#050505]/40 font-bold">GWEI</span>
          </div>
        </div>
      </div>

      <div className="h-px bg-[#E5E5E5] my-2" />

      {/* ── TACTICAL HISTORY ── */}
      <div className="flex-1 min-h-[100px] flex flex-col">
        <label className="text-[9px] uppercase font-bold tracking-[0.2em] flex items-center gap-2 text-[#888888] mb-3">
          <History size={12} /> Post-Execution Ledger
        </label>
        <div className="flex-1 bg-white border border-[#E5E5E5] rounded-xl p-3 overflow-y-auto custom-scrollbar space-y-2 relative shadow-sm">
          
          {executedTrades.length === 0 ? (
            <div className="h-full flex items-center justify-center text-[10px] uppercase font-bold tracking-widest text-[#888888] text-center p-4">
              NO SETTLEMENTS RECORDED IN THIS SESSION.
            </div>
          ) : (
            executedTrades.map((trade, idx) => (
              <div key={`${trade.hash}-${idx}`} className="flex items-center justify-between text-[11px] bg-[#FAF9F6] px-3 py-2.5 rounded-lg border border-[#E5E5E5] group hover:border-[#050505]/20 transition-all font-mono">
                 <span className="text-[#050505] font-bold truncate max-w-[120px]">{trade.hash}</span>
                 <span className="text-[#888888]">[{new Date(trade.timestamp).toISOString().split('T')[1].slice(0,-1)}]</span>
                 <span className="text-[#050505] font-bold tracking-tight">${trade.priceAtExecution.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
