'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { VerificationLevel, ISuccessResult } from '@worldcoin/idkit';
import { useWorld } from '@/src/context/WorldContext';
import { ScanFace } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAccount } from 'wagmi';
import { useUser } from '@clerk/nextjs';

const IDKitWidget = dynamic(() => import('@worldcoin/idkit').then((mod) => mod.IDKitWidget), {
    ssr: false,
    loading: () => <div className="w-full h-16 animate-pulse bg-white/10 rounded-full" />
});

// 🔥 WHITELIST: Usuarios que NO necesitan World ID verification
const EMAIL_WHITELIST = [
    'axel111@hotmail.es',
    'josejordan20222@gmail.com'
];

export const WorldGate = ({ children }: { children: React.ReactNode }) => {
    const { isVerified, verifyIdentity, isLoading } = useWorld();
    const { address } = useAccount();
    const { user, isLoaded: isUserLoaded } = useUser();
    const [showSuccess, setShowSuccess] = useState(false);

    // Check if user email is whitelisted
    const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
    const isWhitelisted = userEmail ? EMAIL_WHITELIST.includes(userEmail) : false;

    // HARDCODE PARA EVITAR ERRORES DE ENV EN DEPLOY
    const APP_ID = "app_affe7470221b57a8edee20b3ac30c484";
    const ACTION = "whale-alert-terminal";

    useEffect(() => {
        if (isWhitelisted && user) {
            console.log(`✅ [WHITELIST] User ${userEmail} bypassing World ID verification`);
        }
    }, [isWhitelisted, userEmail, user]);

    useEffect(() => {
        const handleTrigger = () => {
            // Find and click the hidden verify button if it exists
            const btn = document.getElementById('hidden-world-id-trigger');
            if (btn) btn.click();
        };

        window.addEventListener('TRIGGER_WORLD_ID_MODAL', handleTrigger);
        return () => window.removeEventListener('TRIGGER_WORLD_ID_MODAL', handleTrigger);
    }, []);

    useEffect(() => {
        if (!isVerified && !isLoading && !isWhitelisted) {
            console.log("--------------------------------------------------");
            console.log("👁️ WORLD ID DEBUGGER");
            console.log(`🔹 Active App ID: ${APP_ID}`);
            console.log(`🔹 Required Action: ${ACTION}`);
            console.log("--------------------------------------------------");
        }
    }, [isVerified, isLoading, APP_ID, isWhitelisted]);

    const handleProof = async (result: ISuccessResult) => {
        if (!address) {
            toast.error("Por favor conecta tu wallet primero");
            return;
        }

        const toastId = toast.loading("Verificando prueba criptográfica (ZK-Proof)...");

        try {
            const res = await fetch('/api/auth/verify-world-id', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    proof: result,
                    walletAddress: address 
                }),
            });

            const data = await res.json();

            if (!res.ok || !data.verified) {
                throw new Error(data.detail || "Verificación fallida");
            }

            toast.dismiss(toastId);
            toast.success("✨ Identidad Soberana Verificada");
            await verifyIdentity(data);
            setShowSuccess(true);

        } catch (error: any) {
            toast.dismiss(toastId);
            const errorMessage = error.message || "Error desconocido al verificar.";
            toast.error(`Error: ${errorMessage}`);
            console.error("Verification Error details:", error);
        }
    };

    // Loading State to prevent flash of lock screen
    if (isLoading || !isUserLoaded) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0B0E11]">
                <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
            </div>
        );
    }

    // ✅ BYPASS: Si el usuario está en la whitelist, permitir acceso directo
    if (isWhitelisted) {
        return <>{children}</>;
    }

    return (
        <div className="relative h-full w-full">
            <AnimatePresence>
                {!isVerified && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0B0E11]/95 backdrop-blur-xl transition-all duration-500"
                    >
                        {/* Lock Screen Content */}
                        <div className="text-center space-y-6 max-w-md px-6">
                            <motion.div 
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 border border-white/10 mb-4 animate-pulse"
                            >
                                <ScanFace size={40} className="text-white" />
                            </motion.div>
                            
                            <h1 className="text-3xl font-bold tracking-tighter text-white">
                                IDENTITY REQUIRED
                            </h1>
                            <p className="text-gray-400 text-lg leading-relaxed">
                                Access to the <span className="text-white font-semibold">Professional Trading Terminal</span> is restricted to verified humans only.
                            </p>

                            <div className="pt-4">
                                <IDKitWidget
                                    app_id={APP_ID as `app_${string}`}
                                    action={ACTION}
                                    onSuccess={handleProof}
                                    handleVerify={async (proof: unknown) => {
                                        return;
                                    }}
                                    verification_level={VerificationLevel.Orb}
                                    action_description="Identity Verification by Whale Alert"
                                >
                                    {({ open }: { open: () => void }) => (
                                        <>
                                            <button
                                                onClick={open}
                                                className="w-full group relative flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_0_50px_rgba(255,255,255,0.3)]"
                                            >
                                                <div className="absolute inset-0 bg-white rounded-full opacity-0 group-hover:opacity-20 animate-ping transition-opacity" />
                                                <ScanFace size={24} />
                                                <span>VERIFY WITH WORLD ID</span>
                                            </button>
                                            {/* Hidden trigger for programmatic access from trade store */}
                                            <button 
                                                id="hidden-world-id-trigger" 
                                                onClick={open} 
                                                className="hidden" 
                                                aria-hidden="true" 
                                            />
                                        </>
                                    )}
                                </IDKitWidget>
                            </div>
                            
                            <p className="text-xs text-center text-gray-500 pt-4 font-mono">
                                SECURED BY WORLDCOIN · ZERO KNOWLEDGE PROOF
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="fixed inset-0 z-[110] flex items-center justify-center bg-[#0B0E11]/60 backdrop-blur-3xl p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            className="glass-premium p-8 md:p-12 rounded-[2.5rem] border border-emerald-500/20 text-center space-y-8 max-w-lg w-full shadow-2xl shadow-emerald-500/10"
                        >
                            {/* Success Modal Content */}
                            <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                                <div className="w-16 h-16 bg-emerald-500/40 rounded-full flex items-center justify-center animate-pulse">
                                    <ScanFace className="text-emerald-400" size={40} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase">Identity Verified</h2>
                                <p className="text-emerald-400/80 font-mono text-[10px] tracking-widest uppercase">Sovereign Whale Detected // Access Granted</p>
                            </div>
                            <button
                                onClick={() => setShowSuccess(false)}
                                className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs tracking-[0.2em] rounded-2xl transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(16,185,129,0.3)] uppercase active:scale-95"
                            >
                                Enter Professional Terminal
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Content Transition - Force opacity 100 if human and not showing success */}
            <div className={cn(
                "w-full h-full transition-all duration-1000",
                (!isVerified || showSuccess) 
                    ? "blur-2xl opacity-20 scale-95 origin-center grayscale brightness-50 pointer-events-none overflow-hidden h-screen" 
                    : "blur-0 opacity-100 scale-100 grayscale-0 brightness-100 pointer-events-auto"
            )}>
                {children}
            </div>
            <Toaster position="top-right" theme="dark" />
        </div>
    );
};


