"use client";

import React from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

// ─── Constants ──────────────────────────────────────────────────────────────

const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
};

const STAGGER: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

// ─── Component ──────────────────────────────────────────────────────────────

export function ImmersiveManifestoLanding() {
  return (
    <div className="relative bg-[#F9F8F6] text-[#0A0A0A] font-sans antialiased overflow-x-hidden selection:bg-black/10 flex-1 flex flex-col">

      {/* ══════════════════════════════════════════════════════════════════════
          1. HERO: THE FIRST HOSPITAL TO SECURE RECORDS ON-CHAIN
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="w-full min-h-[90vh] flex flex-col justify-center py-24 relative overflow-hidden">
        {/* Subtle background grain */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none noise-bg mix-blend-multiply" />
        
        <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 xl:px-20 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={STAGGER}
            className="flex flex-col gap-8 max-w-5xl"
          >
            {/* Identity Badge */}
            <motion.div variants={FADE_UP} className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 rounded-full border border-black/10 bg-white shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="font-mono text-[9px] font-black uppercase tracking-[0.3em] text-[#0A0A0A]/60">
                  Partnership Active
                </span>
              </div>
              <div className="h-px w-12 bg-black/10" />
              <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#0A0A0A]/40">
                Spitalul Clinic Colțea
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1 variants={FADE_UP} className="text-[52px] sm:text-[72px] lg:text-[96px] font-black tracking-tighter uppercase leading-[0.90] text-[#0A0A0A]">
              The First Hospital<br />
              <span className="text-black/20">in History</span><br />
              to Secure Records<br />
              <span className="text-emerald-600">On-Chain.</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p variants={FADE_UP} className="font-serif text-[20px] md:text-[26px] text-[#555] leading-relaxed max-w-3xl mt-4">
              Spitalul Clinic Colțea, the most trusted hospital in Bucharest (founded in 1704), has partnered with Whale Alert Network. We are the first platform in the world to successfully hash medical discharge records on the blockchain. Your medical history is completely protected, verifiable, and belongs entirely to you.
            </motion.p>
            
            <motion.div variants={FADE_UP} className="flex items-center gap-6 mt-8">
              <Link href="/connect" className="inline-flex items-center justify-center px-10 py-5 bg-[#0A0A0A] text-white rounded-2xl font-mono text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[#222] transition-colors shadow-xl">
                Partner With Us
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          2. ARCHITECTURE & SYSTEM VISION
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="w-full py-24 md:py-40 bg-white border-t border-black/5">
        <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 xl:px-20">
          
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={STAGGER} className="flex flex-col md:flex-row gap-16 md:gap-24 mb-24">
            <motion.div variants={FADE_UP} className="w-full md:w-5/12">
              <h2 className="text-[40px] sm:text-[56px] font-black tracking-tighter uppercase leading-[0.95] text-[#0A0A0A] mb-8">
                Absolute <br/><span className="text-black/20">Trust.</span>
              </h2>
              <p className="font-serif text-[18px] text-[#666] leading-relaxed">
                By securing digital records on the blockchain, you create an unbreakable mathematical lock. Even if internal systems are compromised, your secured data cannot be altered, forged, or destroyed.
              </p>
            </motion.div>
            
            <div className="w-full md:w-7/12 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { title: 'Digital Fingerprint', desc: 'Medical discharge summaries are converted into unique mathematical codes (hashes). Personal details remain securely at the hospital, while the hash guarantees document integrity.' },
                { title: 'Global Ledger', desc: 'The fingerprint is locked into the Ethereum blockchain. It is analyzed against billions of security parameters, creating a permanent, globally verifiable record.' },
                { title: 'Zero-Knowledge', desc: 'Complete privacy. The on-chain hash serves as an attestation instrument. It contains zero patient data and cannot be reverse-engineered.' },
                { title: 'Patient Sovereignty', desc: 'Patients receive a secure verification code. Doctors globally can scan it to instantly verify the authenticity of the medical history with 100% certainty.' },
              ].map((item, i) => (
                <motion.div key={i} variants={FADE_UP} className="p-8 rounded-3xl bg-[#F9F8F6] border border-[#EBEBEB]">
                  <span className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-[#0A0A0A]/40 block mb-4">Pillar 0{i + 1}</span>
                  <h3 className="text-[16px] font-black uppercase tracking-tight text-[#0A0A0A] mb-3">{item.title}</h3>
                  <p className="text-[14px] text-[#666] leading-relaxed font-serif">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          3. WHALE CHAT: DAY-TO-DAY USE
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="w-full py-24 md:py-40 bg-[#0A0A0A] text-white">
        <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 xl:px-20">
          
          <div className="flex items-center gap-4 mb-20">
            <div className="flex-1 h-px bg-white/10" />
            <span className="font-mono text-[9px] font-black uppercase tracking-[0.4em] text-white/40">Communication Sovereignty</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
            <div className="w-full lg:w-5/12">
              <h2 className="text-[52px] sm:text-[72px] font-black tracking-tighter uppercase leading-[0.92] text-white mb-8">
                Whale Chat.<br />
                <span className="text-emerald-500">Absolute Secrecy.</span>
              </h2>
              <p className="font-serif text-[18px] text-white/60 leading-relaxed mb-10">
                Centralized messaging platforms are liabilities for medical confidentiality. Whale Chat is built on XMTP — a decentralized messaging protocol where communications are encrypted end-to-end. No telecom provider, server, or unauthorized staff can intercept the data.
              </p>
              
              <ul className="space-y-6 mb-12">
                {[
                  { title: 'No Central Server', desc: 'Medical communications route through a decentralized P2P network.' },
                  { title: 'Identity-Native Keys', desc: 'Encryption keys are tied strictly to authorized hospital personnel.' },
                  { title: 'Zero Metadata Leakage', desc: 'Protects patient identity even from the network infrastructure itself.' },
                ].map((item, i) => (
                  <li key={i} className="flex flex-col">
                    <span className="font-mono text-[10px] font-black uppercase tracking-widest text-white mb-1">{item.title}</span>
                    <span className="text-[14px] text-white/50 leading-relaxed font-serif">{item.desc}</span>
                  </li>
                ))}
              </ul>

              <Link href="/chat" className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-2xl font-mono text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[#EBEBEB] transition-colors">
                Initialize Secure Chat
              </Link>
            </div>

            <div className="w-full lg:w-7/12 space-y-4">
              <p className="font-mono text-[9px] font-black uppercase tracking-[0.3em] text-white/30 mb-6">Day-to-Day Utility</p>
              {[
                {
                  scenario: 'Inter-Departmental Transfers',
                  narrative: 'A chief surgeon coordinates with the ICU regarding a high-profile patient. All communication is cryptographically sealed, leaving zero metadata for external interception.',
                },
                {
                  scenario: 'Secure Diagnostics Sync',
                  narrative: 'A remote specialist discusses sensitive MRI results with the Colțea administration. No telecom provider or ISP can access the exchange, ensuring GDPR compliance.',
                },
                {
                  scenario: 'Legal & Compliance',
                  narrative: 'Hospital administrators document private patient consent and procedural compliance. Unlike centralized platforms, Whale Chat makes the communication mathematically inaccessible to third parties.',
                },
              ].map((item, i) => (
                <div key={i} className="p-8 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.05] transition-all">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <span className="font-mono text-[10px] font-black uppercase tracking-widest text-emerald-400">{item.scenario}</span>
                    <span className="font-mono text-[8px] text-white/20">Use Case 0{i+1}</span>
                  </div>
                  <p className="text-[14px] text-white/50 leading-relaxed font-serif">{item.narrative}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          4. AZTEC NETWORK INTEGRATION
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="w-full py-24 md:py-40 bg-[#F9F8F6] border-t border-black/5 flex flex-col items-center text-center">
        <div className="w-full max-w-[1000px] mx-auto px-6">
          <span className="inline-block font-mono text-[10px] font-black uppercase tracking-[0.3em] text-[#0A0A0A]/40 mb-8 px-4 py-2 border border-black/10 rounded-full">
            Infrastructure Partner
          </span>
          <h2 className="text-[40px] md:text-[64px] font-black tracking-tighter uppercase leading-[0.95] text-[#0A0A0A] mb-8">
            Powered by <br/><span className="text-black/30">Aztec Network.</span>
          </h2>
          <p className="font-serif text-[18px] md:text-[24px] text-[#666] leading-relaxed max-w-3xl mx-auto mb-16">
            The foundation of this absolute transparency and security is built upon the Aztec Network. Utilizing advanced zero-knowledge rollups, Aztec enables us to separate the act of proving integrity from the act of revealing data. It is the definitive infrastructure for institutional sovereignty.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            {[
              { label: 'Network', value: 'L2 zk-Rollup' },
              { label: 'Cryptography', value: 'PLONK / Noir' },
              { label: 'State', value: 'Encrypted UTXO' }
            ].map((stat, i) => (
              <div key={i} className="p-6 bg-white border border-[#EBEBEB] rounded-2xl flex flex-col items-center justify-center text-center">
                <span className="font-mono text-[9px] uppercase tracking-widest text-[#0A0A0A]/40 mb-2">{stat.label}</span>
                <span className="font-mono text-[14px] font-black text-[#0A0A0A] tracking-wider">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      
    </div>
  );
}
