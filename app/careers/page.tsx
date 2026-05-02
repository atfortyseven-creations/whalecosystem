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
            Whale Alert Network <br/><span className="italic font-light text-black/60">Jobs</span>
          </h1>
          <div className="flex justify-center mt-2 mb-2">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-black/5 hover:bg-black/10 border border-black/10 transition-colors duration-300 backdrop-blur-sm cursor-default">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
              <span className="text-[11px] font-medium uppercase tracking-widest text-black/80 font-mono">We are hiring</span>
            </div>
          </div>
          <p className="font-serif text-[14px] text-[#444] max-w-xl mx-auto leading-[1.8] border-t border-b border-black/10 py-6 mt-4">
            We are architecting the definitive standard for on-chain intelligence. We decode global financial entropy through stochastic filtering and zero-knowledge paradigms. Join the core team and build the future of absolute cryptographic transparency.
          </p>
        </header>

        {/* ─── Culture Pillars ─── */}
        <section className="flex flex-col relative w-full mb-4 pt-4">
          <div className="w-full pb-4 mb-8 flex items-end justify-between border-b border-black/10">
            <h2 className="text-[18px] font-medium font-sans text-black">
              Core Philosophy
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {CULTURE_PILLARS.map((pillar) => (
              <div key={pillar.id} className="flex flex-col gap-3 group">
                <span className="font-mono text-[14px] font-medium text-black/30 group-hover:text-[#00C076] transition-colors duration-300">
                  {pillar.id}
                </span>
                <div className="flex flex-col gap-2">
                  <h3 className="font-sans text-[20px] font-medium text-black">
                    {pillar.title}
                  </h3>
                  <p className="font-serif text-[14px] text-[#444] leading-[1.8]">
                    {pillar.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Perimeter Defense & Engineering (Context) ─── */}
        <section className="flex flex-col relative w-full mb-8 pt-8">
           <div className="flex flex-col sm:flex-row items-stretch overflow-hidden rounded-2xl border border-black/10 bg-[#fdfbf6] shadow-sm">
             <div className="w-full sm:w-[320px] bg-black text-[#FDFCF8] flex flex-col justify-center p-8 sm:p-10 shrink-0 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/10 to-transparent rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
               <h3 className="font-sans text-[24px] font-medium mb-4 text-white relative z-10">
                 Engineering the Abyss
               </h3>
               <p className="font-serif text-[14px] leading-[1.8] text-white/70 relative z-10">
                 Our technical perimeter extends from deep mempool parsing to cross-chain liquidity reconstruction. We seek cryptographic architects capable of reading the matrix.
               </p>
             </div>
             <div className="flex-1 p-8 sm:p-10 flex flex-col justify-center">
                <ul className="flex flex-col gap-8">
                  <li className="flex items-start gap-5">
                    <span className="font-mono text-[12px] font-medium text-black/30 mt-1">01</span>
                    <div className="flex flex-col gap-1">
                      <h4 className="font-sans text-[16px] font-medium text-black">Unmatched Autonomy</h4>
                      <p className="font-serif text-[14px] text-[#444] leading-[1.7]">Operate with elite tactical freedom. You dictate your execution flow.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-5">
                    <span className="font-mono text-[12px] font-medium text-black/30 mt-1">02</span>
                    <div className="flex flex-col gap-1">
                      <h4 className="font-sans text-[16px] font-medium text-black">Top-Tier Compensation</h4>
                      <p className="font-serif text-[14px] text-[#444] leading-[1.7]">Base salaries positioned in the 95th percentile, strictly paid in stablecoins or fiat per preference.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-5">
                    <span className="font-mono text-[12px] font-medium text-black/30 mt-1">03</span>
                    <div className="flex flex-col gap-1">
                      <h4 className="font-sans text-[16px] font-medium text-black">Institutional Reach</h4>
                      <p className="font-serif text-[14px] text-[#444] leading-[1.7]">Your architecture will directly index the portfolios of the largest global sovereign funds and entities.</p>
                    </div>
                  </li>
                </ul>
             </div>
           </div>
        </section>

        {/* ─── Open Positions ─── */}
        <section className="flex flex-col relative w-full pt-8">
          <div className="w-full pb-4 mb-4 flex items-end justify-between border-b border-black/10">
            <h2 className="text-[18px] font-medium font-sans text-black">
              Open Positions
            </h2>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-md bg-black/5 text-black/60 text-[10px] font-bold font-mono uppercase tracking-widest">
                1 Role
              </span>
            </div>
          </div>
          
          <div className="flex flex-col">
            <Link href="/careers/web3-educator" className="group flex flex-col sm:flex-row sm:items-center justify-between py-6 px-5 -mx-5 rounded-xl hover:bg-black/5 transition-all duration-300">
               <div className="flex flex-col gap-2">
                 <h3 className="font-sans text-[20px] font-medium text-black group-hover:text-[#00C076] transition-colors">Senior Web3 Educator</h3>
                 <div className="flex items-center gap-3 font-mono text-[11px] text-black/50 uppercase tracking-widest">
                   <span>Education</span>
                   <span>·</span>
                   <span>Remote</span>
                   <span>·</span>
                   <span>Global</span>
                 </div>
               </div>
               <div className="mt-4 sm:mt-0 flex items-center gap-5">
                 <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-black/40">Full-Time</span>
                 <span className="w-8 h-8 rounded-full border border-black/10 flex items-center justify-center text-black/30 group-hover:bg-black group-hover:border-black group-hover:text-white transition-all duration-300">
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                 </span>
               </div>
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
