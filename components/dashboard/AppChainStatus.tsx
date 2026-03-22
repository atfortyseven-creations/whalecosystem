"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Network, Shield, Zap, Activity, Bot, Cpu } from 'lucide-react';

export default function AppChainStatus() {
    return (
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white shadow-xl shadow-black/[0.01] space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#1F1F1F] flex items-center justify-center shadow-lg shadow-black/10">
                        <Network className="text-[#00f2ea]" size={24} />
                    </div>
                    <div>
                        <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#1F1F1F]">Human AppChain</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Sovereign Network Live</span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] font-black text-[#1F1F1F]/20 uppercase tracking-widest leading-none">Powered by</div>
                    <div className="text-xs font-bold text-[#1F1F1F] tracking-tighter mt-1 italic">GetBlock Modular</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* PoH Consensus */}
                <div className="bg-[#f2f2ef] rounded-3xl p-6 space-y-4">
                    <div className="flex items-center gap-2 opacity-40">
                        <Shield size={14} />
                        <span className="text-[9px] font-black uppercase tracking-widest">PoH Consensus</span>
                    </div>
                    <div>
                        <div className="text-2xl font-black text-[#1F1F1F] tracking-tight">---</div>
                        <div className="text-[9px] font-bold text-[#1F1F1F]/30 uppercase tracking-tight">Node Sync Pending</div>
                    </div>
                </div>

                {/* Void Throughput */}
                <div className="bg-[#f2f2ef] rounded-3xl p-6 space-y-4">
                    <div className="flex items-center gap-2 opacity-40">
                        <Zap size={14} />
                        <span className="text-[9px] font-black uppercase tracking-widest">The Void Engine</span>
                    </div>
                    <div>
                        <div className="text-2xl font-black text-emerald-600 tracking-tight">0.00ms</div>
                        <div className="text-[9px] font-bold text-[#1F1F1F]/30 uppercase tracking-tight">Latency / Free Gas</div>
                    </div>
                </div>

                {/* AI Compute */}
                <div className="bg-[#1F1F1F] rounded-3xl p-6 space-y-4 text-white">
                    <div className="flex items-center gap-2 opacity-40">
                        <Cpu size={14} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Sovereign AI</span>
                    </div>
                    <div>
                        <div className="text-2xl font-black text-[#00f2ea] tracking-tight">Active</div>
                        <div className="text-[9px] font-bold text-white/30 uppercase tracking-tight">On-Chain Intelligence</div>
                    </div>
                </div>
            </div>

            {/* Signal Feed (Awaiting Data) */}
            <div className="space-y-4 pt-4 border-t border-[#1F1F1F]/5">
                <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#1F1F1F]/40 flex items-center gap-2">
                        <Activity size={12} /> Live Sovereignty Feed
                    </h4>
                    <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded italic">Syncing...</span>
                </div>
                <div className="py-8 flex flex-col items-center justify-center gap-3">
                    <Bot size={24} className="text-[#1F1F1F]/10 animate-pulse" />
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#1F1F1F]/20">Awaiting Real-Time Signals</p>
                </div>
            </div>
        </div>
    );
}

function SignalEntry({ timestamp, type, status, desc }: { timestamp: string, type: string, status: string, desc: string }) {
    return (
        <div className="flex items-center justify-between p-3 hover:bg-[#f2f2ef] rounded-2xl transition-colors group">
            <div className="flex items-center gap-3">
                <div className="text-[10px] font-bold text-[#1F1F1F]/20 font-mono w-12">{timestamp}</div>
                <div>
                    <div className="text-[11px] font-black text-[#1F1F1F] tracking-tight">{type}</div>
                    <div className="text-[9px] text-[#1F1F1F]/40 uppercase font-bold">{desc}</div>
                </div>
            </div>
            <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                status === 'High' ? 'bg-orange-500/10 text-orange-600' : 
                status === 'Success' ? 'bg-emerald-500/10 text-emerald-600' : 
                'bg-blue-500/10 text-blue-600'
            }`}>
                {status}
            </div>
        </div>
    );
}

