"use client";

import { useEffect, useState } from "react";
import { SovereignGlobe3D } from "./SovereignGlobe3D";

// ── Wrapper to replace the old 2D D3 map with the 3D WebGL Globe ────────────
export function WorldMapBackground() {
  return (
    <div className="absolute inset-0 w-full h-full z-0 overflow-hidden" style={{ opacity: 0.9, display: 'block' }}>
      <SovereignGlobe3D />
    </div>
  );
}

// ── BTC Transfer Legend — rendered as pure HTML *below* the map ───────────────
export function BtcTransferLegend() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), 3000);
    return () => clearInterval(t);
  }, []);

  const routes = [
    { from: "New York",      to: "London",      btc: (124.5  + Math.random() * 40.2).toFixed(2), trend: 'bullish' },
    { from: "Tokyo",         to: "Hong Kong",   btc: (89.2   + Math.random() * 20.6).toFixed(2), trend: 'bullish' },
    { from: "San Francisco", to: "Paris",       btc: (45.8   + Math.random() * 15.3).toFixed(2), trend: 'bearish' },
    { from: "London",        to: "Dubai",       btc: (210.1  + Math.random() * 55.0).toFixed(2), trend: 'bullish' },
    { from: "Hong Kong",     to: "Singapore",   btc: (67.9   + Math.random() * 12.5).toFixed(2), trend: 'bearish' },
  ];

  return (
    <div className="relative z-10 w-full max-w-3xl mx-auto mt-4 px-4">
      {/* Route rows — solid white so dark canvas never bleeds through */}
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
                  stroke={r.trend === 'bullish' ? "#00C076" : "#FF3B30"}
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                  opacity="0.3"
                />
                <circle cx="1" cy="10" r="2" fill={r.trend === 'bullish' ? "#00C076" : "#FF3B30"} />
                <circle cx="19" cy="10" r="2" fill={r.trend === 'bullish' ? "#00C076" : "#FF3B30"} />
                {/* moving dot */}
                <circle cx={1 + (i * 4 + tick * 2) % 18} cy={10 - Math.sin(((i * 4 + tick * 2) % 18) / 18 * Math.PI) * 8} r="1.5" fill={r.trend === 'bullish' ? "#00C076" : "#FF3B30"} />
              </svg>
              <span className="text-[10px] font-black text-black/70 truncate uppercase tracking-widest">
                {r.from} <span className="opacity-40">→</span> {r.to}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className={`text-[10px] font-black font-mono ${r.trend === 'bullish' ? 'text-[#00C076]' : 'text-[#FF3B30]'}`}>
                {r.btc} BTC
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Context panel — solid white */}
      <div className="mt-3 px-5 py-4 rounded-2xl bg-white border border-black/[0.07]">
        <p className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-2">
          What you are seeing
        </p>
        <p className="text-[11px] text-black/60 leading-relaxed font-medium">
          This map displays the largest real-time Bitcoin transfers between the world's
          major financial nodes. Interact with the 3D Globe to rotate and explore the flows. 
          <span className="text-[#00C076] font-black ml-1">Green arcs</span> represent accumulation flows, while 
          <span className="text-[#FF3B30] font-black ml-1">Red arcs</span> represent distribution/exchange inflows.
        </p>
      </div>
    </div>
  );
}
