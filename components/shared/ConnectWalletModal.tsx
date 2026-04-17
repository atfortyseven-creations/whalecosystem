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

    // ─── [TRIPLE BLINDAJE] ───
    // Nivel 1: Escucha de Eventos Globales (vía WalletConnectionBridge + SSE)
    useEffect(() => {
        const handleAuthSuccess = () => {
             console.log('[ConnectModal] 10000% Success Signal Received!');
             setView('selection');
             closeConnectModal();
             // Direct navigation to news hub after successful handshake
             window.location.href = '/news';
        };
        window.addEventListener('sovereign:auth_success', handleAuthSuccess);
        return () => window.removeEventListener('sovereign:auth_success', handleAuthSuccess);
    }, [closeConnectModal]);

    // Nivel 2: Polling de Seguridad (Respaldo Institucional)
    useEffect(() => {
        if (!isPolling || !qrSession) return;
        // Downgraded to 1.5s as it's now just a fallback for the instant SSE bridge
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/auth/qr-session?id=${qrSession}`);
                const data = await res.json();
                if (data.status === 'complete') {
                    clearInterval(interval);
                    window.location.href = '/news';
                } else if (data.status === 'expired' || data.status === 'error') {
                    clearInterval(interval);
                    setQrSession(null);
                    setIsPolling(false);
                    setView('selection');
                }
            } catch (e) {}
        }, 1500);
        return () => clearInterval(interval);
    }, [isPolling, qrSession]);

    if (!isConnectModalOpen) return null;

    const handleAppKitConnect = () => openAppKit({ view: 'Connect' });

    // \u2500\u2500 Smart connector detector \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
    // Priority: exact SDK ID > injected window.ethereum > AppKit fallback
    const connectViaExtension = (ids: string[]) => {
        if (typeof window === 'undefined') return;
        const hasEthereum = typeof (window as any).ethereum !== 'undefined';
        const found = connectors.find(c => ids.includes(c.id));
        if (found) { connect({ connector: found }); return; }
        // Try injected if window.ethereum exists (extension active in this tab)
        if (hasEthereum) {
            const injected = connectors.find(c => c.id === 'injected');
            if (injected) { connect({ connector: injected }); return; }
        }
        // Nothing found locally — fall back to AppKit (QR/WalletConnect flow)
        openAppKit({ view: 'Connect' });
    };

    const handleMetaMask = () => connectViaExtension(['io.metamask', 'metaMaskSDK', 'metaMask']);
    const handleCoinbase = () => connectViaExtension(['coinbaseWalletSDK', 'coinbaseWallet']);
    const handleRainbow  = () => connectViaExtension(['rainbow', 'me.rainbow']);

    const handleMobileSync = async () => {
        setView('qr');
        try {
            setQrSession(null);
            const res = await fetch('/api/auth/qr-session', { method: 'POST' });
            const data = await res.json();
            if (data.sessionId) {
                setQrSession(data.sessionId);
                // Persist for WalletConnectionBridge/SSE verification
                sessionStorage.setItem('pending_qr_session', data.sessionId);
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
            {isConnectModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 font-sans">
                {/* Clean Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={closeConnectModal}
                    className="absolute inset-0 bg-[#050505]/40 backdrop-blur-md"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 15 }}
                    className="relative w-full sm:max-w-[440px] max-h-[92dvh] bg-[#FFFFFF] border border-[#050505]/10 rounded-[24px] overflow-hidden flex flex-col shadow-2xl"
                >
                    {/* Header Bar */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-[#050505]/10 bg-[#FAF9F6]">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full border border-[#050505]/10 flex items-center justify-center bg-white shadow-sm">
                                <Shield size={14} className="text-[#050505]" />
                            </div>
                            <div>
                                <div className="text-[12px] font-black text-[#050505] uppercase tracking-widest leading-none">Cryptographic Vault</div>
                                <div className="text-[9px] font-mono text-black/50 uppercase tracking-widest mt-1">Sovereign Connection Portal</div>
                            </div>
                        </div>
                        <button onClick={closeConnectModal} className="text-black/40 hover:text-black hover:bg-black/5 transition-colors p-2 rounded-full">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Content — scrollable interior so header/footer stay fixed */}
                    <div className="px-4 py-4 sm:px-6 sm:py-6 relative overflow-y-auto flex-1">

                        <AnimatePresence mode="wait">
                            {/* ── SELECTION VIEW ── */}
                            {view === 'selection' && (
                                <motion.div key="selection" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 relative z-10">
                                    <div className="space-y-0.5 text-center px-2">
                                        <h2 className="text-[18px] sm:text-[22px] font-black text-[#050505] uppercase tracking-tighter">
                                            Select Provider
                                        </h2>
                                        <p className="text-[10px] sm:text-[11px] text-black/60 font-sans leading-relaxed">
                                            Connect your wallet to access institutional tools and on-chain intelligence.
                                        </p>
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        {/* QUICK ACCESS GRID — 3 cols on mobile, compact */}
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { id: 'metamask', name: 'MetaMask', logo: '/wallets/metamask.svg', handler: handleMetaMask },
                                                { id: 'coinbase', name: 'Coinbase', logo: '/wallets/coinbase.png', handler: handleCoinbase },
                                                { id: 'rainbow', name: 'Rainbow', logo: '/wallets/rainbow.png', handler: handleRainbow },
                                            ].map((w) => (
                                                <button 
                                                    key={w.id}
                                                    onClick={w.handler}
                                                    className="group relative flex flex-col items-center justify-center p-3 sm:p-5 border border-[#050505]/10 hover:border-[#050505] bg-[#FAF9F6] rounded-xl transition-all shadow-sm shadow-black/5 hover:shadow-md active:scale-[0.96]"
                                                >
                                                    <div className="w-8 h-8 sm:w-10 sm:h-10 mb-1.5 sm:mb-2.5 relative flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
                                                        <img 
                                                            src={w.logo} 
                                                            alt={w.name} 
                                                            className="max-w-full max-h-full object-contain"
                                                        />
                                                    </div>
                                                    <span className="text-[8px] sm:text-[10px] font-black text-[#050505] uppercase tracking-widest transition-colors text-center leading-tight">
                                                        {w.name}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>

                                        <div className="flex items-center gap-3 my-1 opacity-50">
                                            <div className="flex-1 h-[1px] bg-black/10" />
                                            <span className="text-[8px] font-black text-[#050505] uppercase tracking-[0.2em]">OR</span>
                                            <div className="flex-1 h-[1px] bg-black/10" />
                                        </div>

                                        {/* WALLET_CONNECT & LEDGER — compact on mobile */}
                                        <div className="space-y-1.5">
                                            <button onClick={handleAppKitConnect} className="group w-full flex items-center justify-between px-3 py-2.5 sm:p-4 border border-[#050505]/10 hover:border-[#050505] bg-[#FAF9F6] rounded-xl transition-all">
                                                <div className="flex items-center gap-2.5">
                                                    <Wallet size={14} className="text-[#050505]" />
                                                    <span className="text-[11px] font-black text-[#050505] uppercase tracking-wide">All Wallets</span>
                                                </div>
                                                <ChevronRight size={13} className="text-black/40 group-hover:text-black" />
                                            </button>

                                            <button onClick={handleMobileSync} className="group w-full flex items-center justify-between px-3 py-2.5 sm:p-4 border border-[#050505] bg-[#050505] hover:bg-[#222] rounded-xl transition-all shadow-md">
                                                <div className="flex items-center gap-3 text-white">
                                                    <QrCode size={15} />
                                                    <div className="text-left">
                                                        <div className="text-[11px] font-black uppercase tracking-wide">Direct QR Handshake</div>
                                                        <div className="text-[8px] text-white/60 font-mono uppercase tracking-widest">Cross-device linking</div>
                                                    </div>
                                                </div>
                                                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse shrink-0" />
                                            </button>

                                            <button onClick={handleLedger} className="group w-full flex items-center justify-between px-3 py-2.5 sm:p-4 border border-[#050505]/10 hover:border-[#050505] bg-[#FAF9F6] rounded-xl transition-all">
                                                <div className="flex items-center gap-2.5">
                                                    <Shield size={14} className="text-[#050505]" />
                                                    <span className="text-[11px] font-black text-[#050505] uppercase tracking-wide">Hardware Wallet</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[8px] font-black text-black/40 uppercase tracking-widest hidden sm:block">Cold Storage</span>
                                                    <ChevronRight size={13} className="text-black/40 group-hover:text-black" />
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* ── QR VIEW ── */}
                            {view === 'qr' && (
                                <motion.div key="qr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center py-4 space-y-8 relative z-10">
                                    <div className="text-center space-y-2">
                                        <h3 className="text-2xl font-black text-[#050505] tracking-tighter uppercase">SCAN IT</h3>
                                        <p className="text-[11px] text-black/60 leading-relaxed max-w-[280px]">
                                            Scan this QR code with the designated mobile application to synchronize sessions.
                                        </p>
                                    </div>

                                    <div className="relative p-6 bg-white border border-[#050505]/10 rounded-[32px] shadow-sm">
                                            {qrSession ? (
                                                <QRCodeSVG 
                                                    value={`${window.location.origin}/connect?session=${qrSession}`}
                                                    size={200}
                                                    level="H"
                                                    bgColor="#FFFFFF"
                                                    fgColor="#050505"
                                                    includeMargin={false}
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center gap-3 opacity-50">
                                                    <Loader2 className="text-[#050505] animate-spin" size={32} />
                                                </div>
                                            )}
                                        </div>

                                    {/* Console Log */}
                                    {isPolling && (
                                        <div className="w-full bg-[#FAF9F6] border border-[#050505]/10 p-3 rounded-xl text-center">
                                            <p className="text-[10px] text-[#050505] font-black uppercase tracking-[0.1em] flex items-center justify-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse"/> WAITING FOR CONNECTION...
                                            </p>
                                        </div>
                                    )}

                                    <button onClick={() => setView('selection')} className="text-[11px] font-black text-black/40 uppercase tracking-[0.2em] hover:text-[#050505] transition-colors py-2 px-6">
                                        CANCEL
                                    </button>
                                </motion.div>
                            )}

                            {/* ── LEDGER VIEW ── */}
                            {view === 'ledger' && (
                                <motion.div key="ledger" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-8 space-y-6 relative z-10">
                                    <div className="w-20 h-20 rounded-full border border-[#050505]/10 bg-[#FAF9F6] flex items-center justify-center shadow-sm">
                                        {ledgerLoading ? <Loader2 size={24} className="text-[#050505] animate-spin" /> : <CheckCircle2 size={28} className="text-[#050505]" />}
                                    </div>

                                    <div className="text-center space-y-2">
                                        <h3 className="text-xl font-black text-[#050505] tracking-tighter uppercase">
                                            {ledgerLoading ? 'CONNECTING...' : 'DEVICE READY'}
                                        </h3>
                                    </div>

                                    <div className="w-full bg-[#FAF9F6] border border-[#050505]/10 rounded-2xl p-5 flex flex-col gap-3 text-[11px] font-bold text-black/60">
                                        <div className="flex items-center gap-3"><Zap size={14} className="text-[#050505]" /><span>Secure Connection Active</span></div>
                                        <div className="flex items-center gap-3"><Shield size={14} className="text-[#050505]" /><span>Hardware Protected Session</span></div>
                                    </div>

                                    <button onClick={() => setView('selection')} className="text-[11px] font-black text-black/40 uppercase tracking-[0.2em] hover:text-[#050505] transition-colors mt-6 py-2 px-6">
                                        GO BACK
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
            )}
        </AnimatePresence>
    );
}
