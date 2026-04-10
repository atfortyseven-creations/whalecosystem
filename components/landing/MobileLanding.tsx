"use client";

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Terminal, Lock, Cpu, Database, Shield, ArrowRight, QrCode, Wallet, CheckCircle, ChevronDown, Network } from 'lucide-react';
import { useClerk, useUser } from '@clerk/nextjs';
import { useAppKit } from '@reown/appkit/react';
import dynamic from 'next/dynamic';

const QrScanner = dynamic(
    () => import('../dashboard/QrScanner').then(m => ({ default: m.QrScanner })),
    { ssr: false, loading: () => <div className="w-64 h-64 border border-[#333] bg-[#050505] animate-pulse mx-auto flex items-center justify-center font-mono text-[10px] text-[#00FF55]">LOADING SCANNER</div> }
);

function Tag({ children, glitch = false }: { children: React.ReactNode; glitch?: boolean }) {
    return (
        <span className={`inline-flex items-center gap-2 px-3 py-1 bg-[#050505] border border-[#333333] text-[9px] font-mono font-black uppercase tracking-[0.2em] text-[#00FF55] ${glitch ? 'animate-pulse' : ''}`}>
            {children}
        </span>
    );
}

function Section({ id, children, className = "" }: { id?: string; children: React.ReactNode; className?: string }) {
    return (
        <section id={id} className={`min-h-screen w-full relative flex flex-col px-6 py-20 border-b border-[#222222] ${className}`}>
            {children}
        </section>
    );
}

export function MobileLanding() {
    const { user, isSignedIn } = useUser();
    const { openSignIn } = useClerk();
    const { open: openWallet } = useAppKit();

    return (
        <div style={{ backgroundColor: "transparent", color: "#FFFFFF" }} className="min-h-screen overflow-y-auto w-full selection:bg-[#00FF55] selection:text-[#000000] font-mono relative">
            {/* GLOBAL COSMIC WALLPAPER */}
            <div 
              className="fixed inset-0 pointer-events-none z-0 transition-colors duration-300"
              style={{
                 backgroundImage: "url('/patron-cosmico-4k.png')",
                 backgroundRepeat: "no-repeat",
                 backgroundSize: "cover",
                 backgroundPosition: "center",
                 opacity: 0.5,
                 transform: "translateZ(0)",
                 willChange: "transform",
              }}
            />
            {/* ── INIT/HERO ── */}
            <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 text-center border-b border-[#222222]">
                <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `linear-gradient(#00FF55 1px, transparent 1px), linear-gradient(90deg, #00FF55 1px, transparent 1px)`, backgroundSize: '20px 20px' }} />

                <div className="relative z-10 flex flex-col items-center gap-8 py-12 w-full">
                    <Tag><Lock size={12} strokeWidth={2} /> SECURE CONNECTION</Tag>

                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase whitespace-nowrap">
                            WHALE<br/>
                            <span className="text-[#00FF55]">ALERT.</span>
                        </h1>
                    </div>

                    <p className="text-[#888888] text-[11px] leading-relaxed max-w-[280px] uppercase tracking-wider font-bold">
                        Mobile interface active. Use to establish native cryptographic links.
                    </p>

                    <button
                        onClick={() => { document.getElementById('s-connect')?.scrollIntoView({ behavior: 'smooth' }); }}
                        className="bg-[#00FF55] text-[#000000] font-black text-[12px] uppercase tracking-[0.2em] px-8 py-4 mt-4 w-full max-w-[280px] flex items-center justify-center gap-3 hover:bg-white transition-colors"
                    >
                        CONNECT WALLET <ArrowRight size={14} />
                    </button>
                    
                    <div className="flex gap-6 text-[9px] uppercase tracking-widest text-[#555555] font-black mt-4">
                        <span>E2E ENCRYPTED</span>
                        <span>ZERO KNOWLEDGE</span>
                    </div>
                </div>
            </section>

            {/* ── CONSTRAINTS ── */}
            <Section className="justify-center">
                <div className="space-y-12 max-w-sm mx-auto w-full">
                    <div className="space-y-6">
                        <Tag><Terminal size={12} /> MOBILE SYNC</Tag>
                        <h2 className="text-3xl font-black uppercase tracking-tight">
                            SCAN TO<br/>
                            <span className="text-[#00FF55]">CONNECT.</span>
                        </h2>
                        <p className="text-[#888888] text-[11px] leading-relaxed uppercase tracking-wider">
                            Full matrix resolution unavailable on mobile. This device acts purely as an authentication bridge to sync your desktop session.
                        </p>
                    </div>

                    <div className="border border-[#333333] bg-[#050505] p-6 space-y-4">
                        <div className="text-[#00FF55] flex items-center gap-2 font-black text-[9px] uppercase tracking-[0.2em]">
                            <Network size={12} /> DEVICE INFO
                        </div>
                        <p className="text-[#A0AABF] text-[11px] leading-relaxed uppercase tracking-widest">
                            Scan the desktop QR matrix below to relay encrypted keys.
                        </p>
                    </div>
                </div>
            </Section>

            {/* ── BRIDGE MODULE ── */}
            <Section id="s-connect" className="justify-start pt-16 pb-24 overflow-hidden relative">
                {/* 4K HOKUSAI WAVE BACKGROUND */}
                <img
                    src="/olas-hokusai-4k.png"
                    alt="Hokusai Bridge Waves"
                    className="absolute bottom-0 left-0 w-full h-auto pointer-events-none select-none"
                    style={{
                        transform: "translateZ(0)",
                        willChange: "transform",
                        opacity: 0.92,
                        zIndex: 1
                    }}
                />
                
                <div className="relative z-10 space-y-10 max-w-sm mx-auto w-full">
                    <div className="space-y-4 text-center">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 border border-[#00FF55] bg-[#00FF55]/5 text-[#00FF55]">
                                <QrCode size={32} strokeWidth={1} />
                            </div>
                        </div>
                        <h2 className="text-2xl font-black uppercase tracking-tight">
                            CONNECT WALLET
                        </h2>
                        <p className="text-[#888888] text-[10px] leading-[1.8] uppercase tracking-widest">
                            Initialize signature or scan physical screen.
                        </p>
                    </div>

                    {isSignedIn ? (
                        <div className="flex items-center gap-4 p-5 border border-[#00FF55] bg-[#050505]">
                            <CheckCircle size={22} className="text-[#00FF55] shrink-0" />
                            <div>
                                <p className="text-[#00FF55] text-[9px] uppercase tracking-widest font-black">
                                    CONNECTED
                                </p>
                                <p className="text-[#FFFFFF] text-[12px] font-bold mt-1 uppercase tracking-wider">
                                    {user?.primaryEmailAddress?.emailAddress ?? user?.username ?? 'USER'}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <button
                                onClick={() => openSignIn({ redirectUrl: '/' })}
                                className="w-full py-4 border border-[#333333] bg-[#050505] text-[#FFFFFF] font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:border-[#00FF55] transition-colors"
                            >
                                <Lock size={14} className="text-[#00FF55]"/>
                                EMAIL LOGIN
                            </button>
                            <button
                                onClick={() => openWallet()}
                                className="w-full py-4 border border-[#333333] bg-[#050505] text-[#FFFFFF] font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:border-[#00FF55] transition-colors"
                            >
                                <Wallet size={14} className="text-[#00FF55]"/>
                                CONNECT WALLET
                            </button>
                        </div>
                    )}

                    <div className="flex items-center gap-4 py-8">
                        <div className="flex-1 h-[1px] bg-[#333333]" />
                        <span className="text-[#888888] text-[9px] uppercase tracking-[0.3em] font-black">QR SCANNER</span>
                        <div className="flex-1 h-[1px] bg-[#333333]" />
                    </div>

                    <div className="space-y-6">
                        <div className="p-1 border border-[#333333] bg-[#050505]">
                             <QrScanner />
                        </div>
                    </div>

                    <div className="pt-8 text-center text-[9px] uppercase tracking-[0.2em] font-black text-[#555555]">
                        <p>SECURE E2E ENCRYPTED CONNECTION.</p>
                    </div>
                </div>
            </Section>
        </div>
    );
}
