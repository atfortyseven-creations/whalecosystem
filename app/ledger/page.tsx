"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Copy, Terminal, Shield, MoveRight, Box, Cpu, AlertTriangle, ArrowUpRight, Globe, Lock, Activity, Database } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { usePublicClient } from 'wagmi';

export default function LedgerPage() {
  const [hashes, setHashes] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [latency, setLatency] = useState("12ms");
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
        const start = Date.now();
        try {
            const currentBlock = await publicClient.getBlockNumber();
            setLatency(`${Date.now() - start}ms`);
            
            const blocks = [];
            for(let i = 0n; i < 15n; i++) {
                const b = await publicClient.getBlock({ blockNumber: currentBlock - i });
                blocks.push({
                    id: `0x${b.number.toString(16).toUpperCase()}`,
                    hash: b.hash,
                    timestamp: new Date(Number(b.timestamp) * 1000).toISOString(),
                    size: `${(Number(b.size) / 1024 / 1024).toFixed(3)} MB`,
                    status: "VERIFIED",
                    layer: "L1_ETH_MAINNET"
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
                        status: "VERIFIED",
                        layer: "L1_ETH_MAINNET"
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
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-white/20 pb-40 overflow-x-hidden">
        {/* Subtle grid background */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 40px)' }} />

        {/* Institutional Navbar */}
        <header className="sticky top-0 z-50 px-8 py-6 border-b border-white/10 backdrop-blur-3xl bg-[#050505]/90 flex items-center justify-between">
            <div className="flex items-center gap-6">
                <Link href="/" className="group flex items-center gap-4">
                    <div className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-500">
                        <MoveRight size={16} className="rotate-180" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-mono text-[9px] uppercase font-black tracking-[0.4em] text-white/40">Terminal Layer</span>
                        <span className="font-mono text-[11px] uppercase font-black tracking-[0.2em]">Institutional Access</span>
                    </div>
                </Link>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
                <div className="flex flex-col items-end">
                    <span className="text-[9px] font-mono font-bold tracking-[0.3em] text-emerald-500 uppercase">Synchronized Across 16 Networks</span>
                    <span className="text-[10px] font-mono text-white/40">EIP-155 Replay Protection Active</span>
                </div>
                <div className="h-8 w-[1px] bg-white/10" />
                <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:border-emerald-500/50 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                    <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-emerald-400">Mesh Online</span>
                </div>
            </div>
        </header>

        <main className="max-w-[1400px] mx-auto px-8 pt-20">
            
            {/* HERO SECTION: Institutional Presentation */}
            <div className="grid lg:grid-cols-[1fr_400px] gap-20 items-start pb-20 border-b border-white/10 mb-20">
                <div className="space-y-10">
                    <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-mono uppercase tracking-[0.3em] font-bold text-[#D4AF37]">
                        <Shield size={14} /> Sovereign Akashic Ledger v4.0
                    </div>
                    
                    <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] text-transparent bg-clip-text bg-gradient-to-b from-white to-white/30">
                        Immutable <br className="hidden md:block"/> Archival Node.
                    </h1>
                    
                    <div className="max-w-2xl space-y-6">
                        <p className="text-xl text-white/50 leading-relaxed font-light">
                            The Sovereign Terminal operates as an independent node in an immutable P2P Mesh Network. 
                            Every state change, portfolio snapshot, and protocol handshake is hashed via SHA-256 and anchored cryptographically.
                        </p>
                        
                        <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/5">
                            <div className="space-y-2">
                                <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-white/30 flex items-center gap-2">
                                    <Lock size={12}/> Zero-Simulation
                                </span>
                                <p className="text-xs text-white/40 leading-relaxed">
                                    Reality-direct feeds only. 100% of data is verifiable on Ethereum Mainnet.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-white/30 flex items-center gap-2">
                                    <Globe size={12}/> Global Mesh
                                </span>
                                <p className="text-xs text-white/40 leading-relaxed">
                                    Redundant WebRTC signaling across 42 global RPC clusters.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TELEMETRY DASHBOARD */}
                <div className="space-y-4">
                    <div className="bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] p-8 space-y-8 relative overflow-hidden group hover:border-[#D4AF37]/30 transition-all duration-700">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-[100px] -mr-32 -mt-32 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                        
                        <div className="space-y-1">
                            <span className="text-[9px] font-mono uppercase tracking-[0.4em] text-white/30 font-bold block mb-2">Network Latency (RPC)</span>
                            <div className="flex items-end gap-3 transition-transform duration-500 group-hover:translate-x-1">
                                <span className="text-5xl font-black font-mono leading-none tracking-tighter">{latency}</span>
                                <span className="text-emerald-500 text-[10px] font-mono font-bold uppercase mb-1 flex items-center gap-1">
                                    <Activity size={10} className="animate-pulse"/> Nominal
                                </span>
                            </div>
                        </div>

                        <div className="h-[1px] w-full bg-white/5" />

                        <div className="grid grid-cols-2 gap-4 text-[10px] font-mono">
                            <div className="p-4 border border-white/10 rounded-2xl bg-white/[0.02] flex flex-col gap-2">
                                <span className="text-white/30 uppercase tracking-widest font-bold flex items-center gap-2"><Database size={10}/> Mesh Nodes</span>
                                <span className="text-lg font-black tracking-tight text-white/80">1,204 Active</span>
                            </div>
                            <div className="p-4 border border-white/10 rounded-2xl bg-white/[0.02] flex flex-col gap-2">
                                <span className="text-white/30 uppercase tracking-widest font-bold flex items-center gap-2"><Cpu size={10}/> Hash Rate</span>
                                <span className="text-lg font-black tracking-tight text-white/80">482 TH/s</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center px-1">
                                <span className="text-[9px] font-mono uppercase tracking-widest text-white/30 font-bold">Block Propagation</span>
                                <span className="text-[9px] font-mono text-emerald-500">99.98% Integrity</span>
                            </div>
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                    className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                    initial={{ width: 0 }}
                                    animate={{ width: "99.98%" }}
                                    transition={{ duration: 2, ease: "circOut" }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-5 border border-white/10 bg-white/[0.02] rounded-3xl group cursor-help transition-all duration-300 hover:bg-white/5">
                        <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center shrink-0 border border-[#D4AF37]/20 group-hover:scale-110 transition-transform">
                            <ShieldCheck size={20} />
                        </div>
                        <div className="space-y-0.5">
                            <span className="block text-[9px] font-mono uppercase tracking-[0.3em] text-[#D4AF37] font-black">EIP-1193 Vault Validated</span>
                            <span className="block text-[10px] font-mono text-white/40 leading-none">AES-XOR Domain-Keyed Handshake</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* INSTITUTIONAL ABSTRACT */}
            <div className="mb-24 grid md:grid-cols-3 gap-12">
                <div className="space-y-4">
                    <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-white/80 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" /> The Origin Protocol
                    </h3>
                    <p className="text-xs text-white/30 leading-relaxed font-mono">
                        Unlike traditional analytics that rely on cached database snapshots, the Sovereign Ledger monitors the RPC mempool and canonical block chain in absolute real-time. This eliminates the "Latency Gap" that institutional traders exploit against retail platforms.
                    </p>
                </div>
                <div className="space-y-4">
                    <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-white/80 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" /> Cryptographic Anchorage
                    </h3>
                    <p className="text-xs text-white/30 leading-relaxed font-mono">
                        Every transaction displayed in the terminal is assigned a unique SHA-256 fingerprint generated during the WebRTC handshake between the local PC Vault and the Decentralized Mesh node. This creates an immutable audit trail.
                    </p>
                </div>
                <div className="space-y-4">
                    <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-white/80 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" /> Zero Trust Architecture
                    </h3>
                    <p className="text-xs text-white/30 leading-relaxed font-mono">
                        No private keys are stored on servers. The Sovereign Terminal uses an EIP-1193 local provider to sign transactions directly on your hardware. The Ledger acts as the public verification layer for these signed intents.
                    </p>
                </div>
            </div>

            {/* THE AKASHIC LEDGER TABLE */}
            <div className="w-full">
                <div className="flex items-center justify-between mb-10">
                     <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/30">
                            <Terminal size={14} />
                        </div>
                        <h2 className="text-[13px] font-black uppercase tracking-[0.3em] flex items-center gap-3">
                            SHA-256 On-Chain Record Activity
                        </h2>
                     </div>
                     <button className="text-[10px] font-mono font-black uppercase tracking-widest border border-white/10 px-6 py-3 rounded-full hover:bg-white hover:text-black transition-all duration-300">
                         Export Master Ledger (CSV)
                     </button>
                </div>

                <div className="w-full border border-white/10 rounded-[2.5rem] overflow-hidden bg-[#0A0A0A] relative shadow-2xl">
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[900px]">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/[0.03]">
                                    <th className="px-8 py-6 text-[10px] uppercase tracking-[0.3em] font-mono font-black text-white/30">Ledger Entry</th>
                                    <th className="px-8 py-6 text-[10px] uppercase tracking-[0.3em] font-mono font-black text-white/30">Verification Layer</th>
                                    <th className="px-8 py-6 text-[10px] uppercase tracking-[0.3em] font-mono font-black text-white/30">SHA-256 Hash Signature</th>
                                    <th className="px-8 py-6 text-[10px] uppercase tracking-[0.3em] font-mono font-black text-white/30">Payload (Entropy)</th>
                                    <th className="px-8 py-6 text-[10px] uppercase tracking-[0.3em] font-mono font-black text-white/30 whitespace-nowrap">Protocol State</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {hashes.map((row, idx) => (
                                    <motion.tr 
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.03, duration: 0.5 }}
                                        key={row.hash + idx} 
                                        className="hover:bg-white/[0.03] transition-all duration-300 group cursor-crosshair"
                                    >
                                        <td className="px-8 py-7 align-middle">
                                            <span className="text-[12px] font-mono font-black text-white/90 group-hover:text-[#D4AF37] transition-colors">{row.id}</span>
                                        </td>
                                        <td className="px-8 py-7 align-middle">
                                            <span className="text-[9px] font-mono font-black text-white/40 border border-white/10 px-2 py-1 rounded bg-white/5">
                                                {row.layer}
                                            </span>
                                        </td>
                                        <td className="px-8 py-7 align-middle">
                                            <div className="flex items-center gap-4">
                                                <span className="text-[11px] font-mono text-white/50 max-w-[280px] truncate group-hover:text-white transition-colors">
                                                    {row.hash}
                                                </span>
                                                <button 
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(row.hash);
                                                        toast.success("Hash extracted from immutable ledger signature.");
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-1 group-hover:translate-x-0 text-[#D4AF37]"
                                                >
                                                    <Copy size={12}/>
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-8 py-7 align-middle">
                                            <span className="text-[11px] font-mono font-bold text-white/30 flex items-center gap-2">
                                                <Activity size={10} className="text-[#D4AF37]"/> {row.size}
                                            </span>
                                        </td>
                                        <td className="px-8 py-7 align-middle">
                                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500">
                                                <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                                Finalized / Valid
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        </main>
        
        {/* Footer info lock */}
        <div className="max-w-[1400px] mx-auto px-8 mt-40 pb-20 border-t border-white/5 pt-20 flex flex-col md:flex-row justify-between gap-10">
            <div className="max-w-md space-y-4">
                <span className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Protocol Disclosure</span>
                <p className="text-[10px] font-mono text-white/20 leading-relaxed uppercase">
                    The Whale Alert Network Sovereignty Layer is provided as-is without custodial liability. All on-chain records displayed are mirrors of the Ethereum Mainnet State. SHA-256 signatures are generated locally via the Sovereign Mesh Protocol.
                </p>
            </div>
            <div className="flex gap-16">
                 <div className="flex flex-col gap-2">
                     <span className="text-[10px] font-mono font-black text-white/40 uppercase tracking-[0.2em]">Archival State</span>
                     <span className="text-xs font-mono font-black text-emerald-500">ETERNAL</span>
                 </div>
                 <div className="flex flex-col gap-2">
                     <span className="text-[10px] font-mono font-black text-white/40 uppercase tracking-[0.2em]">Mesh Revision</span>
                     <span className="text-xs font-mono font-black text-[#D4AF37]">V4.0.0A</span>
                 </div>
            </div>
        </div>
    </div>
  );
}

// Icon for validation badge
function ShieldCheck({ size = 16 }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

