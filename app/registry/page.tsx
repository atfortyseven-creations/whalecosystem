"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

// Load map client-side only
const RealWorldMap = dynamic(
  () => import("@/components/landing/RealWorldMap").then((m) => m.RealWorldMap),
  { ssr: false, loading: () => <div className="w-full h-full bg-[#000a14] animate-pulse rounded-xl border border-[#00ffcc]/20" /> }
);

export default function GlobalRegistryMapPage() {
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [visits, setVisits] = useState(11510);
  const [countries, setCountries] = useState(78);

  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString());
    
    // Quantum real-time simulation
    const interval = setInterval(() => {
      if (Math.random() > 0.3) {
        setVisits(v => v + Math.floor(Math.random() * 5) + 1);
        setLastUpdated(new Date().toLocaleTimeString());
        
        if (Math.random() > 0.95 && countries < 195) {
          setCountries(c => c + 1);
        }
      }
    }, 1200);
    
    return () => clearInterval(interval);
  }, [countries]);

  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-white flex flex-col relative overflow-hidden font-mono text-black">
      
      {/* Quantum Grid Background - Light */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-10" 
        style={{ 
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)', 
          backgroundSize: '40px 40px' 
        }}
      />
      <div className="absolute top-0 left-0 w-full h-[500px] bg-black/5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="w-full max-w-[1400px] mx-auto px-6 pt-10 pb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-6 relative z-10">
        <div>
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-black/40 mb-3 block animate-pulse">
            [ QUANTUM_LEDGER_SYNC ]
          </span>
          <h1 className="text-[32px] md:text-[42px] font-black text-black tracking-tight leading-[1.05] drop-shadow-sm">
            Global Registry
          </h1>
          <p className="text-[15px] text-black/60 font-medium mt-3 max-w-[600px]">
            Quantum-secured identity nodes. Hover any region to inspect cryptographic coverage and active verifications.
          </p>
        </div>

        {/* Real-time stats */}
        <div className="flex gap-4 shrink-0">
          <div className="border border-black/10 rounded-xl px-6 py-4 text-center bg-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.05)] backdrop-blur-md relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="text-[28px] font-black text-black leading-none block font-mono transition-all">
              {visits.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-black/40 mt-1 block">
              Global Authentications
            </span>
            {lastUpdated && (
              <span className="text-[9px] text-black/30 mt-1 block font-mono animate-pulse">
                SYS.TIME {lastUpdated}
              </span>
            )}
          </div>
          <div className="border border-black/10 rounded-xl px-6 py-4 text-center bg-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.05)] backdrop-blur-md relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="text-[28px] font-black text-black leading-none block font-mono transition-all">
              {countries}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-black/40 mt-1 block">
              Active Nodes
            </span>
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 w-full max-w-[1400px] mx-auto px-6 pb-10 relative z-10">
        <div className="w-full relative rounded-xl border border-black/10 overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.05)] bg-[#fafafa]/80 backdrop-blur-sm" style={{ height: "calc(100vh - 300px)", minHeight: "500px" }}>
          <RealWorldMap fullPage simulatedVisits={visits} />
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="w-full border-t border-black/10 bg-white/90 backdrop-blur-xl relative z-10">
        <div className="w-full max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[11px] font-medium text-black/60 font-mono tracking-widest">
              QUANTUM STATE SECURED
            </span>
          </div>
          <Link
            href="/developers/api-docs"
            className="text-[11px] font-black uppercase tracking-[0.2em] text-black/70 hover:text-black transition-all"
          >
            System Documentation
          </Link>
        </div>
      </div>
    </div>
  );
}
