import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Fingerprint, Smartphone, Mail, ChevronRight, Lock } from 'lucide-react';
import { useAccount, useConnect } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { useUIStore } from '@/lib/store/ui-store';

export function ConnectWalletModal() {
    const { isConnectModalOpen, closeConnectModal } = useUIStore();
    const { isConnected } = useAccount();
    const { connect, connectors } = useConnect();
    const { open: openAppKit } = useAppKit();
    const [view, setView] = useState<'selection' | 'onboarding'>('selection');

    useEffect(() => {
        if (isConnected && isConnectModalOpen) {
            closeConnectModal();
        }
    }, [isConnected, isConnectModalOpen, closeConnectModal]);

    if (!isConnectModalOpen) return null;

    const handleSovereignLedger = () => {
        // AppKit's Email/Social view is triggered by the default open or specific view
        openAppKit({ view: 'Connect' });
    };

    const handleInstitutionalSync = () => {
        if (typeof window !== 'undefined') {
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            // @ts-ignore - ethereum is injected by wallets
            const hasEthereum = typeof window.ethereum !== 'undefined';
            
            if (isMobile && !hasEthereum) {
                // Perfect Universal Link Routing for iOS/Android when outside in-app browsers
                openAppKit({ view: 'Connect' });
                return;
            }

            // Direct injection detection (Desktop extensions or In-App Mobile Browsers)
            const mmConnector = connectors.find(c => c.id === 'metaMaskSDK' || c.id === 'io.metamask' || c.id === 'metaMask' || c.id === 'injected');
            
            if (mmConnector) {
                connect({ connector: mmConnector });
            } else {
                openAppKit({ view: 'Connect' });
            }
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
                    {/* Header: Pure Institutional Minimalism */}
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
                        <div className="space-y-12">
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
                            <div className="grid grid-cols-1 gap-5">
                                {/* PRIMARY: Sovereign Ledger (Email/Social Creation) */}
                                <button 
                                    onClick={handleSovereignLedger}
                                    className="group relative w-full p-6 sm:p-8 bg-[var(--aztec-ink)] rounded-[2.5rem] flex items-center justify-between transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-[var(--aztec-ink)]/20 overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] duration-1000" />
                                    
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[1.5rem] bg-[var(--aztec-parchment)]/10 border border-white/5 flex items-center justify-center">
                                            <Mail className="text-[var(--aztec-parchment)]" size={24} />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-[10px] font-aztec-mono font-black text-[var(--aztec-chartreuse)] uppercase tracking-[0.2em] mb-1">Recommended</div>
                                            <div className="text-lg sm:text-2xl font-aztec-serif font-black text-[var(--aztec-parchment)] uppercase tracking-tight">Whale Alert Ledger</div>
                                            <div className="text-[10px] font-aztec-mono text-[var(--aztec-parchment)]/40 uppercase tracking-widest mt-1">Create Wallet from Email / Social</div>
                                        </div>
                                    </div>
                                    <ChevronRight className="text-[var(--aztec-parchment)]/20 group-hover:text-[var(--aztec-parchment)] transition-colors" size={24} />
                                </button>

                                {/* SECONDARY: Institutional Sync (Mobile App Detection) */}
                                <button 
                                    onClick={handleInstitutionalSync}
                                    className="group w-full p-6 sm:p-8 bg-transparent border border-[var(--aztec-ink)]/10 rounded-[2.5rem] flex items-center justify-between transition-all hover:bg-[var(--aztec-ink)]/5 active:scale-[0.98]"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[1.5rem] border border-[var(--aztec-ink)]/10 flex items-center justify-center group-hover:bg-[var(--aztec-ink)] transition-colors">
                                            <Smartphone className="text-[var(--aztec-ink)] group-hover:text-[var(--aztec-parchment)]" size={24} />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-lg sm:text-2xl font-aztec-serif font-black text-[var(--aztec-ink)] uppercase tracking-tight">Institutional Sync</div>
                                            <div className="text-[10px] font-aztec-mono text-[var(--aztec-ink)]/40 uppercase tracking-widest mt-1">MetaMask, Trust, or Hardware Apps</div>
                                        </div>
                                    </div>
                                    <Fingerprint className="text-[var(--aztec-ink)]/10 group-hover:text-[var(--aztec-ink)] transition-all group-hover:scale-110" size={24} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Footer: Security Assurance */}
                    <div className="px-8 sm:px-12 py-8 bg-[var(--aztec-ink)]/5 flex flex-col sm:flex-row items-center justify-end gap-6 relative z-10 border-t border-[var(--aztec-ink)]/5">
                        <div className="flex items-center gap-6">
                            <span className="text-[10px] font-aztec-mono font-bold text-[var(--aztec-ink)]/60 border-b border-[var(--aztec-ink)]/20 pb-0.5 cursor-help">Security Whitepaper</span>
                            <span className="text-[10px] font-aztec-mono font-bold text-[var(--aztec-ink)]/60 border-b border-[var(--aztec-ink)]/20 pb-0.5 cursor-help">Network Status</span>
                        </div>
                    </div>

                    {/* Sovereign Glow */}
                    <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-[var(--aztec-orchid)]/10 blur-[100px] pointer-events-none" />
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
