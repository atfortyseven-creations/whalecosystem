import React from 'react';
import Link from 'next/link';
import { ApplicationForm } from '@/components/careers/ApplicationForm';

export default function Web3EducatorPage() {
  return (
    <div className="relative min-h-screen bg-[#FDFCF8] text-[#050505] selection:bg-black selection:text-[#FDFCF8] font-sans antialiased overflow-x-hidden pt-32 pb-24">
      <div className="w-full max-w-[850px] mx-auto px-5 sm:px-8 flex flex-col gap-12">
        
        <Link href="/careers" className="group font-mono text-[9px] uppercase tracking-[0.2em] text-black/40 hover:text-black flex items-center gap-2 w-fit transition-colors">
          <span className="text-[12px]">←</span> Return to Mandates
        </Link>

        <header className="flex flex-col gap-6 text-left mb-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-black/50 border border-black/10 px-2 py-1 bg-black/5">Remote / Global</span>
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-black/50 border border-black/10 px-2 py-1 bg-black/5">Full-Time</span>
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#0066FF] border border-[#0066FF]/20 px-2 py-1 bg-[#0066FF]/5">$60,000 - $90,000 USD / YR</span>
          </div>
          <h1 className="text-[32px] md:text-[42px] font-serif text-black leading-tight tracking-tight">
            Senior Web3 Educator
          </h1>
          <p className="font-serif text-[14px] text-[#222] leading-relaxed border-t border-b border-black/10 py-6">
            The Sovereign Terminal operates at the frontier of on-chain intelligence, utilizing stochastic filtering and zero-knowledge architecture to decode financial entropy. We require an educator capable of absolute precision to structure our academic curriculum, transforming institutional-grade heuristics into profound public mastery.
          </p>
        </header>

        <div className="flex flex-col gap-10">
          
          <section className="flex flex-col gap-4">
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-black border-l-2 border-black pl-3">
              The Directive
            </h3>
            <p className="font-serif text-[13px] text-[#333] leading-[1.8] text-justify">
              You will not be teaching basic cryptography. Your mandate is to elevate the global understanding of true decentralized sovereignty. You will architect the educational perimeter for our Whale Alert Network, explaining how we de-obfuscate dark entities, trace smart contract reentrancy vulnerabilities, and analyze macroeconomic liquidity flows directly from the mempool.
            </p>
          </section>

          <section className="flex flex-col gap-4">
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-black border-l-2 border-black pl-3">
              Absolute Requirements
            </h3>
            <ul className="flex flex-col gap-3 font-serif text-[13px] text-[#333] leading-[1.8]">
              <li className="flex items-start gap-3">
                <span className="mt-2 w-1 h-1 rounded-full bg-black shrink-0" />
                <span>+3 years of demonstrable experience in the Web3 ecosystem, specifically focused on DeFi architecture and on-chain analytics.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 w-1 h-1 rounded-full bg-black shrink-0" />
                <span>Flawless ability to synthesize highly complex technical concepts (ZK-SNARKs, deterministic settlement, algorithmic rehypothecation) into accessible, high-fidelity pedagogical materials.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 w-1 h-1 rounded-full bg-black shrink-0" />
                <span>Bilingual dominion of English and Spanish (Written and Spoken), ensuring our curriculum reaches global institutional and retail markets.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 w-1 h-1 rounded-full bg-black shrink-0" />
                <span>Proven trajectory creating high-impact tutorials, workshops, and comprehensive technical documentation.</span>
              </li>
            </ul>
          </section>

        </div>

        <div className="mt-16 pt-16 border-t-[1.5px] border-black">
          <ApplicationForm role="Senior Web3 Educator" />
        </div>

      </div>
    </div>
  );
}
