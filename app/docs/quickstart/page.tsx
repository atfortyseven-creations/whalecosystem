"use client";

import React from 'react';
import { Terminal, Copy, Check, Info } from 'lucide-react';

export default function DocQuickstart() {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const steps = [
    {
      title: "1. Install the Whale Alert SDK",
      desc: "Install the core surveillance library to begin receiving encrypted terminal feeds.",
      code: "npm install @whale-alert/sdk"
    },
    {
      title: "2. Initialize the Client",
      desc: "Authenticating with your corporate access token (obtained from the Network Portal).",
      code: `import { WhaleClient } from '@whale-alert/sdk';

const client = new WhaleClient({
  apiKey: process.env.WHALE_API_KEY, 
  network: 'mainnet-v2'
});`
    },
    {
      title: "3. Subscribe to $1B+ Transactions",
      desc: "Listen for institutional capital movements with sub-millisecond kinetic synchronization.",
      code: `client.on('vitals.tx.new', (tx) => {
  if (tx.valueUsd > 1000000000) {
    console.log('🚨 WHALE ALERT: $1B+ Flow Detected', tx.hash);
  }
});`
    }
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <header className="space-y-4">
        <div className="text-[10px] font-black text-purple-500 uppercase tracking-[0.4em]">Section 02 / Guides</div>
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight font-web3">Quickstart (API)</h1>
      </header>

      <div className="prose prose-slate max-w-none prose-headings:font-web3 prose-headings:uppercase prose-headings:tracking-tighter prose-headings:font-black">
        <p className="text-lg text-slate-500 leading-relaxed">
          The Whale Alert API is built for maximum throughput and security. 
          Use this guide to integrate the protocol into your custom institutional dashboard.
        </p>

        {steps.map((step, i) => (
          <div key={i} className="py-12 border-b border-white/5 space-y-6">
            <h3 className="text-xl font-black font-web3 uppercase tracking-widest">{step.title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
            
            <div className="relative group">
              <pre className="bg-black/40 border border-white/10 p-6 rounded-2xl text-[12px] font-mono text-cyan-400 overflow-x-auto shadow-2xl">
                <code>{step.code}</code>
              </pre>
              <button 
                onClick={() => copyToClipboard(step.code, i)}
                className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 transition-all"
              >
                {copiedIndex === i ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        ))}

        {/* Tip / Note */}
        <div className="p-8 rounded-[2rem] bg-amber-500/5 border border-amber-500/20 flex gap-6">
           <div className="p-3 bg-amber-500/10 rounded-xl h-fit text-amber-500">
             <Info size={20} />
           </div>
           <div className="space-y-2">
              <p className="text-sm font-black text-amber-500 uppercase tracking-widest">Security Warning</p>
              <p className="text-xs text-slate-500 leading-relaxed italic">
                Never expose your corporate API keys in public client-side environments. 
                Use environments variables and server-side secret management protocols.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
