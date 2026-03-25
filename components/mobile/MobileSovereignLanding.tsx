"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
// Only importing what is actually used — tree-shaken for minimal bundle size
import { QrCode, Smartphone, ShoppingBag, Eye, Zap, ChevronDown, CheckCircle2, MoveRight, Shield } from 'lucide-react';
import { useAppKit } from '@reown/appkit/react';
import { useAccount, useConnect, useSignMessage } from 'wagmi';
import { Html5Qrcode } from 'html5-qrcode';
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
    const { isConnected, address } = useAccount();
    const { connect, connectors } = useConnect();
    const { signMessageAsync } = useSignMessage();
    const [view, setView] = useState<'landing' | 'scanner'>('landing');
    const [isSigned, setIsSigned] = useState(false);
    const [isSigning, setIsSigning] = useState(false);
    const [isInappBrowser, setIsInappBrowser] = useState(false);

    useEffect(() => {
        // Detect if we are in an in-app browser (like Metamask, Coinbase, etc)
        const hasProvider = typeof window !== 'undefined' && !!(window as any).ethereum;
        setIsInappBrowser(hasProvider);

        // Check for persistent signature
        const savedSign = sessionStorage.getItem(`sovereign_signed_${address}`);
        if (savedSign === 'true') setIsSigned(true);
    }, [address]);

    const handleSovereignConnect = useCallback(async () => {
        const injected = connectors.find((c: any) => c.id === 'injected' || c.id === 'io.metamask' || c.id === 'metaMaskSDK');
        
        if (isInappBrowser && injected) {
            connect({ connector: injected });
        } else {
            // Force redirect to metamask deep link if no provider or external browser
            window.location.href = `https://metamask.app.link/dapp/${window.location.host}`;
        }
    }, [connect, connectors, isInappBrowser]);

    const handleSignAndAuthorize = async () => {
        if (!address) return;
        setIsSigning(true);
        try {
            const message = `Authorize Sovereign Handshake for ${address}\nTimestamp: ${Date.now()}`;
            await signMessageAsync({ message });
            setIsSigned(true);
            if (address) {
                sessionStorage.setItem(`sovereign_signed_${address}`, 'true');
            }
            toast.success('Identity Verified');
            setView('scanner'); // Auto transition to scanner after signature
        } catch (e) {
            toast.error('Signature Required');
        } finally {
            setIsSigning(false);
        }
    };

    const handleScanClick = useCallback(() => {
        if (!isConnected) {
            handleSovereignConnect();
            return;
        }
        if (!isSigned) {
            handleSignAndAuthorize();
            return;
        }
        setView('scanner');
    }, [isConnected, isSigned, handleSignAndAuthorize, handleSovereignConnect]);

    if (view === 'scanner') {
        return <MobileQRScanner 
            onBack={() => setView('landing')} 
            setView={setView}
            signMessageAsync={signMessageAsync}
        />;
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
                            src="/official-whale-legendary.png"
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
                        Connect your identity to the matrix.<br />Google, X, and Web3 supported.
                    </p>

                    <div className="space-y-4">
                        {!isConnected ? (
                            <button
                                onClick={handleSovereignConnect}
                                className="w-full bg-[#050505] text-white font-black uppercase tracking-widest py-6 rounded-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-transform shadow-lg shadow-black/10"
                            >
                                <Smartphone size={22} className="text-indigo-400" />
                                {isInappBrowser ? 'Connect MetaMask' : 'Open in MetaMask'}
                            </button>
                        ) : !isSigned ? (
                            <button
                                onClick={handleSignAndAuthorize}
                                disabled={isSigning}
                                className="w-full bg-indigo-600 text-white font-black uppercase tracking-widest py-6 rounded-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-transform shadow-lg shadow-indigo-500/20"
                            >
                                <CheckCircle2 size={22} className="text-white" />
                                {isSigning ? 'Authorizing...' : 'Sign & Authorize'}
                            </button>
                        ) : (
                            <div className="w-full bg-green-50 border border-green-200 font-bold py-6 rounded-2xl flex items-center justify-center gap-3">
                                <CheckCircle2 size={22} className="text-green-500" />
                                <span className="text-lg text-[#050505]">
                                    Identity Linked
                                </span>
                            </div>
                        )}

                        <button
                            onClick={handleScanClick}
                            className={`w-full mt-2 bg-transparent border-2 ${isSigned ? 'border-indigo-500 text-indigo-600' : 'border-[#050505]/10 text-[#050505]/40'} font-black py-6 rounded-2xl flex items-center justify-between px-8 uppercase tracking-widest transition-all active:scale-[0.98] shadow-sm`}
                        >
                            <div className="flex items-center gap-4">
                                <QrCode size={22} />
                                <span>{isSigned ? 'Scan PC Screen' : 'Identify to Scan'}</span>
                            </div>
                            <MoveRight size={22} className="opacity-20" />
                        </button>
                    </div>
                </motion.div>
            </section>
        </div>
    );
}


// ─── QR SCANNER VIEW ──────────────────────────────────────────────────────────
function MobileQRScanner({ onBack, setView, signMessageAsync }: { onBack: () => void, setView: (v: 'landing' | 'scanner') => void, signMessageAsync: any }) {
    const { address, isConnected } = useAccount();
    const [isScanning, setIsScanning] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const scannerRef = useRef<Html5Qrcode | null>(null);

    useEffect(() => {
        if (!isConnected || !address) {
            toast.error('Identity handshake required.');
            onBack();
            return;
        }

        // Initialize scanner IMMEDIATELY on mount (button click has already happened)
        const initScanner = async () => {
            try {
                const scanner = new Html5Qrcode('sovereign-qr-reader');
                scannerRef.current = scanner;

                const config = {
                    fps: 20, // Faster for smoother legendary feel
                    qrbox: { width: 260, height: 260 },
                    aspectRatio: 1.0
                };

                await scanner.start(
                    { facingMode: "environment" },
                    config,
                    async (decodedText) => {
                        if (isProcessing) return;
                        
                        // [LEGENDARY NORMALIZATION]
                        const cleanText = decodedText.trim();
                        if (!cleanText.startsWith('SOVEREIGN_HANDSHAKE:')) return;

                        setIsProcessing(true);
                        
                        try {
                            toast.info('Establishing Neural Handshake...', {
                                icon: <Zap className="text-[var(--aztec-orchid)] animate-pulse" size={18} />
                            });

                            // Stop scanner early to free up device resources
                            try {
                                await scanner.stop();
                                setIsScanning(false);
                            } catch (stopErr) {
                                // Ignore already-stopped error
                            }

                            // [Handshake Signature]
                            const signature = await signMessageAsync({ message: cleanText });
                            const token = cleanText.split(':')[1];

                            const res = await fetch('/api/auth/qr-sync', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ token, address, signature }),
                            });

                            if (res.ok) {
                                // Provide haptic feedback if available
                                if (window.navigator?.vibrate) window.navigator.vibrate([100, 50, 100]);
                                
                                toast.success('Sync Verified', {
                                    description: 'Institutional handshake complete.'
                                });
                                // Delay transition to ensure user reads the success message
                                setTimeout(() => setView('landing'), 2000);
                            } else {
                                const errText = await res.text();
                                console.error('[Handshake:SyncError]', errText);
                                toast.error('Sync Handshake Failed', { description: errText });
                                setIsProcessing(false);
                                // Restart scanner safely
                                if (!isScanning) {
                                  await scanner.start({ facingMode: "environment" }, config, () => {}, () => {});
                                  setIsScanning(true);
                                }
                            }
                        } catch (e: any) {
                            console.error('[HANDSHAKE_ERROR]', e);
                            toast.error('Handshake Cancelled or Error');
                            setIsProcessing(false);
                            // Restart scanner
                            try {
                                await scanner.start({ facingMode: "environment" }, config, () => {}, () => {});
                            } catch(e2) {}
                        }
                    },
                    (error) => { /* Quiet */ }
                );
                setIsScanning(true);
            } catch (e) {
                console.error('Scanner init error:', e);
                toast.error('Camera Access Failed. Check permissions.');
                onBack();
            }
        };

        initScanner();

        return () => { 
            if (scannerRef.current) {
                // Background fire-and-forget stop to avoid blocking React unmount
                scannerRef.current.stop().catch(() => {});
            }
        };
    }, [address, isConnected, onBack]);

    return (
        <div className="h-[100dvh] bg-[#050505] text-white flex flex-col w-full relative overflow-hidden">
            {/* Background Handshaking Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 blur-[130px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 blur-[130px] rounded-full" />

            <style dangerouslySetInnerHTML={{ __html: `
                #sovereign-qr-reader { border: none !important; border-radius: 2.5rem !important; overflow: hidden; background: #000; position: relative; }
                #sovereign-qr-reader video { width: 100% !important; height: 100% !important; object-fit: cover !important; border-radius: 2.5rem !important; }
                #sovereign-qr-reader__scan_region { border: none !important; }
                #sovereign-qr-reader img { display: none !important; }
                .legendary-scan-overlay {
                    position: absolute;
                    inset: 0;
                    border: 2px solid rgba(255,255,255,0.1);
                    border-radius: 2.5rem;
                    pointer-events: none;
                    z-index: 10;
                }
                .scan-line {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 2px;
                    background: linear-gradient(to right, transparent, #818cf8, transparent);
                    box-shadow: 0 0 15px #818cf8;
                    animation: scanning 2s linear infinite;
                }
                @keyframes scanning {
                    0% { top: 10%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 90%; opacity: 0; }
                }
            ` }} />

            <header className="px-6 py-8 flex items-center justify-between relative z-20">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 group"
                >
                    <div className="p-3 bg-white/5 rounded-full group-hover:bg-white/10 transition-colors">
                         <MoveRight className="rotate-180" size={20} />
                    </div>
                    <span className="font-bold tracking-tight text-white/50 group-hover:text-white transition-colors">Abort Sync</span>
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Network Live</span>
                </div>
            </header>

            <div className="flex-1 flex flex-col items-center justify-center -mt-10 p-8 relative z-10">
                <div className="w-full max-w-[340px] aspect-square relative group">
                    {/* Scanner Frame Decor */}
                    <div className="absolute -inset-4 border border-white/5 rounded-[3rem] transition-all duration-700 group-hover:border-indigo-500/20" />
                    <div className="absolute -inset-0.5 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-[2.6rem] blur-sm animate-pulse" />
                    
                    <div id="sovereign-qr-reader" className="w-full h-full">
                         {isProcessing && (
                            <div className="absolute inset-0 bg-black/80 z-20 flex items-center justify-center rounded-[2.5rem] backdrop-blur-md">
                                <div className="flex flex-col items-center">
                                    <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                                    <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400">Syncing Matrix...</p>
                                </div>
                            </div>
                         )}
                         <div className="legendary-scan-overlay">
                            {!isProcessing && <div className="scan-line" />}
                         </div>
                    </div>

                    {/* Corner Accents */}
                    <div className="absolute -top-1 -left-1 w-10 h-10 border-t-2 border-l-2 border-indigo-500 rounded-tl-3xl opacity-50" />
                    <div className="absolute -top-1 -right-1 w-10 h-10 border-t-2 border-r-2 border-indigo-500 rounded-tr-3xl opacity-50" />
                    <div className="absolute -bottom-1 -left-1 w-10 h-10 border-b-2 border-l-2 border-indigo-500 rounded-bl-3xl opacity-50" />
                    <div className="absolute -bottom-1 -right-1 w-10 h-10 border-b-2 border-r-2 border-indigo-500 rounded-br-3xl opacity-50" />
                </div>

                <div className="mt-14 text-center space-y-4">
                    <h3 className="font-black text-3xl tracking-tighter text-white">Neural Handshake</h3>
                    <p className="text-white/40 text-[1rem] leading-relaxed max-w-[260px] mx-auto font-medium">
                        Point your scanner at the <span className="text-white font-bold">QR Identity Matrix</span> on your PC terminal.
                    </p>
                </div>
            </div>

            <footer className="p-10 text-center">
                <div className="bg-white/5 border border-white/5 py-4 px-6 rounded-2xl flex items-center justify-center gap-3">
                    <Shield size={16} className="text-indigo-400" />
                    <span className="text-[11px] font-bold text-white/50 uppercase tracking-[0.1em]">Verified Session: {address?.slice(0,6)}...{address?.slice(-4)}</span>
                </div>
            </footer>
        </div>
    );
}
