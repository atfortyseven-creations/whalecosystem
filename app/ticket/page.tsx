"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring, useMotionTemplate } from "framer-motion";
import { ChevronRight, Lock, Loader2, Fingerprint, Activity, Clock } from "lucide-react";
import { useSovereignAccount } from "@/hooks/useSovereignAccount";
import { useWalletStore } from "@/lib/store/wallet-store";
import { useBlockNumber } from 'wagmi';
import { toast } from "sonner";
import Image from "next/image";

import "@/app/dashboard/dashboard.css";

// ─── PURE ENGINEERED GOLDEN TICKET SVG (MONOCHROME VARIANT) ───
function EngineeredGoldenTicket() {
    return (
        <div className="w-full h-full relative" style={{ filter: 'drop-shadow(0px 25px 45px rgba(0,0,0,0.15))' }}>
            <svg 
               width="100%" 
               height="100%" 
               viewBox="0 0 800 400" 
               preserveAspectRatio="none" 
               className="absolute inset-0 z-0"
            >
                <defs>
                    <linearGradient id="ticketBase" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="30%" stopColor="#f5f5f5" />
                        <stop offset="50%" stopColor="#e0e0e0" />
                        <stop offset="70%" stopColor="#f5f5f5" />
                        <stop offset="100%" stopColor="#cccccc" />
                    </linearGradient>
                    <filter id="innerBevel" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="-2" dy="-2" stdDeviation="3" floodColor="#ffffff" floodOpacity="0.8" />
                        <feDropShadow dx="3" dy="3" stdDeviation="4" floodColor="#000000" floodOpacity="0.1" />
                    </filter>
                    <filter id="engraving" x="-10%" y="-10%" width="120%" height="120%">
                        <feDropShadow dx="1" dy="1" stdDeviation="1" floodColor="#ffffff" floodOpacity="0.7"/>
                        <feDropShadow dx="-1" dy="-1" stdDeviation="1" floodColor="#000000" floodOpacity="0.2"/>
                    </filter>
                </defs>

                <path id="ticketPath" d="
                    M 40,0 
                    L 760,0 
                    A 40,40 0 0,0 800,40 
                    L 800,160 
                    A 30,30 0 0,1 800,240 
                    L 800,360 
                    A 40,40 0 0,0 760,400 
                    L 40,400 
                    A 40,40 0 0,0 0,360 
                    L 0,240 
                    A 30,30 0 0,1 0,160 
                    L 0,40 
                    A 40,40 0 0,0 40,0 Z
                " fill="url(#ticketBase)" />

                <path d="
                    M 55,15 
                    L 745,15 
                    A 25,25 0 0,0 785,55 
                    L 785,145 
                    A 45,45 0 0,1 785,255 
                    L 785,345 
                    A 25,25 0 0,0 745,385 
                    L 55,385 
                    A 25,25 0 0,0 15,345 
                    L 15,255 
                    A 45,45 0 0,1 15,145 
                    L 15,55 
                    A 25,25 0 0,0 55,15 Z
                " fill="none" stroke="#e0e0e0" strokeWidth="4" filter="url(#innerBevel)" />

                <line x1="640" y1="40" x2="640" y2="360" stroke="#000000" strokeWidth="2" strokeDasharray="16,12" strokeLinecap="round" filter="url(#engraving)" opacity="0.4" />

                <text x="400" y="230" fontFamily="system-ui, -apple-system, sans-serif" fontSize="26" fill="#000000" fontWeight="200" letterSpacing="24" textAnchor="middle" filter="url(#engraving)" opacity="0.8">WHALE NODE TICKET</text>
                <text x="400" y="280" fontFamily="monospace" fontSize="11" fill="#000000" fontWeight="bold" letterSpacing="14" textAnchor="middle" filter="url(#engraving)" opacity="0.4">SOVEREIGN PROTOCOL</text>

                <g filter="url(#engraving)" opacity="0.6">
                    <text transform="translate(720, 200) rotate(90)" fontFamily="monospace" fontSize="18" fill="#000000" fontWeight="bold" letterSpacing="12" textAnchor="middle">NODE SIG</text>
                </g>
            </svg>
        </div>
    );
}

// ─── 3D INTERACTIVE WRAPPER ───
function FloatingTicket3D() {
    const ref = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0.5);
    const mouseY = useMotionValue(0.5);

    const springConfig = { damping: 20, stiffness: 100, mass: 0.5 };
    const rotateX = useSpring(useTransform(mouseY, [0, 1], [15, -15]), springConfig);
    const rotateY = useSpring(useTransform(mouseX, [0, 1], [-20, 20]), springConfig);
    
    const glareX = useSpring(useTransform(mouseX, [0, 1], [0, 100]), springConfig);
    const glareY = useSpring(useTransform(mouseY, [0, 1], [0, 100]), springConfig);
    const background = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.45) 0%, transparent 60%)`;

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        mouseX.set(x);
        mouseY.set(y);
    };

    const handleMouseLeave = () => {
        mouseX.set(0.5);
        mouseY.set(0.5);
    };

    return (
        <div style={{ perspective: "1500px" }} className="w-full flex justify-center items-center py-10" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
            <motion.div
                ref={ref}
                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                className="relative w-full max-w-[420px] aspect-[2/1] transition-transform duration-300 ease-out cursor-crosshair group"
            >
                <EngineeredGoldenTicket />
                
                <motion.div 
                    style={{ 
                        background,
                        clipPath: 'polygon(5% 0%, 95% 0%, 100% 5%, 100% 95%, 95% 100%, 5% 100%, 0% 95%, 0% 5%)'
                    }}
                    className="absolute inset-0 z-20 rounded-[2.5rem] mix-blend-overlay transition-opacity duration-300 pointer-events-none"
                />
            </motion.div>
        </div>
    );
}

// ─── 240HZ IMMERSIVE CIRCULAR GESTURE VALIDATOR ───
function CircularGestureClaim({ onClaim, disabled }: { onClaim: () => Promise<boolean>; disabled: boolean }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [status, setStatus] = useState<"IDLE" | "VERIFYING" | "VALIDATED">("IDLE");
    const angleSum = useRef(0);
    const lastAngle = useRef<number | null>(null);
    const claimFired = useRef(false);

    const pointsRef = useRef<{x: number, y: number, t: number}[]>([]);
    
    useEffect(() => {
        let frame: number;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const render = () => {
            const now = performance.now();
            pointsRef.current = pointsRef.current.filter(p => now - p.t < 400); 
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            if (pointsRef.current.length > 1) {
                ctx.beginPath();
                ctx.moveTo(pointsRef.current[0].x, pointsRef.current[0].y);
                 for (let i = 1; i < pointsRef.current.length; i++) {
                     const p = pointsRef.current[i];
                     ctx.lineTo(p.x, p.y);
                 }
                 ctx.strokeStyle = "rgba(0,0,0,0.8)";
                 ctx.lineWidth = 3;
                 ctx.lineCap = "round";
                 ctx.lineJoin = "round";
                 ctx.stroke();
            }

            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            ctx.beginPath();
            ctx.arc(cx, cy, 6, 0, Math.PI * 2);
            ctx.fillStyle = status === "VALIDATED" ? "#000" : "rgba(0,0,0,0.15)";
            ctx.fill();

            if (!claimFired.current) {
                const progress = Math.min(Math.abs(angleSum.current) / (Math.PI * 2), 1);
                if (progress > 0 && progress < 1) {
                    ctx.beginPath();
                    ctx.arc(cx, cy, 32, -Math.PI/2, -Math.PI/2 + (progress * Math.PI * 2));
                    ctx.strokeStyle = "rgba(0,0,0,0.2)";
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            }

            frame = requestAnimationFrame(render);
        };
        frame = requestAnimationFrame(render);
        return () => cancelAnimationFrame(frame);
    }, [status]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (claimFired.current || status === "VALIDATED") return;
            if (!containerRef.current) return;
            
            const rect = containerRef.current.getBoundingClientRect();
            if (e.clientX > rect.left - 50 && e.clientX < rect.right + 50 &&
                e.clientY > rect.top - 50 && e.clientY < rect.bottom + 50) {
                
                setStatus("VERIFYING");
                
                const lx = e.clientX - rect.left;
                const ly = e.clientY - rect.top;
                
                pointsRef.current.push({ x: lx, y: ly, t: performance.now() });

                const cx = rect.width / 2;
                const cy = rect.height / 2;
                const angle = Math.atan2(ly - cy, lx - cx);

                if (lastAngle.current !== null) {
                    let diff = angle - lastAngle.current;
                    while (diff < -Math.PI) diff += Math.PI * 2;
                    while (diff > Math.PI) diff -= Math.PI * 2;
                    angleSum.current += diff;

                    if (Math.abs(angleSum.current) >= Math.PI * 1.95) {
                        claimFired.current = true;
                        setStatus("VALIDATED");
                        onClaim();
                    }
                }
                lastAngle.current = angle;
            } else {
                setStatus("IDLE");
                angleSum.current = 0;
                lastAngle.current = null;
                pointsRef.current = [];
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [status, onClaim]);

    if (disabled) return null;

    return (
        <div 
            ref={containerRef}
            className="relative w-full max-w-[400px] h-32 mx-auto border border-black/10 rounded-3xl flex items-center justify-center overflow-hidden cursor-crosshair bg-white hover:shadow-inner transition-all duration-500"
        >
            <canvas 
                ref={canvasRef} 
                width={400} 
                height={128} 
                className="absolute inset-0 z-0 pointer-events-none"
            />
            <span className="font-mono text-[10px] text-black/40 tracking-[0.2em] font-bold z-10 select-none pointer-events-none transition-opacity">
                {status === "VALIDATED" 
                    ? "HUMAN VERIFIED" 
                    : status === "VERIFYING" 
                        ? `TRACKING ${(Math.min(Math.abs(angleSum.current) / (Math.PI*2), 1) * 100).toFixed(0)}%`
                        : "DRAW A CIRCLE TO VERIFY"}
            </span>
        </div>
    );
}

export default function GoldenTicketPage() {
  const { address: eoaAddress } = useSovereignAccount();
  const { address: sovereignAddress } = useWalletStore();
  const walletAddress = eoaAddress || sovereignAddress;

  const [status, setStatus] = useState<"loading" | "unclaimed" | "claimed">("loading");
  const [ticket, setTicket] = useState<any>(null);
  const [globalCount, setGlobalCount] = useState<number | null>(null);
  const { data: blockNumber } = useBlockNumber({ watch: true });

  // Poll Global Counter
  useEffect(() => {
     const fetchCount = async () => {
         try {
             const res = await fetch('/api/golden-ticket/count');
             const data = await res.json();
             if (data.count !== undefined) {
                 setGlobalCount(data.count);
             }
         } catch (e) {
             console.error("Count fetch error:", e);
         }
     };
     fetchCount();
     const interval = setInterval(fetchCount, 5000);
     return () => clearInterval(interval);
  }, []);

  // Check personal claim status
  useEffect(() => {
    if (!walletAddress) {
      setStatus("unclaimed");
      return;
    }
    const checkUserTicket = async () => {
      try {
        const res = await fetch(`/api/golden-ticket/claim?address=${walletAddress}`);
        const data = await res.json();
        
        if (data.hasClaimed && data.ticket) {
          setTicket(data.ticket);
          setStatus("claimed");
        } else {
          setStatus("unclaimed");
        }
      } catch {
        setStatus("unclaimed");
      }
    };
    checkUserTicket();
  }, [walletAddress]);

  const executeClaim = async (): Promise<boolean> => {
    if (!walletAddress) return false;
    try {
      const res = await fetch("/api/golden-ticket/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress, twitterHandle: null }),
      });
      const data = await res.json();

      if (res.status === 409) {
        toast.error("Already Claimed", { description: data.message });
        if (data.ticket) {
          setTicket(data.ticket);
          setStatus("claimed");
          return true;
        }
        return false;
      }
      if (!res.ok) {
        toast.error("Claim Failed", { description: data.error || "Network error." });
        return false;
      }
      
      toast.success("Golden ticket cemented inside the genesis ledger.");
      setTicket(data.ticket);
      setStatus("claimed");
      // Immediately increment the global counter optimally
      setGlobalCount(prev => (prev || 0) + 1);
      return true;
    } catch {
      toast.error("Network Error", { description: "Could not reach server." });
      return false;
    }
  };

  const formatDateTime = (dateString?: string) => {
      if (!dateString) return { date: "--", time: "--", day: "--" };
      const d = new Date(dateString);
      return {
          date: d.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
          time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' }),
          day: d.toLocaleDateString('en-US', { weekday: 'long' })
      };
  };

  const { date, time } = formatDateTime(ticket?.claimedAt);

  return (
    <div className="min-h-screen bg-[var(--aztec-parchment)] text-black flex flex-col font-sans relative selection:bg-[var(--aztec-orchid)]/20 overflow-hidden">
      
      {/* Exact Landing Page Wallpaper — HighHzWallpaper replica */}
      <div className="fixed z-[-10] inset-0 overflow-hidden bg-[var(--aztec-parchment)]">
          {/* Aztec Backdrop — identical settings to main site */}
          <div className="absolute inset-0 z-0">
              <Image
                  src="/models/update/Aztec Image_02.jpg"
                  alt=""
                  fill
                  className="object-cover opacity-[0.15] mix-blend-multiply brightness-[1.1]"
                  priority
              />
          </div>
          {/* Paper Grain Texture */}
          <div
              className="absolute inset-0 opacity-[0.15] pointer-events-none noise-bg z-10"
              style={{ transform: 'translate3d(0,0,0)', backfaceVisibility: 'hidden' }}
          />
          {/* Depth Shield */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-white/5 pointer-events-none z-20" />
      </div>

      <div className="flex-1 relative z-10 flex flex-col items-center justify-center p-6 max-w-5xl mx-auto w-full pt-20 pb-32">
          
          {/* Global Real-Time Counter Central Banner */}
          <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center mb-10 w-full"
          >
              <div className="flex items-center gap-12 text-center mb-6 w-full max-w-2xl px-8 py-6 rounded-3xl bg-white/40 border border-black/5 shadow-2xl backdrop-blur-3xl justify-center">
                  <div className="flex flex-col items-center">
                      <div className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-black/40 mb-2">Genesis Vault</div>
                      <div className="font-aztec-h1 text-4xl md:text-5xl font-bold bg-gradient-to-r from-black to-[#444] bg-clip-text text-transparent drop-shadow-sm tabular-nums tracking-tighter">
                         {globalCount !== null ? globalCount.toLocaleString() : "—"}
                      </div>
                      <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-black/30 mt-1">Claimed</div>
                  </div>
                  
                  <div className="w-px h-16 bg-black/10" />
                  
                  <div className="flex flex-col items-center">
                      <div className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-black/40 mb-2">Global Limit</div>
                      <div className="font-aztec-h1 text-4xl md:text-5xl font-bold bg-gradient-to-r from-black to-[#666] bg-clip-text text-transparent drop-shadow-sm tabular-nums tracking-tighter">
                         10,000
                      </div>
                      <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-black/50 mt-1">Max Supply</div>
                  </div>
              </div>

              {/* Live Network Feeds */}
              <div className="flex items-center gap-6 text-[10px] font-mono uppercase tracking-[0.2em] text-black/50 bg-black/5 px-6 py-2 rounded-full border border-black/5">
                  <div className="flex items-center gap-2">
                       <Activity size={12} className="text-green-600 animate-pulse" />
                       <span>L1 Sync Active</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-black/20" />
                  <div className="flex items-center gap-2">
                       <Clock size={12} />
                       <span>Block: {blockNumber ? blockNumber.toString() : '---'}</span>
                  </div>
              </div>
          </motion.div>

          {/* Golden Ticket 3D Render */}
          <FloatingTicket3D />

          {/* Explanation Text */}
          <div className="max-w-xl text-center mb-12">
              <p className="font-aztec-body text-base md:text-lg text-black/60 leading-relaxed font-normal not-italic">
                  Only users who claim the Gold Ticket prior to the system's launch will unlock exclusive access to all upcoming implementations within the Whale Alert Network.
              </p>
          </div>

          <div className="w-full max-w-[400px]">
              {status === "loading" ? (
                  <div className="h-20 flex items-center justify-center">
                      <Loader2 size={24} className="text-black/50 animate-spin" />
                  </div>
              ) : status === "unclaimed" ? (
                  <div className="text-center">
                      {walletAddress ? (
                          <CircularGestureClaim onClaim={executeClaim} disabled={false} />
                      ) : (
                          <div className="flex items-center justify-center gap-3 mt-8 py-5 bg-black/[0.03] border border-black/5 rounded-2xl font-mono text-[10px] text-black/50 uppercase tracking-[0.2em] shadow-inner select-none pointer-events-none">
                              <Lock size={12} className="text-black/30" /> CONNECT WALLET TO PROCEED
                          </div>
                      )}
                  </div>
              ) : (
                  <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-white border border-black/5 rounded-3xl p-6 text-center shadow-2xl shadow-black/5 space-y-6"
                  >
                      <div className="flex flex-col items-center justify-center space-y-2 pb-4 border-b border-black/5">
                          <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center shrink-0 mb-2">
                             <Fingerprint size={24} className="text-black" />
                          </div>
                          <h3 className="font-aztec-body text-2xl font-bold text-black drop-shadow-sm">Identity Secured</h3>
                          <div className="text-[10px] font-mono font-bold text-black/60 tracking-[0.2em] uppercase">You are unique in the world</div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-left px-2">
                          <div>
                              <div className="text-[9px] font-mono text-black/40 uppercase tracking-[0.2em] mb-1">Hash Signature</div>
                              <div className="text-xs font-mono font-bold text-black/80">{walletAddress?.slice(0,6)}...{walletAddress?.slice(-4)}</div>
                          </div>
                          <div>
                              <div className="text-[9px] font-mono text-black/40 uppercase tracking-[0.2em] mb-1">Capture Time</div>
                              <div className="text-xs font-mono font-bold text-black/80">{date} • {time.split(' ')[0]}</div>
                          </div>
                      </div>
                  </motion.div>
              )}
          </div>

      </div>
    </div>
  );
}
