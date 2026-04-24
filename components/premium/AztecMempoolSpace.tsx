"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, EyeOff, Zap, Lock, Database, Server, Clock, Activity, Cpu, Box, Hash, ChevronRight } from 'lucide-react';

/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║   AZTEC NETWORK MEMPOOL — ZK-Rollup Visualizer                       ║
 * ║   Whale Alert Network Pro · Institutional Grade Privacy Monitoring   ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

interface ZkTransaction {
    id: string;
    pxeHash: string; // Private Execution Environment hash
    feeJuice: number;
    stage: 'PXE_GENERATING' | 'KERNEL_PROOF' | 'SEQUENCER_QUEUE' | 'ROLLUP_BATCH' | 'L1_SETTLED';
    timestamp: number;
    sizeKb: number;
}

interface SequencerBlock {
    id: number;
    txs: ZkTransaction[];
    status: 'BUILDING' | 'PROVING' | 'SUBMITTING' | 'FINALIZED';
    totalFee: number;
    fillPercentage: number;
}

const generateId = () => Math.random().toString(36).substring(2, 9);
const generateHash = () => '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');

export default function AztecMempoolSpace() {
    const [transactions, setTransactions] = useState<ZkTransaction[]>([]);
    const [blocks, setBlocks] = useState<SequencerBlock[]>([]);
    const [globalStats, setGlobalStats] = useState({
        tps: 0,
        avgFeeJuice: 0,
        anonymitySetSize: 1450392,
        totalShieldedVol: 452000000
    });

    // ── Simulation Engine ───────────────────────────────────────────
    useEffect(() => {
        let blockIdCounter = 10452;

        // Init blocks
        const initialBlocks: SequencerBlock[] = [
            { id: blockIdCounter++, txs: [], status: 'FINALIZED', totalFee: 1.2, fillPercentage: 98 },
            { id: blockIdCounter++, txs: [], status: 'SUBMITTING', totalFee: 0.9, fillPercentage: 100 },
            { id: blockIdCounter++, txs: [], status: 'PROVING', totalFee: 1.5, fillPercentage: 100 },
            { id: blockIdCounter, txs: [], status: 'BUILDING', totalFee: 0, fillPercentage: 0 },
        ];
        setBlocks(initialBlocks);

        const txInterval = setInterval(() => {
            const newTx: ZkTransaction = {
                id: generateId(),
                pxeHash: generateHash(),
                feeJuice: Math.random() * 0.05 + 0.001,
                stage: 'PXE_GENERATING',
                timestamp: Date.now(),
                sizeKb: Math.floor(Math.random() * 4) + 1
            };

            setTransactions(prev => [newTx, ...prev].slice(0, 50));
        }, 800); // 1.25 TPS avg

        const pipelineInterval = setInterval(() => {
            setTransactions(prev => prev.map(tx => {
                if (tx.stage === 'PXE_GENERATING' && Math.random() > 0.4) return { ...tx, stage: 'KERNEL_PROOF' };
                if (tx.stage === 'KERNEL_PROOF' && Math.random() > 0.5) return { ...tx, stage: 'SEQUENCER_QUEUE' };
                if (tx.stage === 'SEQUENCER_QUEUE' && Math.random() > 0.8) return { ...tx, stage: 'ROLLUP_BATCH' };
                if (tx.stage === 'ROLLUP_BATCH' && Math.random() > 0.9) return { ...tx, stage: 'L1_SETTLED' };
                return tx;
            }));

            // Block mechanics
            setBlocks(prev => {
                const newBlocks = [...prev];
                const buildingBlock = newBlocks.find(b => b.status === 'BUILDING');
                
                if (buildingBlock) {
                    buildingBlock.fillPercentage += Math.random() * 5;
                    buildingBlock.totalFee += Math.random() * 0.02;

                    if (buildingBlock.fillPercentage >= 100) {
                        buildingBlock.fillPercentage = 100;
                        buildingBlock.status = 'PROVING';
                        newBlocks.push({
                            id: ++blockIdCounter,
                            txs: [],
                            status: 'BUILDING',
                            totalFee: 0,
                            fillPercentage: 0
                        });
                    }
                }

                // Advance other blocks
                newBlocks.forEach(b => {
                    if (b.status === 'PROVING' && Math.random() > 0.9) b.status = 'SUBMITTING';
                    else if (b.status === 'SUBMITTING' && Math.random() > 0.95) b.status = 'FINALIZED';
                });

                return newBlocks.slice(-5); // Keep last 5
            });

            // Stats update
            setGlobalStats(prev => ({
                tps: 1 + Math.random() * 2,
                avgFeeJuice: 0.02 + Math.random() * 0.01,
                anonymitySetSize: prev.anonymitySetSize + Math.floor(Math.random() * 3),
                totalShieldedVol: prev.totalShieldedVol + Math.random() * 1000
            }));

        }, 1000);

        return () => {
            clearInterval(txInterval);
            clearInterval(pipelineInterval);
        };
    }, []);

    // ── Render Helpers ──────────────────────────────────────────────
    const getStageColor = (stage: string) => {
        switch (stage) {
            case 'PXE_GENERATING': return 'text-slate-500 bg-slate-500/10 border-slate-500/30';
            case 'KERNEL_PROOF': return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
            case 'SEQUENCER_QUEUE': return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
            case 'ROLLUP_BATCH': return 'text-purple-500 bg-purple-500/10 border-purple-500/30';
            case 'L1_SETTLED': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
            default: return 'text-gray-500';
        }
    };

    const getStageLabel = (stage: string) => stage.replace('_', ' ');

    return (
        <div className="w-full bg-[#050505] min-h-[800px] border border-white/10 rounded-[3rem] overflow-hidden relative font-sans text-white shadow-2xl flex flex-col">
            {/* Background Grid & Blur */}
            <div className="absolute inset-0 bg-[url('/patron-cosmico-4k.png')] opacity-5 mix-blend-screen pointer-events-none" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Header */}
            <div className="p-8 border-b border-white/5 relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-900/30">
                        <EyeOff size={28} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                            Aztec Network Space
                        </h2>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                                <Shield size={10} /> Fully Shielded
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono tracking-wider">L2 ZK-ROLLUP MEMPOOL</span>
                        </div>
                    </div>
                </div>

                {/* Global Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full lg:w-auto">
                    {[
                        { label: 'Network TPS', val: `${globalStats.tps.toFixed(2)}`, unit: 'tx/s', color: 'text-blue-400' },
                        { label: 'Avg Fee Juice', val: `${globalStats.avgFeeJuice.toFixed(4)}`, unit: 'FEE', color: 'text-amber-400' },
                        { label: 'Anonymity Set', val: globalStats.anonymitySetSize.toLocaleString(), unit: 'addrs', color: 'text-purple-400' },
                        { label: 'Shielded TVL', val: `$${(globalStats.totalShieldedVol / 1000000).toFixed(1)}`, unit: 'M', color: 'text-emerald-400' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col justify-center min-w-[120px]">
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">{stat.label}</span>
                            <div className="flex items-end gap-1">
                                <span className={`text-lg font-black font-mono leading-none ${stat.color}`}>{stat.val}</span>
                                <span className="text-[9px] text-gray-600 font-bold uppercase mb-[2px]">{stat.unit}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 relative z-10 divide-y xl:divide-y-0 xl:divide-x divide-white/5">
                
                {/* LEFT: Sequencer Blocks (The "Space") */}
                <div className="xl:col-span-8 p-8 flex flex-col">
                    <div className="flex items-center gap-3 mb-8">
                        <Server size={18} className="text-purple-500" />
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Sequencer Block Pipeline</h3>
                    </div>

                    <div className="flex-1 flex items-center justify-end gap-4 overflow-x-auto no-scrollbar py-10 px-4">
                        <AnimatePresence mode="popLayout">
                            {blocks.map((block, idx) => {
                                const isBuilding = block.status === 'BUILDING';
                                const isFinalized = block.status === 'FINALIZED';
                                
                                // Color logic based on status
                                let borderColor = 'border-white/10';
                                let glow = '';
                                if (isBuilding) { borderColor = 'border-amber-500/50'; glow = 'shadow-[0_0_40px_rgba(245,158,11,0.15)]'; }
                                if (block.status === 'PROVING') { borderColor = 'border-purple-500/50'; glow = 'shadow-[0_0_40px_rgba(168,85,247,0.15)]'; }
                                if (block.status === 'SUBMITTING') { borderColor = 'border-blue-500/50'; glow = 'shadow-[0_0_40px_rgba(59,130,246,0.15)]'; }
                                if (isFinalized) { borderColor = 'border-emerald-500/50'; glow = 'shadow-[0_0_40px_rgba(16,185,129,0.1)]'; }

                                return (
                                    <motion.div
                                        key={block.id}
                                        layout
                                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                                        animate={{ opacity: 1, x: 0, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className={`shrink-0 w-64 h-80 rounded-[2rem] bg-black/40 border-2 ${borderColor} ${glow} flex flex-col overflow-hidden relative group`}
                                    >
                                        {/* Block Background Fill for Building */}
                                        {isBuilding && (
                                            <div 
                                                className="absolute bottom-0 left-0 right-0 bg-amber-500/10 transition-all duration-1000 ease-linear"
                                                style={{ height: `${block.fillPercentage}%` }}
                                            />
                                        )}
                                        {block.status === 'PROVING' && (
                                            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay animate-pulse" />
                                        )}

                                        <div className="p-5 border-b border-white/10 relative z-10 bg-black/60 backdrop-blur-md">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Block #{block.id}</span>
                                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${
                                                    isBuilding ? 'bg-amber-500/20 text-amber-400' :
                                                    block.status === 'PROVING' ? 'bg-purple-500/20 text-purple-400' :
                                                    block.status === 'SUBMITTING' ? 'bg-blue-500/20 text-blue-400' :
                                                    'bg-emerald-500/20 text-emerald-400'
                                                }`}>
                                                    {block.status}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <span className="text-2xl font-black font-mono text-white">{block.totalFee.toFixed(3)}</span>
                                                    <span className="text-[10px] text-gray-500 ml-1 font-bold">FEE</span>
                                                </div>
                                                {isBuilding && <span className="text-xs font-mono text-amber-400">{Math.floor(block.fillPercentage)}%</span>}
                                            </div>
                                        </div>

                                        <div className="flex-1 p-4 relative z-10 grid grid-cols-6 gap-1 content-start">
                                            {/* Simulate ZK proofs inside block */}
                                            {Array.from({ length: isBuilding ? Math.floor(block.fillPercentage / 2) : 50 }).map((_, i) => (
                                                <motion.div 
                                                    key={i}
                                                    initial={{ opacity: 0, scale: 0.5 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className={`w-full aspect-square rounded-[4px] shadow-sm ${
                                                        isBuilding ? 'bg-amber-500/50 shadow-amber-500/20' : 
                                                        block.status === 'PROVING' ? 'bg-purple-500/50 shadow-purple-500/20 animate-pulse' :
                                                        block.status === 'SUBMITTING' ? 'bg-blue-500/50 shadow-blue-500/20' :
                                                        'bg-emerald-500/50 shadow-emerald-500/20'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        
                                        {/* Status Footer */}
                                        <div className="p-3 bg-black/80 backdrop-blur-md text-center border-t border-white/5 relative z-10">
                                            <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">
                                                {block.status === 'BUILDING' ? 'Aggregating Kernels' :
                                                 block.status === 'PROVING' ? 'Generating Rollup Proof' :
                                                 block.status === 'SUBMITTING' ? 'Broadcasting to L1' :
                                                 'Settled on Ethereum'}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>

                {/* RIGHT: Live Mempool Feed (ZK Pipeline) */}
                <div className="xl:col-span-4 bg-white/[0.02] p-8 flex flex-col h-full min-h-[800px] relative">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Activity size={18} className="text-purple-500" />
                            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Live ZK Pipeline</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] text-emerald-500 font-mono tracking-widest uppercase">Syncing</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar pr-2 space-y-3 relative flex flex-col">
                        {/* Fading top mask */}
                        <div className="sticky top-0 left-0 right-0 h-10 bg-gradient-to-b from-[#0A0A0A] to-transparent z-20 pointer-events-none shrink-0 -mb-10" />
                        
                        <AnimatePresence>
                            {transactions.map(tx => {
                                const stageStyle = getStageColor(tx.stage);
                                return (
                                    <motion.div
                                        key={tx.id}
                                        layout
                                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                                        className="bg-black/40 border border-white/5 rounded-2xl p-4 hover:bg-white/5 transition-colors group"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-2">
                                                <Hash size={14} className="text-gray-600" />
                                                <span className="text-xs font-mono text-gray-300 group-hover:text-white transition-colors">{tx.pxeHash.slice(0,14)}...</span>
                                            </div>
                                            <span className="text-xs font-mono text-amber-400 font-bold">{tx.feeJuice.toFixed(4)} FJ</span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className={`px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest w-fit ${stageStyle}`}>
                                                {getStageLabel(tx.stage)}
                                            </div>
                                            <div className="h-[1px] flex-1 bg-white/5 relative">
                                                <motion.div 
                                                    className={`absolute top-0 bottom-0 left-0 bg-current opacity-50 ${stageStyle.split(' ')[0]}`} 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: '100%' }}
                                                    transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-mono text-gray-500">{tx.sizeKb}kb</span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        {/* Fading bottom mask */}
                        <div className="sticky bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#0A0A0A] to-transparent z-20 pointer-events-none shrink-0 mt-auto -mb-3" />
                    </div>
                </div>
            </div>
        </div>
    );
}
