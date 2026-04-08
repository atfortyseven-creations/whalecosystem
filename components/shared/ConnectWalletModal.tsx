"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Zap, QrCode, ChevronRight, Loader2, CheckCircle2, Wallet, Radio, Terminal } from 'lucide-react';
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
        setTimeout(() => {
            openAppKit({ view: 'Connect' });
            setLedgerLoading(false);
        }, 800);
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4 font-mono">
                {/* Harsh Black Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={closeConnectModal}
                    className="absolute inset-0 bg-[#000000]/90 backdrop-blur-sm"
                />

                {/* Modal Console */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                    className="relative w-full sm:max-w-[500px] bg-[#050505] border-2 border-[#00FF55] overflow-hidden flex flex-col shadow-[0_0_40px_rgba(0,255,85,0.1)]"
                >
                    {/* Header Bar */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-[#00FF55]/30 bg-[#00FF55]/5">
                        <div className="flex items-center gap-3">
                            <Terminal size={18} className="text-[#00FF55]" />
                            <div>
                                <div className="text-[10px] font-black text-[#00FF55] uppercase tracking-[0.2em] leading-none">CONNECT WALLET</div>
                                <div className="text-[8px] font-black text-[#888888] uppercase tracking-widest mt-1">SECURE PORTAL</div>
                            </div>
                        </div>
                        <button onClick={closeConnectModal} className="text-[#00FF55] hover:text-white hover:bg-[#00FF55] transition-colors p-1">
                            <X size={16} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-8 relative">
                        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `linear-gradient(#00FF55 1px, transparent 1px), linear-gradient(90deg, #00FF55 1px, transparent 1px)`, backgroundSize: '10px 10px' }} />

                        <AnimatePresence mode="wait">
                            {/* ── SELECTION VIEW ── */}
                            {view === 'selection' && (
                                <motion.div key="selection" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 relative z-10">
                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-black text-[#FFFFFF] uppercase tracking-tighter">
                                            CONNECT
                                        </h2>
                                        <p className="text-[10px] text-[#888888] uppercase tracking-widest leading-relaxed">
                                            Select a provider to connect your wallet directly.
                                        </p>
                                    </div>

                                    <div className="space-y-3 pt-4">
                                        {/* INJECTED PROVIDER */}
                                        <button onClick={handleMetaMask} className="group w-full flex items-center justify-between p-4 border border-[#333333] hover:border-[#00FF55] bg-[#000000] transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="text-[#00FF55] font-black text-[12px] uppercase">
                                                    [01]
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-[14px] font-black text-[#FFFFFF] uppercase tracking-wide">Injected Provider</div>
                                                    <div className="text-[9px] text-[#888888] uppercase tracking-[0.2em] mt-0.5">MetaMask / Browser Native</div>
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className="text-[#333333] group-hover:text-[#00FF55]" />
                                        </button>

                                        {/* WALLET_CONNECT */}
                                        <button onClick={handleAppKitConnect} className="group w-full flex items-center justify-between p-4 border border-[#333333] hover:border-[#00FF55] bg-[#000000] transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="text-[#00FF55] font-black text-[12px] uppercase">
                                                    [02]
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-[14px] font-black text-[#FFFFFF] uppercase tracking-wide">WalletConnect</div>
                                                    <div className="text-[9px] text-[#888888] uppercase tracking-[0.2em] mt-0.5">Mobile Wallets</div>
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className="text-[#333333] group-hover:text-[#00FF55]" />
                                        </button>

                                        {/* HARDWARE LEDGER */}
                                        <button onClick={handleLedger} className="group w-full flex items-center justify-between p-4 border border-[#333333] hover:border-[#00FF55] bg-[#000000] transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="text-[#00FF55] font-black text-[12px] uppercase">
                                                    [03]
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-[14px] font-black text-[#FFFFFF] uppercase tracking-wide">Hardware Wallet</div>
                                                    <div className="text-[9px] text-[#888888] uppercase tracking-[0.2em] mt-0.5">Ledger Support</div>
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className="text-[#333333] group-hover:text-[#00FF55]" />
                                        </button>

                                        {/* QR MOBILE BRIDGE */}
                                        <button onClick={handleMobileSync} className="group w-full flex items-center justify-between p-4 border border-[#00FF55] bg-[#00FF55]/5 hover:bg-[#00FF55]/20 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="text-[#00FF55] font-black text-[12px] uppercase animate-pulse">
                                                    [04]
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-[14px] font-black text-[#FFFFFF] uppercase tracking-wide">Mobile QR Sync</div>
                                                    <div className="text-[9px] text-[#00FF55] uppercase tracking-[0.2em] mt-0.5">Scan to connect mobile</div>
                                                </div>
                                            </div>
                                            <QrCode size={16} className="text-[#00FF55]" />
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* ── QR VIEW ── */}
                            {view === 'qr' && (
                                <motion.div key="qr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center py-2 space-y-8 relative z-10">
                                    <div className="text-center space-y-2">
                                        <h3 className="text-2xl font-black text-[#FFFFFF] tracking-widest uppercase">SCAN TO CONNECT</h3>
                                        <p className="text-[10px] text-[#888888] leading-relaxed max-w-[280px] uppercase tracking-widest">
                                            Scan this QR code with the designated mobile application.
                                        </p>
                                    </div>

                                    {/* QR Frame - HUD Tactical */}
                                    <div className="relative p-2">
                                        {/* Corner decorators */}
                                        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#00FF55]" />
                                        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#00FF55]" />
                                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#00FF55]" />
                                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#00FF55]" />

                                        <div className="w-[220px] h-[220px] bg-white flex items-center justify-center p-3">
                                            {qrSession ? (
                                                <QRCodeSVG value={`WHALE_HANDSHAKE:${qrSession}`} size={194} level="H" bgColor="#FFFFFF" fgColor="#000000" includeMargin={false} />
                                            ) : (
                                                <div className="flex flex-col items-center gap-3">
                                                    <Loader2 className="text-[#000000] animate-spin" size={32} />
                                                    <p className="text-[10px] text-black font-black uppercase tracking-widest">GENERATING...</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Console Log */}
                                    {isPolling && (
                                        <div className="w-full bg-[#000000] border border-[#222222] p-3">
                                            <p className="text-[9px] text-[#00FF55] uppercase tracking-widest flex items-center gap-2">
                                                WAITING FOR CONNECTION...
                                            </p>
                                        </div>
                                    )}

                                    <button onClick={() => setView('selection')} className="text-[10px] font-black text-[#888888] uppercase tracking-[0.2em] hover:text-[#00FF55] transition-colors">
                                        CANCEL
                                    </button>
                                </motion.div>
                            )}

                            {/* ── LEDGER VIEW ── */}
                            {view === 'ledger' && (
                                <motion.div key="ledger" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-6 space-y-6 relative z-10">
                                    <div className="w-16 h-16 border-2 border-[#00FF55] bg-[#00FF55]/10 flex items-center justify-center">
                                        {ledgerLoading ? <Loader2 size={24} className="text-[#00FF55] animate-spin" /> : <CheckCircle2 size={24} className="text-[#00FF55]" />}
                                    </div>

                                    <div className="text-center space-y-2">
                                        <h3 className="text-xl font-black text-[#FFFFFF] tracking-widest uppercase">
                                            {ledgerLoading ? 'CONNECTING...' : 'DEVICE READY'}
                                        </h3>
                                    </div>

                                    <div className="w-full bg-[#000000] border border-[#222222] p-4 flex flex-col gap-2 text-[9px] text-[#888888] uppercase tracking-[0.2em]">
                                        <div className="flex items-center gap-2"><Zap size={10} className="text-[#00FF55]" /><span>Secure Connection</span></div>
                                        <div className="flex items-center gap-2"><Shield size={10} className="text-[#00FF55]" /><span>Hardware Protected</span></div>
                                    </div>

                                    <button onClick={() => setView('selection')} className="text-[10px] font-black text-[#888888] uppercase tracking-[0.2em] hover:text-[#00FF55] transition-colors mt-4">
                                        GO BACK
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
