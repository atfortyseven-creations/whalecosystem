"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, QrCode, Hexagon, Globe, ShoppingBag, Eye, Zap, ChevronDown, CheckCircle2, MoveRight } from 'lucide-react';
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

    const handleMetaMaskDeepLink = () => {
        if (typeof window !== 'undefined' && (window as any).ethereum) {
            open({ view: 'Connect' });
        } else {
            window.location.href = 'https://metamask.app.link/dapp/www.humanidfi.com';
        }
    };

    return (
        <div className="h-[100dvh] w-full bg-[#050505] text-white font-sans overflow-y-auto snap-y snap-mandatory scroll-smooth hide-scrollbar relative">
            <style dangerouslySetInnerHTML={{__html: `
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />

            {/* PAGE 1: HERO */}
            <section className="h-[100dvh] w-full snap-start relative flex flex-col justify-center items-center px-6 overflow-hidden bg-black">
                <div className="absolute inset-0 bg-gradient-to-b from-[#b6ea26]/10 to-transparent opacity-50 pointer-events-none" />
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center z-10"
                >
                    <div className="w-24 h-24 bg-[#b6ea26] rounded-[2.5rem] mx-auto mb-10 flex items-center justify-center shadow-[0_0_120px_rgba(182,234,38,0.3)]">
                        <Shield className="text-black" size={48} strokeWidth={1.5} />
                    </div>
                    <h1 className="text-[3rem] font-black tracking-tighter mb-6 leading-[1.1]">Whale Alert<br/>Network</h1>
                    <p className="text-white/60 text-[1.1rem] leading-relaxed max-w-[280px] mx-auto font-medium">
                        The most powerful crypto tracker in the world. See what the whales are doing.
                    </p>
                </motion.div>
                
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="absolute bottom-12 flex flex-col items-center gap-2 text-white/30"
                >
                    <span className="text-[10px] uppercase tracking-widest font-bold">Swipe Down</span>
                    <ChevronDown size={24} className="animate-bounce" />
                </motion.div>
            </section>

            {/* PAGE 2: WHAT IT DOES */}
            <section className="h-[100dvh] w-full snap-start relative flex flex-col justify-center px-8 overflow-hidden bg-[#0A0A0A]">
                <motion.div 
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-16"
                >
                    <div>
                        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/5">
                            <Eye className="text-[#b6ea26]" size={28} />
                        </div>
                        <h2 className="text-[2.5rem] font-black tracking-tighter mb-4 leading-none">Total<br/>Visibility.</h2>
                        <p className="text-white/60 text-lg leading-relaxed font-medium">
                            We monitor the blockchain 24/7. When millions of dollars move, you will be the first to know.
                        </p>
                    </div>

                    <div>
                        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/5">
                            <Zap className="text-[#b6ea26]" size={28} />
                        </div>
                        <h2 className="text-[2.5rem] font-black tracking-tighter mb-4 leading-none">Real-Time<br/>Alerts.</h2>
                        <p className="text-white/60 text-lg leading-relaxed font-medium">
                            A completely immersive environment that translates complex data into simple, instant notifications.
                        </p>
                    </div>
                </motion.div>
            </section>

            {/* PAGE 3: MERCH */}
            <section className="h-[100dvh] w-full snap-start relative flex flex-col justify-center items-center px-6 overflow-hidden bg-black">
                <div className="absolute inset-0 bg-gradient-to-t from-[#111] to-transparent pointer-events-none" />
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-sm"
                >
                    <div className="bg-[#111] border border-white/5 rounded-[3rem] p-10 text-center shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#b6ea26]/10 blur-[50px] rounded-full pointer-events-none" />
                        
                        <div className="w-20 h-20 bg-white/5 rounded-full mx-auto flex items-center justify-center mb-8 border border-white/10">
                            <ShoppingBag className="text-white" size={32} />
                        </div>
                        <h2 className="text-4xl font-black tracking-tighter mb-4">Official<br/>Merch</h2>
                        <p className="text-white/60 text-base leading-relaxed mb-10 font-medium">
                            Premium clothing for the elite. Wear the network. Rep the identity in the real world.
                        </p>
                        <button className="w-full bg-white text-black font-black text-lg py-5 rounded-full flex items-center justify-center gap-3 active:scale-[0.98] transition-all">
                            Shop Now <MoveRight size={20} />
                        </button>
                    </div>
                </motion.div>
            </section>

            {/* PAGE 4: CONNECT / ACCESS */}
            <section className="h-[100dvh] w-full snap-start relative flex flex-col justify-center px-6 overflow-hidden bg-[#050505]">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-[#b6ea26]/10 blur-[120px] rounded-full pointer-events-none" />
                
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-sm mx-auto z-10"
                >
                    <h2 className="text-[3rem] font-black tracking-tighter mb-4 text-center leading-none">Enter The<br/>Network.</h2>
                    <p className="text-white/60 text-center text-[1.1rem] font-medium mb-12">
                        Connect your wallet to access the full terminal on your PC.
                    </p>

                    <div className="space-y-4">
                        {!isConnected ? (
                            <>
                                <button 
                                    onClick={handleMetaMaskDeepLink}
                                    className="w-full bg-[#b6ea26] text-black font-black uppercase tracking-widest py-6 rounded-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-[0_0_40px_rgba(182,234,38,0.2)]"
                                >
                                    <Hexagon size={24} />
                                    Connect MetaMask
                                </button>
                                
                                <button 
                                    onClick={() => open({ view: 'Connect' })}
                                    className="w-full bg-white/5 border border-white/10 text-white font-bold uppercase tracking-widest py-6 rounded-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
                                >
                                    <Globe size={24} />
                                    Other Wallets
                                </button>
                            </>
                        ) : (
                            <div className="w-full bg-[#b6ea26]/10 border border-[#b6ea26]/30 text-[#b6ea26] font-bold py-6 rounded-2xl flex items-center justify-center gap-3">
                                <CheckCircle2 size={24} />
                                <span className="text-lg">Connected: {address?.slice(0,6)}...{address?.slice(-4)}</span>
                            </div>
                        )}

                        <button 
                            onClick={() => {
                                if (!isConnected) {
                                    open({ view: 'Connect' });
                                    return;
                                }
                                setView('scanner');
                            }}
                            className={`w-full mt-6 bg-transparent border-2 border-white/20 text-white font-bold py-6 rounded-2xl flex items-center justify-between px-8 uppercase tracking-widest transition-all active:scale-[0.98] ${!isConnected ? 'opacity-50 hover:bg-white/5 opacity-100' : 'hover:bg-white/5'}`}
                        >
                            <div className="flex items-center gap-4">
                                <QrCode size={24} />
                                <span>Scan PC Screen</span>
                            </div>
                            <MoveRight size={24} className="text-white/40" />
                        </button>
                    </div>
                </motion.div>
            </section>
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
                if (scanner) scanner.clear();
                
                try {
                    const res = await fetch('/api/auth/qr-sync', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ token: decodedText, address })
                    });
                    
                    if (res.ok) {
                        toast.success('Successfully connected to PC!');
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
            }, () => {});
        } catch (e) {
            console.error(e);
        }

        return () => {
            if (scanner) scanner.clear().catch(() => {});
        };
    }, [address, onBack]);

    return (
        <div className="h-[100dvh] bg-black text-white flex flex-col w-full">
            <header className="px-6 py-8 flex items-center justify-between z-20">
                <button onClick={onBack} className="text-white/80 hover:text-white px-6 py-3 bg-white/10 rounded-full text-sm font-bold transition-colors">Go Back</button>
                <QrCode className="text-[#b6ea26]" size={28} />
            </header>
            
            <div className="flex-1 flex flex-col items-center justify-center -mt-10 p-6 z-10">
                <div className="w-full max-w-[400px]">
                    <div id="sovereign-qr-reader" className="bg-[#050505] rounded-[3rem] border-2 border-[#b6ea26]/50 overflow-hidden shadow-[0_0_100px_-10px_rgba(182,234,38,0.2)]" />
                </div>
                
                <div className="mt-14 text-center max-w-[320px]">
                    <h3 className="font-black text-4xl tracking-tighter mb-4 text-white">Scan to Connect</h3>
                    <p className="text-white/60 text-lg leading-relaxed font-medium">
                        Point your camera at the <span className="text-[#b6ea26] font-bold">QR code</span> on your PC screen to securely log in.
                    </p>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{__html: `
                #sovereign-qr-reader { border: none !important; }
                #sovereign-qr-reader button { background: #b6ea26; color: black; font-weight: 900; border-radius: 100px; border: none; padding: 16px 32px; text-transform: uppercase; margin-bottom: 24px; cursor: pointer; font-family: inherit; font-size: 14px; letter-spacing: 1px;}
                #sovereign-qr-reader a, #sovereign-qr-reader img { display: none !important; }
                #sovereign-qr-reader span { color: rgba(255,255,255,0.4) !important; font-family: inherit; font-size: 14px; margin-top: 10px; display: block; }
                #sovereign-qr-reader video { border-radius: 2.8rem !important; }
                #qr-shaded-region { border-color: rgba(0,0,0,0.9) !important; border-width: 40px !important; }
            `}} />
        </div>
    );
}
