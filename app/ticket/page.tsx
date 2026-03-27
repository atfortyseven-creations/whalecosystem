"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ticket, Twitter, CheckCircle2, Loader2, AlertCircle, Copy, ChevronsDown, Sparkles, Lock, Zap, Globe } from "lucide-react";
import { useSovereignAccount } from "@/hooks/useSovereignAccount";
import { useWalletStore } from "@/lib/store/wallet-store";
import { toast } from "sonner";
import { InstitutionalShell } from "@/components/shared/InstitutionalShell";
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
      className="relative"
    >
      {/* Outer glow ring */}
      <div className="absolute -inset-4 rounded-full bg-yellow-400/20 blur-xl animate-pulse" />
      <div className="absolute -inset-2 rounded-full bg-yellow-500/10 blur-lg" />

      {/* Badge card */}
      <div className="relative bg-gradient-to-br from-[#1a1400] via-[#2d2200] to-[#1a1400] border border-yellow-500/40 rounded-2xl p-8 overflow-hidden w-full max-w-md mx-auto shadow-[0_0_60px_rgba(234,179,8,0.2)]">
        
        {/* Shiny scanning line */}
        <motion.div
          animate={{ x: ["-100%", "200%"] }}
          transition={{ repeat: Infinity, duration: 3.5, ease: "linear", repeatDelay: 2 }}
          className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-yellow-300/20 to-transparent skew-x-12 pointer-events-none"
        />

        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            <span className="font-mono text-[9px] text-yellow-500/70 tracking-[0.4em] uppercase">Genesis Insider</span>
          </div>
          <span className="font-mono text-[9px] text-yellow-600/50 tracking-widest">WHALE NETWORK</span>
        </div>

        {/* Main icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-yellow-500/10 rounded-full border border-yellow-400/30 flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.3)]">
            <Ticket size={48} className="text-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]" />
          </div>
        </div>

        {/* Serial Code */}
        <div className="text-center mb-6">
          <div className="font-mono text-xs text-yellow-600/50 tracking-widest uppercase mb-1">Serial Code</div>
          <button
            onClick={copySerial}
            className="font-mono text-2xl text-yellow-400 tracking-widest hover:text-yellow-300 transition-colors flex items-center gap-2 mx-auto"
          >
            {ticket.serialCode}
            {copied ? <CheckCircle2 size={16} className="text-green-400" /> : <Copy size={14} className="opacity-40" />}
          </button>
        </div>

        {/* Ticket number */}
        <div className="text-center mb-6">
          <span className="font-mono text-4xl font-black bg-gradient-to-r from-yellow-600 via-yellow-300 to-yellow-600 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]">
            #{String(ticket.ticketNumber).padStart(6, "0")}
          </span>
        </div>

        {/* Status chips */}
        <div className="flex gap-2 justify-center flex-wrap mb-4">
          <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full font-mono text-[9px] text-yellow-400 uppercase tracking-widest">
            ⚡ {ticket.tier}
          </span>
          <span className="px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full font-mono text-[9px] text-green-400 uppercase tracking-widest">
            ✓ Network Eligible
          </span>
        </div>

        {/* Twitter handle if set */}
        {ticket.twitterHandle && (
          <div className="text-center text-[11px] text-yellow-600/60 font-mono mt-2">
            @{ticket.twitterHandle}
          </div>
        )}

        {/* Claimed date */}
        <div className="mt-4 pt-4 border-t border-yellow-500/10 text-center">
          <span className="font-mono text-[8px] text-yellow-700/50 tracking-widest uppercase">
            Claimed · {new Date(ticket.claimedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </span>
        </div>
      </div>
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
      toast.success("🎟️ Genesis Ticket Claimed!", {
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
      className="space-y-6 max-w-md mx-auto"
    >
      <div className="space-y-2">
        <label className="az-label flex items-center gap-2">
          <Twitter size={11} /> Twitter/X Handle (Optional)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm text-white/30">@</span>
          <input
            type="text"
            value={twitter}
            onChange={e => setTwitter(e.target.value.replace(/^@/, ""))}
            placeholder="yourhandle"
            className="az-input pl-8 w-full bg-white/[0.03] border border-white/10 text-white font-mono text-sm py-3 px-4 rounded-xl focus:border-yellow-500/40 focus:outline-none focus:ring-1 focus:ring-yellow-500/20 transition-all"
          />
        </div>
        <p className="text-[10px] text-white/30 font-mono leading-relaxed">
          Your Twitter/X handle will be displayed alongside your golden badge at the network launch.
        </p>
      </div>

      <motion.button
        onClick={handleClaim}
        disabled={loading}
        whileHover={{ scale: 1.03, boxShadow: "0 0 40px rgba(234,179,8,0.3)" }}
        whileTap={{ scale: 0.97 }}
        className="w-full py-4 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-black font-mono text-sm uppercase tracking-[0.3em] rounded-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_32px_rgba(234,179,8,0.2)] transition-all duration-300"
      >
        {loading ? (
          <><Loader2 size={16} className="animate-spin" /> Processing Claim...</>
        ) : (
          <><Ticket size={16} /> Claim My Genesis Ticket</>
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
  const [totalClaimed, setTotalClaimed] = useState(0);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (!walletAddress) {
      setStatus("unclaimed");
      return;
    }
    const check = async () => {
      try {
        const res = await fetch(`/api/golden-ticket/claim?address=${walletAddress}`);
        const data = await res.json();
        setTotalClaimed(data.totalClaimed || 0);
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
    check();
  }, [walletAddress]);

  const handleClaimed = (t: GoldenTicketData) => {
    setTicket(t);
    setStatus("claimed");
    setTotalClaimed(p => p + 1);
    setAnimateIn(true);
  };

  return (
    <InstitutionalShell
      title="Genesis Ticket"
      subtitle="Whale Network — Founding Insider Program"
      badge="GENESIS"
      badgeVariant="amber"
    >
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">

        {/* ─── Hero ── */}
        <div className="text-center space-y-4 relative">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <div className="w-20 h-20 bg-yellow-500/10 rounded-full border border-yellow-400/20 flex items-center justify-center shadow-[0_0_40px_rgba(234,179,8,0.15)]">
              <Ticket size={40} className="text-yellow-400" />
            </div>
          </motion.div>
          <h1 className="font-aztec-h1 text-4xl md:text-5xl text-white">
            Genesis <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">Golden Ticket</span>
          </h1>
          <p className="font-aztec-body text-white/50 text-lg max-w-xl mx-auto leading-relaxed">
            One ticket per wallet. Forever. When the Whale Network launches, only Genesis holders receive the exclusive golden badge.
          </p>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <div className="flex -space-x-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 border-2 border-[#0a0a0a] flex items-center justify-center text-[8px] font-black text-black">
                  {["W","H","A","L","E"][i]}
                </div>
              ))}
            </div>
            <span className="font-mono text-xs text-white/40">
              <span className="text-yellow-400 font-black">{totalClaimed.toLocaleString()}</span> genesis insiders
            </span>
          </div>
        </div>

        {/* ─── Feature chips ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: <Lock size={16} />, title: "One Per Wallet", desc: "Enforced on the blockchain and database. No duplicates possible." },
            { icon: <Sparkles size={16} />, title: "Golden Badge", desc: "Exclusive golden insignia displayed on your profile at network launch." },
            { icon: <Globe size={16} />, title: "Network Priority", desc: "Genesis holders get early access and priority features at launch." },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-5 bg-white/[0.02] border border-yellow-500/10 rounded-xl space-y-2"
            >
              <div className="text-yellow-400">{f.icon}</div>
              <div className="font-aztec-body text-white font-bold text-sm">{f.title}</div>
              <div className="font-aztec-body text-white/40 text-xs leading-relaxed">{f.desc}</div>
            </motion.div>
          ))}
        </div>

        {/* ─── State Machine ── */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8">
          <AnimatePresence mode="wait">
            {status === "loading" && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center py-12">
                <Loader2 size={32} className="text-yellow-400 animate-spin" />
              </motion.div>
            )}

            {status === "unclaimed" && !walletAddress && (
              <motion.div key="noWallet" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-12 space-y-4">
                <AlertCircle size={40} className="text-yellow-600/50 mx-auto" />
                <div className="font-aztec-h2 text-white text-xl">Connect Your Wallet</div>
                <p className="font-aztec-body text-white/40 text-sm max-w-sm mx-auto">
                  Connect or create a sovereign wallet to claim your Genesis Ticket.
                </p>
              </motion.div>
            )}

            {status === "unclaimed" && walletAddress && (
              <motion.div key="claimForm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                <div className="text-center space-y-2">
                  <div className="font-mono text-[10px] text-yellow-500/60 tracking-[0.4em] uppercase">Connected: {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}</div>
                  <h2 className="font-aztec-h1 text-2xl text-white">Your Ticket Is Waiting</h2>
                  <p className="font-aztec-body text-white/40 text-sm">
                    This wallet has not yet claimed a Genesis Ticket. Once claimed, it is permanently bound to this address.
                  </p>
                </div>
                <ClaimForm address={walletAddress} onClaimed={handleClaimed} />
              </motion.div>
            )}

            {status === "claimed" && ticket && (
              <motion.div key="claimed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-green-400 mb-4">
                    <CheckCircle2 size={20} />
                    <span className="font-mono text-sm tracking-widest uppercase">Genesis Ticket Active</span>
                  </div>
                  <p className="font-aztec-body text-white/40 text-sm max-w-sm mx-auto">
                    Your golden badge is reserved for the Whale Network launch. This ticket is permanent and non-transferable.
                  </p>
                </div>
                <GoldenBadge ticket={ticket} animateIn={animateIn} />
                
                {/* Share on Twitter */}
                <div className="flex justify-center">
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`🎟️ I just claimed my Genesis Ticket for @whalecosystem network launch!\n\nSerial: ${ticket.serialCode}\n\nOnly Genesis insiders will earn the 🥇 golden badge. Don't miss it: https://humanidfi.com/ticket`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-black border border-white/10 rounded-xl font-mono text-[11px] text-white/70 hover:text-white hover:border-white/20 transition-all uppercase tracking-widest"
                  >
                    <Twitter size={14} className="text-[#1DA1F2]" />
                    Share on X / Twitter
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
