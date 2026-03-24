"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Shield, Smartphone, Lock, ChevronRight } from 'lucide-react';
import { useUIStore } from '@/lib/store/ui-store';
import { QRCodeSVG } from 'qrcode.react';

const QR_TTL = 300; // seconds before QR auto-refreshes (Matched to Redis EX 300)

export function LinkedGate({ children }: { children: React.ReactNode }) {
    const { isLinked, setLinked } = useUIStore();
    const [qrSession, setQrSession] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(QR_TTL);

    // ─── KEY FIX: ref always holds the current sessionId ──────────────────────
    // The polling interval closes over this ref so it never becomes stale,
    // even when `fetchNewSession` replaces `qrSession` state.
    const qrSessionRef = useRef<string | null>(null);
    // Guard: skip the timeLeft===QR_TTL refresh effect on first render
    const isFirstRender = useRef(true);

    // Keep ref in sync with state
    useEffect(() => {
        qrSessionRef.current = qrSession;
    }, [qrSession]);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // ─── Session creation ──────────────────────────────────────────────────────
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

    // Initial session fetch
    useEffect(() => {
        if (!isMounted || isLinked) return;
        fetchNewSession();
    }, [isMounted, isLinked, fetchNewSession]);

    // ─── Countdown + auto-refresh ──────────────────────────────────────────────
    useEffect(() => {
        if (isLinked || !qrSession) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    // Refresh QR — don't call inside setTimeLeft to avoid stale closure
                    return QR_TTL; // Reset visual first; fetchNewSession triggered below
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [qrSession, isLinked]);

    // Separate effect: trigger the network call when timeLeft hits QR_TTL
    // while it was already running (i.e. the countdown wrapped around)
    useEffect(() => {
        if (isLinked || !qrSession) return;
        if (timeLeft === QR_TTL) {
            // Skip the very first render — initial session is fetched by the other effect
            if (isFirstRender.current) {
                isFirstRender.current = false;
                return;
            }
            fetchNewSession();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft]);

    // ─── PC Polling for completion ─────────────────────────────────────────────
    // Runs once. Uses `qrSessionRef.current` to always read the LATEST token —
    // this is the core fix for the stale-closure bug.
    useEffect(() => {
        if (!isMounted || isLinked) return;

        const interval = setInterval(async () => {
            const currentToken = qrSessionRef.current;
            if (!currentToken) return;

            try {
                const res = await fetch(`/api/auth/qr-session?id=${currentToken}`);
                const data = await res.json();

                if (data.status === 'complete') {
                    clearInterval(interval);
                    setLinked(true);
                }
                // On 'expired' we do nothing — the 10-second QR refresh loop
                // will already have fetched a new session by then.
            } catch (e) {
                // Network errors are non-fatal; keep polling
            }
        }, 2000);

        return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMounted, isLinked, setLinked]);
    // Note: intentionally omitting `qrSession` from deps so this interval
    // runs for the entire gate lifetime and reads the ref for the current token.

    if (!isMounted) return null;
    if (isLinked) return <>{children}</>;

    return (
        <div className="fixed inset-0 z-[10000] bg-[var(--aztec-parchment)] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none" />
            
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
                
                <p className="text-sm font-aztec-mono font-medium text-[var(--aztec-ink)]/50 leading-relaxed mb-10 max-w-[280px]">
                    Establish a secure neural handshake with your mobile device to initialize the terminal.
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
                                    <QRCodeSVG 
                                        value={qrSession} 
                                        size={200} 
                                        level="H"
                                        bgColor="#FFFFFF"
                                        fgColor="#000000"
                                        includeMargin={false}
                                    />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="w-[200px] h-[200px] flex flex-col items-center justify-center animate-pulse"
                                >
                                    <QrCode className="text-black/10 mb-2" size={40} />
                                    <span className="text-[9px] font-aztec-mono text-black/20 uppercase tracking-widest">Generating Token...</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Expiration Progress Bar */}
                <div className="w-full h-1 bg-black/5 rounded-full mb-8 relative overflow-hidden">
                    <motion.div 
                        initial={{ width: "100%" }}
                        animate={{ width: "0%" }}
                        key={qrSession}
                        transition={{ duration: QR_TTL, ease: "linear" }}
                        className="absolute inset-y-0 left-0 bg-[var(--aztec-orchid)]"
                    />
                </div>

                <div className="space-y-6 w-full">
                    <div className="flex items-center justify-center gap-4 text-[10px] font-aztec-mono font-black text-[var(--aztec-ink)] uppercase tracking-[0.2em]">
                        <Smartphone size={16} className="text-[var(--aztec-orchid)]" />
                        Scan with Sovereign App ({timeLeft}S)
                    </div>
                    
                    <div className="pt-6 border-t border-black/5">
                        <p className="text-[9px] font-aztec-mono text-[var(--aztec-ink)]/30 uppercase tracking-[0.3em]">
                            End-to-End Encrypted Handshake
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
