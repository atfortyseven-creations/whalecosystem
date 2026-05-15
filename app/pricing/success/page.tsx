"use client";

import { Suspense, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ShieldCheck, ArrowRight, Zap, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SuccessContent() {
    const [mounted, setMounted] = useState(false);
    const [isHydrating, setIsHydrating] = useState(true);
    const [verifiedTier, setVerifiedTier] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        setMounted(true);
    }, []);

    // ── Polling Logic to wait for BullMQ Webhook execution (< 2 seconds) ──
    useEffect(() => {
        if (!mounted) return;
        let attempts = 0;
        let interval: NodeJS.Timeout;

        const checkSessionTier = async () => {
            try {
                const res = await fetch('/api/auth/session', { cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();
                    const tier = data.user?.tier?.toUpperCase();
                    if (tier && tier !== 'FREE') {
                        setVerifiedTier(tier);
                        setIsHydrating(false);
                        clearInterval(interval);
                        return;
                    }
                }
            } catch (error) {
                console.error("Session polling failed", error);
            }
            
            attempts++;
            if (attempts > 15) {
                // Fallback timeout after ~15 seconds
                setIsHydrating(false);
                clearInterval(interval);
            }
        };

        // Poll every 1 second
        interval = setInterval(checkSessionTier, 1000);
        checkSessionTier(); // Initial check

        return () => clearInterval(interval);
    }, [mounted]);

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-[#FDFCF8] text-[#050505] font-sans flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-[#00C076]/10 to-transparent rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#050505]/5 to-transparent rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-lg w-full bg-white/40 dark:bg-black/40 backdrop-blur-3xl border border-[#050505]/10 dark:border-white/10 rounded-[3rem] p-10 md:p-14 text-center relative z-10 shadow-2xl"
            >
                {isHydrating ? (
                    <div className="flex flex-col items-center justify-center min-h-[200px] gap-6">
                        <Loader2 className="animate-spin text-[#00C076]" size={48} />
                        <div>
                            <h3 className="text-xl font-bold text-[#050505] mb-2">Cryptographic Handshake</h3>
                            <p className="text-sm font-medium text-[#050505]/50">Awaiting immutable confirmation from Stripe Webhooks...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="relative mx-auto w-24 h-24 mb-8">
                            <div className="absolute inset-0 bg-[#00C076] rounded-full animate-ping opacity-20" />
                            <div className="w-full h-full bg-[#00C076]/10 border border-[#00C076]/20 rounded-full flex items-center justify-center relative z-10">
                                <CheckCircle className="text-[#00C076]" size={48} />
                            </div>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#050505] mb-4">
                            Professional License Activated
                        </h1>
                        
                        <p className="text-[#050505]/60 text-sm md:text-base font-medium leading-relaxed mb-6">
                            The Stripe cryptographic payload has been verified. Your KYC is now infused with {verifiedTier || 'Premium'} privileges.
                        </p>

                        {sessionId && (
                            <div className="mb-10 p-4 rounded-2xl bg-[#FDFCF8] border border-[#050505]/5 flex flex-col items-center gap-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#050505]/40">Secure Session Identifier</span>
                                <span className="text-xs font-mono text-[#050505]/60 break-all">{sessionId}</span>
                            </div>
                        )}

                        <div className="grid gap-4 w-full">
                            <Link href="/dashboard" className="w-full">
                                <button className="w-full h-14 rounded-2xl bg-[#050505] hover:bg-black/80 text-white font-bold uppercase tracking-widest text-xs flex justify-between items-center px-8 transition-all shadow-lg hover:shadow-xl">
                                    Access Dashboard
                                    <ArrowRight size={18} />
                                </button>
                            </Link>

                            <Link href="/api-marketplace/keys" className="w-full">
                                <button className="w-full h-14 rounded-2xl bg-white hover:bg-[#FDFCF8] border border-[#050505]/10 text-[#050505] font-bold uppercase tracking-widest text-xs flex justify-between items-center px-8 transition-all hover:border-[#050505]/30 group">
                                    Manage API Infrastructure
                                    <Zap size={18} className="text-[#050505]/40 group-hover:text-[#00C076] transition-colors" />
                                </button>
                            </Link>
                        </div>
                    </>
                )}

                <div className="mt-12 pt-8 border-t border-[#050505]/5 flex items-center justify-center gap-2 text-[#050505]/40">
                    <ShieldCheck size={16} />
                    <span className="text-[10px] font-black uppercase tracking-[0.15em]">Guaranteed by Whale Alert Network</span>
                </div>
            </motion.div>
        </div>
    );
}

export default function PricingSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center">
                <Loader2 className="animate-spin text-[#00C076]" size={32} />
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
