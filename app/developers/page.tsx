"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Terminal, Lock, Activity, Users, Server, Globe, Cpu, ArrowDown, ShieldCheck, Database, Key } from "lucide-react";
import Link from "next/link";
import AntiPhishing from "@/components/security/AntiPhishing";

// ─── UTILITIES ───
const StaggeredText = ({ text, className }: { text: string; className?: string }) => {
  return (
    <motion.span 
      initial="hidden" 
      whileInView="visible" 
      viewport={{ once: true }} 
      transition={{ staggerChildren: 0.03 }}
      className={className}
    >
      {text.split("").map((char, index) => (
        <motion.span 
          key={index} 
          variants={{ 
            hidden: { opacity: 0, y: 20 }, 
            visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } } 
          }}
          className="inline-block"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.span>
  );
};

// ─── COMPONENTS ───

// 1. Builder Announcements
const BuilderAnnouncements = () => {
  const announcements = [
    {
      date: "03 May",
      title: "EdDSA Asymmetric JWT Middleware Deployed",
      desc: "The Sovereign Identity Protocol v4 has successfully transitioned from symmetric HS256 to Ed25519 asymmetric cryptography. Middleware verification now operates at zero-trust edge velocities, guaranteeing absolute session integrity without secret exposure.",
      action: "Review Architecture",
    },
    {
      date: "01 May",
      title: "X25519 Ephemeral QR Mesh Handshake Live",
      desc: "Eradicating Man-in-the-Middle (MitM) vectors. The new QR handshake establishes an ephemeral X25519 key exchange coupled with AES-GCM encryption, tunneling EIP-191 signatures from mobile enclaves directly to the desktop terminal.",
      action: "Inspect Protocol",
    },
    {
      date: "28 Apr",
      title: "MiCA Article 72 'Right to Be Forgotten' Toolkit",
      desc: "Institutional compliance achieved. The new Privacy-by-Void toolkit executes programmatic entity wiping and irreversible SHA-256 data hashing, fulfilling the European Union's GDPR and MiCA requirements autonomously.",
      action: "Read Documentation",
    }
  ];

  return (
    <div className="w-full max-w-[1400px] mx-auto py-32 px-6">
      <div className="flex flex-col md:flex-row justify-between items-start mb-16 gap-8">
        <h2 className="font-aztec-serif text-5xl md:text-7xl font-black text-[var(--aztec-ink)] leading-[0.9]">
          Infrastructure <br /><span className="italic text-[var(--aztec-orchid)]">Releases</span>
        </h2>
        <div className="w-full border-t flex-1 mt-6 border-[var(--aztec-ink)]/10" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {announcements.map((a, i) => (
          <motion.div 
             key={i}
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.6, delay: i * 0.1 }}
             className="group relative bg-[var(--aztec-parchment)] p-8 md:p-12 border border-[var(--aztec-ink)]/10 hover:border-[var(--aztec-orchid)]/50 transition-all cursor-pointer shadow-lg hover:shadow-2xl overflow-hidden min-h-[450px] flex flex-col justify-between"
          >
             <div className="absolute inset-0 noise-bg opacity-[0.03] pointer-events-none mix-blend-multiply" />
             <div className="relative z-10">
               <div className="font-aztec-mono text-[10px] uppercase tracking-widest text-[var(--aztec-ink)]/40 mb-8">{a.date}</div>
               <h3 className="font-aztec-serif text-2xl lg:text-3xl font-black text-[var(--aztec-ink)] mb-6 leading-tight group-hover:text-[var(--aztec-orchid)] transition-colors">
                  {a.title}
               </h3>
               <p className="font-sans text-[var(--aztec-ink)]/60 text-base lg:text-lg leading-relaxed mb-8">
                  {a.desc}
               </p>
             </div>
             <div className="relative z-10 font-aztec-mono text-[11px] font-black uppercase tracking-widest text-[var(--aztec-ink)] flex items-center gap-4 hover:gap-6 transition-all group-hover:text-[var(--aztec-orchid)]">
                {a.action} <ArrowRight size={14} />
             </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// 2. The Full Stack (01-08)
const FullStack = () => {
  const stacks = [
    { num: "01", title: "Zero-Trust Cryptographic Identity", desc: "We refuse to delegate trust to centralized credential databases. Identity within the Sovereign Terminal is established exclusively through mathematically provable ownership of a cryptographic private key, enforcing a strict Privacy-by-Void mandate." },
    { num: "02", title: "Ephemeral QR Mesh Handshakes", desc: "Cross-device authentication is secured via an ephemeral X25519 key exchange and AES-GCM encryption. The mobile enclave securely tunnels the signed EIP-191 payload directly to the desktop session, unconditionally thwarting session hijacking and spoofing vectors." },
    { num: "03", title: "EdDSA Asymmetric Edge Middleware", desc: "The transition from symmetric HS256 to Ed25519 (EdDSA) asymmetric cryptography allows our Edge routing to mathematically verify authentication tokens in microseconds, rendering session manipulation categorically impossible." },
    { num: "04", title: "Redis-Backed Tiered Rate Limiting", desc: "A transient, high-performance Redis cluster governs session rate-limiting autonomously. Institutional thresholds are dynamically extracted from the EdDSA JWT and enforced per-request, mitigating excessive consumption and preserving terminal thermodynamics." },
    { num: "05", title: "Neo4j Heuristic Graph Matrix", desc: "We have eschewed antiquated two-dimensional SQL in favor of topological graph databases. Neo4j allows us to de-obfuscate institutional capital transfers up to seven hops deep, isolating algorithmic signatures from the chaotic noise of the mempool." },
    { num: "06", title: "EVM Thermodynamics & Z-Score Alerts", desc: "By tracking computational energy expenditure and transient storage (EIP-1153) intra-block, our systems deploy Z-Score anomaly calculations to detect the stealthy accumulation of massive institutional positions prior to spot market manifestation." },
    { num: "07", title: "Sovereign Forum & Privacy-by-Void", desc: "A decentralized communication agora where identities are unalterably linked to wallet signatures. To adhere to MiCA and GDPR standards, all personally identifiable data is subjected to irreversible SHA-256 entity hashing upon triggering the 'Right to Be Forgotten'." },
    { num: "08", title: "Institutional Pricing & Sovereign Credits", desc: "The SaaS monetization framework utilizes atomic Sovereign Credits, integrated with BullMQ for zero-trust tracking. Verified institutional activity is rewarded through the Humanity Ledger via sophisticated 1x-4x retention multipliers." }
  ];

  return (
    <div className="w-full max-w-[1400px] mx-auto py-40 px-6">
      <div className="mb-24 px-4 border-l-4 border-[var(--aztec-chartreuse)]">
         <h2 className="font-aztec-serif text-5xl lg:text-7xl font-black text-[var(--aztec-ink)] leading-[0.85] uppercase">
            The Institutional<br/> <span className="italic">Security Architecture</span>.
         </h2>
         <p className="mt-8 font-sans text-xl text-[var(--aztec-ink)]/60 max-w-3xl leading-relaxed">
            Every layer of the Sovereign Network is engineered with uncompromising rigor. We have dismantled legacy paradigms, replacing them with a purely deterministic, mathematically provable framework.
         </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-24 gap-x-16 lg:gap-x-32">
        {stacks.map((s, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: (i % 2) * 0.2 }}
            className="group"
          >
            <div className="font-aztec-mono text-3xl font-black text-[var(--aztec-ink)]/20 mb-6 group-hover:text-[var(--aztec-chartreuse)] transition-colors duration-500">
               ( {s.num} )
            </div>
            <h3 className="font-aztec-serif text-3xl md:text-4xl font-black text-[var(--aztec-ink)] leading-tight mb-8 group-hover:text-[var(--aztec-ink)]">
               {s.title}
            </h3>
            <p className="font-sans text-lg text-[var(--aztec-ink)]/70 leading-relaxed border-l border-[var(--aztec-ink)]/10 pl-6 group-hover:border-[var(--aztec-chartreuse)] transition-colors duration-500">
               {s.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// 3. Tools and Libraries Grid
const ToolsAndLibraries = () => {
  return (
    <div className="bg-[var(--aztec-parchment)] text-[var(--aztec-ink)] py-40 px-6 relative overflow-hidden border-t border-[var(--aztec-ink)]/5">
       <div className="absolute inset-0 noise-bg opacity-10 pointer-events-none mix-blend-overlay" />
       
       <div className="max-w-[1400px] mx-auto relative z-10 flex flex-col lg:flex-row gap-20">
          <div className="lg:w-1/3">
             <div className="font-aztec-mono text-[11px] uppercase tracking-[0.5em] text-[var(--aztec-chartreuse)] mb-6">Tools and Repositories</div>
             <h2 className="font-aztec-serif text-6xl lg:text-7xl font-black uppercase leading-[0.9] mb-8">
               Construct <br/>the <span className="italic text-[var(--aztec-orchid)]">Future</span> <br/>Today.
             </h2>
             <p className="font-sans text-xl text-[var(--aztec-ink)]/60 italic border-l-2 border-[var(--aztec-chartreuse)] pl-6 py-2">
               Access the definitive <br/>suites of intelligence.
             </p>
          </div>

          <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-[var(--aztec-ink)]/5 p-10 hover:bg-[var(--aztec-ink)]/10 transition-colors border border-[var(--aztec-ink)]/5">
                <div className="font-aztec-mono text-[10px] tracking-widest uppercase text-[var(--aztec-ink)]/40 mb-6 border-b border-[var(--aztec-ink)]/10 pb-4">On-Chain Intelligence</div>
                <div className="space-y-4 font-aztec-serif text-2xl font-black">
                   <div className="hover:text-[var(--aztec-chartreuse)] cursor-pointer transition-colors">Whale Alert Pro Terminal</div>
                   <div className="hover:text-[var(--aztec-chartreuse)] cursor-pointer transition-colors">The Akashic Ledger Engine</div>
                </div>
             </div>
             <div className="bg-[var(--aztec-ink)]/5 p-10 hover:bg-[var(--aztec-ink)]/10 transition-colors border border-[var(--aztec-ink)]/5">
                <div className="font-aztec-mono text-[10px] tracking-widest uppercase text-[var(--aztec-ink)]/40 mb-6 border-b border-[var(--aztec-ink)]/10 pb-4">Identity Protocols</div>
                <div className="space-y-4 font-aztec-serif text-2xl font-black">
                   <div className="hover:text-[var(--aztec-chartreuse)] cursor-pointer transition-colors">Sovereign Identity API</div>
                   <div className="hover:text-[var(--aztec-chartreuse)] cursor-pointer transition-colors">Humanity Score Matrix</div>
                </div>
             </div>
             <div className="bg-[var(--aztec-ink)]/5 p-10 hover:bg-[var(--aztec-ink)]/10 transition-colors border border-[var(--aztec-ink)]/5">
                <div className="font-aztec-mono text-[10px] tracking-widest uppercase text-[var(--aztec-ink)]/40 mb-6 border-b border-[var(--aztec-ink)]/10 pb-4">Compliance</div>
                <div className="space-y-4 font-aztec-serif text-2xl font-black">
                   <div className="hover:text-[var(--aztec-chartreuse)] cursor-pointer transition-colors">MiCA Automation Toolkit</div>
                   <div className="hover:text-[var(--aztec-chartreuse)] cursor-pointer transition-colors">GDPR Entity Wiping Script</div>
                </div>
             </div>
             <div className="bg-[var(--aztec-ink)]/5 p-10 hover:bg-[var(--aztec-ink)]/10 transition-colors border border-[var(--aztec-ink)]/5 md:row-span-2 flex flex-col justify-between">
                <div>
                   <div className="font-aztec-mono text-[10px] tracking-widest uppercase text-[var(--aztec-ink)]/40 mb-6 border-b border-[var(--aztec-ink)]/10 pb-4">Development Environment</div>
                   
                   <div className="mb-10">
                      <div className="font-aztec-serif text-2xl font-black hover:text-[var(--aztec-chartreuse)] cursor-pointer transition-colors mb-3">Sovereign Sandbox</div>
                      <p className="font-sans text-sm text-[var(--aztec-parchment)]/50 leading-relaxed text-[var(--aztec-ink)]/60">
                        An isolated forensic environment simulating mempool latency and topological graphs, enabling quantitative developers to test Z-score alerts locally prior to mainnet deployment.
                      </p>
                   </div>
                </div>

                <div className="mt-12 font-aztec-mono text-[11px] font-black uppercase tracking-widest text-[var(--aztec-chartreuse)] flex items-center gap-4 hover:gap-6 transition-all cursor-pointer">
                   Explore Documentation <ArrowRight size={14} />
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

// 4. Sandbox Callout
const SandboxSection = () => {
  return (
    <div className="w-full border-t border-[var(--aztec-ink)]/10 bg-[var(--aztec-parchment)] relative overflow-hidden">
       <div className="max-w-[1400px] mx-auto py-32 px-6 flex flex-col md:flex-row items-center gap-20 relative z-10">
          <div className="md:w-1/2">
             <div className="font-aztec-mono text-[11px] uppercase tracking-[0.4em] text-[var(--aztec-orchid)] mb-6">Initialize Diagnostics</div>
             <h2 className="font-aztec-serif text-6xl md:text-8xl font-black text-[var(--aztec-ink)] uppercase leading-[0.9] mb-8 text-balance">
                Simulate.<br/> Calculate. <span className="italic">Execute</span>.
             </h2>
             <p className="font-sans text-2xl text-[var(--aztec-ink)]/60 leading-relaxed mb-12">
               Master the algorithmic chaos of the mempool via our deterministic testing sandboxes.
             </p>
             <button className="px-12 py-6 bg-[var(--aztec-ink)] text-[var(--aztec-parchment)] font-aztec-mono text-[11px] font-black uppercase tracking-widest transition-transform hover:scale-105 active:scale-95">
                Access Sandbox
             </button>
          </div>
          
          <div className="md:w-1/2 w-full space-y-4">
             {[
               { title: "Instantiate Local Graph", sub: "Mock Neo4j Data Environment", icon: Database },
               { title: "Invoke EdDSA Authentication", sub: "Test session minting locally", icon: ShieldCheck },
               { title: "Query Endpoint Latency", sub: "Benchmark API Performance", icon: Activity }
             ].map((item, i) => (
                <div key={i} className="group p-8 bg-[var(--aztec-ink)]/5 border border-[var(--aztec-ink)]/10 flex items-center justify-between cursor-pointer hover:bg-[var(--aztec-chartreuse)]/10 hover:border-[var(--aztec-chartreuse)] transition-all">
                   <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-[var(--aztec-ink)] text-[var(--aztec-parchment)] rounded-lg flex items-center justify-center group-hover:bg-[var(--aztec-chartreuse)] group-hover:text-[var(--aztec-ink)] transition-colors">
                         <item.icon size={20} />
                      </div>
                      <div>
                         <div className="font-aztec-serif text-2xl font-black text-[var(--aztec-ink)] mb-1">{item.title}</div>
                         <div className="font-sans text-sm text-[var(--aztec-ink)]/50">{item.sub}</div>
                      </div>
                   </div>
                   <ArrowRight size={24} className="text-[var(--aztec-ink)]/20 group-hover:text-[var(--aztec-ink)] transition-colors group-hover:translate-x-2" />
                </div>
             ))}
          </div>
       </div>
    </div>
  );
};

// 5. Authentication Lifecycle Diagram
const TransactionDiagram = () => {
  return (
    <div className="bg-[var(--aztec-ink)]/95 text-white py-40 px-6 relative overflow-hidden border-t-4 border-[var(--aztec-chartreuse)]">
      <div className="absolute inset-0 noise-bg opacity-[0.05]" />
      
      <div className="max-w-[1400px] mx-auto text-center mb-32 relative z-10">
         <div className="font-aztec-mono text-[10px] uppercase tracking-[0.5em] text-[var(--aztec-chartreuse)] mb-6">Architectural Blueprint</div>
         <h2 className="font-aztec-serif text-5xl md:text-7xl font-black uppercase leading-[0.9] mb-8">
            The Sovereign <span className="italic text-[var(--aztec-orchid)]">Authentication Lifecycle</span>
         </h2>
         <p className="font-sans text-xl text-white/50 max-w-4xl mx-auto leading-relaxed border-b border-white/10 pb-16">
            Trace the exact execution path of a zero-trust login request. Observe how we transmute asynchronous network entropy into mathematically provable cryptographic assertions, enforcing absolute session integrity through advanced elliptic curve cryptography and ephemeral routing.
         </p>
      </div>

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-12 relative z-10 items-stretch">
         {/* 1. Mobile Signer */}
         <div className="border border-white/10 p-8 flex flex-col justify-between hover:bg-white/5 transition-colors relative group">
            <div className="font-aztec-mono text-[10px] uppercase tracking-[0.3em] text-white/40 mb-6">Phase 01</div>
            <h3 className="font-aztec-serif text-3xl font-black text-[var(--aztec-chartreuse)] mb-4 leading-tight">Mobile Enclave</h3>
            <p className="font-sans text-sm text-white/60 mb-12">The operator's mobile wallet receives a deterministic authentication string. The private key never leaves the device; it exclusively signs the payload via the secp256k1 curve.</p>
            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center font-aztec-mono text-xl font-black group-hover:bg-white group-hover:text-black transition-colors">
                <Terminal size={20} />
            </div>
         </div>

         {/* 2. QR Mesh Tunnel */}
         <div className="border border-white/10 p-8 flex flex-col justify-between bg-white/5 hover:bg-white/10 transition-colors relative group col-span-1 lg:col-span-2">
            <div className="font-aztec-mono text-[10px] uppercase tracking-[0.3em] text-white/40 mb-6">Phase 02</div>
            <h3 className="font-aztec-serif text-3xl font-black mb-8">X25519 Ephemeral Handshake</h3>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <h4 className="font-aztec-serif text-xl font-bold text-[#FF0055] mb-2">Key Exchange</h4>
                  <p className="font-sans text-xs text-white/50 mb-4">Desktop and mobile generate ephemeral X25519 keys to establish a shared secret dynamically.</p>
               </div>
               <div>
                  <h4 className="font-aztec-serif text-xl font-bold text-[#00FFFF] mb-2">AES-GCM Tunnel</h4>
                  <p className="font-sans text-xs text-white/50 mb-4">The signed EIP-191 payload is heavily encrypted, rendering network interception utterly futile.</p>
               </div>
            </div>
         </div>

         {/* 3. EdDSA Middleware */}
         <div className="border border-[var(--aztec-orchid)]/30 p-8 flex flex-col justify-between bg-[var(--aztec-orchid)]/5 hover:bg-[var(--aztec-orchid)]/10 transition-colors relative group col-span-1 lg:col-span-2 shadow-[0_0_50px_rgba(209,37,199,0.05)]">
            <div className="font-aztec-mono text-[10px] uppercase tracking-[0.3em] text-[var(--aztec-orchid)] mb-6">Phase 03</div>
            <h3 className="font-aztec-serif text-3xl font-black mb-6">EdDSA Edge Middleware</h3>
            <p className="font-sans text-sm text-white/80 mb-8 leading-relaxed">The server performs an `ecrecover` verification. Upon validation, the system mints an asymmetric Ed25519 JWT. Our Edge architecture validates this JWT on every subsequent request under 5 milliseconds.</p>
            
            <div className="bg-[#000] p-4 rounded-xl border border-white/10">
               <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-white/90 font-bold">Ed25519 JWT</div>
                  <div className="text-[10px] text-white/40">Secure Session Cookie</div>
               </div>
               <div className="flex items-center justify-between">
                  <div className="text-xs text-white/90 font-bold">SameSite=Lax</div>
                  <div className="text-[10px] text-white/40">Cross-Site Protection</div>
               </div>
            </div>
         </div>

         {/* 4. Redis Tier Limiting */}
         <div className="border border-white/10 p-8 flex flex-col hover:bg-white/5 transition-colors relative group col-span-1 md:col-span-3 lg:col-span-3 min-h-[300px]">
            <div className="font-aztec-mono text-[10px] uppercase tracking-[0.3em] text-[var(--aztec-chartreuse)] mb-6">Phase 04</div>
            <h3 className="font-aztec-serif text-4xl font-black mb-8">Redis Telemetry & Isolation</h3>
            <div className="flex flex-col md:flex-row gap-8 flex-1">
               <div className="flex-1 bg-white/5 p-6 border-l-2 border-[#FF0055]">
                  <p className="text-sm font-bold text-white mb-2">Tiered Rate Limiting</p>
                  <p className="text-xs text-white/50">The JWT payload dictates API request boundaries. Redis atomic counters enforce hard ceilings.</p>
               </div>
               <div className="flex-1 bg-white/5 p-6 border-l-2 border-[#00FFFF]">
                  <p className="text-sm font-bold text-white mb-2">COOP/COEP Headers</p>
                  <p className="text-xs text-white/50">Cross-Origin-Opener-Policy insulates the document execution environment against Spectre attacks.</p>
               </div>
            </div>
         </div>

         {/* 5. Terminal Access */}
         <div className="border border-white/10 p-8 flex flex-col justify-between hover:bg-white/5 transition-colors relative group col-span-1 md:col-span-2 lg:col-span-2 min-h-[300px]">
            <div className="font-aztec-mono text-[10px] uppercase tracking-[0.3em] text-white/40 mb-6">Phase 05</div>
            <h3 className="font-aztec-serif text-4xl font-black text-[#627EEA] mb-8">Institutional Dashboard</h3>
            <p className="font-sans text-sm text-white/60 mb-8 leading-relaxed">
               The payload arrives pristine. The operator is granted access to the Neo4j-backed heuristic terminal, receiving unadulterated intelligence directly extracted from the EVM blockchain.
            </p>
            <div className="flex items-center gap-4 border-t border-white/10 pt-6">
               <div className="w-12 h-12 flex-shrink-0 bg-[#627EEA]/20 border border-[#627EEA] text-[#627EEA] rounded-xl flex items-center justify-center font-bold">
                   <Activity size={20} />
               </div>
               <div className="text-xs text-white/40">Terminal Granted</div>
            </div>
         </div>

      </div>
    </div>
  );
};

// 6. Institutional Compliance & Cryptography
const ResearchSection = () => {
  return (
    <div className="w-full bg-[var(--aztec-parchment)] py-40 px-6 relative overflow-hidden border-t-2 border-[var(--aztec-ink)]">
      <div className="absolute inset-0 z-0 bg-[var(--aztec-parchment)]" />

      <div className="max-w-[1400px] mx-auto relative z-10 flex flex-col lg:flex-row gap-20 items-center">
         <div className="lg:w-1/3">
            <h2 className="font-aztec-serif text-6xl md:text-7xl font-black text-[var(--aztec-ink)] uppercase leading-[0.8] mb-12">
               Institutional <br/><span className="italic text-[var(--aztec-orchid)]">Compliance</span>.
            </h2>
            <div className="space-y-6">
               {["MiCA Article 72", "GDPR Data Wipe", "Privacy-by-Void", "Ed25519 JWT", "X25519 Key Exchange", "AES-GCM Tunnels", "Neo4j Cypher"].map((term, i) => (
                  <div key={i} className="font-aztec-mono text-sm tracking-[0.3em] text-[var(--aztec-ink)]/20 uppercase hover:text-[var(--aztec-ink)] transition-colors cursor-default select-none">
                     {term}
                  </div>
               ))}
            </div>
         </div>

         <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-3 gap-y-12 gap-x-12 lg:pl-16">
            <div className="border-t-[10px] border-[var(--aztec-chartreuse)] pt-8">
               <div className="font-aztec-serif text-8xl font-black text-[var(--aztec-ink)] mb-4">0%</div>
               <div className="font-aztec-mono text-[11px] uppercase tracking-widest text-[var(--aztec-ink)]/70 mb-2">Stored Passwords</div>
               <div className="font-sans text-sm text-[var(--aztec-ink)]/40">A pure Zero-Trust Environment</div>
            </div>

            <div className="border-t-[10px] border-[var(--aztec-ink)] pt-8">
               <div className="font-aztec-serif text-8xl font-black text-[var(--aztec-ink)] mb-4">256</div>
               <div className="font-aztec-mono text-[11px] uppercase tracking-widest text-[var(--aztec-ink)]/70 mb-2">Bit Encryption</div>
               <div className="font-sans text-sm text-[var(--aztec-ink)]/40">Securing the QR Mesh Data Stream</div>
            </div>

            <div className="border-t-[10px] border-[var(--aztec-orchid)] pt-8">
               <div className="font-aztec-serif text-8xl font-black text-[var(--aztec-ink)] mb-4">1</div>
               <div className="font-aztec-mono text-[11px] uppercase tracking-widest text-[var(--aztec-ink)]/70 mb-2">Immutable Hash</div>
               <div className="font-sans text-sm text-[var(--aztec-ink)]/40">Replacing wiped entity data permanently</div>
            </div>
         </div>
      </div>
    </div>
  );
};

// 7. FAQs
const FAQs = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "Why did we migrate from HS256 to EdDSA (Ed25519) JWTs?",
      a: "Symmetric HS256 requires the validation server to possess the same secret key used for signing, inherently introducing a vulnerability vector if the edge environment is compromised. Ed25519 asymmetric cryptography allows our Edge Middleware to verify the integrity of the JWT mathematically using only the public key, preserving the absolute confidentiality of the signing mechanism."
    },
    {
      q: "How does the X25519 Ephemeral QR Mesh Handshake prevent MitM attacks?",
      a: "Legacy QR login mechanisms transmitted raw authentication tokens over web sockets, exposing them to local network sniffers or proxy-based hijacking. Our protocol dictates that the desktop and mobile devices dynamically generate an ephemeral X25519 shared secret. The EIP-191 payload is encrypted via AES-GCM before transmission, ensuring that the intermediate server (and any interceptor) observes only opaque ciphertext."
    },
    {
      q: "What is the function of COOP and COEP headers within the Terminal?",
      a: "The Cross-Origin-Opener-Policy (COOP) and Cross-Origin-Embedder-Policy (COEP) isolate the Sovereign Terminal's document environment from auxiliary browser contexts. This draconian security posture decisively mitigates advanced hardware vulnerabilities, such as Spectre or Meltdown, preventing malicious iframes from executing side-channel memory reads."
    },
    {
      q: "How does the system achieve MiCA and GDPR compliance?",
      a: "Institutional operations demand strict adherence to European data regulations. We implemented 'Privacy-by-Void'. When a user invokes the 'Right to Be Forgotten' (Article 72), all Personally Identifiable Information (PII) is permanently wiped from our relational matrices and substituted with an irreversible SHA-256 hash. This satisfies audit requirements without retaining sensitive data."
    },
    {
      q: "Why employ Neo4j over PostgreSQL for heuristic analysis?",
      a: "Quantitative blockchain analysis is fundamentally a topological problem. Determining the origin of capital obfuscated by multi-hop transactions (e.g., Tornado Cash to Sybil Wallets to Exchanges) is computationally oppressive using traditional SQL JOIN operations. Neo4j’s native graph architecture evaluates these multi-hop relationships with exponentially lower latency."
    },
    {
      q: "How does Redis facilitate institutional rate-limiting?",
      a: "We extract the 'tier' claim directly from the cryptographically verified EdDSA JWT on every Edge request. This tier is evaluated against atomic counters housed in a high-performance Redis cluster. The limit is enforced with microsecond precision, terminating abusive consumption patterns and preventing distributed denial-of-service degradation."
    }
  ];

  return (
    <div className="w-full bg-[var(--aztec-parchment)] text-[var(--aztec-ink)] py-40 px-6 border-t border-[var(--aztec-ink)]/5">
       <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-20">
          <div className="lg:w-1/3">
             <div className="font-aztec-mono text-[10px] uppercase tracking-[0.4em] text-[var(--aztec-chartreuse)] mb-6">Clarification Protocol</div>
             <h2 className="font-aztec-serif text-6xl md:text-7xl font-black uppercase leading-[0.8] mb-12">
               Architectural<br /> <span className="italic text-[var(--aztec-orchid)]">Syllabus</span>
             </h2>
          </div>
          <div className="lg:w-2/3 border-t border-[var(--aztec-parchment)]/10">
             {faqs.map((f, i) => (
                <div 
                   key={i} 
                   onClick={() => setOpenIndex(openIndex === i ? null : i)}
                   className="py-8 border-b border-[var(--aztec-ink)]/10 flex justify-between items-center group cursor-pointer hover:border-[var(--aztec-chartreuse)] hover:pl-6 transition-all duration-300"
                >
                   <div className="flex-1 pr-8">
                     <h4 className="font-aztec-serif text-2xl font-bold text-[var(--aztec-ink)] group-hover:text-[var(--aztec-chartreuse)] leading-tight">
                       {f.q}
                     </h4>
                     <AnimatePresence>
                        {openIndex === i && (
                           <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-6 text-[var(--aztec-ink)]/70 font-sans text-lg leading-relaxed overflow-hidden"
                           >
                              {f.a}
                           </motion.div>
                        )}
                     </AnimatePresence>
                   </div>
                   <ArrowDown className={`min-w-8 text-[var(--aztec-ink)]/20 group-hover:text-[var(--aztec-chartreuse)] transition-transform duration-500 ${openIndex === i ? "rotate-0 text-[var(--aztec-chartreuse)]" : "-rotate-90"}`} size={32} />
                </div>
             ))}
          </div>
       </div>
    </div>
  );
};


// ─── MAIN PAGE COMPONENT ───
export default function DevelopersPage() {
  return (
    <div className="min-h-screen bg-[var(--aztec-parchment)] overflow-hidden font-sans">
      <AntiPhishing />
      
      {/* Absolute Navbar matching Landing Page aesthetics */}
      <div className="fixed top-0 left-0 right-0 z-[60] p-6 lg:p-10 pointer-events-none flex justify-center">
         <div className="text-[var(--aztec-ink)] mix-blend-difference font-aztec-mono text-[10px] md:text-[11px] font-black tracking-[0.3em] md:tracking-[0.5em] uppercase pointer-events-auto cursor-pointer hover:text-[var(--aztec-chartreuse)] transition-colors">
            <Link href="/" className="px-3 hover:text-[var(--aztec-orchid)] transition-colors text-white">Return to Terminal</Link>
         </div>
      </div>
      
      {/* ── HERO SECTION ── */}
      <section className="relative min-h-[90vh] flex flex-col justify-center px-6 pt-32 pb-16">
         <div className="absolute inset-0 z-0 bg-[var(--aztec-parchment)]" />

         <div className="absolute inset-0 z-[1] noise-bg opacity-[0.25] mix-blend-multiply pointer-events-none" />
         
         <div className="max-w-[1400px] mx-auto w-full relative z-10 text-center flex flex-col items-center mt-12">
            
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="font-aztec-mono text-[10px] uppercase tracking-[0.6em] text-[var(--aztec-ink)] mb-12 border border-[var(--aztec-ink)]/10 rounded-full px-8 py-3 bg-[var(--aztec-parchment)]/50 backdrop-blur-md shadow-xl"
            >
               Sovereign Identity Protocol V4
            </motion.div>

            <h1 className="font-aztec-serif text-[clamp(3.5rem,8vw,9rem)] font-black text-[var(--aztec-ink)] leading-[0.85] tracking-tighter uppercase text-balance max-w-[95vw] mb-12 drop-shadow-lg">
               Master the <br/>
               <span className="italic relative inline-block text-[var(--aztec-orchid)] px-4 mt-2">
                  Architecture.
                  <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: "120%" }}
                     transition={{ duration: 1, delay: 0.5 }}
                     className="absolute h-2 lg:h-4 bg-[var(--aztec-chartreuse)] bottom-[10%] -left-[10%] -z-10 -rotate-2" 
                  />
               </span>
            </h1>

            <motion.p 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.8 }}
               className="font-sans text-xl md:text-3xl text-[var(--aztec-ink)]/70 max-w-5xl font-medium leading-[1.6] mb-20 text-balance"
            >
               The definitive technical resource for institutional developers. Comprehend the zero-trust cryptographic parameters, heuristic modeling, and rigorous mathematical frameworks underpinning the Whale Fortress environment.
            </motion.p>

         </div>
      </section>

      {/* ── ANNOCUNCEMENTS ── */}
      <BuilderAnnouncements />

      {/* ── FULL STACK (01 - 08) ── */}
      <FullStack />

      {/* ── TOOLS AND LIBRARIES ── */}
      <ToolsAndLibraries />

      {/* ── SANDBOX CALLOUT ── */}
      <SandboxSection />

      {/* ── DIAGRAM ── */}
      <TransactionDiagram />

      {/* ── RESEARCH ── */}
      <ResearchSection />

      {/* ── FAQS ── */}
      <FAQs />

      {/* ── FOOTER CALLOUT ── */}
      <div className="bg-[var(--aztec-ink)] py-32 px-6 text-center border-t border-white/10 relative overflow-hidden">
         <div className="absolute inset-0 noise-bg opacity-[0.05] pointer-events-none mix-blend-screen" />
         <div className="relative z-10">
            <h2 className="font-aztec-serif text-5xl md:text-8xl font-black text-[var(--aztec-parchment)] uppercase tracking-tighter mb-12">
               Assume <br/>Absolute <span className="italic text-[var(--aztec-chartreuse)]">Control</span>.
            </h2>
            <div className="flex flex-col md:flex-row max-w-2xl mx-auto items-center gap-4 shadow-2xl">
               <input 
                 type="email" 
                 placeholder="Institutional Email Required"
                 className="flex-1 w-full bg-[#050505] md:bg-[#050505]/80 border border-white/20 px-8 py-6 rounded-none outline-none font-aztec-mono text-sm tracking-widest uppercase focus:border-[var(--aztec-chartreuse)] transition-colors placeholder:text-white/30 text-white"
               />
               <button className="w-full md:w-auto px-12 py-6 bg-[var(--aztec-chartreuse)] text-[var(--aztec-ink)] font-aztec-mono text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-transform active:scale-95 shadow-xl">
                  Request Clearance
               </button>
            </div>
         </div>
      </div>

    </div>
  );
}
