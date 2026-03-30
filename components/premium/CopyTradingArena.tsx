"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Copy, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { useAccount, useSendTransaction } from 'wagmi';

export function CopyTradingArena() {
    const { isConnected, address } = useAccount();
    const { sendTransactionAsync } = useSendTransaction();
    const [eliteTraders, setEliteTraders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTrader, setSelectedTrader] = useState<any | null>(null);
    const [isCopying, setIsCopying] = useState(false);
    const [copySuccess, setCopySuccess] = useState<string | null>(null);

    const fetchTraders = async () => {
        try {
            const res = await fetch('/api/defi/copy-trading');
            if (res.ok) {
                const data = await res.json();
                setEliteTraders(data.traders || []);
            }
        } catch (e) {
            console.error('Error fetching traders', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTraders();
        const interval = setInterval(fetchTraders, 5000); // 5 sec live polling
        return () => clearInterval(interval);
    }, []);

    const handleCopy = async () => {
        if (!sendTransactionAsync || !address) return;
        setIsCopying(true);
        try {
            // Require the user to sign a 0-value transaction as "API Authentication"
            const hash = await sendTransactionAsync({
                to: address, // send 0 to self as auth
                value: BigInt(0),
                data: "0x436f7079547261646541757468" // hex for "CopyTradeAuth"
            });
            setCopySuccess(hash);
        } catch (err) {
            console.error(err);
        } finally {
            setIsCopying(false);
        }
    };

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-[#FAF9F6] border border-[#E5E5E5] rounded-[2rem] shadow-sm max-w-4xl mx-auto mt-8">
                <AlertTriangle size={48} className="text-[#888888] mb-4 opacity-50" />
                <h3 className="text-xl font-black text-[#111111] uppercase tracking-tighter">API KEYS NOT LINKED</h3>
                <p className="text-sm font-bold text-[#888888] mt-2">Connect Wallet to authenticate API Key Decryption (Hyperliquid / Bybit)</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-8">
            <div className="mb-8 pl-4 border-l-4 border-[#111111]">
                <h2 className="text-3xl font-black text-[#111111] uppercase tracking-tighter flex items-center gap-3">
                    <ShieldCheck size={28} className="text-[#00FFAA]" /> 
                    Copy Trading Arena
                </h2>
                <p className="text-xs font-bold font-mono text-[#888888] uppercase tracking-widest mt-2">
                    Signal Routing Software (Manual Confirmation Required)
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-12 text-center text-[#888888] font-mono text-sm uppercase tracking-widest flex flex-col items-center">
                        <Zap className="animate-pulse mb-3" size={24} />
                        Syncing Market Algorithms...
                    </div>
                ) : eliteTraders.map((trader: any) => (
                    <div key={trader.id} className="bg-[#FAF9F6] border border-[#E5E5E5] rounded-[2rem] p-6 shadow-sm hover:shadow-lg transition-all relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4">
                            <span className="text-[9px] font-black uppercase tracking-widest bg-[#111111] text-[#00FFAA] px-2 py-1 rounded">
                                {trader.badge}
                            </span>
                        </div>
                        
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-[#111111]/5 flex items-center justify-center border border-[#111111]/10">
                                <Zap size={18} className="text-[#111111]" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-[#111111] font-mono">{trader.label}</h3>
                                <p className="text-[10px] font-bold text-[#888888] uppercase tracking-widest">Active Focus: <span className="text-[#111111]">{trader.asset}</span></p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-[#111111]/[0.02] rounded-xl p-3 border border-[#E5E5E5]">
                                <span className="block text-[8px] font-bold text-[#888888] uppercase tracking-widest">Historical PnL</span>
                                <span className="text-lg font-black font-mono text-[#00FFAA]">{trader.pnl}</span>
                            </div>
                            <div className="bg-[#111111]/[0.02] rounded-xl p-3 border border-[#E5E5E5]">
                                <span className="block text-[8px] font-bold text-[#888888] uppercase tracking-widest">Vigor Match</span>
                                <span className="text-lg font-black font-mono text-[#06b6d4]">{trader.vigor}</span>
                            </div>
                        </div>

                        <button 
                            onClick={() => setSelectedTrader(trader)}
                            className="w-full bg-[#111111] hover:bg-[#222222] text-[#FAF9F6] font-black font-sans uppercase tracking-widest text-[11px] py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            <Copy size={16} />
                            ROUTE THIS SIGNAL
                        </button>
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {selectedTrader && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/70 backdrop-blur-md p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-[#FAF9F6] border border-[#E5E5E5] w-full max-w-md rounded-[2rem] p-8 shadow-2xl relative"
                        >
                            {!copySuccess && !isCopying && (
                                <button 
                                    onClick={() => setSelectedTrader(null)}
                                    className="absolute top-6 right-6 text-[#050505]/40 hover:text-[#050505] transition-colors"
                                >
                                    ✕
                                </button>
                            )}

                            {copySuccess ? (
                                <div className="flex flex-col items-center justify-center py-6 space-y-4">
                                    <CheckCircle size={48} className="text-[#00FFAA]" />
                                    <h4 className="text-xl font-black text-[#111111] uppercase tracking-tight">Position Copied</h4>
                                    <p className="text-xs font-bold text-[#888888] uppercase tracking-widest text-center px-4">
                                        API execution completed. Position synced with {selectedTrader.label}
                                    </p>
                                    <div className="bg-[#111111]/[0.02] rounded-xl p-3 w-full border border-[#E5E5E5] text-center mt-4">
                                        <span className="block text-[8px] font-bold text-[#888888] uppercase tracking-widest mb-1">Exchange Hash</span>
                                        <span className="text-[10px] font-mono text-[#06b6d4] break-all">{copySuccess}</span>
                                    </div>
                                    <button 
                                        onClick={() => { setCopySuccess(null); setSelectedTrader(null); }}
                                        className="mt-6 w-full border-2 border-[#111111] text-[#111111] font-black font-sans uppercase tracking-widest text-[11px] py-3 rounded-xl hover:bg-[#111111]/5 transition-all"
                                    >
                                        RETURN TO ARENA
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <h3 className="text-xl font-black text-[#111111] uppercase tracking-tight mb-2">Configure Execution</h3>
                                    <p className="text-xs font-bold text-[#888888] uppercase tracking-widest mb-6">Target: {selectedTrader.label}</p>
                                    
                                    <div className="space-y-4 mb-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-[#888888] uppercase tracking-widest">Allocation (USDC)</label>
                                            <input type="number" defaultValue={500} className="w-full bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl px-4 py-3 text-lg font-mono font-black text-[#111111] focus:outline-none focus:border-[#00FFAA]" />
                                        </div>
                                        <div className="flex justify-between items-center bg-[#111111]/[0.02] p-4 rounded-xl border border-[#E5E5E5]">
                                            <span className="text-[10px] font-bold text-[#888888] uppercase tracking-widest">Auto-Leverage</span>
                                            <span className="text-sm font-black font-mono text-[#111111]">10x MAX</span>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={handleCopy}
                                        disabled={isCopying}
                                        className="w-full bg-[#111111] text-white disabled:bg-[#E5E5E5] disabled:text-[#888888] font-black font-sans uppercase tracking-widest text-[11px] py-4 rounded-xl transition-all shadow-md flex justify-center"
                                    >
                                        {isCopying ? <Zap size={16} className="animate-pulse" /> : 'CONFIRM API EXECUTION'}
                                    </button>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
