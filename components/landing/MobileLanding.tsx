"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, QrCode, Wallet, CheckCircle, ArrowRight, Shield, Activity, ChevronDown, Loader2 } from 'lucide-react';
import { useClerk, useUser } from '@clerk/nextjs';
import { useAppKit } from '@reown/appkit/react';
import { useAccount } from 'wagmi';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';

import { ScrollFloat } from '@/components/ui/ScrollFloat';
import { WhaleLogo } from '@/components/shared/WhaleLogo';
import { UltraFluidSection, UltraFluidLayer } from './UltraFluidEngine';

// Optimized QR Component
const QRCode = dynamic(() => import("qrcode.react").then((m) => m.QRCodeSVG), { ssr: false });

function Tag({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 text-[9px] font-mono font-black uppercase tracking-[0.3em] text-teal-400 rounded-full">
            {children}
        </span>
    );
}

export function MobileLanding() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionIdParam = searchParams.get("session");
    
    const { user, isSignedIn } = useUser();
    const { openSignIn } = useClerk();
    const { open: openWallet } = useAppKit();
    const { isConnected, address } = useAccount();

    const [qrSession, setQrSession] = useState<string | null>(null);
    const [syncStatus, setSyncStatus] = useState<"IDLE" | "AWAITING" | "SYNCED">("IDLE");
    const qrRef = useRef<string | null>(null);

    // ── Handshake & Session Logic ──────────────────────────────────────────
    const fetchSession = useCallback(async () => {
        try {
            setSyncStatus("AWAITING");
            const res = await fetch("/api/auth/qr-session", { method: "POST" });
            const data = await res.json();
            if (data.sessionId) setQrSession(data.sessionId);
        } catch {}
    }, []);

    useEffect(() => {
        if (isConnected) return; // Only for new sessions
        fetchSession();
    }, [isConnected, fetchSession]);

    useEffect(() => {
        qrRef.current = qrSession;
    }, [qrSession]);

    // Handshake logic: If mobile user hits this with a session ID, push their address to the hub
    useEffect(() => {
        if (!isConnected || !address || !sessionIdParam) return;
        
        const handshake = async () => {
            try {
                await fetch(`/api/auth/qr-session?id=${sessionIdParam}`, {
                    method: "POST",
                    body: JSON.stringify({ address })
                });
                setSyncStatus("SYNCED");
                setTimeout(() => router.push("/dashboard"), 1500);
            } catch (e) {
                console.error("[SYNC] Handshake failed:", e);
            }
        };
        handshake();
    }, [isConnected, address, sessionIdParam, router]);

    const qrUrl = typeof window !== "undefined"
        ? `${window.location.origin}/connect?session=${qrSession ?? ""}`
        : "";

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-teal-500/30 font-sans relative overflow-x-hidden">
            
            {/* ── BACKGROUND LAYERS: Inhuman Depth ── */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div 
                  className="absolute inset-0 opacity-[0.05] mix-blend-screen bg-repeat"
                  style={{ 
                    backgroundImage: "url('/api/checkpoint-image?name=corporate-cube-grid.jpg')",
                    backgroundSize: '400px auto'
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/80 to-transparent" />
            </div>

            {/* ── NAVIGATION ── */}
            <nav className="fixed top-0 left-0 w-full z-50 px-6 py-8 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm px-8">
                <div className="flex items-center gap-3">
                    <WhaleLogo className="w-8 h-8" />
                    <span className="text-[10px] font-black uppercase tracking-tighter">Whale Alert</span>
                </div>
                <Tag>Active</Tag>
            </nav>

            {/* ── HERO ── */}
            <UltraFluidSection className="min-h-screen flex flex-col items-center justify-center px-6 text-center pt-24">
                {({ y, opacity, scale }) => (
                    <UltraFluidLayer style={{ y, opacity, scale }} className="relative z-10 w-full max-w-sm flex flex-col items-center">
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            className="mb-8"
                        >
                             <Tag><Shield size={10} /> Secure Bridge</Tag>
                        </motion.div>

                        <ScrollFloat 
                            containerClassName="mb-10"
                            textClassName="text-7xl font-black tracking-tighter uppercase leading-[0.85] text-white"
                            animationDuration={1.2}
                            stagger={0.05}
                        >
                            WHALE ALERT
                        </ScrollFloat>

                        <p className="text-white/40 text-[11px] leading-relaxed mb-12 uppercase tracking-[0.2em] font-medium max-w-[280px]">
                            Establish cryptographic parity to mirror terminal operations on-mobile.
                        </p>

                        <button
                            onClick={() => { document.getElementById('s-connect')?.scrollIntoView({ behavior: 'smooth' }); }}
                            className="w-full bg-white text-black font-black text-[12px] uppercase tracking-[0.3em] py-7 rounded-full flex items-center justify-center gap-4 shadow-[0_20px_60px_rgba(255,255,255,0.1)] transition-transform active:scale-95"
                        >
                            Start Handshake <ArrowRight size={14} />
                        </button>
                    </UltraFluidLayer>
                )}
            </UltraFluidSection>

            {/* ── CONNECTION BRIDGE ── */}
            <section id="s-connect" className="relative min-h-screen flex flex-col items-center justify-start px-6 pt-32 pb-40 border-t border-white/5 bg-black/60 backdrop-blur-3xl">
                
                {/* Olas Hokusai Mobile Footer */}
                <div 
                    className="absolute inset-0 z-0 opacity-20 grayscale"
                    style={{ 
                        backgroundImage: "url('/api/checkpoint-image?name=olas-hokusai-4k.png')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'center bottom'
                    }}
                />

                <div className="relative z-10 w-full max-w-sm">
                    <div className="text-center mb-16 px-4">
                        <Tag><QrCode size={10} /> Sync Terminal</Tag>
                        <ScrollFloat 
                            containerClassName="mt-8 mb-6"
                            textClassName="text-5xl font-black tracking-tighter uppercase text-white"
                        >
                            BRIDGE ADPT
                        </ScrollFloat>
                        <p className="text-white/30 text-[10px] leading-relaxed uppercase tracking-[0.25em] font-bold">
                            Align matrix for session persistence
                        </p>
                    </div>

                    <div className="space-y-6">
                        {isSignedIn || isConnected ? (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col gap-4 p-8 border border-white/10 bg-white/[0.03] rounded-[2.5rem] backdrop-blur-2xl"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                                        <CheckCircle size={22} className="text-teal-500" />
                                    </div>
                                    <div>
                                        <p className="text-white text-[14px] font-black tracking-tight leading-none">
                                            Handshake Active
                                        </p>
                                        <p className="text-white/30 text-[9px] uppercase tracking-widest mt-2">
                                            {address ? `${address.slice(0, 10)}...${address.slice(-6)}` : "AUTH_PENDING"}
                                        </p>
                                    </div>
                                </div>
                                <Activity className="text-teal-500/50 w-full h-8 mt-4" />
                            </motion.div>
                        ) : (
                            <div className="grid gap-4">
                                <button
                                    onClick={() => openSignIn({ redirectUrl: '/' })}
                                    className="w-full py-6 bg-white/5 border border-white/10 text-white font-black text-[12px] uppercase tracking-[0.25em] flex items-center justify-center gap-4 rounded-full active:scale-95 transition-all hover:bg-white/10"
                                >
                                    <Lock size={14} className="text-teal-500"/>
                                    Access Identity
                                </button>
                                <button
                                    onClick={() => openWallet()}
                                    className="w-full py-6 bg-white/5 border border-white/10 text-white font-black text-[12px] uppercase tracking-[0.25em] flex items-center justify-center gap-4 rounded-full active:scale-95 transition-all hover:bg-white/10"
                                >
                                    <Wallet size={14} className="text-teal-500"/>
                                    Link Wallet
                                </button>
                            </div>
                        )}

                        <div className="flex items-center gap-6 py-10">
                            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-white/10" />
                            <span className="text-[9px] uppercase tracking-[0.4em] font-black text-white/20 whitespace-nowrap italic">Encrypted Handshake</span>
                            <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-white/10" />
                        </div>

                        {/* QR Sync UI */}
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-teal-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative p-8 border border-white/10 rounded-[3rem] bg-black/40 backdrop-blur-3xl flex flex-col items-center">
                                <div className="p-4 bg-white rounded-2xl mb-8">
                                    {qrSession ? (
                                        <QRCode value={qrUrl} size={200} bgColor="#FFFFFF" fgColor="#0F0F0F" level="M" />
                                    ) : (
                                        <div className="w-[200px] h-[200px] flex items-center justify-center">
                                            <Loader2 className="animate-spin text-black/20" size={32} />
                                        </div>
                                    )}
                                </div>
                                <p className="text-[10px] text-white/30 text-center uppercase tracking-[0.25em] leading-relaxed max-w-[240px]">
                                    Awaiting cryptographically unique response from terminal registry.
                                </p>
                            </div>
                        </div>

                        <div className="pt-20 pb-10 flex flex-col items-center gap-4">
                            <WhaleLogo className="w-10 h-10 opacity-20 grayscale" />
                            <p className="text-[9px] font-mono tracking-widest text-white/10 uppercase">
                                Sovereign Network · v3.0.0
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
