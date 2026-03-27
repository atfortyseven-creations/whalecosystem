"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring, useMotionTemplate } from "framer-motion";
import { ChevronRight, Lock, Loader2, Sparkles, Fingerprint } from "lucide-react";
import { useSovereignAccount } from "@/hooks/useSovereignAccount";
import { useWalletStore } from "@/lib/store/wallet-store";
import { toast } from "sonner";
import Image from "next/image";
import "@/app/dashboard/dashboard.css";

// ─── 3D TICKET COMPONENT ───
function FloatingTicket3D() {
    const ref = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0.5);
    const mouseY = useMotionValue(0.5);

    // Smooth physics
    const springConfig = { damping: 20, stiffness: 100, mass: 0.5 };
    const rotateX = useSpring(useTransform(mouseY, [0, 1], [15, -15]), springConfig);
    const rotateY = useSpring(useTransform(mouseX, [0, 1], [-20, 20]), springConfig);
    
    // Specular lighting effect
    const glareX = useSpring(useTransform(mouseX, [0, 1], [0, 100]), springConfig);
    const glareY = useSpring(useTransform(mouseY, [0, 1], [0, 100]), springConfig);
    const background = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.4) 0%, transparent 50%)`;

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
                className="relative w-full max-w-[400px] aspect-[16/9] rounded-2xl shadow-[0_30px_60px_-15px_rgba(212,175,55,0.4)] md:shadow-[0_50px_100px_-20px_rgba(212,175,55,0.3)] transition-shadow duration-500 overflow-hidden cursor-crosshair group bg-[#F5ECDB]"
            >
                {/* 3D Ticket Image */}
                <Image 
                    src="/golden-ticket-3d.jpg" 
                    alt="Golden Ticket 3D" 
                    fill 
                    className="object-cover scale-[1.05]"
                    priority
                />
                
                {/* Glare effect matching mouse */}
                <motion.div 
                    style={{ background }}
                    className="absolute inset-0 z-10 opacity-50 mix-blend-overlay transition-opacity duration-300"
                />
                
                {/* Edge Highlights */}
                <div className="absolute inset-0 rounded-2xl border border-white/40 pointer-events-none z-20" />
            </motion.div>
        </div>
    );
}

// ─── SLIDE TO CLAIM ───
function SlideToClaim({ onClaim, disabled }: { onClaim: () => Promise<boolean>; disabled: boolean }) {
    const [claiming, setClaiming] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const background = useTransform(x, [0, 200], ["rgba(255,255,255,1)", "rgba(240, 230, 210, 1)"]);
    const textOpacity = useTransform(x, [0, 150], [1, 0]);

    const handleDragEnd = async () => {
        if (x.get() > 180) {
            setClaiming(true);
            const success = await onClaim();
            if (!success) {
                setClaiming(false);
                x.set(0);
            }
        } else {
            x.set(0);
        }
    };

    if (disabled) return null;

    return (
        <motion.div ref={containerRef} style={{ background }} className="relative w-full max-w-[320px] h-14 mx-auto border border-black/10 rounded-full flex items-center px-1 overflow-hidden mt-8 shadow-sm">
            <motion.div style={{ opacity: textOpacity }} className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="font-mono text-[10px] text-black/40 tracking-[0.2em] font-bold">SLIDE TO SECURE RECORD</span>
            </motion.div>
            
            <motion.div
                drag={claiming ? false : "x"}
                dragConstraints={containerRef}
                dragSnapToOrigin={false}
                dragElastic={0.05}
                onDragEnd={handleDragEnd}
                style={{ x }}
                className="w-12 h-12 bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing z-10 shadow-md hover:scale-[1.02] transition-transform"
            >
                {claiming ? <Loader2 size={16} className="text-white animate-spin" /> : <ChevronRight size={20} className="text-white ml-0.5" />}
            </motion.div>
        </motion.div>
    );
}

export default function GoldenTicketPage() {
  const { address: eoaAddress } = useSovereignAccount();
  const { address: sovereignAddress } = useWalletStore();
  const walletAddress = eoaAddress || sovereignAddress;

  const [status, setStatus] = useState<"loading" | "unclaimed" | "claimed">("loading");
  const [ticket, setTicket] = useState<any>(null);
  const [globalCount, setGlobalCount] = useState<number | null>(null);

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
    <div className="min-h-screen bg-[#FAFAFA] text-black flex flex-col font-sans relative selection:bg-[var(--aztec-orchid)]/20 overflow-hidden">
      
      {/* Immersive Landing-Page Ambient White Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_#FFFFFF_0%,_transparent_60%)]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[1000px] max-h-[1000px] bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.03)_0%,_transparent_70%)] rounded-full blur-3xl opacity-80" />
          <div className="absolute inset-0 opacity-[0.015] mix-blend-multiply" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }} />
      </div>

      <div className="flex-1 relative z-10 flex flex-col items-center justify-center p-6 max-w-5xl mx-auto w-full pt-20 pb-32">
          
          {/* Global Real-Time Counter Central Banner */}
          <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center mb-6"
          >
              <div className="flex items-center gap-2 mb-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                 <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-black/40 font-bold">Genesis Ledger Live</span>
              </div>
              <div className="font-aztec-h1 text-5xl md:text-7xl font-bold bg-gradient-to-r from-black via-[#333] to-black bg-clip-text text-transparent drop-shadow-sm tabular-nums tracking-tighter">
                 {globalCount !== null ? globalCount.toLocaleString() : "..."}
              </div>
              <div className="font-mono text-xs uppercase tracking-[0.4em] text-black/40 mt-3">
                 Total Tickets Claimed Worldwide
              </div>
          </motion.div>

          {/* Golden Ticket 3D Render */}
          <FloatingTicket3D />

          {/* Explanation Text */}
          <div className="max-w-xl text-center mb-12">
              <p className="font-aztec-body text-base md:text-lg text-black/60 leading-relaxed font-normal not-italic">
                  The Genesis Golden Ticket is a permanent, non-transferable cryptographic signature cementing your presence in the Whale Alert ecosystem. Every single participant is strictly unique globally, verifying institutional loyalty directly on-chain.
              </p>
          </div>

          <div className="w-full max-w-[400px]">
              {status === "loading" ? (
                  <div className="h-20 flex items-center justify-center">
                      <Loader2 size={24} className="text-[#D4AF37]/50 animate-spin" />
                  </div>
              ) : status === "unclaimed" ? (
                  <div className="text-center">
                      {walletAddress ? (
                          <SlideToClaim onClaim={executeClaim} disabled={false} />
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
                          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center shrink-0 mb-2">
                             <Fingerprint size={24} className="text-green-500" />
                          </div>
                          <h3 className="font-aztec-body text-2xl font-bold text-black drop-shadow-sm">Identity Secured</h3>
                          <div className="text-[10px] font-mono font-bold text-[#D4AF37] tracking-[0.2em] uppercase">You are unique in the world</div>
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
