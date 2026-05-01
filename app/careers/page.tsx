import React from 'react';
import Link from 'next/link';

const CULTURE_PILLARS = [
  {
    id: "01",
    title: "Zero-Knowledge Culture",
    text: "We value what you can mathematically prove, not your corporate pedigree. Meritocracy at the protocol layer."
  },
  {
    id: "02",
    title: "Asymmetric Velocity",
    text: "We ship institutional-grade infrastructure faster than legacy finance convenes a board meeting. Execution is everything."
  },
  {
    id: "03",
    title: "Absolute Sovereignty",
    text: "Fully remote. Fully asynchronous. We provide the highest tier of compensation for the highest tier of autonomy."
  }
];

export default function CareersPage() {
  return (
    <div className="relative min-h-screen bg-[#FDFCF8] text-[#050505] selection:bg-black selection:text-[#FDFCF8] font-sans antialiased overflow-x-hidden pt-32 pb-24">
      <div className="w-full max-w-[850px] mx-auto px-5 sm:px-8 flex flex-col gap-16">
        
        <header className="flex flex-col gap-6 text-center mb-0">
          <h1 className="text-[36px] md:text-[48px] font-serif text-black leading-[1.1] tracking-tight">
            Whale Alert <br/><span className="italic font-light">Network</span>
          </h1>
          <div className="flex justify-center mt-2 mb-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black border border-black/10">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00C076] shadow-[0_0_8px_#00C076] animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#FDFCF8]">WE ARE HIRING!</span>
            </div>
          </div>
          <p className="font-serif text-[14px] text-[#444] max-w-xl mx-auto leading-[1.8] border-t border-b border-black/10 py-6 mt-4">
            We are architecting the definitive standard for on-chain intelligence. We decode global financial entropy through stochastic filtering and zero-knowledge paradigms. Join the core team and build the future of absolute cryptographic transparency.
          </p>
        </header>

        {/* ─── Culture Pillars ─── */}
        <section className="flex flex-col relative w-full mb-0">
          <div className="w-full border-b-[1.5px] border-black pb-3 mb-6 flex items-end">
            <h2 className="text-[12px] font-bold font-mono tracking-[0.2em] uppercase text-black">
              The Sovereign Protocol — Core Philosophy
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-black border border-black shadow-sm">
            {CULTURE_PILLARS.map((pillar) => (
              <div key={pillar.id} className="bg-[#fdfbf6] p-6 hover:bg-[#f5f4ef] transition-colors duration-300 flex flex-col gap-4">
                <span className="font-mono text-[24px] font-black tracking-tighter text-black/20">
                  {pillar.id}.
                </span>
                <div className="flex flex-col gap-2">
                  <h3 className="font-mono text-[10px] font-black uppercase tracking-widest text-black">
                    {pillar.title}
                  </h3>
                  <p className="font-serif text-[12px] text-[#333] leading-[1.8] text-justify">
                    {pillar.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Perimeter Defense & Engineering (Context) ─── */}
        <section className="flex flex-col relative w-full mb-4">
           <div className="flex flex-col sm:flex-row items-stretch gap-[1px] bg-black border border-black shadow-sm">
             <div className="w-full sm:w-[280px] bg-[#111] text-[#FDFCF8] flex flex-col justify-center p-8 shrink-0">
               <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] mb-4 text-[#D4AF37]">
                 Engineering the Abyss
               </h3>
               <p className="font-serif text-[12px] leading-[1.8] text-white/70 text-justify">
                 Our technical perimeter extends from deep mempool parsing to cross-chain liquidity reconstruction. We do not hire standard developers; we seek cryptographic architects capable of reading the matrix.
               </p>
             </div>
             <div className="flex-1 bg-[#fdfbf6] p-8 flex flex-col justify-center">
                <ul className="flex flex-col gap-6">
                  <li className="flex items-start gap-4">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-black/40 mt-1">01</span>
                    <p className="font-serif text-[13px] text-[#222] leading-relaxed"><strong>Unmatched Autonomy:</strong> Operate with elite tactical freedom. You dictate your execution flow.</p>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-black/40 mt-1">02</span>
                    <p className="font-serif text-[13px] text-[#222] leading-relaxed"><strong>Top-Tier Compensation:</strong> Base salaries positioned in the 95th percentile, strictly paid in stablecoins or fiat per preference.</p>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-black/40 mt-1">03</span>
                    <p className="font-serif text-[13px] text-[#222] leading-relaxed"><strong>Institutional Reach:</strong> Your architecture will directly index the portfolios of the largest global sovereign funds and entities.</p>
                  </li>
                </ul>
             </div>
           </div>
        </section>

        {/* ─── Active Mandates ─── */}
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
