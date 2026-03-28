"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Only importing what is actually used — tree-shaken for minimal bundle size
import { QrCode, Smartphone, ShoppingBag, Eye, Zap, ChevronDown, CheckCircle2, MoveRight, Shield, AlertCircle, RefreshCw } from 'lucide-react';
import { useAppKit } from '@reown/appkit/react';
import { useAccount, useConnect, useSignMessage } from 'wagmi';
import { Html5Qrcode } from 'html5-qrcode';
import { toast } from 'sonner';

// ─── GPU-ACCELERATED BACKGROUND ────────────────────────────────────────────
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

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────
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

    // Use WalletConnect / AppKit modal (works universally on iOS, Android, all wallets)
    // CRITICAL: This is far superior to manual deep-linking (e.g. metamask.app.link/dapp)
    // because manual link forces the user out of Safari/Chrome into the MetaMask in-app browser.
    // The AppKit modal connects via WebSockets, allowing the user to stay in Safari, approve
    // the transaction in MetaMask via deep link, and return cleanly to Safari with full session state.
    const { open: openWalletModal } = useAppKit();

    const handleSovereignConnect = useCallback(async () => {
        if (isInappBrowser) {
            // Already inside a wallet in-app browser — connect injected provider directly
            const priority = ['io.metamask', 'metaMaskSDK', 'injected', 'coinbaseWalletSDK', 'trust'];
            let injected = null;
            for (const id of priority) {
                injected = connectors.find((c: any) => c.id === id);
                if (injected) break;
            }
            if (!injected) injected = connectors[0];
            if (injected) {
                try {
                    connect({ connector: injected });
                } catch (e) {
                    toast.error('Connection failed in injected provider.');
                }
            }
            return;
        }
        
        // Universal: WalletConnect modal — iOS, Android, MetaMask, Coinbase, Rainbow, etc.
        openWalletModal();
    }, [connect, connectors, isInappBrowser, openWalletModal]);

    const handleSignAndAuthorize = useCallback(async () => {
        if (!address) return;
        setIsSigning(true);
        try {
            const message = `Authorize Sovereign Handshake for ${address}\nTimestamp: ${Date.now()}`;
            await signMessageAsync({ message });
            setIsSigned(true);
            sessionStorage.setItem(`sovereign_signed_${address}`, 'true');
            toast.success('Identity Verified ✓', { description: 'Now scan the QR on your PC terminal.' });
            setView('scanner');
        } catch (e: any) {
            if (e?.name === 'UserRejectedRequestError' || e?.code === 4001) {
                toast.error('Signature rejected', { description: 'You must sign to authorize the handshake.' });
            } else {
                toast.error('Signature failed', { description: 'Please retry or reconnect your wallet.' });
            }
        } finally {
            setIsSigning(false);
        }
    }, [address, signMessageAsync]);

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
                    <span className="text-[9px] uppercase tracking-[0.2em] font-black">Scroll Down for Intelligence</span>
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
                        Connect your wallet to sync with<br />the PC terminal in one tap.
                    </p>

                    <div className="space-y-4">
                        {!isConnected ? (
                            <>
                                <button
                                    onClick={handleSovereignConnect}
                                    className="w-full bg-[#050505] text-white font-black uppercase tracking-widest py-6 rounded-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-transform shadow-lg shadow-black/10"
                                >
                                    <Smartphone size={22} className="text-indigo-400" />
                                    {isInappBrowser ? 'Connect MetaMask' : 'Open Wallet App'}
                                </button>
                                {/* Hint for users who don't understand */}
                                <p className="text-center text-[11px] text-[#050505]/35 font-medium leading-relaxed px-4">
                                    Tap above to securely connect via WalletConnect, retaining full session capability inside Safari/Chrome.
                                </p>
                            </>
                        ) : !isSigned ? (
                            <button
                                onClick={handleSignAndAuthorize}
                                disabled={isSigning}
                                className="w-full bg-indigo-600 text-white font-black uppercase tracking-widest py-6 rounded-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-transform shadow-lg shadow-indigo-500/20 disabled:opacity-60"
                            >
                                <CheckCircle2 size={22} className="text-white" />
                                {isSigning ? 'Authorizing...' : 'Sign & Authorize Identity'}
                            </button>
                        ) : (
                            <div className="w-full bg-green-50 border border-green-200 font-bold py-6 rounded-2xl flex items-center justify-center gap-3">
                                <CheckCircle2 size={22} className="text-green-500" />
                                <span className="text-lg text-[#050505]">Identity Linked</span>
                            </div>
                        )}

                        <button
                            onClick={handleScanClick}
                            className={`w-full mt-2 bg-transparent border-2 ${isSigned ? 'border-indigo-500 text-indigo-600' : 'border-[#050505]/10 text-[#050505]/40'} font-black py-6 rounded-2xl flex items-center justify-between px-8 uppercase tracking-widest transition-all active:scale-[0.98] shadow-sm`}
                        >
                            <div className="flex items-center gap-4">
                                <QrCode size={22} />
                                <span>{isSigned ? 'Scan PC Screen' : 'Connect First to Scan'}</span>
                            </div>
                            <MoveRight size={22} className="opacity-20" />
                        </button>

                        {/* Connected address indicator */}
                        {isConnected && address && (
                            <div className="flex items-center justify-center gap-2 pt-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[11px] font-mono text-[#050505]/40">
                                    {address.slice(0, 6)}...{address.slice(-4)}
                                </span>
                            </div>
                        )}
                    </div>
                </motion.div>
            </section>
        </div>
    );
}

// ─── QR SCANNER VIEW ──────────────────────────────────────────────────────────
function MobileQRScanner({ onBack, setView, signMessageAsync }: {
    onBack: () => void,
    setView: (v: 'landing' | 'scanner') => void,
    signMessageAsync: any
}) {
    const { address, isConnected } = useAccount();
    const [isScanning, setIsScanning] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const cleanupRef = useRef<(() => void) | null>(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (cleanupRef.current) cleanupRef.current();
            if (scannerRef.current) {
                scannerRef.current.stop().catch(() => {});
                scannerRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!isConnected || !address) {
            toast.error('Identity handshake required.');
            onBack();
            return;
        }

        setCameraError(null);
        setIsScanning(false);

        const handleScan = async (decodedText: string) => {
            if (isProcessing) return;
            const cleanText = decodedText.trim();
            if (!cleanText.startsWith('SOVEREIGN_HANDSHAKE:')) return;

            setIsProcessing(true);
            if (window.navigator?.vibrate) window.navigator.vibrate([100, 50, 100]);

            try {
                toast.info('Neural Handshake Detected...', {
                    icon: <Zap className="text-indigo-400 animate-pulse" size={18} />
                });

                const signature = await signMessageAsync({ message: cleanText });
                const token = cleanText.split(':')[1];

                const res = await fetch('/api/auth/qr-sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token, address, signature }),
                });

                if (res.ok) {
                    toast.success('Synchronization Complete', {
                        description: 'Your identity is now coupled with the PC terminal.'
                    });
                    // Stop scanner cleanly before transitioning
                    if (scannerRef.current) {
                        await scannerRef.current.stop().catch(() => {});
                        scannerRef.current = null;
                    }
                    setTimeout(() => setView('landing'), 1200);
                } else {
                    const errText = await res.text();
                    throw new Error(errText || 'Sync Refused');
                }
            } catch (e: any) {
                if (e?.name === 'UserRejectedRequestError' || e?.code === 4001) {
                    toast.error('Signature rejected', { description: 'You must sign the handshake to sync.' });
                } else {
                    toast.error('Handshake Failed', { description: e?.message || 'Please retry.' });
                }
                setIsProcessing(false);
            }
        };

        const initScanner = async () => {
            // ── Strategy A: Native BarcodeDetector API (Chrome Android, Safari 17+) ──
            if ('BarcodeDetector' in window) {
                try {
                    const formats = await (window as any).BarcodeDetector.getSupportedFormats();
                    if (formats.includes('qr_code')) {
                        const stream = await navigator.mediaDevices.getUserMedia({
                            video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
                        });
                        const video = document.getElementById('sovereign-video') as HTMLVideoElement;
                        if (!video) return;
                        video.srcObject = stream;
                        video.setAttribute('playsinline', 'true'); // CRITICAL for iOS
                        video.setAttribute('autoplay', 'true');
                        video.muted = true;
                        await video.play();
                        setIsScanning(true);

                        const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
                        let rafId: number;
                        let running = true;

                        const detectLoop = async () => {
                            if (!running) return;
                            try {
                                if (video.readyState >= video.HAVE_ENOUGH_DATA) {
                                    const barcodes = await detector.detect(video);
                                    if (barcodes.length > 0) {
                                        running = false;
                                        cancelAnimationFrame(rafId);
                                        stream.getTracks().forEach(t => t.stop());
                                        await handleScan(barcodes[0].rawValue);
                                        return;
                                    }
                                }
                            } catch (_) {}
                            rafId = requestAnimationFrame(detectLoop);
                        };
                        detectLoop();

                        cleanupRef.current = () => {
                            running = false;
                            cancelAnimationFrame(rafId);
                            stream.getTracks().forEach(t => t.stop());
                        };
                        return; // Success — skip Strategy B
                    }
                } catch (e) {
                    console.warn('[Scanner] BarcodeDetector failed, falling back to Html5Qrcode:', e);
                }
            }

            // ── Strategy B: Html5Qrcode (universal fallback — iOS Safari, Firefox Android) ──
            try {
                // Ensure the element exists with a clean ID
                const el = document.getElementById('sovereign-qr-reader');
                if (!el) { setCameraError('Scanner element not found. Please refresh.'); return; }

                const scanner = new Html5Qrcode('sovereign-qr-reader', { verbose: false });
                scannerRef.current = scanner;

                await scanner.start(
                    { facingMode: 'environment' },
                    { fps: 20, qrbox: { width: 240, height: 240 }, aspectRatio: 1.0 },
                    (text) => handleScan(text),
                    () => { /* quiet scan errors */ }
                );
                setIsScanning(true);

                cleanupRef.current = () => {
                    if (scannerRef.current) {
                        scannerRef.current.stop().catch(() => {});
                        scannerRef.current = null;
                    }
                };
            } catch (e: any) {
                console.error('[Scanner] Html5Qrcode init failed:', e);
                if (e?.name === 'NotAllowedError' || (e?.message && e.message.includes('Permission'))) {
                    setCameraError('Camera access denied. Please allow camera access in your browser settings, then retry.');
                } else if (e?.name === 'NotFoundError') {
                    setCameraError('No camera found on this device.');
                } else {
                    setCameraError('Camera failed to start. Please refresh and try again.');
                }
            }
        };

        initScanner();

        return () => {
            if (cleanupRef.current) { cleanupRef.current(); cleanupRef.current = null; }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [address, isConnected, onBack, retryCount]);

    return (
        <div className="h-[100dvh] bg-[#050505] text-white flex flex-col w-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 blur-[130px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 blur-[130px] rounded-full" />

            <style dangerouslySetInnerHTML={{ __html: `
                #sovereign-qr-reader { border: none !important; border-radius: 2.5rem !important; overflow: hidden; background: #000; }
                #sovereign-qr-reader video { width: 100% !important; height: 100% !important; object-fit: cover !important; border-radius: 2.5rem !important; }
                #sovereign-qr-reader__scan_region { border: none !important; }
                #sovereign-qr-reader img[alt="Info icon"] { display: none !important; }
                #sovereign-qr-reader__dashboard_section_csr button { display: none !important; }
                #sovereign-video { width: 100%; height: 100%; object-fit: cover; border-radius: 2.5rem; }
                .scan-line {
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 2px;
                    background: linear-gradient(to right, transparent, #818cf8, transparent);
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
                <button onClick={() => { if (cleanupRef.current) cleanupRef.current(); onBack(); }} className="flex items-center gap-2 group">
                    <div className="p-3 bg-white/5 rounded-full group-hover:bg-white/10 transition-colors">
                        <MoveRight className="rotate-180" size={20} />
                    </div>
                    <span className="font-bold tracking-tight text-white/50 group-hover:text-white transition-colors">Back</span>
                </button>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isScanning ? 'bg-green-500 animate-pulse' : 'bg-amber-400 animate-pulse'}`} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                        {isScanning ? 'Camera Live' : 'Initializing...'}
                    </span>
                </div>
            </header>

            <div className="flex-1 flex flex-col items-center justify-center -mt-10 p-8 relative z-10">
                {cameraError ? (
                    <div className="w-full max-w-[340px] flex flex-col items-center gap-6 text-center">
                        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center">
                            <AlertCircle size={36} className="text-red-400" />
                        </div>
                        <div>
                            <h3 className="font-black text-xl text-white mb-2">Camera Access Required</h3>
                            <p className="text-white/50 text-sm leading-relaxed">{cameraError}</p>
                        </div>
                        <button
                            onClick={() => setRetryCount(c => c + 1)}
                            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-sm"
                        >
                            <RefreshCw size={16} /> Retry Camera
                        </button>
                        <p className="text-white/30 text-xs">
                            iOS: Settings → Safari → Camera → Allow<br />
                            Android: Browser settings → Site permissions → Camera
                        </p>
                    </div>
                ) : (
                    <div className="w-full max-w-[340px] aspect-square relative group">
                        <div className="absolute -inset-4 border border-white/5 rounded-[3rem] transition-all duration-700 group-hover:border-indigo-500/20" />
                        <div className="absolute -inset-0.5 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-[2.6rem] blur-sm" />

                        {'BarcodeDetector' in (typeof window !== 'undefined' ? window : {}) ? (
                            <video
                                id="sovereign-video"
                                className="w-full h-full rounded-[2.5rem] bg-black"
                                playsInline
                                muted
                                autoPlay
                            />
                        ) : (
                            <div id="sovereign-qr-reader" className="w-full h-full rounded-[2.5rem] overflow-hidden" />
                        )}

                        {isProcessing && (
                            <div className="absolute inset-0 bg-black/80 z-20 flex items-center justify-center rounded-[2.5rem] backdrop-blur-md">
                                <div className="flex flex-col items-center">
                                    <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                                    <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400">Syncing Matrix...</p>
                                </div>
                            </div>
                        )}

                        {isScanning && !isProcessing && (
                            <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none z-10">
                                <div className="scan-line" />
                                <div className="absolute inset-0 border-2 border-white/10 rounded-[2.5rem]" />
                            </div>
                        )}

                        <div className="absolute -top-1 -left-1 w-10 h-10 border-t-2 border-l-2 border-indigo-500 rounded-tl-3xl opacity-50" />
                        <div className="absolute -top-1 -right-1 w-10 h-10 border-t-2 border-r-2 border-indigo-500 rounded-tr-3xl opacity-50" />
                        <div className="absolute -bottom-1 -left-1 w-10 h-10 border-b-2 border-l-2 border-indigo-500 rounded-bl-3xl opacity-50" />
                        <div className="absolute -bottom-1 -right-1 w-10 h-10 border-b-2 border-r-2 border-indigo-500 rounded-br-3xl opacity-50" />
                    </div>
                )}

                {!cameraError && (
                    <div className="mt-14 text-center space-y-3">
                        <h3 className="font-black text-3xl tracking-tighter text-white">Neural Handshake</h3>
                        <p className="text-white/40 text-[1rem] leading-relaxed max-w-[260px] mx-auto font-medium">
                            Point at the <span className="text-white font-bold">QR Matrix</span> on your PC terminal.
                        </p>
                    </div>
                )}
            </div>

            <footer className="p-10 text-center">
                <div className="bg-white/5 border border-white/5 py-4 px-6 rounded-2xl flex items-center justify-center gap-3">
                    <Shield size={16} className="text-indigo-400" />
                    <span className="text-[11px] font-bold text-white/50 uppercase tracking-[0.1em]">
                        Verified: {address?.slice(0, 6)}...{address?.slice(-4)}
                    </span>
                </div>
            </footer>
        </div>
    );
}
