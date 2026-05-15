// components/dashboard/EcosystemWarRoom.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Zap, Server, ShieldCheck } from 'lucide-react';

interface EcosystemData {
  chainName: string;
  chainSymbol: string;
  totalEntities: number;
  tvl: number;
  volume24h: number;
  color: string;
}

// ── Static chain config (non-price info) ──────────────────────────────────────
const CHAIN_CONFIG: Record<string, { color: string; symbol: string }> = {
  Ethereum:  { color: '#627EEA', symbol: 'ETH'  },
  'BSC':     { color: '#F3BA2F', symbol: 'BSC'  },
  Solana:    { color: '#14F195', symbol: 'SOL'  },
  Arbitrum:  { color: '#28A0F0', symbol: 'ARB'  },
  Base:      { color: '#0052FF', symbol: 'BASE' },
  Polygon:   { color: '#8247E5', symbol: 'MATIC'},
  Avalanche: { color: '#E84142', symbol: 'AVAX' },
};

export function EcosystemWarRoom() {
  const [data, setData] = useState<EcosystemData[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    const fetchChainTvl = async () => {
      try {
        // Real: DeFiLlama public markets endpoint — no API key required
        const res = await fetch('https://api.llama.fi/v2/chains', { cache: 'no-store' });
        if (!res.ok) return;
        const chains: any[] = await res.json();
        
        const TARGET_CHAINS = Object.keys(CHAIN_CONFIG);
        const filtered = chains
          .filter(c => TARGET_CHAINS.includes(c.name))
          .map(c => ({
            chainName:     c.name,
            chainSymbol:   CHAIN_CONFIG[c.name]?.symbol ?? c.name,
            totalEntities: c.protocols ?? 0,
            tvl:           c.tvl ?? 0,
            volume24h:     c.volume24h ?? 0,
            color:         CHAIN_CONFIG[c.name]?.color ?? '#888888',
          }))
          .sort((a, b) => b.tvl - a.tvl);

        if (filtered.length > 0) {
          setData(filtered);
          setLastUpdated(new Date().toLocaleTimeString());
        }
      } catch (e) {
        // If DeFiLlama is unreachable, display nothing rather than fake data
        console.error('[EcosystemWarRoom] DeFi Llama fetch failed', e);
      }
    };

    fetchChainTvl();
    // Refresh every 60s — DeFiLlama data updates every minute
    const interval = setInterval(fetchChainTvl, 60_000);
    return () => clearInterval(interval);
  }, []);

  const totalTvlGlobal = data.reduce((acc, curr) => acc + curr.tvl, 0);

  return (
    <div className="w-full h-full min-h-0 flex flex-col bg-[#FFFFFF] p-0 rounded-2xl border border-[#E5E5E5] text-[#050505] shadow-sm relative overflow-hidden">
      {/* Background Matrix Effect */}
      <div className="absolute inset-0 opacity-[0.03] pattern-grid-lg pointer-events-none filter invert" />
      
      <header className="relative z-10 flex justify-between items-end mb-6 pb-6 border-b border-[#E5E5E5] shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Server size={18} className="text-[#050505]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#050505]/60">Live Chain TVL Board</span>
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter">Ecosystem TVL Rankings</h2>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Global TVL · Source: DeFiLlama</p>
          <p className="font-mono text-2xl">${(totalTvlGlobal / 1_000_000_000).toFixed(2)}B</p>
          {lastUpdated && <p className="text-[9px] font-mono text-[#050505]/40 mt-1">Updated {lastUpdated}</p>}
        </div>
      </header>

      {/* Global Filter Toggles */}
      <div className="relative z-10 flex flex-wrap gap-3 mb-6 shrink-0">
        <button 
          onClick={() => setActiveFilter(null)}
          className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${activeFilter === null ? 'bg-[#050505] text-[#FFFFFF]' : 'bg-[#FAF9F6] text-[#050505]/60 border border-[#E5E5E5] hover:bg-[#E5E5E5]/40'}`}
        >
          ALL CHAINS
        </button>
        {data.map(chain => (
          <button 
            key={chain.chainName}
            onClick={() => setActiveFilter(chain.chainSymbol)}
            className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${activeFilter === chain.chainSymbol ? 'bg-[#050505] text-[#FFFFFF]' : 'bg-[#FAF9F6] text-[#050505]/60 border border-[#E5E5E5] hover:bg-[#E5E5E5]/40'}`}
          >
            {chain.chainName}
          </button>
        ))}
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4 pr-2">
        {data
          .filter(c => activeFilter === null || activeFilter === c.chainSymbol)
          .sort((a, b) => b.totalEntities - a.totalEntities)
          .map((chain, i) => (
          <motion.div 
            key={chain.chainName}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center justify-between p-5 bg-[#FAF9F6] border border-[#E5E5E5] rounded-2xl hover:bg-[#FFFFFF] hover:shadow-md transition-all group cursor-crosshair shrink-0"
          >
            <div className="flex items-center gap-6">
               <div className="w-12 h-12 rounded-xl flex items-center justify-center opacity-80 shadow-sm border border-[#E5E5E5]" style={{ backgroundColor: `${chain.color}15` }}>
                  <ShieldCheck size={20} color={chain.color} />
               </div>
               <div>
                 <h3 className="text-lg font-black uppercase">{chain.chainName}</h3>
                 <p className="text-[10px] font-mono tracking-widest text-[#00C076] opacity-80 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                    <Zap size={10} />
                    {chain.totalEntities.toLocaleString()} INDEXED ENTITIES
                 </p>
               </div>
            </div>

            <div className="flex gap-12 text-right">
               <div>
                 <p className="text-[9px] uppercase tracking-widest text-[#050505]/40 font-bold mb-1">Ecosystem TVL</p>
                 <p className="font-mono text-sm">${(chain.tvl / 1000000000).toFixed(2)}B</p>
               </div>
               <div>
                 <p className="text-[9px] uppercase tracking-widest text-[#050505]/40 font-bold mb-1">Volumetric 24H</p>
                 <p className="font-mono text-sm">${(chain.volume24h / 1000000).toFixed(2)}M</p>
               </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
