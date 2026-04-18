"use client";

import React, { useEffect, useState } from "react";
import { OptimizedLocalLottie } from "./OptimizedLocalLottie";

const IMMERSIVE_PAGES = [
  {
    title: "I. The Sovereign Intelligence Protocol",
    paragraphs: [
      "The Whale Alert Network operates as a decentralized, cryptographic intelligence protocol. We do not rely on third-party APIs or delayed indexers. Instead, the system interfaces directly with the EVM via zero-latency web-sockets, reading the thermodynamic exhaust of every transaction as it is minted into the blockchain.",
      "Traditional financial markets operate in the dark, where massive liquidity movements are obfuscated by prime brokers and OTC desks. The blockchain, however, is a panopticon of absolute truth. By capturing the state-changes of targeted smart contracts, we expose the underlying strategies of hyper-capitalized entities—the Whales.",
      "This protocol provides an asymmetric advantage. It parses raw hexadecimal calldata, decrypts router paths, and translates complex decentralized exchange interactions into human-readable tactical alerts. You are no longer trading against the market; you are trading alongside the architectural designers of liquidity itself."
    ]
  },
  {
    title: "II. Algorithmic Topography and Pattern Recognition",
    paragraphs: [
      "Our heuristics engine does not merely track volume; it tracks intention. By employing a multi-layered behavioral analysis model, the system differentiates between routine wallet structuring and aggressive, market-making accumulation.",
      "When a targeted entity initiates a transfer exceeding our dynamic thresholds (typically >$10M USD equivalent), the network calculates the velocity and destination entropy. Is the capital moving to cold storage for long-term dormancy, or is it entering a recognized centralized exchange ingest wallet to provide immediate sell pressure?",
      "The AI layer assigns a confidence score to every movement. A '99.9% MAX' confidence indicates a pattern match with historical market-moving events. This is not predictive text; this is cryptographic forensics happening in real-time, 240 times per second."
    ]
  },
  {
    title: "III. Zero-Knowledge Clearance and The Vault",
    paragraphs: [
      "Access to this telemetry requires sovereign identity. You do not 'sign up' for the Whale Alert Network; you cryptographically prove your authorization. By connecting your Web3 wallet, you are generating a localized signature that the system verifies without ever exposing your private keys.",
      "Once inside, the Terminal unlocks the 'Event Ledger' and the 'Global Consensus' modules. The Event Ledger acts as an immutable diary of anomalies, while the Global Consul aggregates localized sentiment from other sovereign nodes in the network.",
      "This architecture guarantees that the intelligence you receive is unfiltered and uncorrupted. Institutional players spend millions to acquire a fraction of the visibility provided by this terminal. You are now wielding the same Panopticon."
    ]
  },
  {
    title: "IV. Terminal Operation and Tactical Execution",
    paragraphs: [
      "The aesthetic of the terminal is intentionally austere. It is designed for maximum signal-to-noise ratio. There are no distracting gamification elements; only pure data stream and execution vectors. Your Dashboard is a command center for cryptographic warfare.",
      "Live Telemetry streams the raw pulse of the network. Sovereign Intel filters this pulse into actionable briefings. And Cold Storage provides visibility into the silent fortresses where true wealth is quarantined.",
      "Verify everything. Trust nothing but the chain. The execution of your sovereign strategy begins the moment you interpret the topography. Welcome to the baseline reality of modern finance."
    ]
  }
];

export function ImmersiveManifestoLanding() {
  const [lotties, setLotties] = useState<string[]>([]);
  
  useEffect(() => {
    // Attempt to dynamically fetch whatever Lotties are available
    fetch('/api/lottie?file=__list__')
      .then(r => r.json())
      .then(d => {
         if (d.files && d.files.length > 0) setLotties(d.files);
      }).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#1a1a1a] selection:bg-black selection:text-white font-sans w-full"
         style={{ overflowY: 'auto', scrollBehavior: 'smooth' }}>
      
      {/* Top Bar Editorial Style */}
      <div className="sticky top-0 z-50 w-full bg-[#FDFCF8]/90 backdrop-blur-md border-b border-[#e8e5de] py-4 px-8 flex justify-between items-center">
        <div className="font-mono text-[9px] uppercase tracking-[0.3em] font-bold text-black border border-black/20 px-3 py-1 bg-white">
          Sovereign Clearance Confirmed
        </div>
        <div className="font-mono text-[10px] tracking-widest text-black/50 uppercase">
          Whale Alert Network // System Architecture Manual
        </div>
      </div>

      <main className="max-w-[760px] mx-auto px-6 py-24 flex flex-col gap-32">
        
        <header className="flex flex-col gap-6 text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-serif text-black leading-tight">
            The Architecture of <br/><span className="italic">Total Visibility</span>
          </h1>
          <p className="font-serif text-lg text-[#555] max-w-lg mx-auto">
            A comprehensive overview of the cryptographic mechanisms and behavioral heuristics powering the network.
          </p>
          <div className="w-12 h-[1px] bg-black/20 mx-auto mt-6" />
        </header>

        {IMMERSIVE_PAGES.map((page, pageIndex) => (
          <section key={pageIndex} className="flex flex-col gap-8 relative">
            <h2 className="text-xl font-bold font-sans tracking-wide uppercase text-black">
              {page.title}
            </h2>
            
            <div className="flex flex-col gap-6 relative">
              {page.paragraphs.map((para, pIndex) => {
                 // Distribute available lotties across the paragraphs
                 const globalIndex = (pageIndex * 3) + pIndex;
                 const lottieFile = lotties[globalIndex % Math.max(lotties.length, 1)];

                 return (
                   <div key={pIndex} className="relative group text-justify leading-relaxed">
                     {/* Float right lottie if available */}
                     {lottieFile && lotties.length > 0 && (pIndex % 2 === 0) && (
                       <div className="float-right ml-10 mb-6 mt-2 w-[180px] h-[180px] grayscale contrast-125 opacity-80 mix-blend-multiply transition-all duration-700 hover:grayscale-0 hover:opacity-100">
                         <OptimizedLocalLottie filename={lottieFile} />
                       </div>
                     )}
                     
                     <p className="font-serif text-[17px] text-[#222]">
                        <span className="font-mono text-[10px] text-[#999] tracking-widest mr-4 select-none">
                           {String(pageIndex + 1).padStart(2, '0')}.{String(pIndex + 1).padStart(2, '0')}
                        </span>
                        {para}
                     </p>
                   </div>
                 );
              })}
            </div>
            
            {/* Elegant section divider */}
            <div className="w-full flex justify-center mt-12 opacity-30">
               <span className="font-mono text-[10px] tracking-[0.5em]">• • •</span>
            </div>
          </section>
        ))}

        {/* Floating enter dashboard CTA at the bottom */}
        <div className="fixed bottom-0 left-0 w-full p-8 flex justify-center pointer-events-none z-50">
           <a href="/dashboard" className="pointer-events-auto px-8 py-3 bg-black text-white font-mono text-[11px] uppercase tracking-widest hover:bg-[#222] transition-colors shadow-2xl">
              Proceed to Command Center
           </a>
        </div>

      </main>
    </div>
  );
}
