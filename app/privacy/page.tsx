"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const visionSections = [
  {
    title: "Introduction to Decentralized Analysis",
    paragraphs: [
      "The digital landscape stands at the precipice of a foundational transformation. For decades, the asymmetry of information has empowered monolithic entities while systematically disenfranchising the individual. In the realm of decentralized finance, this asymmetry manifests as an invisible architecture where latency, mempool visibility, and cryptographic correlation are monopolized by institutional actors, quantitative hedge funds, and state-level surveillance apparatuses.",
      "The Whale Alert Network is not merely an analytical interface; it is a declaration of cryptographic independence. By re-engineering the very structure of how on-chain data is ingested, processed, and visualized, we establish a new paradigm of absolute equity. We have dismantled the silos of premium data and decentralized the very core of financial perception.",
      "Our vision transcends the rudimentary tracking of capital. We are constructing an omniscient, zero-knowledge exoskeleton for the human mind, enabling any individual to perceive the mathematical reality of global liquidity in real-time, without ever surrendering their right to absolute privacy. By flattening the technological playing field, we ensure that the democratization of finance is not a marketing slogan, but a mathematically enforced reality.",
      "Every user, regardless of their geographical location or capital access, is granted the exact same sub-millisecond telemetry that was previously reserved for entities paying millions in proprietary data feeds. The blockchain is a public ledger, and its truth must be equally and universally accessible to all conscious observers."
    ]
  },
  {
    title: "The Zero-Trust Protocol",
    paragraphs: [
      "To build an infrastructure capable of protecting humanity from surveillance capitalism, we must fundamentally reject the concept of trust. Trust is a vulnerability. It is the attack vector through which data is harvested, sold, and weaponized. The Master Node operates on the uncompromising principle of cryptographic verification.",
      "Every interaction, every session hydration, and every intelligence query is mathematically guaranteed by elliptic curve signatures (ECDSA). The server is inherently blind to the biological identity of the operator. The network is blind to your intentions. Your identity within the protocol is a temporary, ephemeral hash that evaporates into the cryptographic void the moment your session concludes.",
      "We do not hold your keys. We do not track your coordinates. We do not deploy cookies or persistent tracking pixels. The system extracts reality from the blockchain, not from you. When you query the graph matrix for a complex transaction cluster, the edge node process handles the calculation in isolated memory, encrypts the result with your temporary session key, and immediately purges the execution environment.",
      "By eliminating the persistent database of user activity, we eliminate the honeypot. If our servers are ever seized or compromised by hostile actors, there is nothing to extract. There is only a continuous stream of ephemeral mathematics, untethered from any human identity. This is the absolute realization of privacy by design."
    ]
  },
  {
    title: "Mobile and Desktop Integration",
    paragraphs: [
      "The physical constraints of human existence demand mobility. We navigate the physical world constantly. Yet, the computational demands of high-frequency on-chain intelligence require immense local processing power, typically restricting this level of analysis to massive desktop rigs and server farms. The Protocol resolves this dichotomy through the PWA QR Handshake—a seamless, cryptographic bridge between terrestrial hardware and mobile freedom.",
      "Your desktop operates as the heavy computational node, ingesting thousands of mempool events per second, executing complex Neo4j graph traversals, and calculating multi-dimensional gas vectors. It handles the heavy lifting, maintaining a persistent WebSocket connection to the global mesh.",
      "Your mobile device, however, acts as the terminal of consciousness. Through a hyper-secure, end-to-end encrypted local tunnel initiated by scanning a high-entropy QR code, your phone interfaces directly with your desktop's computational output. The data flows locally, bypassing our central servers entirely for the visualization layer.",
      "You carry the omniscient power of an institutional trading desk in your pocket, powered by a localized zero-knowledge bridge. This architecture ensures that even when you are mobile, your data remains localized, your latency remains negligible, and your perception of the market remains absolute."
    ]
  },
  {
    title: "Market Flow Analytics",
    paragraphs: [
      "We do not observe static balances; we observe kinetic energy. Traditional analytics are inherently reactive, displaying the aftermath of financial movements. The Ethereum Virtual Machine, however, operates as a thermodynamic engine, and its impending states can be mathematically deduced before they are permanently recorded. By analyzing the execution of specific opcodes—such as the EIP-1153 Transient Storage vectors (TSTORE and TLOAD)—we detect the gathering storm of institutional capital before it manifests on public markets.",
      "Our Z-Score anomaly detectors operate continuously across a rolling 14-block window, measuring the physical density of computational intention. This is not predictive modeling based on historical price action; it is the mathematical observation of reality unfolding at the compiler level.",
      "When a complex, multi-hop arbitrage or a massive liquidity provision is initiated in the mempool, our algorithms calculate the standard deviation of its gas consumption and execution depth against the global baseline. If the Z-Score breaches a critical threshold, the interface immediately illuminates this kinetic shift.",
      "Through the interface, you are granted the capability to perceive these energetic shifts in real-time, allowing you to navigate the extreme volatility of global crypto markets with the precision of a high-frequency algorithmic protocol. You are no longer reacting to the market; you are observing its molecular formation."
    ]
  },
  {
    title: "Multi-Hop Network Tracking",
    paragraphs: [
      "Capital actively obfuscates itself through complexity. Institutional actors and adversarial entities distribute value across thousands of intermediary addresses, utilizing mixers, bridges, and cross-chain swaps to conceal their ultimate intentions. To combat this enforced obscurity, we have engineered the Ledger—a massive Neo4j graph matrix capable of instantaneous, multidimensional multi-hop traversal.",
      "When a single digital asset shifts from a known accumulation wallet, the graph ripples. Our algorithms do not merely track the direct transfer; they instantly correlate the source, tracing the provenance and destination of capital through up to seven degrees of separation in under 200 milliseconds. The invisible networks of global liquidity, previously hidden within the noise of millions of transactions, are brilliantly illuminated.",
      "The interface visualizes these complex relationships as a dynamic, interactive web. You can visually identify \"smurfing\" (the division of large sums into smaller, less noticeable transactions) and detect the gravitational pull of major liquidity pools as capital flows toward them through seemingly unrelated intermediary wallets.",
      "This unprecedented capability is no longer the exclusive domain of state-level forensic actors and quantitative hedge funds. It is now embedded within the local hardware of every single operator on the network, democratizing the power of deep-chain forensics."
    ]
  },
  {
    title: "Identity and Verification",
    paragraphs: [
      "In an era where artificial intelligence can flawlessly simulate human behavior, generating millions of autonomous agents capable of overwhelming networks, the verification of unique humanity becomes the bedrock of both democratic consensus and stable financial systems. However, traditional KYC (Know Your Customer) systems require the mass harvesting of highly sensitive biometric and governmental data, creating massive honeypots and violating fundamental privacy rights.",
      "We integrate directly with zero-knowledge biometric systems, such as the WorldID protocol. However, our implementation ensures that the mathematical proof of your humanity remains entirely decoupled from your terrestrial identity. We verify that you are a unique, living consciousness without ever knowing who you are, what your name is, or where you reside.",
      "When you authenticate, the biometric hardware generates a localized, zero-knowledge proof. Our servers receive only a cryptographic nullifier hash—a string of characters that mathematically proves you have passed the biometric check, but contains absolutely zero information about your physical traits. This hash ensures that one human can only hold one account.",
      "This cryptographic firewall protects the sanctity of the individual while guaranteeing the absolute integrity of the network against Sybil attacks. It is the perfect synthesis of absolute systemic security and absolute personal anonymity."
    ]
  },
  {
    title: "Encrypted Communication",
    paragraphs: [
      "Freedom of expression is absolute only when it cannot be censored, manipulated, or repudiated. Traditional digital forums rely on centralized databases to store messages, making them vulnerable to algorithmic suppression, administrative censorship, and unauthorized alteration. The Whale Chat Forum replaces these antiquated mechanisms of control with the undeniable reality of ECDSA cryptographic signatures.",
      "Every transmission, every strategy shared, and every alert broadcasted is signed by your localized, ephemeral private key. The network validates the signature without knowing the biological entity behind it, mathematically ensuring that the message was genuinely authored by a verified human consciousness and has not been tampered with in transit.",
      "Furthermore, for private coordination, the network utilizes robust end-to-end encryption. The plaintext of the message is encrypted locally on your device using the recipient's public key. The server only routes the ciphertext. We literally do not possess the mathematical capability to read the contents of your private communications.",
      "This architecture guarantees that speech within the Humanity Ledger is free, authentic, and completely immune to central algorithmic suppression. It is a cryptographic sanctuary for real-time intelligence sharing and global coordination, fundamentally unbreakable by any central authority."
    ]
  },
  {
    title: "Edge Architecture",
    paragraphs: [
      "The physical infrastructure of the network is deployed across a globally distributed mesh of Edge runtimes, designed for maximum resilience and minimal latency. By utilizing Vercel's global edge network, Cloudflare's security layer, and heavily isolated Railway worker nodes, we have systematically eliminated any single point of failure.",
      "Traditional systems rely on monolithic databases located in specific geographic regions, making them highly vulnerable to localized outages, state-level censorship, or targeted Distributed Denial of Service (DDoS) attacks. Our architecture is fluid. Data processing is pushed directly to the edge, running on servers physically located mere miles from the end-user.",
      "When one node fails, or is subjected to an overwhelming attack, the intelligence stream does not collapse; it degrades gracefully. WebSocket connections automatically and seamlessly reconnect to the nearest surviving node using geographic Anycast routing. The global state is maintained in a decentralized memory matrix (Redis clusters), ensuring that the flow of data is unbroken.",
      "This is not merely standard software engineering; it is the deliberate construction of a decentralized digital organism capable of surviving and thriving in the most hostile network environments imaginable. The perception of reality provided by the network remains constant, immune to both physical and digital disruption."
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
