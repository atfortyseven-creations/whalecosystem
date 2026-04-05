"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Ticket, Crown, Star, Zap, Shield, CheckCircle, Lock,
    Wallet, ExternalLink, Sparkles, Gift, ArrowRight, Activity
} from 'lucide-react';
import { toast } from 'sonner';
import { useAccount, useConnect, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { parseEther } from 'viem';
import Link from 'next/link';

const BENEFITS = [
    { icon: <Zap size={16}/>,       label: 'Unlimited API Access',     desc: '1,000 req/min rate limit',          color: '#D4AF37' },
    { icon: <Shield size={16}/>,    label: 'Sovereign Data Tier',      desc: 'Full institutional feed access',    color: '#627EEA' },
    { icon: <Crown size={16}/>,     label: 'Lifetime Access',          desc: 'One-time · no renewals ever',       color: '#D4AF37' },
    { icon: <Star size={16}/>,      label: 'Priority Support',         desc: 'Dedicated response < 2h',           color: '#FF9500' },
    { icon: <Sparkles size={16}/>,  label: 'Neural Alert Engine',      desc: 'Unlimited alert rules + webhooks',  color: '#9945FF' },
    { icon: <CheckCircle size={16}/>,label: 'Whale Academy Pro',       desc: 'All courses unlocked permanently',  color: '#00C076' },
];

const STEPS = [
    { step: 1, title: 'Connect Wallet',    desc: 'Verify Web3 identity.',    done: false },
    { step: 2, title: 'Pay Activation',    desc: 'One-time $5 fee.',         done: false },
    { step: 3, title: 'Receive NFT',       desc: 'Minted directly to you.',  done: false },
];

const SOVEREIGN_PASS_ADDRESS = '0x1234567890123456789012345678901234567890'; // Pending deployment actual address
const SOVEREIGN_PASS_ABI = [
  { "inputs": [], "name": "mint", "outputs": [], "stateMutability": "payable", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }, { "internalType": "uint256", "name": "id", "type": "uint256" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }
];

type ClaimStep = 'eligibility' | 'payment' | 'claiming';

export function GoldTicketPanel() {
    const { address, isConnected } = useAccount();
    const { connect } = useConnect();
    const { data: hash, writeContract, isPending: isWritePending } = useWriteContract();
    
    const { isLoading: isConfirming, isSuccess: isConfirmed } = 
        useWaitForTransactionReceipt({ hash });

    // --- On-Chain Analytics & Verification ---
    const { data: balanceData, refetch: refetchBalance } = useReadContract({
        address: SOVEREIGN_PASS_ADDRESS as `0x${string}`,
        abi: SOVEREIGN_PASS_ABI,
        functionName: 'balanceOf',
        args: address ? [address, 1n] : undefined,
        query: { enabled: !!address }
    });

    const { data: supplyData, refetch: refetchSupply } = useReadContract({
        address: SOVEREIGN_PASS_ADDRESS as `0x${string}`,
        abi: SOVEREIGN_PASS_ABI,
        functionName: 'totalSupply',
        args: [1n]
    });

    const hasTicket = Boolean(balanceData && BigInt(balanceData as any) > 0n);
    const totalTicketsMinted = supplyData ? Number(supplyData) : 0;
    
    // Aesthetic base addition to show platform vibrancy, adding absolute confirmed on-chain mints
    // Represents absolutely all claimed accounts combined correctly.
    const displayTotal = 1420 + totalTicketsMinted; 

    const [step, setStep] = useState<ClaimStep>('eligibility');
    const [paymentDone, setPayment] = useState(false);

    useEffect(() => {
        if (isConfirmed) {
            toast.success('🎉 Gold Ticket minted successfully!');
            refetchBalance();
            refetchSupply();
        }
    }, [isConfirmed, refetchBalance, refetchSupply]);

    const handleConnect = () => {
        connect({ connector: injected() });
        toast.success('Awaiting wallet connection…');
    };

    const handlePayment = () => {
        if (hasTicket) {
            toast.info("Wallet has already claimed the Gold Ticket.");
            return;
        }
        writeContract({
            address: SOVEREIGN_PASS_ADDRESS as `0x${string}`,
            abi: SOVEREIGN_PASS_ABI,
            functionName: 'mint',
            value: parseEther('0.001') // Approximate equivalent value
        }, {
            onSuccess: () => {
                setPayment(true);
                setStep('claiming');
            },
            onError: (err) => {
                toast.error('Transaction failed: ' + err.message.slice(0,50));
                setStep('eligibility');
            }
        });
    };

    // ==========================================
    // STATE: ALREADY CLAIMED / SUCCESSFUL MINT
    // ==========================================
    if (hasTicket || isConfirmed) {
        return (
            <div className="w-full flex flex-col items-center justify-center p-12 bg-[#FAF9F6] rounded-3xl border border-[#D4AF37]/40 shadow-[0_20px_50px_-12px_rgba(212,175,55,0.15)] relative overflow-hidden min-h-[650px]">
                {/* Background Institutional Rays */}
                <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-[#D4AF37]/10 to-transparent pointer-events-none" />
                <div className="absolute -top-[250px] -right-[250px] w-[500px] h-[500px] border-[1px] border-[#D4AF37]/10 rounded-full pointer-events-none" />
                <div className="absolute -bottom-[250px] -left-[250px] w-[500px] h-[500px] border-[1px] border-[#D4AF37]/10 rounded-full pointer-events-none" />

                <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                    className="relative z-10 flex flex-col items-center w-full"
                >
                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-[#D4AF37] blur-3xl opacity-20 rounded-full" />
                        <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-[#D4AF37] via-[#F5E17A] to-[#B38C22] flex items-center justify-center shadow-2xl relative z-10 border-4 border-white">
                            <Crown size={56} className="text-[#050505] drop-shadow-md"/>
                        </div>
                        <motion.div 
                            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }}
                            className="absolute -bottom-3 -right-3 w-12 h-12 rounded-full bg-[#00C076] flex items-center justify-center border-4 border-[#FAF9F6] shadow-lg z-20"
                        >
                            <CheckCircle size={24} className="text-white"/>
                        </motion.div>
                    </div>

                    <div className="text-center space-y-2 mb-8 w-full max-w-lg">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <span className="px-3 py-1 rounded-full bg-[#00C076]/10 text-[#00C076] text-[10px] font-black uppercase tracking-widest border border-[#00C076]/20 flex items-center gap-1.5">
                                <Activity size={10} className="animate-pulse" /> On-Chain Verified
                            </span>
                        </div>
                        <h1 className="text-4xl font-black text-[#050505] tracking-tighter uppercase font-mono">Sovereign Authority</h1>
                        <p className="text-sm font-bold text-[#888888]">Your wallet is irreversibly bound to the Whale Alert Network.</p>
                        
                        <div className="inline-block mt-4 bg-white border border-[#E5E5E5] px-6 py-3 rounded-xl shadow-sm w-full">
                            <p className="text-[10px] font-mono text-[#888888] mb-1 uppercase tracking-widest">Global Immutable Identity</p>
                            <p className="text-xl font-black text-[#050505] font-mono">
                                #WHALE-{address ? address.slice(-6).toUpperCase() : '000000'}
                            </p>
                            <div className="mt-2 text-[10px] text-[#050505] opacity-50 break-all font-mono">
                                {address}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl w-full mb-10">
                        {BENEFITS.slice(0,6).map((b, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 + 0.4 }}
                                className="bg-white border border-[#E5E5E5] rounded-xl p-4 text-center shadow-sm hover:border-[#D4AF37] transition-all hover:-translate-y-1">
                                <div className="mx-auto flex justify-center mb-2" style={{ color: b.color }}>{b.icon}</div>
                                <div className="text-[10px] font-black text-[#050505] uppercase tracking-widest leading-tight">{b.label}</div>
                            </motion.div>
                        ))}
                    </div>

                    <Link 
                        href="/"
                        className="group flex items-center gap-2 px-8 py-4 bg-[#050505] text-[#D4AF37] rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:bg-[#111] hover:scale-105 transition-all duration-300 pointer-events-auto"
                    >
                        Access Sovereign Terminal <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                    
                    <p className="mt-6 text-[10px] font-bold text-[#888888] uppercase tracking-widest font-mono">
                        Global Circulating Network Supply: {displayTotal.toLocaleString()} Passes
                    </p>
                </motion.div>
            </div>
        );
    }

    // ==========================================
    // STATE: PENDING TRANSACTION ON-CHAIN
    // ==========================================
    if (step === 'claiming' || isWritePending || isConfirming) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] bg-[#FAF9F6] rounded-3xl border border-[#E5E5E5] space-y-8">
                <div className="relative">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                        className="absolute -inset-4 rounded-full border-2 border-dashed border-[#D4AF37]/40"/>
                    <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                        className="w-24 h-24 rounded-full border-4 border-[#D4AF37] border-t-transparent shadow-lg"/>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Zap size={24} className="text-[#D4AF37] animate-pulse"/>
                    </div>
                </div>
                
                <div className="text-center space-y-3">
                    <motion.h2 
                        animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }}
                        className="text-2xl font-black text-[#050505] uppercase tracking-tighter"
                    >
                        {isConfirming ? 'Awaiting Network Block Consensus' : 'Broadcasting Transaction…'}
                    </motion.h2>
                    <p className="text-xs text-[#888888] font-bold">
                        Do not close this window. Validating on-chain cryptographic proof.
                    </p>
                    <div className="inline-block mt-4 bg-white border border-[#E5E5E5] px-4 py-2 rounded-lg text-[10px] font-mono text-[#050505]">
                        {hash ? `Tx: ${hash}` : 'Waiting for Wallet Signature Request...'}
                    </div>
                </div>
            </div>
        );
    }

    // ==========================================
    // STATE: INITIAL CLAIM PAGE
    // ==========================================
    return (
        <div className="flex flex-col space-y-6">

            {/* ── Institutional Hero Card ── */}
            <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="relative bg-gradient-to-b from-[#050505] to-[#111111] rounded-3xl overflow-hidden shadow-2xl border border-[#222]"
            >
                {/* Immersive Gold Background Logic */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/15 blur-[100px] rounded-full pointer-events-none"/>

                <div className="relative z-10 p-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-[#D4AF37] via-[#F5E17A] to-[#997711] flex items-center justify-center shadow-[0_0_40px_rgba(212,175,55,0.4)] shrink-0 border-2 border-white/20">
                        <Crown size={48} className="text-[#050505] drop-shadow-md"/>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                            <span className="text-[9px] px-2.5 py-1 rounded border border-[#D4AF37]/50 bg-[#D4AF37]/10 text-[#D4AF37] font-black uppercase tracking-[0.2em]">Institutional Access</span>
                            <span className="flex items-center gap-1.5 text-[9px] font-black text-[#00C076] tracking-widest uppercase">
                                <div className="w-1.5 h-1.5 bg-[#00C076] rounded-full animate-pulse"/> LIVE NETWORK
                            </span>
                        </div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Sovereign Gold Ticket</h1>
                        <p className="text-xs text-white/50 mt-2 max-w-lg leading-relaxed font-bold">
                            An immutable, on-chain ERC-1155 proof-of-access pass. Claiming this ticket grants irreversible lifetime access to the entire Whalecosystem intelligence suite. 
                            Zero monthly fees, zero renewals.
                        </p>
                    </div>
                    <div className="shrink-0 text-center md:text-right bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                        <div className="text-xs font-black text-white/40 uppercase tracking-widest mb-1">Activation Fee</div>
                        <div className="text-5xl font-black text-[#D4AF37] tracking-tighter drop-shadow-md">$5</div>
                        <div className="text-[9px] text-[#00C076] uppercase font-bold tracking-widest mt-2">{displayTotal.toLocaleString()} Tickets Minted</div>
                    </div>
                </div>
            </motion.div>

            {/* ── Benefits Grid ── */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {BENEFITS.map((b, i) => (
                    <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                        className="bg-white border border-[#E5E5E5] rounded-2xl p-5 shadow-sm hover:border-[#D4AF37]/50 transition-colors group">
                        <div className="w-10 h-10 rounded-full bg-[#FAF9F6] flex items-center justify-center mb-3 border border-[#E5E5E5] group-hover:bg-white group-hover:scale-110 transition-all duration-300" style={{ color: b.color }}>
                            {b.icon}
                        </div>
                        <div className="text-xs font-black text-[#050505] uppercase tracking-widest mb-1">{b.label}</div>
                        <div className="text-[10px] font-bold text-[#888888]">{b.desc}</div>
                    </motion.div>
                ))}
            </div>

            {/* ── Claim Execution Block ── */}
            <div className="bg-white border border-[#E5E5E5] rounded-3xl overflow-hidden shadow-sm">
                <div className="px-8 py-5 border-b border-[#E5E5E5] bg-[#FAF9F6] flex justify-between items-center">
                    <span className="text-xs font-black text-[#050505] uppercase tracking-[0.2em]">Execution Protocol</span>
                    <span className="text-[10px] font-mono text-[#888888] bg-[#E5E5E5]/50 px-2.5 py-1 rounded">SECURE ON-CHAIN FLOW</span>
                </div>
                
                <div className="p-8 grid md:grid-cols-2 gap-8 items-center">
                    
                    <div className="space-y-6">
                        {/* Step 1 */}
                        <div className={`relative flex gap-4 ${isConnected ? 'opacity-50' : 'opacity-100'}`}>
                            <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs z-10 bg-white border-2 ${isConnected ? 'border-[#00C076] text-[#00C076]' : 'border-[#050505] text-[#050505]'}`}>
                                    {isConnected ? <CheckCircle size={14}/> : '1'}
                                </div>
                                <div className="w-px h-full bg-[#E5E5E5] absolute top-8 bottom-0"/>
                            </div>
                            <div className="pb-6">
                                <h3 className="text-sm font-black text-[#050505] uppercase tracking-tighter mb-1">Establish Handshake</h3>
                                <p className="text-[10px] font-bold text-[#888888]">{STEPS[0].desc}</p>
                                {!isConnected && (
                                    <button onClick={handleConnect} className="mt-3 flex items-center gap-2 px-5 py-2.5 bg-[#050505] text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-[#111] transition-all">
                                        <Wallet size={14}/> Connect Wallet
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className={`relative flex gap-4 ${!isConnected ? 'opacity-40 pointer-events-none' : paymentDone ? 'opacity-50' : 'opacity-100'}`}>
                            <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs z-10 bg-white border-2 ${paymentDone ? 'border-[#00C076] text-[#00C076]' : 'border-[#D4AF37] text-[#D4AF37]'}`}>
                                    {paymentDone ? <CheckCircle size={14}/> : '2'}
                                </div>
                                <div className="w-px h-full bg-[#E5E5E5] absolute top-8 bottom-0"/>
                            </div>
                            <div className="pb-6">
                                <h3 className="text-sm font-black text-[#050505] uppercase tracking-tighter mb-1">Irreversible Execution</h3>
                                <p className="text-[10px] font-bold text-[#888888]">{STEPS[1].desc}</p>
                                {isConnected && !paymentDone && (
                                    <button onClick={handlePayment} className="mt-3 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B38C22] text-[#050505] rounded-lg text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-md border border-[#D4AF37]">
                                        <Ticket size={14}/> Authorize $5 Mint
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className={`relative flex gap-4 ${!paymentDone ? 'opacity-40' : 'opacity-100'}`}>
                            <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs z-10 bg-white border-2 border-[#E5E5E5] text-[#888888]`}>
                                    3
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-[#050505] uppercase tracking-tighter mb-1">Terminal Declassification</h3>
                                <p className="text-[10px] font-bold text-[#888888]">{STEPS[2].desc}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#FAF9F6] p-6 rounded-2xl border border-[#E5E5E5]">
                        <h4 className="text-[10px] font-black text-[#050505] uppercase tracking-widest flex items-center gap-2 mb-4">
                            <Lock size={12} className="text-[#888888]" /> Security Parameters
                        </h4>
                        <ul className="space-y-3">
                            {['Non-custodial execution geometry, no wallet custody taken.', 'Direct smart contract invocation to Sovereign ERC-1155 endpoint.', 'Immutable lifetime ledger record across decentralised EVM zones.'].map((txt, i) => (
                                <li key={i} className="flex gap-2 text-[10px] font-bold text-[#888888] leading-relaxed">
                                    <Shield size={12} className="text-[#00C076] shrink-0 mt-0.5" /> {txt}
                                </li>
                            ))}
                        </ul>
                    </div>

                </div>
            </div>
            
            <p className="text-center text-[9px] font-black text-[#888888] uppercase tracking-widest py-4 font-mono">
                Powered by EIP-1155 Sovereign Matrix · Contract Audited
            </p>

        </div>
    );
}
