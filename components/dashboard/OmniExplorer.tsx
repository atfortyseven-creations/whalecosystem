"use client";

import React, { useState, useEffect } from "react";
import { Search, Activity, Box, ArrowRight, ArrowLeftRight, Clock, ShieldCheck, AlignLeft } from "lucide-react";
import { usePublicClient, useBlockNumber } from 'wagmi';
import { formatEther } from 'viem';

export function OmniExplorer() {
    const [searchQuery, setSearchQuery] = useState("");
    const publicClient = usePublicClient();
    const { data: blockNumber } = useBlockNumber({ watch: true });
    
    const [blocks, setBlocks] = useState<any[]>([]);
    const [massiveTxs, setMassiveTxs] = useState<any[]>([]);

    useEffect(() => {
        if (!publicClient || !blockNumber) return;

        const fetchBlock = async () => {
            try {
                const block = await publicClient.getBlock({
                    blockNumber: blockNumber,
                    includeTransactions: true
                });

                const targetBlock = {
                    height: Number(block.number),
                    age: '0 secs ago',
                    txs: block.transactions.length,
                    size: (Number(block.size) / 1000000).toFixed(2) + ' MB',
                    validator: block.miner ? (block.miner.substring(0,6) + '...' + block.miner.substring(38)) : '0xSync...'
                };

                setBlocks(prev => {
                    const exists = prev.find(p => p.height === targetBlock.height);
                    if (exists) return prev;
                    return [targetBlock, ...prev].slice(0, 5);
                });

                const txs = block.transactions as any[];
                // Filter large transactions
                const valTxs = txs
                    .filter((t: any) => t.value && t.value > 0n)
                    .sort((a,b) => (a.value < b.value ? 1 : -1))
                    .slice(0, 5);
                
                if (valTxs.length > 0) {
                    const newMassive = valTxs.map(t => ({
                        hash: t.hash.substring(0,6) + '...' + t.hash.substring(60),
                        age: 'New Block',
                        from: t.from.substring(0,6) + '...' + t.from.substring(38),
                        to: t.to ? (t.to.substring(0,6) + '...' + t.to.substring(38)) : 'Contract',
                        value: Number(formatEther(t.value)).toFixed(2) + ' ETH',
                        type: 'TRANSFER'
                    }));
                    setMassiveTxs(prev => {
                        const combined = [...newMassive, ...prev];
                        return combined.slice(0, 5); // Keep top 5 latest large txs
                    });
                }

            } catch (e) {
                console.error('Failed to fetch block', e);
            }
        };

        fetchBlock();
    }, [blockNumber, publicClient]);

    return (
        <div className="min-h-full w-full bg-[#000000] text-[#FFFFFF] font-mono p-4 md:p-8 flex flex-col gap-12 selection:bg-[#00FF55] selection:text-black overflow-y-auto">
            
            {/* Header / Search Area */}
            <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto pt-12 pb-8 gap-8">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
                        OMNICHAIN <span className="text-[#00FF55]">EXPLORER</span>
                    </h1>
                    <p className="text-[11px] text-[#888888] tracking-[0.2em] uppercase max-w-2xl">
                        Zero-Knowledge Terminal Indexing the Largest Institutional Flows Across the Ledger.
                    </p>
                </div>

                <div className="w-full relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <Search size={20} className="text-[#00FF55]" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#050505] border-2 border-[#333333] focus:border-[#00FF55] text-white p-6 pl-14 outline-none transition-colors text-sm uppercase tracking-widest placeholder:text-[#555555]"
                        placeholder="SEARCH BY ADDRESS / TX HASH / BLOCK / ENS"
                    />
                    <button className="absolute inset-y-2 right-2 bg-[#00FF55] text-black px-6 font-black text-xs uppercase tracking-widest hover:bg-white transition-colors">
                        SCAN
                    </button>
                    {/* Corner aesthetic markers */}
                    <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-[#00FF55]" />
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-[#00FF55]" />
                </div>
            </div>

            {/* Matrix Data Grids */}
            <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* LATEST BLOCKS TABLE */}
                <div className="border border-[#222222] bg-[#020202]">
                    <div className="flex items-center justify-between p-4 border-b border-[#222222] bg-[#050505]">
                        <div className="flex items-center gap-3">
                            <Box size={16} className="text-[#00FF55]" />
                            <h2 className="text-[12px] font-black uppercase tracking-widest text-[#FFFFFF]">LATEST BLOCKS</h2>
                        </div>
                        <button className="text-[9px] text-[#00FF55] uppercase tracking-widest font-bold hover:text-white transition-colors">
                            VIEW ALL BLOCKS &gt;
                        </button>
                    </div>

                    <div className="flex flex-col">
                        {blocks.length === 0 && (
                            <div className="p-8 text-center text-[10px] text-[#555555] uppercase tracking-widest animate-pulse">Syncing Cryptographic Data...</div>
                        )}
                        {blocks.map((block, i) => (
                            <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b border-[#111111] hover:bg-[#050505] transition-colors gap-4 sm:gap-0">
                                
                                {/* Block ID & Time */}
                                <div className="flex items-center gap-4">
                                    <div className="bg-[#00FF55]/10 p-3 rounded-none border border-[#00FF55]/30">
                                        <Box size={14} className="text-[#00FF55]" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[13px] text-[#00FF55] font-black tracking-widest leading-none">{block.height}</span>
                                        <span className="text-[9px] text-[#888888] uppercase tracking-widest flex items-center gap-1">
                                            <Clock size={8} /> {block.age}
                                        </span>
                                    </div>
                                </div>

                                {/* Validator */}
                                <div className="flex flex-col gap-1 sm:text-right">
                                    <span className="text-[10px] text-[#FFFFFF] uppercase tracking-wide flex items-center sm:justify-end gap-1">
                                        <ShieldCheck size={10} className="text-[#555555]" /> VALIDATOR: <span className="text-[#00FF55]">{block.validator}</span>
                                    </span>
                                    <span className="text-[9px] text-[#888888] uppercase tracking-widest">
                                        {block.txs} TXs <span className="opacity-50">|</span> {block.size}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* LATEST MASSIVE TXS TABLE */}
                <div className="border border-[#222222] bg-[#020202]">
                    <div className="flex items-center justify-between p-4 border-b border-[#222222] bg-[#050505]">
                        <div className="flex items-center gap-3">
                            <Activity size={16} className="text-[#00FF55]" />
                            <h2 className="text-[12px] font-black uppercase tracking-widest text-[#FFFFFF]">LATEST LARGE TRANSACTIONS</h2>
                        </div>
                        <button className="text-[9px] text-[#00FF55] uppercase tracking-widest font-bold hover:text-white transition-colors">
                            VIEW ALL TXS &gt;
                        </button>
                    </div>

                    <div className="flex flex-col">
                        {massiveTxs.length === 0 && (
                            <div className="p-8 text-center text-[10px] text-[#555555] uppercase tracking-widest animate-pulse">Scanning Mempool...</div>
                        )}
                        {massiveTxs.map((tx, i) => (
                            <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b border-[#111111] hover:bg-[#050505] transition-colors gap-4 sm:gap-0">
                                
                                {/* TX Info */}
                                <div className="flex items-center gap-4">
                                    <div className="bg-[#333333]/30 p-3 rounded-none border border-[#333333]">
                                        <AlignLeft size={14} className="text-[#888888]" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[12px] text-[#00FF55] font-black tracking-widest leading-none">{tx.hash}</span>
                                        <span className="text-[9px] text-[#888888] uppercase tracking-widest flex items-center gap-1">
                                            <Clock size={8} /> {tx.age}
                                        </span>
                                    </div>
                                </div>

                                {/* Flow Info */}
                                <div className="flex flex-col gap-1.5 sm:text-right mt-2 sm:mt-0">
                                    <div className="flex items-center sm:justify-end gap-2 text-[10px] text-[#888888] uppercase tracking-widest">
                                        From <span className="text-white">{tx.from}</span>
                                        <ArrowRight size={10} className="text-[#555555]" />
                                        To <span className="text-[#00FF55]">{tx.to}</span>
                                    </div>
                                    <div className="flex items-center sm:justify-end gap-2">
                                        <span className="px-2 py-0.5 border border-[#333] text-[8px] text-[#888888]">{tx.type}</span>
                                        <span className="text-[11px] font-black text-white">{tx.value}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

             {/* Footer Info */}
             <div className="text-center pt-8 pb-4">
                 <p className="text-[9px] text-[#555555] font-mono tracking-[0.3em] uppercase">
                     UPDATED IN REAL-TIME
                 </p>
             </div>
        </div>
    );
}
