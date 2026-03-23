"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Shield, Smartphone, Lock, ChevronRight } from 'lucide-react';
import { useUIStore } from '@/lib/store/ui-store';
import { QRCodeSVG } from 'qrcode.react';

export function LinkedGate({ children }: { children: React.ReactNode }) {
    const { isLinked, setLinked } = useUIStore();
    const [qrSession, setQrSession] = useState<string | null>(null);
    const [isPolling, setIsPolling] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted || isLinked) return;

        const initSync = async () => {
            try {
                const res = await fetch('/api/auth/qr-session', { method: 'POST' });
                const data = await res.json();
                if (data.sessionId) {
                    setQrSession(data.sessionId);
                    setIsPolling(true);
                }
            } catch (e) {
                console.error("Failed to init gate session", e);
            }
        };

        initSync();
    }, [isMounted, isLinked]);

    useEffect(() => {
        if (!isPolling || !qrSession || isLinked) return;

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/auth/qr-session?id=${qrSession}`);
                const data = await res.json();
                if (data.status === 'complete') {
                    clearInterval(interval);
                    setLinked(true);
                    // No need for reload if we just update the store
                }
            } catch (e) {}
        }, 2000);

        return () => clearInterval(interval);
    }, [isPolling, qrSession, isLinked, setLinked]);

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

                <div className="relative p-6 bg-white border border-black/5 rounded-[2.5rem] shadow-inner mb-10 group">
                    <div className="absolute -inset-1 bg-gradient-to-tr from-[var(--aztec-orchid)] to-[var(--aztec-chartreuse)] rounded-[2.6rem] opacity-20 blur-sm group-hover:opacity-40 transition-opacity" />
                    <div className="relative bg-white p-4 rounded-3xl">
                        {qrSession ? (
                            <QRCodeSVG 
                                value={qrSession} 
                                size={200} 
                                level="H"
                                bgColor="#FFFFFF"
                                fgColor="#000000"
                                includeMargin={false}
                            />
                        ) : (
                            <div className="w-[200px] h-[200px] flex flex-col items-center justify-center animate-pulse">
                                <QrCode className="text-black/10 mb-2" size={40} />
                                <span className="text-[9px] font-aztec-mono text-black/20 uppercase tracking-widest">Generating Token...</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6 w-full">
                    <div className="flex items-center justify-center gap-4 text-[10px] font-aztec-mono font-black text-[var(--aztec-ink)] uppercase tracking-[0.2em]">
                        <Smartphone size={16} className="text-[var(--aztec-orchid)]" />
                        Scan with Sovereign App
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
