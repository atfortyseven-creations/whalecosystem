"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Camera, Loader, RefreshCcw } from 'lucide-react';

type ScanState = 'idle' | 'requesting' | 'scanning' | 'validating' | 'success' | 'error';

interface QrScannerProps {
    className?: string;
}

export function QrScanner({ className }: QrScannerProps) {
    const [state, setState] = useState<ScanState>('idle');
    const [message, setMessage] = useState('');
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const rafRef = useRef<number>(0);
    const detectorRef = useRef<BarcodeDetector | null>(null);
    const isRunningRef = useRef(false);

    // Stop all camera resources
    const stopCamera = useCallback(() => {
        isRunningRef.current = false;
        cancelAnimationFrame(rafRef.current);
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        if (videoRef.current) videoRef.current.srcObject = null;
    }, []);

    useEffect(() => () => stopCamera(), [stopCamera]);

    // Scan loop using BarcodeDetector or canvas fallback
    const scanLoop = useCallback(async (detector: BarcodeDetector) => {
        if (!isRunningRef.current || !videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (ctx) {
                ctx.drawImage(video, 0, 0);
                try {
                    const codes = await detector.detect(canvas);
                    if (codes.length > 0 && isRunningRef.current) {
                        isRunningRef.current = false;
                        cancelAnimationFrame(rafRef.current);
                        await handleDecode(codes[0].rawValue);
                        return;
                    }
                } catch { /* detection error — keep scanning */ }
            }
        }
        rafRef.current = requestAnimationFrame(() => scanLoop(detector));
    }, []);

    const handleDecode = async (decodedText: string) => {
        setState('validating');
        stopCamera();
        try {
            let token = decodedText;
            try {
                const url = new URL(decodedText);
                token = url.searchParams.get('token') ?? decodedText;
            } catch {}

            const res = await fetch(`/api/bridge/generate?token=${encodeURIComponent(token)}`);
            const data = await res.json();
            if (data.valid) {
                setState('success');
                setMessage(data.message ?? 'Device successfully linked to your account!');
            } else {
                setState('error');
                setMessage(data.error ?? 'Invalid or expired QR code.');
            }
        } catch {
            setState('error');
            setMessage('Network error. Please check your connection and try again.');
        }
    };

    const startCamera = async () => {
        setState('requesting');
        stopCamera();

        try {
            // Check BarcodeDetector support
            if (!('BarcodeDetector' in window)) {
                setState('error');
                setMessage('QR scanning is not supported in this browser. Please use Chrome or Safari 17+.');
                return;
            }

            detectorRef.current = new BarcodeDetector({ formats: ['qr_code'] });

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
            });

            streamRef.current = stream;

            if (!videoRef.current) { stopCamera(); return; }
            videoRef.current.srcObject = stream;
            await videoRef.current.play();

            isRunningRef.current = true;
            setState('scanning');
            rafRef.current = requestAnimationFrame(() => scanLoop(detectorRef.current!));

        } catch (err: unknown) {
            const error = err as DOMException;
            stopCamera();
            setState('error');
            if (error.name === 'NotAllowedError') {
                setMessage('Camera access denied. Tap "Allow" when prompted, then try again.');
            } else if (error.name === 'NotFoundError') {
                setMessage('No camera found on this device.');
            } else {
                setMessage(`Camera error: ${error.message ?? 'Unknown error'}. Try again.`);
            }
        }
    };

    const reset = () => { stopCamera(); setState('idle'); setMessage(''); };

    return (
        <div className={`w-full flex flex-col items-center gap-6 ${className ?? ''}`}>
            {/* Hidden video + canvas — always mounted for instant access */}
            <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className="absolute opacity-0 pointer-events-none w-0 h-0"
                aria-hidden
            />
            <canvas ref={canvasRef} className="hidden" aria-hidden />

            <AnimatePresence mode="wait">
                {/* IDLE */}
                {state === 'idle' && (
                    <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-6 w-full">
                        <div className="relative w-64 h-64 rounded-3xl border border-[var(--aztec-orchid)]/30 bg-white/3 flex flex-col items-center justify-center overflow-hidden backdrop-blur-md">
                            <div className="absolute top-3 left-3 w-7 h-7 border-t-2 border-l-2 border-[var(--aztec-orchid)] rounded-tl-2xl" />
                            <div className="absolute top-3 right-3 w-7 h-7 border-t-2 border-r-2 border-[var(--aztec-orchid)] rounded-tr-2xl" />
                            <div className="absolute bottom-3 left-3 w-7 h-7 border-b-2 border-l-2 border-[var(--aztec-orchid)] rounded-bl-2xl" />
                            <div className="absolute bottom-3 right-3 w-7 h-7 border-b-2 border-r-2 border-[var(--aztec-orchid)] rounded-br-2xl" />
                            <Camera size={36} className="text-white/20 mb-2" />
                            <span className="text-[9px] font-mono uppercase tracking-widest text-white/30">Awaiting Activation</span>
                            <motion.div animate={{ y: [-90, 90] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="absolute left-6 right-6 h-0.5 bg-[var(--aztec-orchid)] shadow-[0_0_12px_var(--aztec-orchid)] opacity-40" />
                        </div>
                        <button onClick={startCamera}
                            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[var(--aztec-orchid)] to-purple-600 text-white font-mono text-[11px] uppercase tracking-widest font-bold shadow-[0_0_30px_rgba(168,85,247,0.35)] active:scale-95 transition-all flex items-center justify-center gap-3">
                            <Camera size={16} /> Activate Sovereign Camera
                        </button>
                    </motion.div>
                )}

                {/* REQUESTING */}
                {state === 'requesting' && (
                    <motion.div key="requesting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-4 py-16">
                        <div className="w-14 h-14 rounded-full border-2 border-[var(--aztec-orchid)] border-t-transparent animate-spin" />
                        <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">Requesting camera access…</p>
                    </motion.div>
                )}

                {/* VALIDATING */}
                {state === 'validating' && (
                    <motion.div key="validating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-4 py-16">
                        <Loader size={36} className="animate-spin text-[var(--aztec-orchid)]" />
                        <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">Validating bridge token…</p>
                    </motion.div>
                )}

                {/* SCANNING — live camera viewfinder */}
                {state === 'scanning' && (
                    <motion.div key="scanning" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-5 w-full">
                        <div className="relative w-72 h-72 rounded-3xl overflow-hidden border border-[var(--aztec-orchid)]/50 shadow-[0_0_40px_rgba(168,85,247,0.2)]">
                            {/* Mirror the video into view */}
                            <video ref={undefined} /* already mounted above */
                                className="hidden" />
                            {/* Use a visible video element */}
                            <LiveVideoView videoRef={videoRef} />
                            {/* Scan overlay */}
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-[var(--aztec-orchid)] rounded-tl-2xl" />
                                <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-[var(--aztec-orchid)] rounded-tr-2xl" />
                                <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-[var(--aztec-orchid)] rounded-bl-2xl" />
                                <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-[var(--aztec-orchid)] rounded-br-2xl" />
                                <motion.div animate={{ y: [-100, 100] }} transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
                                    className="absolute left-6 right-6 h-0.5 bg-[var(--aztec-orchid)] shadow-[0_0_16px_var(--aztec-orchid)]" />
                            </div>
                        </div>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--aztec-orchid)]/70 animate-pulse">
                            Point at the QR code on your PC screen
                        </p>
                        <button onClick={reset} className="text-white/30 text-xs font-mono uppercase tracking-widest hover:text-white/60 transition-colors">
                            Cancel
                        </button>
                    </motion.div>
                )}

                {/* SUCCESS */}
                {state === 'success' && (
                    <motion.div key="success" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-5 text-center py-8">
                        <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 0.6, type: 'spring' }}
                            className="w-20 h-20 rounded-full bg-[var(--aztec-chartreuse)]/10 border border-[var(--aztec-chartreuse)]/30 flex items-center justify-center">
                            <CheckCircle size={40} className="text-[var(--aztec-chartreuse)]" />
                        </motion.div>
                        <h3 className="font-mono text-xl font-bold text-white tracking-tight">Bridge Established</h3>
                        <p className="text-xs text-white/60 max-w-xs leading-relaxed">{message}</p>
                        <button onClick={reset}
                            className="mt-2 px-6 py-2 rounded-lg border border-white/10 text-white/50 text-[10px] uppercase tracking-widest font-mono hover:bg-white/5 transition-colors flex items-center gap-2">
                            <RefreshCcw size={12} /> Scan another
                        </button>
                    </motion.div>
                )}

                {/* ERROR */}
                {state === 'error' && (
                    <motion.div key="error" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-5 text-center py-8">
                        <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                            <XCircle size={40} className="text-red-400" />
                        </div>
                        <h3 className="font-mono text-xl font-bold text-white tracking-tight">Link Failed</h3>
                        <p className="text-xs text-white/60 max-w-xs leading-relaxed">{message}</p>
                        <button onClick={reset}
                            className="mt-2 px-6 py-2 rounded-xl bg-[var(--aztec-orchid)]/10 border border-[var(--aztec-orchid)]/20 text-[var(--aztec-orchid)] text-[10px] uppercase tracking-widest font-mono hover:bg-[var(--aztec-orchid)]/20 transition-colors">
                            Try Again
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Sub-component that renders the live video in the viewfinder
function LiveVideoView({ videoRef }: { videoRef: React.RefObject<HTMLVideoElement | null> }) {
    const localRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const source = videoRef.current;
        const target = localRef.current;
        if (!source || !target) return;
        // Share the same MediaStream
        const stream = source.srcObject as MediaStream | null;
        if (stream) {
            target.srcObject = stream;
            target.play().catch(() => {});
        }
    }, [videoRef]);

    return (
        <video
            ref={localRef}
            playsInline
            muted
            autoPlay
            className="w-full h-full object-cover"
        />
    );
}
