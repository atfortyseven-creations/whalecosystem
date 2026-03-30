"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, Search, Clock, RefreshCw } from 'lucide-react';

const CHAIN_COLORS: Record<string, string> = {
  ethereum: "#627eea", base: "#0052ff", polygon: "#8247e5", arbitrum: "#28a0f0", optimism: "#ff0420", bitcoin: "#f7931a"
};

export default function ActivityFeedPanel() {
  const [search, setSearch] = useState("");
  const [filterChain, setFilterChain] = useState("ALL");
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/whale/activities');
      if(res.ok) {
        const data = await res.json();
        setActivities(data.activities || []);
      }
    } catch (e) {
      console.error('Failed to fetch whale activities', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 15000);
    return () => clearInterval(interval);
  }, []);

  const filtered = activities.filter(r => {
    const rChain = (r.chain || 'ETH').toUpperCase();
    const matchChain = filterChain === "ALL" || rChain.includes(filterChain) || (filterChain === 'ETH' && rChain === 'ETHEREUM') || (filterChain === 'ARB' && rChain === 'ARBITRUM') || (filterChain === 'OP' && rChain === 'OPTIMISM');
    const noteMatch = (r.type || '').toLowerCase().includes(search.toLowerCase()) || 
                      (r.walletLabel || '').toLowerCase().includes(search.toLowerCase());
    return matchChain && noteMatch;
  });

  const formatAmount = (num: number) => {
    if(num >= 1e9) return `$${(num/1e9).toFixed(1)}B`;
    if(num >= 1e6) return `$${(num/1e6).toFixed(1)}M`;
    if(num >= 1e3) return `$${(num/1e3).toFixed(1)}K`;
    return `$${num?.toFixed(0) || 0}`;
  };

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* ─── Stats ─── */}
      <div className="border border-white/5 bg-white/[0.02]" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="grid grid-cols-2 md:grid-cols-4">
          {[
            { label: "Txns (24h)", value: "41,820", color: "#111111" },
            { label: "Volume (24h)", value: "$19.4B", color: "#00e699" },
            { label: "Whale Alerts", value: "2,140", color: "#f43f5e" },
            { label: "Avg Tx Size", value: "$462K", color: "#8b5cf6" },
          ].map((s, i) => (
            <div key={i} className="az-stat-card bg-[#FAF9F6] border border-[#E5E5E5] m-1 rounded-xl p-4 flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold text-[#888888] uppercase tracking-widest">{s.label}</span>
              <span className="text-xl font-black font-mono tracking-tighter" style={{ color: s.color }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Controls ─── */}
      <div className="border border-[#E5E5E5] bg-[#FAF9F6] rounded-xl p-4 flex flex-wrap items-center gap-3 shadow-sm">
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search activity..."
            className="w-full bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl pl-9 pr-4 py-2.5 text-sm font-mono text-[#111111] outline-none focus:border-[#111111] transition-colors"
          />
        </div>
        <div className="flex bg-[#E5E5E5]/40 p-1.5 rounded-xl border border-[#E5E5E5]">
          {["ALL", "ETH", "ARB", "BASE", "SOL", "BNB", "OP"].map(c => (
            <button key={c} onClick={() => setFilterChain(c)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all shadow-sm ${filterChain === c ? 'bg-[#FFFFFF] text-[#111111] border border-[#E5E5E5]' : 'text-[#888888] hover:text-[#111111] border border-transparent hover:bg-black/5'}`}
            >
              {c}
            </button>
          ))}
        </div>
        <button className="ml-auto flex items-center gap-2 px-4 py-2.5 bg-[#111111] text-[#FFFFFF] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#222222] transition-colors shadow-sm">
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {/* ─── Activity Feed Table ─── */}
      <div className="bg-[#FAF9F6] border border-[#E5E5E5] rounded-2xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-6 gap-4 p-5 border-b border-[#E5E5E5] bg-[#E5E5E5]/30 text-[10px] font-mono font-bold tracking-widest text-[#888888] uppercase">
          <span className="flex items-center gap-1.5"><Clock size={10} /> TIME</span>
          <span>CHAIN</span>
          <span>TYPE</span>
          <span>AMOUNT</span>
          <span className="col-span-2">NOTE / DELTA</span>
        </div>
        <div className="min-h-[400px]">
          {loading && activities.length === 0 ? (
            <div className="p-12 text-center text-[#888888] text-xs font-mono tracking-widest uppercase flex flex-col items-center justify-center">
              <RefreshCw className="animate-spin mb-3" size={24} />
              Syncing mempool...
            </div>
          ) : filtered.length === 0 ? (
             <div className="p-12 text-center text-[#888888] text-xs font-mono tracking-widest uppercase">
              NO ACTIVITY DETECTED
            </div>
          ) : filtered.map((row, i) => (
            <motion.div
              key={row.id || i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03, duration: 0.25 }}
              className="grid grid-cols-6 gap-4 p-5 border-b border-[#E5E5E5] hover:bg-[#FFFFFF] transition-colors items-center"
            >
              <span className="text-[12px] font-mono font-bold text-[#888888]">
                {new Date(row.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second:'2-digit' })}
              </span>
              <span className="inline-flex items-center justify-center px-2 py-1 text-[9px] font-mono font-black tracking-widest uppercase rounded border" style={{ borderColor: `${CHAIN_COLORS[(row.chain || 'ethereum').toLowerCase()] || "#999"}`, color: CHAIN_COLORS[(row.chain || 'ethereum').toLowerCase()] || "#999", backgroundColor: `${CHAIN_COLORS[(row.chain || 'ethereum').toLowerCase()] || "#999"}15` }}>
                {row.chain || 'ETH'}
              </span>
              <span className="flex items-center gap-1.5">
                {row.type === "IN" || row.type === "DEPOSIT" 
                  ? <ArrowDownLeft size={16} className="text-[#00e699]" />
                  : <ArrowUpRight size={16} className="text-[#f43f5e]" />}
                <span className={`text-[10px] font-mono font-black uppercase tracking-widest ${row.type === "IN" || row.type === "DEPOSIT" ? "text-[#00e699]" : "text-[#f43f5e]"}`}>
                  {row.type || 'TRANSFER'}
                </span>
              </span>
              <span className="text-sm font-mono font-black text-[#111111]">{formatAmount(row.usdValue || row.amount || 0)}</span>
              <span className="col-span-2 flex items-center justify-between">
                <span className="text-xs font-bold text-[#111111]/70 truncate max-w-[200px]">{row.walletLabel || `${row.walletAddress?.slice(0,6)}...${row.walletAddress?.slice(-4)}`}</span>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-black border ${row.type === "IN" || row.type === "DEPOSIT" ? "bg-[#00e699]/10 border-[#00e699]/20 text-[#00dda8]" : "bg-[#f43f5e]/10 border-[#f43f5e]/20 text-[#f43f5e]"}`}>
                  {row.token || 'USDC'}
                </span>
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
