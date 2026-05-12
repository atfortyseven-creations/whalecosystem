import React from 'react';
import Link from 'next/link';
import { ApplicationForm } from '@/components/careers/ApplicationForm';
import { ArrowLeft, MapPin, Clock, DollarSign } from 'lucide-react';

export default function Web3EducatorPage() {
  return (
    <div className="relative min-h-screen bg-[#FAF9F6] text-[#050505] selection:bg-[#00C076]/30 font-sans antialiased overflow-x-hidden pt-32 pb-32">
      
      {/* ── Ambient Background Texture ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center z-0">
         <div className="w-[800px] h-[800px] bg-black/[0.02] rounded-full blur-[120px] absolute -top-40 opacity-70" />
      </div>

      <div className="relative z-10 w-full max-w-[800px] mx-auto px-6 sm:px-12 flex flex-col gap-12">
        
        <Link href="/careers" className="group font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#050505]/40 hover:text-[#050505] flex items-center gap-3 w-fit transition-colors">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
          Return to Mandates
        </Link>

        <header className="flex flex-col gap-6 text-left mb-4 border-b border-black/10 pb-10">
          <h1 className="text-[40px] md:text-[56px] font-black text-[#050505] leading-tight tracking-tight">
            Senior Web3 Educator
          </h1>
          <div className="flex flex-wrap items-center gap-4 mt-2">
            <div className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest text-[#050505]/60 bg-white border border-black/10 px-4 py-2 rounded-xl shadow-sm">
               <MapPin size={14} /> Remote
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest text-[#050505]/60 bg-white border border-black/10 px-4 py-2 rounded-xl shadow-sm">
               <Clock size={14} /> Full-Time
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px] font-black uppercase tracking-widest text-[#00C076] bg-[#00C076]/5 border border-[#00C076]/20 px-4 py-2 rounded-xl shadow-[0_0_15px_rgba(0,192,118,0.1)]">
               <DollarSign size={14} /> $60k - $90k USD
            </div>
          </div>
          <p className="font-serif text-[16px] text-[#050505]/70 leading-[1.8] mt-6 max-w-2xl">
            The Sovereign Terminal operates at the frontier of on-chain intelligence, utilizing stochastic filtering and zero-knowledge architecture to decode financial entropy. We require an educator capable of absolute precision to structure our academic curriculum, transforming institutional-grade heuristics into profound public mastery.
          </p>
        </header>

        <div className="flex flex-col gap-12">
          
          <section className="flex flex-col gap-5">
            <div className="flex items-center gap-3 mb-2">
               <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-[10px] font-black font-mono">01</div>
               <h3 className="font-sans text-[22px] font-bold tracking-tight text-[#050505]">
                 The Directive
               </h3>
            </div>
            <p className="font-serif text-[15px] text-[#050505]/70 leading-[1.8] pl-11">
              You will not be teaching basic cryptography. Your mandate is to elevate the global understanding of true decentralized sovereignty. You will architect the educational perimeter for our Whale Alert Network, explaining how we de-obfuscate dark entities, trace smart contract reentrancy vulnerabilities, and analyze macroeconomic liquidity flows directly from the mempool.
            </p>
          </section>

          <section className="flex flex-col gap-5">
            <div className="flex items-center gap-3 mb-2">
               <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-[10px] font-black font-mono">02</div>
               <h3 className="font-sans text-[22px] font-bold tracking-tight text-[#050505]">
                 Absolute Requirements
               </h3>
            </div>
            <ul className="flex flex-col gap-5 font-serif text-[15px] text-[#050505]/70 leading-[1.8] pl-11">
              <li className="flex items-start gap-4">
                <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-[#00C076] shrink-0 shadow-[0_0_8px_#00C076]" />
                <span>+3 years of demonstrable experience in the Web3 ecosystem, specifically focused on DeFi architecture and on-chain analytics.</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-[#00C076] shrink-0 shadow-[0_0_8px_#00C076]" />
                <span>Flawless ability to synthesize highly complex technical concepts (ZK-SNARKs, deterministic settlement, algorithmic rehypothecation) into accessible, high-fidelity pedagogical materials.</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-[#00C076] shrink-0 shadow-[0_0_8px_#00C076]" />
                <span>Bilingual dominion of English and Spanish (Written and Spoken), ensuring our curriculum reaches global institutional and retail markets.</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-[#00C076] shrink-0 shadow-[0_0_8px_#00C076]" />
                <span>Proven trajectory creating high-impact tutorials, workshops, and comprehensive technical documentation.</span>
              </li>
            </ul>
          </section>

        </div>

        <div className="mt-16 pt-16 border-t border-black/10">
          <ApplicationForm role="Senior Web3 Educator" />
        </div>

      </div>
    </div>
  );
}
