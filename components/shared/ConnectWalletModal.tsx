"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Fingerprint, Smartphone, Mail, ChevronRight, QrCode } from 'lucide-react';
import { useAccount, useConnect } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { useUIStore } from '@/lib/store/ui-store';
import { QRCodeSVG } from 'qrcode.react';

export function ConnectWalletModal() {
    const { isConnectModalOpen, closeConnectModal } = useUIStore();
    const { isConnected } = useAccount();
    const { connect, connectors } = useConnect();
    const { open: openAppKit } = useAppKit();
    const [view, setView] = useState<'selection' | 'qr'>('selection');
    const [qrSession, setQrSession] = useState<string | null>(null);
    const [isPolling, setIsPolling] = useState(false);

    useEffect(() => {
        if (isConnected && isConnectModalOpen) {
            closeConnectModal();
        }
    }, [isConnected, isConnectModalOpen, closeConnectModal]);

    // Cleanup and resets when modal closes
    useEffect(() => {
        if (!isConnectModalOpen) {
            setTimeout(() => {
                setView('selection');
                setQrSession(null);
                setIsPolling(false);
            }, 300);
        }
    }, [isConnectModalOpen]);

    // QR Polling Logic
    useEffect(() => {
        if (!isPolling || !qrSession) return;
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/auth/qr-session?id=${qrSession}`);
                const data = await res.json();
                if (data.status === 'complete') {
                    clearInterval(interval);
                    window.location.reload(); // Hard reload to apply server-side session cookies
                } else if (data.status === 'expired' || data.status === 'error') {
                    clearInterval(interval);
                    setQrSession(null);
                    setIsPolling(false);
                    setView('selection');
                }
            } catch (e) {}
        }, 2000); // 2 second poll rate
        return () => clearInterval(interval);
    }, [isPolling, qrSession]);

    if (!isConnectModalOpen) return null;

    const handleSovereignLedger = () => openAppKit({ view: 'Connect' });

    const handleInstitutionalSync = () => {
        if (typeof window !== 'undefined') {
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            const hasEthereum = typeof (window as any).ethereum !== 'undefined';
            
            if (isMobile && !hasEthereum) {
                openAppKit({ view: 'Connect' });
                return;
            }

            const mmConnector = connectors.find(c => c.id === 'metaMaskSDK' || c.id === 'io.metamask' || c.id === 'metaMask' || c.id === 'injected');
            
            if (mmConnector) {
                connect({ connector: mmConnector });
            } else {
                openAppKit({ view: 'Connect' });
            }
        }
    };

    const handleMobileSync = async () => {
        setView('qr');
        try {
            // Institutional Pre-flight: Clear old session
            setQrSession(null);
            const res = await fetch('/api/auth/qr-session', { method: 'POST' });
            const data = await res.json();
            if (data.sessionId) {
                setQrSession(data.sessionId);
                setIsPolling(true);
            }
        } catch(e) {
            setView('selection');
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 sm:p-4">
                {/* Imperial Backdrop */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={closeConnectModal}
                    className="absolute inset-0 bg-[var(--aztec-parchment)]/80 backdrop-blur-xl"
                />

                {/* Sovereign Portal Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 30 }}
                    className="relative w-full max-w-[600px] bg-[var(--aztec-parchment)] sm:rounded-[4rem] shadow-[0_60px_120px_-20px_rgba(29,26,16,0.15)] border border-[var(--aztec-ink)]/5 overflow-hidden flex flex-col h-full sm:h-auto min-h-[600px] sm:min-h-0"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-8 sm:p-12 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-[var(--aztec-ink)] rounded-2xl flex items-center justify-center">
                                <Shield className="text-[var(--aztec-parchment)]" size={20} />
                            </div>
                        </div>
                        <button 
                            onClick={closeConnectModal}
                            className="w-12 h-12 rounded-full border border-[var(--aztec-ink)]/5 flex items-center justify-center hover:bg-[var(--aztec-ink)]/5 transition-all"
                        >
                            <X size={20} className="text-[var(--aztec-ink)]" />
                        </button>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 px-8 sm:px-12 pb-12 sm:pb-16 relative z-10 flex flex-col justify-center">
                        <AnimatePresence mode="wait">
                            {view === 'selection' ? (
                                <motion.div 
                                    key="selection"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-12"
                                >
                                    {/* Mission Statement */}
                                    <div className="space-y-4">
                                        <h3 className="text-3xl sm:text-5xl font-aztec-serif font-black text-[var(--aztec-ink)] tracking-tighter leading-none">
                                            Initialize your <span className="text-[var(--aztec-orchid)]">Identity</span>
                                        </h3>
                                        <p className="text-[12px] sm:text-sm font-medium text-[var(--aztec-ink)]/60 max-w-sm leading-relaxed">
                                            Establish a secure handshake with the Whale Alert Network. Choose your entrance to the institutional terminal.
                                        </p>
                                    </div>

                                    {/* Action Matrix */}
                                    <div className="grid grid-cols-1 gap-4">
                                        {/* PRIMARY: Institutional Sync (MetaMask) */}
                                        <button 
                                            onClick={handleInstitutionalSync}
                                            className="group relative w-full p-6 sm:p-8 bg-[var(--aztec-ink)] rounded-[2.5rem] flex items-center justify-between transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-[var(--aztec-ink)]/20 overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] duration-1000" />
                                            
                                            <div className="flex items-center gap-6 relative z-10">
                                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[1.5rem] bg-[var(--aztec-parchment)]/10 border border-white/5 flex items-center justify-center">
                                                    <Smartphone className="text-[var(--aztec-parchment)]" size={24} />
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-[10px] font-aztec-mono font-black text-[var(--aztec-chartreuse)] uppercase tracking-[0.2em] mb-1">Recommended</div>
                                                    <div className="text-lg sm:text-2xl font-aztec-serif font-black text-[var(--aztec-parchment)] uppercase tracking-tight">Connect MetaMask</div>
                                                    <div className="text-[10px] font-aztec-mono text-[var(--aztec-parchment)]/40 uppercase tracking-widest mt-1">Institutional Extension / Mobile App</div>
                                                </div>
                                            </div>
                                            <ChevronRight className="text-[var(--aztec-parchment)]/20 group-hover:text-[var(--aztec-parchment)] transition-colors relative z-10" size={24} />
                                        </button>

                                        {/* SECONDARY: Sovereign Mobile Sync (QR Code) */}
                                        <button 
                                            onClick={handleMobileSync}
                                            className="group w-full p-6 sm:p-8 bg-transparent border-2 border-[var(--aztec-orchid)]/30 rounded-[2.5rem] flex items-center justify-between transition-all hover:bg-[var(--aztec-orchid)]/5 active:scale-[0.98]"
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[1.5rem] bg-[var(--aztec-orchid)]/10 flex items-center justify-center group-hover:bg-[var(--aztec-orchid)] transition-colors">
                                                    <QrCode className="text-[var(--aztec-orchid)] group-hover:text-[var(--aztec-parchment)]" size={24} />
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-[10px] font-aztec-mono font-black text-[var(--aztec-orchid)] uppercase tracking-[0.2em] mb-1">System Handshake</div>
                                                    <div className="text-lg sm:text-2xl font-aztec-serif font-black text-[var(--aztec-ink)] uppercase tracking-tight">Scan PC Screen</div>
                                                    <div className="text-[10px] font-aztec-mono text-[var(--aztec-ink)]/40 uppercase tracking-widest mt-1">Link your mobile identity</div>
                                                </div>
                                            </div>
                                            <ChevronRight className="text-[var(--aztec-ink)]/20 group-hover:text-[var(--aztec-ink)] transition-colors" size={24} />
                                        </button>

                                        {/* TERTIARY: Social/Email Ledger (Secondary option now) */}
                                        <button 
                                            onClick={handleSovereignLedger}
                                            className="group w-full p-6 sm:p-5 bg-transparent border border-[var(--aztec-ink)]/10 rounded-3xl flex items-center justify-between transition-all hover:bg-[var(--aztec-ink)]/5 active:scale-[0.98]"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl border border-[var(--aztec-ink)]/10 flex items-center justify-center group-hover:bg-[var(--aztec-ink)] transition-colors">
                                                    <Mail className="text-[var(--aztec-ink)] group-hover:text-[var(--aztec-parchment)]" size={18} />
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-md font-aztec-serif font-black text-[var(--aztec-ink)] uppercase tracking-tight">Whale Alert Ledger</div>
                                                </div>
                                            </div>
                                            <Fingerprint className="text-[var(--aztec-ink)]/10 group-hover:text-[var(--aztec-ink)] transition-all group-hover:scale-110" size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="qr"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="flex flex-col items-center justify-center py-6"
                                >
                                    <div className="space-y-4 text-center mb-10 w-full">
                                        <h3 className="text-3xl font-aztec-serif font-black text-[var(--aztec-ink)] tracking-tighter">
                                            Awaiting Sync
                                        </h3>
                                        <p className="text-sm font-aztec-mono font-medium text-[var(--aztec-ink)]/60 px-8 mx-auto leading-relaxed">
                                            Open <strong className="text-[var(--aztec-orchid)]">www.humanidfi.com</strong> on your mobile device, initialize your identity, and point your sovereign scanner at this matrix.
                                        </p>
                                    </div>
                                    
                                    <div className="relative">
                                        {/* Scan Frame */}
                                        <div className="absolute -inset-6 border border-[var(--aztec-ink)]/10 rounded-[3rem] bg-white pointer-events-none shadow-2xl" />
                                        
                                        {/* QR Component */}
                                        <div className="relative z-10 w-[240px] h-[240px] flex items-center justify-center bg-white rounded-2xl overflow-hidden p-2">
                                            {qrSession ? (
                                                <QRCodeSVG 
                                                    value={qrSession} 
                                                    size={220} 
                                                    level="H"
                                                    bgColor="#FFFFFF"
                                                    fgColor="#000000"
                                                    includeMargin={false}
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center animate-pulse">
                                                    <QrCode className="text-[var(--aztec-ink)]/20 mb-2" size={40} />
                                                    <p className="text-[10px] font-aztec-mono text-[var(--aztec-ink)]/40 uppercase tracking-widest">Generating Token...</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={() => setView('selection')}
                                        className="mt-12 text-xs font-bold font-aztec-mono text-[var(--aztec-ink)]/50 uppercase tracking-widest hover:text-[var(--aztec-ink)] transition-colors border-b border-transparent hover:border-[var(--aztec-ink)] pb-1"
                                    >
                                        Return to Selection Matrix
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Sovereign Glow */}
                    <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-[var(--aztec-orchid)]/10 blur-[100px] pointer-events-none" />
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
