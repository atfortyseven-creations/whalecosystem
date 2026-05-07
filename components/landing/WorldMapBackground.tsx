"use client";

import { useEffect, useState } from "react";
import { SovereignGlobe3D } from "./SovereignGlobe3D";

// ── Wrapper positioning the 3D Globe as a background layer ───────────────────
export function WorldMapBackground() {
  return (
    <div className="absolute inset-0 w-full h-full z-0 overflow-hidden" style={{ opacity: 0.9, display: 'block' }}>
      <SovereignGlobe3D />
    </div>
  );
}

// ── BTC Transfer Legend — original design restored ────────────────────────────
export function BtcTransferLegend() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), 3000);
    return () => clearInterval(t);
  }, []);

  const routes = [
    { from: "New York",      to: "London",      btc: "145.28", latency: "12ms", conf: "6/6",         type: "OTC Desk" },
    { from: "Tokyo",         to: "Hong Kong",   btc: "101.55", latency: "8ms",  conf: "Unconfirmed", type: "Exchange" },
    { from: "San Francisco", to: "Paris",       btc: "53.21",  latency: "14ms", conf: "2/6",         type: "Whale Wallet" },
    { from: "London",        to: "Dubai",       btc: "241.16", latency: "11ms", conf: "6/6",         type: "Institutional" },
    { from: "Hong Kong",     to: "Singapore",   btc: "72.44",  latency: "6ms",  conf: "1/6",         type: "Dark Pool" },
  ];

  return (
    <div className="relative z-10 w-full max-w-3xl mx-auto mt-4 px-4">
      {/* Route rows */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {routes.map((r, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-white border border-black/[0.07] hover:border-black/20 transition-all"
          >
            <div className="flex items-center gap-2 min-w-0">
              {/* Institutional arc icon */}
              <svg width="20" height="12" viewBox="0 0 20 12" className="shrink-0">
                <path
                  d="M1 10 Q10 0 19 10"
                  stroke="#555555"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                  opacity="0.3"
                />
                <circle cx="1" cy="10" r="2" fill="#555555" />
                <circle cx="19" cy="10" r="2" fill="#555555" />
                {/* animated moving dot */}
                <circle
                  cx={1 + (i * 4 + tick * 2) % 18}
                  cy={10 - Math.sin(((i * 4 + tick * 2) % 18) / 18 * Math.PI) * 8}
                  r="1.5"
                  fill="#050505"
                />
              </svg>
              <span className="text-[10px] font-black text-black/70 truncate uppercase tracking-widest">
                {r.from} <span className="opacity-40">→</span> {r.to}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black font-mono text-[#050505]">
                {r.btc} BTC
              </span>
              <span className="text-[8px] font-mono text-black/40 uppercase">
                {r.type} • {r.latency} • {r.conf}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Context panel */}
      <div className="mt-3 px-5 py-4 rounded-2xl bg-white border border-black/[0.07] flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-2">
            Global Flow Dynamics
          </p>
          <p className="text-[11px] text-black/60 leading-relaxed font-medium max-w-lg">
            This map visualizes high-volume institutional liquidity transfers across major financial nodes.
            Interact with the 3D topology to track the directional velocity of Bitcoin capital flows in real-time.
            The visualization utilizes 60,000 spatial points to ensure absolute rendering perfection of continents and global endpoints.
          </p>
        </div>

        {/* Statistics panel */}
        <div className="flex gap-4 shrink-0 bg-black/[0.03] p-3 rounded-xl border border-black/[0.05]">
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-black/40 uppercase tracking-wider mb-1">Network Load</span>
            <span className="text-xs font-mono font-black text-[#050505]">98.4%</span>
          </div>
          <div className="w-[1px] bg-black/10" />
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-black/40 uppercase tracking-wider mb-1">Active Nodes</span>
            <span className="text-xs font-mono font-black text-[#050505]">14,208</span>
          </div>
          <div className="w-[1px] bg-black/10" />
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-black/40 uppercase tracking-wider mb-1">Hashrate</span>
            <span className="text-xs font-mono font-black text-[#050505]">654 EH/s</span>
          </div>
        </div>
      </div>
    </div>
  );
}
