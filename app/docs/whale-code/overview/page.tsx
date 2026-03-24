"use client";

import React from 'react';
import { Code, Terminal, Zap, Book } from 'lucide-react';

export default function DocWhaleCodeOverview() {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <header className="space-y-4">
        <div className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em]">Section 03 / Whale Code</div>
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight font-web3">Whale Code Overview</h1>
      </header>

      <div className="prose prose-slate max-w-none prose-headings:font-web3 prose-headings:uppercase prose-headings:tracking-tighter prose-headings:font-black">
        <p className="text-lg text-slate-500 leading-relaxed">
          Whale Code™ is the proprietary domain-specific language (DSL) and SDK developed by <strong>Whale Alert Corporation</strong> 
          for orchestrating programmable data surveillance and sovereign agent logic.
        </p>

        <h2 className="text-2xl pt-8 border-b border-slate-200/5 pb-2">The Programming Model</h2>
        <p className="text-slate-400">
          Whale Code allows you to define <strong>Subagents</strong> that operate with localized memory and persistent state. 
          It bridges the gap between raw blockchain data and autonomous decision-making agents.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
           <div className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Zap size={20} />
              </div>
              <h3 className="text-lg font-black uppercase tracking-widest font-web3">Auto-Looping</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Whale Code agents can be configured for autonomous loops, allowing them to re-evaluate on-chain state at ultra-low latencies.
              </p>
           </div>
           <div className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                <Code size={20} />
              </div>
              <h3 className="text-lg font-black uppercase tracking-widest font-web3">Stateful Memory</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Full-stack memory persistence using ZK-session layers, ensuring your agent logic remains private even during cloud execution.
              </p>
           </div>
        </div>

        <h2 className="text-2xl pt-8 border-b border-slate-200/5 pb-2">Technical Core</h2>
        <p className="text-slate-400">
           The <strong>Whale Code SDK</strong> is a super-set of standard agent frameworks, optimized for high-frequency financial kinetics. 
           It provides native <strong>Hooks</strong> for real-time trade detection and <strong>Skill</strong> modules for complex data analysis.
        </p>

        <div className="mt-12 p-8 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/20">
           <p className="text-sm font-black text-emerald-400 uppercase tracking-widest flex items-center gap-3 italic">
             <Terminal size={14} /> Powering the next generation of sovereign financial agents.
           </p>
        </div>
      </div>
    </div>
  );
}
