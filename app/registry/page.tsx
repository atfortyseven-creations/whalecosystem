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
  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-white flex flex-col relative overflow-visible font-mono text-black">
      
      {/* Light Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]" 
        style={{ 
          backgroundImage: 'linear-gradient(rgba(0,0,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,1) 1px, transparent 1px)', 
          backgroundSize: '40px 40px' 
        }}
      />

      {/* Header */}
      <div className="w-full px-8 pt-10 pb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-6 relative z-10">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-black/40 mb-3 block">
            [ GLOBAL_NETWORK_STATE ]
          </span>
          <h1 className="text-[32px] md:text-[42px] font-black text-black tracking-tight leading-[1.05]">
            Global Registry
          </h1>
          <p className="text-[15px] text-black/60 mt-3 max-w-[600px] font-sans">
            Global coverage and node density. Hover any region to inspect active verifications and status.
          </p>
        </div>

        {/* Top summary stats */}
        <div className="flex gap-4 shrink-0">
          <div className="border border-black/10 rounded-lg px-6 py-4 text-center bg-white shadow-sm relative group">
            <span className="text-[28px] font-black text-black leading-none block font-mono">
              11,783
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-black/40 mt-1 block">
              Global Authentications
            </span>
            <span className="text-[9px] text-black/30 mt-1 block font-mono">
              PAST 30 DAYS
            </span>
          </div>
          <div className="border border-black/10 rounded-lg px-6 py-4 text-center bg-white shadow-sm relative group">
            <span className="text-[28px] font-black text-black leading-none block font-mono">
              78
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-black/40 mt-1 block">
              Active Regions
            </span>
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 w-full px-8 pb-10 relative z-10 flex flex-col">
        <div className="w-full flex-1 relative rounded-xl border border-black/10 overflow-hidden shadow-sm bg-white min-h-[800px] flex flex-col">
          <RealWorldMap fullPage />
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="w-full border-t border-black/10 bg-white/90 backdrop-blur-xl relative z-10">
        <div className="w-full px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#2563eb] animate-pulse" />
            <span className="text-[11px] font-bold text-black/60 tracking-widest uppercase">
              NETWORK SECURED
            </span>
          </div>
          <Link
            href="/developers/api-docs"
            className="text-[11px] font-bold uppercase tracking-[0.2em] text-black/70 hover:text-black transition-all"
          >
            System Documentation
          </Link>
        </div>
      </div>
    </div>
  );
}
