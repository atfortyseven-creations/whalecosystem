"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ShieldCheck, ArrowRight, Zap } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PricingSuccessPage() {
    const [mounted, setMounted] = useState(false);
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-[#FDFCF8] text-[#050505] font-sans flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-[#00C076]/10 to-transparent rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#050505]/5 to-transparent rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-lg w-full bg-white border border-[#050505]/10 rounded-[3rem] p-10 md:p-14 text-center relative z-10 shadow-2xl"
            >
                <div className="relative mx-auto w-24 h-24 mb-8">
                    <div className="absolute inset-0 bg-[#00C076] rounded-full animate-ping opacity-20" />
                    <div className="w-full h-full bg-[#00C076]/10 border border-[#00C076]/20 rounded-full flex items-center justify-center relative z-10">
                        <CheckCircle className="text-[#00C076]" size={48} />
                    </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#050505] mb-4">
                    Licencia Activada
                </h1>
                
                <p className="text-[#050505]/60 text-sm md:text-base font-medium leading-relaxed mb-10">
                    Su transacción se ha procesado con éxito. Su identidad soberana ha sido actualizada con los nuevos niveles de acceso y telemetría avanzada.
                </p>

                {sessionId && (
                    <div className="mb-10 p-4 rounded-2xl bg-[#FDFCF8] border border-[#050505]/5 flex flex-col items-center gap-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#050505]/40">ID de Sesión Segura</span>
                        <span className="text-xs font-mono text-[#050505]/60 break-all">{sessionId}</span>
                    </div>
                )}

                <div className="grid gap-4 w-full">
                    <Link href="/dashboard" className="w-full">
                        <button className="w-full h-14 rounded-2xl bg-[#050505] hover:bg-black/80 text-white font-bold uppercase tracking-widest text-xs flex justify-between items-center px-8 transition-all shadow-lg hover:shadow-xl">
                            Entrar al Terminal
                            <ArrowRight size={18} />
                        </button>
                    </Link>

                    <Link href="/api-marketplace/keys" className="w-full">
                        <button className="w-full h-14 rounded-2xl bg-white hover:bg-[#FDFCF8] border border-[#050505]/10 text-[#050505] font-bold uppercase tracking-widest text-xs flex justify-between items-center px-8 transition-all hover:border-[#050505]/30 group">
                            Gestionar API Keys
                            <Zap size={18} className="text-[#050505]/40 group-hover:text-[#00C076] transition-colors" />
                        </button>
                    </Link>
                </div>

                <div className="mt-12 pt-8 border-t border-[#050505]/5 flex items-center justify-center gap-2 text-[#050505]/40">
                    <ShieldCheck size={16} />
                    <span className="text-[10px] font-black uppercase tracking-[0.15em]">Garantizado por Whale Alert Network</span>
                </div>
            </motion.div>
        </div>
    );
}
