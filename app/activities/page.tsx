"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, ArrowUpRight, ArrowDownLeft, Filter, Search, Clock, Globe, RefreshCw } from 'lucide-react';
import { InstitutionalShell } from '@/components/shared/InstitutionalShell';
import "@/app/dashboard/dashboard.css";

const MOCK_ACTIVITY = [
  { time: "14:32:01", chain: "ETH",  type: "IN",  amount: "$142.4M", from: "0xBinance...", to: "0xCold...",   note: "Exchange Withdrawal",   delta: "+12.4%" },
  { time: "14:28:44", chain: "ARB",  type: "OUT", amount: "$88.1M",  from: "0xWhale...", to: "0xDeFi...",   note: "LP Deployment",          delta: "-3.2%" },
  { time: "14:21:18", chain: "BASE", type: "IN",  amount: "$204.9M", from: "0xMM...",    to: "0xCex...",    note: "Market Maker Inflow",    delta: "+28.9%" },
  { time: "14:15:55", chain: "SOL",  type: "OUT", amount: "$17.3M",  from: "0xFund...",  to: "0xBridge...", note: "Cross-Chain Transfer",   delta: "-1.8%" },
  { time: "14:09:30", chain: "ETH",  type: "IN",  amount: "$395.0M", from: "0xCBX...",   to: "0xVault...",  note: "Institutional Custody",  delta: "+44.2%" },
  { time: "13:58:12", chain: "BNB",  type: "OUT", amount: "$55.6M",  from: "0xArb...",   to: "0xPool...",   note: "Liquidity Removal",      delta: "-8.1%" },
  { time: "13:47:03", chain: "OP",   type: "IN",  amount: "$31.1M",  from: "0xDAO...",   to: "0xGov...",    note: "Governance Allocation",  delta: "+6.3%" },
  { time: "13:32:50", chain: "ETH",  type: "IN",  amount: "$71.8M",  from: "0xGrw...",   to: "0xLiq...",    note: "Yield Farming Entry",    delta: "+9.7%" },
];

const CHAIN_COLORS: Record<string, string> = {
  ETH: "#627eea", ARB: "#28a0f0", BASE: "#0052ff", SOL: "#14f195", BNB: "#f3ba2f", OP: "#ff0420"
};

export default function ActivitiesPage() {
  const [search, setSearch] = useState("");
  const [filterChain, setFilterChain] = useState("ALL");

  const filtered = MOCK_ACTIVITY.filter(r => {
    const matchChain = filterChain === "ALL" || r.chain === filterChain;
    const matchSearch = r.note.toLowerCase().includes(search.toLowerCase()) || r.amount.includes(search);
    return matchChain && matchSearch;
  });

  return (
    <InstitutionalShell title="Whale Activity" subtitle="Real-Time On-Chain Flow Intelligence" badge="LIVE FEED" badgeVariant="lime">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-6">

        {/* ─── Stats ─── */}
        <div className="border" style={{ borderColor: "rgba(26,20,0,0.08)", background: "white" }}>
          <div className="grid grid-cols-2 md:grid-cols-4">
            {[
              { label: "Txns (24h)", value: "41,820", color: "var(--az-ink)" },
              { label: "Volume (24h)", value: "$19.4B", color: "var(--az-lime)" },
              { label: "Whale Alerts", value: "2,140", color: "var(--az-emerald)" },
              { label: "Avg Tx Size", value: "$462K", color: "var(--az-orchid)" },
            ].map((s, i) => (
              <div key={i} className="az-stat-card" style={{ borderRight: i < 3 ? "1px solid rgba(26,20,0,0.06)" : "none" }}>
                <span className="az-label">{s.label}</span>
                <span className="az-value-xl" style={{ color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Controls ─── */}
        <div className="border" style={{ borderColor: "rgba(26,20,0,0.08)", background: "white" }}>
          <div className="flex flex-wrap items-center gap-3 p-4">
            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <Search size={12} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "rgba(26,20,0,0.30)" }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search activity..."
                style={{ width: "100%", padding: "8px 12px 8px 30px", fontFamily: "'JetBrains Mono',monospace", fontSize: 11, background: "rgba(26,20,0,0.03)", border: "1px solid rgba(26,20,0,0.10)", color: "var(--az-ink)", outline: "none" }}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {["ALL", "ETH", "ARB", "BASE", "SOL", "BNB", "OP"].map(c => (
                <button key={c} onClick={() => setFilterChain(c)}
                  style={{ padding: "5px 10px", fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer", background: filterChain === c ? "var(--az-lime)" : "rgba(26,20,0,0.04)", color: filterChain === c ? "var(--az-ink)" : "rgba(26,20,0,0.50)", border: filterChain === c ? "1px solid var(--az-lime)" : "1px solid rgba(26,20,0,0.08)", transition: "all 0.12s" }}
                >
                  {c}
                </button>
              ))}
            </div>
            <button style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", background: "none", border: "1px solid rgba(26,20,0,0.08)", cursor: "pointer", color: "rgba(26,20,0,0.50)" }}>
              <RefreshCw size={11} /> Refresh
            </button>
          </div>
        </div>

        {/* ─── Activity Feed Table ─── */}
        <div className="border" style={{ borderColor: "rgba(26,20,0,0.08)", background: "white", overflow: "hidden" }}>
          <div className="az-col-header grid grid-cols-6 gap-4" style={{ background: "rgba(26,20,0,0.03)", color: "rgba(26,20,0,0.4)" }}>
            <span className="flex items-center gap-1"><Clock size={8} /> TIME</span>
            <span>CHAIN</span>
            <span>TYPE</span>
            <span>AMOUNT</span>
            <span className="col-span-2">NOTE / DELTA</span>
          </div>
          <div className="az-scroll" style={{ maxHeight: "55vh" }}>
            {filtered.map((row, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03, duration: 0.25 }}
                className="az-data-row grid grid-cols-6 gap-4"
              >
                <span className="az-value-sm az-mono" style={{ color: "rgba(26,20,0,0.35)" }}>{row.time}</span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, fontWeight: 800, letterSpacing: "0.10em", padding: "2px 6px", display: "inline-flex", alignItems: "center", height: "fit-content", border: `1px solid ${CHAIN_COLORS[row.chain] || "#999"}40`, color: CHAIN_COLORS[row.chain] || "#999", background: `${CHAIN_COLORS[row.chain] || "#999"}12` }}>
                  {row.chain}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {row.type === "IN" 
                    ? <ArrowDownLeft size={12} style={{ color: "var(--az-emerald)" }} />
                    : <ArrowUpRight size={12} style={{ color: "var(--az-rose)" }} />}
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700, color: row.type === "IN" ? "var(--az-emerald)" : "var(--az-rose)" }}>{row.type}</span>
                </span>
                <span className="az-value-md">{row.amount}</span>
                <span className="col-span-2 flex items-center justify-between">
                  <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 12, color: "rgba(26,20,0,0.65)" }}>{row.note}</span>
                  <span className={`az-badge ${row.delta.startsWith("+") ? "az-badge-emerald" : "az-badge-rose"}`}>{row.delta}</span>
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </InstitutionalShell>
  );
}
