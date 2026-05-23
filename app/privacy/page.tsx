"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const visionSections = [
  {
    title: "Programmable Privacy by Default",
    paragraphs: [
      "The current architecture of decentralized finance enforces radical transparency, forcing users to broadcast their entire financial history to participate in the ecosystem. This fundamentally limits the scope of what can be built on-chain and compromises individual sovereignty.",
      "We believe that privacy is a fundamental human right, not an optional feature. By integrating Aztec Network's zero-knowledge architecture, we establish a paradigm where programmable privacy is the default state. You maintain absolute control over your transaction graph, balances, and interaction history while retaining the ability to prove compliance selectively.",
      "Our infrastructure utilizes Noir, the universal zero-knowledge language, to create private smart contract interactions. This ensures that your state transitions are cryptographically verified by the network without ever exposing the underlying data to public observers."
    ]
  },
  {
    title: "Client-Side Proving",
    paragraphs: [
      "True decentralization requires eliminating trust in intermediaries. Sending raw data to a centralized prover inherently violates privacy. We enforce a client-side proving model where all zero-knowledge proofs are generated locally on your device.",
      "When you execute a transaction or query a sensitive state, the cryptographic operations occur within your local execution environment. Only the verified proof and the state update commitments are broadcast to the Aztec rollup. The network validates the mathematics without ever gaining visibility into your inputs.",
      "This architecture guarantees that neither our servers, the rollup sequencers, nor any third-party observers can intercept or reconstruct your financial activity. Your data never leaves your device."
    ]
  },
  {
    title: "Encrypted State Architecture",
    paragraphs: [
      "Unlike traditional EVM networks where all state is public, our protocol utilizes Aztec's hybrid state model, combining public variables with private, encrypted state notes. Private state is represented as an append-only tree of UTXOs (Unspent Transaction Outputs), fully encrypted using your viewing keys.",
      "When you receive assets or interact with private smart contracts, the resulting state changes are recorded as encrypted commitments on the blockchain. You alone possess the cryptographic keys necessary to decrypt and access these notes.",
      "This mechanism ensures that your portfolio balance and interaction history remain invisible to the public ledger while remaining mathematically verifiable and securely composable within the broader decentralized ecosystem."
    ]
  },
  {
    title: "Decentralized Sequencer Network",
    paragraphs: [
      "A privacy network is only as secure as its sequencing layer. Relying on a centralized sequencer creates a single point of failure and introduces censorship risks. Our integration aligns with Aztec's vision for a fully decentralized network of provers and sequencers.",
      "By participating in a decentralized rollup architecture, we guarantee that no single entity can censor your transactions, reorder your execution for MEV extraction, or deny you access to the network.",
      "The consensus mechanism ensures that as long as you provide a valid zero-knowledge proof, your state transition will be included and finalized securely on Ethereum Layer 1."
    ]
  },
  {
    title: "Selective Compliance and Disclosure",
    paragraphs: [
      "Privacy does not mean opacity to regulation; it means having the sovereign right to choose when and with whom to share your data. The platform enables selective disclosure through zero-knowledge compliance proofs.",
      "If required to prove the origin of funds, verify your identity, or demonstrate solvency to an auditor, you can generate specific cryptographic proofs that validate these facts without exposing your entire transaction history.",
      "This dual capability—absolute default privacy combined with programmable, verifiable disclosure—provides the necessary infrastructure for institutional adoption while fiercely protecting individual liberty."
    ]
  }
];

export default function PrivacyVisionPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative min-h-[100dvh] w-full overflow-x-hidden font-sans flex flex-col md:flex-row bg-[#020605] text-white selection:bg-[#c4f344] selection:text-black">
      {/* LEFT NAVIGATION */}
      <aside className="w-full md:w-[300px] shrink-0 border-b md:border-b-0 md:border-r border-white/10 flex flex-col px-6 pt-8 pb-12 md:h-[100dvh] md:sticky md:top-0 bg-[#020605] z-50">
        
        {/* TOP BAR */}
        <div className="w-full flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center shrink-0">
              <img src="/aztec-logo.svg" alt="Aztec" className="w-full h-full object-contain filter invert" />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] font-black text-[#c4f344]">
              Privacy Architecture
            </span>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="w-full border-t border-white/10 mb-8" />

        {/* INDEX */}
        <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/40 mb-6 shrink-0 pl-2">
          Core Principles
        </div>
        
        <nav className="flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar pb-8">
          {visionSections.map((sec, index) => (
            <a 
              key={index} 
              href={`#principle-${index + 1}`} 
              className="group w-full flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-[#c4f344]/30 active:scale-[0.97] transition-all duration-200 shadow-sm"
            >
              <div className="flex-1 text-left">
                <p className="text-[12px] font-bold uppercase tracking-tight text-white/80 group-hover:text-[#c4f344] leading-snug transition-colors">
                  {sec.title}
                </p>
              </div>
            </a>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 px-8 md:px-16 pt-16 md:pt-24 pb-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-24"
        >
          <h1 className="text-[48px] sm:text-[64px] md:text-[72px] font-normal tracking-[-0.04em] leading-[1.05] mb-8 font-serif italic max-w-[800px]">
            The Privacy Layer for Web3.
          </h1>
          <p className="text-[18px] md:text-[21px] leading-[1.6] text-white/70 font-light max-w-[650px]">
            Building the foundation for programmable, default privacy using advanced Zero-Knowledge cryptography and client-side proving architecture.
          </p>
        </motion.div>

        <div className="flex flex-col gap-24 max-w-[800px]">
          {visionSections.map((sec, index) => (
            <motion.section
              key={index}
              id={`principle-${index + 1}`}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '100px' }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-[26px] md:text-[32px] font-medium tracking-tight mb-8 text-[#c4f344]">
                {sec.title}
              </h2>
              <div className="space-y-6">
                {sec.paragraphs.map((p, j) => (
                  <p key={j} className="text-[16px] md:text-[18px] leading-[1.8] text-white/80 font-light text-justify">
                    {p}
                  </p>
                ))}
              </div>
            </motion.section>
          ))}
        </div>

        <footer className="mt-48 pt-12 border-t border-white/10 max-w-[800px]">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-40">
            © 2026 Humanity Ledger · Powered by Aztec Network
          </p>
        </footer>
      </main>
    </div>
  );
}
