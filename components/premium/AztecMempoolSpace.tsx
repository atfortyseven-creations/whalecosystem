"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, EyeOff, Server, Activity, Hash, CheckCircle, Database, Box } from 'lucide-react';
import { AnimatedCounter } from "@/components/ui/animated-counter";

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
        }, 800);

        const pipelineInterval = setInterval(() => {
            setTransactions(prev => prev.map(tx => {
                if (tx.stage === 'PXE_GENERATING' && Math.random() > 0.4) return { ...tx, stage: 'KERNEL_PROOF' };
                if (tx.stage === 'KERNEL_PROOF' && Math.random() > 0.5) return { ...tx, stage: 'SEQUENCER_QUEUE' };
                if (tx.stage === 'SEQUENCER_QUEUE' && Math.random() > 0.8) return { ...tx, stage: 'ROLLUP_BATCH' };
                if (tx.stage === 'ROLLUP_BATCH' && Math.random() > 0.9) return { ...tx, stage: 'L1_SETTLED' };
                return tx;
            }));

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

                newBlocks.forEach(b => {
                    if (b.status === 'PROVING' && Math.random() > 0.9) b.status = 'SUBMITTING';
                    else if (b.status === 'SUBMITTING' && Math.random() > 0.95) b.status = 'FINALIZED';
                });

                return newBlocks.slice(-5);
            });

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

    const getStageColor = (stage: string) => {
        switch (stage) {
            case 'PXE_GENERATING': return 'bg-[#F5F5F5] text-[#888888] border-[#E5E5E5]';
            case 'KERNEL_PROOF': return 'bg-[#E3F2FD] text-[#1976D2] border-[#BBDEFB]';
            case 'SEQUENCER_QUEUE': return 'bg-[#FFF8E1] text-[#FFA000] border-[#FFECB3]';
            case 'ROLLUP_BATCH': return 'bg-[#F3E5F5] text-[#7B1FA2] border-[#E1BEE7]';
            case 'L1_SETTLED': return 'bg-[#E8F5E9] text-[#388E3C] border-[#C8E6C9]';
            default: return 'bg-[#F0F0F0] text-[#888888] border-[#CCCCCC]';
        }
    };

    const getStageLabel = (stage: string) => stage.replace('_', ' ');

    return (
        <div className="h-full min-h-0 flex flex-col bg-[#FAF9F6] text-[#050505] font-sans">
            {/* ── Formal Academic Header ── */}
            <div className="flex items-end justify-between px-8 py-8 border-b border-[#E5E5E5] bg-white shrink-0">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <EyeOff size={24} className="text-[#050505]" />
                        <h1 className="text-3xl font-bold uppercase tracking-tighter text-[#050505]">
                            AZTEC NETWORK SPACE
                        </h1>
                    </div>
                    <div className="flex items-center gap-3 ml-9">
                        <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-[#050505] bg-[#F0F0F0] px-2 py-0.5 rounded-sm border border-[#CCCCCC]">
                            <Shield size={10} /> Fully Shielded
                        </span>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-[#A0A0A0]">
                            L2 ZK-ROLLUP MEMPOOL
                        </p>
                    </div>
                </div>

                {/* Global Stats */}
                <div className="flex items-center gap-4">
                    {[
                        { label: 'Network TPS', val: globalStats.tps, unit: 'tx/s', isNum: true },
                        { label: 'Avg Fee Juice', val: globalStats.avgFeeJuice, unit: 'FEE', isNum: true, format: (v: number) => v.toFixed(4) },
                        { label: 'Anonymity Set', val: globalStats.anonymitySetSize, unit: 'addrs', isNum: true },
                        { label: 'Shielded TVL', val: globalStats.totalShieldedVol, unit: 'M', isNum: true, format: (v: number) => `$${(v / 1000000).toFixed(1)}M` },
                    ].map((stat, i) => (
                        <div key={i} className="flex flex-col items-end mr-4">
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#888888] mb-1.5">{stat.label}</span>
                            <div className="flex items-end gap-1">
                                <AnimatedCounter 
                                    value={stat.val}
                                    format={stat.format ? stat.format : (v) => Math.floor(v).toString()}
                                    className="text-2xl font-bold font-mono tracking-tighter text-[#050505] leading-none"
                                />
                                <span className="text-[9px] text-[#A0A0A0] font-bold uppercase mb-[2px]">{stat.unit}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* LEFT: Sequencer Blocks (The "Space") */}
                <div className="w-2/3 p-8 flex flex-col border-r border-[#E5E5E5] bg-[#FAF9F6]">
                    <div className="flex items-center gap-3 mb-8">
                        <Server size={18} className="text-[#050505]" />
                        <h3 className="text-sm font-black text-[#050505] uppercase tracking-[0.2em]">Sequencer Block Pipeline</h3>
                    </div>

                    <div className="flex-1 flex items-center justify-end gap-4 overflow-x-auto no-scrollbar py-4 px-4">
                        <AnimatePresence mode="popLayout">
                            {blocks.map((block) => {
                                const isBuilding = block.status === 'BUILDING';
                                const isFinalized = block.status === 'FINALIZED';
                                
                                let borderColor = 'border-[#E5E5E5]';
                                if (isBuilding) borderColor = 'border-[#D4AF37]';
                                if (block.status === 'PROVING') borderColor = 'border-[#7B1FA2]';
                                if (block.status === 'SUBMITTING') borderColor = 'border-[#1976D2]';
                                if (isFinalized) borderColor = 'border-[#388E3C]';

                                return (
                                    <motion.div
                                        key={block.id}
                                        layout
                                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                                        animate={{ opacity: 1, x: 0, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className={`shrink-0 w-64 h-80 bg-white border ${borderColor} rounded-sm flex flex-col overflow-hidden relative shadow-sm`}
                                    >
                                        {/* Block Background Fill for Building */}
                                        {isBuilding && (
                                            <div 
                                                className="absolute bottom-0 left-0 right-0 bg-[#FFF8E1] transition-all duration-1000 ease-linear"
                                                style={{ height: `${block.fillPercentage}%` }}
                                            />
                                        )}

                                        <div className="p-4 border-b border-[#E5E5E5] relative z-10 bg-white/90 backdrop-blur-sm">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-[10px] font-black text-[#888888] uppercase tracking-widest">Block #{block.id}</span>
                                                <span className={`text-[8px] px-2 py-0.5 rounded-sm border font-black uppercase tracking-widest ${
                                                    isBuilding ? 'bg-[#FFF8E1] text-[#D4AF37] border-[#FFECB3]' :
                                                    block.status === 'PROVING' ? 'bg-[#F3E5F5] text-[#7B1FA2] border-[#E1BEE7]' :
                                                    block.status === 'SUBMITTING' ? 'bg-[#E3F2FD] text-[#1976D2] border-[#BBDEFB]' :
                                                    'bg-[#E8F5E9] text-[#388E3C] border-[#C8E6C9]'
                                                }`}>
                                                    {block.status}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <span className="text-2xl font-black font-mono text-[#050505]">{block.totalFee.toFixed(3)}</span>
                                                    <span className="text-[10px] text-[#A0A0A0] ml-1 font-bold">FEE</span>
                                                </div>
                                                {isBuilding && <span className="text-[10px] font-mono font-black text-[#050505]">{Math.floor(block.fillPercentage)}%</span>}
                                            </div>
                                        </div>

                                        <div className="flex-1 p-4 relative z-10 grid grid-cols-6 gap-1.5 content-start">
                                            {Array.from({ length: isBuilding ? Math.floor(block.fillPercentage / 2) : 50 }).map((_, i) => (
                                                <motion.div 
                                                    key={i}
                                                    initial={{ opacity: 0, scale: 0.5 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className={`w-full aspect-square rounded-[2px] border ${
                                                        isBuilding ? 'bg-[#FFF8E1] border-[#FFECB3]' : 
                                                        block.status === 'PROVING' ? 'bg-[#F3E5F5] border-[#E1BEE7] animate-pulse' :
                                                        block.status === 'SUBMITTING' ? 'bg-[#E3F2FD] border-[#BBDEFB]' :
                                                        'bg-[#E8F5E9] border-[#C8E6C9]'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        
                                        <div className="p-3 bg-[#FAFAFA] text-center border-t border-[#E5E5E5] relative z-10">
                                            <p className="text-[9px] text-[#888888] uppercase tracking-widest font-black">
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

                {/* RIGHT: Live Mempool Feed */}
                <div className="w-1/3 p-8 flex flex-col bg-white">
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#E5E5E5]">
                        <div className="flex items-center gap-3">
                            <Activity size={18} className="text-[#050505]" />
                            <h3 className="text-sm font-black text-[#050505] uppercase tracking-[0.2em]">Live ZK Pipeline</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#388E3C] animate-pulse" />
                            <span className="text-[9px] text-[#A0A0A0] font-bold uppercase tracking-widest">Syncing</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3">
                        <AnimatePresence>
                            {transactions.map(tx => {
                                const stageStyle = getStageColor(tx.stage);
                                return (
                                    <motion.div
                                        key={tx.id}
                                        layout
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                                        className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-sm p-4 hover:bg-[#F0F0F0] transition-colors group"
                                    >
                                        <div className="flex justify-between items-start mb-3 border-b border-[#E5E5E5] border-dashed pb-2">
                                            <div className="flex items-center gap-2">
                                                <Hash size={12} className="text-[#A0A0A0]" />
                                                <span className="text-[11px] font-mono text-[#050505]">{tx.pxeHash.slice(0,14)}...</span>
                                            </div>
                                            <span className="text-[10px] font-mono text-[#050505] font-black">{tx.feeJuice.toFixed(4)} FJ</span>
                                        </div>

                                        <div className="flex items-center justify-between gap-3">
                                            <div className={`px-2 py-0.5 rounded-sm border text-[8px] font-black uppercase tracking-widest ${stageStyle}`}>
                                                {getStageLabel(tx.stage)}
                                            </div>
                                            <span className="text-[10px] font-mono text-[#A0A0A0] flex items-center gap-1">
                                                <Database size={10} /> {tx.sizeKb}kb
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
