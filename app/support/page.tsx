"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Smartphone, Twitter, Globe, ChevronDown, Mail, MessageSquare, Zap, Shield, Clock, CheckCircle, Users } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { InstitutionalShell } from '@/components/shared/InstitutionalShell';
import "@/app/dashboard/dashboard.css";

const FAQ_ITEMS = [
  { q: "How do I connect my wallet?", a: "Click 'Connect Wallet' in the top right. We support MetaMask, WalletConnect, and Coinbase Wallet. No email or password required — pure sovereignty from block zero." },
  { q: "Is my data private?", a: "Yes. All operations use Zero-Knowledge Proofs. We cannot see your identity, balance, or strategy. Your data is stored locally via the Sovereign Vault." },
  { q: "How do whale alerts work?", a: "Our Whale Worker indexer monitors blockchain transactions 24/7 and surfaces significant capital movements above configurable thresholds in real time." },
  { q: "What chains do you support?", a: "Ethereum, Arbitrum, Base, Solana, BNB Chain, and Optimism. More chains added continuously as the intelligence grid expands." },
  { q: "How do I access the VIP terminal?", a: "Connect your wallet and navigate to Whale VIP. Some features require you to hold the requisite node token balance for sovereign access." },
  { q: "How do I claim the Whale Gold Ticket?", a: "Navigate to the Ticket page, connect your wallet, then draw a full circle with your cursor on the verification zone. The system performs biometric-grade human verification before writing your claim to the genesis ledger." },
];

const STATS = [
  { label: "Avg Response", value: "< 2h", icon: Clock },
  { label: "Uptime", value: "99.97%", icon: Shield },
  { label: "Issues Resolved", value: "12,450", icon: CheckCircle },
  { label: "Support Agents", value: "24 / 7", icon: Users },
];

const CHANNELS = [
  { icon: Smartphone, label: "Mobile Direct", desc: "Optimized for any device with zero-latency forensic intelligence on the go. Full DApp access from a single tap.", link: null },
  { icon: Globe, label: "Web Terminal", desc: "Full desktop power: dark pool routing, L1/L2 callstack analysis, and institutional intelligence overlay on demand.", link: null },
  { icon: Twitter, label: "@whalecosystem", link: "https://x.com/whalecosystem?s=20", desc: "Real-time intelligence pulses and latency-critical network status updates broadcast on X." },
];

import { CorporateWhaleLogo } from '@/components/bsv/CorporateWhaleLogo';

// ─── WHALE HERO ───
function WhaleSupportHero() {
  return (
    <div className="relative flex flex-col items-center justify-center pt-14 pb-10 px-6 text-center overflow-hidden">
      {/* Subtle grid backdrop */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg,#000 0,#000 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,#000 0,#000 1px,transparent 1px,transparent 40px)' }} />

      {/* Corporate Whale Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className="relative mb-8"
      >
        <motion.div
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-32 h-32 flex items-center justify-center"
        >
          {/* Glow ring */}
          <motion.div
            animate={{ scale: [1, 1.08, 1], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full bg-yellow-500/20 blur-3xl z-0"
          />
          <CorporateWhaleLogo className="w-full h-full relative z-10" />
        </motion.div>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="font-aztec-h1 text-5xl md:text-6xl lg:text-7xl text-black tracking-tighter leading-none mb-4 mt-3">
          Whale Alert <span className="text-black/50">Support</span>
        </h1>
        <p className="font-sans text-base text-black/50 max-w-lg mx-auto leading-relaxed">
          Elite-grade assistance for every node in the network. We operate 24/7 to ensure your sovereign session runs flawlessly.
        </p>
      </motion.div>
    </div>
  );
}

export default function SupportPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [isSending, setIsSending] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success('Transmission Successful', { description: 'Intelligence core has received your dispatch.' });
        setForm({ name: '', email: '', message: '' });
      } else {
        toast.error('Transmission Failed', { description: 'Network handshake unsuccessful.' });
      }
    } catch {
      toast.error('Handshake Timeout');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <InstitutionalShell title="Whale Support" badge="SUPPORT" badgeVariant="emerald">
      <div className="selection:bg-black/5">
        {/* Hero */}
        <WhaleSupportHero />

        {/* Divider */}
        <div className="w-full h-px bg-black/[0.06]" />

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="grid grid-cols-2 md:grid-cols-4 border-b border-black/[0.06]"
      >
        {STATS.map((stat, i) => (
          <div
            key={i}
            className={`flex flex-col items-center justify-center gap-2 py-8 px-4 ${i < 3 ? 'border-r border-black/[0.06]' : ''} hover:bg-black/[0.015] transition-colors`}
          >
            <stat.icon size={14} className="text-black/30" />
            <div className="font-aztec-h1 text-3xl font-bold text-black tracking-tighter tabular-nums">{stat.value}</div>
            <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-black/40 font-bold">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-14 space-y-14">

        {/* Contact + FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="grid lg:grid-cols-2 gap-8"
        >
          {/* Contact Form */}
          <div className="border border-black/[0.07] rounded-3xl overflow-hidden shadow-sm">
            <div className="flex items-center gap-2.5 px-6 py-4 border-b border-black/[0.06] bg-black/[0.015]">
              <Mail size={11} className="text-black/40" />
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-black/50 font-bold">Secure Dispatch Channel</span>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {[
                { id: "name", label: "FULL NAME", type: "text", value: form.name, placeholder: "Enter identifier" },
                { id: "email", label: "EMAIL ADDRESS", type: "email", value: form.email, placeholder: "sovereign@network.io" },
              ].map(f => (
                <div key={f.id} className="space-y-1.5">
                  <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-black/40 font-bold block">{f.label}</label>
                  <input
                    type={f.type}
                    required
                    value={f.value}
                    onChange={e => setForm(p => ({ ...p, [f.id]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full px-4 py-3 text-sm font-sans bg-black/[0.02] border border-black/[0.08] rounded-xl text-black placeholder:text-black/25 focus:outline-none focus:border-black/25 transition-colors"
                  />
                </div>
              ))}
              <div className="space-y-1.5">
                <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-black/40 font-bold block">MESSAGE</label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  placeholder="Describe your situation clearly..."
                  className="w-full px-4 py-3 text-sm font-sans bg-black/[0.02] border border-black/[0.08] rounded-xl text-black placeholder:text-black/25 focus:outline-none focus:border-black/25 transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={isSending}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-black text-white rounded-xl font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-black/80 disabled:opacity-50 transition-all shadow-sm hover:shadow-md"
              >
                <Send size={11} />
                {isSending ? 'TRANSMITTING...' : 'INITIATE SECURE DISPATCH'}
              </button>
            </form>
          </div>

          {/* FAQ */}
          <div className="border border-black/[0.07] rounded-3xl overflow-hidden shadow-sm">
            <div className="flex items-center gap-2.5 px-6 py-4 border-b border-black/[0.06] bg-black/[0.015]">
              <MessageSquare size={11} className="text-black/40" />
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-black/50 font-bold">Frequently Asked — Sovereign Protocol</span>
            </div>
            <div className="divide-y divide-black/[0.06]">
              {FAQ_ITEMS.map((item, i) => (
                <div key={i}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-black/[0.02] transition-colors"
                  >
                    <span className="font-sans text-sm font-semibold text-black/80 leading-snug">{item.q}</span>
                    <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0">
                      <ChevronDown size={14} className="text-black/30" />
                    </motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden"
                      >
                        <p className="px-6 pb-5 font-sans text-sm text-black/50 leading-relaxed">{item.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Channels */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="border border-black/[0.07] rounded-3xl overflow-hidden shadow-sm"
        >
          <div className="flex items-center gap-2.5 px-6 py-4 border-b border-black/[0.06] bg-black/[0.015]">
            <Globe size={11} className="text-black/40" />
            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-black/50 font-bold">Contact Channels</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-black/[0.06]">
            {CHANNELS.map((ch, i) => (
              <div key={i} className="p-8 flex flex-col gap-4 hover:bg-black/[0.02] transition-colors">
                <div className="w-10 h-10 border border-black/[0.08] rounded-2xl flex items-center justify-center bg-black/[0.02]">
                  <ch.icon size={17} className="text-black/50" />
                </div>
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-black/50 font-bold mb-2">{ch.label}</div>
                  <p className="font-sans text-sm text-black/50 leading-relaxed">{ch.desc}</p>
                </div>
                {ch.link && (
                  <a
                    href={ch.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="self-start flex items-center gap-2 mt-2 px-5 py-2 border border-black/10 rounded-full font-mono text-[9px] font-bold uppercase tracking-widest text-black/60 hover:bg-black hover:text-white hover:border-black transition-all"
                  >
                    <Zap size={10} /> Follow Now
                  </a>
                )}
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  </InstitutionalShell>
  );
}
