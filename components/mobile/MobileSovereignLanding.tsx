"use client";

import React, { useState, useEffect } from 'react';
import { Shield, QrCode, Zap, Hexagon, Fingerprint, Lock } from 'lucide-react';
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

    return (
        <div className="min-h-[100dvh] bg-[#080808] text-[#F2EEE1] font-sans flex flex-col relative overflow-y-auto w-full">
            {/* Elegant Noise */}
            <div className="fixed inset-0 z-0 opacity-10 mix-blend-overlay pointer-events-none bg-[url('/models/noise.png')] bg-repeat" />
            
            <header className="px-6 py-8 flex justify-between items-center relative z-10 border-b border-white/5 bg-[#080808]/80 backdrop-blur-md sticky top-0">
                <h1 className="font-aztec-serif text-2xl font-black tracking-tighter uppercase">Whale Alert</h1>
                 <Shield className="text-[#B6EA26]" size={24} />
            </header>

            <main className="flex-1 flex flex-col px-6 py-12 relative z-10 gap-12 w-full max-w-lg mx-auto">
                <section className="space-y-6">
                    <h2 className="text-[2.5rem] font-aztec-serif font-black leading-tight tracking-tight">
                        Institutional Grade <br/>
                        <span className="text-[#B6EA26]">On-Chain Base.</span>
                    </h2>
                    <p className="text-white/70 text-[13px] leading-[1.8] font-medium font-aztec-mono text-justify">
                        Welcome to the vanguard of decentralized finance. Our sovereign infrastructure tracks, analyzes, and decodes the most significant liquidity flows across the Web3 ecosystem. This legendary terminal is exclusively structured for desktop platforms to ensure maximum analytical fidelity and immersion. 
                    </p>
                    <div className="p-5 bg-[#C056DD]/10 border border-[#C056DD]/30 rounded-[1.5rem] flex gap-4 mt-2">
                        <Lock className="text-[#C056DD] mt-0.5 shrink-0" size={20} />
                        <p className="text-xs text-[var(--aztec-orchid,#C056DD)]/90 leading-relaxed font-bold font-aztec-mono">
                            MOBILE ACCESS IS RESTRICTED. TO VIEW THE FULL TERMINAL, ACCESS THIS PLATFORM ON A DESKTOP AND SCAN THE SYNCHRONIZATION CODE TO ESTABLISH YOUR SOVEREIGN LINK.
                        </p>
                    </div>
                </section>

                <div className="flex flex-col gap-4 mt-2">
                    {!isConnected ? (
                        <button 
                            onClick={() => open({ view: 'Connect' })}
                            className="w-full bg-[#B6EA26] text-[#080808] font-black font-aztec-mono uppercase tracking-widest py-5 rounded-[1.5rem] flex items-center justify-center gap-3 hover:bg-[#a0ce22] active:scale-[0.98] transition-all shadow-[0_0_40px_-10px_rgba(182,234,38,0.4)]"
                        >
                            <Fingerprint size={22} />
                            Establish Identity
                        </button>
                    ) : (
                        <div className="w-full bg-white/5 text-[#B6EA26] font-bold py-5 rounded-[1.5rem] flex items-center justify-center gap-3 border border-[#B6EA26]/50 shadow-[0_0_20px_-10px_rgba(182,234,38,0.2)]">
                            <Shield className="text-[#B6EA26]" size={22} />
                            <span className="font-aztec-mono">ID Auth: {address?.slice(0,6)}...{address?.slice(-4)}</span>
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
                        className={`w-full bg-transparent border border-white/20 text-white font-bold py-5 rounded-[1.5rem] flex items-center justify-center gap-3 uppercase font-aztec-mono tracking-widest transition-all active:scale-[0.98] ${!isConnected ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/5 hover:border-white/40'}`}
                    >
                        <QrCode size={22} />
                        Sync Desktop Terminal
                    </button>
                </div>

                <section className="space-y-4 mt-8">
                    <div className="bg-[#111] border border-white/5 rounded-[2rem] p-8 hover:bg-[#151515] transition-colors shadow-2xl">
                        <Hexagon className="text-[#B6EA26] mb-5" size={32} />
                        <h3 className="font-black text-xl mb-3 font-aztec-serif text-white tracking-tight">Absolute Precision</h3>
                        <p className="text-sm text-white/50 leading-relaxed font-medium">
                            Zero noise, pure cryptographic signal. Our architecture processes millions of transactions with a 0.5ms median latency to deliver pure flow analytics.
                        </p>
                    </div>

                    <div className="bg-[#111] border border-white/5 rounded-[2rem] p-8 hover:bg-[#151515] transition-colors shadow-2xl">
                        <Zap className="text-[#B6EA26] mb-5" size={32} />
                        <h3 className="font-black text-xl mb-3 font-aztec-serif text-white tracking-tight">Dark Pool Tracking</h3>
                        <p className="text-sm text-white/50 leading-relaxed font-medium">
                            Uncover the unseen. Specialized infrastructure mapped to trace multi-hop obfuscated transfers conducted by institutional entities.
                        </p>
                    </div>
                </section>

            </main>

            <footer className="px-6 py-12 text-center border-t border-white/5 relative z-10 bg-[#0A0A0A]">
                <p className="text-xs text-white/30 font-aztec-mono uppercase tracking-[0.3em] font-bold">
                    The Protocol of Sovereign Privacy <br/><br/> © 2026 Web3 Operations
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
        <div className="min-h-[100dvh] bg-black text-white flex flex-col relative w-full">
            <header className="px-6 py-6 flex items-center justify-between z-20 border-b border-white/5 bg-black">
                <button onClick={onBack} className="text-white/80 hover:text-white px-5 py-2.5 bg-white/10 rounded-xl text-xs font-black uppercase font-aztec-mono tracking-widest transition-colors">Abort Sync</button>
                <QrCode className="text-[#B6EA26]" size={24} />
            </header>
            
            <div className="flex-1 flex flex-col items-center justify-center -mt-10 p-6 z-10">
                <div className="w-full max-w-[400px]">
                    <div id="sovereign-qr-reader" className="bg-[#111] rounded-[2rem] border border-[#B6EA26]/50 overflow-hidden shadow-[0_0_60px_-10px_rgba(182,234,38,0.2)]" />
                </div>
                
                <div className="mt-12 text-center max-w-[320px]">
                    <h3 className="font-black text-2xl font-aztec-serif mb-4 text-white">Initialize Link</h3>
                    <p className="text-white/60 text-sm font-medium leading-relaxed font-aztec-mono text-justify">
                        Point your sovereign scanner at the sync code displayed on your <span className="text-[#B6EA26]">desktop terminal</span>. The link is encrypted end-to-end.
                    </p>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{__html: `
                #sovereign-qr-reader { border: none !important; }
                #sovereign-qr-reader button { background: #B6EA26; color: black; font-weight: 900; border-radius: 12px; border: none; padding: 12px 24px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 24px; cursor: pointer; font-family: monospace; }
                #sovereign-qr-reader a { display: none !important; }
                #sovereign-qr-reader img { display: none !important; }
                #sovereign-qr-reader span { color: rgba(255,255,255,0.4) !important; font-family: monospace; margin-top: 10px; display: block; }
                #sovereign-qr-reader video { border-radius: 1.5rem !important; }
                #qr-shaded-region { border-color: rgba(10,10,10,0.85) !important; }
            `}} />
        </div>
    );
}
