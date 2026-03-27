"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ticket, Twitter, CheckCircle2, Loader2, AlertCircle, Copy, Sparkles, Lock, Globe, Shield } from "lucide-react";
import { useSovereignAccount } from "@/hooks/useSovereignAccount";
import { useWalletStore } from "@/lib/store/wallet-store";
import { toast } from "sonner";
import { InstitutionalShell } from "@/components/shared/InstitutionalShell";
import useSWR from "swr";
import "@/app/dashboard/dashboard.css";

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── SWR Fetcher ──────────────────────────────────────────────────────────────
const fetcher = (url: string) => fetch(url).then(res => res.json());

// ─── Golden Badge Component ────────────────────────────────────────────────────

function GoldenBadge({ ticket, animateIn = false }: { ticket: GoldenTicketData; animateIn?: boolean }) {
  const [copied, setCopied] = useState(false);

  const copySerial = () => {
    navigator.clipboard.writeText(ticket.serialCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={animateIn ? { scale: 0.5, opacity: 0, rotateY: 90 } : false}
      animate={{ scale: 1, opacity: 1, rotateY: 0 }}
      transition={{ type: "spring", damping: 15, stiffness: 100 }}
      className="relative z-10 w-full max-w-md mx-auto perspective-1000"
    >
      {/* Immersive Outer Glow */}
      <div className="absolute -inset-10 rounded-full bg-yellow-500/10 blur-3xl animate-pulse" />
      <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-yellow-600/20 to-transparent blur-xl" />

      {/* Badge card with 3D Tilt effect */}
      <motion.div 
        whileHover={{ rotateX: 5, rotateY: -5 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative bg-gradient-to-br from-[#1a1400] via-[#2d2200] to-[#0a0800] border border-yellow-500/40 rounded-3xl p-10 overflow-hidden shadow-[0_20px_60px_rgba(234,179,8,0.15)]"
      >
        
        {/* Shiny scanning line */}
        <motion.div
          animate={{ x: ["-100%", "200%"] }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear", repeatDelay: 1 }}
          className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-yellow-300/10 to-transparent skew-x-12 pointer-events-none"
        />

        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_10px_rgba(234,179,8,1)]" />
            <span className="font-mono text-[10px] text-yellow-500/80 tracking-[0.4em] uppercase font-bold">Genesis Insider</span>
          </div>
          <Shield size={16} className="text-yellow-600/40" />
        </div>

        {/* Main icon */}
        <div className="flex justify-center mb-8 relative">
          <div className="absolute inset-0 bg-yellow-500/20 blur-2xl rounded-full" />
          <div className="w-28 h-28 bg-gradient-to-b from-yellow-500/20 to-transparent rounded-full border border-yellow-400/30 flex items-center justify-center shadow-[inset_0_0_20px_rgba(234,179,8,0.2)]">
            <Ticket size={56} className="text-yellow-400 drop-shadow-[0_0_15px_rgba(234,179,8,0.8)]" />
          </div>
        </div>

        {/* Ticket number */}
        <div className="text-center mb-6">
          <span className="font-mono text-5xl font-black bg-gradient-to-b from-yellow-200 via-yellow-500 to-yellow-700 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(234,179,8,0.4)]">
            #{String(ticket.ticketNumber).padStart(6, "0")}
          </span>
        </div>

        {/* Serial Code */}
        <div className="text-center mb-8 pb-8 border-b border-yellow-500/10">
          <button
            onClick={copySerial}
            className="group font-mono text-xl text-yellow-600/80 tracking-[0.3em] hover:text-yellow-400 transition-colors flex items-center gap-3 mx-auto"
          >
            {ticket.serialCode}
            {copied ? <CheckCircle2 size={18} className="text-green-400" /> : <Copy size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
          </button>
        </div>

        {/* Status chips */}
        <div className="flex gap-3 justify-center flex-wrap mb-4">
          <span className="px-4 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full font-mono text-[10px] text-yellow-500 font-bold uppercase tracking-widest flex items-center gap-2">
            <Sparkles size={12} /> {ticket.tier}
          </span>
          <span className="px-4 py-1.5 bg-green-500/5 border border-green-500/20 rounded-full font-mono text-[10px] text-green-400 font-bold uppercase tracking-widest flex items-center gap-2">
            <CheckCircle2 size={12} /> Eligible
          </span>
        </div>

        {/* Twitter Handle */}
        {ticket.twitterHandle && (
          <div className="text-center flex justify-center mt-4">
             <span className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full flex items-center gap-2 font-mono text-xs text-yellow-100/70">
                <Twitter size={12} className="text-[#1DA1F2]" /> @{ticket.twitterHandle}
             </span>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Claim Form ────────────────────────────────────────────────────────────────

function ClaimForm({ address, onClaimed }: { address: string; onClaimed: (t: GoldenTicketData) => void }) {
  const [twitter, setTwitter] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClaim = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/golden-ticket/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address, twitterHandle: twitter || null }),
      });
      const data = await res.json();

      if (res.status === 409) {
        toast.error("Already Claimed", { description: data.message });
        if (data.ticket) onClaimed(data.ticket);
        return;
      }
      if (!res.ok) {
        toast.error("Claim Failed", { description: data.error || "Network error." });
        return;
      }
      toast.success("Golden Badge Secured!", {
        description: `Serial: ${data.ticket.serialCode}`,
        duration: 6000,
      });
      onClaimed(data.ticket);
    } catch {
      toast.error("Network Error", { description: "Could not reach server." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-md mx-auto bg-white/[0.02] border border-white/5 p-8 rounded-3xl relative overflow-hidden"
    >
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />
      
      <div className="space-y-3">
        <label className="font-mono text-xs text-white/50 uppercase tracking-widest flex items-center gap-2 mb-4">
          <Twitter size={14} className="text-white/30" /> Link Identity (Optional)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-lg text-white/30">@</span>
          <input
            type="text"
            value={twitter}
            onChange={e => setTwitter(e.target.value.replace(/^@/, ""))}
            placeholder="username"
            className="w-full bg-black/50 border border-white/10 text-white font-mono text-base py-4 pl-10 pr-4 rounded-xl focus:border-yellow-500/50 focus:outline-none focus:ring-1 focus:ring-yellow-500/20 transition-all shadow-inner"
          />
        </div>
        <p className="text-[11px] text-white/30 font-mono leading-relaxed pt-2">
          Your handle will be crystallized into your golden badge, cementing your status as an early backer at network launch.
        </p>
      </div>

      <motion.button
        onClick={handleClaim}
        disabled={loading}
        whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(234,179,8,0.2)" }}
        whileTap={{ scale: 0.98 }}
        className="relative overflow-hidden w-full py-5 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-black font-mono text-sm uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
      >
        <div className="absolute inset-0 bg-white/20 mix-blend-overlay w-full h-full skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-1000" />
        {loading ? (
          <><Loader2 size={18} className="animate-spin" /> Verifying...</>
        ) : (
          <><Ticket size={18} /> Secure My Place</>
        )}
      </motion.button>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function GoldenTicketPage() {
  const { address: eoaAddress } = useSovereignAccount();
  const { address: sovereignAddress } = useWalletStore();
  const walletAddress = eoaAddress || sovereignAddress;

  const [status, setStatus] = useState<"loading" | "unclaimed" | "claimed">("loading");
  const [ticket, setTicket] = useState<GoldenTicketData | null>(null);
  const [animateIn, setAnimateIn] = useState(false);

  // Real-time polling for total claimed (every 3 seconds)
  const { data: statsData } = useSWR("/api/golden-ticket/stats", fetcher, { 
      refreshInterval: 3000,
      fallbackData: { totalClaimed: 0 }
  });

  // Verify specific user ticket status on load/wallet change
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

  const handleClaimed = (t: GoldenTicketData) => {
    setTicket(t);
    setStatus("claimed");
    setAnimateIn(true);
  };

  const totalClaimed = statsData?.totalClaimed || 0;

  return (
    <InstitutionalShell
      title="Terminal Insider"
      subtitle="Exclusive Genesis Launch Event"
      badge="LIVE"
      badgeVariant="emerald"
    >
      {/* Immersive Background Effects */}
      <div className="absolute inset-x-0 top-0 h-[500px] bg-gradient-to-b from-yellow-900/10 via-yellow-900/5 to-transparent pointer-events-none -z-10" />
      
      <div className="max-w-5xl mx-auto px-6 py-16 space-y-20 relative">

        {/* ─── Hero ── */}
        <div className="text-center space-y-8 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex justify-center"
          >
            <div className="relative">
                <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full animate-pulse" />
                <div className="w-24 h-24 bg-gradient-to-b from-yellow-500/10 to-transparent rounded-full border border-yellow-500/30 flex items-center justify-center relative shadow-[inset_0_0_30px_rgba(234,179,8,0.1)]">
                    <Sparkles size={40} className="text-yellow-400 drop-shadow-[0_0_15px_rgba(234,179,8,1)]" />
                </div>
            </div>
          </motion.div>
          
          <div className="space-y-4">
              <h1 className="font-aztec-body font-light tracking-tight text-4xl md:text-6xl text-white">
                The <span className="font-bold bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">Genesis Badge</span>
              </h1>
              <p className="font-aztec-body text-white/50 text-xl max-w-2xl mx-auto leading-relaxed">
                A permanent, non-transferable insignia recognizing our earliest sovereign backers. Only Genesis insiders will display the golden badge upon network launch.
              </p>
          </div>

          {/* Real-time Social Proof Counter */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-4 pt-6"
          >
            <div className="flex -space-x-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-600 to-yellow-900 border-[3px] border-[#0a0a0a] flex items-center justify-center shadow-lg relative z-[5-i]">
                   <span className="font-mono text-[9px] font-black text-black">0x</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-start text-left pl-2 border-l border-white/10">
                <span className="font-mono text-2xl font-black text-white flex items-center gap-2">
                    {totalClaimed.toLocaleString()} <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                </span>
                <span className="font-mono text-[10px] text-white/40 tracking-[0.2em] uppercase">Tickets secured live</span>
            </div>
          </motion.div>
        </div>

        {/* ─── Immersive Explanation Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <Lock size={20} />, title: "Sovereign Bond", desc: "Bound infinitely to your exact wallet address on the database ledger. Zero duplicates." },
            { icon: <Shield size={20} />, title: "Visual Prestige", desc: "Unlocks the golden halo effect around your avatar across the entire Whale Alert ecosystem." },
            { icon: <Globe size={20} />, title: "Launch Priority", desc: "Guarantees tier-1 access to restricted beta features when the mainnet protocol goes live." },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              className="p-8 bg-black/40 border border-white/5 rounded-2xl hover:bg-white/[0.02] hover:border-yellow-500/20 transition-all duration-500 group"
            >
              <div className="text-white/30 group-hover:text-yellow-400 transition-colors mb-4">{f.icon}</div>
              <div className="font-aztec-body text-white text-lg mb-2">{f.title}</div>
              <div className="font-aztec-body text-white/40 text-sm leading-relaxed">{f.desc}</div>
            </motion.div>
          ))}
        </div>

        {/* ─── State Machine ── */}
        <div className="relative pt-10">
            {/* Ambient background for the action area */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-yellow-900/5 to-transparent blur-3xl -z-10" />

          <AnimatePresence mode="wait">
            {status === "loading" && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 size={40} className="text-yellow-500/50 animate-spin" />
                <div className="font-mono text-xs text-yellow-500/50 tracking-widest uppercase animate-pulse">Establishing secure connection...</div>
              </motion.div>
            )}

            {status === "unclaimed" && !walletAddress && (
               <motion.div key="noWallet" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="text-center py-20 px-6 bg-white/[0.01] border border-white/5 rounded-3xl max-w-2xl mx-auto shadow-2xl">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                    <Lock size={24} className="text-white/40" />
                </div>
                <div className="font-aztec-body font-light text-3xl text-white mb-4">Auth Required</div>
                <p className="font-aztec-body text-white/50 text-base max-w-md mx-auto leading-relaxed">
                  The Genesis Ticket is tied strictly to cryptographic identities. Connect your local hardware or web3 wallet to proceed.
                </p>
              </motion.div>
            )}

            {status === "unclaimed" && walletAddress && (
              <motion.div key="claimForm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12 pb-12">
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 mb-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      <span className="font-mono text-[10px] text-green-400 tracking-widest uppercase font-bold">Identity Verified</span>
                  </div>
                  <h2 className="font-aztec-body text-3xl text-white">Secure Your Allocation</h2>
                  <p className="font-aztec-body text-white/50 text-base max-w-lg mx-auto">
                    Your current wallet <strong>({walletAddress.slice(0, 6)}...{walletAddress.slice(-4)})</strong> is eligible. Claiming now permanently records this address in the Genesis Ledger.
                  </p>
                </div>
                <ClaimForm address={walletAddress} onClaimed={handleClaimed} />
              </motion.div>
            )}

            {status === "claimed" && ticket && (
              <motion.div key="claimed" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-12 pb-20">
                <div className="text-center max-w-lg mx-auto">
                  <h2 className="font-aztec-body text-3xl text-white mb-4">You Are a Genesis Insider</h2>
                  <p className="font-aztec-body text-white/50 text-base leading-relaxed">
                    Your ticket is forged and stored immutably. Upon network launch, your terminal will feature the legendary golden aesthetic.
                  </p>
                </div>
                
                <GoldenBadge ticket={ticket} animateIn={animateIn} />
                
                {/* Share on Twitter Immersive Button */}
                <div className="flex justify-center pt-8">
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`🎟️ Secured my Genesis Insider badge for the @whalecosystem network launch!\n\nSerial: ${ticket.serialCode}\n\nOnly early backers earn the golden insignia. Claim yours: https://humanidfi.com/ticket`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex items-center gap-3 px-8 py-4 bg-black border border-white/20 rounded-2xl font-mono text-sm text-white/80 hover:text-white transition-all overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-[#1DA1F2]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Twitter size={18} className="text-[#1DA1F2] relative z-10 drop-shadow-[0_0_8px_rgba(29,161,242,0.6)]" />
                    <span className="relative z-10 tracking-[0.2em] uppercase font-bold text-xs">Share Protocol Status</span>
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </InstitutionalShell>
  );
}
