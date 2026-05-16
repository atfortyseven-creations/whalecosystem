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

export function ImmersiveManifestoLanding({ 
  onOpenScanner, 
  hideMap 
}: { 
  onOpenScanner?: () => void; 
  hideMap?: boolean;
} = {}) {
  return (
    <div className="relative min-h-screen text-black font-sans antialiased overflow-x-hidden w-full flex flex-col selection:bg-black/10" style={{width:'100%',maxWidth:'100%'}}>

      {/* ══════════════════════════════════════════════════════════════════════
          0. GLOBAL VIDEO BACKGROUND
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="fixed inset-0 z-0 bg-[#FAFAF8]" />

      <div className="relative z-10 w-full flex flex-col items-center" style={{width:'100%',maxWidth:'100vw'}}>
        
        {/* ══════════════════════════════════════════════════════════════════════
            1. HERO: FULLY CENTERED AND EXTENDED
        ══════════════════════════════════════════════════════════════════════ */}
        <section className="w-full min-h-screen md:min-h-[calc(100vh-64px)] flex flex-col items-center justify-center text-center relative overflow-hidden" style={{paddingLeft:'clamp(1.5rem,5vw,10rem)',paddingRight:'clamp(1.5rem,5vw,10rem)'}}>
          {/* Desktop Video Background */}
          <div className="hidden md:block absolute inset-0 z-0">
            <video 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src="/Coltea-video-2025-v2.mp4" type="video/mp4" />
            </video>
          </div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={STAGGER}
            className="flex flex-col items-center justify-center gap-10 w-full max-w-[1600px] mx-auto relative z-10 py-32"
          >
            {/* Introduction to the System */}
            <motion.div variants={FADE_UP} className="flex flex-col items-center gap-4">
               <h1 className="text-[48px] sm:text-[72px] lg:text-[100px] font-black tracking-tighter uppercase leading-[0.85] text-black md:text-white">
                 The Whale Alert<br />
                 <span className="text-black/20 md:text-white/60">System Registry.</span>
               </h1>
            </motion.div>

            {/* Explanation of the Hospital */}
            <motion.div variants={FADE_UP} className="bg-black md:bg-white/10 md:backdrop-blur-md px-12 py-4 rounded-full mt-4 border border-transparent md:border-white/20">
               <h2 className="text-[14px] sm:text-[18px] font-black uppercase tracking-[0.25em] text-white">
                 The First Hospital In History To Secure Records On-Chain
               </h2>
            </motion.div>

            {/* Subtitle / Extended Text */}
            <motion.p variants={FADE_UP} className="font-serif text-[18px] md:text-[24px] text-black/60 md:text-white/80 leading-relaxed max-w-[900px] mt-6">
              The Whale Alert Network provides the definitive infrastructure for the high-integrity management of institutional documentation. Our protocol ensures that sensitive records remain immutable and verifiable without compromising confidentiality.
              <br /><br />
              At the heart of our implementation lies the Spitalul Clinic Colțea, Romania's premier medical institution. By integrating centuries of medical excellence with advanced cryptographic verifications, we have established a new standard for record preservation. Every discharge summary is now secured on-chain, providing mathematical certainty and absolute data integrity for the digital age.
            </motion.p>
            
            <motion.div variants={FADE_UP} className="mt-10">
              <Link href="/connect" className="inline-flex items-center justify-center px-12 py-5 bg-black md:bg-white hover:bg-black/80 md:hover:bg-white/90 text-white md:text-black rounded-2xl font-mono text-[12px] font-black uppercase tracking-[0.2em] transition-all shadow-xl">
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
            
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={STAGGER} className="flex flex-col items-center text-center mb-20 bg-white border border-black/5 p-10 rounded-[32px] shadow-sm">
              <h2 className="text-[40px] sm:text-[72px] font-black tracking-tighter uppercase leading-[0.95] text-black mb-8">
                Data Integrity <br/>
                <span className="text-black/20">Architecture.</span>
              </h2>
              <p className="font-serif text-[18px] md:text-[22px] text-black/60 leading-relaxed max-w-[900px]">
                Our infrastructure establishes a permanent mathematical seal. By securing institutional records natively on the blockchain, we ensure that clinical data remains impervious to alteration or destruction.
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
                <motion.div key={i} variants={FADE_UP} className="p-10 md:p-14 rounded-[40px] bg-white border border-black/5 hover:bg-[#FAFAF8] transition-colors shadow-sm flex flex-col justify-center text-center">
                  <h3 className="text-[20px] md:text-[24px] font-black uppercase tracking-tight text-black mb-6">{item.title}</h3>
                  <p className="text-[16px] md:text-[18px] text-black/60 leading-relaxed font-serif max-w-[600px] mx-auto">{item.desc}</p>
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
              <div className="w-full xl:w-5/12 flex flex-col items-center xl:items-start bg-white p-10 rounded-[40px] border border-black/5 shadow-sm">
                <h2 className="text-[52px] sm:text-[72px] font-black tracking-tighter uppercase leading-[0.92] text-black mb-8 text-center xl:text-left">
                  Whale Chat.<br />
                  <span className="text-black/20">Encryption.</span>
                </h2>
                <p className="font-serif text-[18px] md:text-[22px] text-black/60 leading-relaxed mb-10 max-w-[800px] text-center xl:text-left">
                  Centralized messaging platforms represent unacceptable vulnerabilities for medical confidentiality. Our internal communication network is built upon advanced decentralized messaging protocols, where all critical clinical data is encrypted end-to-end.
                </p>
                
                <ul className="space-y-8 mb-12 max-w-[800px]">
                  {[
                    { title: 'Decentralized Network Architecture', desc: 'All medical communications route seamlessly through a robust decentralized peer-to-peer network, eliminating central points of failure.' },
                    { title: 'Identity-Native Cryptographic Keys', desc: 'Encryption and decryption keys are inextricably tied strictly to the verified on-chain identities of authorized hospital personnel.' },
                    { title: 'Zero Metadata Leakage Assurance', desc: 'The protocol is designed to meticulously protect patient identity even from the routing network infrastructure itself, ensuring total opacity to external observers.' },
                  ].map((item, i) => (
                    <li key={i} className="flex flex-col items-center xl:items-start p-4 bg-[#FAFAF8] rounded-2xl border border-black/5">
                      <span className="font-mono text-[11px] font-black uppercase tracking-widest text-black/40 mb-2">{item.title}</span>
                      <span className="text-[15px] md:text-[17px] text-black/70 leading-relaxed font-serif text-center xl:text-left">{item.desc}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/chat" className="inline-flex items-center justify-center px-12 py-5 bg-black text-white hover:bg-black/80 rounded-2xl font-mono text-[12px] font-black uppercase tracking-[0.2em] transition-all shadow-xl w-full xl:w-auto">
                  Initialize Secure Chat
                </Link>
              </div>

              <div className="w-full xl:w-7/12 space-y-6 flex flex-col items-center">
                <p className="font-mono text-[13px] font-black uppercase tracking-[0.3em] text-black/40 mb-2 text-center bg-white px-6 py-2 rounded-full border border-black/5 shadow-sm">Institutional Day-to-Day Utility</p>
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
                  <div key={i} className="w-full p-10 md:p-12 rounded-[32px] bg-white border border-black/5 hover:bg-[#FAFAF8] transition-all shadow-sm text-center xl:text-left flex-1 flex flex-col justify-center">
                    <div className="flex flex-col xl:flex-row items-center xl:items-start justify-between gap-4 mb-6">
                      <span className="font-mono text-[14px] font-black uppercase tracking-widest text-black">{item.scenario}</span>
                      <span className="font-mono text-[10px] text-black/20 hidden xl:block bg-black/5 px-3 py-1 rounded-full">Use Case 0{i+1}</span>
                    </div>
                    <p className="text-[16px] md:text-[18px] text-black/60 leading-relaxed font-serif">{item.narrative}</p>
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
          <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 xl:px-20 bg-white p-12 md:p-20 rounded-[40px] border border-black/5 shadow-sm">
            <h2 className="text-[48px] md:text-[80px] font-black tracking-tighter uppercase leading-[0.95] text-black mb-10">
              Powered by <br/><span className="text-black/20">Aztec Network.</span>
            </h2>
            <p className="font-serif text-[20px] md:text-[24px] text-black/60 leading-relaxed max-w-[900px] mx-auto mb-20">
              The immutable foundation of this security architecture is built upon the Aztec Network. Utilizing advanced zero-knowledge rollups, Aztec enables us to separate mathematical proof of clinical integrity from the exposure of raw clinical data.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-[1000px] mx-auto">
              {[
                { label: 'Network Infrastructure', value: 'L2 zk-Rollup' },
                { label: 'Cryptographic Protocol', value: 'PLONK / Noir' },
                { label: 'State Management', value: 'Encrypted UTXO' }
              ].map((stat, i) => (
                <div key={i} className="p-8 md:p-12 bg-[#FAFAF8] border border-black/5 rounded-[32px] flex flex-col items-center justify-center text-center shadow-sm hover:bg-black/5 transition-colors">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-black/40 mb-4">{stat.label}</span>
                  <span className="font-mono text-[16px] md:text-[20px] font-black text-black tracking-wider">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            5. INSTITUTIONAL VISION (PHOTOS) - MOVED TO BOTTOM
        ══════════════════════════════════════════════════════════════════════ */}
        <section className="w-full py-32 flex flex-col items-center bg-white border-t border-black/5 pb-16">
          <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 xl:px-20">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={STAGGER} className="flex flex-col items-center text-center mb-16">
              <h2 className="text-[40px] md:text-[64px] font-black tracking-tighter uppercase leading-[0.95] text-black mb-6">
                Centuries of Heritage.<br />
                <span className="text-black/20">Modern Infrastructure.</span>
              </h2>
              <p className="font-serif text-[18px] md:text-[22px] text-black/60 leading-relaxed max-w-[900px]">
                A visual testament to the Spitalul Clinic Colțea center. Blending historical architectural grandeur with cutting-edge technological frameworks.
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
                <motion.div key={idx} variants={FADE_UP} className="w-full aspect-[16/9] md:aspect-auto md:h-[450px] relative rounded-3xl overflow-hidden border border-black/5 shadow-xl group">
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-700 z-10" />
                  <img src={src} alt="Coltea Hospital Vision" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out" />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
        {/* ══════════════════════════════════════════════════════════════════════
            6. DOCUMENTATION & SYSTEM ACCESS
        ══════════════════════════════════════════════════════════════════════ */}
        <section className="w-full py-32 flex flex-col items-center bg-black text-white pb-20 overflow-visible">
          <div className="w-full max-w-[1200px] mx-auto px-6 text-center">
            <motion.div
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true }} 
              variants={FADE_UP}
              className="flex flex-col items-center gap-12"
            >
              <div className="w-20 h-[1px] bg-white/20" />
              <h2 className="text-[32px] md:text-[48px] font-black tracking-tighter uppercase text-white leading-tight">
                System Documentation & <br/>
                <span className="text-white/40">Technical Reference.</span>
              </h2>
              <p className="font-serif text-[18px] md:text-[22px] text-white/60 leading-relaxed max-w-[800px]">
                Access the complete technical specifications and integration protocols for the Whale Alert Network. Our documentation provides a comprehensive guide for medical administrators and technical personnel.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl">
                <Link href="/docs" className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white hover:text-black transition-all group flex flex-col items-center gap-4">
                  <span className="font-mono text-[10px] uppercase tracking-widest opacity-40 group-hover:opacity-100">Technical Specs</span>
                  <span className="text-xl font-black uppercase">Read Overview</span>
                </Link>
                <Link href="/docs/developer/rest/overview" className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white hover:text-black transition-all group flex flex-col items-center gap-4">
                  <span className="font-mono text-[10px] uppercase tracking-widest opacity-40 group-hover:opacity-100">Integration</span>
                  <span className="text-xl font-black uppercase">API Reference</span>
                </Link>
              </div>

              <div className="w-20 h-[1px] bg-white/20 mt-10" />
            </motion.div>
          </div>
        </section>
        
      </div>
    </div>
  );
}
