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

function Tag({ children, color = "teal" }: { children: React.ReactNode; color?: "teal" | "gold" }) {
    const colorClasses = color === "teal" ? "text-[#00F2EA] bg-[#00F2EA]/10 border-[#00F2EA]/20" : "text-[#D4AF37] bg-[#D4AF37]/10 border-[#D4AF37]/20";
    return (
        <span className={`inline-flex items-center gap-2 px-4 py-1.5 border text-[9px] font-mono font-black uppercase tracking-[0.3em] rounded-full backdrop-blur-xl ${colorClasses}`}>
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
        if (isConnected) return;
        fetchSession();
    }, [isConnected, fetchSession]);

    // Handshake logic
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
            } catch (e) {}
        };
        handshake();
    }, [isConnected, address, sessionIdParam, router]);

    const qrUrl = typeof window !== "undefined"
        ? `${window.location.origin}/connect?session=${qrSession ?? ""}`
        : "";

    return (
        <div className="min-h-screen bg-[#FAF9F6] text-[#050505] selection:bg-[#00F2EA]/30 font-sans relative overflow-x-hidden">
            
            {/* ── BACKGROUND LAYERS: Inhuman Depth ── */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div 
                  className="absolute inset-0 opacity-[0.06] mix-blend-multiply bg-repeat"
                  style={{ 
                    backgroundImage: "url('/api/checkpoint-image?name=patron-cosmico-4k.png')",
                    backgroundSize: 'clamp(300px, 50vw, 600px) auto' // Zero-zoom relative scaling
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-[#FAF9F6]" />
            </div>

            {/* ── NAVIGATION ── */}
            <nav className="fixed top-0 left-0 w-full z-50 px-8 py-8 flex justify-between items-center bg-white/60 backdrop-blur-xl border-b border-black/[0.03]">
                <div className="flex items-center gap-3">
                    <WhaleLogo className="w-8 h-8" />
                    <span className="text-[10px] font-black uppercase tracking-tighter text-black">Whale Alert Network</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-[#00F2EA] animate-pulse shadow-[0_0_8px_rgba(0,242,234,0.5)]" />
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
                             <Tag><Shield size={10} /> Institutional Handshake</Tag>
                        </motion.div>

                        <ScrollFloat 
                            containerClassName="mb-10"
                            textClassName="text-7xl font-black tracking-tighter uppercase leading-[0.85] text-black"
                            animationDuration={1.2}
                            stagger={0.05}
                        >
                            WHALE ALERT
                        </ScrollFloat>

                        <p className="text-black/40 text-[11px] leading-relaxed mb-12 uppercase tracking-[0.2em] font-black max-w-[280px]">
                            Secure identity parity for real-time institutional mempool tracking.
                        </p>

                        <button
                            onClick={() => { document.getElementById('s-connect')?.scrollIntoView({ behavior: 'smooth' }); }}
                            className="w-full bg-black text-white font-black text-[11px] uppercase tracking-[0.3em] py-7 rounded-full flex items-center justify-center gap-4 shadow-2xl transition-transform active:scale-95"
                        >
                            Establish Link <ArrowRight size={14} />
                        </button>
                    </UltraFluidLayer>
                )}
            </UltraFluidSection>

            {/* ── CONNECTION BRIDGE ── */}
            <section id="s-connect" className="relative min-h-screen flex flex-col items-center justify-start px-6 pt-32 pb-40 border-t border-black/[0.03] bg-white/80 backdrop-blur-3xl">
                
                {/* [INHUMAN ALIGNMENT] Waves perfectly enlinked with the footer logic */}
                <div 
                    className="absolute inset-x-0 bottom-0 h-1/2 z-0 opacity-[0.3] grayscale mix-blend-multiply"
                    style={{ 
                        backgroundImage: "url('/api/checkpoint-image?name=olas-hokusai-4k.png')",
                        backgroundSize: '100% auto', // Forced aspect integrity
                        backgroundPosition: 'center bottom',
                        backgroundRepeat: 'no-repeat'
                    }}
                />
                
                <div className="absolute inset-0 z-[1] bg-gradient-to-t from-[#FAF9F6] via-transparent to-transparent opacity-100" />

                <div className="relative z-10 w-full max-w-sm">
                    <div className="text-center mb-16 px-4">
                        <Tag color="gold"><QrCode size={10} /> Sync Terminal</Tag>
                        <ScrollFloat 
                            containerClassName="mt-8 mb-6"
                            textClassName="text-6xl font-black tracking-tighter uppercase text-black"
                        >
                            BRIDGE HUB
                        </ScrollFloat>
                        <p className="text-black/30 text-[10px] leading-relaxed uppercase tracking-[0.25em] font-black">
                            Align matrix for session persistence
                        </p>
                    </div>

                    <div className="space-y-6">
                        {isSignedIn || isConnected ? (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col gap-5 p-8 border border-black/[0.06] bg-white rounded-[2.5rem] shadow-2xl"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-[#00F2EA]/10 border border-[#00F2EA]/20 flex items-center justify-center shadow-inner">
                                        <CheckCircle size={24} className="text-[#00F2EA]" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <p className="text-black text-[15px] font-black tracking-tighter leading-none">
                                            Handshake Active
                                        </p>
                                        <p className="text-black/40 text-[9px] font-black uppercase tracking-[0.2em] mt-1">
                                            {address ? `${address.slice(0, 8)}...${address.slice(-6)}` : "VERIFIED_SOVEREIGN"}
                                        </p>
                                    </div>
                                </div>
                                <div className="h-[1px] w-full bg-black/[0.04]" />
                                <div className="flex items-center justify-center py-2 h-10 w-full overflow-hidden opacity-30">
                                     <Activity size={32} className="text-[#00F2EA] animate-pulse" />
                                </div>
                            </motion.div>
                        ) : (
                            <div className="grid gap-4">
                                <button
                                    onClick={() => openSignIn({ redirectUrl: '/' })}
                                    className="w-full py-7 bg-white border border-black/[0.08] text-black font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-4 rounded-full active:scale-95 transition-all shadow-xl"
                                >
                                    <Lock size={14} className="text-black/20"/>
                                    Access Identity
                                </button>
                                <button
                                    onClick={() => openWallet()}
                                    className="w-full py-7 bg-white border border-black/[0.08] text-black font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-4 rounded-full active:scale-95 transition-all shadow-xl"
                                >
                                    <Wallet size={14} className="text-black/20"/>
                                    Link Wallet
                                </button>
                            </div>
                        )}

                        <div className="flex items-center gap-6 py-12">
                            <div className="flex-1 h-[1px] bg-black/[0.06]" />
                            <span className="text-[10px] uppercase tracking-[0.4em] font-black text-black/10 whitespace-nowrap">Institutional Crypt</span>
                            <div className="flex-1 h-[1px] bg-black/[0.06]" />
                        </div>

                        {/* QR Sync UI */}
                        <div className="relative group">
                            <div className="absolute -inset-8 bg-[#00F2EA]/5 blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative p-10 border border-black/[0.08] rounded-[3.5rem] bg-white shadow-[0_40px_100px_rgba(0,0,0,0.08)] flex flex-col items-center">
                                <div className="p-5 bg-white border border-black/[0.04] rounded-3xl mb-10 shadow-xl">
                                    {qrSession ? (
                                        <QRCode value={qrUrl} size={220} bgColor="#FFFFFF" fgColor="#000000" level="M" />
                                    ) : (
                                        <div className="w-[220px] h-[220px] flex items-center justify-center">
                                            <Loader2 className="animate-spin text-black/10" size={40} />
                                        </div>
                                    )}
                                </div>
                                <p className="text-[11px] text-black/40 text-center uppercase tracking-[0.3em] font-black leading-relaxed max-w-[260px] mb-2">
                                    Awaiting cryptographically unique handshake from terminal registry.
                                </p>
                            </div>
                        </div>

                        <div className="pt-24 pb-12 flex flex-col items-center gap-6">
                            <WhaleLogo className="w-12 h-12 grayscale opacity-10" />
                            <div className="h-[1px] w-20 bg-black/5" />
                            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-black/10">
                                SYSTEM.SOVEREIGN.v3.4
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
