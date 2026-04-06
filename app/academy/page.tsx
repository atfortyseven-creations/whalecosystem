"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, GraduationCap, Video, BookOpen, ChevronRight } from "lucide-react";

const ACADEMY_MODULES = [
    {
        id: "m1",
        title: "1. Aztec L2 Zero-Knowledge Circuits",
        desc: "Mastering fractional rollups and the circomlibjs boundary. Understanding how to prove authority without linking root addresses to the Terminal session.",
        content: "By compiling the circuits directly on device natively with circomlibjs and deploying on Aztec L2, we secure completely anonymous intelligence access. Dive into our detailed 45-minute technical deep dive to learn the implementation.",
        time: "45 mins"
    },
    {
        id: "m2",
        title: "2. EVM Mempool Thermodynamics",
        desc: "Execution traces based on EIP-2929. Tracking SLOAD and SSTORE geometrical gas costs to evaluate incoming institutional logic execution.",
        content: "When institutional players map storage arrays via EVM opcodes, they leave predictable gas trails in the mempool. Learn how to reconstruct these structures before miners validate them using raw TX interception.",
        time: "60 mins"
    },
    {
        id: "m3",
        title: "3. Transient State Analysis (EIP-1153)",
        desc: "Reentrancy architectures mapped via TSTORE memory. Decoding volatile variables used by top-tier Dark Pool smart contracts.",
        content: "TSTORE and TLOAD allow for transient memory that is discarded after a transaction. Whale Network leverages this transient data to capture MEV patterns executing entirely inside the boundary of a single block.",
        time: "35 mins"
    },
    {
        id: "m4",
        title: "4. Neo4j Institutional Graph",
        desc: "Navigating deep-nested cross-chain associations. Tracing multi-step liquidity bridging directly from cold-storage into Hyperliquid margins.",
        content: "A detailed breakdown of how we index over 5.4 Billion Ethereum addresses utilizing Neo4J and Cypher queries to pinpoint exactly when a Sovereign Whale crosses liquidity from Cold Storage directly into decentralized leverage venues.",
        time: "90 mins"
    }
];

export default function AcademyPage() {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const toggleModule = (id: string) => {
        if (expandedId === id) setExpandedId(null);
        else setExpandedId(id);
    };

    return (
        <div className="min-h-screen bg-[#020202] text-white/80 font-sans pb-32 pt-28 px-6">
            <div className="max-w-4xl mx-auto">
                <div className="mb-16 text-center md:text-left">
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-emerald-500/20 text-[10px] font-mono uppercase tracking-[0.2em] font-semibold text-emerald-400 mb-8 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                        <GraduationCap size={14} />
                        Whale Academy
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-6 uppercase">
                        Sovereign <br className="hidden md:block" />
                        <span className="text-emerald-500">Intelligence</span> Matrix
                    </h1>
                    <p className="text-lg text-white/50 max-w-2xl leading-relaxed md:border-l-2 md:border-emerald-500/20 md:pl-6">
                        Theoretical mastery is the prerequisite for deterministic execution. Choose a module below to unlock advanced concepts on decentralized analysis.
                    </p>
                </div>

                <div className="space-y-4">
                    {ACADEMY_MODULES.map((mod) => {
                        const isExpanded = expandedId === mod.id;
                        return (
                            <div key={mod.id} className={`rounded-3xl border transition-all duration-500 overflow-hidden ${isExpanded ? 'border-emerald-500/40 bg-[#0A0A0A]' : 'border-white/5 bg-[#050505] hover:bg-[#080808] hover:border-emerald-500/20'}`}>
                                <button
                                    onClick={() => toggleModule(mod.id)}
                                    className="w-full text-left p-6 md:p-8 flex items-center justify-between outline-none"
                                >
                                    <div className="flex-1 pr-6">
                                        <h3 className={`text-xl md:text-2xl font-black uppercase tracking-tight mb-3 transition-colors ${isExpanded ? 'text-emerald-400' : 'text-white'}`}>
                                            {mod.title}
                                        </h3>
                                        <p className="text-sm font-mono text-white/40 leading-relaxed">
                                            {mod.desc}
                                        </p>
                                    </div>
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${isExpanded ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)] rotate-180' : 'bg-white/5 text-white/40'}`}>
                                        <ChevronDown size={20} />
                                    </div>
                                </button>
                                
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                        >
                                            <div className="p-6 md:p-8 pt-0 border-t border-white/5 bg-[#080808]">
                                                <div className="mt-8 flex flex-col md:flex-row gap-8">
                                                    <div className="flex-1 space-y-6">
                                                        <h4 className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em] flex items-center gap-2">
                                                            <BookOpen size={12} /> Class Syllabus Content
                                                        </h4>
                                                        <p className="text-base text-white/70 leading-relaxed">
                                                            {mod.content}
                                                        </p>
                                                    </div>
                                                    
                                                    <div className="md:w-72 bg-[#020202] rounded-2xl p-5 border border-white/5 space-y-4">
                                                        <div className="w-full aspect-video bg-emerald-900/20 rounded-xl border border-emerald-500/20 flex items-center justify-center relative overflow-hidden group cursor-pointer">
                                                            <div className="absolute inset-0 bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors" />
                                                            <div className="w-10 h-10 rounded-full bg-emerald-500 text-black flex items-center justify-center z-10 shadow-[0_0_20px_rgba(16,185,129,0.5)] group-hover:scale-110 transition-transform">
                                                                <Video size={16} className="ml-1" />
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between text-xs font-mono">
                                                            <span className="text-white/40 flex items-center gap-1.5"><ChevronRight size={12} /> Duration</span>
                                                            <span className="text-emerald-400 font-bold">{mod.time}</span>
                                                        </div>
                                                        <button className="w-full py-3 bg-white/5 hover:bg-emerald-500/10 hover:text-emerald-400 text-white/70 font-black text-[10px] tracking-[0.2em] uppercase rounded-xl transition-all border border-transparent hover:border-emerald-500/20">
                                                            Start Execution
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
