"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Copy, Terminal, MoveRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { usePublicClient } from 'wagmi';

export default function LedgerPage() {
  const [hashes, setHashes] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const publicClient = usePublicClient({ chainId: 1 }); // Mainnet
  
  const unwatchRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    setMounted(true);
    let active = true;

    if (unwatchRef.current) {
      unwatchRef.current();
      unwatchRef.current = null;
    }

    const bootstrapLedger = async () => {
        if (!publicClient) return;
        try {
            const currentBlock = await publicClient.getBlockNumber();
            
            const blocks = [];
            for(let i = 0n; i < 15n; i++) {
                const b = await publicClient.getBlock({ blockNumber: currentBlock - i });
                blocks.push({
                    id: `0x${b.number.toString(16).toUpperCase()}`,
                    hash: b.hash,
                    timestamp: new Date(Number(b.timestamp) * 1000).toISOString(),
                    size: `${(Number(b.size) / 1024 / 1024).toFixed(3)} MB`,
                    txCount: b.transactions.length,
                    gasUsedPct: b.gasLimit > 0n ? Number((b.gasUsed * 10000n) / b.gasLimit) / 100 : 0,
                    status: "VERIFIED",
                });
            }
            if (active) setHashes(blocks);
        } catch (e) {
            console.error('[Ledger] Bootstrap failed:', e);
        }
    };

    bootstrapLedger();

    if (publicClient) {
        const unwatch = publicClient.watchBlocks({
            onBlock: block => {
                if (!active) return;
                setHashes(prev => {
                    const newBlock = {
                        id: `0x${block.number.toString(16).toUpperCase()}`,
                        hash: block.hash,
                        timestamp: new Date(Number(block.timestamp) * 1000).toISOString(),
                        size: `${(Number(block.size) / 1024 / 1024).toFixed(3)} MB`,
                        txCount: block.transactions.length,
                        gasUsedPct: block.gasLimit > 0n ? Number((block.gasUsed * 10000n) / block.gasLimit) / 100 : 0,
                        status: "VERIFIED",
                    };
                    if (prev.find(b => b.hash === newBlock.hash)) return prev;
                    return [newBlock, ...prev].slice(0, 50);
                });
            }
        });
        unwatchRef.current = unwatch;
    }

    return () => {
        active = false;
        if (unwatchRef.current) {
            unwatchRef.current();
            unwatchRef.current = null;
        }
    };
  }, [publicClient]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#111111] font-sans selection:bg-black/10 pb-40 overflow-x-hidden">
        {/* Subtle grid background */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg,#000 0,#000 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,#000 0,#000 1px,transparent 1px,transparent 40px)' }} />

        {/* Minimal Navbar */}
        <header className="sticky top-0 z-50 px-8 py-6 border-b border-black/[0.05] backdrop-blur-xl bg-[#FDFCF8]/90 flex items-center justify-between">
            <Link href="/" className="group flex items-center gap-4">
                <div className="w-8 h-8 rounded-full border border-black/10 flex items-center justify-center group-hover:bg-[#111] group-hover:text-white transition-colors duration-300">
                    <MoveRight size={14} className="rotate-180" />
                </div>
                <div className="flex flex-col">
                    <span className="font-mono text-[10px] uppercase font-bold tracking-[0.2em] text-[#111]">Ledger Central</span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-black/40">Read-Only Access</span>
                </div>
            </Link>
        </header>

        <main className="max-w-[1200px] mx-auto px-8 pt-24">
            
            {/* HERO SECTION: Minimal Academic Presentation */}
            <div className="max-w-3xl mb-24">
                <h1 className="text-5xl md:text-7xl font-serif tracking-tight leading-[0.9] text-[#111] mb-8">
                    State Records.
                </h1>
                
                <p className="text-lg text-black/60 leading-relaxed font-light max-w-xl">
                    Every state change and verifiable event is mathematically guaranteed. Displaying direct synchronization with physical node infrastructure to eliminate systemic tampering.
                </p>
            </div>

            {/* THE LEDGER TABLE */}
            <div className="w-full">
                <div className="flex justify-between items-end mb-6">
                    <div className="flex items-center gap-3">
                        <Terminal size={14} className="text-black/40" />
                        <h2 className="text-[11px] font-bold font-mono uppercase tracking-[0.2em] text-[#111]">
                            Network Block State
                        </h2>
                    </div>
                </div>

                <div className="w-full border border-black/10 rounded-2xl overflow-hidden bg-white shadow-[0_4px_24px_rgb(0,0,0,0.02)] relative">
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="border-b border-black/[0.05] bg-[#FAFAFA]">
                                    <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-mono font-bold text-black/40">Block No.</th>
                                    <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-mono font-bold text-black/40">Cryptographic Hash</th>
                                    <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-mono font-bold text-black/40 text-right">Txns</th>
                                    <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-mono font-bold text-black/40 text-right">Gas Consumed</th>
                                    <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-mono font-bold text-black/40">Entropy</th>
                                    <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-mono font-bold text-black/40 whitespace-nowrap">Condition</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black/[0.05]">
                                {hashes.map((row, idx) => (
                                    <motion.tr 
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.02, duration: 0.4 }}
                                        key={row.hash + idx} 
                                        className="hover:bg-[#FAFAFA] transition-colors group cursor-default"
                                    >
                                        <td className="px-6 py-5 align-middle border-r border-black/[0.02]">
                                            <span className="text-[12px] font-mono font-semibold text-[#111]">
                                                {row.id}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 align-middle relative border-r border-black/[0.02]">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[11px] font-mono text-black/50 truncate max-w-[300px]">
                                                    {row.hash}
                                                </span>
                                                <button 
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(row.hash);
                                                        toast.success("Signature copied.");
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-black/40 hover:text-black"
                                                    title="Copy Signature"
                                                >
                                                    <Copy size={12}/>
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 align-middle border-r border-black/[0.02]">
                                            <div className="text-[11px] font-mono flex items-center justify-end gap-2 text-[#111]">
                                                {row.txCount}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 align-middle border-r border-black/[0.02]">
                                            <div className="flex items-center justify-end gap-2">
                                                <div className="text-[11px] font-mono font-bold text-[#111]">{row.gasUsedPct.toFixed(2)}%</div>
                                                <div className="w-12 h-1 bg-black/5 rounded-full overflow-hidden">
                                                    <div className="h-full bg-black/30" style={{ width: `${Math.min(row.gasUsedPct, 100)}%` }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 align-middle border-r border-black/[0.02]">
                                            <span className="text-[11px] font-mono flex items-center gap-2 text-black/60">
                                                {row.size}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 align-middle">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F4F4F5] border border-black/5 text-[9px] font-bold font-mono uppercase tracking-widest text-[#111]">
                                                <CheckCircle2 size={10} className="text-black" />
                                                Valid
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            {/* Minimal Footer Info */}
            <div className="mt-32 pt-10 border-t border-black/5 flex flex-col md:flex-row justify-between gap-8 text-[10px] font-mono uppercase tracking-widest text-black/40">
                <p className="max-w-md leading-relaxed">
                    Sovereign Layer synchronizes transparent state without custodial routing. Records are mirrored directly from local state.
                </p>
                <div className="flex gap-12">
                     <div className="flex flex-col gap-1">
                         <span className="text-black/30">Node Status</span>
                         <span className="font-bold text-[#111]">Online</span>
                     </div>
                     <div className="flex flex-col gap-1">
                         <span className="text-black/30">Protocol</span>
                         <span className="font-bold text-[#111]">V4.0</span>
                     </div>
                </div>
            </div>
        </main>
    </div>
  );
}

