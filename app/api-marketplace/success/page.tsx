"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UniversalEliteWallpaper } from '@/components/shared/UniversalEliteWallpaper';
import Link from 'next/link';

export default function PaymentSuccessPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
            <div className="fixed inset-0 z-0">
                <UniversalEliteWallpaper />
            </div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-black/60 backdrop-blur-3xl border border-white/10 rounded-3xl p-10 text-center relative z-10 shadow-[0_0_100px_rgba(99,102,241,0.15)]"
            >
                <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                    <CheckCircle className="text-green-400" size={40} />
                </div>

                <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">
                    Tier Activated
                </h1>
                
                <p className="text-white/40 text-sm font-medium uppercase tracking-[0.2em] mb-12">
                    Your Elite access is now live. All rate limits and premium features have been synchronized.
                </p>

                <div className="grid gap-4">
                    <Link href="/api-marketplace/keys">
                        <Button className="w-full h-14 bg-indigo-500 hover:bg-indigo-600 text-white font-bold uppercase tracking-widest text-xs flex justify-between items-center px-8 group">
                            Generate New API Keys
                            <Zap size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>

                    <Link href="/vip">
                        <Button className="w-full h-14 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold uppercase tracking-widest text-xs flex justify-between items-center px-8">
                            Open Master Grid
                            <ArrowRight size={18} />
                        </Button>
                    </Link>
                </div>

                <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-center gap-2 opacity-30">
                    <ShieldCheck size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Secured by Whale Alert Engine</span>
                </div>
            </motion.div>
        </div>
    );
}


