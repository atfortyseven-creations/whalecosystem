"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Smartphone, Twitter, Headphones, ChevronRight, Mail, MessageSquare, Zap, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { InstitutionalShell } from '@/components/shared/InstitutionalShell';
import { CSSiPhoneFrame, CSSMacbookFrame } from '@/components/support/DeviceFrames';
import "@/app/dashboard/dashboard.css";

const FAQ_ITEMS = [
  { q: "How do I connect my wallet?", a: "Click 'Connect Wallet' in the top right. We support MetaMask, WalletConnect, and Coinbase Wallet. No email or password required." },
  { q: "Is my data private?", a: "Yes. All operations use Zero-Knowledge Proofs. We cannot see your identity, balance, or strategy. Your data is stored locally via the Sovereign Vault." },
  { q: "How do whale alerts work?", a: "Our Whale Worker indexer monitors blockchain transactions 24/7 and surfaces significant capital movements above configurable thresholds." },
  { q: "What chains do you support?", a: "Ethereum, Arbitrum, Base, Solana, BNB Chain, and Optimism. More chains added continuously." },
  { q: "How do I access the VIP terminal?", a: "Connect your wallet and navigate to Whale VIP. Some features require you to hold the requisite token balance." },
];

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
    <InstitutionalShell title="Whale Support" subtitle="Sovereign Assistance Protocol" badge="LIVE SUPPORT" badgeVariant="emerald">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">

        {/* ─── Stats row ─── */}
        <div className="border" style={{ borderColor: "rgba(26,20,0,0.08)", background: "white" }}>
          <div className="grid grid-cols-2 md:grid-cols-4">
            {[
              { label: "Avg Response", value: "< 2h", color: "var(--az-emerald)" },
              { label: "Uptime", value: "99.97%", color: "var(--az-lime)"},
              { label: "Issues Resolved", value: "12,450", color: "var(--az-ink)"},
              { label: "Support Agents", value: "24 / 7", color: "var(--az-orchid)"},
            ].map((stat, i) => (
              <div key={i} className="az-stat-card" style={{ borderRight: i < 3 ? "1px solid rgba(26,20,0,0.06)" : "none" }}>
                <span className="az-label">{stat.label}</span>
                <span className="az-value-xl" style={{ color: stat.color }}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Contact + FAQ Grid ─── */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Contact Form */}
          <div className="border" style={{ borderColor: "rgba(26,20,0,0.08)", background: "white" }}>
            <div className="az-col-header flex items-center gap-2" style={{ background: "rgba(26,20,0,0.03)", color: "rgba(26,20,0,0.5)" }}>
              <Mail size={10} />
              SECURE DISPATCH CHANNEL
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {[
                { id: "name", label: "FULL NAME", type: "text", value: form.name, placeholder: "Enter identifier" },
                { id: "email", label: "EMAIL ADDRESS", type: "email", value: form.email, placeholder: "sovereign@network.io" },
              ].map(f => (
                <div key={f.id} className="space-y-1">
                  <label className="az-label" style={{ borderLeft: "2px solid var(--az-lime)", paddingLeft: 8, display: "block" }}>{f.label}</label>
                  <input
                    type={f.type}
                    required
                    value={f.value}
                    onChange={e => setForm(p => ({ ...p, [f.id]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="az-input"
                    style={{ background: "rgba(26,20,0,0.03)", color: "var(--az-ink)", border: "1px solid rgba(26,20,0,0.10)" }}
                  />
                </div>
              ))}
              <div className="space-y-1">
                <label className="az-label" style={{ borderLeft: "2px solid rgba(26,20,0,0.15)", paddingLeft: 8, display: "block" }}>MESSAGE</label>
                <textarea
                  required rows={5} value={form.message}
                  onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  placeholder="Describe your situation..."
                  className="az-input resize-none"
                  style={{ background: "rgba(26,20,0,0.03)", color: "var(--az-ink)", border: "1px solid rgba(26,20,0,0.10)" }}
                />
              </div>
              <button type="submit" disabled={isSending} className="az-btn-primary w-full justify-center">
                <Send size={12} />
                {isSending ? 'TRANSMITTING...' : 'INITIATE SECURE DISPATCH'}
              </button>
            </form>
          </div>

          {/* FAQ */}
          <div className="border" style={{ borderColor: "rgba(26,20,0,0.08)", background: "white" }}>
            <div className="az-col-header flex items-center gap-2" style={{ background: "rgba(26,20,0,0.03)", color: "rgba(26,20,0,0.5)" }}>
              <MessageSquare size={10} />
              FREQUENTLY ASKED — SOVEREIGN PROTOCOL
            </div>
            <div>
              {FAQ_ITEMS.map((item, i) => (
                <div key={i} className="az-data-row border-b" style={{ borderColor: "rgba(26,20,0,0.05)", flexDirection: "column", alignItems: "flex-start", padding: 0 }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{ width: "100%", textAlign: "left", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", cursor: "pointer" }}
                  >
                    <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, fontWeight: 600, color: "var(--az-ink)" }}>{item.q}</span>
                    <motion.span animate={{ rotate: openFaq === i ? 90 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronRight size={14} style={{ color: "rgba(26,20,0,0.30)" }} />
                    </motion.span>
                  </button>
                  <motion.div
                    initial={false}
                    animate={{ height: openFaq === i ? "auto" : 0, opacity: openFaq === i ? 1 : 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ overflow: "hidden", width: "100%" }}
                  >
                    <p className="az-explainer-body" style={{ padding: "4px 16px 16px 16px" }}>{item.a}</p>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Channels ─── */}
        <div className="border" style={{ borderColor: "rgba(26,20,0,0.08)", background: "white" }}>
          <div className="az-col-header" style={{ background: "rgba(26,20,0,0.03)", color: "rgba(26,20,0,0.5)" }}>CONTACT CHANNELS</div>
          <div className="grid grid-cols-1 md:grid-cols-3">
            {[
              { icon: Smartphone, label: "Mobile Direct", desc: "Optimized for iPhone 16 Pro Max with zero-latency forensic intelligence on the go.", color: "var(--az-emerald)" },
              { icon: Globe, label: "Web Terminal", desc: "Full desktop power on MacBook Pro: dark pool routing, L1/L2 callstack analysis.", color: "var(--az-lime)" },
              { icon: Twitter, label: "@whalecosystem", link: "https://x.com/whalecosystem?s=20", desc: "Real-time intelligence pulses and latency-critical updates on Twitter/X.", color: "var(--az-orchid)" },
            ].map((ch, i) => (
              <div key={i} className="p-6" style={{ borderRight: i < 2 ? "1px solid rgba(26,20,0,0.06)" : "none" }}>
                <div style={{ width: 36, height: 36, background: "rgba(26,20,0,0.04)", border: "1px solid rgba(26,20,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                  <ch.icon size={18} style={{ color: ch.color }} />
                </div>
                <div className="az-header-sm" style={{ marginBottom: 4 }}>{ch.label}</div>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 12, color: "rgba(26,20,0,0.50)", lineHeight: 1.6 }}>{ch.desc}</div>
                {ch.link && (
                  <a href={ch.link} target="_blank" rel="noopener noreferrer" className="az-btn-lime-outline" style={{ marginTop: 12 }}>
                    <Zap size={10} /> Follow Now
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </InstitutionalShell>
  );
}
