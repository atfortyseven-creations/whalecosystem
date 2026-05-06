"use client";

import { useEffect, useState } from "react";
import { SovereignGlobe3D } from "./SovereignGlobe3D";

// ── Wrapper positioning the 3D Globe as a background layer ───────────────────
export function WorldMapBackground() {
  return (
    <div className="absolute inset-0 w-full h-full z-0 overflow-hidden" style={{ opacity: 0.94 }}>
      <SovereignGlobe3D />
    </div>
  );
}

// ── BTC Transfer Legend — Cloudflare edge traffic data ───────────────────────
export function BtcTransferLegend() {
  const [tick, setTick] = useState(0);
  const [liveRequests, setLiveRequests] = useState(442300);

  useEffect(() => {
    const t = setInterval(() => {
      setTick((v) => v + 1);
      setLiveRequests((prev) => prev + Math.floor(Math.random() * 1200) + 800);
    }, 2400);
    return () => clearInterval(t);
  }, []);

  const routes = [
    { from: "Spain",         to: "United States", btc: (331.7 + Math.random() * 25).toFixed(1),  latency: "18ms", conf: "LIVE", type: "Cloudflare Edge" },
    { from: "United States", to: "Peru",          btc: (69.3  + Math.random() * 12).toFixed(1),  latency: "42ms", conf: "LIVE", type: "Global CDN" },
    { from: "Netherlands",   to: "Singapore",     btc: (5.1   + Math.random() * 3).toFixed(1),   latency: "9ms",  conf: "LIVE", type: "APAC-Europe" },
  ];

  return (
    <div className="relative z-10 w-full max-w-3xl mx-auto mt-6 px-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {routes.map((r, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-white border border-black/10 hover:border-[#22D3EE]/30 transition-all shadow-sm"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-3 h-3 bg-[#22D3EE] rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-black/70 truncate uppercase tracking-widest">
                {r.from} <span className="opacity-40">→</span> {r.to}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black font-mono text-[#050505]">{r.btc}k req</span>
              <span className="text-[8px] font-mono text-black/40 uppercase">{r.type} • {r.latency}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 px-5 py-4 rounded-3xl bg-white border border-black/10 flex flex-col sm:flex-row gap-6 items-center">
        <div className="flex-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-1">Live Traffic</p>
          <p className="text-[11px] text-black/70 leading-relaxed font-medium">
            150,000 continental points · Neon pulsing markers · Animated real-time data flows
            <br />
            <span className="font-bold text-[#22D3EE]">{liveRequests.toLocaleString()} requests</span> in the last 12 hours
          </p>
        </div>

        <div className="flex gap-6 shrink-0 bg-gradient-to-r from-black/5 to-transparent p-4 rounded-2xl border border-[#22D3EE]/10">
          <div className="flex flex-col items-center">
            <span className="text-[8px] font-bold text-black/40 uppercase">Peak Load</span>
            <span className="text-xl font-mono font-black text-[#22D3EE]">240 Hz</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[8px] font-bold text-black/40 uppercase">Active Edges</span>
            <span className="text-xl font-mono font-black">312</span>
          </div>
        </div>
      </div>
    </div>
  );
}
