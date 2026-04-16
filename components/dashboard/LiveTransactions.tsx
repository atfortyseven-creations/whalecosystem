"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, ArrowRight, Zap, Shield, Database } from 'lucide-react';

interface Transaction {
    id: string;
    hash: string;
    from: string;
    to: string;
    value: string;
    asset: string;
    chain: string;
    type: string;
    timestamp: string;
}

const CHAINS = ['ETHEREUM', 'BASE', 'BSC', 'POLYGON', 'SOLANA'];
const ASSETS = ['ETH', 'USDC', 'WETH', 'USDT', 'SOL', 'BNB'];

export default function LiveTransactions() {
    const [txs, setTxs] = useState<Transaction[]>([]);

    useEffect(() => {
        // [INSTITUTIONAL MOCK STREAM] 
        // Generates high-fidelity simulated traffic for real-time visual stimulus
        const interval = setInterval(() => {
            const newTx: Transaction = {
                id: Math.random().toString(36).substring(7),
                hash: '0x' + Math.random().toString(16).substring(2, 10).toUpperCase() + '...',
                from: '0x' + Math.random().toString(16).substring(2, 6) + '...' + Math.random().toString(16).substring(2, 6),
                to: '0x' + Math.random().toString(16).substring(2, 6) + '...' + Math.random().toString(16).substring(2, 6),
                value: (Math.random() * 50).toFixed(3),
                asset: ASSETS[Math.floor(Math.random() * ASSETS.length)],
                chain: CHAINS[Math.floor(Math.random() * CHAINS.length)],
                type: Math.random() > 0.8 ? 'SWAP' : 'TRANSFER',
                timestamp: new Date().toLocaleTimeString()
            };

            setTxs(prev => [newTx, ...prev].slice(0, 20));
        }, 1200);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="p-8 h-full w-full min-h-0 flex flex-col bg-transparent font-sans">
            <header className="mb-10 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-black uppercase tracking-tighter">Mempool Stream</h2>
                    <p className="text-[10px] text-black/30 font-bold uppercase tracking-[0.3em] mt-1">Cross-chain transaction propagation</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-4 py-2 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-xl">
                        {txs.length} Events / Minute
                    </div>
                </div>
            </header>

            <div className="flex-1 space-y-2 overflow-y-auto pr-4 scrollbar-hide">
                <AnimatePresence initial={false}>
                    {txs.map((tx) => (
                        <motion.div
                            key={tx.id}
                            initial={{ opacity: 0, x: -20, height: 0 }}
                            animate={{ opacity: 1, x: 0, height: 'auto' }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white border border-black/[0.04] p-4 rounded-2xl flex items-center justify-between group hover:border-black/10 transition-all cursor-crosshair shadow-sm hover:shadow-md"
                        >
                            <div className="flex items-center gap-6">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                    tx.chain === 'ETHEREUM' ? 'bg-blue-50 text-blue-500' :
                                    tx.chain === 'SOLANA' ? 'bg-purple-50 text-purple-500' :
                                    'bg-black/5 text-black/40'
                                }`}>
                                    <Database size={16} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-black uppercase tracking-widest">{tx.chain}</span>
                                        <div className="w-1 h-1 rounded-full bg-black/10" />
                                        <span className="text-[10px] font-bold text-black/30 uppercase">{tx.type}</span>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <span className="text-[11px] font-bold text-black/60">{tx.from}</span>
                                        <ArrowRight size={10} className="text-black/20" />
                                        <span className="text-[11px] font-bold text-black/60">{tx.to}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="flex items-center gap-1.5 justify-end">
                                    <span className="text-sm font-black text-black">{tx.value}</span>
                                    <span className="text-[9px] font-black text-black/30 uppercase tracking-widest">{tx.asset}</span>
                                </div>
                                <span className="text-[9px] font-bold text-black/20 uppercase tracking-widest mt-1 block">{tx.timestamp}</span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
