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

    // Auto-Healer for iOS Safari VRAM Exhaustion
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleContextLost = (e: Event) => {
            e.preventDefault();
            console.warn("[Auto-Heal] Canvas context lost due to OS VRAM limits.");
        };

        const handleContextRestored = () => {
            console.log("[Auto-Heal] Canvas context restored. Rebooting synthetic matrix.");
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                pointsRef.current = [];
                isDrawing.current = false;
            }
        };

        canvas.addEventListener('contextlost', handleContextLost);
        canvas.addEventListener('contextrestored', handleContextRestored);

        return () => {
             canvas.removeEventListener('contextlost', handleContextLost);
             canvas.removeEventListener('contextrestored', handleContextRestored);
        };
    }, []);

    const runSyntheticHeuristics = (points: {x:number, y:number, t:number}[], expectedShape: VerificationStep) => {
        if (points.length < 5) return false;
        
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        points.forEach(p => {
            if (p.x < minX) minX = p.x;
            if (p.x > maxX) maxX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.y > maxY) maxY = p.y;
        });

        const width = maxX - minX;
        const height = maxY - minY;
        const ratio = height > 0 ? width / height : 1;
        const duration = points[points.length - 1].t - points[0].t;

        // Calculate total path length
        let pathLength = 0;
        for (let i = 1; i < points.length; i++) {
            pathLength += Math.hypot(points[i].x - points[i-1].x, points[i].y - points[i-1].y);
        }

        // Bot fail condition: hyper-linear unnatural speed or too small
        if (duration < 50 && points.length > 20) return false;
        if (width < 30 || height < 30) return false;

        const maxDim = Math.max(width, height);
        const startNode = points[0];
        const endNode = points[points.length - 1];
        const closureDistance = Math.hypot(startNode.x - endNode.x, startNode.y - endNode.y);

        if (expectedShape === "CIRCLE") {
            // Strict circularity constraint
            const isCircularRatio = ratio > 0.75 && ratio < 1.35;
            const isClosed = closureDistance < (maxDim * 0.35); // Must close the loop mostly
            const expectedLength = Math.PI * ((width + height) / 2);
            const isExpectedLength = pathLength > expectedLength * 0.8 && pathLength < expectedLength * 1.25;
            return isCircularRatio && isClosed && isExpectedLength;
        }

        if (expectedShape === "SQUARE") {
            // Square should be somewhat square
            const isSquareRatio = ratio > 0.65 && ratio < 1.5;
            const isClosed = closureDistance < (maxDim * 0.4); 
            const expectedLength = (width + height) * 2;
            const isExpectedLength = pathLength > expectedLength * 0.75 && pathLength < expectedLength * 1.35;
            return isSquareRatio && isExpectedLength && isClosed;
        }

        if (expectedShape === "TRIANGLE") {
            // Triangle can have different ratios, but perimeter should be ~ 3 times avg dim
            const expectedLength = width + 2 * Math.hypot(width / 2, height);
            const isExpectedLength = pathLength > expectedLength * 0.7 && pathLength < expectedLength * 1.4;
            const isClosed = closureDistance < (maxDim * 0.4); // Also should be a closed shape
            return isExpectedLength && isClosed;
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

// --- 4. INSTITUTIONAL ATMOSPHERIC DUST ---
function InstitutionalAtmosphere() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        const particles: {x:number, y:number, vx:number, vy:number, size:number, alpha:number, p:number}[] = [];
        for(let i = 0; i < 150; i++) {
             particles.push({
                 x: Math.random() * width,
                 y: Math.random() * height,
                 vx: (Math.random() - 0.5) * 0.15,
                 vy: -Math.random() * 0.2 - 0.05, // Subtle drift upwards
                 size: Math.random() * 1.5 + 0.5,
                 alpha: Math.random() * 0.4 + 0.1,
                 p: Math.random() * 0.01 + 0.005
             });
        }

        let frame: number;
        const render = () => {
            ctx.clearRect(0,0, width, height);
            particles.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;
                
                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;

                p.alpha += p.p;
                if (p.alpha > 0.5 || p.alpha < 0.05) p.p *= -1;

                ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
                ctx.fillStyle = '#D4AF37'; // Elegant Gold
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
                ctx.fill();
            });
            frame = requestAnimationFrame(render);
        };
        render();

        return () => cancelAnimationFrame(frame);
    }, []);

    return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[10] opacity-50 transform-gpu" style={{ willChange: 'transform' }} />;
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
             const localClaim = localStorage.getItem(`hasClaimed_${walletAddress}`);
             if (localClaim) {
                 setHasClaimed(true);
                 setIsHumanVerified(true);
             }

             fetch(`/api/golden-ticket/claim?address=${walletAddress}`).then(res => res.json()).then(data => {
                 if (data.hasClaimed) {
                     setHasClaimed(true);
                     setIsHumanVerified(true);
                     localStorage.setItem(`hasClaimed_${walletAddress}`, 'true');
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
                 localStorage.setItem(`hasClaimed_${walletAddress}`, 'true');
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
                         <motion.div 
                             initial={{ scale: 0.9, opacity: 0 }}
                             animate={{ scale: 1, opacity: 1 }}
                             className="mt-8 px-10 py-6 bg-gradient-to-r from-[#D4AF37]/10 to-[#F5E17A]/10 rounded-[2rem] border border-[#D4AF37]/30 shadow-[0_0_40px_rgba(212,175,55,0.15)] flex flex-col items-center gap-4 w-full max-w-[340px]"
                         >
                             <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#F5E17A] flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.4)]">
                                 <ShieldCheck size={32} className="text-[#050505]" />
                             </div>
                             <div className="flex flex-col items-center text-center">
                                 <span className="font-black text-[15px] tracking-[0.2em] text-[#050505] font-mono uppercase bg-clip-text">TICKET CLAIMED INMUTABLE</span>
                                 <span className="text-[11px] uppercase font-bold text-[#050505]/50 tracking-[0.2em] mt-2 bg-[#050505]/5 px-4 py-1.5 rounded-full">
                                     {walletAddress?.slice(0,6)}...{walletAddress?.slice(-4)}
                                 </span>
                             </div>
                             <p className="text-[10px] uppercase font-bold text-[#00C076] tracking-widest mt-2 flex items-center gap-1.5">
                                 <Zap size={12} fill="#00C076" /> VINCULADO PARA SIEMPRE
                             </p>
                         </motion.div>
                     )}
                </div>
            </div>


            {/* --- INSTITUTIONAL CINEMATIC OVERLAY --- */}
            <AnimatePresence>
                {showCinematic && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}
                        className="fixed inset-0 z-[9999] bg-[#020202] flex flex-col items-center justify-center overflow-hidden"
                    >
                        {/* Elegant Minimalist Background Elements */}
                        <div className="absolute inset-0 bg-transparent mix-blend-overlay opacity-30" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.06)_0%,transparent_60%)] pointer-events-none" />

                        <InstitutionalAtmosphere />

                        {/* Majestic Ticket Reveal */}
                        <motion.div 
                            initial={{ scale: 0.85, y: 40, opacity: 0 }}
                            animate={{ scale: 1.15, y: 0, opacity: 1 }}
                            transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
                            className="relative z-20 pointer-events-none drop-shadow-2xl flex items-center justify-center w-[90vw] max-w-[600px] aspect-[2/1] transform-gpu"
                        >
                            <motion.div 
                                className="w-full h-full transform-gpu" 
                                animate={{ y: [-10, 10, -10], rotateX: [0, 5, 0], rotateY: [0, 5, 0] }} 
                                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                            >
                                <EngineeredGoldenTicket isClaimed={true} />
                            </motion.div>
                        </motion.div>

                        {/* Serious Informative Panel */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.5, duration: 1.2, ease: "easeOut" }}
                            className="absolute bottom-[10%] flex flex-col items-center text-center z-30 w-full"
                        >
                            <div className="flex items-center gap-3 mb-6">
                               <div className="w-[6px] h-[6px] rounded-full bg-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.8)] animate-pulse" />
                               <span className="text-[9px] font-mono tracking-[0.4em] uppercase text-[#D4AF37] font-bold">Autenticación Soberana</span>
                            </div>
                            
                            <h2 className="text-xl md:text-3xl font-serif text-white/90 tracking-[0.2em] font-light uppercase">WHALE NODE TICKET EMITIDO</h2>
                            
                            <div className="w-px h-10 bg-gradient-to-b from-white/20 to-transparent my-6" />
                            
                            <p className="text-[9px] md:text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 max-w-sm px-6 leading-loose">
                                Operación validada en cadena.<br/>El portafolio tiene acceso vitalicio a la terminal institucional.
                            </p>

                            <button onClick={() => setShowCinematic(false)} className="mt-10 px-10 py-5 bg-gradient-to-r from-[#FFD700] via-[#FDB931] to-[#E6B800] text-[#050505] text-[12px] font-black uppercase tracking-[0.3em] shadow-[0_0_50px_rgba(255,215,0,0.6)] hover:shadow-[0_0_80px_rgba(255,215,0,0.8)] hover:scale-[1.05] active:scale-[0.98] transition-all duration-300 rounded-full flex items-center justify-center gap-3 w-full max-w-[360px]">
                                VER MI TICKET CLAIMEADO
                            </button>
                        </motion.div>

                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
