import React from 'react';
import Link from 'next/link';

export default function CareersPage() {
  return (
    <div className="relative min-h-screen bg-[#FDFCF8] text-[#050505] selection:bg-black selection:text-[#FDFCF8] font-sans antialiased overflow-x-hidden pt-32 pb-24">
      <div className="w-full max-w-[850px] mx-auto px-5 sm:px-8 flex flex-col gap-16">
        
        <header className="flex flex-col gap-6 text-center mb-8">
          <h1 className="text-[32px] md:text-[42px] font-serif text-black leading-tight tracking-tight">
            Institutional <br/><span className="italic font-light">Expansion</span>
          </h1>
          <div className="flex justify-center -mt-2 mb-2">
            <span className="text-[9px] font-mono font-bold uppercase tracking-[0.3em] text-black/30">
              © 2026 Sovereign Terminal
            </span>
          </div>
          <p className="font-serif text-[13px] text-[#444] max-w-xl mx-auto leading-relaxed border-t border-b border-black/10 py-6">
            We are architecting the definitive standard for on-chain intelligence. Join the core team and build the infrastructure required to decode global financial entropy.
          </p>
        </header>

        <section className="flex flex-col relative w-full">
          <div className="w-full border-b-[1.5px] border-black pb-3 mb-6 flex items-end justify-between">
            <h2 className="text-[12px] font-bold font-mono tracking-[0.2em] uppercase text-black">
              Active Mandates
            </h2>
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-black/40">
              1 Open Position
            </span>
          </div>
          
          <div className="flex flex-col gap-[1px] bg-black border border-black shadow-sm">
            <Link href="/careers/web3-educator" className="bg-[#fdfbf6] flex flex-col sm:flex-row items-stretch group overflow-hidden focus:outline-none cursor-pointer hover:bg-[#f5f4ef] transition-colors duration-300">
              <div className="w-full sm:w-[160px] bg-[#f5f4ef] group-hover:bg-[#eceae3] border-b sm:border-b-0 sm:border-r border-black/10 flex flex-col items-center justify-center p-6 shrink-0 transition-colors duration-300">
                <span className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-black/50 mb-2">REMOTE</span>
                <span className="font-mono text-[10px] font-black tracking-widest text-[#0066FF] opacity-80 group-hover:opacity-100 transition-opacity">GLOBAL</span>
              </div>
              <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[10px] font-black uppercase tracking-widest text-black">
                    Senior Web3 Educator
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-black/40 bg-black/5 px-2 py-0.5 border border-black/10">
                    FULL-TIME
                  </span>
                </div>
                <p className="font-serif text-[13px] text-[#333] leading-[1.8] text-justify max-w-lg">
                  Architect the educational perimeter of the Sovereign Terminal. Translate complex zero-knowledge proofs, on-chain intelligence heuristics, and decentralized finance paradigms into accessible mastery.
                </p>
              </div>
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
