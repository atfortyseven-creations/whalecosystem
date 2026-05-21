"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const visionSections = [
  {
    title: "Introduction to Decentralized Analysis",
    paragraphs: [
      "The digital landscape stands at the precipice of a foundational transformation. For decades, the asymmetry of information has empowered monolithic entities while systematically disenfranchising the individual. In the realm of decentralized finance, this asymmetry manifests as an invisible architecture where latency, mempool visibility, and cryptographic correlation are monopolized by institutional actors.",
      "The Whale Alert Network is not merely an analytical interface; it is a declaration of cryptographic independence. By re-engineering the very structure of how on-chain data is ingested, processed, and visualized, we establish a new paradigm of absolute equity.",
      "Our vision transcends the rudimentary tracking of capital. We are constructing an omniscient, zero-knowledge exoskeleton for the human mind, enabling any individual to perceive the mathematical reality of global liquidity in real-time, without ever surrendering their right to absolute privacy."
    ]
  },
  {
    title: "The Zero-Trust Protocol",
    paragraphs: [
      "To build an infrastructure capable of protecting humanity from surveillance capitalism, we must fundamentally reject the concept of trust. Trust is a vulnerability. The Master Node operates on the principle of cryptographic verification.",
      "Every interaction, every session hydration, and every intelligence query is mathematically guaranteed by elliptic curve signatures. The server is blind. The network is blind. Your identity is a temporary, ephemeral hash that evaporates the moment your session concludes.",
      "We do not hold your keys. We do not track your coordinates. The system extracts reality from the blockchain, not from you."
    ]
  },
  {
    title: "Mobile and Desktop Integration",
    paragraphs: [
      "The physical constraints of human existence demand mobility. Yet, the computational demands of high-frequency on-chain intelligence require immense local processing power. The Protocol resolves this dichotomy through the PWA QR Handshake—a seamless bridge between terrestrial hardware and mobile freedom.",
      "Your desktop operates as the heavy computational node, ingesting thousands of mempool events per second, executing Neo4j graph traversals, and calculating gas vectors. Your mobile device, through an end-to-end encrypted WebSocket tunnel, becomes the terminal of consciousness.",
      "You carry the omniscient power of an institutional trading desk in your pocket, powered by a localized zero-knowledge bridge. This is the realization of ubiquitous, secure intelligence."
    ]
  },
  {
    title: "Market Flow Analytics",
    paragraphs: [
      "We do not observe static balances; we observe kinetic energy. The Ethereum Virtual Machine operates as a thermodynamic engine. By analyzing the execution of specific opcodes—such as the EIP-1153 Transient Storage vectors—we detect the gathering storm of institutional capital before it manifests on public markets.",
      "Our Z-Score anomaly detectors operate continuously across a rolling 14-block window, measuring the physical density of computational intention. This is not predictive modeling; it is the mathematical observation of reality unfolding.",
      "Through the interface, you are granted the capability to perceive these energetic shifts, allowing you to navigate the volatility of global markets with the precision of a high-frequency algorithmic protocol."
    ]
  },
  {
    title: "Multi-Hop Network Tracking",
    paragraphs: [
      "Capital obfuscates itself through complexity. Institutional actors distribute value across thousands of intermediary addresses to conceal their intentions. To combat this, we have engineered the Ledger—a Neo4j graph matrix capable of instantaneous multi-hop traversal.",
      "When a single digital asset shifts, the graph ripples. Our algorithms instantly correlate the source, tracing the provenance of capital through seven degrees of separation in under 200 milliseconds. The invisible networks of global liquidity are illuminated.",
      "This capability is no longer the exclusive domain of state actors and quantitative hedge funds. It is now embedded within the local hardware of every operator."
    ]
  },
  {
    title: "Identity and Verification",
    paragraphs: [
      "In an era where artificial intelligence can flawlessly simulate human behavior, the verification of unique humanity becomes the bedrock of democratic and financial systems. We integrate directly with zero-knowledge biometric systems, such as WorldID.",
      "However, our implementation ensures that the proof of your humanity remains mathematically decoupled from your terrestrial identity. We verify that you are a unique, living consciousness without ever knowing who you are.",
      "This cryptographic firewall protects the sanctity of the individual while guaranteeing the absolute integrity of the network."
    ]
  },
  {
    title: "Encrypted Communication",
    paragraphs: [
      "Freedom of expression is absolute only when it cannot be censored or repudiated. The Forum replaces the antiquated mechanisms of username and password with the undeniable reality of ECDSA signatures.",
      "Every transmission is signed by your localized private key. The network validates the signature without knowing the biological entity behind it. The message is persisted to an immutable log.",
      "This architecture guarantees that speech is free, authentic, and immune to central algorithmic suppression. It is a sanctuary for intelligence and coordination."
    ]
  },
  {
    title: "Edge Architecture",
    paragraphs: [
      "The physical infrastructure of the network is deployed across a globally distributed mesh of Edge runtimes. By utilizing Next.js, Cloudflare, and isolated Railway worker nodes, we have eliminated the single point of failure.",
      "When one node fails, the intelligence stream degrades gracefully into a decentralized memory matrix. The flow of data is unbroken. The perception of reality remains constant.",
      "This is not merely software engineering; it is the construction of a digital organism capable of surviving and thriving in the most hostile network environments."
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
    <div className="relative min-h-[100dvh] w-full overflow-x-hidden font-sans flex flex-col md:flex-row bg-white text-black selection:bg-black selection:text-white">
      {/* ── LEFT NAVIGATION (SIDEBAR) ── */}
      <aside className="w-full md:w-[300px] shrink-0 border-b md:border-b-0 md:border-r border-black/10 flex flex-col px-6 pt-8 pb-12 md:h-[100dvh] md:sticky md:top-0 bg-white z-50">
        
        {/* ── TOP BAR (from connect screen) ── */}
        <div className="w-full flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center shrink-0">
              <img src="/official-whale-monochrome.png" alt="Whale" className="w-full h-full object-contain" />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] font-black">
              Scanner Humanity Ledger
            </span>
          </div>
        </div>

        {/* ── DIVIDER ── */}
        <div className="w-full border-t border-black/8 mb-8" />

        {/* INDEX */}
        <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-black/40 mb-6 shrink-0 pl-2">
          Temas a explicar
        </div>
        
        <nav className="flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar pb-8">
          {visionSections.map((sec, index) => (
            <a 
              key={index} 
              href={`#tema-${index + 1}`} 
              className="group w-full flex items-center gap-4 p-4 rounded-2xl border border-black/5 bg-black/[0.02] hover:bg-black/[0.04] hover:border-black/10 active:scale-[0.97] transition-all duration-200 shadow-sm"
            >
              <div className="flex-1 text-left">
                <p className="text-[12px] font-black uppercase tracking-tight text-[#050505] leading-snug">
                  {sec.title}
                </p>
              </div>
            </a>
          ))}
        </nav>
      </aside>

      {/* MAIN VISION CONTENT */}
      <main className="flex-1 px-8 md:px-16 pt-16 md:pt-24 pb-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-24"
        >
          <h1 className="text-[48px] sm:text-[64px] md:text-[72px] font-normal tracking-[-0.04em] leading-[1.05] mb-8 font-sans max-w-[800px]">
            Achieving Proof of Financial Transparency
          </h1>
          <p className="text-[18px] md:text-[21px] leading-[1.6] text-black/70 font-light max-w-[650px]">
            How to build a zero-knowledge on-chain telemetry network in a way that maximizes individual empowerment and establishes absolute mathematical certainty across both mobile and terrestrial platforms.
          </p>
        </motion.div>

        <div className="flex flex-col gap-24 max-w-[800px]">
          {visionSections.map((sec, index) => (
            <motion.section
              key={index}
              id={`tema-${index + 1}`}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '100px' }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-[26px] md:text-[32px] font-normal tracking-tight mb-8">
                {sec.title}
              </h2>
              <div className="space-y-6">
                {sec.paragraphs.map((p, j) => (
                  <p key={j} className="text-[16px] md:text-[18px] leading-[1.8] text-[#111111] font-light text-justify">
                    {p}
                  </p>
                ))}
              </div>
            </motion.section>
          ))}
        </div>

        <footer className="mt-48 pt-12 border-t border-black/10 max-w-[800px]">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-40">
            © 2026 Humanity Ledger · The Architecture of Reality
          </p>
        </footer>
      </main>
    </div>
  );
}
