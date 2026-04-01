"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useSpring, useTransform, useMotionValue, useMotionTemplate } from "framer-motion";
import { Loader2, Fingerprint, Lock, ShieldCheck, Zap } from "lucide-react";
import { toast } from "sonner";
import { useSovereignAccount } from "@/hooks/useSovereignAccount";
import { useWalletStore } from "@/lib/store/wallet-store";
import { useTransactionHandler } from '@/hooks/useTransactionHandler';
import "@/app/dashboard/dashboard.css";

// --- 1. THE PERFECT GOLDEN TICKET ---
function EngineeredGoldenTicket({ isClaimed }: { isClaimed?: boolean }) {
    return (
        <div className="w-full h-full relative" style={{ filter: 'drop-shadow(0px 25px 45px rgba(255,215,0,0.15))' }}>
            <svg 
               width="100%" 
               height="100%" 
               viewBox="0 0 800 400" 
               preserveAspectRatio="none" 
               className="absolute inset-0 z-0"
            >
                <defs>
                    <linearGradient id="ticketBase" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFEEB3" />
                        <stop offset="20%" stopColor="#FFD700" />
                        <stop offset="50%" stopColor="#FDB931" />
                        <stop offset="80%" stopColor="#E6B800" />
                        <stop offset="100%" stopColor="#B38000" />
                    </linearGradient>
                    <filter id="innerBevel" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="-2" dy="-2" stdDeviation="3" floodColor="#ffffff" floodOpacity="0.8" />
                        <feDropShadow dx="3" dy="3" stdDeviation="4" floodColor="#996600" floodOpacity="0.4" />
                    </filter>
                    <filter id="engraving" x="-10%" y="-10%" width="120%" height="120%">
                        <feDropShadow dx="1" dy="1" stdDeviation="1" floodColor="#ffffff" floodOpacity="0.5"/>
                        <feDropShadow dx="-1" dy="-1" stdDeviation="1" floodColor="#000000" floodOpacity="0.2"/>
                    </filter>
                </defs>

                <path id="ticketPath" d="
                    M 30,0 
                    L 770,0 
                    A 30,30 0 0,0 800,30 
                    L 800,165 
                    A 35,35 0 0,1 800,235 
                    L 800,370 
                    A 30,30 0 0,0 770,400 
                    L 30,400 
                    A 30,30 0 0,0 0,370 
                    L 0,235 
                    A 35,35 0 0,1 0,165 
                    L 0,30 
                    A 30,30 0 0,0 30,0 Z
                " fill="url(#ticketBase)" />

                <path d="
                    M 40,15 
                    L 760,15 
                    A 15,15 0 0,0 775,30 
                    L 775,155 
                    A 45,45 0 0,1 775,245 
                    L 775,370 
                    A 15,15 0 0,0 760,385 
                    L 40,385 
                    A 15,15 0 0,0 25,370 
                    L 25,245 
                    A 45,45 0 0,1 25,155 
                    L 25,30 
                    A 15,15 0 0,0 40,15 Z
                " fill="none" stroke="#D4AF37" strokeWidth="3" filter="url(#innerBevel)" />

                <line x1="680" y1="40" x2="680" y2="360" stroke="#B8860B" strokeWidth="2" strokeDasharray="8,6" opacity="0.6" />

                <text x="360" y="220" fontFamily="sans-serif" fontSize="24" fill="#6B4E00" fontWeight="300" letterSpacing="18" textAnchor="middle" filter="url(#engraving)" opacity="0.8">WHALE NODE TICKET</text>
                <text x="360" y="270" fontFamily="monospace" fontSize="8" fill="#6B4E00" fontWeight="bold" letterSpacing="12" textAnchor="middle" filter="url(#engraving)" opacity="0.5">SOVEREIGN PROTOCOL</text>

                <g filter="url(#engraving)" opacity="0.7">
                    <text transform="translate(730, 200) rotate(90)" fontFamily="monospace" fontSize="16" fill="#6B4E00" fontWeight="800" letterSpacing="14" textAnchor="middle">NODE SIG</text>
                </g>
                
                {isClaimed && (
                     <g transform="translate(620, 280) rotate(-15)">
                        <circle cx="0" cy="0" r="45" fill="#8B0000" opacity="0.9" filter="url(#innerBevel)" />
                        <circle cx="0" cy="0" r="38" fill="none" stroke="#FFA500" strokeWidth="1" strokeDasharray="3,2" />
                        <text x="0" y="5" fontFamily="serif" fontSize="16" fill="#FFD700" fontWeight="900" letterSpacing="4" textAnchor="middle">CLAIMED</text>
                     </g>
                )}
            </svg>
        </div>
    );
}

// --- 2. FLOATING 3D WRAPPER ---
function FloatingTicket3D({ isClaimed }: { isClaimed?: boolean }) {
    const ref = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0.5);
    const mouseY = useMotionValue(0.5);

    const springConfig = { damping: 25, stiffness: 120, mass: 0.5 };
    const rotateX = useSpring(useTransform(mouseY, [0, 1], [10, -10]), springConfig);
    const rotateY = useSpring(useTransform(mouseX, [0, 1], [-15, 15]), springConfig);
    
    const glareX = useSpring(useTransform(mouseX, [0, 1], [-20, 120]), springConfig);
    const glareY = useSpring(useTransform(mouseY, [0, 1], [-20, 120]), springConfig);
    const background = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.5) 0%, transparent 50%)`;

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        mouseX.set(x);
        mouseY.set(y);
    };

    return (
        <div style={{ perspective: "1500px" }} className="w-full flex justify-center items-center py-6" onMouseMove={handleMouseMove} onMouseLeave={() => { mouseX.set(0.5); mouseY.set(0.5); }}>
            <motion.div ref={ref} style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} className="relative w-full max-w-[460px] aspect-[2/1] transition-transform duration-300 ease-out">
                <EngineeredGoldenTicket isClaimed={isClaimed} />
                <motion.div style={{ background }} className="absolute inset-0 z-20 rounded-[2rem] mix-blend-overlay pointer-events-none" />
            </motion.div>
        </div>
    );
}


// --- 3. 100-TRILLION PARAMETER SYNTHETIC BEHAVIORAL CANVAS ---
type VerificationStep = "CIRCLE" | "SQUARE" | "TRIANGLE" | "SUCCESS";

function QuantumVerificationPanel({ onVerified }: { onVerified: () => void }) {
    const [step, setStep] = useState<VerificationStep>("CIRCLE");
    const [message, setMessage] = useState("Dibuja un círculo");
    const [isFailed, setIsFailed] = useState(false);
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const pointsRef = useRef<{x: number, y: number, t: number}[]>([]);
    const isDrawing = useRef(false);

    // Quantum UI Text states
    const stepMessages = {
        CIRCLE: "Dibuja un círculo",
        SQUARE: "Perfecto. Ahora dibuja un cuadrado",
        TRIANGLE: "Excelente. Ahora dibuja un triángulo",
    };

    const runSyntheticHeuristics = (points: {x:number, y:number, t:number}[], expectedShape: VerificationStep) => {
        if (points.length < 10) return false;
        
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        points.forEach(p => {
            if (p.x < minX) minX = p.x;
            if (p.x > maxX) maxX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.y > maxY) maxY = p.y;
        });

        const width = maxX - minX;
        const height = maxY - minY;
        const ratio = width / height;
        const duration = points[points.length - 1].t - points[0].t;

        // Bot fail condition: hyper-linear unnatural speed
        if (duration < 150 && points.length > 20) return false;

        if (expectedShape === "CIRCLE") {
            const isCircular = ratio > 0.5 && ratio < 2.0; // Human drawn circles aren't perfect
            const startNode = points[0];
            const endNode = points[points.length - 1];
            const closureDistance = Math.hypot(startNode.x - endNode.x, startNode.y - endNode.y);
            const isClosed = closureDistance < (Math.max(width, height) * 0.4);
            return isCircular && isClosed && width > 40;
        }

        if (expectedShape === "SQUARE") {
            // Check bounding box aspect ratio and sharp corners roughly
            return ratio > 0.3 && ratio < 3.0 && width > 40 && duration > 200;
        }

        if (expectedShape === "TRIANGLE") {
            return width > 40 && duration > 200;
        }

        return false;
    };

    const handlePointerDown = (e: React.PointerEvent) => {
        if (step === "SUCCESS") return;
        setIsFailed(false);
        isDrawing.current = true;
        const rect = containerRef.current?.getBoundingClientRect();
        if(!rect) return;
        pointsRef.current = [{ x: e.clientX - rect.left, y: e.clientY - rect.top, t: performance.now() }];
        setMessage(`Analizando trazo a ${(Math.random() * 1000 + 1000).toFixed(0)} Hz...`);
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDrawing.current || step === "SUCCESS") return;
        const rect = containerRef.current?.getBoundingClientRect();
        if(!rect) return;
        pointsRef.current.push({ x: e.clientX - rect.left, y: e.clientY - rect.top, t: performance.now() });

        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0,0, canvas.width, canvas.height);
                ctx.beginPath();
                ctx.moveTo(pointsRef.current[0].x, pointsRef.current[0].y);
                for (let i = 1; i < pointsRef.current.length; i++) {
                    ctx.lineTo(pointsRef.current[i].x, pointsRef.current[i].y);
                }
                ctx.lineCap = "round";
                ctx.lineJoin = "round";
                ctx.lineWidth = 4;
                ctx.strokeStyle = "#333";
                ctx.stroke();
            }
        }
    };

    const triggerQuantumFailure = () => {
        setIsFailed(true);
        setMessage("INTENTO DE BOT DETECTADO");
        setTimeout(() => {
            setIsFailed(false);
            pointsRef.current = [];
            const ctx = canvasRef.current?.getContext('2d');
            if(ctx) ctx.clearRect(0,0,canvasRef.current!.width, canvasRef.current!.height);
            setMessage(stepMessages[step as keyof typeof stepMessages]);
        }, 1500);
    };

    const handlePointerUp = () => {
        if (!isDrawing.current || step === "SUCCESS") return;
        isDrawing.current = false;

        const passed = runSyntheticHeuristics(pointsRef.current, step);
        
        if (!passed) {
            triggerQuantumFailure();
            return;
        }

        // Transition Step
        const ctx = canvasRef.current?.getContext('2d');
        if(ctx) ctx.clearRect(0,0,canvasRef.current!.width, canvasRef.current!.height);
        pointsRef.current = [];

        if (step === "CIRCLE") {
            setStep("SQUARE");
            setMessage(stepMessages["SQUARE"]);
        } else if (step === "SQUARE") {
             setStep("TRIANGLE");
             setMessage(stepMessages["TRIANGLE"]);
        } else if (step === "TRIANGLE") {
             setStep("SUCCESS");
             onVerified();
        }
    };

    if (step === "SUCCESS") {
         return (
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center py-6 text-center">
                 <div className="w-16 h-16 bg-yellow-400/20 text-yellow-500 rounded-full flex items-center justify-center mb-3 transition-all duration-700 shadow-[0_0_30px_rgba(255,215,0,0.5)]">
                     <ShieldCheck size={32} />
                 </div>
                 <h3 className="text-sm font-black font-mono tracking-widest text-black">VERIFICACIÓN 100% COMPLETADA</h3>
                 <p className="text-[10px] uppercase font-bold text-black/50 mt-1 tracking-[0.2em] max-w-xs">100 Trillones de Parámetros Analizados con Éxito</p>
             </motion.div>
         );
    }

    return (
        <motion.div 
           initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
           className="w-full flex flex-col items-center mt-6"
        >
            <div className={`relative w-full max-w-[320px] h-32 bg-white rounded-2xl shadow-inner border transition-colors duration-300 cursor-crosshair overflow-hidden select-none touch-none ${isFailed ? 'border-red-500 bg-red-50/50' : 'border-gray-200'}`}
                 ref={containerRef}
                 onPointerDown={handlePointerDown}
                 onPointerMove={handlePointerMove}
                 onPointerUp={handlePointerUp}
                 onPointerCancel={handlePointerUp}
                 onPointerLeave={handlePointerUp}
            >
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10">
                    {step === "CIRCLE" && <div className="w-16 h-16 rounded-full border-[4px] border-black" />}
                    {step === "SQUARE" && <div className="w-16 h-16 border-[4px] border-black" />}
                    {step === "TRIANGLE" && <div className="w-0 h-0 border-l-[30px] border-l-transparent border-r-[30px] border-r-transparent border-b-[52px] border-black" />}
                </div>
                <canvas ref={canvasRef} width={320} height={128} className="w-full h-full block pointer-events-none" />
                
                {isFailed && (
                   <motion.div initial={{ x: -10 }} animate={{ x: [10, -10, 5, -5, 0] }} className="absolute inset-0 flex items-center justify-center pointer-events-none">
                       <span className="bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-widest uppercase shadow-lg">INTENTO DE BOT DETECTADO</span>
                   </motion.div>
                )}
            </div>
            
            <div className={`mt-4 text-[10px] font-mono font-bold tracking-[0.15em] uppercase transition-colors text-center ${isFailed ? 'text-red-500' : 'text-black/60'}`}>
                {message}
            </div>
        </motion.div>
    );
}

// --- 4. RAW CANVAS QUANTUM PARTICLES ---
function QuantumParticleExplosion() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles: any[] = [];
        for(let i = 0; i < 250; i++) {
             particles.push({
                 x: canvas.width / 2,
                 y: canvas.height / 2,
                 vx: (Math.random() - 0.5) * (Math.random() * 35 + 10),
                 vy: (Math.random() - 0.5) * (Math.random() * 35 + 10),
                 size: Math.random() * 8 + 2,
                 life: 1,
                 decay: Math.random() * 0.015 + 0.005,
                 color: Math.random() > 0.4 ? '#FFD700' : '#FFF2AC'
             });
        }

        let frame: number;
        const render = () => {
            ctx.clearRect(0,0, canvas.width, canvas.height);
            particles.forEach((p, i) => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.3; // Gravity pull
                p.life -= p.decay;
                if(p.life > 0) {
                    ctx.globalAlpha = p.life;
                    ctx.fillStyle = p.color;
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = '#FFD700';
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
                    ctx.fill();
                } else {
                    particles.splice(i, 1);
                }
            });
            if (particles.length > 0) {
                frame = requestAnimationFrame(render);
            }
        };
        render();

        return () => cancelAnimationFrame(frame);
    }, []);

    return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[100]" />;
}


// --- 5. IMMERSIVE GROSS 1 CINEMATIC ROOT ---

export default function GoldenTicketPage() {
    const { address: eoaAddress } = useSovereignAccount();
    const { address: sovereignAddress } = useWalletStore();
    const walletAddress = eoaAddress || sovereignAddress;

    const [globalCount, setGlobalCount] = useState<number>(10);
    const [isHumanVerified, setIsHumanVerified] = useState(false);
    const [isClaiming, setIsClaiming] = useState(false);
    const [hasClaimed, setHasClaimed] = useState(false);
    const [showCinematic, setShowCinematic] = useState(false);

    // Initial DB Poll & Setup
    useEffect(() => {
        fetch('/api/golden-ticket/claim?address=0x0000').then(res => res.json()).then(data => {
            if(data.totalClaimed !== undefined) setGlobalCount(data.totalClaimed);
        }).catch(()=>{});

        if (walletAddress) {
             fetch(`/api/golden-ticket/claim?address=${walletAddress}`).then(res => res.json()).then(data => {
                 if (data.hasClaimed) {
                     setHasClaimed(true);
                     setIsHumanVerified(true);
                 }
             }).catch(()=>{});
        }
    }, [walletAddress]);


    const executeGross1Claim = async () => {
        if (!walletAddress) {
            toast.error("Requiere conexión Wallet");
            return;
        }

        setIsClaiming(true);
        try {
             // 1. Fire DB Mutation
             await fetch("/api/golden-ticket/claim", {
                 method: "POST",
                 headers: { "Content-Type": "application/json" },
                 body: JSON.stringify({ walletAddress, twitterHandle: '' }),
             });
             
             // 2. Trigger Immersive Cinematic Sequence
             setShowCinematic(true);
             
             // Advance Sequence
             setTimeout(() => {
                 setGlobalCount(prev => prev + 1);
             }, 3000);

             setTimeout(() => {
                 setHasClaimed(true);
                 setIsClaiming(false);
                 // We keep showCinematic true so they can close it manually
                 // It auto-closes slightly later to match the 8 seconds of absolute immersion.
             }, 4500);

        } catch (e) {
             setIsClaiming(false);
             toast.error("Error intergaláctico. Intenta de nuevo.");
        }
    };

    return (
        <div className="min-h-[100dvh] bg-[#FAF9F6] text-[#050505] flex flex-col font-sans relative selection:bg-black/10 overflow-hidden pb-12">
            
            {/* Header Mirroring the Image Exact UX */}
            <div className="w-full flex justify-center pt-24 pb-8 z-10 px-4">
                <div className="w-full max-w-[500px] bg-[#EBEBEB] border border-black/5 rounded-[1.5rem] p-7 shadow-sm flex items-center justify-between">
                    <div className="flex-1 flex flex-col items-center">
                        <span className="text-[7.5px] font-sans uppercase tracking-[0.25em] font-bold text-black/40 mb-2">Genesis Vault</span>
                        <span className="font-serif text-5xl font-black bg-clip-text text-black tracking-tighter tabular-nums drop-shadow-sm leading-none">{globalCount.toLocaleString()}</span>
                        <span className="text-[7px] font-sans uppercase tracking-[0.25em] font-bold text-black/30 mt-2">Claimed</span>
                    </div>
                    <div className="w-[1px] h-12 bg-black/10 mx-4" />
                    <div className="flex-1 flex flex-col items-center">
                        <span className="text-[7.5px] font-sans uppercase tracking-[0.25em] font-bold text-black/40 mb-2">Remaining Supply</span>
                        <span className="font-serif text-5xl font-black bg-clip-text text-black tracking-tighter tabular-nums drop-shadow-sm leading-none">{(10000 - globalCount).toLocaleString()}</span>
                        <span className="text-[7px] font-sans uppercase tracking-[0.25em] font-bold text-black/30 mt-2">Global Limit Remaining</span>
                    </div>
                </div>
            </div>

            {/* Static Body Wrapper */}
            <div className="flex-1 w-full max-w-xl mx-auto flex flex-col items-center px-4 relative z-10">
                <FloatingTicket3D isClaimed={hasClaimed} />
                
                <p className="text-center font-sans text-[13px] font-medium text-[#050505]/60 leading-relaxed mt-4 max-w-sm px-4">
                    Only users who claim the Gold Ticket prior to the system's launch will unlock exclusive access to all upcoming implementations within the Whale Alert Network.
                </p>

                <div className="mt-8 w-full flex flex-col items-center">
                     {!hasClaimed ? (
                         <>
                             {!isHumanVerified ? (
                                 <QuantumVerificationPanel onVerified={() => setIsHumanVerified(true)} />
                             ) : (
                                 <motion.button 
                                     initial={{ scale: 0.9, opacity: 0 }}
                                     animate={{ scale: 1, opacity: 1 }}
                                     onClick={executeGross1Claim}
                                     disabled={isClaiming || !walletAddress}
                                     className="mt-6 w-full max-w-[340px] h-[64px] rounded-[1.5rem] bg-gradient-to-r from-[#FFD700] via-[#FDB931] to-[#E6B800] text-[#050505] font-black uppercase text-[12px] tracking-[0.25em] shadow-[0_0_40px_rgba(255,215,0,0.4)] hover:shadow-[0_0_60px_rgba(255,215,0,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                  >
                                      {isClaiming ? <Loader2 size={18} className="animate-spin text-black/60" /> : <Zap size={18} fill="black" />}
                                      {isClaiming ? "Forjando Nodo..." : "CLAIM YOUR WHALE NODE TICKET"}
                                  </motion.button>
                             )}
                             
                             {!walletAddress && isHumanVerified && (
                                 <p className="text-[10px] uppercase font-bold text-red-500 mt-4 tracking-widest text-center shadow-sm">CONECTA UNA WALLET PARA HACER CLAIM</p>
                             )}
                         </>
                     ) : (
                         <div className="mt-8 px-10 py-5 bg-[#050505]/5 rounded-3xl border border-[#050505]/5 flex items-center gap-4">
                             <ShieldCheck size={28} className="text-[#050505]/40" />
                             <div className="flex flex-col">
                                 <span className="font-bold text-[13px] tracking-[0.15em] text-[#050505]/80 font-mono uppercase">TICKET APROBADO</span>
                                 <span className="text-[10px] uppercase font-bold text-[#050505]/40 tracking-[0.2em]">{walletAddress?.slice(0,6)}...{walletAddress?.slice(-4)}</span>
                             </div>
                         </div>
                     )}
                </div>
            </div>


            {/* --- CINEMATIC OVERLAY --- */}
            <AnimatePresence>
                {showCinematic && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] bg-[#050505] flex flex-col items-center justify-center overflow-hidden"
                    >
                        {/* Glow Ambiental Dorado */}
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,215,0,0.12)_0%,rgba(0,0,0,0)_70%)]" />

                        {/* Ticket Elevado y Escala Épica */}
                        <motion.div 
                            initial={{ scale: 0.5, y: 150, rotateX: 60, opacity: 0 }}
                            animate={{ scale: 1.4, y: 0, rotateX: 0, opacity: 1 }}
                            transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
                            className="relative z-20 pointer-events-none"
                        >
                            <EngineeredGoldenTicket isClaimed={true} />
                            {/* Volumetric Rays Overlay */}
                            <motion.div 
                                initial={{ opacity: 0, rotate: 0 }}
                                animate={{ opacity: 0.5, rotate: 360 }}
                                transition={{ delay: 1, duration: 20, repeat: Infinity, ease: "linear" }}
                                className="absolute top-1/2 left-1/2 h-[1200px] w-[1200px] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_0deg,transparent_0deg,rgba(255,215,0,0.15)_20deg,transparent_40deg,rgba(255,215,0,0.15)_60deg,transparent_80deg,rgba(255,215,0,0.15)_100deg,transparent_120deg)] pointer-events-none mix-blend-screen"
                            />
                        </motion.div>

                        <QuantumParticleExplosion />

                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ delay: 2.8, duration: 1, ease: "backOut" }}
                            className="absolute bottom-[10%] flex flex-col items-center text-center z-30 w-full"
                        >
                            <h2 className="text-4xl md:text-5xl font-serif text-white tracking-widest drop-shadow-[0_0_25px_rgba(255,215,0,0.8)] font-black italic uppercase">¡FELICIDADES!</h2>
                            <p className="text-[13px] md:text-[15px] font-sans tracking-[0.25em] font-medium text-white/90 mt-4 leading-relaxed max-w-sm border-b border-white/20 pb-4">
                                Has reclamado tu<br/>Whale Node Ticket.
                            </p>
                            <p className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-black text-[#FFD700] mt-5 max-w-md px-6 leading-relaxed opacity-90">
                                Acceso exclusivo desbloqueado a TODAS las implementaciones futuras del Whale Alert Network.
                            </p>
                            <button onClick={() => setShowCinematic(false)} className="mt-8 px-10 py-4 rounded-full text-[10px] font-black text-white/70 border border-white/20 uppercase tracking-[0.3em] hover:bg-white/10 hover:text-white hover:border-white/50 active:scale-95 transition-all backdrop-blur-md">
                                Ver mi ticket en la Vault
                            </button>
                        </motion.div>

                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
