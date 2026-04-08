"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Fingerprint, Lock, CheckCircle2, Activity } from 'lucide-react';
import { toast } from 'sonner';

export function ZKShieldStation() {
    const [targetAddress, setTargetAddress] = useState('');
    const [isProving, setIsProving] = useState(false);
    const [lastProof, setLastProof] = useState<any>(null);

    const handleShield = async () => {
        if (!targetAddress || targetAddress.length < 42) {
            toast.error("Invalid Ethereum address for ZK isolation");
            return;
        }

        setIsProving(true);
        const tid = toast.loading("Generating Groth16 Snark Proof...");

        try {
            const res = await fetch('/api/zk/prove', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address: targetAddress, amount: 1 })
            });
            const data = await res.json();
            
            if (data.success) {
                toast.success("Entity Cryptographically Shielded", { id: tid });
                setLastProof(data.snark);
            } else {
                toast.error(data.error || "ZK Proving Failed", { id: tid });
            }
        } catch (e) {
            toast.error("Prover Network Error", { id: tid });
        } finally {
            setIsProving(false);
        }
    };

    return (
        <div className="min-h-full w-full bg-[#000000] text-[#FFFFFF] font-mono p-4 md:p-8 flex flex-col gap-12 selection:bg-[#00FF55] selection:text-black overflow-y-auto">
            <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto pt-12 pb-8 gap-8">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter flex items-center justify-center gap-4">
                        <Shield className="text-[#00FF55]" size={48} />
                        ZK-SHIELD <span className="text-[#00FF55]">STATION</span>
                    </h1>
                    <p className="text-[11px] text-[#888888] tracking-[0.2em] uppercase max-w-2xl mx-auto">
                        Groth16 Zero-Knowledge Subnet. Obfuscate entities from the main Omnichain Ledger.
                    </p>
                </div>

                <div className="w-full relative max-w-2xl mx-auto mt-8">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <Fingerprint size={20} className="text-[#00FF55]" />
                    </div>
                    <input
                        type="text"
                        value={targetAddress}
                        onChange={(e) => setTargetAddress(e.target.value)}
                        className="w-full bg-[#050505] border-2 border-[#333333] focus:border-[#00FF55] text-white p-6 pl-14 outline-none transition-colors text-sm uppercase tracking-widest placeholder:text-[#555555]"
                        placeholder="ENTER WALLET ADDRESS (0x...) TO SHIELD"
                    />
                    <button 
                        onClick={handleShield}
                        disabled={isProving}
                        className="absolute inset-y-2 right-2 bg-[#00FF55] text-black px-8 font-black text-xs uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isProving ? <Activity size={14} className="animate-spin" /> : <Lock size={14} />}
                        {isProving ? 'PROVING...' : 'SHIELD'}
                    </button>
                    {/* Corner aesthetic markers */}
                    <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-[#00FF55]" />
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-[#00FF55]" />
                </div>

                {lastProof && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-3xl border border-[#222222] bg-[#020202] text-left mt-8 relative"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-[#222222] bg-[#050505]">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 size={16} className="text-[#00FF55]" />
                                <h2 className="text-[12px] font-black uppercase tracking-widest text-[#FFFFFF]">Proof Generated</h2>
                            </div>
                            <span className="text-[9px] text-[#00FF55] uppercase tracking-widest font-bold">
                                BN128 CURVE ALIGNED
                            </span>
                        </div>
                        <div className="p-6">
                            <p className="text-[10px] text-[#555555] uppercase tracking-widest mb-4">Cryptographic SNARK Blob (Groth16):</p>
                            <pre className="text-[9px] text-[#00FF55] whitespace-pre-wrap font-mono leading-relaxed bg-[#050505] p-4 border border-[#111111] overflow-x-auto">
                                {JSON.stringify(lastProof, null, 2)}
                            </pre>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
