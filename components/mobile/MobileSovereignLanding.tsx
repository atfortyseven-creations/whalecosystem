"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
// Only importing what is actually used — tree-shaken for minimal bundle size
import { QrCode, Hexagon, ShoppingBag, Eye, Zap, ChevronDown, CheckCircle2, MoveRight } from 'lucide-react';
import { useAppKit } from '@reown/appkit/react';
import { useAccount } from 'wagmi';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { toast } from 'sonner';

// GPU-accelerated background pattern — rendered once, never re-rendered
const AnimatedPattern = React.memo(function AnimatedPattern() {
    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: `
                .mobile-hide-scrollbar::-webkit-scrollbar { display: none; }
                .mobile-hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .web3-dot-pattern {
                    background-image: radial-gradient(circle, rgba(100,80,200,0.12) 1px, transparent 1px);
                    background-size: 28px 28px;
                    will-change: background-position;
                    transform: translateZ(0);
                }
            ` }} />
            <motion.div
                aria-hidden="true"
                className="fixed inset-0 web3-dot-pattern pointer-events-none z-0"
                animate={{ backgroundPosition: ['0px 0px', '28px 28px'] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
            />
        </>
    );
});

export function MobileSovereignLanding() {
    const { open } = useAppKit();
    const { isConnected, address } = useAccount();
    const [view, setView] = useState<'landing' | 'scanner'>('landing');

    const handleMetaMaskDeepLink = useCallback(() => {
        if (typeof window !== 'undefined' && (window as any).ethereum) {
            open({ view: 'Connect' });
        } else {
            window.location.href = 'https://metamask.app.link/dapp/www.humanidfi.com';
        }
    }, [open]);

    const handleScanClick = useCallback(() => {
        if (!isConnected) {
            open({ view: 'Connect' });
            return;
        }
        setView('scanner');
    }, [isConnected, open]);

    if (view === 'scanner') {
        return <MobileQRScanner onBack={() => setView('landing')} />;
    }

    return (
        <div className="h-[100dvh] w-full bg-[#FAF9F6] text-[#050505] font-sans overflow-y-auto snap-y snap-mandatory scroll-smooth mobile-hide-scrollbar relative">
            <AnimatedPattern />

            {/* ── PAGE 1: HERO ─────────────────────────────────── */}
            <section className="h-[100dvh] w-full snap-start relative flex flex-col justify-center items-center px-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-100/30 to-transparent pointer-events-none" aria-hidden="true" />
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center z-10"
                >
                    {/* Corporate logo — double size, GPU-composited glow */}
                    <div className="w-48 h-48 mx-auto mb-10 relative flex items-center justify-center">
                        <motion.div
                            aria-hidden="true"
                            className="absolute inset-0 rounded-full"
                            style={{
                                background: 'radial-gradient(circle, rgba(120,80,255,0.15) 0%, transparent 70%)',
                                willChange: 'transform, opacity',
                            }}
                            animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
                            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                        />
                        <img
                            src="/icon.png"
                            alt="Whale Alert Network"
                            width={192}
                            height={192}
                            className="relative z-10 w-full h-full object-contain"
                            loading="eager"
                        />
                    </div>

                    <h1 className="text-[3.2rem] font-black tracking-tighter mb-4 leading-[1.05] text-[#050505]">
                        Whale Alert<br />Network
                    </h1>
                    <p className="text-[#050505]/55 text-[1.05rem] leading-relaxed max-w-[270px] mx-auto font-medium">
                        Institutional Sovereignty. Neural Data Extraction.<br />The definitive whale intelligence protocol.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 1 }}
                    className="absolute bottom-10 flex flex-col items-center gap-1 text-[#050505]/25"
                    aria-hidden="true"
                >
                    <span className="text-[9px] uppercase tracking-[0.2em] font-black">
                        Scroll Down for Intelligence
                    </span>
                    <ChevronDown size={22} className="animate-bounce" />
                </motion.div>
            </section>

            {/* ── PAGE 2: INSTITUTIONAL PROTOCOL ───────────────── */}
            <section className="h-[100dvh] w-full snap-start relative flex flex-col justify-center px-8 overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-14"
                >
                    <div>
                        <div className="w-14 h-14 bg-black/5 rounded-2xl flex items-center justify-center mb-6 border border-black/5">
                            <Eye className="text-indigo-500" size={28} />
                        </div>
                        <h2 className="text-[2.4rem] font-black tracking-tighter mb-3 leading-none text-[#050505]">
                            Sovereign<br />Visibility.
                        </h2>
                        <p className="text-[#050505]/60 text-[1.05rem] leading-relaxed font-medium">
                            Real-time monitoring of high-net-worth flows across all major L1 and L2 chains. Millisecond latency. Zero noise.
                        </p>
                    </div>

                    <div>
                        <div className="w-14 h-14 bg-black/5 rounded-2xl flex items-center justify-center mb-6 border border-black/5">
                            <Zap className="text-indigo-500" size={28} />
                        </div>
                        <h2 className="text-[2.4rem] font-black tracking-tighter mb-3 leading-none text-[#050505]">
                            Neural<br />Network.
                        </h2>
                        <p className="text-[#050505]/60 text-[1.05rem] leading-relaxed font-medium">
                            Advanced behavioral heuristics translated into actionable institutional intelligence. No guesswork.
                        </p>
                    </div>
                </motion.div>
            </section>

            {/* ── PAGE 3: MERCH ──────────────────────────────────── */}
            <section className="h-[100dvh] w-full snap-start relative flex flex-col justify-center items-center px-6 overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-sm"
                >
                    <div className="bg-white border border-black/5 rounded-[3rem] p-10 text-center shadow-2xl shadow-black/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-100/40 blur-[60px] rounded-full pointer-events-none" aria-hidden="true" />
                        <div className="w-20 h-20 bg-black/5 rounded-full mx-auto flex items-center justify-center mb-8 border border-black/10">
                            <ShoppingBag className="text-[#050505]" size={32} />
                        </div>
                        <h2 className="text-4xl font-black tracking-tighter mb-4 text-[#050505]">Official<br />Merch</h2>
                        <p className="text-[#050505]/55 text-base leading-relaxed mb-10 font-medium">
                            Premium apparel for the elite. Wear the network. Represent the identity in the real world.
                        </p>
                        <button className="w-full bg-[#050505] text-white font-black text-lg py-5 rounded-full flex items-center justify-center gap-3 active:scale-[0.98] transition-transform">
                            Shop Now <MoveRight size={20} />
                        </button>
                    </div>
                </motion.div>
            </section>

            {/* ── PAGE 4: SOVEREIGN ACCESS ───────────────────────── */}
            <section className="h-[100dvh] w-full snap-start relative flex flex-col justify-center px-6 overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-100/30 blur-[120px] rounded-full pointer-events-none" aria-hidden="true" />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-sm mx-auto z-10"
                >
                    <h2 className="text-[3rem] font-black tracking-tighter mb-3 text-center leading-none text-[#050505]">
                        Sovereign<br />Access.
                    </h2>
                    <p className="text-[#050505]/55 text-center text-[1.05rem] font-medium mb-12">
                        Connect to the decentralized matrix<br />and monitor the flow.
                    </p>

                    <div className="space-y-4">
                        {!isConnected ? (
                            <button
                                onClick={handleMetaMaskDeepLink}
                                className="w-full bg-[#050505] text-white font-black uppercase tracking-widest py-6 rounded-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-transform shadow-lg shadow-black/10"
                            >
                                <Hexagon size={22} className="text-indigo-400" />
                                Connect MetaMask
                            </button>
                        ) : (
                            <div className="w-full bg-green-50 border border-green-200 font-bold py-6 rounded-2xl flex items-center justify-center gap-3">
                                <CheckCircle2 size={22} className="text-green-500" />
                                <span className="text-lg text-[#050505]">
                                    {address?.slice(0, 6)}…{address?.slice(-4)}
                                </span>
                            </div>
                        )}

                        <button
                            onClick={handleScanClick}
                            className="w-full mt-2 bg-transparent border-2 border-[#050505]/10 text-[#050505] font-black py-6 rounded-2xl flex items-center justify-between px-8 uppercase tracking-widest transition-all active:scale-[0.98] hover:bg-black/5"
                        >
                            <div className="flex items-center gap-4">
                                <QrCode size={22} />
                                <span>Scan PC Screen</span>
                            </div>
                            <MoveRight size={22} className="text-[#050505]/20" />
                        </button>
                    </div>
                </motion.div>
            </section>
        </div>
    );
}

// ─── QR SCANNER VIEW ──────────────────────────────────────────────────────────
function MobileQRScanner({ onBack }: { onBack: () => void }) {
    const { address } = useAccount();

    useEffect(() => {
        let scanner: Html5QrcodeScanner | null = null;
        try {
            scanner = new Html5QrcodeScanner(
                'sovereign-qr-reader',
                { fps: 10, qrbox: { width: 250, height: 250 } },
                false
            );
            scanner.render(async (decodedText) => {
                if (scanner) scanner.clear();
                try {
                    const res = await fetch('/api/auth/qr-sync', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ token: decodedText, address }),
                    });
                    if (res.ok) {
                        toast.success('Successfully connected to PC!');
                    } else {
                        toast.error('Sync failed: ' + await res.text());
                    }
                } catch (e: any) {
                    toast.error('Sync error: ' + e.message);
                } finally {
                    onBack();
                }
            }, () => {});
        } catch (e) {
            console.error('Scanner init error:', e);
        }
        return () => { scanner?.clear().catch(() => {}); };
    }, [address, onBack]);

    return (
        <div className="h-[100dvh] bg-[#050505] text-white flex flex-col w-full">
            <style dangerouslySetInnerHTML={{ __html: `
                #sovereign-qr-reader { border: none !important; }
                #sovereign-qr-reader button { background: #7c3aed; color: white; font-weight: 900; border-radius: 100px; border: none; padding: 14px 28px; text-transform: uppercase; margin-bottom: 20px; cursor: pointer; font-family: inherit; font-size: 13px; letter-spacing: 1px; }
                #sovereign-qr-reader a, #sovereign-qr-reader img { display: none !important; }
                #sovereign-qr-reader span { color: rgba(255,255,255,0.4) !important; font-family: inherit; font-size: 13px; margin-top: 10px; display: block; }
                #sovereign-qr-reader video { border-radius: 2rem !important; }
                #qr-shaded-region { border-color: rgba(0,0,0,0.85) !important; border-width: 36px !important; }
            ` }} />

            <header className="px-6 py-8 flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="text-white/70 hover:text-white px-5 py-2.5 bg-white/10 rounded-full text-sm font-bold transition-colors"
                >
                    ← Back
                </button>
                <QrCode className="text-indigo-400" size={26} />
            </header>

            <div className="flex-1 flex flex-col items-center justify-center -mt-8 p-6">
                <div className="w-full max-w-[380px]">
                    <div
                        id="sovereign-qr-reader"
                        className="bg-[#0a0a0a] rounded-[2rem] border border-white/10 overflow-hidden"
                    />
                </div>
                <div className="mt-12 text-center max-w-[300px]">
                    <h3 className="font-black text-3xl tracking-tighter mb-3 text-white">Scan to Connect</h3>
                    <p className="text-white/50 text-base leading-relaxed font-medium">
                        Point your camera at the <span className="text-indigo-400 font-bold">QR code</span> on your PC screen to securely log in.
                    </p>
                </div>
            </div>
        </div>
    );
}
