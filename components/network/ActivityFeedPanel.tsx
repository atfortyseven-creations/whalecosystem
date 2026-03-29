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
            { label: "Txns (24h)", value: "41,820", color: "var(--az-ink)" },
            { label: "Volume (24h)", value: "$19.4B", color: "var(--az-lime)" },
            { label: "Whale Alerts", value: "2,140", color: "var(--az-emerald)" },
            { label: "Avg Tx Size", value: "$462K", color: "var(--az-orchid)" },
          ].map((s, i) => (
            <div key={i} className="az-stat-card" style={{ borderRight: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
              <span className="az-label text-white/50">{s.label}</span>
              <span className="az-value-xl font-bold" style={{ color: s.color }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Controls ─── */}
      <div className="border border-white/5 bg-white/[0.02] p-4 flex flex-wrap items-center gap-3">
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={12} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.30)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search activity..."
            style={{ width: "100%", padding: "8px 12px 8px 30px", fontFamily: "'JetBrains Mono',monospace", fontSize: 11, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.10)", color: "white", outline: "none" }}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["ALL", "ETH", "ARB", "BASE", "SOL", "BNB", "OP"].map(c => (
            <button key={c} onClick={() => setFilterChain(c)}
              style={{ padding: "5px 10px", fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer", background: filterChain === c ? "var(--az-lime)" : "rgba(255,255,255,0.04)", color: filterChain === c ? "black" : "rgba(255,255,255,0.50)", border: filterChain === c ? "1px solid var(--az-lime)" : "1px solid rgba(255,255,255,0.08)", transition: "all 0.12s" }}
            >
              {c}
            </button>
          ))}
        </div>
        <button style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", background: "none", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", color: "rgba(255,255,255,0.50)" }}>
          <RefreshCw size={11} /> Refresh
        </button>
      </div>

      {/* ─── Activity Feed Table ─── */}
      <div className="border border-white/5 bg-white/[0.02] rounded-xl shadow-sm">
        <div className="grid grid-cols-6 gap-4 p-4 rounded-t-xl text-[10px] font-mono font-bold tracking-widest text-white/40 uppercase" style={{ background: "rgba(255,255,255,0.03)" }}>
          <span className="flex items-center gap-1"><Clock size={8} /> TIME</span>
          <span>CHAIN</span>
          <span>TYPE</span>
          <span>AMOUNT</span>
          <span className="col-span-2">NOTE / DELTA</span>
        </div>
        <div>
          {loading && activities.length === 0 ? (
            <div className="p-8 text-center text-white/40 text-xs font-mono tracking-widest uppercase">
              <RefreshCw className="animate-spin inline-block mb-2 text-white/20" size={24} /><br/>
              Syncing mempool...
            </div>
          ) : filtered.length === 0 ? (
             <div className="p-8 text-center text-white/40 text-xs font-mono tracking-widest uppercase">
              NO ACTIVITY DETECTED
            </div>
          ) : filtered.map((row, i) => (
            <motion.div
              key={row.id || i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03, duration: 0.25 }}
              className="grid grid-cols-6 gap-4 p-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors"
            >
              <span className="text-[12px] font-mono text-white/50">
                {new Date(row.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second:'2-digit' })}
              </span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, fontWeight: 800, letterSpacing: "0.10em", padding: "2px 6px", display: "inline-flex", alignItems: "center", height: "fit-content", border: `1px solid ${CHAIN_COLORS[(row.chain || 'ethereum').toLowerCase()] || "#999"}40`, color: CHAIN_COLORS[(row.chain || 'ethereum').toLowerCase()] || "#999", background: `${CHAIN_COLORS[(row.chain || 'ethereum').toLowerCase()] || "#999"}12`, textTransform: 'uppercase' }}>
                {row.chain || 'ETH'}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {row.type === "IN" || row.type === "DEPOSIT" 
                  ? <ArrowDownLeft size={12} style={{ color: "var(--az-emerald)" }} />
                  : <ArrowUpRight size={12} style={{ color: "var(--az-rose)" }} />}
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700, color: (row.type === "IN" || row.type === "DEPOSIT") ? "var(--az-emerald)" : "var(--az-rose)" }}>{row.type || 'TRANSFER'}</span>
              </span>
              <span className="text-[13px] font-mono font-bold text-white/90">{formatAmount(row.usdValue || row.amount || 0)}</span>
              <span className="col-span-2 flex items-center justify-between">
                <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{row.walletLabel || `${row.walletAddress?.slice(0,6)}...${row.walletAddress?.slice(-4)}`}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${row.type === "IN" || row.type === "DEPOSIT" ? "bg-[#14f195]/10 text-[#14f195]" : "bg-[#f43f5e]/10 text-[#f43f5e]"}`}>
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
