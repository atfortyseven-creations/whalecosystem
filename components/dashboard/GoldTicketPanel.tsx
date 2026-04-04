"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Ticket, Crown, Star, Zap, Shield, CheckCircle, Lock,
    Wallet, ExternalLink, Sparkles, Clock, Gift, ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

const BENEFITS = [
    { icon: <Zap size={16}/>,       label: 'Unlimited API Access',     desc: '1,000 req/min rate limit',          color: '#D4AF37' },
    { icon: <Shield size={16}/>,    label: 'Sovereign Data Tier',      desc: 'Full institutional feed access',    color: '#627EEA' },
    { icon: <Crown size={16}/>,     label: 'Lifetime Access',          desc: 'One-time · no renewals ever',       color: '#D4AF37' },
    { icon: <Star size={16}/>,      label: 'Priority Support',         desc: 'Dedicated response < 2h',           color: '#FF9500' },
    { icon: <Sparkles size={16}/>,  label: 'Neural Alert Engine',      desc: 'Unlimited alert rules + webhooks',  color: '#9945FF' },
    { icon: <CheckCircle size={16}/>,label: 'Whale Academy Pro',       desc: 'All courses unlocked permanently',  color: '#00C076' },
    { icon: <Gift size={16}/>,      label: 'Beta Features First',      desc: 'Early access to new modules',       color: '#FF3B30' },
    { icon: <Zap size={16}/>,       label: 'Copy Trading Arena',       desc: 'Follow top whale strategies',       color: '#0052FF' },
];

const STEPS = [
    { step: 1, title: 'Connect Wallet',    desc: 'Connect your Web3 wallet to verify identity and check Gold Ticket eligibility.',    done: false },
    { step: 2, title: 'Pay $5 Activation', desc: 'One-time $5 activation fee processed via crypto payment. Instantly credited.',       done: false },
    { step: 3, title: 'Receive NFT',       desc: 'Your Gold Ticket NFT is minted to your wallet — non-transferable Sovereign proof.',  done: false },
    { step: 4, title: 'Unlock Platform',   desc: 'All Sovereign features unlock immediately. No waiting. No KYC.',                     done: false },
];

import { useSovereignAccount } from '@/hooks/useSovereignAccount';

type ClaimStep = 'eligibility' | 'payment' | 'claiming' | 'claimed';

export function GoldTicketPanel() {
    const { address, isConnected } = useSovereignAccount();
    const [step, setStep]             = useState<ClaimStep>('eligibility');
    const [walletConnected, setWallet] = useState(false);
    const [paymentDone, setPayment]   = useState(false);
    const [claiming, setClaiming]     = useState(false);

    const handleConnect = () => {
        setWallet(true);
        toast.success('Wallet connected — eligibility verified ✓');
    };

    const handlePayment = () => {
        setPayment(true);
        setStep('payment');
        toast.success('Payment confirmed · $5 USDC received ✓');
    };

    const handleClaim = async () => {
        setClaiming(true);
        setStep('claiming');
        setTimeout(() => {
            setStep('claimed');
            setClaiming(false);
            toast.success('🎉 Gold Ticket claimed! Sovereign access activated.');
        }, 3000);
    };

    if (step === 'claimed') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="relative"
                >
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#F5E17A] flex items-center justify-center shadow-[0_0_60px_rgba(212,175,55,0.5)]">
                        <Crown size={56} className="text-[#050505]"/>
                    </div>
                    <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-[#00C076] flex items-center justify-center border-4 border-white">
                        <CheckCircle size={20} className="text-white"/>
                    </div>
                </motion.div>
                <div className="text-center">
                    <h1 className="text-3xl font-black text-[#050505] uppercase tracking-tighter">Sovereign Active</h1>
                    <p className="text-sm text-[#888888] mt-2">Your Gold Ticket NFT has been minted to your wallet</p>
                    <p className="text-[10px] font-mono text-[#888888] mt-1">Token ID: #WHALE-{address ? address.slice(-4).toUpperCase() : '0000'}</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl w-full">
                    {BENEFITS.slice(0,4).map((b, i) => (
                        <div key={i} className="bg-white border border-[#E5E5E5] rounded-xl p-4 text-center">
                            <span style={{ color: b.color }}>{b.icon}</span>
                            <div className="text-[9px] font-black text-[#050505] uppercase mt-1">{b.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (step === 'claiming') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                    className="w-20 h-20 rounded-full border-4 border-[#D4AF37] border-t-transparent"/>
                <div className="text-center">
                    <h2 className="text-xl font-black text-[#050505] uppercase tracking-tighter">Minting Your Gold Ticket</h2>
                    <p className="text-[10px] text-[#888888] mt-2 font-mono">Broadcasting NFT to blockchain…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col space-y-6">

            {/* ── Hero Card ── */}
            <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="relative bg-[#050505] rounded-2xl overflow-hidden shadow-2xl"
            >
                {/* Gold shimmer background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/20 via-transparent to-[#D4AF37]/5"/>
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 blur-[80px] rounded-full"/>

                <div className="relative z-10 p-8 flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#F5E17A] flex items-center justify-center shadow-xl shrink-0">
                        <Crown size={40} className="text-[#050505]"/>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[8px] px-2 py-1 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-black uppercase tracking-widest border border-[#D4AF37]/30">Sovereign Pass</span>
                        </div>
                        <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Gold Ticket</h1>
                        <p className="text-[10px] text-white/60 mt-1 max-w-md">One-time NFT-based access pass granting lifetime Sovereign tier access to the entire Whalecosystem platform. Only $5 activation.</p>
                    </div>
                    <div className="ml-auto text-right shrink-0">
                        <div className="text-4xl font-black text-[#D4AF37]">$5</div>
                        <div className="text-[9px] text-white/40 uppercase tracking-widest">One-time · lifetime access</div>
                    </div>
                </div>
            </motion.div>

            {/* ── Benefits Grid ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {BENEFITS.map((b, i) => (
                    <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                        className="bg-white border border-[#E5E5E5] rounded-xl p-4 shadow-sm">
                        <span style={{ color: b.color }}>{b.icon}</span>
                        <div className="text-[10px] font-black text-[#050505] mt-2">{b.label}</div>
                        <div className="text-[8px] text-[#888888] mt-0.5">{b.desc}</div>
                    </motion.div>
                ))}
            </div>

            {/* ── Claim Steps ── */}
            <div className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-[#E5E5E5] bg-[#FAF9F6]">
                    <span className="text-[10px] font-black text-[#050505] uppercase tracking-widest">Claim Your Gold Ticket</span>
                </div>
                <div className="p-6 space-y-4">
                    {/* Step 1: Connect */}
                    <div className={`rounded-xl border p-5 transition-all ${walletConnected ? 'border-[#00C076] bg-[#00C076]/5' : 'border-[#E5E5E5] bg-white'}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${walletConnected ? 'bg-[#00C076] text-white' : 'bg-[#E5E5E5] text-[#888888]'}`}>
                                    {walletConnected ? <CheckCircle size={16}/> : '1'}
                                </div>
                                <div>
                                    <div className="text-[11px] font-black text-[#050505]">Connect Wallet</div>
                                    <div className="text-[9px] text-[#888888]">{STEPS[0].desc}</div>
                                </div>
                            </div>
                            {!walletConnected && (
                                <button onClick={handleConnect}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-[#050505] text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-[#050505]/85 transition-colors">
                                    <Wallet size={13}/> Connect
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Step 2: Pay */}
                    <div className={`rounded-xl border p-5 transition-all ${!walletConnected ? 'opacity-40 cursor-not-allowed' : paymentDone ? 'border-[#00C076] bg-[#00C076]/5' : 'border-[#E5E5E5]'}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${paymentDone ? 'bg-[#00C076] text-white' : 'bg-[#E5E5E5] text-[#888888]'}`}>
                                    {paymentDone ? <CheckCircle size={16}/> : '2'}
                                </div>
                                <div>
                                    <div className="text-[11px] font-black text-[#050505]">Pay $5 Activation Fee</div>
                                    <div className="text-[9px] text-[#888888]">USDC, ETH, SOL or BNB accepted</div>
                                </div>
                            </div>
                            {walletConnected && !paymentDone && (
                                <button onClick={handlePayment}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-[#D4AF37] text-[#050505] rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-[#D4AF37]/85 transition-colors">
                                    <Ticket size={13}/> Pay $5
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Step 3: Claim */}
                    <div className={`rounded-xl border p-5 transition-all ${!paymentDone ? 'opacity-40 cursor-not-allowed' : 'border-[#D4AF37] bg-[#D4AF37]/5'}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${paymentDone ? 'bg-[#D4AF37] text-[#050505]' : 'bg-[#E5E5E5] text-[#888888]'}`}>
                                    {paymentDone ? '3' : '3'}
                                </div>
                                <div>
                                    <div className="text-[11px] font-black text-[#050505]">Claim Gold Ticket NFT</div>
                                    <div className="text-[9px] text-[#888888]">NFT minted to your wallet — instant Sovereign access</div>
                                </div>
                            </div>
                            {paymentDone && (
                                <button onClick={handleClaim}
                                    className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-[#D4AF37] to-[#F5E17A] text-[#050505] rounded-lg text-[9px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] transition-all">
                                    <Crown size={13}/> Claim Now
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Footer Note ── */}
            <div className="bg-[#FAF9F6] border border-[#E5E5E5] rounded-xl p-4 flex items-start gap-3">
                <Shield size={16} className="text-[#888888] mt-0.5 shrink-0"/>
                <p className="text-[10px] text-[#888888] leading-relaxed">
                    The Gold Ticket is a non-transferable NFT minted on-chain. The $5 activation fee covers gas + platform costs. 
                    Once claimed, access is permanent and cannot be revoked. No subscription fees. No renewals. Full Sovereign access forever.
                </p>
            </div>
        </div>
    );
}
