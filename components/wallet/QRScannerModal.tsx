"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useAccount } from 'wagmi';

interface QRScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onScan?: (data: string) => void;
}

export default function QRScannerModal({ isOpen, onClose, onScan }: QRScannerModalProps) {
    const [error, setError] = useState<string | null>(null);
    const [scanning, setScanning] = useState(false);
    const { address } = useAccount();
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        if (isOpen) {
            setScanning(true);
            // Wait for DOM to be ready
            const timer = setTimeout(() => {
                try {
                    const scanner = new Html5QrcodeScanner(
                        "qr-reader",
                        { fps: 10, qrbox: { width: 250, height: 250 } },
                        /* verbose= */ false
                    );
                    scannerRef.current = scanner;

                    scanner.render(async (decodedText) => {
                        console.log("[QR:Scan] Detected:", decodedText);
                        try {
                            const url = new URL(decodedText);
                            const sessionId = url.searchParams.get("session");
                            
                            if (sessionId && address) {
                                // Execute Handshake
                                const res = await fetch(`/api/auth/qr-session?id=${sessionId}`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ address })
                                });

                                if (res.ok) {
                                    scanner.clear().catch(console.error);
                                    setScanning(false);
                                    if (onScan) onScan(decodedText);
                                    setTimeout(() => onClose(), 1000);
                                } else {
                                    setError("Handshake failed. Refresh the PC code.");
                                }
                            } else if (!address) {
                                setError("Connect your mobile wallet first.");
                            }
                        } catch (e) {
                            console.error("[QR:Error] Parse failure:", e);
                        }
                    }, (err) => {
                        // Scan errors are noisy, ignore them
                    });
                } catch (e) {
                    console.error("Scanner init error:", e);
                    setError("Camera access required for Sovereign Sync.");
                }
            }, 300);
            return () => clearTimeout(timer);
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
                scannerRef.current = null;
            }
        };
    }, [isOpen, address, onClose, onScan]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#FAF9F6]/95 backdrop-blur-2xl">
                    
                    <button 
                        onClick={onClose}
                        className="absolute top-6 right-6 p-4 rounded-full bg-[#050505]/5 text-[#050505] hover:bg-[#050505]/10 transition-all z-50 border border-[#050505]/10"
                    >
                        <X size={24} />
                    </button>

                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="w-full max-w-md flex flex-col items-center px-6 relative"
                    >
                        <div className="flex items-center gap-3 mb-8">
                             <img src="/official-whale-monochrome.png" className="w-8 h-8 opacity-90" alt="Whale" />
                             <h2 className="font-sans text-xl font-black text-[#050505] tracking-tighter uppercase">Link Session</h2>
                        </div>

                        <div className="relative w-full aspect-square max-w-[320px] bg-white border border-[#050505]/10 rounded-[32px] overflow-hidden shadow-2xl flex items-center justify-center">
                            {!error ? (
                                <div id="qr-reader" className="w-full h-full !border-none" />
                            ) : (
                                <div className="p-8 text-center space-y-4">
                                    <Shield size={32} className="mx-auto text-red-500 opacity-50" />
                                    <p className="text-red-500 text-[11px] font-black uppercase tracking-widest leading-relaxed">{error}</p>
                                    <button 
                                        onClick={() => setError(null)}
                                        className="text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 bg-black text-white rounded-full"
                                    >
                                        RETRY
                                    </button>
                                </div>
                            )}

                            {scanning && !error && (
                                <div className="absolute inset-0 pointer-events-none">
                                    <div className="absolute inset-x-8 top-1/2 h-[2px] bg-black/10 animate-pulse" />
                                    <div className="absolute inset-4 border-2 border-dashed border-black/5 rounded-2xl" />
                                </div>
                            )}
                        </div>

                        <div className="mt-10 text-center space-y-3">
                            <p className="text-[12px] text-[#050505]/60 leading-relaxed font-semibold max-w-[280px]">
                                Point your camera at the QR code displayed on the PC terminal to synchronize instantly.
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
