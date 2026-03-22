"use client";

import React, { useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowRight, BookOpen, Terminal, Shield, Lock, Activity, Users, Puzzle, Code2, Server, Globe, Cpu, ArrowDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Downhead } from "@/components/shared/Downhead";
import AntiPhishing from "@/components/security/AntiPhishing";

// ─── UTILITIES ───
const StaggeredText = ({ text, className }: { text: string; className?: string }) => {
  return (
    <motion.span 
      initial="hidden" 
      whileInView="visible" 
      viewport={{ once: true }} 
      transition={{ staggerChildren: 0.05 }}
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
      date: "22 Jul",
      title: "Adversarial Testnet is here!",
      desc: "Start building privacy-preserving forensic apps.",
      action: "Read Announcement",
    },
    {
      date: "8 Jun",
      title: "Zero-Knowledge Case Study: Local Identity Protocol",
      desc: "Learn about using ZK-Proofs to add private identity verification to your quant scripts.",
      action: "Read Article",
    },
    {
      date: "1 May",
      title: "V4 Public Engine is now live!",
      desc: "Experience the predictive power of the Neural Trend Simulator for yourself.",
      action: "Try Testnet",
    }
  ];

  return (
    <div className="w-full max-w-[1400px] mx-auto py-32 px-6">
      <div className="flex flex-col md:flex-row justify-between items-start mb-16 gap-8">
        <h2 className="font-aztec-serif text-5xl md:text-7xl font-black text-[var(--aztec-ink)] leading-[0.9]">
          Builder <br /><span className="italic text-[var(--aztec-orchid)]">Announcements</span>
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
             className="group relative bg-[var(--aztec-parchment)] p-8 md:p-12 border border-[var(--aztec-ink)]/10 hover:border-[var(--aztec-orchid)]/50 transition-all cursor-pointer shadow-lg hover:shadow-2xl overflow-hidden min-h-[400px] flex flex-col justify-between"
          >
             <div className="absolute inset-0 noise-bg opacity-[0.03] pointer-events-none mix-blend-multiply" />
             <div className="relative z-10">
               <div className="font-aztec-mono text-[10px] uppercase tracking-widest text-[var(--aztec-ink)]/40 mb-8">{a.date}</div>
               <h3 className="font-aztec-serif text-3xl font-black text-[var(--aztec-ink)] mb-6 leading-tight group-hover:text-[var(--aztec-orchid)] transition-colors">
                  {a.title}
               </h3>
               <p className="font-sans text-[var(--aztec-ink)]/60 text-lg leading-relaxed mb-8">
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

// 2. Finally, the Full Stack (01-06)
const FullStack = () => {
  const stacks = [
    { num: "01", title: "Incredibly Simple Privacy Controls", desc: "Easily program privacy or transparency—at any layer: user, data, metadata, transaction, or logic. With Whale Alert's deterministic protocol, public and private functions seamlessly interweave in a single smart contract." },
    { num: "02", title: "Total Privacy, from End-to-End", desc: "Build apps with private accounts, data, transactions, and function execution with client-side zero-knowledge proofs. Private functions are executed on the user’s device, so sensitive data stays where it belongs." },
    { num: "03", title: "Native Account Abstraction", desc: "Every account is a smart contract. This unlocks flexible, programmable identities—with features like gas sponsorship, custom nonce control, and alternative signature schemes—like passkeys." },
    { num: "04", title: "Local Developer Environment", desc: "Builders can utilize the Forensic Sandbox—a local network pre-packaged with built-in accounts, tokens, and a node—to streamline testing, backtesting and development." },
    { num: "05", title: "Powerful Tools, Familiar Workflows", desc: "Fully loaded with tools to enhance your experience—including CLI utilities to compile, deploy, interact with tracking projects, and run benchmarks. It also comes with IDE extensions for code completion." },
    { num: "06", title: "Permissionless Ecosystem", desc: "Join an ambitious, growing community of frontline quants shipping and scaling everything from L1 compliance bridges to cross-chain integrations, core primitives, and full data-aggregators." }
  ];

  return (
    <div className="w-full max-w-[1400px] mx-auto py-40 px-6">
      <div className="mb-24 px-4 border-l-4 border-[var(--aztec-chartreuse)]">
         <h2 className="font-aztec-serif text-6xl md:text-8xl font-black text-[var(--aztec-ink)] leading-[0.85] uppercase">
            Finally,<br/> <span className="italic">the Full Stack</span>.
         </h2>
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
            <p className="font-sans text-lg text-[var(--aztec-ink)]/60 leading-relaxed border-l border-[var(--aztec-ink)]/10 pl-6 group-hover:border-[var(--aztec-chartreuse)] transition-colors duration-500">
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
       {/* Background Noise for contrast */}
       <div className="absolute inset-0 noise-bg opacity-10 pointer-events-none mix-blend-overlay" />
       
       <div className="max-w-[1400px] mx-auto relative z-10 flex flex-col lg:flex-row gap-20">
          <div className="lg:w-1/3">
             <div className="font-aztec-mono text-[11px] uppercase tracking-[0.5em] text-[var(--aztec-chartreuse)] mb-6">Tools and Libraries</div>
             <h2 className="font-aztec-serif text-6xl lg:text-7xl font-black uppercase leading-[0.9] mb-8">
               Your tools <br/>are <span className="italic text-[var(--aztec-orchid)]">ready</span> <br/>and waiting.
             </h2>
             <p className="font-sans text-xl text-[var(--aztec-ink)]/60 italic border-l-2 border-[var(--aztec-chartreuse)] pl-6 py-2">
               All You Have <br/>to Do Is Build
             </p>
          </div>

          <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* Category 1 */}
             <div className="bg-[var(--aztec-ink)]/5 p-10 hover:bg-[var(--aztec-ink)]/10 transition-colors border border-[var(--aztec-ink)]/5">
                <div className="font-aztec-mono text-[10px] tracking-widest uppercase text-[var(--aztec-ink)]/40 mb-6 border-b border-[var(--aztec-ink)]/10 pb-4">Block Explorers</div>
                <div className="space-y-4 font-aztec-serif text-2xl font-black">
                   <div className="hover:text-[var(--aztec-chartreuse)] cursor-pointer transition-colors">Forensic Explorer</div>
                   <div className="hover:text-[var(--aztec-chartreuse)] cursor-pointer transition-colors">WhaleScan</div>
                </div>
             </div>
             {/* Category 2 */}
             <div className="bg-[var(--aztec-ink)]/5 p-10 hover:bg-[var(--aztec-ink)]/10 transition-colors border border-[var(--aztec-ink)]/5">
                <div className="font-aztec-mono text-[10px] tracking-widest uppercase text-[var(--aztec-ink)]/40 mb-6 border-b border-[var(--aztec-ink)]/10 pb-4">Bridges</div>
                <div className="space-y-4 font-aztec-serif text-2xl font-black">
                   <div className="hover:text-[var(--aztec-chartreuse)] cursor-pointer transition-colors">human.tech</div>
                </div>
             </div>
             {/* Category 3 */}
             <div className="bg-[var(--aztec-ink)]/5 p-10 hover:bg-[var(--aztec-ink)]/10 transition-colors border border-[var(--aztec-ink)]/5">
                <div className="font-aztec-mono text-[10px] tracking-widest uppercase text-[var(--aztec-ink)]/40 mb-6 border-b border-[var(--aztec-ink)]/10 pb-4">IDE Tools</div>
                <div className="space-y-4 font-aztec-serif text-2xl font-black">
                   <div className="hover:text-[var(--aztec-chartreuse)] cursor-pointer transition-colors">Noir VS Code Extension</div>
                   <div className="hover:text-[var(--aztec-chartreuse)] cursor-pointer transition-colors">Remix IDE Plugin</div>
                </div>
             </div>
             {/* Category 4 */}
             <div className="bg-[var(--aztec-ink)]/5 p-10 hover:bg-[var(--aztec-ink)]/10 transition-colors border border-[var(--aztec-ink)]/5 md:row-span-2 flex flex-col justify-between">
                <div>
                   <div className="font-aztec-mono text-[10px] tracking-widest uppercase text-[var(--aztec-ink)]/40 mb-6 border-b border-[var(--aztec-ink)]/10 pb-4">Wallets</div>
                   
                   <div className="mb-10">
                      <div className="font-aztec-serif text-2xl font-black hover:text-[var(--aztec-chartreuse)] cursor-pointer transition-colors mb-3">Obsidion</div>
                      <p className="font-sans text-sm text-[var(--aztec-parchment)]/50 leading-relaxed">
                        User-friendly by design, privacy-preserving by default. Features passkey login, email recovery, and smooth dapp connectivity.
                      </p>
                   </div>

                   <div>
                      <div className="font-aztec-serif text-2xl font-black hover:text-[var(--aztec-chartreuse)] cursor-pointer transition-colors mb-3">Azguard</div>
                      <p className="font-sans text-sm text-[var(--aztec-parchment)]/50 leading-relaxed">
                        A browser extension wallet that lets you hold, send, and connect—privately and seamlessly inside the ecosystem.
                      </p>
                   </div>
                </div>

                <div className="mt-12 font-aztec-mono text-[11px] font-black uppercase tracking-widest text-[var(--aztec-chartreuse)] flex items-center gap-4 hover:gap-6 transition-all cursor-pointer">
                   See All Tools <ArrowRight size={14} />
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
             <div className="font-aztec-mono text-[11px] uppercase tracking-[0.4em] text-[var(--aztec-orchid)] mb-6">Start in the Sandbox</div>
             <h2 className="font-aztec-serif text-6xl md:text-8xl font-black text-[var(--aztec-ink)] uppercase leading-[0.9] mb-8 text-balance">
                Build fast.<br/> Break <span className="italic">nothing</span>.
             </h2>
             <p className="font-sans text-2xl text-[var(--aztec-ink)]/60 leading-relaxed mb-12">
               Explore your new powers in the zero-knowledge execution Sandbox.
             </p>
             <button className="px-12 py-6 bg-[var(--aztec-ink)] text-[var(--aztec-parchment)] font-aztec-mono text-[11px] font-black uppercase tracking-widest transition-transform hover:scale-105 active:scale-95">
                Go To Docs
             </button>
          </div>
          
          <div className="md:w-1/2 w-full space-y-4">
             {[
               { title: "Jump into the Local Sandbox", sub: "Terminal Environment", icon: Terminal },
               { title: "Start working in Testnet", sub: "Right out of your browser", icon: Globe },
               { title: "Build a Counter Contract", sub: "Go to the Starter Repo", icon: Code2 }
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

// 5. Hybrid Transaction Lifecycle Graphic
const TransactionDiagram = () => {
  return (
    <div className="bg-[var(--aztec-ink)]/95 text-white py-40 px-6 relative overflow-hidden border-t-4 border-[var(--aztec-chartreuse)]">
      <div className="absolute inset-0 noise-bg opacity-[0.05]" />
      
      <div className="max-w-[1400px] mx-auto text-center mb-32 relative z-10">
         <div className="font-aztec-mono text-[10px] uppercase tracking-[0.5em] text-[var(--aztec-chartreuse)] mb-6">Hybrid Transaction Lifecycle</div>
         <h2 className="font-aztec-serif text-6xl md:text-8xl font-black uppercase leading-[0.9] mb-8">
            Inside a <span className="italic">Transaction</span>
         </h2>
         <p className="font-sans text-xl text-white/50 max-w-3xl mx-auto leading-relaxed border-b border-white/10 pb-16">
            Travel alongside a hybrid transaction and discover how the determinisitic protocol efficiently processes both public and private functions—making it the ideal ledger for building and deploying tracking apps.
         </p>
      </div>

      {/* The Diagram Map */}
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-12 relative z-10 items-stretch">
         {/* 1. USER */}
         <div className="border border-white/10 p-8 flex flex-col justify-between hover:bg-white/5 transition-colors relative group">
            <div className="font-aztec-mono text-[10px] uppercase tracking-[0.3em] text-white/40 mb-6">User</div>
            <h3 className="font-aztec-serif text-3xl font-black text-[var(--aztec-chartreuse)] mb-4 leading-tight">App UI</h3>
            <p className="font-sans text-sm text-white/60 mb-12">User opens app and is prompted to sign into browser-based wallet</p>
            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center font-aztec-mono text-xl font-black group-hover:bg-white group-hover:text-black transition-colors">1</div>
         </div>

         {/* 2. DEV */}
         <div className="border border-white/10 p-8 flex flex-col justify-between bg-white/5 hover:bg-white/10 transition-colors relative group col-span-1 lg:col-span-2">
            <div className="font-aztec-mono text-[10px] uppercase tracking-[0.3em] text-white/40 mb-6">Dev</div>
            <h3 className="font-aztec-serif text-3xl font-black mb-12">App Program (Hybrid Contract)</h3>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <h4 className="font-aztec-serif text-xl font-bold text-[#FF0055] mb-2">Private Functions</h4>
                  <p className="font-sans text-xs text-white/50 mb-4">Sensitive data stays on the user's device</p>
                  <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center font-aztec-mono text-sm group-hover:border-[#FF0055] transition-colors">2A</div>
               </div>
               <div>
                  <h4 className="font-aztec-serif text-xl font-bold text-[#00FFFF] mb-2">Public Functions</h4>
                  <p className="font-sans text-xs text-white/50 mb-4">Public functions live on the network and execute per request</p>
                  <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center font-aztec-mono text-sm group-hover:border-[#00FFFF] transition-colors">2B</div>
               </div>
            </div>
         </div>

         {/* 3. Output / Private Execution */}
         <div className="border border-[var(--aztec-orchid)]/30 p-8 flex flex-col justify-between bg-[var(--aztec-orchid)]/5 hover:bg-[var(--aztec-orchid)]/10 transition-colors relative group col-span-1 lg:col-span-2 shadow-[0_0_50px_rgba(209,37,199,0.05)]">
            <div className="font-aztec-mono text-[10px] uppercase tracking-[0.3em] text-[var(--aztec-orchid)] mb-6">Aztec Wallet & PXE</div>
            <p className="font-sans text-sm text-white/80 mb-8 leading-relaxed">App connects user's wallet and private execution environment (PXE) to execute functions client-side.</p>
            
            <div className="bg-[#000] p-4 rounded-xl border border-white/10">
               <div className="font-aztec-mono text-[8px] tracking-widest text-[var(--aztec-chartreuse)] mb-2 uppercase">Hybrid Transaction Output</div>
               <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-white/90 font-bold">Private Proof</div>
                  <div className="text-[10px] text-white/40">Hash of private state</div>
               </div>
               <div className="flex items-center justify-between">
                  <div className="text-xs text-white/90 font-bold">Public Txn Request</div>
                  <div className="text-[10px] text-white/40">Execution intent</div>
               </div>
            </div>
         </div>

         {/* 4. Decentralized Sequencer Network */}
         <div className="border border-white/10 p-8 flex flex-col hover:bg-white/5 transition-colors relative group col-span-1 md:col-span-3 lg:col-span-3 min-h-[300px]">
            <div className="font-aztec-mono text-[10px] uppercase tracking-[0.3em] text-[var(--aztec-chartreuse)] mb-6">Aztec Network</div>
            <h3 className="font-aztec-serif text-4xl font-black mb-8">Decentralized Sequencer</h3>
            <div className="flex flex-col md:flex-row gap-8 flex-1">
               <div className="flex-1 bg-white/5 p-6 border-l-2 border-[#FF0055]">
                  <p className="text-sm font-bold text-white mb-2">Verifies private transaction proofs</p>
                  <p className="text-xs text-white/50">UTXO Model (4A)</p>
               </div>
               <div className="flex-1 bg-white/5 p-6 border-l-2 border-[#00FFFF]">
                  <p className="text-sm font-bold text-white mb-2">Retrieves and executes public functions</p>
                  <p className="text-xs text-white/50">Account Based Model (4B)</p>
               </div>
            </div>
         </div>

         {/* 5. L1 Settlement */}
         <div className="border border-white/10 p-8 flex flex-col justify-between hover:bg-white/5 transition-colors relative group col-span-1 md:col-span-2 lg:col-span-2 min-h-[300px]">
            <div className="font-aztec-mono text-[10px] uppercase tracking-[0.3em] text-white/40 mb-6">Proven Chain</div>
            <h3 className="font-aztec-serif text-4xl font-black text-[#627EEA] mb-8">L1 Ethereum</h3>
            <p className="font-sans text-sm text-white/60 mb-8 leading-relaxed">
               The block is settled on Ethereum—allowing anyone to verify the state of the network. Finalized Block ZK Proof of 32-block epoch.
            </p>
            <div className="flex items-center gap-4 border-t border-white/10 pt-6">
               <div className="w-12 h-12 flex-shrink-0 bg-[#627EEA]/20 border border-[#627EEA] text-[#627EEA] rounded-xl flex items-center justify-center font-bold">L1</div>
               <div className="text-xs text-white/40">Verified On-Chain</div>
            </div>
         </div>

      </div>
    </div>
  );
};

// 6. Bleeding Edge Research
const ResearchSection = () => {
  return (
    <div className="w-full bg-[var(--aztec-parchment)] py-40 px-6 relative overflow-hidden border-t-2 border-[var(--aztec-ink)]">
      {/* Background Image Removed */}
      <div className="absolute inset-0 z-0 bg-[var(--aztec-parchment)]" />

      <div className="max-w-[1400px] mx-auto relative z-10 flex flex-col lg:flex-row gap-20 items-center">
         <div className="lg:w-1/3">
            <h2 className="font-aztec-serif text-7xl font-black text-[var(--aztec-ink)] uppercase leading-[0.8] mb-12">
               Bleeding-edge <br/><span className="italic text-[var(--aztec-orchid)]">Research</span>.
            </h2>
            <div className="space-y-6">
               {["PLONK", "SHPLONK", "The Aztec Protocol", "Turbo-PLONK", "Zeromorph", "plookup", "Halo Infinite"].map((term, i) => (
                  <div key={i} className="font-aztec-mono text-sm tracking-[0.3em] text-[var(--aztec-ink)]/20 uppercase hover:text-[var(--aztec-ink)] transition-colors cursor-default select-none">
                     {term}
                  </div>
               ))}
            </div>
         </div>

         <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-3 gap-y-12 gap-x-12 lg:pl-16">
            <div className="border-t-[10px] border-[var(--aztec-chartreuse)] pt-8">
               <div className="font-aztec-serif text-8xl font-black text-[var(--aztec-ink)] mb-4">7</div>
               <div className="font-aztec-mono text-[11px] uppercase tracking-widest text-[var(--aztec-ink)]/70 mb-2">White Papers</div>
               <div className="font-sans text-sm text-[var(--aztec-ink)]/40">Published from 2018 to 2024</div>
            </div>

            <div className="border-t-[10px] border-[var(--aztec-ink)] pt-8">
               <div className="font-aztec-serif text-8xl font-black text-[var(--aztec-ink)] mb-4">1,024</div>
               <div className="font-aztec-mono text-[11px] uppercase tracking-widest text-[var(--aztec-ink)]/70 mb-2">Citations</div>
               <div className="font-sans text-sm text-[var(--aztec-ink)]/40">In Peer Review Journals</div>
            </div>

            <div className="border-t-[10px] border-[var(--aztec-orchid)] pt-8">
               <div className="font-aztec-serif text-8xl font-black text-[var(--aztec-ink)] mb-4">3</div>
               <div className="font-aztec-mono text-[11px] uppercase tracking-widest text-[var(--aztec-ink)]/70 mb-2">Monumental Contributions</div>
               <div className="font-sans text-sm text-[var(--aztec-ink)]/40">PLONK Cryptography, Noir DSL and Neural Trend System</div>
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
    "What is Whale Alert and why build on a privacy-first Layer 2?",
    "How does the Forensic Protocol compare to other L2 blockchains for builders?",
    "What programming language do I use to build projects on the engine?",
    "What are Hybrid smart contracts and how are they different?",
    "How do private tracking apps work under the hood?",
    "How does the zk-rollup design benefit quantitative developers?",
    "What tools are available for developers building on the terminal?",
    "What kinds of private applications can I build?",
    "How does decentralization work for forensic developers?"
  ];

  return (
    <div className="w-full bg-[var(--aztec-parchment)] text-[var(--aztec-ink)] py-40 px-6 border-t border-[var(--aztec-ink)]/5">
       <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-20">
          <div className="lg:w-1/3">
             <div className="font-aztec-mono text-[10px] uppercase tracking-[0.4em] text-[var(--aztec-chartreuse)] mb-6">Discovery</div>
             <h2 className="font-aztec-serif text-7xl font-black uppercase leading-[0.8] mb-12">
               FAQs
             </h2>
          </div>
          <div className="lg:w-2/3 border-t border-[var(--aztec-parchment)]/10">
             {faqs.map((f, i) => (
                <div 
                   key={i} 
                   onClick={() => setOpenIndex(openIndex === i ? null : i)}
                   className="py-8 border-b border-[var(--aztec-parchment)]/10 flex justify-between items-center group cursor-pointer hover:border-[var(--aztec-chartreuse)] hover:pl-6 transition-all duration-300"
                >
                   <div>
                     <h4 className="font-aztec-serif text-2xl font-bold text-[var(--aztec-parchment)] group-hover:text-[var(--aztec-chartreuse)] pr-8 leading-tight">
                       {f}
                     </h4>
                     <AnimatePresence>
                        {openIndex === i && (
                           <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-6 text-[var(--aztec-parchment)]/60 font-sans leading-relaxed pr-12 overflow-hidden"
                           >
                              Built on the deterministic forensic axioms of the overarching Aztec architecture. This response acts as technical clarification regarding smart-contract inter-layer behaviors.
                           </motion.div>
                        )}
                     </AnimatePresence>
                   </div>
                   <ArrowDown className={`min-w-8 text-[var(--aztec-parchment)]/20 group-hover:text-[var(--aztec-chartreuse)] transition-transform duration-500 ${openIndex === i ? "rotate-0 text-[var(--aztec-chartreuse)]" : "-rotate-90"}`} size={32} />
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
         <div className="text-white mix-blend-difference font-aztec-mono text-[10px] md:text-[11px] font-black tracking-[0.3em] md:tracking-[0.5em] uppercase pointer-events-auto cursor-pointer hover:text-[var(--aztec-chartreuse)] transition-colors">
            <Link href="/" className="px-3 hover:text-[var(--aztec-orchid)] transition-colors">Network</Link> // Token // Roadmap // Basics // Docs // Developers
         </div>
      </div>
      
      {/* ── HERO SECTION ── */}
      <section className="relative min-h-[90vh] flex flex-col justify-center px-6 pt-32 pb-16">
         {/* Background Immersion Removed for Fluidity */}
         <div className="absolute inset-0 z-0 bg-[var(--aztec-parchment)]" />

         {/* Grain & Noise */}
         <div className="absolute inset-0 z-[1] noise-bg opacity-[0.25] mix-blend-multiply pointer-events-none" />
         
         <div className="max-w-[1400px] mx-auto w-full relative z-10 text-center flex flex-col items-center mt-12">
            
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="font-aztec-mono text-[10px] uppercase tracking-[0.6em] text-[var(--aztec-ink)] mb-12 border border-[var(--aztec-ink)]/10 rounded-full px-6 py-2 bg-[var(--aztec-parchment)]/50 backdrop-blur-md shadow-xl"
            >
               Developer Ecosystem
            </motion.div>

            <h1 className="font-aztec-serif text-[clamp(4rem,10vw,11rem)] font-black text-[var(--aztec-ink)] leading-[0.85] tracking-tighter uppercase text-balance max-w-[95vw] mb-12 drop-shadow-lg">
               Meet your <br/>
               <span className="italic relative inline-block text-[var(--aztec-orchid)] px-4 mt-2">
                  match.
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
               className="font-sans text-2xl md:text-3xl text-[var(--aztec-ink)]/70 max-w-4xl font-medium leading-[1.6] mb-20 text-balance"
            >
               Finally, there’s a design space where you can build and deploy private forensic apps and realize any ambition.
            </motion.p>

         </div>
      </section>

      {/* ── ANNOCUNCEMENTS ── */}
      <BuilderAnnouncements />

      {/* ── FULL STACK (01 - 06) ── */}
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
      <div className="bg-[var(--aztec-chartreuse)] py-32 px-6 text-center border-t border-[var(--aztec-ink)]/10 relative overflow-hidden">
         <div className="absolute inset-0 noise-bg opacity-[0.05] pointer-events-none mix-blend-multiply" />
         <div className="relative z-10">
            <h2 className="font-aztec-serif text-6xl md:text-8xl font-black text-[var(--aztec-ink)] uppercase tracking-tighter mb-12">
               Build the future <br/>with an <span className="italic">edge</span>.
            </h2>
            <div className="flex flex-col md:flex-row max-w-xl mx-auto items-center gap-4 shadow-2xl">
               <input 
                 type="email" 
                 placeholder="Enter email"
                 className="flex-1 w-full bg-[var(--aztec-parchment)] md:bg-white/50 border border-[var(--aztec-ink)]/20 px-8 py-6 rounded-none outline-none font-aztec-mono text-sm tracking-widest uppercase focus:border-[var(--aztec-ink)] transition-colors placeholder:text-[var(--aztec-ink)]/30 text-[var(--aztec-ink)]"
               />
               <button className="w-full md:w-auto px-12 py-6 bg-[var(--aztec-ink)] text-[var(--aztec-chartreuse)] font-aztec-mono text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-transform active:scale-95 shadow-xl">
                  Subscribe
               </button>
            </div>
         </div>
      </div>

    </div>
  );
}
