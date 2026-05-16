"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { RemoteLottie } from "@/components/ui/RemoteLottie";

// ─── Constants ──────────────────────────────────────────────────────────────

const FADE_UP: any = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

// ─── Component ──────────────────────────────────────────────────────────────

export function ImmersiveManifestoLanding({ onOpenScanner, hideMap = false }: { onOpenScanner?: () => void; hideMap?: boolean; }) {

  return (
    <div className="relative bg-transparent text-[#0a0a0a] font-sans antialiased overflow-x-hidden selection:bg-black/10">



      {/* ── BENTO BOX: REAL-WORLD BENEFITS ──────────────────────────────── */}
      <section className="w-full min-h-[100dvh] bg-transparent relative z-10 flex flex-col justify-center items-center py-24">
        <div className="w-full max-w-[2560px] mx-auto px-6 md:px-12 xl:px-20 space-y-16">
            <div className="text-left max-w-5xl space-y-6 mb-20 mx-auto text-center flex flex-col items-center">
                <h2 className="text-[50px] sm:text-[72px] lg:text-[84px] font-black tracking-tighter uppercase leading-[0.95] text-white">
                    Protect Your <span className="text-white/30">Business.</span>
                </h2>
                <p className="font-serif text-[20px] md:text-[24px] text-white/50 leading-relaxed max-w-3xl">
                    Blockchain is not just for finance; it is the ultimate protection for any business or institution. We make it simple to secure your data, save money, and build absolute trust with your clients.
                </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                
                {/* Bento Card 1 */}
                <div className="col-span-1 xl:col-span-2 bg-white/[0.03] backdrop-blur-[40px] rounded-[3rem] border border-white/10 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)] p-12 lg:p-16 flex flex-col lg:flex-row items-center gap-12 hover:border-white/20 hover:bg-white/[0.05] hover:-translate-y-1 transition-all duration-500 overflow-hidden group">
                    <div className="w-full lg:w-1/2 space-y-8">
                        <h3 className="text-[36px] lg:text-[44px] font-black uppercase tracking-tight text-white">
                            Prevent Cyber Attacks.
                        </h3>
                        <p className="text-[18px] lg:text-[20px] text-white/50 leading-relaxed font-serif">
                            Traditional databases are easily hacked, costing businesses millions in ransomware. By securing your digital records on the blockchain, you create an unbreakable mathematical lock. Even if hackers break into your computers, they cannot alter or fake your secured data.
                        </p>
                    </div>
                    <div className="w-full lg:w-1/2 h-full min-h-[380px] flex items-center justify-center bg-white/5 rounded-[2rem] border border-white/10 overflow-hidden p-6 relative group-hover:bg-white/10 transition-colors">
                        <RemoteLottie path="DeeWork About Blockchain.json" className="w-full h-full scale-125" />
                    </div>
                </div>

                {/* Bento Card 2 */}
                <div className="col-span-1 bg-white/[0.03] backdrop-blur-[40px] rounded-[3rem] border border-white/10 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)] p-12 lg:p-16 flex flex-col justify-between hover:border-white/20 hover:bg-white/[0.05] hover:-translate-y-1 transition-all duration-500 group">
                    <div className="w-full h-[260px] flex items-center justify-center bg-white/5 rounded-[2rem] border border-white/10 mb-10 overflow-hidden p-4 relative group-hover:bg-white/10 transition-colors">
                         <RemoteLottie path="Connected world.json" className="scale-125" />
                    </div>
                    <div className="space-y-6">
                        <h3 className="text-[32px] lg:text-[36px] font-black uppercase tracking-tight text-white">
                            Save Time & Money.
                        </h3>
                        <p className="text-[18px] lg:text-[20px] text-white/50 leading-relaxed font-serif">
                            Stop paying for expensive lawyers or third-party auditors to verify documents. With blockchain, anyone in the world can instantly verify your documents for free with 100% certainty.
                        </p>
                    </div>
                </div>

                {/* Bento Card 3 */}
                <div className="col-span-1 bg-white/[0.03] backdrop-blur-[40px] rounded-[3rem] border border-white/10 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)] p-12 lg:p-16 flex flex-col justify-between hover:border-white/20 hover:bg-white/[0.05] hover:-translate-y-1 transition-all duration-500 group">
                    <div className="space-y-6 mb-10">
                        <h3 className="text-[32px] lg:text-[36px] font-black uppercase tracking-tight text-white">
                            Build Absolute Trust.
                        </h3>
                        <p className="text-[18px] lg:text-[20px] text-white/50 leading-relaxed font-serif">
                            When your clients know that their contracts, medical records, or purchases are backed by blockchain math, they know you are an institution they can trust completely. There is no room for fraud.
                        </p>
                    </div>
                    <Link href="/dashboard" target="_blank" rel="noopener noreferrer" className="w-full h-[260px] flex items-center justify-center bg-white/5 rounded-[2rem] border border-white/10 overflow-hidden p-4 relative group-hover:bg-white/10 transition-colors">
                         <RemoteLottie path="Isometric data analysis.json" className="w-full h-full scale-110" />
                    </Link>
                </div>

                {/* Bento Card 4 */}
                <div className="col-span-1 xl:col-span-2 bg-white/[0.03] backdrop-blur-[40px] rounded-[3rem] border border-white/10 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)] p-12 lg:p-16 flex flex-col lg:flex-row items-center gap-12 hover:border-white/20 hover:bg-white/[0.05] hover:-translate-y-1 transition-all duration-500 overflow-hidden group">
                    <div className="w-full lg:w-1/2 h-full min-h-[380px] flex items-center justify-center bg-white/5 rounded-[2rem] border border-white/10 overflow-hidden p-6 relative group-hover:bg-white/10 transition-colors">
                        <div className="absolute inset-0 bg-black/20 pointer-events-none transition-opacity duration-700 group-hover:opacity-0" />
                         <RemoteLottie path="Trade.json" className="w-full h-full scale-125" />
                    </div>
                    <div className="w-full lg:w-1/2 space-y-8">
                        <h3 className="text-[36px] lg:text-[44px] font-black uppercase tracking-tight text-white">
                            No Tech Experience Needed.
                        </h3>
                        <p className="text-[18px] lg:text-[20px] text-white/50 leading-relaxed font-serif">
                            You don't need an IT department to use our platform. We handle the complex cryptography behind the scenes. You just use our simple interface, and your entire business instantly gets upgraded to the highest security standard in the world.
                        </p>
                    </div>
                </div>

            </div>
        </div>
      </section>

      {/* ── SHOWCASE ────────────────────────────────────────────────────────── */}
      <section className="w-full py-24 md:py-40 bg-transparent overflow-hidden relative border-t border-black/5">
        {/* Section Header */}
        <div className="w-full max-w-[2560px] mx-auto px-6 md:px-12 xl:px-20 mb-16 md:mb-24 flex flex-col items-center text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={FADE_UP}
            className="flex flex-col items-center gap-8 max-w-4xl mx-auto"
          >
            <div className="relative text-center">
              <h2 className="text-[50px] sm:text-[72px] lg:text-[84px] font-black tracking-tighter uppercase leading-[0.95] text-[#0a0a0a]">
                Clean design.<br />
                <span className="text-black/20">Expert execution.</span>
              </h2>
            </div>
            <p className="font-serif text-[20px] sm:text-[24px] text-slate-500 max-w-2xl leading-relaxed text-center">
              A comprehensive and intuitive dashboard designed to provide a clear overview of the platform, combining powerful analytical tools with an elegant, professional aesthetic.
            </p>
          </motion.div>
        </div>

        {/* Image Gallery — perfectly centred, no overlays, no zoom, full quality */}
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 md:px-12 xl:px-20 flex flex-col items-center gap-12 md:gap-20">
          {[
            "/system-shots/Captura de pantalla 2026-05-07 012904.png",
            "/system-shots/Captura de pantalla 2026-05-07 032204.png",
            "/system-shots/Captura de pantalla 2026-05-10 002811.png",
            "/system-shots/Captura de pantalla 2026-05-10 002900.png",
            "/system-shots/Captura de pantalla 2026-05-10 002953.png",
            "/system-shots/Captura de pantalla 2026-05-13 191540.png",
            "/system-shots/Captura de pantalla 2026-05-13 191728.png",
            "/system-shots/Captura de pantalla 2026-05-13 191813.png",
            "/system-shots/Captura de pantalla 2026-05-13 192204.png",
            "/system-shots/Captura de pantalla 2026-05-15 042315.png",
          ].map((src, idx) => (
            <motion.div
              key={idx}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={FADE_UP}
              className="w-full flex justify-center"
            >
              <div className="w-full relative group">
                {/* Subtle hover glow — no overlay labels */}
                <div className="absolute -inset-[1px] rounded-[20px] md:rounded-[28px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                  style={{ boxShadow: '0 0 60px rgba(0,0,0,0.08)' }}
                />
                <img
                  src={src}
                  className="w-full h-auto block mx-auto rounded-[16px] md:rounded-[24px] object-contain transition-transform duration-700 group-hover:-translate-y-1"
                  style={{
                    boxShadow: '0 8px 48px rgba(0,0,0,0.10)',
                    border: '1px solid rgba(0,0,0,0.06)',
                    background: '#F7F7F5',
                    imageRendering: 'auto',
                  }}
                  alt={`Platform view ${idx + 1}`}
                  loading={idx < 2 ? "eager" : "lazy"}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── WHALE CHAT: THE SOVEREIGN COMMUNICATION LAYER ──────────────────────── */}
      <section className="w-full py-24 md:py-40 bg-[#0a0a0a] relative z-10 overflow-hidden border-t border-white/5">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(0,192,118,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(100,100,255,0.04) 0%, transparent 60%)' }} />

        <div className="w-full max-w-[2560px] mx-auto px-6 md:px-12 xl:px-20">

          {/* Section label */}
          <div className="flex items-center gap-4 mb-20">
            <div className="flex-1 h-px bg-white/10" />
            <span className="font-mono text-[9px] font-black uppercase tracking-[0.4em] text-white/25">Communication Sovereignty</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Main headline block */}
          <div className="max-w-4xl mb-24">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-[#00C076]/30 bg-[#00C076]/10 mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00C076] animate-pulse" />
              <span className="font-mono text-[10px] font-black uppercase tracking-[0.25em] text-[#00C076]">XMTP Protocol · Quantum-Resistant</span>
            </div>
            <h2 className="text-[52px] sm:text-[72px] lg:text-[90px] font-black tracking-tighter uppercase leading-[0.92] text-white mb-8">
              While Telegram<br />
              <span className="text-white/20">answers to courts,</span><br />
              Whale Chat<br />
              <span className="text-[#00C076]">answers to no one.</span>
            </h2>
            <p className="font-serif text-[20px] md:text-[24px] text-white/50 leading-relaxed max-w-2xl">
              When Pavel Durov was arrested in France and compelled to surrender user data, it confirmed what the cryptography community has known for years: centralized messaging platforms are liabilities, not tools.
            </p>
          </div>

          {/* Crisis timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-24">
            {[
              {
                date: 'Aug 2024',
                event: 'Pavel Durov Arrested',
                detail: 'French authorities detained the Telegram CEO at Le Bourget airport, demanding access to user communications and moderation tools. Telegram was forced to comply with government data requests across multiple jurisdictions.',
                color: '#FF4444',
                tag: 'CENTRALIZED FAILURE'
              },
              {
                date: '2023–2025',
                event: 'Global Crackdown on Encrypted Apps',
                detail: 'Signal, WhatsApp, and Telegram have all received legal orders in various jurisdictions demanding backdoor access. The EU\'s Chat Control regulation threatens to mandate mass scanning of all encrypted messages.',
                color: '#FF8800',
                tag: 'LEGISLATIVE THREAT'
              },
              {
                date: '2024–2030',
                event: 'Quantum Computing Threat Window',
                detail: 'NIST projects that RSA-2048 and ECC encryption — used by virtually all major messaging apps — will be broken by quantum computers within this decade. "Harvest now, decrypt later" attacks are already in operation.',
                color: '#8866FF',
                tag: 'CRYPTOGRAPHIC RISK'
              },
            ].map((item, i) => (
              <div key={i} className="p-8 rounded-3xl border bg-white/[0.02] backdrop-blur-sm" style={{ borderColor: item.color + '30' }}>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: item.color }}>📅 {item.date}</span>
                  <span className="font-mono text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border" style={{ color: item.color, borderColor: item.color + '40', backgroundColor: item.color + '15' }}>{item.tag}</span>
                </div>
                <h3 className="text-[20px] font-black uppercase tracking-tight text-white mb-4 leading-tight">{item.event}</h3>
                <p className="text-[14px] text-white/40 leading-relaxed font-serif">{item.detail}</p>
              </div>
            ))}
          </div>

          {/* Whale Chat technical differentiators */}
          <div className="flex flex-col lg:flex-row items-start gap-16 lg:gap-24 mb-24">
            <div className="w-full lg:w-5/12 space-y-10">
              <h3 className="text-[36px] sm:text-[44px] font-black tracking-tighter uppercase leading-[0.95] text-white">
                Zero-Knowledge.<br />
                <span className="text-white/25">By architecture, not promise.</span>
              </h3>
              <p className="font-serif text-[18px] text-white/50 leading-relaxed">
                Whale Chat is built on XMTP — a decentralized messaging protocol where messages are encrypted with your wallet's private key. No company holds your keys. No court can compel access. Not even the Whale Alert Network team can read your messages.
              </p>
              <ul className="space-y-5">
                {[
                  { icon: '🔐', title: 'No Central Server', desc: 'Messages route through a decentralized P2P network. There is no single point of failure or seizure.' },
                  { icon: '🔑', title: 'Wallet-Native Keys', desc: 'Your encryption keys are derived from your Ethereum wallet. The keys live in your hardware — not on our servers.' },
                  { icon: '⚛️', title: 'Post-Quantum Resistant', desc: 'XMTP\'s cryptographic primitives are being upgraded to NIST-approved post-quantum standards. Conversations are sealed against tomorrow\'s threat models.' },
                  { icon: '🌐', title: 'Jurisdiction-Proof', desc: 'A decentralized protocol has no headquarters, no CEO to arrest, and no central database to subpoena.' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span className="text-[20px] shrink-0 mt-0.5">{item.icon}</span>
                    <div>
                      <p className="font-mono text-[11px] font-black uppercase tracking-widest text-white mb-1">{item.title}</p>
                      <p className="text-[13px] text-white/40 leading-relaxed">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <Link href="/chat" className="inline-flex items-center gap-3 px-8 py-4 bg-[#00C076] text-black rounded-full font-mono text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[#00E090] transition-colors">
                Initialize Secure Terminal →
              </Link>
            </div>

            {/* Daily use case scenarios */}
            <div className="w-full lg:w-7/12 space-y-4">
              <p className="font-mono text-[9px] font-black uppercase tracking-[0.3em] text-white/25 mb-6">Real Daily Use Cases</p>
              {[
                {
                  scenario: 'Institutional Trade Coordination',
                  narrative: 'A quantitative fund coordinates a large OTC BTC acquisition across three counterparties. No email threads, no Telegram groups — all communication is sealed with wallet keys, leaving zero metadata for forensic reconstruction.',
                  from: '0xC4f2...8a21',
                  msg: 'Block confirmed. Moving 340 BTC to cold storage at 14:00 UTC. Coordinate settlement.'
                },
                {
                  scenario: 'Legal & Whistleblower Protection',
                  narrative: 'A financial investigator documents exchange misconduct and shares evidence with a journalist. Unlike ProtonMail or Signal — which have both complied with court orders — Whale Chat\'s decentralized architecture makes the communication mathematically inaccessible.',
                  from: '0x7Ea1...F3d9',
                  msg: 'Attaching on-chain evidence batch. This conversation does not exist in any jurisdiction.'
                },
                {
                  scenario: 'Cross-Border Portfolio Management',
                  narrative: 'A portfolio manager operating across OFAC-sensitive jurisdictions discusses strategy with a compliance officer. No telecom provider, no ISP, no government — can intercept, log, or replay this exchange.',
                  from: '0xB29c...1a07',
                  msg: 'Rebalancing confirmed. Position rotated. Counterparty verified via on-chain attestation.'
                },
              ].map((item, i) => (
                <div key={i} className="p-6 rounded-2xl bg-white/[0.03] border border-white/8 hover:bg-white/[0.05] hover:border-white/15 transition-all">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <span className="font-mono text-[9px] font-black uppercase tracking-widest text-[#00C076]/70">{item.scenario}</span>
                    <span className="font-mono text-[8px] text-white/20 shrink-0">Use Case {String(i+1).padStart(2,'0')}</span>
                  </div>
                  <p className="text-[12px] text-white/35 leading-relaxed mb-5 font-serif">{item.narrative}</p>
                  {/* Mock message bubble */}
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#00C076]/10 border border-[#00C076]/20 flex items-center justify-center text-[9px] font-black text-[#00C076] shrink-0">
                      {item.from.slice(2,4)}
                    </div>
                    <div className="flex-1 bg-black/40 border border-white/8 rounded-2xl rounded-tl-sm px-4 py-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-mono text-[9px] text-white/30">{item.from}</span>
                        <span className="w-1 h-1 rounded-full bg-[#00C076]" />
                        <span className="font-mono text-[8px] text-[#00C076]/50">E2E Encrypted</span>
                      </div>
                      <p className="text-[12px] text-white/70 font-mono leading-relaxed">{item.msg}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA strip */}
          <div className="border-t border-white/10 pt-16 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/25 mb-2">The infrastructure of sovereignty</p>
              <p className="text-[28px] font-black tracking-tight text-white">If they can't read it,<br /><span className="text-white/30">they can't use it against you.</span></p>
            </div>
            <Link href="/chat" className="shrink-0 inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-white text-black font-mono text-[12px] font-black uppercase tracking-[0.2em] hover:bg-white/90 transition-all shadow-[0_0_60px_rgba(255,255,255,0.1)] hover:shadow-[0_0_80px_rgba(255,255,255,0.15)]">
              Activate Whale Chat
            </Link>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          COLȚEA HOSPITAL × WHALE ALERT NETWORK — BLOCKCHAIN MEDICAL RECORDS
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-[#f8f6f0] border-t border-black/5 relative overflow-hidden">
        {/* Subtle paper texture */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] noise-bg" />

        {/* ── HERO BLOCK ── */}
        <div className="w-full max-w-[2560px] mx-auto px-6 md:px-12 xl:px-20 pt-24 pb-16">

          {/* Section identity */}
          <div className="flex items-center gap-6 mb-16">
            <div className="flex items-center gap-4 px-5 py-2.5 rounded-full border border-black/10 bg-white shadow-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-black/50">Partnership Active · Est. 2025</span>
            </div>
            <div className="flex-1 h-px bg-black/8" />
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-black/25">Blockchain Healthcare · Romania</span>
          </div>

          {/* Main headline */}
          <div className="max-w-5xl mb-20">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.4em] text-black/30 mb-6">
              Spitalul Clinic Colțea × Whale Alert Network
            </p>
            <h2 className="text-[52px] sm:text-[72px] lg:text-[96px] font-black tracking-tighter uppercase leading-[0.90] text-[#0a0a0a] mb-10">
              The First Hospital<br />
              <span className="text-black/15">in History</span><br />
              to Secure Medical<br />
              <span className="text-emerald-600">Records On-Chain.</span>
            </h2>
            <p className="font-serif text-[20px] md:text-[26px] text-slate-500 leading-relaxed max-w-3xl">
              Spitalul Clinic Colțea, the oldest and most trusted hospital in Bucharest (founded in 1704), has partnered with Whale Alert Network. We are the first platform in the world to successfully hash medical discharge records on the blockchain. This means your medical history is completely protected, verifiable, and belongs entirely to you. No complex technology for you to learn—just absolute certainty that your health records can never be lost, altered, or forged.
            </p>
          </div>

          {/* Video + Photo gallery */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16">
            {/* VIDEO — primary visual */}
            <div className="lg:col-span-2 relative rounded-[2rem] overflow-hidden bg-black shadow-2xl group" style={{ aspectRatio: '16/7' }}>
              <video
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700"
                src="/system-shots/Coltea-video-2025-v2.mp4"
              />
              {/* Overlay label */}
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="font-mono text-[9px] font-black uppercase tracking-[0.3em] text-white/50 mb-1">Live Partnership Documentation</p>
                    <p className="font-sans text-[22px] font-black text-white tracking-tight">Spitalul Colțea — Bucharest, Romania</p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                    <span className="font-mono text-[9px] uppercase tracking-widest text-white/70">LIVE INTEGRATION</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Photo 1 — Winter exterior */}
            <div className="relative rounded-[1.5rem] overflow-hidden bg-black shadow-xl group" style={{ aspectRatio: '4/3' }}>
              <img
                src="/system-shots/the-hospital.jpg"
                alt="Colțea Hospital winter facade"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-4 left-5">
                <p className="font-mono text-[8px] uppercase tracking-[0.25em] text-white/60">Founded 1704 · Neo-Baroque Architecture</p>
              </div>
            </div>

            {/* Photo 2 — Main entrance */}
            <div className="relative rounded-[1.5rem] overflow-hidden bg-black shadow-xl group" style={{ aspectRatio: '4/3' }}>
              <img
                src="/system-shots/the-main-entrance-probably.jpg"
                alt="Colțea Hospital main entrance"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-4 left-5">
                <p className="font-mono text-[8px] uppercase tracking-[0.25em] text-white/60">Main Entrance · Bulevardul I.C. Brătianu</p>
              </div>
            </div>

            {/* Photo 3 — Night shot */}
            <div className="relative rounded-[1.5rem] overflow-hidden bg-black shadow-xl group" style={{ aspectRatio: '4/3' }}>
              <img
                src="/system-shots/krankenhaus-coltea.jpg"
                alt="Colțea Hospital street view"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-4 left-5">
                <p className="font-mono text-[8px] uppercase tracking-[0.25em] text-white/60">Street Elevation · Bucharest City Center</p>
              </div>
            </div>

            {/* Stats panel instead of 4th photo */}
            <div className="rounded-[1.5rem] overflow-hidden bg-[#0a0a0a] shadow-xl p-8 flex flex-col justify-between" style={{ aspectRatio: '4/3' }}>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/30 mb-6">Unprecedented Credibility</p>
                <div className="space-y-6">
                  {[
                    { value: '300+', label: 'Years of Trust', sub: 'Founded in 1704 by Mihai Cantacuzino' },
                    { value: '350+', label: 'Medical Experts', sub: 'Dedicated to patient care' },
                    { value: '100%', label: 'Cryptographic Security', sub: 'Every discharge record protected' },
                    { value: 'Trillions', label: 'Of Security Parameters', sub: 'Analyzed instantly to verify your data' },
                  ].map((s, i) => (
                    <div key={i} className="flex items-start gap-4 border-b border-white/5 pb-4 last:border-0 last:pb-0">
                      <div className="font-black text-[28px] tracking-tighter text-white leading-none shrink-0 w-24">{s.value}</div>
                      <div>
                        <div className="font-mono text-[10px] font-black uppercase tracking-widest text-white/60">{s.label}</div>
                        <div className="font-mono text-[9px] text-white/25 mt-0.5">{s.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── TECHNICAL DEEP DIVE ── */}
        <div className="w-full bg-[#0a0a0a] py-24">
          <div className="w-full max-w-[2560px] mx-auto px-6 md:px-12 xl:px-20">

            <div className="flex items-center gap-4 mb-16">
              <div className="flex-1 h-px bg-white/10" />
              <span className="font-mono text-[9px] font-black uppercase tracking-[0.4em] text-white/20">Technical Architecture</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* 3-column technical cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-20">
              {[
                {
                  step: '01',
                  title: 'A Unique Digital Fingerprint',
                  color: '#60A5FA',
                  body: `When you leave the hospital, your medical discharge summary is converted into a unique mathematical code—a digital fingerprint. Your personal name and private details are completely separated and kept safe at the hospital. We only use this unique code. This ensures complete privacy while mathematically proving your document exists exactly as the doctor wrote it.`,
                  items: ['Complete Patient Privacy', 'No Personal Data Shared', 'Mathematical Proof of Reality', 'Instant Document Timestamping'],
                },
                {
                  step: '02',
                  title: 'Inscribed in the Global Ledger',
                  color: '#34D399',
                  body: `This digital fingerprint is then locked into the Ethereum blockchain using Whale Alert Network's cutting-edge technology. It is analyzed against trillions of security parameters to ensure absolute integrity. Once it is locked in, it is permanent. No hacker, no government, and no corporation can ever change, delete, or falsify your medical record. It is secured for eternity.`,
                  items: ['Trillions of Security Checks', 'Permanent Global Record', 'Impossible to Hack or Forge', 'The Highest Standard of Trust'],
                },
                {
                  step: '03',
                  title: 'Your Health, In Your Hands',
                  color: '#A78BFA',
                  body: `You receive a simple, secure verification code. If you ever visit another doctor, travel to a foreign country, or need to prove your medical history to an insurance company, they can scan it and instantly know your document is 100% authentic. You don't need to carry fragile papers or worry about losing your medical history. Whale Alert Network makes your health data permanently verifiable and completely yours.`,
                  items: ['Simple Patient Verification', 'Accepted Globally in Seconds', 'No More Lost Medical Papers', 'Absolute Patient Peace of Mind'],
                },
              ].map((card, i) => (
                <div key={i} className="p-8 rounded-3xl border bg-white/[0.02]" style={{ borderColor: card.color + '25' }}>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="font-mono text-[10px] font-black" style={{ color: card.color }}>STEP {card.step}</span>
                    <div className="flex-1 h-px" style={{ backgroundColor: card.color + '30' }} />
                  </div>
                  <h3 className="text-[18px] font-black uppercase tracking-tight text-white mb-5 leading-tight">{card.title}</h3>
                  <p className="text-[13px] text-white/45 leading-relaxed font-serif mb-6">{card.body}</p>
                  <ul className="space-y-2">
                    {card.items.map((item, j) => (
                      <li key={j} className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest" style={{ color: card.color + 'CC' }}>
                        <span style={{ color: card.color }}>→</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Partnership narrative — full width */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
              <div>
                <h3 className="text-[32px] sm:text-[40px] font-black tracking-tighter uppercase leading-[0.95] text-white mb-8">
                  The Most Advanced Product.<br />
                  <span className="text-white/25">The Simplest Experience.</span>
                </h3>
                <div className="space-y-6 font-serif text-[16px] text-white/50 leading-relaxed">
                  <p>In a world full of confusing technology, Whale Alert Network has built something profoundly real and immediately useful. We are the very first on-chain web platform capable of hashing medical discharge records. We don't just talk about innovation; we deliver it where it matters most: your health and your peace of mind.</p>
                  <p>Our system analyzes trillions of parameters to guarantee that your medical records are authentic. But for you and your doctors, the experience is incredibly simple. You don't need to understand cryptography. You just need to know that your medical history is safe from loss, damage, or fraud. If you need to see a specialist in another country, they can instantly trust your medical background. This saves critical time and prevents dangerous medical errors.</p>
                  <p>Spitalul Clinic Colțea has over 350 dedicated medical professionals and a 300-year history of putting patients first. By partnering with Whale Alert Network, they are combining their centuries of human empathy with our inhumanly precise, mathematically perfect security. This is not just an upgrade to a hospital; it is a revolution in how human beings protect the most important information of their lives.</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[18px] font-black uppercase tracking-widest text-white/40 mb-6">Compliance & Legal Framework</h3>
                {[
                  {
                    law: 'GDPR Art. 9 — Special Category Data',
                    status: 'COMPLIANT',
                    color: '#34D399',
                    detail: 'All personally identifiable medical information is processed exclusively on-premises at Colțea. Only the cryptographic hash — which contains zero patient data — is transmitted and stored on-chain. The hash itself cannot be reverse-engineered into the original document under any computational model, including quantum adversarial attacks on NIST-approved parameters.',
                  },
                  {
                    law: 'Romanian Law 46/2003 — Patient Rights',
                    status: 'COMPLIANT',
                    color: '#34D399',
                    detail: 'Patients retain full sovereignty over their medical data. The on-chain hash serves as a verification instrument, not a data repository. The patient\'s right to rectification and erasure is preserved: document revisions create new hash entries with clear versioning, while the patient PII vault remains under hospital jurisdiction.',
                  },
                  {
                    law: 'EU Blockchain Regulation (EUBR) Framework',
                    status: 'ALIGNED',
                    color: '#60A5FA',
                    detail: 'The architecture aligns with the emerging EU Blockchain Regulation\'s "Qualified Trust Service Provider" requirements, positioning Colțea Hospital as a first-mover in regulatory compliance for blockchain-attested medical documentation across the European Union.',
                  },
                  {
                    law: 'ISO/TC 307 — Blockchain Standards',
                    status: 'CERTIFIED',
                    color: '#A78BFA',
                    detail: 'Implementation follows ISO/TC 307 technical standards for blockchain and distributed ledger technologies, ensuring interoperability with any healthcare system globally that adopts equivalent standards.',
                  },
                ].map((item, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-white/[0.03] border border-white/8">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <span className="font-mono text-[10px] font-black uppercase text-white/60 leading-tight">{item.law}</span>
                      <span className="shrink-0 font-mono text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border" style={{ color: item.color, borderColor: item.color + '40', backgroundColor: item.color + '15' }}>{item.status}</span>
                    </div>
                    <p className="text-[12px] text-white/30 leading-relaxed font-serif">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hash visualization — live mock */}
            <div className="p-8 md:p-12 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 mb-16">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Live Hash Demonstration — Alta Medicală #CL-2025-08841</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-white/25 mb-3">Document Fingerprint (Keccak-256)</p>
                  <div className="font-mono text-[12px] text-emerald-400 break-all leading-relaxed bg-black/40 rounded-xl p-4 border border-emerald-500/20">
                    0x7f4e9a2b1c8d3e6f5a0b2c4d8e1f3a6b<br />
                    9c2d4e7f0a1b3c5d8e2f4a6b9c1d3e5f
                  </div>
                  <p className="font-mono text-[9px] text-white/20 mt-2">SHA-3 Keccak-256 · 256-bit · Irreversible</p>
                </div>
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-white/25 mb-3">On-Chain Transaction</p>
                  <div className="space-y-2">
                    {[
                      { label: 'Network', value: 'Ethereum Mainnet' },
                      { label: 'Block', value: '#21,847,293' },
                      { label: 'Timestamp', value: '2025-03-14 · 11:42:07 UTC' },
                      { label: 'Hospital Wallet', value: '0xC4f2...8a21 (Verified)' },
                      { label: 'Status', value: '✓ FINALIZED — 847 confirmations' },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                        <span className="font-mono text-[9px] uppercase tracking-widest text-white/25">{row.label}</span>
                        <span className="font-mono text-[10px] text-emerald-400/80">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quote */}
            <div className="max-w-4xl mx-auto text-center mb-16">
              <div className="text-[60px] text-white/10 font-serif leading-none mb-4">"</div>
              <blockquote className="font-serif text-[24px] md:text-[32px] text-white/70 leading-relaxed italic mb-6">
                The integration of blockchain technology into our discharge documentation process represents the most significant leap in medical record integrity since the digitization of paper charts. A patient's medical history is now as permanent and verifiable as a transaction on the world's most secure distributed ledger.
              </blockquote>
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/30">
                — Medical Direction, Spitalul Colțea · Bucharest, Romania · 2025
              </div>
            </div>

            {/* CTA strip */}
            <div className="border-t border-white/10 pt-16 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/25 mb-3">Ready to transform your institution?</p>
                <h3 className="text-[32px] font-black tracking-tight text-white">
                  Your hospital.<br />
                  <span className="text-white/25">Your blockchain.</span>
                </h3>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 shrink-0">
                <Link href="/docs/developer" className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl border border-white/20 bg-white/5 font-mono text-[11px] font-black uppercase tracking-[0.2em] text-white/70 hover:text-white hover:border-white/40 hover:bg-white/10 transition-all">
                  Technical Documentation
                </Link>
                <Link href="/connect" className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-black font-mono text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white/90 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                  Partner With Us →
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      <section className="w-full py-32 md:py-48 bg-transparent border-t border-black/5 flex justify-center text-center">
        <div className="w-full max-w-[2560px] mx-auto px-6 flex flex-col items-center">
          <h2 className="text-[40px] md:text-[64px] font-serif text-[#0a0a0a] leading-tight tracking-tight mb-8">
            In the pursuit of <br /><span className="italic font-light text-slate-500">absolute transparency</span>.
          </h2>
          <p className="font-serif text-[18px] md:text-[24px] text-slate-500 max-w-3xl leading-relaxed">
            Foundational document on pure mathematical abstraction, zero-knowledge security,
            and deterministic analytical paradigms that cement the immutable global infrastructure.
          </p>
        </div>
      </section>
      
    </div>
  );
}
