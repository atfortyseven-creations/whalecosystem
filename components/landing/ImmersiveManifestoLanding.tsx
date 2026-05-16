"use client";

import React from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

// ─── Constants ──────────────────────────────────────────────────────────────

const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const STAGGER: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

// ─── Component ──────────────────────────────────────────────────────────────

export function ImmersiveManifestoLanding() {
  return (
    <div className="relative min-h-screen text-white font-sans antialiased overflow-x-hidden w-full flex flex-col selection:bg-white/20">

      {/* ══════════════════════════════════════════════════════════════════════
          0. GLOBAL VIDEO BACKGROUND
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/system-shots/Coltea-video-2025-v2.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay with blur to ensure perfect readability */}
        <div className="absolute inset-0 bg-black/75 backdrop-blur-[8px]" />
        {/* Subtle radial gradient for focus */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/60" />
      </div>

      <div className="relative z-10 w-full flex flex-col items-center">
        
        {/* ══════════════════════════════════════════════════════════════════════
            1. HERO: FULLY CENTERED AND EXTENDED
        ══════════════════════════════════════════════════════════════════════ */}
        <section className="w-full min-h-screen flex flex-col items-center justify-center text-center px-6 md:px-12 xl:px-20 py-32 relative">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={STAGGER}
            className="flex flex-col items-center gap-10 w-full max-w-[1600px] mx-auto"
          >
            {/* Main Headline */}
            <motion.h1 variants={FADE_UP} className="text-[48px] sm:text-[72px] lg:text-[100px] xl:text-[120px] font-black tracking-tighter uppercase leading-[0.85] text-white drop-shadow-2xl">
              The First Hospital<br />
              <span className="text-white/40">In History To Secure</span><br />
              Records On-Chain.
            </motion.h1>

            {/* Subtitle / Extended Text */}
            <motion.p variants={FADE_UP} className="font-serif text-[18px] md:text-[24px] text-white/80 leading-relaxed max-w-[1000px] mt-6 drop-shadow-lg">
              Spitalul Clinic Colțea, established in 1704 as the premier medical institution in Bucharest, represents the synthesis of centuries of medical heritage and the apex of modern cryptographic infrastructure. We have pioneered a revolutionary paradigm: the first successful cryptographic hashing of medical discharge records on the Ethereum blockchain.
              <br /><br />
              Through the implementation of advanced zero-knowledge architectures, we ensure that every patient's medical history is transformed into an immutable, mathematically verifiable digital signature. This paradigm guarantees uncompromising privacy, complete patient autonomy, and the absolute eradication of unauthorized data access. It is not merely a technological upgrade; it is the fundamental re-engineering of medical confidentiality for the digital age.
            </motion.p>
            
            <motion.div variants={FADE_UP} className="mt-10">
              <Link href="/connect" className="inline-flex items-center justify-center px-12 py-5 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white rounded-2xl font-mono text-[12px] font-black uppercase tracking-[0.2em] transition-all shadow-2xl">
                Initialize Connection
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            2. CRYPTOGRAPHIC ARCHITECTURE
        ══════════════════════════════════════════════════════════════════════ */}
        <section className="w-full py-32 flex flex-col items-center">
          <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 xl:px-20">
            
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={STAGGER} className="flex flex-col items-center text-center mb-20 bg-black/40 backdrop-blur-xl p-10 rounded-[32px] border border-white/10 shadow-2xl">
              <h2 className="text-[40px] sm:text-[72px] font-black tracking-tighter uppercase leading-[0.95] text-white mb-8 drop-shadow-xl">
                Cryptographic Integrity <br/>
                <span className="text-white/30">Architecture.</span>
              </h2>
              <p className="font-serif text-[18px] md:text-[24px] text-white/90 leading-relaxed max-w-[1000px]">
                By securing digital records natively on the blockchain, we establish an unbreakable mathematical lock. Even in the theoretical event of internal systems compromise, the cryptographically secured clinical data remains entirely impervious to alteration, forgery, or destruction.
              </p>
            </motion.div>
            
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={STAGGER} className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
              {[
                { 
                  title: 'Mathematical Fingerprinting', 
                  desc: 'Medical discharge summaries are algorithmically converted into unique cryptographic hashes. All sensitive personal details remain securely isolated within the internal secure enclaves of the hospital, while the generated hash serves as an irrefutable proof of document integrity, completely immune to tampering or data degradation.' 
                },
                { 
                  title: 'Global Verifiable Ledger', 
                  desc: 'The cryptographic fingerprint is permanently embedded into the decentralized blockchain. This advanced mechanism leverages billions of independent security parameters, creating a permanent, globally verifiable record that cannot be compromised by any single point of failure or localized network breach.' 
                },
                { 
                  title: 'Zero-Knowledge Privacy', 
                  desc: 'Complete and absolute confidentiality is maintained through cutting-edge zero-knowledge proof protocols. The on-chain hash acts strictly as a public attestation instrument containing zero decipherable patient data, ensuring full and permanent compliance with the most stringent international medical privacy standards.' 
                },
                { 
                  title: 'Patient Autonomy', 
                  desc: 'Patients are granted exclusive, cryptographically secure access to their own verification codes. Authorized medical professionals globally can instantly scan these codes to verify the authenticity of the comprehensive medical history with absolute mathematical certainty, without ever exposing the underlying sensitive data to intermediaries.' 
                },
              ].map((item, i) => (
                <motion.div key={i} variants={FADE_UP} className="p-10 md:p-14 rounded-[40px] bg-black/60 backdrop-blur-2xl border border-white/10 hover:bg-black/80 transition-colors shadow-2xl flex flex-col justify-center text-center">
                  <h3 className="text-[20px] md:text-[24px] font-black uppercase tracking-tight text-white mb-6 drop-shadow-md">{item.title}</h3>
                  <p className="text-[16px] md:text-[18px] text-white/80 leading-relaxed font-serif max-w-[600px] mx-auto">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
            
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            3. ENCRYPTED COMMUNICATIONS (Replacing "Communication Sovereignty")
        ══════════════════════════════════════════════════════════════════════ */}
        <section className="w-full py-32 flex flex-col items-center">
          <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 xl:px-20">
            
            <div className="flex flex-col xl:flex-row gap-16 xl:gap-24 items-stretch justify-center">
              <div className="w-full xl:w-5/12 flex flex-col items-center xl:items-start bg-black/50 backdrop-blur-xl p-10 rounded-[40px] border border-white/10 shadow-2xl">
                <h2 className="text-[52px] sm:text-[72px] font-black tracking-tighter uppercase leading-[0.92] text-white mb-8 drop-shadow-xl text-center xl:text-left">
                  Whale Chat.<br />
                  <span className="text-white/30">End-to-End Encryption.</span>
                </h2>
                <p className="font-serif text-[18px] md:text-[22px] text-white/90 leading-relaxed mb-10 max-w-[800px] text-center xl:text-left">
                  Centralized messaging platforms represent unacceptable vulnerabilities for medical confidentiality. Our internal communication network is built upon advanced decentralized messaging protocols, where all critical clinical data is encrypted end-to-end. This robust architecture ensures that no telecommunication provider, centralized server, or unauthorized personnel can ever intercept, read, or decipher the communication streams.
                </p>
                
                <ul className="space-y-8 mb-12 max-w-[800px]">
                  {[
                    { title: 'Decentralized Network Architecture', desc: 'All medical communications route seamlessly through a robust decentralized peer-to-peer network, eliminating central points of failure.' },
                    { title: 'Identity-Native Cryptographic Keys', desc: 'Encryption and decryption keys are inextricably tied strictly to the verified on-chain identities of authorized hospital personnel.' },
                    { title: 'Zero Metadata Leakage Assurance', desc: 'The protocol is designed to meticulously protect patient identity even from the routing network infrastructure itself, ensuring total opacity to external observers.' },
                  ].map((item, i) => (
                    <li key={i} className="flex flex-col items-center xl:items-start p-4 bg-black/30 rounded-2xl border border-white/5">
                      <span className="font-mono text-[11px] font-black uppercase tracking-widest text-white mb-2">{item.title}</span>
                      <span className="text-[15px] md:text-[17px] text-white/70 leading-relaxed font-serif text-center xl:text-left">{item.desc}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/chat" className="inline-flex items-center justify-center px-12 py-5 bg-white text-black hover:bg-gray-200 rounded-2xl font-mono text-[12px] font-black uppercase tracking-[0.2em] transition-all shadow-2xl w-full xl:w-auto">
                  Initialize Secure Chat
                </Link>
              </div>

              <div className="w-full xl:w-7/12 space-y-6 flex flex-col items-center">
                <p className="font-mono text-[13px] font-black uppercase tracking-[0.3em] text-white/60 mb-2 text-center bg-black/40 px-6 py-2 rounded-full border border-white/10">Institutional Day-to-Day Utility</p>
                {[
                  {
                    scenario: 'Inter-Departmental Coordination',
                    narrative: 'A chief surgeon directly coordinates with the intensive care unit regarding a high-profile patient transfer. The entirety of the communication is cryptographically sealed, leaving absolutely zero metadata traces for external interception or analysis.',
                  },
                  {
                    scenario: 'Secure Diagnostics Synchronization',
                    narrative: 'A remote specialist discusses highly sensitive MRI results with the administration. No telecommunication provider or ISP infrastructure can access the exchange, ensuring rigorous, unassailable GDPR compliance globally.',
                  },
                  {
                    scenario: 'Regulatory Compliance & Documentation',
                    narrative: 'Hospital administrators meticulously document private patient consent and critical procedural compliance. Unlike legacy centralized platforms, Whale Chat renders the communication mathematically inaccessible to all unauthorized third parties.',
                  },
                ].map((item, i) => (
                  <div key={i} className="w-full p-10 md:p-12 rounded-[32px] bg-black/60 backdrop-blur-2xl border border-white/10 hover:bg-black/80 transition-all shadow-2xl text-center xl:text-left flex-1 flex flex-col justify-center">
                    <div className="flex flex-col xl:flex-row items-center xl:items-start justify-between gap-4 mb-6">
                      <span className="font-mono text-[14px] font-black uppercase tracking-widest text-white drop-shadow-md">{item.scenario}</span>
                      <span className="font-mono text-[10px] text-white/50 hidden xl:block bg-black/30 px-3 py-1 rounded-full">Use Case 0{i+1}</span>
                    </div>
                    <p className="text-[16px] md:text-[18px] text-white/80 leading-relaxed font-serif">{item.narrative}</p>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            4. AZTEC NETWORK INTEGRATION
        ══════════════════════════════════════════════════════════════════════ */}
        <section className="w-full py-32 flex flex-col items-center text-center">
          <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 xl:px-20 bg-black/40 backdrop-blur-2xl p-12 md:p-20 rounded-[40px] border border-white/10 shadow-2xl">
            <h2 className="text-[48px] md:text-[80px] font-black tracking-tighter uppercase leading-[0.95] text-white mb-10 drop-shadow-xl">
              Powered by <br/><span className="text-white/30">Aztec Network.</span>
            </h2>
            <p className="font-serif text-[20px] md:text-[26px] text-white/90 leading-relaxed max-w-[1000px] mx-auto mb-20 drop-shadow-lg">
              The immutable foundation of this transparent yet completely private security architecture is built upon the Aztec Network. Utilizing state-of-the-art zero-knowledge rollups, Aztec enables us to effectively and definitively separate the mathematical proof of clinical integrity from the exposure of raw clinical data. It represents the definitive technological infrastructure required to operate a fully modernized, unassailable institutional framework.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-[1000px] mx-auto">
              {[
                { label: 'Network Infrastructure', value: 'L2 zk-Rollup' },
                { label: 'Cryptographic Protocol', value: 'PLONK / Noir' },
                { label: 'State Management', value: 'Encrypted UTXO' }
              ].map((stat, i) => (
                <div key={i} className="p-8 md:p-12 bg-black/50 backdrop-blur-xl border border-white/10 rounded-[32px] flex flex-col items-center justify-center text-center shadow-2xl hover:bg-black/70 transition-colors">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-white/60 mb-4">{stat.label}</span>
                  <span className="font-mono text-[16px] md:text-[20px] font-black text-white tracking-wider">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            5. INSTITUTIONAL VISION (PHOTOS) - MOVED TO BOTTOM
        ══════════════════════════════════════════════════════════════════════ */}
        <section className="w-full py-32 flex flex-col items-center bg-black/80 backdrop-blur-md border-t border-white/5">
          <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 xl:px-20">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={STAGGER} className="flex flex-col items-center text-center mb-16">
              <h2 className="text-[40px] md:text-[64px] font-black tracking-tighter uppercase leading-[0.95] text-white mb-6 drop-shadow-xl">
                Centuries of Heritage.<br />
                <span className="text-white/30">Modern Infrastructure.</span>
              </h2>
              <p className="font-serif text-[18px] md:text-[22px] text-white/70 leading-relaxed max-w-[900px]">
                A visual testament to the Spitalul Clinic Colțea center. Blending historical architectural grandeur with cutting-edge technological frameworks. Every detail of the institution reflects our commitment to excellence, preservation, and uncompromising progress in the medical field.
              </p>
            </motion.div>

            <motion.div 
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true, margin: "-100px" }} 
              variants={STAGGER}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full"
            >
              {[
                "/system-shots/the-hospital.jpg",
                "/system-shots/the-main-entrance-probably.jpg",
                "/system-shots/krankenhaus-coltea.jpg",
                "/system-shots/crowning-glory.jpg"
              ].map((src, idx) => (
                <motion.div key={idx} variants={FADE_UP} className="w-full aspect-[16/9] md:aspect-auto md:h-[450px] relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl group">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700 z-10" />
                  <img src={src} alt="Coltea Hospital Vision" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out" />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
        
      </div>
    </div>
  );
}
