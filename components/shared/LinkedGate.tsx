"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  QrCode, 
  Shield, 
  Smartphone, 
  Wallet, 
  Lock, 
  ChevronRight, 
  Fingerprint,
  Zap,
  Activity,
  UserCheck,
  RefreshCw,
  Cpu,
  Globe
} from 'lucide-react';
import { useUIStore } from '@/lib/store/ui-store';
import { QRCodeSVG } from 'qrcode.react';
import { useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';

const QR_TTL = 300; // 5 minute precision

// ─── LEGENDARY NOISE OVERLAY ───────────────────────────────────────────────
const GrainyOverlay = () => (
  <div className="absolute inset-0 pointer-events-none opacity-[0.03] animate-pulse" style={{
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
  }} />
);

export function LinkedGate({ children }: { children: React.ReactNode }) {
    const { isLinked, setLinked } = useUIStore();
    const { isConnected: isWalletConnected } = useAccount();
    const { open: openWalletModal } = useAppKit();
    
    const [qrSession, setQrSession] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(QR_TTL);
    const [syncStatus, setSyncStatus] = useState<'IDLE' | 'AWAITING_SCAN' | 'AWAITING_SIGNATURE' | 'SYNCED'>('IDLE');

    const qrSessionRef = useRef<string | null>(null);

    useEffect(() => { qrSessionRef.current = qrSession; }, [qrSession]);
    
    useEffect(() => { 
        setIsMounted(true); 
        if (typeof document !== 'undefined') {
            const hasProtocolHandshake = document.cookie.split('; ').some(row => row.startsWith('sovereign_handshake=0x'));
            if (hasProtocolHandshake && !isLinked) setLinked(true);
        }
    }, [isLinked, setLinked]);

    // AUTO-UNLOCK SENSORY
    useEffect(() => {
        if (isWalletConnected && !isLinked) setLinked(true);
    }, [isWalletConnected, isLinked, setLinked]);

    const fetchNewSession = useCallback(async () => {
        try {
            setSyncStatus('AWAITING_SCAN');
            const res = await fetch('/api/auth/qr-session', { method: 'POST' });
            const data = await res.json();
            if (data.sessionId) {
                setQrSession(data.sessionId);
                setTimeLeft(QR_TTL);
            }
        } catch (e) {
            console.error('[LinkedGate] Failed to initiate Handshake Session', e);
        }
    }, []);

    useEffect(() => {
        if (!isMounted || isLinked || isWalletConnected) return;
        fetchNewSession();
    }, [isMounted, isLinked, isWalletConnected, fetchNewSession]);

    // TIMER LOGIC
    useEffect(() => {
        if (isLinked || !qrSession) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
        }, 1000);
        return () => clearInterval(timer);
    }, [qrSession, isLinked]);

    useEffect(() => {
        if (timeLeft === 0 && !isLinked) fetchNewSession();
    }, [timeLeft, isLinked, fetchNewSession]);

    // REAL-TIME SYNC POLLING
    useEffect(() => {
        if (!isMounted || isLinked) return;
        const interval = setInterval(async () => {
            const token = qrSessionRef.current;
            if (!token) return;
            try {
                const res = await fetch(`/api/auth/qr-session?id=${token}`);
                const data = await res.json();
                if (data.status === 'complete') {
                    setSyncStatus('SYNCED');
                    setTimeout(() => setLinked(true), 1200);
                }
            } catch (_) {}
        }, 2000);
        return () => clearInterval(interval);
    }, [isMounted, isLinked, setLinked]);

    if (!isMounted) return null;
    if (isLinked || isWalletConnected) return <>{children}</>;

    return (
        <div className="fixed inset-0 z-[10000] bg-[#FAF9F6] flex items-center justify-center p-8 selection:bg-black selection:text-white font-sans">
            <GrainyOverlay />
            
            {/* GRID BACKGROUND */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
                backgroundImage: `radial-gradient(circle, #000 1.2px, transparent 1.2px)`,
                backgroundSize: '48px 48px'
            }} />

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center z-10"
            >
                {/* LEFT CONTEXT: BRANDING & IDENTITY */}
                <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-16">
                    <div className="flex flex-col items-center lg:items-start gap-10">
                        <motion.div 
                            className="w-20 h-20 p-2 bg-white rounded-[1.5rem] shadow-[0_15px_30px_rgba(0,0,0,0.05)] border border-black/5"
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <img src="/official-whale-monochrome.png" className="w-full h-full object-contain" alt="Whale" />
                        </motion.div>
                        
                        <div className="space-y-4">
                            <h1 className="text-8xl font-black tracking-[-0.08em] text-[#050505] leading-[0.8]">
                                GATEWAY<br/><span className="italic">LOCKED</span>
                            </h1>
                            <p className="text-[14px] font-bold text-[#050505]/30 max-w-[380px] leading-relaxed uppercase tracking-[0.08em]">
                                Acceso restringido. Por favor, autentica tu identidad criptográfica mediante el handshake móvil.
                            </p>
                        </div>
                    </div>

                    <div className="w-full max-w-sm space-y-5">
                        <button
                            onClick={() => openWalletModal()}
                            className="group w-full h-24 bg-[#050505] text-white rounded-[2.5rem] flex items-center justify-between px-10 relative overflow-hidden active:scale-[0.98] transition-all shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)]"
                        >
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex items-center gap-6 relative z-10">
                                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/5">
                                    <Wallet size={20} className="text-white/60" />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-1">Legacy Path</p>
                                    <p className="text-sm font-black uppercase tracking-[0.15em]">Conectar Wallet PC</p>
                                </div>
                            </div>
                            <ChevronRight size={22} className="text-white/20 group-hover:translate-x-2 transition-transform" />
                        </button>

                        <div className="flex items-center gap-6 px-10 opacity-20">
                            <div className="h-px flex-1 bg-black" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] leading-none">OR HANDSHAKE</span>
                            <div className="h-px flex-1 bg-black" />
                        </div>

                        <div className="p-8 bg-black/[0.02] border border-black/5 rounded-[3rem] flex items-start gap-6 backdrop-blur-sm">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0 animate-pulse">
                                <Smartphone size={20} className="text-indigo-600" />
                            </div>
                            <div className="text-left space-y-2">
                                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#050505]/80">Acceso Sovereign App</p>
                                <p className="text-[12px] font-medium text-[#050505]/40 leading-relaxed uppercase tracking-widest">
                                    Autenticación asimétrica de 256 bits sin conexión local.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL: CRYPTO SHIELD (QR) */}
                <div className="relative flex flex-col items-center">
                    <div className="relative p-16 bg-white rounded-[5rem] shadow-[0_120px_240px_-60px_rgba(0,0,0,0.15)] border border-black/[0.04] group transition-all duration-1000 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#050505]/[0.03] to-transparent" />
                        
                        {/* DECORATIVE CORNER CROSSHAIRS */}
                        <div className="absolute top-12 left-12 w-16 h-16 border-t-4 border-l-4 border-black/[0.05] rounded-tl-3xl" />
                        <div className="absolute top-12 right-12 w-16 h-16 border-t-4 border-r-4 border-black/[0.05] rounded-tr-3xl" />
                        <div className="absolute bottom-12 left-12 w-16 h-16 border-b-4 border-l-4 border-black/[0.05] rounded-bl-3xl" />
                        <div className="absolute bottom-12 right-12 w-16 h-16 border-b-4 border-r-4 border-black/[0.05] rounded-br-3xl" />

                        <div className="relative z-10 w-[280px] h-[280px] flex items-center justify-center">
                            <AnimatePresence mode="wait">
                                {qrSession && syncStatus !== 'SYNCED' ? (
                                    <motion.div
                                        key={qrSession}
                                        initial={{ opacity: 0, filter: 'blur(10px)', scale: 0.9 }}
                                        animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
                                        exit={{ opacity: 0, filter: 'blur(10px)', scale: 1.1 }}
                                        transition={{ duration: 0.8 }}
                                        className="relative p-6 bg-white rounded-[2.5rem] shadow-inner"
                                    >
                                        <QRCodeSVG 
                                            value={`SOVEREIGN_HANDSHAKE:${qrSession}`} 
                                            size={232} 
                                            level="H" 
                                            bgColor="transparent" 
                                            fgColor="#050505" 
                                            includeMargin={false}
                                            imageSettings={{
                                                src: "/official-whale-monochrome.png",
                                                x: undefined, y: undefined,
                                                height: 48, width: 48,
                                                excavate: true,
                                            }}
                                        />
                                        
                                        {/* SCALING OPTICAL LINE */}
                                        <motion.div 
                                            className="absolute inset-x-0 h-1 bg-black/[0.08] blur-[2px] z-50 pointer-events-none"
                                            animate={{ top: ["10%", "90%", "10%"] }}
                                            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                                        />
                                    </motion.div>
                                ) : syncStatus === 'SYNCED' ? (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                        className="flex flex-col items-center gap-6 text-green-600"
                                    >
                                        <div className="w-28 h-28 rounded-full bg-green-500/10 flex items-center justify-center border-4 border-green-500/20">
                                            <UserCheck size={56} className="text-green-600" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[12px] font-black uppercase tracking-[0.5em] text-green-600/60 mb-2">Authenticated</p>
                                            <p className="text-[20px] font-black uppercase tracking-tighter text-green-800">Cargando...</p>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="flex flex-col items-center gap-6">
                                        <RefreshCw size={56} className="text-black/5 animate-spin" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-black/20">Securing Session...</span>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* DYNAMIC TELEMETRY FOOTER */}
                    <div className="mt-12 flex flex-col items-center space-y-6">
                        <div className="flex items-center gap-10 text-[9px] font-black uppercase tracking-[0.3em] text-[#050505]/40 opacity-80">
                            <div className="flex items-center gap-3">
                                <Cpu size={14} className="text-black" />
                                <span>SSL Encrypted</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Globe size={14} className="text-black" />
                                <span>Refresco {timeLeft}s</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="h-px w-12 bg-black/10" />
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full border-4 border-[#FAF9F6] bg-black/[0.03] flex items-center justify-center overflow-hidden grayscale text-[10px] font-bold opacity-30">
                                        {i === 5 ? '+14k' : <Fingerprint size={14} />}
                                    </div>
                                ))}
                            </div>
                            <div className="h-px w-12 bg-black/10" />
                        </div>
                        
                        <p className="text-[10px] font-black text-[#050505]/10 uppercase tracking-[0.6em]">
                            INSTITUTIONAL GRADE V4
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* STATIC HUD DECORATIONS */}
            <div className="fixed top-12 left-12 flex items-center gap-6 pointer-events-none opacity-20">
                <div className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Handshake Protocol Active</span>
            </div>
        </div>
    );
}
