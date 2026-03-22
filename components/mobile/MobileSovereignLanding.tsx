"use client";

import React, { useState, useEffect } from 'react';
import { Shield, QrCode, Zap, Hexagon, Fingerprint, Lock, Globe, Cpu, MoveRight } from 'lucide-react';
import { useAppKit } from '@reown/appkit/react';
import { useAccount } from 'wagmi';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { toast } from 'sonner';

export function MobileSovereignLanding() {
    const { open } = useAppKit();
    const { isConnected, address } = useAccount();
    const [view, setView] = useState<'landing' | 'scanner'>('landing');

    if (view === 'scanner') {
        return <MobileQRScanner onBack={() => setView('landing')} />;
    }

    // Direct MetaMask App Link Logic
    const handleMetaMaskDeepLink = () => {
        // If they are already in a dapp browser (like metamask's internal browser), window.ethereum exists
        if (typeof window !== 'undefined' && (window as any).ethereum) {
            open({ view: 'Connect' });
        } else {
            // Force open MetaMask app on iOS/Android via universal link
            window.location.href = 'https://metamask.app.link/dapp/www.humanidfi.com';
        }
    };

    return (
        <div className="min-h-[100dvh] bg-[var(--aztec-parchment)] text-[var(--aztec-ink)] font-sans flex flex-col relative overflow-y-auto w-full selection:bg-[var(--aztec-orchid)]/30">
            {/* Elegant Noise Background */}
            <div className="fixed inset-0 z-0 opacity-[0.03] mix-blend-overlay pointer-events-none bg-[url('/models/noise.png')] bg-repeat" />
            
            <header className="px-6 py-6 flex justify-between items-center relative z-10 border-b border-[var(--aztec-ink)]/10 bg-[var(--aztec-parchment)]/80 backdrop-blur-xl sticky top-0">
                <h1 className="font-aztec-serif text-xl font-black tracking-tight uppercase flex items-center gap-2">
                    <Shield className="text-[var(--aztec-ink)]" size={18} />
                    Aztec Network
                </h1>
                 <div className="text-[10px] font-aztec-mono font-black tracking-widest uppercase opacity-40">Mobile Node</div>
            </header>

            <main className="flex-1 flex flex-col relative z-10 w-full max-w-lg mx-auto pb-24">
                
                {/* HERO SECTION */}
                <section className="px-6 py-16 space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-[var(--aztec-chartreuse)]/20 blur-[80px] rounded-full pointer-events-none" />
                    
                    <div>
                        <div className="font-aztec-mono text-[10px] text-[var(--aztec-ink)]/50 uppercase tracking-[0.4em] mb-4">The Protocol of Sovereign Privacy</div>
                        <h2 className="text-[3rem] font-aztec-h1 text-[var(--aztec-ink)] leading-[0.85] tracking-tighter mb-6">
                            Introduction <br/>
                            <span className="italic text-[var(--aztec-orchid)]">to Aztec.</span>
                        </h2>
                    </div>

                    <p className="text-[var(--aztec-ink)]/70 text-sm leading-[1.8] font-medium font-aztec-body text-justify">
                        Welcome to the vanguard of decentralized finance. Built entirely from scratch, our sovereign infrastructure tracks, analyzes, and decodes the most significant liquidity flows across the Web3 ecosystem with absolute cryptographic perfection.
                    </p>

                    <div className="p-5 bg-[var(--aztec-ink)] rounded-[1.5rem] flex gap-4 mt-6 shadow-2xl">
                        <Lock className="text-[var(--aztec-parchment)] mt-0.5 shrink-0" size={20} />
                        <p className="text-[11px] text-[var(--aztec-parchment)]/90 leading-relaxed font-black font-aztec-mono uppercase tracking-widest text-justify">
                            Full terminal features are restricted to desktop. Initialize your identity here, then scan the QR code on your PC to orchestrate the sovereign handshake.
                        </p>
                    </div>
                </section>

                {/* AUTHENTICATION MATRIX */}
                <section className="px-6 space-y-4">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-px bg-[var(--aztec-ink)]/10 flex-1" />
                        <span className="text-[10px] font-aztec-mono font-black tracking-[0.3em] uppercase opacity-40">Initialize Payload</span>
                        <div className="h-px bg-[var(--aztec-ink)]/10 flex-1" />
                    </div>

                    {!isConnected ? (
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={handleMetaMaskDeepLink}
                                className="w-full bg-[var(--aztec-ink)] text-[var(--aztec-parchment)] font-black font-aztec-mono uppercase tracking-widest py-5 rounded-[1.2rem] flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-xl"
                            >
                                <Hexagon size={18} />
                                Connect MetaMask 
                            </button>
                            
                            <button 
                                onClick={() => open({ view: 'Connect' })}
                                className="w-full bg-white border border-[var(--aztec-ink)]/10 text-[var(--aztec-ink)] font-black font-aztec-mono uppercase tracking-widest py-5 rounded-[1.2rem] flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-sm"
                            >
                                <Globe size={18} />
                                Google / Social Auth
                            </button>
                        </div>
                    ) : (
                        <div className="w-full bg-[var(--aztec-chartreuse)]/20 text-[var(--aztec-ink)] font-black py-5 rounded-[1.2rem] flex items-center justify-center gap-3 border border-[var(--aztec-chartreuse)]/50">
                            <Shield size={20} />
                            <span className="font-aztec-mono tracking-widest">ID: {address?.slice(0,6)}...{address?.slice(-4)}</span>
                        </div>
                    )}

                    <button 
                        onClick={() => {
                            if (!isConnected) {
                                toast.error('Establish your identity first to sync a session.');
                                return;
                            }
                            setView('scanner');
                        }}
                        className={`w-full mt-4 bg-transparent border-2 border-[var(--aztec-orchid)]/30 text-[var(--aztec-ink)] font-black py-5 rounded-[1.2rem] flex items-center justify-between px-6 uppercase font-aztec-mono tracking-widest transition-all active:scale-[0.98] shadow-sm ${!isConnected ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:bg-[var(--aztec-orchid)]/5'}`}
                    >
                        <div className="flex items-center gap-3">
                            <QrCode size={20} className="text-[var(--aztec-orchid)]" />
                            <span>Scan PC Terminal</span>
                        </div>
                        <MoveRight size={20} className="text-[var(--aztec-ink)]/40" />
                    </button>
                </section>

                {/* ARCHITECTURE INTELLIGENCE */}
                <section className="px-6 space-y-4 mt-16">
                    <div className="font-aztec-mono text-[10px] text-[var(--aztec-ink)]/40 uppercase tracking-[0.4em] mb-6">System Architecture</div>
                    
                    <div className="bg-white border border-[var(--aztec-ink)]/5 rounded-[2rem] p-8 shadow-xl relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 opacity-5">
                            <Cpu size={120} />
                        </div>
                        <h3 className="font-black text-2xl mb-4 font-aztec-h3 text-[var(--aztec-ink)] tracking-tight">Zero-Knowledge Core</h3>
                        <p className="text-xs text-[var(--aztec-ink)]/60 leading-[1.8] font-medium font-aztec-body text-justify">
                            Engineered from the ground up, our architecture abstracts complex ZK proofs into a fluid mobile experience. We bypass bloated middleware to securely handshake with the master desktop terminal, ensuring your biometric wallet keys never leave your device.
                        </p>
                    </div>

                    <div className="bg-white border border-[var(--aztec-ink)]/5 rounded-[2rem] p-8 shadow-xl relative overflow-hidden">
                        <div className="absolute -right-4 -bottom-4 opacity-5">
                            <Zap size={120} />
                        </div>
                        <h3 className="font-black text-2xl mb-4 font-aztec-h3 text-[var(--aztec-ink)] tracking-tight">Dark Pool Tracking</h3>
                        <p className="text-xs text-[var(--aztec-ink)]/60 leading-[1.8] font-medium font-aztec-body text-justify">
                            Uncover the unseen. Specialized mobile infrastructure mapped to trace multi-hop obfuscated transfers conducted by institutional entities. Access pure flow analytics directly from your pocket.
                        </p>
                    </div>
                </section>

            </main>

            <footer className="px-6 py-10 text-center relative z-10">
                <p className="text-[10px] text-[var(--aztec-ink)]/30 font-aztec-mono uppercase tracking-[0.4em] font-black">
                    Whale Alert Network<br/><br/> © 2026 Sovereign Systems
                </p>
            </footer>
        </div>
    );
}

function MobileQRScanner({ onBack }: { onBack: () => void }) {
    const { address } = useAccount();
    
    useEffect(() => {
        let scanner: Html5QrcodeScanner | null = null;
        
        try {
            scanner = new Html5QrcodeScanner(
                "sovereign-qr-reader", 
                { fps: 10, qrbox: { width: 250, height: 250 } }, 
                false
            );
            
            scanner.render(async (decodedText) => {
                if (scanner) {
                    scanner.clear();
                }
                
                try {
                    const res = await fetch('/api/auth/qr-sync', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ token: decodedText, address })
                    });
                    
                    if (res.ok) {
                        toast.success('Terminal session synchronized successfully.');
                        onBack();
                    } else {
                        const errorMsg = await res.text();
                        toast.error('Sync failed: ' + errorMsg);
                        onBack();
                    }
                } catch (e: any) {
                    toast.error('Sync error: ' + e.message);
                    onBack();
                }
            }, (err) => {
                // Ignore silent scanner errors
            });
        } catch (e) {
            console.error(e);
        }

        return () => {
            if (scanner) scanner.clear().catch(() => {});
        };
    }, [address, onBack]);

    return (
        <div className="min-h-[100dvh] bg-[var(--aztec-ink)] text-[var(--aztec-parchment)] flex flex-col relative w-full selection:bg-[var(--aztec-orchid)]/30">
            <header className="px-6 py-6 flex items-center justify-between z-20 border-b border-white/5 bg-[var(--aztec-ink)]">
                <button onClick={onBack} className="text-[var(--aztec-parchment)]/80 hover:text-[var(--aztec-parchment)] px-5 py-2.5 bg-white/5 rounded-xl text-[10px] font-black uppercase font-aztec-mono tracking-widest transition-colors">Abort Sync</button>
                <QrCode className="text-[var(--aztec-chartreuse)]" size={24} />
            </header>
            
            <div className="flex-1 flex flex-col items-center justify-center -mt-10 p-6 z-10">
                <div className="w-full max-w-[400px]">
                    <div id="sovereign-qr-reader" className="bg-black rounded-[2rem] border-2 border-[var(--aztec-chartreuse)]/50 overflow-hidden shadow-[0_0_80px_-10px_rgba(182,234,38,0.15)]" />
                </div>
                
                <div className="mt-12 text-center max-w-[320px]">
                    <h3 className="font-black text-3xl font-aztec-h1 tracking-tight mb-4 text-[var(--aztec-parchment)]">Initialize Link</h3>
                    <p className="text-[var(--aztec-parchment)]/60 text-sm font-medium leading-[1.8] font-aztec-body text-justify">
                        Point your sovereign scanner at the sync code displayed on your <span className="text-[var(--aztec-chartreuse)] font-black">desktop terminal</span>. The quantum link is encrypted end-to-end.
                    </p>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{__html: `
                #sovereign-qr-reader { border: none !important; }
                #sovereign-qr-reader button { background: var(--aztec-chartreuse); color: var(--aztec-ink); font-weight: 900; border-radius: 12px; border: none; padding: 12px 24px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 24px; cursor: pointer; font-family: 'Space Mono', monospace; font-size: 10px; }
                #sovereign-qr-reader a { display: none !important; }
                #sovereign-qr-reader img { display: none !important; }
                #sovereign-qr-reader span { color: rgba(255,255,255,0.4) !important; font-family: 'Space Mono', monospace; font-size: 10px; margin-top: 10px; display: block; }
                #sovereign-qr-reader video { border-radius: 1.5rem !important; }
                #qr-shaded-region { border-color: rgba(10,10,10,0.85) !important; }
            `}} />
        </div>
    );
}
