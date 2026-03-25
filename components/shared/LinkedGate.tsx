"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Shield, Smartphone, Wallet } from 'lucide-react';
import { useUIStore } from '@/lib/store/ui-store';
import { QRCodeSVG } from 'qrcode.react';
import { useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';

const QR_TTL = 300; // seconds before QR auto-refreshes

export function LinkedGate({ children }: { children: React.ReactNode }) {
    const { isLinked, setLinked } = useUIStore();
    const { isConnected: isWalletConnected } = useAccount();
    const { open: openWalletModal } = useAppKit();
    const [qrSession, setQrSession] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(QR_TTL);

    const qrSessionRef = useRef<string | null>(null);
    const isFirstRender = useRef(true);

    useEffect(() => { qrSessionRef.current = qrSession; }, [qrSession]);
    useEffect(() => { setIsMounted(true); }, []);

    // ─── CRITICAL FIX: Auto-unlock when EVM wallet connected ──────────────────
    useEffect(() => {
        if (isWalletConnected && !isLinked) {
            setLinked(true);
        }
    }, [isWalletConnected, isLinked, setLinked]);

    const fetchNewSession = useCallback(async () => {
        try {
            const res = await fetch('/api/auth/qr-session', { method: 'POST' });
            const data = await res.json();
            if (data.sessionId) {
                setQrSession(data.sessionId);
                setTimeLeft(QR_TTL);
            }
        } catch (e) {
            console.error('[LinkedGate] Failed to create QR session', e);
        }
    }, []);

    useEffect(() => {
        if (!isMounted || isLinked || isWalletConnected) return;
        fetchNewSession();
    }, [isMounted, isLinked, isWalletConnected, fetchNewSession]);

    useEffect(() => {
        if (isLinked || !qrSession) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev <= 1 ? QR_TTL : prev - 1));
        }, 1000);
        return () => clearInterval(timer);
    }, [qrSession, isLinked]);

    useEffect(() => {
        if (isLinked || !qrSession || timeLeft !== QR_TTL) return;
        if (isFirstRender.current) { isFirstRender.current = false; return; }
        fetchNewSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft]);

    useEffect(() => {
        if (!isMounted || isLinked) return;
        const interval = setInterval(async () => {
            const token = qrSessionRef.current;
            if (!token) return;
            try {
                const res = await fetch(`/api/auth/qr-session?id=${token}`);
                const data = await res.json();
                if (data.status === 'complete') {
                    clearInterval(interval);
                    setLinked(true);
                }
            } catch (_) {}
        }, 2000);
        return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMounted, isLinked, setLinked]);

    if (!isMounted) return null;
    // Unlock if wallet connected OR QR scan completed
    if (isLinked || isWalletConnected) return <>{children}</>;

    return (
        <div className="fixed inset-0 z-[10000] bg-[var(--aztec-parchment)] flex items-center justify-center p-4">
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-noise" />
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-white rounded-[3rem] p-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] border border-black/5 flex flex-col items-center text-center relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--aztec-orchid)]/10 blur-[60px] rounded-full pointer-events-none" />

                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-8 shadow-xl">
                    <Shield className="text-[var(--aztec-chartreuse)]" size={32} />
                </div>

                <h2 className="text-4xl font-aztec-serif font-black text-[var(--aztec-ink)] tracking-tighter mb-4 uppercase">
                    System <span className="text-[var(--aztec-orchid)]">Locked</span>
                </h2>

                {/* PRIMARY UNLOCK: Connect Wallet */}
                <button
                    onClick={() => openWalletModal()}
                    className="w-full mb-8 py-5 px-8 bg-[var(--aztec-ink)] text-white rounded-2xl font-aztec-mono text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-[var(--aztec-chartreuse)] hover:text-black transition-all duration-300 shadow-xl active:scale-95"
                >
                    <Wallet size={18} />
                    Connect Wallet to Unlock
                </button>

                <div className="flex items-center gap-4 w-full mb-6">
                    <div className="flex-1 h-px bg-black/10" />
                    <span className="text-[9px] font-aztec-mono text-black/30 uppercase tracking-widest">or scan QR</span>
                    <div className="flex-1 h-px bg-black/10" />
                </div>

                <p className="text-xs font-aztec-mono font-medium text-[var(--aztec-ink)]/40 leading-relaxed mb-6 max-w-[260px]">
                    Scan with your sovereign mobile app for a secure handshake.
                </p>

                <div className="relative p-6 bg-white border border-black/5 rounded-[2.5rem] shadow-inner mb-6 group overflow-hidden">
                    <div className="absolute -inset-1 bg-gradient-to-tr from-[var(--aztec-orchid)] to-[var(--aztec-chartreuse)] rounded-[2.6rem] opacity-20 blur-sm group-hover:opacity-40 transition-opacity" />
                    <div className="relative bg-white p-4 rounded-3xl">
                        <AnimatePresence mode="wait">
                            {qrSession ? (
                                <motion.div
                                    key={qrSession}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <QRCodeSVG value={`SOVEREIGN_HANDSHAKE:${qrSession}`} size={180} level="H" bgColor="#FFFFFF" fgColor="#000000" includeMargin={false} />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="w-[180px] h-[180px] flex flex-col items-center justify-center animate-pulse"
                                >
                                    <QrCode className="text-black/10 mb-2" size={40} />
                                    <span className="text-[9px] font-aztec-mono text-black/20 uppercase tracking-widest">Generating...</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="w-full h-1 bg-black/5 rounded-full mb-4 relative overflow-hidden">
                    <motion.div
                        initial={{ width: "100%" }}
                        animate={{ width: "0%" }}
                        key={qrSession}
                        transition={{ duration: QR_TTL, ease: "linear" }}
                        className="absolute inset-y-0 left-0 bg-[var(--aztec-orchid)]"
                    />
                </div>

                <div className="flex items-center justify-center gap-3 text-[9px] font-aztec-mono font-black text-[var(--aztec-ink)]/30 uppercase tracking-[0.2em]">
                    <Smartphone size={12} className="text-[var(--aztec-orchid)]" />
                    Scan with Sovereign App ({timeLeft}s)
                </div>
            </motion.div>
        </div>
    );
}
