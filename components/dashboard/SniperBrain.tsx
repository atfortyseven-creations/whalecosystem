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
    <div className="flex flex-col gap-6 font-mono text-white/80">
      
      {/* ── MIN VOLUME THRESHOLD ── */}
      <div className="space-y-2">
        <label className="text-[9px] uppercase font-black text-[#e0ff00] tracking-widest flex items-center gap-2">
          <Filter size={10} /> MINIMUM USD VOLUME THRESHOLD
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">$</span>
          <input 
            type="text"
            value={localVol}
            onChange={(e) => setLocalVol(e.target.value)}
            onKeyDown={handleVolumeSubmit}
            onBlur={() => updateFilters({ minVolumeUsd: parseInt(localVol.replace(/,/g, '') || '0', 10) })}
            className="w-full bg-[#080808] border border-white/10 rounded-sm py-2 pl-7 pr-3 text-sm font-black focus:outline-none focus:border-[#e0ff00]/50 transition-colors"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] text-white/20 uppercase">Press Enter</div>
        </div>
      </div>

      {/* ── TARGET ASSETS ── */}
      <div className="space-y-2">
         <label className="text-[9px] uppercase font-black tracking-widest flex items-center gap-2 text-white/50">
          <Database size={10} /> TACTICAL ASSET POOL
        </label>
        <div className="flex flex-wrap gap-2">
          {['BTC', 'ETH', 'SOL', 'USDT', 'USDC'].map((asset) => {
            const isActive = filters.targetAssets.includes(asset);
            return (
              <button
                key={asset}
                onClick={() => toggleAsset(asset)}
                className={`px-3 py-1 text-[10px] font-bold rounded-sm border transition-all ${
                  isActive 
                    ? 'bg-[#e0ff00]/10 border-[#e0ff00]/40 text-[#e0ff00] drop-shadow-[0_0_8px_rgba(224,255,0,0.4)] ring-1 ring-[#e0ff00]/20' 
                    : 'bg-transparent text-white/40 border-white/10 hover:border-white/30 hover:text-white/80'
                }`}
              >
                {asset}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-white/5 my-2" />

      {/* ── EXECUTION PARAMETERS ── */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[9px] uppercase font-black tracking-widest flex items-center gap-2 text-white/50">
            <TrendingUp size={10} /> SLIPPAGE TOLERANCE
          </label>
          <div className="relative">
            <input 
              type="number"
              value={filters.slippageTolerance}
              onChange={(e) => updateFilters({ slippageTolerance: parseFloat(e.target.value) || 0.5 })}
              className="w-full bg-[#080808] border border-white/10 rounded-sm py-2 px-3 text-sm font-black focus:outline-none focus:border-white/30 transition-colors"
              step="0.1"
              min="0.1"
              max="5.0"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30">%</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[9px] uppercase font-black tracking-widest flex items-center gap-2 text-white/50">
            <Settings2 size={10} /> MAX GAS / GWEI
          </label>
          <div className="relative">
            <input 
              type="number"
              value={filters.gasLimitGwei}
              onChange={(e) => updateFilters({ gasLimitGwei: parseInt(e.target.value, 10) || 50 })}
              className="w-full bg-[#080808] border border-white/10 rounded-sm py-2 px-3 text-sm font-black focus:outline-none focus:border-white/30 transition-colors"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] text-white/30">GWEI</span>
          </div>
        </div>
      </div>

      <div className="h-px bg-white/5 my-2" />

      {/* ── TACTICAL HISTORY ── */}
      <div className="flex-1 min-h-[100px] flex flex-col">
        <label className="text-[9px] uppercase font-black tracking-widest flex items-center gap-2 text-[#e0ff00]/60 mb-2">
          <History size={10} /> LOCAL DEPLOYMENT HISTORY
        </label>
        <div className="flex-1 bg-[#050505] border border-white/5 rounded-sm p-3 overflow-y-auto custom-scrollbar space-y-2 relative">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#e0ff00]/5 blur-xl pointer-events-none" />
          
          {executedTrades.length === 0 ? (
            <div className="h-full flex items-center justify-center text-[9px] uppercase font-black tracking-widest text-[#e0ff00]/20">
              NO LETHAL EXECUTIONS RECORDED IN CURRENT SESSION.
            </div>
          ) : (
            executedTrades.map((trade, idx) => (
              <div key={`${trade.hash}-${idx}`} className="flex items-center justify-between text-[10px] bg-[#0c0c0c] px-3 py-2 rounded-sm border border-emerald-500/10 group hover:border-[#e0ff00]/20 transition-all">
                 <span className="text-emerald-400 group-hover:text-[#e0ff00] transition-colors font-mono truncate max-w-[120px]">{trade.hash}</span>
                 <span className="text-white/30 font-mono">[{new Date(trade.timestamp).toISOString().split('T')[1].slice(0,-1)}]</span>
                 <span className="text-white font-black font-mono tracking-tighter">${trade.priceAtExecution.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
