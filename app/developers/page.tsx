"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Terminal, Lock, Activity, Users, Server, Globe, Cpu, ArrowDown, ShieldCheck, Database, Key } from "lucide-react";
import Link from "next/link";
import { SovereignFooter } from "@/components/landing/SovereignFooter";

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
      title: "Edge-Optimized Cryptography",
      desc: "We have finalized our migration to Ed25519 (EdDSA) asymmetric cryptography. Verification now operates globally in sub-5 milliseconds, ensuring session integrity without secret exposure to intermediate edge nodes.",
      action: "Review Architecture",
    },
    {
      date: "Security Protocol",
      title: "Zero-Trust Handshakes",
      desc: "We have eliminated Man-in-the-Middle vectors. The new QR handshake uses ephemeral X25519 key exchanges and AES-256-GCM encryption, routing signatures directly from mobile devices to desktop terminals.",
      action: "Inspect Telemetry",
    },
    {
      date: "Regulatory Framework",
      title: "Automated Compliance Toolkit",
      desc: "Built-in compliance automation. The system executes programmatic entity wiping and SHA-256 hashing to fulfill European GDPR and MiCA requirements by default.",
      action: "Read Documentation",
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
    { num: "01", title: "Cryptographic Identity", desc: "Identity is established through provable ownership of a secp256k1 private key. This enforces strict privacy and eliminates password-based attack vectors." },
    { num: "02", title: "Ephemeral QR Exchange", desc: "Cross-device authentication is secured via an ephemeral X25519 key exchange. The mobile enclave securely tunnels the signed EIP-191 payload directly to the desktop session." },
    { num: "03", title: "EdDSA Edge Middleware", desc: "Ed25519 asymmetric cryptography allows our edge routing to verify authentication tokens in microseconds, preventing token manipulation." },
    { num: "04", title: "Redis-Backed Telemetry", desc: "A high-performance Redis cluster governs session rate-limiting. Institutional throughput is dynamically extracted and enforced per-request." },
    { num: "05", title: "Neo4j Topological Graphs", desc: "Graph databases map complex institutional capital transfers, isolating structural behavior patterns from standard mempool noise." },
    { num: "06", title: "EVM Energy & Z-Score Alerts", desc: "By tracking computational energy intra-block, our engines deploy Z-Score calculations to detect the accumulation of institutional positions before market impact." },
    { num: "07", title: "Sovereign Forums", desc: "A communication layer where identities are linked to verifiable signatures. PII is hashed via SHA-256 to ensure complete privacy compliance." },
    { num: "08", title: "Institutional SLAs", desc: "Atomic cryptographic validation integrates with Stripe Webhooks for zero-trust subscription tracking and automated API key delivery." }
  ];

  return (
    <div className="w-full max-w-[1400px] mx-auto py-40 px-6">
      <div className="mb-24 px-8 border-l-[3px] border-[#0044CC]">
         <h2 className="font-serif text-5xl lg:text-[72px] font-normal text-[#0A0A0A] leading-[1.0] tracking-tight">
            Core <br/> <span className="text-black/40 italic">Infrastructure.</span>
         </h2>
         <p className="mt-10 font-sans text-[20px] text-[#1a1a1a] max-w-4xl leading-[1.8] tracking-[0.01em]">
            Every system layer is built with precision. In collaboration with <strong>Aztec Network</strong>, we replaced legacy Web2 structures with a deterministic, cryptographically provable framework designed for high-frequency environments.
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
               Build on <br/>the <span className="italic text-black/40">Architecture.</span>
             </h2>
             <p className="font-sans text-xl text-black/60 italic border-l-2 border-[#0044CC] pl-6 py-2 leading-relaxed">
               Access our primary suites for heuristic intelligence and cryptographic validation.
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
                        An isolated environment simulating live mempool latency and complex graphs, enabling quantitative developers to test alerts locally before mainnet deployment.
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
             <div className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#0044CC] mb-8">Testing Environment</div>
             <h2 className="font-serif text-5xl md:text-[80px] font-normal text-[#0A0A0A] leading-[1.0] tracking-tight mb-10 text-balance">
                Test.<br/> Validate. <br/><span className="text-black/40 italic">Deploy.</span>
             </h2>
             <p className="font-sans text-[20px] text-black/60 leading-[1.6] mb-12 max-w-md">
               Test your integrations against live mempool data using our local zero-latency sandboxes.
             </p>
             <button className="px-10 py-5 bg-[#0A0A0A] text-white font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-[#222] transition-colors rounded-sm shadow-xl">
                Access Sandbox
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
         <div className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#0044CC] mb-8">System Flow</div>
         <h2 className="font-serif text-5xl md:text-[72px] font-normal leading-[1.05] tracking-tight mb-10">
            The Authentication <br/><span className="italic text-white/50">Lifecycle</span>
         </h2>
         <p className="font-sans text-[18px] text-white/60 max-w-4xl mx-auto leading-[1.8] border-b border-white/10 pb-20">
            Trace the execution path of a zero-trust login request. See how the protocol uses elliptic curve cryptography to enforce absolute session integrity from mobile to desktop.
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
                  <p className="font-sans text-[13px] text-white/50 leading-[1.6]">The signed EIP-191 payload is encrypted, protecting against network interception and packet sniffing.</p>
               </div>
            </div>
         </div>

         {/* 3. EdDSA Middleware */}
         <div className="border border-[#0044CC]/40 p-10 flex flex-col justify-between bg-[#0044CC]/5 hover:bg-[#0044CC]/10 transition-colors group col-span-1 lg:col-span-2 rounded-sm shadow-[0_0_40px_rgb(0,68,204,0.1)]">
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#0044CC] mb-8">Phase 03</div>
            <h3 className="font-serif text-[28px] font-normal mb-6">EdDSA Edge Middleware</h3>
            <p className="font-sans text-[14px] text-white/80 mb-10 leading-[1.7]">The server performs an `ecrecover` verification. Upon validation, the system mints an asymmetric Ed25519 JWT. Our Edge architecture rigorously validates this JWT globally.</p>
            
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
                  <p className="text-[14px] font-sans text-white/60 leading-[1.6]">The decrypted JWT payload dictates API request boundaries. Redis atomic counters enforce hard cryptographic ceilings.</p>
               </div>
               <div className="flex-1 bg-white/[0.03] p-8 border-l-[3px] border-white/20">
                  <p className="text-[13px] font-mono font-bold uppercase tracking-widest text-white mb-4">COOP/COEP Headers</p>
                  <p className="text-[14px] font-sans text-white/60 leading-[1.6]">COOP and COEP isolate the Terminal's execution environment. This mitigates hardware-level vulnerabilities, preventing malicious scripts from performing memory reads.</p>
               </div>
            </div>
         </div>

         {/* 5. Terminal Access */}
         <div className="border border-white/10 p-10 flex flex-col justify-between hover:bg-white/[0.02] transition-colors group col-span-1 md:col-span-2 lg:col-span-2 min-h-[300px] rounded-sm">
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 mb-8">Phase 05</div>
            <h3 className="font-serif text-[32px] font-normal text-white mb-8">Institutional Dashboard</h3>
            <p className="font-sans text-[15px] text-white/60 mb-10 leading-[1.7]">
               The cryptographic payload arrives pristine. The operator is granted access to the heuristic terminal, receiving intelligence directly extracted from the EVM.
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
      a: "Symmetric HS256 requires the validation server to possess the exact same secret key used for signing, introducing a vulnerability vector if the edge environment is compromised. Ed25519 asymmetric cryptography allows our Edge Middleware to verify the integrity of the JWT mathematically using only the public key. This preserves the absolute confidentiality of the signing mechanism."
    },
    {
      q: "How does the X25519 Ephemeral QR Mesh Handshake decisively prevent MitM attacks?",
      a: "Legacy QR login mechanisms transmitted raw authentication tokens over standard web sockets, exposing them to network sniffers. Our protocol dictates that the desktop and mobile devices dynamically generate an ephemeral X25519 shared secret out-of-band. The EIP-191 payload is encrypted via AES-256-GCM before transmission."
    },
    {
      q: "What is the critical function of COOP and COEP headers within the Terminal?",
      a: "COOP and COEP isolate the Terminal's execution environment. This mitigates hardware-level vulnerabilities like Spectre or Meltdown, preventing malicious scripts from performing side-channel memory reads."
    },
    {
      q: "How does the system autonomously achieve MiCA and GDPR compliance?",
      a: "We implement 'Privacy-by-Void'. When a user invokes the 'Right to Be Forgotten', all Personally Identifiable Information (PII) is permanently wiped and substituted with a deterministic SHA-256 hash, ensuring compliance."
    },
    {
      q: "Why employ Neo4j over traditional PostgreSQL for heuristic analysis?",
      a: "Determining the origin of capital across multi-hop transactions is inefficient using traditional SQL JOIN operations. Neo4j’s graph architecture maps these complex relationships natively, resulting in significantly lower latency."
    },
    {
      q: "How does Redis facilitate institutional rate-limiting without database bottlenecks?",
      a: "The user tier is extracted from the verified EdDSA JWT on every request. This is evaluated against atomic counters in a distributed Redis cluster, enforcing rate limits in-memory with microsecond precision."
    }
  ];

  return (
    <div className="w-full bg-white text-[#0A0A0A] py-40 px-6">
       <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-24">
          <div className="lg:w-1/3">
             <div className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#0044CC] mb-8">Documentation</div>
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
               className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-black/60 mb-12 border border-black/10 rounded-full px-6 py-2 bg-white shadow-sm"
            >
               Developer Resources
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
               The technical reference for institutional integrators and engineers. Built collaboratively with <strong>Aztec Network</strong>, we detail the cryptographic parameters, privacy models, and system architecture that powers the network.
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
      <SovereignFooter />

    </div>
  );
}
