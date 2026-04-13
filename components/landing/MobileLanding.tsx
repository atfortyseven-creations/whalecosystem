"use client";

import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, QrCode, Wallet, CheckCircle, ArrowRight, Shield, Activity } from 'lucide-react';
import { useClerk, useUser } from '@clerk/nextjs';
import { useAppKit } from '@reown/appkit/react';
import dynamic from 'next/dynamic';

import ScrollFloat from '@/components/ui/ScrollFloat';
import { WhaleLogo } from '@/components/shared/WhaleLogo';

const QrScanner = dynamic(
    () => import('../dashboard/QrScanner').then(m => ({ default: m.QrScanner })),
    { 
        ssr: false, 
        loading: () => <div className="w-full aspect-square border border-white/10 bg-black/40 backdrop-blur-3xl animate-pulse flex items-center justify-center font-mono text-[10px] text-teal-500 tracking-widest uppercase">INITIALIZING SCANNER...</div> 
    }
);

function Tag({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 text-[9px] font-mono font-black uppercase tracking-[0.3em] text-teal-400 rounded-full">
            {children}
        </span>
    );
}

export function MobileLanding() {
    const { user, isSignedIn } = useUser();
    const { openSignIn } = useClerk();
    const { open: openWallet } = useAppKit();

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-teal-500/30 font-sans relative overflow-x-hidden">
            
            {/* ── BACKGROUND LAYERS ── */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div 
                  className="absolute inset-0 opacity-[0.05] grayscale mix-blend-screen bg-repeat"
                  style={{ 
                    backgroundImage: "url('/api/checkpoint-image?name=celestial-mesh-watermark.png')",
                    backgroundSize: '400px auto'
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/40 to-transparent" />
            </div>

            {/* ── NAVIGATION ── */}
            <nav className="fixed top-0 left-0 w-full z-50 px-6 py-8 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
                <WhaleLogo className="w-8 h-8" />
                <Tag>Active</Tag>
            </nav>

            {/* ── HERO ── */}
            <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center pt-24">
                <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="mb-10"
                    >
                         <Tag><Shield size={10} /> Sovereign Hub</Tag>
                    </motion.div>

                    <ScrollFloat 
                        containerClassName="mb-8"
                        textClassName="text-6xl font-black tracking-tighter uppercase leading-[0.8] text-white"
                        animationDuration={1}
                        stagger={0.04}
                    >
                        WHALE ALERT
                    </ScrollFloat>

                    <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="text-white/40 text-[12px] leading-relaxed mb-12 uppercase tracking-[0.15em] font-medium"
                    >
                        Mobile Interface Active.<br/>
                        Establish native cryptographic links to establish terminal session.
                    </motion.p>

                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        onClick={() => { document.getElementById('s-connect')?.scrollIntoView({ behavior: 'smooth' }); }}
                        className="w-full bg-white text-black font-black text-[12px] uppercase tracking-[0.3em] py-6 rounded-full flex items-center justify-center gap-4 shadow-[0_20px_40px_rgba(255,255,255,0.05)] transition-transform active:scale-95"
                    >
                        Initialize Sync <ArrowRight size={14} />
                    </motion.button>
                </div>

                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 2 }}
                    className="absolute bottom-12 flex flex-col items-center gap-4 text-white/20"
                >
                    <span className="text-[9px] font-mono tracking-[0.4em] uppercase">Scroll to Auth</span>
                    <ChevronDown size={16} className="animate-bounce" />
                </motion.div>
            </section>

            {/* ── CONNECTION BRIDGE ── */}
            <section id="s-connect" className="relative min-h-screen flex flex-col items-center justify-start px-6 pt-32 pb-40 border-t border-white/5 bg-black/40 backdrop-blur-3xl">
                
                {/* Olas Hokusai Mobile Footer */}
                <img
                    src="/api/checkpoint-image?name=olas-hokusai-4k.png"
                    alt="Institutional Waves"
                    className="absolute bottom-0 left-0 w-full h-auto opacity-40 mix-blend-screen pointer-events-none grayscale"
                />

                <div className="relative z-10 w-full max-w-sm">
                    <div className="text-center mb-16">
                        <Tag><QrCode size={10} /> Bridge Scanner</Tag>
                        <ScrollFloat 
                            containerClassName="mt-6 mb-4"
                            textClassName="text-4xl font-black tracking-tighter uppercase text-white"
                        >
                            SECURE SYNC
                        </ScrollFloat>
                        <p className="text-white/30 text-[11px] leading-relaxed uppercase tracking-widest font-bold">
                            Align with Terminal Matrix
                        </p>
                    </div>

                    <div className="space-y-6">
                        {isSignedIn ? (
                            <div className="flex items-center gap-5 p-6 border border-teal-500/30 bg-teal-500/5 rounded-3xl backdrop-blur-xl">
                                <CheckCircle size={24} className="text-teal-500 shrink-0" />
                                <div>
                                    <p className="text-teal-500 text-[10px] uppercase tracking-widest font-black">
                                        Identity Confirmed
                                    </p>
                                    <p className="text-white text-[13px] font-bold mt-1 tracking-tight">
                                        {user?.primaryEmailAddress?.emailAddress ?? user?.username ?? 'USER_IDENTITY'}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                <button
                                    onClick={() => openSignIn({ redirectUrl: '/' })}
                                    className="w-full py-5 bg-white/5 border border-white/10 text-white font-black text-[11px] uppercase tracking-[0.25em] flex items-center justify-center gap-4 rounded-full active:scale-95 transition-all"
                                >
                                    <Lock size={14} className="text-teal-500"/>
                                    Sovereign Login
                                </button>
                                <button
                                    onClick={() => openWallet()}
                                    className="w-full py-5 bg-white/5 border border-white/10 text-white font-black text-[11px] uppercase tracking-[0.25em] flex items-center justify-center gap-4 rounded-full active:scale-95 transition-all"
                                >
                                    <Wallet size={14} className="text-teal-500"/>
                                    Connect Wallet
                                </button>
                            </div>
                        )}

                        <div className="flex items-center gap-6 py-6 opacity-20">
                            <div className="flex-1 h-px bg-white" />
                            <span className="text-[9px] uppercase tracking-[0.4em] font-black">Scanning Matrix</span>
                            <div className="flex-1 h-px bg-white" />
                        </div>

                        <div className="relative group">
                            <div className="absolute -inset-1 bg-teal-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative p-1 border border-white/10 rounded-[2.5rem] bg-black/40 backdrop-blur-3xl overflow-hidden shadow-2xl">
                                <div className="aspect-square grayscale hover:grayscale-0 transition-all duration-700">
                                     <QrScanner />
                                </div>
                            </div>
                            
                            {/* Matrix Watermark Overlay Effect */}
                             <div className="mt-8 p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center gap-4">
                                <Activity size={18} className="text-teal-500/50" />
                                <p className="text-[10px] text-white/30 uppercase tracking-widest leading-relaxed">
                                    Awaiting cryptographically unique handshake from terminal session.
                                </p>
                             </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
}
