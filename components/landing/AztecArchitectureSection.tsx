"use client";

import React, { useState } from "react";
import { RemoteLottie } from "@/components/ui/RemoteLottie";

const SECURITY_PILLARS = [
  {
    index: "01",
    label: "Aztec Network Substrate",
    protocol: "PRIVACY-FIRST L2 ZK-ROLLUP",
    body: "The Sovereign Terminal's core cryptographic layer is anchored to the Aztec Network. Rather than relying on transparent EVM execution, our system leverages Aztec's privacy-preserving virtual machine. By executing private functions directly on the user's device and managing encrypted UTXOs, we guarantee that all smart contract logic, capital flows, and state transitions remain strictly confidential before settling securely on Ethereum."
  },
  {
    index: "02",
    label: "Absolute Privacy",
    protocol: "ZERO-KNOWLEDGE ARCHITECTURE",
    body: "Whale Alert Network ensures that your identity, portfolio, and strategic operations remain completely invisible. Our infrastructure guarantees that your intelligence gathering leaves no trace, operating with absolute discretion at all times."
  },
  {
    index: "03",
    label: "Institutional Security",
    protocol: "CRYPTOGRAPHIC VAULT",
    body: "Built specifically for demanding funds and quantitative analysts, our platform operates without conventional passwords. We rely on mathematically verified cryptography to secure your session, eliminating the vulnerabilities associated with traditional data breaches."
  },
  {
    index: "04",
    label: "Untraceable Operations",
    protocol: "E2EE ENCRYPTED TUNNELS",
    body: "Every action you take within the Sovereign Terminal, from market queries to direct communications, is routed through secure, end-to-end encrypted tunnels. Your strategy is your edge; we make sure it never becomes public knowledge."
  }
];

const HIGHLIGHTS = [
  { key: "Underlying Infrastructure", value: "Aztec L2 zkRollup" },
  { key: "State Management", value: "Encrypted UTXOs (Private State)" },
  { key: "Encryption Standard", value: "AES-GCM-256" },
  { key: "Identity Verification", value: "Biometric Liveness Proofs" },
  { key: "Session Control", value: "Zero-Knowledge Mathematics" },
  { key: "Cross-Layer Execution", value: "Seamless L1 ↔ L2 Messaging" }
];

const AZTEC_EXTENDED_POINTS = [
  {
    title: "Private Functions",
    desc: "Client-side execution of proprietary logic guarantees that your operational algorithms and parameter configurations remain entirely confidential before any state generation occurs."
  },
  {
    title: "Public Functions",
    desc: "Transparent virtual machine operations reserved exclusively for synchronized liquidity pools where global state visibility is a mandatory regulatory requirement."
  },
  {
    title: "Encrypted UTXOs",
    desc: "Mathematical representations of assets and strategic data structured as Unspent Transaction Outputs, ensuring that only the entity holding the decryption key can access the underlying variables."
  },
  {
    title: "Public Merkle Trees",
    desc: "Transparent state maintenance utilized strictly for global consensus and network health verification, carefully isolated to prevent the leakage of any specific institutional entity data."
  },
  {
    title: "Atomic Composability",
    desc: "Seamless interoperability bridging private UTXO state and public transparent state within a single transaction, allowing complex quantitative strategies to execute without fragmentation."
  },
  {
    title: "L1 ↔ L2 Messaging",
    desc: "A secure, trustless message-passing protocol between Ethereum Mainnet and the Sovereign Terminal's Rollup, eliminating reliance on vulnerable third-party bridging infrastructure."
  },
  {
    title: "Client-Side Proving",
    desc: "The generation of zero-knowledge proofs occurs directly on your local hardware. This architectural decision mathematically guarantees that no unencrypted data is ever transmitted to centralized sequencers."
  },
  {
    title: "Decentralized Sequencing",
    desc: "A distributed network of node operators responsible for ordering transactions. Because payloads are encrypted prior to submission, sequencers cannot decipher, front-run, or censor your operations."
  },
  {
    title: "Noir Circuit Logic",
    desc: "Smart contracts are written in Noir, a Rust-based domain-specific language designed for creating provably secure, bug-free cryptographic circuits tailored for high-frequency environments."
  },
  {
    title: "Anti-Sybil Synergies",
    desc: "By blending Aztec's cryptographic anonymity with our proprietary Biometric ZK-Liveness checks, the network completely eliminates automated botnets while preserving the absolute privacy of human operators."
  }
];

export function AztecArchitectureSection() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <section
      className="w-full bg-[#FAFAF8] border-t border-black/8"
      aria-label="Institutional Security Architecture"
    >
      <div className="w-full max-w-[2560px] mx-auto px-5 sm:px-8 py-24 flex flex-col gap-16 items-center">

        {/* ── Section Header ── */}
        <div className="w-full max-w-[850px] flex flex-col gap-6 text-left">
          <div className="border-b-[1.5px] border-black pb-3 flex items-end justify-between">
            <h2 className="font-mono text-[12px] font-bold uppercase tracking-[0.2em] text-black">
              Security Infrastructure — Zero-Trust Protocol
            </h2>
          </div>

          <div className="flex flex-col gap-4 font-serif text-[15px] sm:text-[16px] text-[#222] leading-relaxed text-left">
            <p>
              In the modern era of on-chain intelligence, raw data is only half of the equation. 
              The true advantage lies in <strong>operational secrecy</strong>. Our infrastructure is built 
              from the ground up on a foundation of absolute privacy, ensuring that your institutional 
              movements and analytical queries are never exposed.
            </p>
            <p>
              Unlike conventional analytics platforms that transparently track your behavior, 
              the Sovereign Terminal separates the act of gathering intelligence from the act of revealing it. 
              You gain total visibility over the market, while remaining completely invisible to it.
            </p>
          </div>
        </div>

        {/* ── Security Pillars ── */}
        <div className="w-full max-w-[850px]">
          <div className="flex flex-col gap-[1px] bg-black border border-black shadow-sm">
            {SECURITY_PILLARS.map((pillar) => {
              const isOpen = expanded === pillar.index;
              return (
                <button
                  key={pillar.index}
                  onClick={() => setExpanded(isOpen ? null : pillar.index)}
                  className="bg-white text-left flex flex-col sm:flex-row items-stretch group overflow-hidden hover:bg-[#FAFAF8] transition-colors duration-200 w-full"
                >
                  {/* Index column */}
                  <div className="w-full sm:w-[100px] bg-[#FAFAF8] group-hover:bg-[#f2f1eb] border-b sm:border-b-0 sm:border-r border-black/10 flex items-center justify-center p-4 shrink-0 transition-colors duration-200">
                    <span className="font-mono text-[22px] font-black text-black/15 leading-none select-none">
                      {pillar.index}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-5 flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <span className="font-mono text-[11px] font-black uppercase tracking-widest text-black text-left">
                        {pillar.label}
                      </span>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono text-[8px] uppercase tracking-widest text-black/40 bg-black/5 px-2 py-0.5 border border-black/8 text-left">
                          {pillar.protocol}
                        </span>
                        <span className="font-mono text-[10px] text-black/20 select-none">
                          {isOpen ? "−" : "+"}
                        </span>
                      </div>
                    </div>

                    {isOpen && (
                      <p className="font-serif text-[14px] sm:text-[15px] text-[#333] leading-[1.75] text-left border-t border-black/8 pt-4 mt-2">
                        {pillar.body}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Technical Highlights ── */}
        <div className="w-full max-w-[850px] flex flex-col gap-0">
          <div className="border-b border-black pb-2 mb-0">
            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-black/50 font-bold">
              Infrastructure Highlights
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[1px] bg-black/10 border border-black/10 border-t-0">
            {HIGHLIGHTS.map((spec) => (
              <div key={spec.key} className="bg-white flex flex-col sm:flex-row items-stretch">
                <div className="w-full sm:w-[200px] bg-[#FAFAF8] border-b sm:border-b-0 sm:border-r border-black/8 px-4 py-3 flex items-center shrink-0">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-black/45 font-bold">
                    {spec.key}
                  </span>
                </div>
                <div className="flex-1 px-4 py-3 flex items-center">
                  <span className="font-mono text-[11px] text-black font-black tracking-wide">
                    {spec.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Extended Aztec Integration ── */}
        <div className="w-full max-w-[1200px] flex flex-col lg:flex-row gap-12 mt-12 border-t border-black pb-12 pt-16">
          
          <div className="w-full lg:w-[35%] flex flex-col gap-6">
            <h3 className="font-mono text-[14px] font-bold uppercase tracking-[0.2em] text-black">
              Deep Integration Substrate
            </h3>
            <p className="font-serif text-[15px] text-[#444] leading-relaxed text-left">
              The fusion of the Whale Alert Network and Aztec Network creates an impenetrable cryptographic shield. This integration relies on specialized primitives operating in perfect synchrony, designed strictly for entities requiring institutional-grade execution without compromising strategic opacity.
            </p>
            <div className="w-full aspect-square bg-white rounded-[2rem] border border-black/10 shadow-sm flex items-center justify-center p-8 overflow-hidden relative mt-4">
               <div className="absolute inset-0 bg-gradient-to-b from-[#FAFAF8]/50 to-transparent mix-blend-multiply" />
               <RemoteLottie path="Isometric data analysis.json" className="scale-[1.15] opacity-95" />
            </div>
          </div>

          <div className="w-full lg:w-[65%] grid grid-cols-1 sm:grid-cols-2 gap-[1px] bg-black/10 border border-black/10 shadow-sm">
            {AZTEC_EXTENDED_POINTS.map((pt, i) => (
              <div key={i} className="bg-white p-6 sm:p-8 hover:bg-[#FAFAF8] transition-colors duration-300 flex flex-col justify-center">
                <span className="font-mono text-[10px] font-black uppercase tracking-[0.15em] text-black mb-3 block">
                  {pt.title}
                </span>
                <p className="font-serif text-[14px] text-[#555] leading-[1.65] text-left">
                  {pt.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Closing Statement ── */}
        <div className="w-full max-w-[850px] border-l-2 border-black pl-5 flex flex-col gap-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-black/35 font-bold">
            The Institutional Edge
          </span>
          <p className="font-serif text-[14px] text-[#444] leading-relaxed text-left">
            Your intelligence is only as valuable as your ability to protect it. 
            Whale Alert Network provides the definitive shield, allowing you to intercept, 
            analyze, and execute upon the flow of global capital without ever becoming the target.
          </p>
        </div>

      </div>
    </section>
  );
}
