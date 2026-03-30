"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Zap, QrCode, ChevronRight, Loader2, CheckCircle2, Wallet, Radio } from 'lucide-react';
import { useAccount, useConnect } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { useUIStore } from '@/lib/store/ui-store';
import { QRCodeSVG } from 'qrcode.react';

export function ConnectWalletModal() {
    const { isConnectModalOpen, closeConnectModal } = useUIStore();
    const { isConnected } = useAccount();
    const { connect, connectors } = useConnect();
    const { open: openAppKit } = useAppKit();
    const [view, setView] = useState<'selection' | 'qr' | 'ledger'>('selection');
    const [qrSession, setQrSession] = useState<string | null>(null);
    const [isPolling, setIsPolling] = useState(false);
    const [ledgerLoading, setLedgerLoading] = useState(false);

    useEffect(() => {
        if (isConnected && isConnectModalOpen) closeConnectModal();
    }, [isConnected, isConnectModalOpen, closeConnectModal]);

    useEffect(() => {
        if (!isConnectModalOpen) {
            setTimeout(() => {
                setView('selection');
                setQrSession(null);
                setIsPolling(false);
                setLedgerLoading(false);
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
                    window.location.reload();
                } else if (data.status === 'expired' || data.status === 'error') {
                    clearInterval(interval);
                    setQrSession(null);
                    setIsPolling(false);
                    setView('selection');
                }
            } catch (e) {}
        }, 2000);
        return () => clearInterval(interval);
    }, [isPolling, qrSession]);

    if (!isConnectModalOpen) return null;

    const handleAppKitConnect = () => openAppKit({ view: 'Connect' });

    const handleMetaMask = () => {
        if (typeof window !== 'undefined') {
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            const hasEthereum = typeof (window as any).ethereum !== 'undefined';
            if (isMobile && !hasEthereum) { openAppKit({ view: 'Connect' }); return; }
            const mmConnector = connectors.find(c =>
                c.id === 'metaMaskSDK' || c.id === 'io.metamask' || c.id === 'metaMask' || c.id === 'injected'
            );
            if (mmConnector) connect({ connector: mmConnector });
            else openAppKit({ view: 'Connect' });
        }
    };

    const handleMobileSync = async () => {
        setView('qr');
        try {
            setQrSession(null);
            const res = await fetch('/api/auth/qr-session', { method: 'POST' });
            const data = await res.json();
            if (data.sessionId) {
                setQrSession(data.sessionId);
                setIsPolling(true);
            }
        } catch (e) { setView('selection'); }
    };

    const handleLedger = async () => {
        setView('ledger');
        setLedgerLoading(true);
        // Open AppKit after brief animation
        setTimeout(() => {
            openAppKit({ view: 'Connect' });
            setLedgerLoading(false);
        }, 800);
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-4">
                {/* Dark Institutional Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={closeConnectModal}
                    className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
                />

                {/* Modal Panel */}
                <motion.div
                    initial={{ opacity: 0, y: 60, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 60, scale: 0.97 }}
                    transition={{ type: 'spring', damping: 30, stiffness: 350 }}
                    className="relative w-full sm:max-w-[480px] bg-[#0a0a0a] border border-white/[0.07] sm:rounded-[2rem] rounded-t-[2.5rem] overflow-hidden flex flex-col shadow-[0_0_80px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.05)]"
                    style={{ maxHeight: '92vh' }}
                >
                    {/* Ambient top glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[1px] bg-gradient-to-r from-transparent via-[#8B5CF6]/60 to-transparent" />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[80px] bg-[#8B5CF6]/10 blur-[40px] pointer-events-none" />

                    {/* Header Bar */}
                    <div className="flex items-center justify-between px-6 pt-7 pb-5 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center shadow-lg shadow-[#8B5CF6]/30">
                                <Shield size={15} className="text-white" />
                            </div>
                            <div>
                                <div className="text-[10px] font-mono font-bold text-[#8B5CF6] uppercase tracking-[0.2em]">Whale Alert Network</div>
                                <div className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Sovereign Terminal</div>
                            </div>
                        </div>
                        <button
                            onClick={closeConnectModal}
                            className="w-9 h-9 rounded-full border border-white/[0.08] bg-white/[0.03] flex items-center justify-center hover:bg-white/[0.08] hover:border-white/20 transition-all group"
                        >
                            <X size={15} className="text-white/40 group-hover:text-white/80 transition-colors" />
                        </button>
                    </div>

                    {/* Separator */}
                    <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent mx-6" />

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-6 pt-7 pb-8 relative z-10">
                        <AnimatePresence mode="wait">

                            {/* ── SELECTION VIEW ─────────────────────────────── */}
                            {view === 'selection' && (
                                <motion.div
                                    key="selection"
                                    initial={{ opacity: 0, x: -16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -16 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-8"
                                >
                                    {/* Title */}
                                    <div className="space-y-2">
                                        <h2 className="text-[28px] sm:text-[32px] font-black text-white leading-none tracking-tight">
                                            Initialize your{' '}
                                            <span className="bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] text-transparent bg-clip-text">
                                                Identity
                                            </span>
                                        </h2>
                                        <p className="text-[13px] text-white/40 leading-relaxed max-w-[320px]">
                                            Establish a cryptographic handshake with the institutional terminal. Choose your access method.
                                        </p>
                                    </div>

                                    {/* Options */}
                                    <div className="space-y-3">

                                        {/* PRIMARY — MetaMask */}
                                        <button
                                            onClick={handleMetaMask}
                                            className="group relative w-full rounded-2xl overflow-hidden transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] opacity-100" />
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -skew-x-12" />
                                            <div className="relative flex items-center justify-between p-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center border border-white/20">
                                                        <svg width="22" height="20" viewBox="0 0 35 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M32.958 1L19.444 10.857l2.476-5.872L32.958 1z" fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round"/>
                                                            <path d="M2.03 1l13.397 9.952-2.354-5.967L2.03 1z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                                                            <path d="M28.153 23.533l-3.594 5.504 7.69 2.116 2.21-7.497-6.306-.123zM1.554 23.656l2.197 7.497 7.688-2.116-3.591-5.504-6.294.123z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                                                            <path d="M11.013 14.395l-2.142 3.237 7.634.338-.267-8.204-5.225 4.629zM23.974 14.395l-5.296-4.724-.175 8.299 7.622-.338-2.151-3.237z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                                                            <path d="M11.439 29.037l4.59-2.24-3.963-3.09-.627 5.33zM18.958 26.797l4.602 2.24-.638-5.33-3.964 3.09z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                                                        </svg>
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="text-[9px] font-mono font-bold text-white/70 uppercase tracking-[0.2em] mb-0.5">Recommended</div>
                                                        <div className="text-[16px] font-black text-white tracking-tight">Connect MetaMask</div>
                                                        <div className="text-[10px] font-mono text-white/50 tracking-wide mt-0.5">Browser Extension · Mobile App</div>
                                                    </div>
                                                </div>
                                                <ChevronRight size={18} className="text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                            </div>
                                        </button>

                                        {/* SECONDARY — All Wallets / WalletConnect */}
                                        <button
                                            onClick={handleAppKitConnect}
                                            className="group w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.15] transition-all duration-200 active:scale-[0.99]"
                                        >
                                            <div className="flex items-center justify-between p-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center group-hover:border-[#3396FF]/40 group-hover:bg-[#3396FF]/10 transition-all">
                                                        <Wallet size={20} className="text-white/50 group-hover:text-[#3396FF] transition-colors" />
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="text-[9px] font-mono font-bold text-white/30 uppercase tracking-[0.2em] mb-0.5">All Networks</div>
                                                        <div className="text-[16px] font-black text-white tracking-tight">All Wallets</div>
                                                        <div className="text-[10px] font-mono text-white/30 tracking-wide mt-0.5">WalletConnect · 500+ Supported</div>
                                                    </div>
                                                </div>
                                                <ChevronRight size={18} className="text-white/20 group-hover:text-white/70 group-hover:translate-x-1 transition-all" />
                                            </div>
                                        </button>

                                        {/* TERTIARY — QR Mobile Sync */}
                                        <button
                                            onClick={handleMobileSync}
                                            className="group w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.15] transition-all duration-200 active:scale-[0.99]"
                                        >
                                            <div className="flex items-center justify-between p-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center group-hover:border-[#8B5CF6]/40 group-hover:bg-[#8B5CF6]/10 transition-all">
                                                        <QrCode size={20} className="text-white/50 group-hover:text-[#8B5CF6] transition-colors" />
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="text-[9px] font-mono font-bold text-white/30 uppercase tracking-[0.2em] mb-0.5">System Handshake</div>
                                                        <div className="text-[16px] font-black text-white tracking-tight">Scan PC Screen</div>
                                                        <div className="text-[10px] font-mono text-white/30 tracking-wide mt-0.5">Link your mobile identity</div>
                                                    </div>
                                                </div>
                                                <ChevronRight size={18} className="text-white/20 group-hover:text-white/70 group-hover:translate-x-1 transition-all" />
                                            </div>
                                        </button>

                                        {/* QUATERNARY — Whale Alert Ledger (fully functional) */}
                                        <button
                                            onClick={handleLedger}
                                            className="group w-full rounded-2xl border border-[#10B981]/20 bg-[#10B981]/[0.04] hover:bg-[#10B981]/[0.08] hover:border-[#10B981]/40 transition-all duration-200 active:scale-[0.99]"
                                        >
                                            <div className="flex items-center justify-between p-4 px-5">
                                                <div className="flex items-center gap-3.5">
                                                    <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center group-hover:bg-[#10B981]/20 transition-all">
                                                        <Radio size={16} className="text-[#10B981]" />
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="flex items-center gap-2">
                                                            <div className="text-[14px] font-black text-white tracking-tight">Whale Alert Ledger</div>
                                                            <div className="text-[8px] font-mono font-bold text-[#10B981] bg-[#10B981]/15 border border-[#10B981]/25 rounded-full px-2 py-0.5 uppercase tracking-wider">Live</div>
                                                        </div>
                                                        <div className="text-[10px] font-mono text-white/30 tracking-wide mt-0.5">Institutional on-chain ledger access</div>
                                                    </div>
                                                </div>
                                                <ChevronRight size={16} className="text-[#10B981]/30 group-hover:text-[#10B981] group-hover:translate-x-1 transition-all" />
                                            </div>
                                        </button>
                                    </div>

                                    {/* Footer disclaimer */}
                                    <p className="text-[10px] font-mono text-white/20 text-center leading-relaxed">
                                        By connecting you agree to our{' '}
                                        <span className="text-white/40 underline underline-offset-2 cursor-pointer hover:text-white/60 transition-colors">Terms</span>
                                        {' '}and{' '}
                                        <span className="text-white/40 underline underline-offset-2 cursor-pointer hover:text-white/60 transition-colors">Privacy Policy</span>.
                                        <br />No personal data is stored. Your keys, your identity.
                                    </p>
                                </motion.div>
                            )}

                            {/* ── QR VIEW ──────────────────────────────────── */}
                            {view === 'qr' && (
                                <motion.div
                                    key="qr"
                                    initial={{ opacity: 0, x: 16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 16 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex flex-col items-center py-4 space-y-8"
                                >
                                    <div className="text-center space-y-2">
                                        <h3 className="text-2xl font-black text-white tracking-tight">Awaiting Mobile Sync</h3>
                                        <p className="text-[12px] font-mono text-white/40 leading-relaxed max-w-[280px]">
                                            Open{' '}
                                            <span className="text-[#8B5CF6] font-bold">humanidfi.com</span>{' '}
                                            on your mobile and scan this sovereign token matrix
                                        </p>
                                    </div>

                                    {/* QR Frame */}
                                    <div className="relative">
                                        {/* Corner decorators */}
                                        <div className="absolute -top-3 -left-3 w-8 h-8 border-t-2 border-l-2 border-[#8B5CF6] rounded-tl-xl" />
                                        <div className="absolute -top-3 -right-3 w-8 h-8 border-t-2 border-r-2 border-[#8B5CF6] rounded-tr-xl" />
                                        <div className="absolute -bottom-3 -left-3 w-8 h-8 border-b-2 border-l-2 border-[#8B5CF6] rounded-bl-xl" />
                                        <div className="absolute -bottom-3 -right-3 w-8 h-8 border-b-2 border-r-2 border-[#8B5CF6] rounded-br-xl" />

                                        <div className="w-[220px] h-[220px] bg-white rounded-2xl flex items-center justify-center p-3 shadow-[0_0_40px_rgba(139,92,246,0.3)]">
                                            {qrSession ? (
                                                <QRCodeSVG
                                                    value={`SOVEREIGN_HANDSHAKE:${qrSession}`}
                                                    size={194}
                                                    level="H"
                                                    bgColor="#FFFFFF"
                                                    fgColor="#0a0a0a"
                                                    includeMargin={false}
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center gap-3 animate-pulse">
                                                    <Loader2 className="text-[#8B5CF6] animate-spin" size={32} />
                                                    <p className="text-[10px] font-mono text-black/40 uppercase tracking-widest">Generating Token...</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Pulse indicator */}
                                    {isPolling && (
                                        <div className="flex items-center gap-2">
                                            <div className="relative w-2 h-2">
                                                <div className="absolute inset-0 rounded-full bg-[#10B981] animate-ping opacity-75" />
                                                <div className="relative w-2 h-2 rounded-full bg-[#10B981]" />
                                            </div>
                                            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Listening for handshake...</span>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => setView('selection')}
                                        className="text-[11px] font-mono font-bold text-white/30 uppercase tracking-widest hover:text-white/70 transition-colors border-b border-transparent hover:border-white/30 pb-px"
                                    >
                                        ← Return to Selection
                                    </button>
                                </motion.div>
                            )}

                            {/* ── LEDGER VIEW ──────────────────────────────── */}
                            {view === 'ledger' && (
                                <motion.div
                                    key="ledger"
                                    initial={{ opacity: 0, scale: 0.96 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.96 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex flex-col items-center justify-center py-10 space-y-6"
                                >
                                    <div className="relative">
                                        <div className="w-20 h-20 rounded-[1.75rem] bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                                            {ledgerLoading ? (
                                                <Loader2 size={32} className="text-[#10B981] animate-spin" />
                                            ) : (
                                                <CheckCircle2 size={32} className="text-[#10B981]" />
                                            )}
                                        </div>
                                        <div className="absolute inset-0 rounded-[1.75rem] bg-[#10B981]/5 blur-xl animate-pulse" />
                                    </div>

                                    <div className="text-center space-y-2">
                                        <h3 className="text-xl font-black text-white tracking-tight">
                                            {ledgerLoading ? 'Initializing Ledger Access...' : 'Ledger Connection Ready'}
                                        </h3>
                                        <p className="text-[12px] font-mono text-white/40 max-w-[260px] leading-relaxed">
                                            {ledgerLoading
                                                ? 'Establishing institutional-grade on-chain session...'
                                                : 'Select your institutional wallet from the connection menu'}
                                        </p>
                                    </div>

                                    <div className="flex flex-col items-center gap-2 text-[10px] font-mono text-white/20 uppercase tracking-widest">
                                        <div className="flex items-center gap-2">
                                            <Zap size={10} className="text-[#10B981]" />
                                            <span>AES-GCM-256 Encrypted Session</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Shield size={10} className="text-[#8B5CF6]" />
                                            <span>PBKDF2-SHA256 · 210,000 Iterations</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setView('selection')}
                                        className="text-[11px] font-mono font-bold text-white/30 uppercase tracking-widest hover:text-white/70 transition-colors border-b border-transparent hover:border-white/30 pb-px"
                                    >
                                        ← Return to Selection
                                    </button>
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </div>

                    {/* Bottom ambient glow */}
                    <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-[#8B5CF6]/10 blur-[80px] pointer-events-none" />
                    <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-[#10B981]/5 blur-[80px] pointer-events-none" />
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
