"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Link2, Shield, Lock, ChevronRight, 
    ArrowRightLeft, ExternalLink, Zap, Key
} from 'lucide-react';

interface Exchange {
    id: string;
    name: string;
    icon: string;
    description: string;
    status: 'OPTIMIZED' | 'STABLE' | 'BETA';
}

const EXCHANGES: Exchange[] = [
    { id: 'binance', name: 'Binance', icon: 'bnc', description: 'Institutional API Bridge via EdDSA/ECDSA signature verification.', status: 'OPTIMIZED' },
    { id: 'okx', name: 'OKX', icon: 'okx', description: 'Low-latency V5 API integration with sub-ms trade execution.', status: 'OPTIMIZED' },
    { id: 'bybit', name: 'Bybit', icon: 'bbt', description: 'Unified Trading Account support with cross-margin telemetry.', status: 'STABLE' },
    { id: 'coinbase', name: 'Coinbase Pro', icon: 'cbp', description: 'Enterprise-grade custody bridge with direct fiat settlement.', status: 'BETA' }
];

export default function ConnectExchange() {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [apiKey, setApiKey] = useState('');
    const [apiSecret, setApiSecret] = useState('');

    const handleConnect = () => {
        // Logic for exchange connection
    };

    return (
        <div className="h-full bg-transparent flex flex-col p-8 gap-8 font-sans">
            
            {/* ── HEADER ── */}
            <div className="bg-white border border-black/[0.06] rounded-3xl p-10 flex items-center justify-between shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 text-[#00F2EA] mb-4">
                        <Link2 size={24} className="animate-pulse" />
                        <span className="text-[12px] font-black uppercase tracking-[0.2em]">Institutional Exchange Bridge</span>
                    </div>
                    <h1 className="text-4xl font-black text-black uppercase tracking-tighter leading-none mb-4">
                        Connect <span className="text-black/20">Liquidity</span>
                    </h1>
                    <p className="text-[11px] text-black/40 uppercase font-bold tracking-widest max-w-xl leading-relaxed">
                        Securely synchronize your institutional exchange accounts with the Sovereign Terminal. 
                        Your API keys are encrypted locally and never transit our servers.
                    </p>
                </div>
                <div className="hidden md:flex flex-col items-end relative z-10">
                    <div className="text-[9px] font-black text-black/20 uppercase tracking-widest mb-1">Security Layer</div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-black/[0.02] border border-black/[0.05] rounded-full">
                        <Lock size={12} className="text-[#00C076]" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-black/60">AES-256 Local Encryption</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                
                {/* ── EXCHANGE SELECTOR ── */}
                <div className="space-y-4">
                    <div className="text-[10px] font-black text-black/30 uppercase tracking-[0.3em] mb-4 ml-2">Available Nodes</div>
                    <div className="grid gap-3">
                        {EXCHANGES.map((ex) => (
                            <button
                                key={ex.id}
                                onClick={() => setSelectedId(ex.id)}
                                className={`w-full text-left p-6 rounded-3xl border transition-all duration-300 relative group overflow-hidden ${
                                    selectedId === ex.id 
                                        ? 'bg-white border-[#00F2EA]/40 shadow-xl shadow-[#00F2EA]/5' 
                                        : 'bg-white border-black/[0.04] hover:border-black/[0.1] shadow-sm'
                                }`}
                            >
                                <div className="flex items-center gap-5 relative z-10">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black transition-all ${
                                        selectedId === ex.id ? 'bg-[#00F2EA] text-white scale-110 shadow-lg' : 'bg-black/5 text-black/20 group-hover:bg-black group-hover:text-white'
                                    }`}>
                                        {ex.name[0]}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="text-sm font-black uppercase text-black">{ex.name}</h3>
                                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${
                                                ex.status === 'OPTIMIZED' ? 'bg-[#00F2EA]/10 text-[#00F2EA] border-[#00F2EA]/20' : 'bg-black/5 text-black/30 border-black/10'
                                            }`}>
                                                {ex.status}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-black/40 font-medium leading-relaxed uppercase tracking-wide">{ex.description}</p>
                                    </div>
                                    <ChevronRight size={18} className={`transition-transform duration-300 ${selectedId === ex.id ? 'translate-x-1 text-[#00F2EA]' : 'text-black/10'}`} />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── CONNECTION INTERFACE ── */}
                <AnimatePresence mode="wait">
                    {selectedId ? (
                        <motion.div
                            key="connection-form"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white border border-black/[0.06] rounded-[2.5rem] p-10 shadow-xl relative overflow-hidden"
                        >
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center font-black text-lg">
                                    {EXCHANGES.find(e => e.id === selectedId)?.name[0]}
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-black uppercase tracking-tight">Setup {EXCHANGES.find(e => e.id === selectedId)?.name}</h2>
                                    <p className="text-[10px] font-black text-[#00F2EA] uppercase tracking-widest">Awaiting API Payload</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-black/30 uppercase tracking-[0.2em] ml-1">API Access Key</label>
                                    <div className="relative">
                                        <input 
                                            type="password"
                                            value={apiKey}
                                            onChange={(e) => setApiKey(e.target.value)}
                                            className="w-full bg-black/[0.02] border border-black/[0.06] rounded-2xl px-12 py-4 text-sm font-mono outline-none focus:border-[#00F2EA] transition-all"
                                            placeholder="Enter Public Key"
                                        />
                                        <Key size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-black/20" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-black/30 uppercase tracking-[0.2em] ml-1">API Signature Secret</label>
                                    <div className="relative">
                                        <input 
                                            type="password"
                                            value={apiSecret}
                                            onChange={(e) => setApiSecret(e.target.value)}
                                            className="w-full bg-black/[0.02] border border-black/[0.06] rounded-2xl px-12 py-4 text-sm font-mono outline-none focus:border-[#00F2EA] transition-all"
                                            placeholder="Enter Secret Key"
                                        />
                                        <Lock size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-black/20" />
                                    </div>
                                </div>

                                <div className="p-4 bg-black/[0.02] border border-black/[0.04] rounded-2xl flex items-start gap-3">
                                    <Zap size={14} className="text-[#00F2EA] mt-0.5 shrink-0" />
                                    <p className="text-[9px] text-black/40 uppercase tracking-widest font-bold leading-relaxed">
                                        Ensure &quot;Withdrawal&quot; permissions are disabled on your exchange settings. 
                                        The terminal only requires &quot;Read&quot; and &quot;Trade&quot; access.
                                    </p>
                                </div>

                                <button
                                    onClick={handleConnect}
                                    className="w-full py-5 bg-black text-white rounded-3xl font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                                >
                                    Initialize Secure Connection <ArrowRightLeft size={16} />
                                </button>
                            </div>

                        </motion.div>
                    ) : (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12 bg-black/[0.01] border border-dashed border-black/[0.08] rounded-[2.5rem]">
                            <ExternalLink size={32} className="text-black/5 mb-6" />
                            <h3 className="text-sm font-black text-black/20 uppercase tracking-widest mb-2">Awaiting Selection</h3>
                            <p className="text-[10px] text-black/20 uppercase font-bold tracking-widest">Select an exchange node to begin synchronization</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>

        </div>
    );
}
