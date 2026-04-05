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

const mockEcosystems: EcosystemData[] = [
  { chainName: 'Ethereum', chainSymbol: 'ETH', totalEntities: 4231, tvl: 45000000000, volume24h: 1200000000, color: '#627EEA' },
  { chainName: 'Binance Chain', chainSymbol: 'BSC', totalEntities: 995, tvl: 5000000000, volume24h: 400000000, color: '#F3BA2F' },
  { chainName: 'Solana', chainSymbol: 'SOL', totalEntities: 303, tvl: 2500000000, volume24h: 800000000, color: '#14F195' },
  { chainName: 'Arbitrum', chainSymbol: 'ARB', totalEntities: 138, tvl: 3000000000, volume24h: 300000000, color: '#28A0F0' },
  { chainName: 'Base', chainSymbol: 'BASE', totalEntities: 60, tvl: 600000000, volume24h: 150000000, color: '#0052FF' },
];

export function EcosystemWarRoom() {
  const [data, setData] = useState<EcosystemData[]>(mockEcosystems);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // In production, this hooks to `neuralSegregator` via WebSockets
  useEffect(() => {
    const timer = setInterval(() => {
      setData(prev => prev.map(chain => ({
        ...chain,
        volume24h: chain.volume24h + (Math.random() * 1000000 - 500000)
      })));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const totalTvlGlobal = data.reduce((acc, curr) => acc + curr.tvl, 0);

  return (
    <div className="w-full bg-[#050505] p-8 mt-12 rounded-[2rem] border border-white/5 text-white shadow-2xl relative overflow-hidden">
      {/* Background Matrix Effect */}
      <div className="absolute inset-0 opacity-[0.03] pattern-grid-lg" />
      
      <header className="relative z-10 flex justify-between items-end mb-10 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Server size={18} className="text-indigo-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Live Ecosystem War-Room</span>
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter">Global Structural Dominance</h2>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Global Monopolized TVL</p>
          <p className="font-mono text-2xl">${(totalTvlGlobal / 1000000000).toFixed(2)}B</p>
        </div>
      </header>

      {/* Global Filter Toggles */}
      <div className="relative z-10 flex flex-wrap gap-3 mb-8">
        <button 
          onClick={() => setActiveFilter(null)}
          className={\`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all \${activeFilter === null ? 'bg-white text-black' : 'bg-white/5 text-white/50 hover:bg-white/10'}\`}
        >
          GLOBAL MESH
        </button>
        {data.map(chain => (
          <button 
            key={chain.chainName}
            onClick={() => setActiveFilter(chain.chainSymbol)}
            className={\`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all \${activeFilter === chain.chainSymbol ? 'bg-white text-black' : 'bg-white/5 text-white/50 hover:bg-white/10'}\`}
          >
            Only {chain.chainName} Flow
          </button>
        ))}
      </div>

      <div className="relative z-10 space-y-4">
        {data
          .filter(c => activeFilter === null || activeFilter === c.chainSymbol)
          .sort((a, b) => b.totalEntities - a.totalEntities)
          .map((chain, i) => (
          <motion.div 
            key={chain.chainName}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center justify-between p-5 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-colors group cursor-crosshair"
          >
            <div className="flex items-center gap-6">
               <div className="w-12 h-12 rounded-xl flex items-center justify-center opacity-80" style={{ backgroundColor: \`\${chain.color}15\` }}>
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
                 <p className="text-[9px] uppercase tracking-widest opacity-40 font-bold mb-1">Ecosystem TVL</p>
                 <p className="font-mono text-sm">${(chain.tvl / 1000000000).toFixed(2)}B</p>
               </div>
               <div>
                 <p className="text-[9px] uppercase tracking-widest opacity-40 font-bold mb-1">Volumetric 24H</p>
                 <p className="font-mono text-sm">${(chain.volume24h / 1000000).toFixed(2)}M</p>
               </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
