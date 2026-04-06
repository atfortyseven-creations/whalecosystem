"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useSpring, useTransform, useMotionValue, useMotionTemplate } from "framer-motion";
import { useSovereignAccount } from "@/hooks/useSovereignAccount";
import { useWalletStore } from "@/lib/store/wallet-store";
import { toast } from "sonner";
import "@/app/dashboard/dashboard.css";

// --- MUSEUM-GRADE MATTE ARTIFACT ---
function MinimalistObsidianCard({ isClaimed, walletAddress, cinematicMode }: { isClaimed: boolean; walletAddress: string | null, cinematicMode?: boolean }) {
    const cardRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0.5);
    const mouseY = useMotionValue(0.5);
    
    // Extremely smooth, slow, elegant physics
    const springConfig = { damping: 50, stiffness: 80, mass: 2 };
    
    const rotateX = useSpring(useTransform(mouseY, [0, 1], [8, -8]), springConfig);
    const rotateY = useSpring(useTransform(mouseX, [0, 1], [-12, 12]), springConfig);
    
    const glareX = useSpring(useTransform(mouseX, [0, 1], [-50, 150]), springConfig);
    const glareY = useSpring(useTransform(mouseY, [0, 1], [-50, 150]), springConfig);
    
    // Very soft, diffused museum lighting glare
    const glareBackground = useMotionTemplate`
        radial-gradient(
            circle at ${glareX}% ${glareY}%, 
            rgba(255, 255, 255, 0.08) 0%, 
            transparent 60%
        )
    `;

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current || cinematicMode) return;
        const rect = cardRef.current.getBoundingClientRect();
        mouseX.set((e.clientX - rect.left) / rect.width);
        mouseY.set((e.clientY - rect.top) / rect.height);
    };

    const handleMouseLeave = () => {
        if (cinematicMode) return;
        mouseX.set(0.5);
        mouseY.set(0.5);
    };

    useEffect(() => {
        if (cinematicMode) {
            mouseX.set(0.5);
            mouseY.set(0.5);
        }
    }, [cinematicMode, mouseX, mouseY]);

    const truncated = walletAddress ? `${walletAddress.slice(0,6)}...${walletAddress.slice(-4)}` : "UNAUTHORIZED";

    return (
        <div style={{ perspective: "3000px" }} className={`w-full flex justify-center items-center transition-all duration-[2000ms] ${cinematicMode ? 'py-0' : 'py-10'}`} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
            <motion.div 
                ref={cardRef} 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0, rotateX: cinematicMode ? 0 : rotateX.get(), rotateY: cinematicMode ? 0 : rotateY.get() }}
                transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
                style={{ 
                    rotateX: cinematicMode ? 0 : rotateX, 
                    rotateY: cinematicMode ? 0 : rotateY, 
                    transformStyle: "preserve-3d",
                }}
                className={`relative aspect-[1.586/1] rounded-xl overflow-hidden bg-[#0A0A0A] ${cinematicMode ? 'w-[580px] shadow-[0_0_100px_rgba(255,255,255,0.02)] border border-white/5' : 'w-[440px] shadow-[0_40px_80px_rgba(0,0,0,0.8)] border border-white/[0.03]'} transition-all duration-[2000ms] ease-[cubic-bezier(0.16,1,0.3,1)]`}
            >
                {/* Pure Matte Base with Subtle Noise */}
                <div className="absolute inset-0 opacity-[0.25] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

                {/* Diffused Glare Layer */}
                <motion.div style={{ background: cinematicMode ? 'radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.05) 0%, transparent 60%)' : glareBackground }} className="absolute inset-0 z-30 pointer-events-none transition-all duration-[2000ms]" />
                
                <div className="absolute inset-0 p-10 flex flex-col justify-between z-20 pointer-events-none" style={{ transform: "translateZ(20px)" }}>
                    
                    {/* Top Tier */}
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                            <span className="text-[8px] font-mono font-medium text-[#777777] tracking-[0.4em] uppercase mb-2">Whale Gold Ticket</span>
                            <span className="text-3xl font-serif text-[#EEEEEE] tracking-[0.1em] font-light">BETA ACCESS</span>
                        </div>
                    </div>

                    {/* Bottom Tier */}
                    <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                            <span className="text-[7px] font-mono font-normal text-[#555555] tracking-[0.4em] uppercase mb-1.5">Member ID</span>
                            <span className="text-xs font-mono tracking-widest text-[#CCCCCC] opacity-90">{truncated}</span>
                        </div>
                        
                        <AnimatePresence>
                            {(isClaimed || cinematicMode) && (
                                <motion.div 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }} 
                                    transition={{ duration: 1.5, delay: cinematicMode ? 1.5 : 0 }}
                                    className="flex items-center"
                                >
                                    <span className="text-[9px] font-mono font-normal text-[#999999] tracking-[0.3em] uppercase">Claimed</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// --- ABSOLUTE NOISELESS VOID ---
function PureCinematicVoid() {
    return (
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }}
            className="fixed inset-0 pointer-events-none z-0 bg-[#000000]"
        >
             {/* Extremely soft, silent halo */}
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 4, delay: 1 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.015)_0%,transparent_50%)]" 
            />
        </motion.div>
    );
}

// --- ELEGANT MINIMALIST HOLD INTERACTION ---
function ElegantAuthorization({ onClaim, walletAddress }: { onClaim: () => void, walletAddress: string | null }) {
    const [progress, setProgress] = useState(0);
    const holdTimer = useRef<NodeJS.Timeout | null>(null);
    const complete = progress >= 100;

    const startHold = () => {
        if (!walletAddress) return toast("Anexión requerida", { description: "Connect wallet to authorize.", style: { background: '#000', color: '#FFF', border: 'none' }});
        if (complete) return;
        const inc = () => {
            setProgress(p => {
                if (p + 1.5 >= 100) { 
                    clearInterval(holdTimer.current!);
                    setTimeout(() => onClaim(), 100);
                    return 100;
                }
                return p + 1.5;
            });
        };
        holdTimer.current = setInterval(inc, 15);
    };

    const stopHold = () => {
        if (holdTimer.current) clearInterval(holdTimer.current);
        if (!complete) setProgress(0); // reset gracefully
    };

    return (
        <div className="w-full flex flex-col items-center mt-16 mb-8 group select-none touch-none"
             onMouseDown={startHold} onMouseUp={stopHold} onMouseLeave={stopHold}
             onTouchStart={startHold} onTouchEnd={stopHold}>
             
            <span className={`text-[9px] font-mono tracking-[0.4em] uppercase transition-colors duration-700 mb-6 ${progress > 0 ? 'text-[#888888]' : 'text-[#444444]'}`}>
                {progress > 0 ? 'Claiming' : 'Hold to claim'}
            </span>

            {/* Silent Line Progress */}
            <div className="w-[180px] h-[1px] bg-black/5 relative cursor-pointer">
                <motion.div 
                    className="absolute left-0 top-0 bottom-0 bg-[#000000]"
                    style={{ width: `${progress}%` }}
                    transition={{ type: "tween", ease: "linear", duration: 0.05 }}
                />
            </div>
            
        </div>
    );
}

// --- MASTER ORCHESTRATOR ---
export default function GoldenTicketPage() {
    const { address: eoaAddress } = useSovereignAccount();
    const { address: sovereignAddress } = useWalletStore();
    const walletAddress = eoaAddress || sovereignAddress;

    const [hasClaimed, setHasClaimed] = useState(false);
    const [cinematicMode, setCinematicMode] = useState(false);
    const [finalText, setFinalText] = useState(false);

    useEffect(() => {
        if (walletAddress) {
             const localClaim = localStorage.getItem(`hasClaimed_${walletAddress}`);
             if (localClaim) setHasClaimed(true);

             fetch(`/api/golden-ticket/claim?address=${walletAddress}`).then(res => res.json()).then(data => {
                 if (data.hasClaimed) {
                     setHasClaimed(true);
                     localStorage.setItem(`hasClaimed_${walletAddress}`, 'true');
                 }
             }).catch(()=>{});
        }
    }, [walletAddress]);

    const executeElegantClaim = async () => {
        if (!walletAddress) return;

        // Graceful switch
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setCinematicMode(true);
        
        try {
             await fetch("/api/golden-ticket/claim", {
                 method: "POST",
                 headers: { "Content-Type": "application/json" },
                 body: JSON.stringify({ walletAddress, twitterHandle: '' }),
             });
             
             // Serene timeline
             setTimeout(() => setHasClaimed(true), 2000); 
             setTimeout(() => setFinalText(true), 3500); 
             setTimeout(() => {
                 localStorage.setItem(`hasClaimed_${walletAddress}`, 'true');
             }, 4000);

        } catch (e) {
             setCinematicMode(false);
             toast("Error", { description: "Hubo un problema al emitir." });
        }
    };

    return (
        <div className={`min-h-[100dvh] transition-colors duration-[3000ms] ease-out flex flex-col font-sans relative overflow-hidden ${cinematicMode ? 'bg-[#000000]' : 'bg-[#FAFAFA]'}`}>
            
            {cinematicMode && <PureCinematicVoid />}

            <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col items-center justify-center px-4 relative z-10 min-h-[100dvh]">
                
                <motion.div 
                    className="w-full flex flex-col items-center justify-center"
                    animate={cinematicMode ? { y: 0 } : { y: 0 }}
                >
                    <MinimalistObsidianCard isClaimed={hasClaimed} walletAddress={walletAddress} cinematicMode={cinematicMode} />

                    <AnimatePresence>
                        {!cinematicMode && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, filter: 'blur(10px)' }}
                                transition={{ duration: 1.2, ease: "easeOut" }}
                                className="flex flex-col items-center mt-12 w-full"
                            >
                                {!hasClaimed ? (
                                    <ElegantAuthorization onClaim={executeElegantClaim} walletAddress={walletAddress} />
                                ) : (
                                    <div className="mt-16 text-center">
                                        <span className="text-[9px] uppercase font-mono tracking-[0.4em] text-[#888888]">Claimed</span>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Silent Conclusion */}
                    <AnimatePresence>
                        {cinematicMode && finalText && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }} 
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 3, ease: "easeInOut" }}
                                className="absolute bottom-[15vh] flex flex-col items-center text-center w-full"
                            >
                                <h2 className="text-sm font-serif text-[#FFFFFF] opacity-80 tracking-[0.5em] font-light uppercase">
                                    Access Confirmed
                                </h2>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </motion.div>
            </div>
        </div>
    );
}
