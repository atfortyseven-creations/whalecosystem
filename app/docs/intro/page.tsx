"use client";

import React from 'react';
import { Shield, Globe, Lock, Cpu } from 'lucide-react';

export default function DocIntro() {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <header className="space-y-4">
        <div className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.4em]">Section 01 / Guides</div>
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight font-web3">Introduction to Whale Alert</h1>
      </header>

      <div className="prose prose-slate max-w-none prose-headings:font-web3 prose-headings:uppercase prose-headings:tracking-tighter prose-headings:font-black">
        <p className="text-lg text-slate-500 leading-relaxed">
          Whale Alert Corporation™ is the world's premier institutional terminal for real-time, on-chain data surveillance. 
          Our protocol was designed from the ground up to solve the three most critical challenges in the decentralized finance landscape: 
          <strong>Privacy, Verifiability, and Scalability.</strong>
        </p>

        <h2 className="text-2xl pt-8 border-b border-slate-200/5 pb-2">The Philosophy</h2>
        <p className="text-slate-400">
          We believe that in the age of global decentralized ledgers, <strong>data sovereignty</strong> is the most valuable asset. 
          Whale Alert Protocol allows institutions to monitor massive capital movements without exposing the underlying identity of their own operations, 
          using state-of-the-art Zero-Knowledge Proof (ZKP) systems.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
           <div className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                <Shield size={20} />
              </div>
              <h3 className="text-lg font-black uppercase tracking-widest font-web3">Sovereign Protection</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Advanced encryption layers ensuring that your terminal sessions and sensitive telemetry never touch centralized databases.
              </p>
           </div>
           <div className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Globe size={20} />
              </div>
              <h3 className="text-lg font-black uppercase tracking-widest font-web3">Global Liquidity</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Direct RPC-level synchronization with the world's most liquid dark pools and institutional vaults across all major chains.
              </p>
           </div>
        </div>

        <h2 className="text-2xl pt-8 border-b border-slate-200/5 pb-2">Operational Integrity</h2>
        <p className="text-slate-400">
          Built for speed, the network maintains an unyielding <strong>120Hz refresh rate</strong> on all terminal feeds, 
          backed by a triple-stack infrastructure that shards incoming data across dedicated processing clusters.
        </p>

        <div className="mt-12 p-8 rounded-[2rem] bg-cyan-500/5 border border-cyan-500/20">
           <p className="text-sm font-black text-cyan-400 uppercase tracking-widest flex items-center gap-3 italic">
             <Lock size={14} /> Zero-Knowledge Settlement is the standard.
           </p>
        </div>
      </div>
    </div>
  );
}
