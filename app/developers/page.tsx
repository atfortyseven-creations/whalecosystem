"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Terminal, Lock, Activity, Users, Server, Globe, Cpu, ArrowDown, ShieldCheck, Database, Key } from "lucide-react";
import Link from "next/link";

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
      date: "System Update",
      title: "EdDSA Asymmetric Edge Middleware Deployed",
      desc: "The Sovereign Identity Protocol v4 has successfully finalized its rigorous migration from symmetric HS256 to Ed25519 (EdDSA) asymmetric cryptography. Middleware verification now operates at zero-trust edge velocities—sub-5 milliseconds globally—guaranteeing absolute session integrity without secret exposure to intermediate load balancers or edge nodes.",
      action: "Review Cryptographic Architecture",
    },
    {
      date: "Security Protocol",
      title: "X25519 Ephemeral QR Mesh Handshake Live",
      desc: "Eradicating Man-in-the-Middle (MitM) vectors entirely. The new QR handshake establishes a strictly ephemeral X25519 key exchange coupled with AES-256-GCM encryption, tunneling EIP-191 cryptographic signatures from isolated mobile enclaves directly to the desktop terminal environment without network exposure.",
      action: "Inspect Handshake Telemetry",
    },
    {
      date: "Regulatory Framework",
      title: "MiCA Article 72 'Right to Be Forgotten' Toolkit",
      desc: "Institutional regulatory compliance unequivocally achieved. The new Privacy-by-Void toolkit executes programmatic entity wiping and irreversible SHA-256 data hashing upon request, fulfilling the European Union's GDPR and Markets in Crypto-Assets (MiCA) requirements autonomously and immutably.",
      action: "Read Compliance Documentation",
    }
  ];

  return (
    <div className="w-full max-w-[1400px] mx-auto py-32 px-6">
      <div className="flex flex-col md:flex-row justify-between items-start mb-16 gap-8">
        <h2 className="font-serif text-5xl md:text-7xl font-normal text-[#0A0A0A] leading-[1.1] tracking-tight">
          Infrastructure <br /><span className="text-black/40 italic">Releases.</span>
        </h2>
        <div className="w-full border-t flex-1 mt-6 border-black/10" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {announcements.map((a, i) => (
          <motion.div 
             key={i}
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.6, delay: i * 0.1 }}
             className="group relative bg-white p-8 md:p-12 border border-black/10 hover:border-[#0044CC]/30 transition-all cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,68,204,0.08)] rounded-sm min-h-[480px] flex flex-col justify-between"
          >
             <div className="relative z-10">
               <div className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold text-black/40 mb-8 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-[#0044CC] animate-pulse" /> {a.date}
               </div>
               <h3 className="font-serif text-2xl lg:text-[28px] font-normal text-[#0A0A0A] mb-6 leading-[1.3] group-hover:text-[#0044CC] transition-colors">
                  {a.title}
               </h3>
               <p className="font-sans text-[#1a1a1a] text-[15px] leading-[1.8] tracking-[0.01em] mb-8">
                  {a.desc}
               </p>
             </div>
             <div className="relative z-10 font-mono text-[10px] font-bold uppercase tracking-widest text-[#0044CC] flex items-center gap-4 hover:gap-6 transition-all">
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
    { num: "01", title: "Zero-Trust Cryptographic Identity", desc: "We emphatically refuse to delegate authorization to centralized, vulnerable credential databases. Identity within the Sovereign Terminal is established exclusively through mathematically provable ownership of a secp256k1 private key, enforcing a strict Privacy-by-Void mandate that eliminates password-based attack vectors entirely." },
    { num: "02", title: "Ephemeral QR Mesh Handshakes", desc: "Cross-device authentication is secured via an ephemeral X25519 key exchange and AES-256-GCM encryption. The mobile enclave securely tunnels the signed EIP-191 payload directly to the desktop session, unconditionally thwarting session hijacking, replay attacks, and sophisticated proxy spoofing vectors." },
    { num: "03", title: "EdDSA Asymmetric Edge Middleware", desc: "The strategic transition from symmetric HS256 to Ed25519 (EdDSA) asymmetric cryptography empowers our global Edge routing infrastructure to mathematically verify authentication tokens in microseconds, rendering JWT manipulation or signing-key compromise categorically impossible." },
    { num: "04", title: "Redis-Backed Tiered Telemetry", desc: "A transient, exceptionally high-performance Redis cluster governs session rate-limiting autonomously. Institutional throughput thresholds are dynamically extracted from the EdDSA JWT and enforced on a per-request basis, mitigating excessive computational consumption and preserving terminal thermodynamics." },
    { num: "05", title: "Neo4j Heuristic Graph Matrix", desc: "We have eschewed antiquated two-dimensional SQL schemas in favor of high-dimensional topological graph databases. Neo4j enables us to de-obfuscate institutional capital transfers up to seven hops deep, isolating algorithmic behavioral signatures from the chaotic noise of the mempool." },
    { num: "06", title: "EVM Thermodynamics & Z-Score Alerts", desc: "By meticulously tracking computational energy expenditure and transient storage (EIP-1153) intra-block, our analytical engines deploy advanced Z-Score anomaly calculations to detect the stealthy accumulation of massive institutional positions prior to spot market manifestation." },
    { num: "07", title: "Sovereign Forum & Privacy-by-Void", desc: "A decentralized communication agora where identities are unalterably linked to verifiable wallet signatures. To meticulously adhere to MiCA and GDPR standards, all personally identifiable data is subjected to irreversible SHA-256 entity hashing upon triggering the 'Right to Be Forgotten'." },
    { num: "08", title: "Institutional Subscriptions & SLA", desc: "The institutional monetization framework utilizes atomic cryptographic validation, integrated seamlessly with Stripe Webhooks for zero-trust subscription tracking. Verified institutional activity grants immediate, automated API key issuance with a mathematically backed 99.99% uptime guarantee." }
  ];

  return (
    <div className="w-full max-w-[1400px] mx-auto py-40 px-6">
      <div className="mb-24 px-8 border-l-[3px] border-[#0044CC]">
         <h2 className="font-serif text-5xl lg:text-[72px] font-normal text-[#0A0A0A] leading-[1.0] tracking-tight">
            The Institutional <br/> <span className="text-black/40 italic">Security Architecture.</span>
         </h2>
         <p className="mt-10 font-sans text-[20px] text-[#1a1a1a] max-w-4xl leading-[1.8] tracking-[0.01em]">
            Every micro-layer of the Sovereign Network is engineered with uncompromising mathematical rigor. We have methodically dismantled legacy Web2 paradigms, replacing them with a purely deterministic, cryptographically provable framework designed expressly for high-frequency trading latency tolerances.
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
            <div className="font-mono text-3xl font-bold text-black/10 mb-6 group-hover:text-[#0044CC] transition-colors duration-500">
               {s.num}
            </div>
            <h3 className="font-serif text-[28px] font-normal text-[#0A0A0A] leading-[1.3] mb-6">
               {s.title}
            </h3>
            <p className="font-sans text-[16px] text-black/70 leading-[1.8] border-l border-black/10 pl-6 group-hover:border-[#0044CC]/30 transition-colors duration-500">
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
    <div className="bg-white text-[#0A0A0A] py-40 px-6 border-y border-black/5">
       <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-20">
          <div className="lg:w-1/3">
             <div className="font-mono text-[10px] uppercase tracking-[0.3em] font-bold text-[#0044CC] mb-8">Tools and Repositories</div>
             <h2 className="font-serif text-5xl lg:text-[64px] font-normal leading-[1.0] tracking-tight mb-10 text-balance">
               Construct <br/>the <span className="italic text-black/40">Future</span> <br/>Today.
             </h2>
             <p className="font-sans text-xl text-black/60 italic border-l-2 border-[#0044CC] pl-6 py-2 leading-relaxed">
               Access the definitive suites of heuristic intelligence and cryptographic validation.
             </p>
          </div>

          <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-[#FAF9F6] p-10 hover:bg-black/[0.02] transition-colors border border-black/5 rounded-sm">
                <div className="font-mono text-[10px] font-bold tracking-widest uppercase text-black/40 mb-8 border-b border-black/10 pb-4">On-Chain Intelligence</div>
                <div className="space-y-6 font-serif text-[22px] font-normal">
                   <div className="hover:text-[#0044CC] cursor-pointer transition-colors flex items-center justify-between group">
                     Whale Alert Pro Terminal <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                   </div>
                   <div className="hover:text-[#0044CC] cursor-pointer transition-colors flex items-center justify-between group">
                     The Akashic Ledger Engine <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                   </div>
                </div>
             </div>
             <div className="bg-[#FAF9F6] p-10 hover:bg-black/[0.02] transition-colors border border-black/5 rounded-sm">
                <div className="font-mono text-[10px] font-bold tracking-widest uppercase text-black/40 mb-8 border-b border-black/10 pb-4">Identity Protocols</div>
                <div className="space-y-6 font-serif text-[22px] font-normal">
                   <div className="hover:text-[#0044CC] cursor-pointer transition-colors flex items-center justify-between group">
                     Sovereign Identity API <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                   </div>
                   <div className="hover:text-[#0044CC] cursor-pointer transition-colors flex items-center justify-between group">
                     Humanity Score Matrix <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                   </div>
                </div>
             </div>
             <div className="bg-[#FAF9F6] p-10 hover:bg-black/[0.02] transition-colors border border-black/5 rounded-sm">
                <div className="font-mono text-[10px] font-bold tracking-widest uppercase text-black/40 mb-8 border-b border-black/10 pb-4">Regulatory Compliance</div>
                <div className="space-y-6 font-serif text-[22px] font-normal">
                   <div className="hover:text-[#0044CC] cursor-pointer transition-colors flex items-center justify-between group">
                     MiCA Automation Toolkit <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                   </div>
                   <div className="hover:text-[#0044CC] cursor-pointer transition-colors flex items-center justify-between group">
                     GDPR Entity Wiping Script <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                   </div>
                </div>
             </div>
             <div className="bg-[#FAF9F6] p-10 hover:bg-black/[0.02] transition-colors border border-black/5 rounded-sm md:row-span-2 flex flex-col justify-between">
                <div>
                   <div className="font-mono text-[10px] font-bold tracking-widest uppercase text-black/40 mb-8 border-b border-black/10 pb-4">Development Environment</div>
                   <div className="mb-10">
                      <div className="font-serif text-[26px] font-normal hover:text-[#0044CC] cursor-pointer transition-colors mb-6">Sovereign Sandbox</div>
                      <p className="font-sans text-[15px] leading-[1.8] tracking-[0.01em] text-black/70">
                        An isolated forensic environment simulating live mempool latency and complex topological graphs, enabling quantitative developers to definitively test Z-score alerts locally prior to production mainnet deployment.
                      </p>
                   </div>
                </div>
                <div className="mt-8 pt-8 border-t border-black/5 font-mono text-[10px] font-bold uppercase tracking-widest text-[#0044CC] flex items-center gap-4 hover:gap-6 transition-all cursor-pointer">
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
    <div className="w-full bg-[#FAF9F6]">
       <div className="max-w-[1400px] mx-auto py-40 px-6 flex flex-col md:flex-row items-center gap-20">
          <div className="md:w-1/2">
             <div className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#0044CC] mb-8">Initialize Diagnostics</div>
             <h2 className="font-serif text-5xl md:text-[80px] font-normal text-[#0A0A0A] leading-[1.0] tracking-tight mb-10 text-balance">
                Simulate.<br/> Calculate. <br/><span className="text-black/40 italic">Execute.</span>
             </h2>
             <p className="font-sans text-[20px] text-black/60 leading-[1.6] mb-12 max-w-md">
               Master the algorithmic chaos of the mempool via our highly deterministic, zero-latency testing sandboxes.
             </p>
             <button className="px-10 py-5 bg-[#0A0A0A] text-white font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-[#222] transition-colors rounded-sm shadow-xl">
                Access Forensic Sandbox
             </button>
          </div>
          
          <div className="md:w-1/2 w-full space-y-4">
             {[
               { title: "Instantiate Local Graph", sub: "Mock Neo4j Data Environment", icon: Database },
               { title: "Invoke EdDSA Auth", sub: "Test session minting locally", icon: ShieldCheck },
               { title: "Query Endpoint Latency", sub: "Benchmark API Performance", icon: Activity }
             ].map((item, i) => (
                <div key={i} className="group p-8 bg-white border border-black/10 flex items-center justify-between cursor-pointer hover:border-[#0044CC]/40 hover:shadow-lg transition-all rounded-sm">
                   <div className="flex items-center gap-8">
                      <div className="w-14 h-14 bg-[#FAF9F6] border border-black/10 text-[#0A0A0A] rounded-full flex items-center justify-center group-hover:bg-[#0044CC] group-hover:text-white transition-colors">
                         <item.icon size={22} strokeWidth={1.5} />
                      </div>
                      <div>
                         <div className="font-serif text-[22px] font-normal text-[#0A0A0A] mb-2">{item.title}</div>
                         <div className="font-mono text-[10px] uppercase tracking-widest font-bold text-black/40">{item.sub}</div>
                      </div>
                   </div>
                   <ArrowRight size={20} className="text-black/20 group-hover:text-[#0044CC] transition-colors group-hover:translate-x-2" />
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
    <div className="bg-[#0A0A0A] text-white py-40 px-6">
      <div className="max-w-[1400px] mx-auto text-center mb-32">
         <div className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#0044CC] mb-8">Architectural Blueprint</div>
         <h2 className="font-serif text-5xl md:text-[72px] font-normal leading-[1.05] tracking-tight mb-10">
            The Sovereign <br/><span className="italic text-white/50">Authentication Lifecycle</span>
         </h2>
         <p className="font-sans text-[18px] text-white/60 max-w-4xl mx-auto leading-[1.8] border-b border-white/10 pb-20">
            Trace the exact execution path of a zero-trust login request. Observe how we transmute asynchronous network entropy into mathematically provable cryptographic assertions, enforcing absolute session integrity through advanced elliptic curve cryptography and ephemeral routing.
         </p>
      </div>

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 items-stretch">
         {/* 1. Mobile Signer */}
         <div className="border border-white/10 p-10 flex flex-col justify-between hover:bg-white/[0.02] transition-colors group rounded-sm">
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 mb-8">Phase 01</div>
            <h3 className="font-serif text-[26px] font-normal text-[#0044CC] mb-6 leading-[1.2]">Mobile Enclave</h3>
            <p className="font-sans text-[14px] text-white/60 mb-12 leading-[1.7]">The operator's mobile wallet receives a deterministic authentication string. The private key never leaves the device; it exclusively signs the payload via the secp256k1 curve.</p>
            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center font-mono text-xl font-bold group-hover:bg-white group-hover:text-black transition-colors mt-auto">
                <Terminal size={20} strokeWidth={1.5} />
            </div>
         </div>

         {/* 2. QR Mesh Tunnel */}
         <div className="border border-white/10 p-10 flex flex-col justify-between bg-white/[0.02] hover:bg-white/[0.04] transition-colors group col-span-1 lg:col-span-2 rounded-sm">
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 mb-8">Phase 02</div>
            <h3 className="font-serif text-[28px] font-normal mb-8">X25519 Ephemeral Handshake</h3>
            <div className="grid grid-cols-2 gap-8">
               <div>
                  <h4 className="font-mono text-[11px] font-bold tracking-widest uppercase text-white/80 mb-3">Key Exchange</h4>
                  <p className="font-sans text-[13px] text-white/50 leading-[1.6]">Desktop and mobile generate ephemeral X25519 keys to establish a shared secret dynamically over an isolated channel.</p>
               </div>
               <div>
                  <h4 className="font-mono text-[11px] font-bold tracking-widest uppercase text-white/80 mb-3">AES-GCM Tunnel</h4>
                  <p className="font-sans text-[13px] text-white/50 leading-[1.6]">The signed EIP-191 payload is heavily encrypted, rendering network interception or packet sniffing utterly futile.</p>
               </div>
            </div>
         </div>

         {/* 3. EdDSA Middleware */}
         <div className="border border-[#0044CC]/40 p-10 flex flex-col justify-between bg-[#0044CC]/5 hover:bg-[#0044CC]/10 transition-colors group col-span-1 lg:col-span-2 rounded-sm shadow-[0_0_40px_rgb(0,68,204,0.1)]">
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#0044CC] mb-8">Phase 03</div>
            <h3 className="font-serif text-[28px] font-normal mb-6">EdDSA Edge Middleware</h3>
            <p className="font-sans text-[14px] text-white/80 mb-10 leading-[1.7]">The server performs an `ecrecover` verification. Upon validation, the system mints an asymmetric Ed25519 JWT. Our Edge architecture rigorously validates this JWT on every subsequent request under 5 milliseconds globally.</p>
            
            <div className="bg-black/50 p-6 rounded-sm border border-white/10 mt-auto">
               <div className="flex items-center justify-between mb-4">
                  <div className="text-[13px] text-white/90 font-mono font-bold">Ed25519 JWT</div>
                  <div className="text-[10px] text-white/40 font-mono uppercase tracking-widest">Secure Session Cookie</div>
               </div>
               <div className="flex items-center justify-between">
                  <div className="text-[13px] text-white/90 font-mono font-bold">SameSite=Lax</div>
                  <div className="text-[10px] text-white/40 font-mono uppercase tracking-widest">Cross-Site Protection</div>
               </div>
            </div>
         </div>

         {/* 4. Redis Tier Limiting */}
         <div className="border border-white/10 p-10 flex flex-col justify-center hover:bg-white/[0.02] transition-colors group col-span-1 md:col-span-3 lg:col-span-3 min-h-[300px] rounded-sm">
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 mb-8">Phase 04</div>
            <h3 className="font-serif text-[32px] font-normal mb-10">Redis Telemetry & Isolation</h3>
            <div className="flex flex-col md:flex-row gap-8">
               <div className="flex-1 bg-white/[0.03] p-8 border-l-[3px] border-[#0044CC]">
                  <p className="text-[13px] font-mono font-bold uppercase tracking-widest text-white mb-4">Tiered Rate Limiting</p>
                  <p className="text-[14px] font-sans text-white/60 leading-[1.6]">The decrypted JWT payload strictly dictates API request boundaries. Redis atomic counters enforce hard cryptographic ceilings.</p>
               </div>
               <div className="flex-1 bg-white/[0.03] p-8 border-l-[3px] border-white/20">
                  <p className="text-[13px] font-mono font-bold uppercase tracking-widest text-white mb-4">COOP/COEP Headers</p>
                  <p className="text-[14px] font-sans text-white/60 leading-[1.6]">Cross-Origin-Opener-Policy insulates the document execution environment against Spectre attacks and malicious side-channels.</p>
               </div>
            </div>
         </div>

         {/* 5. Terminal Access */}
         <div className="border border-white/10 p-10 flex flex-col justify-between hover:bg-white/[0.02] transition-colors group col-span-1 md:col-span-2 lg:col-span-2 min-h-[300px] rounded-sm">
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 mb-8">Phase 05</div>
            <h3 className="font-serif text-[32px] font-normal text-white mb-8">Institutional Dashboard</h3>
            <p className="font-sans text-[15px] text-white/60 mb-10 leading-[1.7]">
               The cryptographic payload arrives pristine. The operator is immediately granted access to the Neo4j-backed heuristic terminal, receiving unadulterated institutional intelligence directly extracted from the EVM blockchain.
            </p>
            <div className="flex items-center gap-6 border-t border-white/10 pt-8 mt-auto">
               <div className="w-12 h-12 flex-shrink-0 bg-white border border-white text-black rounded-full flex items-center justify-center font-bold">
                   <Activity size={20} strokeWidth={1.5} />
               </div>
               <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-white/60">Terminal Granted</div>
            </div>
         </div>

      </div>
    </div>
  );
};

// 6. Institutional Compliance & Cryptography
const ResearchSection = () => {
  return (
    <div className="w-full bg-[#FAF9F6] py-40 px-6 border-y border-black/5">
      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-20 items-center">
         <div className="lg:w-1/3">
            <h2 className="font-serif text-5xl md:text-[64px] font-normal text-[#0A0A0A] leading-[1.05] tracking-tight mb-12">
               Institutional <br/><span className="italic text-black/40">Compliance.</span>
            </h2>
            <div className="space-y-6">
               {["MiCA Article 72", "GDPR Data Wipe", "Privacy-by-Void", "Ed25519 JWT", "X25519 Key Exchange", "AES-256-GCM Tunnels", "Neo4j Cypher Traversal"].map((term, i) => (
                  <div key={i} className="font-mono text-[11px] font-bold tracking-[0.2em] text-black/30 uppercase hover:text-black/80 transition-colors cursor-default select-none">
                     {term}
                  </div>
               ))}
            </div>
         </div>

         <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-3 gap-y-16 gap-x-12 lg:pl-20">
            <div className="border-t-[3px] border-[#0044CC] pt-8">
               <div className="font-serif text-[80px] font-normal text-[#0A0A0A] leading-[1.0] mb-6">0%</div>
               <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-black/60 mb-3">Stored Passwords</div>
               <div className="font-sans text-[14px] text-black/40 leading-relaxed">A pristine, mathematically proven Zero-Trust Environment.</div>
            </div>

            <div className="border-t-[3px] border-black/10 pt-8">
               <div className="font-serif text-[80px] font-normal text-[#0A0A0A] leading-[1.0] mb-6">256</div>
               <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-black/60 mb-3">Bit Encryption</div>
               <div className="font-sans text-[14px] text-black/40 leading-relaxed">Securing the QR Mesh Data Stream from all interception vectors.</div>
            </div>

            <div className="border-t-[3px] border-black/10 pt-8">
               <div className="font-serif text-[80px] font-normal text-[#0A0A0A] leading-[1.0] mb-6">1</div>
               <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-black/60 mb-3">Immutable Hash</div>
               <div className="font-sans text-[14px] text-black/40 leading-relaxed">Replacing wiped entity data permanently to satisfy GDPR mandates.</div>
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
      q: "Why did the architecture migrate from HS256 to EdDSA (Ed25519) JWTs?",
      a: "Symmetric HS256 requires the validation server to possess the exact same secret key used for signing, inherently introducing a massive vulnerability vector if the edge environment is compromised. Ed25519 asymmetric cryptography allows our Edge Middleware to verify the integrity of the JWT mathematically using only the public key. This preserves the absolute confidentiality of the signing mechanism, eliminating the risk of catastrophic token forgery."
    },
    {
      q: "How does the X25519 Ephemeral QR Mesh Handshake decisively prevent MitM attacks?",
      a: "Legacy QR login mechanisms transmitted raw authentication tokens over standard web sockets, exposing them to local network sniffers or sophisticated proxy-based hijacking. Our sovereign protocol dictates that the desktop and mobile devices dynamically generate an ephemeral X25519 shared secret out-of-band. The EIP-191 payload is encrypted via AES-256-GCM before transmission, ensuring that the intermediate signaling server (and any potential interceptor) observes only opaque, useless ciphertext."
    },
    {
      q: "What is the critical function of COOP and COEP headers within the Terminal?",
      a: "The Cross-Origin-Opener-Policy (COOP) and Cross-Origin-Embedder-Policy (COEP) absolutely isolate the Sovereign Terminal's document environment from auxiliary browser contexts. This draconian security posture decisively mitigates advanced hardware vulnerabilities, such as Spectre or Meltdown, preventing malicious iframes or popups from executing side-channel memory reads against your isolated session data."
    },
    {
      q: "How does the system autonomously achieve MiCA and GDPR compliance?",
      a: "Institutional operations demand strict, uncompromising adherence to European data regulations. We implemented 'Privacy-by-Void'. When a user invokes the 'Right to Be Forgotten' (MiCA Article 72), all Personally Identifiable Information (PII) is permanently and irreversibly wiped from our relational matrices and substituted with a deterministic SHA-256 hash. This meticulously satisfies compliance audit requirements without retaining a shred of sensitive data."
    },
    {
      q: "Why employ Neo4j over traditional PostgreSQL for heuristic analysis?",
      a: "Quantitative blockchain analysis is fundamentally a massive topological problem. Determining the origin of capital obfuscated by multi-hop transactions (e.g., Tornado Cash to Sybil Wallets to Exchanges) is computationally oppressive using traditional SQL JOIN operations. Neo4j’s native graph architecture evaluates these complex multi-hop relationships with exponentially lower latency, enabling real-time detection of institutional accumulation."
    },
    {
      q: "How does Redis facilitate institutional rate-limiting without database bottlenecks?",
      a: "We extract the 'tier' claim directly from the cryptographically verified EdDSA JWT on every single Edge request. This tier is evaluated against atomic counters housed in a highly distributed, ultra-low-latency Redis cluster. The limit is enforced with microsecond precision entirely in memory, terminating abusive consumption patterns and preventing distributed denial-of-service degradation without touching persistent storage."
    }
  ];

  return (
    <div className="w-full bg-white text-[#0A0A0A] py-40 px-6">
       <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-24">
          <div className="lg:w-1/3">
             <div className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#0044CC] mb-8">Clarification Protocol</div>
             <h2 className="font-serif text-5xl md:text-[64px] font-normal leading-[1.05] tracking-tight mb-10">
               Architectural<br /> <span className="italic text-black/40">Syllabus.</span>
             </h2>
             <p className="font-sans text-[16px] text-black/60 leading-[1.8]">
               Extensive documentation addressing the most complex cryptographic and architectural methodologies deployed within our infrastructure.
             </p>
          </div>
          <div className="lg:w-2/3 border-t border-black/10">
             {faqs.map((f, i) => (
                <div 
                   key={i} 
                   onClick={() => setOpenIndex(openIndex === i ? null : i)}
                   className="py-10 border-b border-black/10 flex justify-between items-start group cursor-pointer hover:border-[#0044CC] transition-all duration-300"
                >
                   <div className="flex-1 pr-12">
                     <h4 className="font-serif text-[24px] font-normal text-[#0A0A0A] group-hover:text-[#0044CC] leading-[1.4] transition-colors">
                       {f.q}
                     </h4>
                     <AnimatePresence>
                        {openIndex === i && (
                           <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-6 text-[#1a1a1a] font-sans text-[16px] leading-[1.8] overflow-hidden"
                           >
                              {f.a}
                           </motion.div>
                        )}
                     </AnimatePresence>
                   </div>
                   <div className={`w-10 h-10 shrink-0 border border-black/10 rounded-full flex items-center justify-center transition-all duration-500 group-hover:border-[#0044CC] ${openIndex === i ? "bg-[#0044CC] text-white rotate-0" : "bg-transparent text-black/30 -rotate-90"}`}>
                      <ArrowDown size={18} strokeWidth={1.5} />
                   </div>
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
    <div className="min-h-screen bg-[#FAF9F6] text-[#0A0A0A] overflow-x-hidden font-sans selection:bg-black/10 selection:text-[#0A0A0A]">
      
      {/* ── TOP NAV SPACER ── */}
      <div className="fixed top-0 left-0 right-0 z-50 px-8 py-6 pointer-events-none flex justify-center backdrop-blur-md bg-[#FAF9F6]/80 border-b border-black/5">
         <Link href="/" className="pointer-events-auto font-mono text-[10px] font-bold uppercase tracking-widest text-black/40 hover:text-black transition-colors flex items-center gap-2">
            <ArrowRight size={12} className="rotate-180" /> Return to Terminal
         </Link>
      </div>
      
      {/* ── HERO SECTION ── */}
      <section className="relative min-h-[90vh] flex flex-col justify-center px-6 pt-32 pb-24">
         <div className="max-w-[1400px] mx-auto w-full relative z-10 text-center flex flex-col items-center mt-12">
            
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#0044CC] mb-12 border border-[#0044CC]/20 rounded-full px-6 py-2 bg-[#0044CC]/5"
            >
               Sovereign Identity Protocol V4
            </motion.div>

            <h1 className="font-serif text-[clamp(3.5rem,8vw,110px)] font-normal text-[#0A0A0A] leading-[0.95] tracking-tight text-balance max-w-[95vw] mb-12">
               Master the <br/>
               <span className="italic relative inline-block text-black/40 px-4 mt-2">
                  Architecture.
               </span>
            </h1>

            <motion.p 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.2 }}
               className="font-sans text-[20px] md:text-[24px] text-[#1a1a1a] max-w-4xl leading-[1.7] mb-20 text-balance tracking-[0.01em]"
            >
               The definitive technical compendium for institutional integrators and quantitative engineers. Comprehend the deterministic cryptographic parameters, heuristic modeling matrices, and rigorous mathematical frameworks underpinning the Sovereign Intelligence ecosystem.
            </motion.p>

         </div>
      </section>

      {/* ── SECTIONS ── */}
      <BuilderAnnouncements />
      <FullStack />
      <ToolsAndLibraries />
      <SandboxSection />
      <TransactionDiagram />
      <ResearchSection />
      <FAQs />

      {/* ── FOOTER CALLOUT ── */}
      <div className="bg-[#0A0A0A] py-40 px-6 text-center">
         <div className="max-w-[1200px] mx-auto">
            <h2 className="font-serif text-5xl md:text-[80px] font-normal text-white leading-[1.0] tracking-tight mb-16">
               Assume <br/><span className="italic text-white/50">Absolute Control.</span>
            </h2>
            <div className="flex flex-col md:flex-row max-w-2xl mx-auto items-center gap-4">
               <input 
                 type="email" 
                 placeholder="Institutional Email Required"
                 className="flex-1 w-full bg-white/[0.05] border border-white/20 px-8 py-5 rounded-sm outline-none font-mono text-[11px] font-bold tracking-widest uppercase focus:border-white transition-colors placeholder:text-white/30 text-white"
               />
               <button className="w-full md:w-auto px-10 py-5 bg-white text-black font-mono text-[11px] font-bold uppercase tracking-widest hover:bg-[#FAF9F6] transition-colors rounded-sm shadow-lg">
                  Request Clearance
               </button>
            </div>
         </div>
      </div>

    </div>
  );
}
