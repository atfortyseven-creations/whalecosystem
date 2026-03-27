"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { ChevronRight, Lock, Loader2, CheckCircle2 } from "lucide-react";
import { useSovereignAccount } from "@/hooks/useSovereignAccount";
import { useWalletStore } from "@/lib/store/wallet-store";
import { toast } from "sonner";
import Link from "next/link";
import "@/app/dashboard/dashboard.css";

interface GoldenTicketData {
  id: string;
  ticketNumber: number;
  serialCode: string;
  tier: string;
  badgeColor: string;
  networkLaunchEligible: boolean;
  twitterHandle: string | null;
  isActive: boolean;
  claimedAt: string;
}

// Minimalist Golden W Logo
function GoldenW() {
    return (
        <div className="w-24 h-24 mb-6 flex flex-col items-center justify-center relative mx-auto">
            <div className="absolute inset-0 bg-[#D4AF37]/10 blur-xl rounded-full" />
            <svg viewBox="0 0 100 100" className="w-20 h-20 drop-shadow-[0_0_15px_rgba(212,175,55,0.4)] relative z-10">
                <path 
                    d="M10 20 L30 80 L50 40 L70 80 L90 20" 
                    fill="none" 
                    stroke="url(#goldGradient)" 
                    strokeWidth="8" 
                    strokeLinejoin="round" 
                    strokeLinecap="round" 
                />
                <defs>
                    <linearGradient id="goldGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#D4AF37" />
                        <stop offset="50%" stopColor="#FFF2CD" />
                        <stop offset="100%" stopColor="#AA7C11" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
}

// Slide to Claim component
function SlideToClaim({ onClaim, disabled }: { onClaim: () => Promise<boolean>; disabled: boolean }) {
    const [claiming, setClaiming] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const background = useTransform(
        x,
        [0, 200],
        ["rgba(255,255,255,0.02)", "rgba(212,175,55,0.15)"]
    );
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
            x.set(0); // Snap back if not reached threshold
        }
    };

    if (disabled) return null;

    return (
        <motion.div ref={containerRef} style={{ background }} className="relative w-full max-w-[300px] h-14 mx-auto border border-white/10 rounded-full flex items-center px-1 overflow-hidden mt-10 shadow-inner">
            <motion.div style={{ opacity: textOpacity }} className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="font-mono text-[10px] text-white/50 tracking-[0.25em] font-bold">SLIDE TO SECURE RECORD</span>
            </motion.div>
            
            <motion.div
                drag={claiming ? false : "x"}
                dragConstraints={containerRef}
                dragSnapToOrigin={false}
                dragElastic={0.05}
                onDragEnd={handleDragEnd}
                style={{ x }}
                className="w-12 h-12 bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing z-10 shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:scale-[1.02] transition-transform"
            >
                {claiming ? <Loader2 size={16} className="text-black animate-spin" /> : <ChevronRight size={20} className="text-black ml-0.5" />}
            </motion.div>
        </motion.div>
    );
}

export default function GoldenTicketPage() {
  const { address: eoaAddress } = useSovereignAccount();
  const { address: sovereignAddress } = useWalletStore();
  const walletAddress = eoaAddress || sovereignAddress;

  const [status, setStatus] = useState<"loading" | "unclaimed" | "claimed">("loading");
  const [ticket, setTicket] = useState<GoldenTicketData | null>(null);

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

  const { date, time, day } = formatDateTime(ticket?.claimedAt);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans relative selection:bg-yellow-500/20">
      
      {/* Immersive Dark Stack Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(212,175,55,0.04),_transparent_60%)]" />
         <div className="absolute top-0 left-0 w-full h-full bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.01)_2px,rgba(255,255,255,0.01)_4px)]" />
      </div>

      {/* Header exactly as requested */}
      <div className="relative z-10 flex-shrink-0 border-b border-white/[0.04] px-6 sm:px-12 py-6 bg-black/40 backdrop-blur-3xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-[1400px] mx-auto">
          <div className="flex items-center gap-4">
            <span className="font-mono text-[9px] font-black tracking-[0.2em] uppercase px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full flex items-center gap-2 shadow-[0_0_10px_rgba(34,197,94,0.1)]">
               <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> LIVE
            </span>
            <h1 className="font-aztec-body text-xl font-bold tracking-tight text-white leading-none">
              Terminal Insider
            </h1>
            <span className="font-mono text-[10px] text-white/40 tracking-widest hidden md:inline-block">
              — Exclusive Genesis Launch Event
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[9px] text-white/30 uppercase tracking-[0.15em]">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={10} className="text-white/20" />
            <span className="text-white/70 font-bold">Terminal Insider</span>
          </div>
        </div>
      </div>

      {/* Main Content - Ultra Minimalist Ticket Interface */}
      <div className="flex-1 relative z-10 flex items-center justify-center p-6">
          <div className="w-full max-w-[400px] bg-white/[0.01] border border-white/5 rounded-[2.5rem] p-10 sm:p-12 shadow-2xl relative overflow-hidden backdrop-blur-sm group">
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
              
              <GoldenW />

              {status === "loading" ? (
                  <div className="h-40 flex items-center justify-center">
                      <Loader2 size={24} className="text-[#D4AF37]/50 animate-spin" />
                  </div>
              ) : status === "unclaimed" ? (
                  <div className="text-center space-y-8">
                      <div className="space-y-1">
                          <h2 className="font-aztec-body text-2xl text-white tracking-tight">Genesis Ledger</h2>
                          <div className="text-[10px] font-mono text-white/40 uppercase tracking-[0.3em]">Status: <span className="text-white/60 font-bold tracking-[0.1em]">UNCLAIMED</span></div>
                      </div>

                      <div className="py-4 space-y-4">
                         <div className="flex justify-between items-center text-[10px] font-mono border-b border-white/[0.03] pb-3">
                             <span className="text-white/30 uppercase tracking-[0.2em]">Wallet Hash</span>
                             <span className="text-white/80">{walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "AWAITING..."}</span>
                         </div>
                         <div className="flex justify-between items-center text-[10px] font-mono border-b border-white/[0.03] pb-3">
                             <span className="text-white/30 uppercase tracking-[0.2em]">Protocol Entry</span>
                             <span className="text-[#D4AF37]">Required</span>
                         </div>
                      </div>

                      {walletAddress ? (
                          <SlideToClaim onClaim={executeClaim} disabled={false} />
                      ) : (
                          <div className="flex items-center justify-center gap-3 mt-8 py-5 bg-white/[0.02] border border-white/5 rounded-2xl font-mono text-[10px] text-white/30 uppercase tracking-[0.2em] shadow-inner">
                              <Lock size={12} className="text-white/20" /> CONNECT WALLET TO PROCEED
                          </div>
                      )}
                  </div>
              ) : (
                  <div className="text-center space-y-10 animate-in fade-in zoom-in-95 duration-1000">
                      <div className="space-y-3">
                          <h2 className="font-aztec-body text-3xl font-bold bg-gradient-to-br from-[#F9D423] via-[#D4AF37] to-[#AA7C11] bg-clip-text text-transparent drop-shadow-sm">
                              Ticket Claimed
                          </h2>
                          <div className="text-[10px] font-mono text-white/40 uppercase tracking-[0.3em] font-bold">Genesis Ledger Linked</div>
                      </div>

                      <div className="bg-[#050505]/60 border border-[#D4AF37]/20 rounded-3xl p-6 text-left space-y-5 relative shadow-[inset_0_0_20px_rgba(212,175,55,0.03)]">
                          <div className="absolute right-0 top-0 w-32 h-32 bg-[#D4AF37]/5 blur-3xl pointer-events-none" />
                          
                          <div className="flex items-center gap-3 border-b border-white/[0.03] pb-4">
                             <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                                <CheckCircle2 size={16} className="text-green-500" />
                             </div>
                             <div>
                                <div className="text-[8px] font-mono text-white/30 uppercase tracking-[0.25em] mb-0.5">Database Registry</div>
                                <div className="text-[11px] font-mono font-bold text-green-400">SUCCESSFUL (NODE 1)</div>
                             </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <div className="text-[8px] font-mono text-white/30 uppercase tracking-[0.25em] mb-1">Day</div>
                                  <div className="text-[11px] font-mono font-bold text-white/80">{day}</div>
                              </div>
                              <div>
                                  <div className="text-[8px] font-mono text-white/30 uppercase tracking-[0.25em] mb-1">Date</div>
                                  <div className="text-[11px] font-mono font-bold text-white/80">{date}</div>
                              </div>
                          </div>
                          <div className="border-t border-white/[0.03] pt-4">
                              <div className="text-[8px] font-mono text-white/30 uppercase tracking-[0.25em] mb-1">Time Captured (UTC)</div>
                              <div className="text-[13px] font-mono font-bold text-white/90 tracking-tight">{time}</div>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
}
