"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { AZTEC_ROADMAP, AztecRoadmapItem } from "@/lib/content/aztecRoadmapData";

// ─── Types ──────────────────────────────────────────────────────────────────────

type Phase = {
  id: number;
  label: string;
  count: number;
};

// ─── Data ───────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "Architecture", href: "/architecture" },
  { label: "Documentation", href: "/developers/api-docs" },
  { label: "Roadmap", href: "/roadmap" },
  { label: "Developer Hub", href: "/developer" },
  { label: "Security", href: "/security" },
];

const CORE_PILLARS = [
  {
    id: "01",
    label: "Private Execution",
    spec: "Aztec zkRollup",
    body:
      "All computation happens inside your device using a local proving environment. Your inputs, parameters, and outputs never leave your machine. The network verifies a proof without ever seeing the underlying data.",
  },
  {
    id: "02",
    label: "Post-Quantum Cryptography",
    spec: "NIST PQC Standards",
    body:
      "The system uses lattice-based signature schemes (CRYSTALS-Dilithium, Falcon) and hash-based fallbacks (SPHINCS+) to ensure that every transaction and identity commitment remains secure against advances in computing hardware.",
  },
  {
    id: "03",
    label: "Selective Disclosure",
    spec: "Verifiable Credentials",
    body:
      "Institutions can generate granular viewing keys and range proofs for regulatory review. Auditors receive mathematically-verifiable evidence of compliance — without access to the full transactional graph.",
  },
  {
    id: "04",
    label: "Threshold Multi-Signature",
    spec: "ZK Threshold Schemes",
    body:
      "M-of-N approval is proven inside a zero-knowledge circuit. The proof confirms validity without revealing the total number of signers or their identities — suitable for institutional treasury governance.",
  },
];

const INFRA_SPECS = [
  { key: "Layer", value: "Aztec L2 zkRollup" },
  { key: "State Model", value: "Encrypted UTXO (Private Notes)" },
  { key: "Proving System", value: "Barretenberg / UltraPlonk" },
  { key: "Circuit Language", value: "Noir" },
  { key: "Signature Scheme", value: "CRYSTALS-Dilithium + SPHINCS+" },
  { key: "Identity Layer", value: "ZK Biometric Liveness Proofs" },
  { key: "Cross-Layer", value: "L1–L2 Encrypted Message Bridge" },
  { key: "Compliance", value: "Verifiable Credentials (W3C VC)" },
];

const PHASES: Phase[] = [
  { id: 1, label: "Cryptographic Architecture", count: 10 },
  { id: 2, label: "Privacy & Identity", count: 10 },
  { id: 3, label: "Institutional Security", count: 10 },
  { id: 4, label: "Analytics & Tools", count: 10 },
  { id: 5, label: "Ecosystem & Adoption", count: 10 },
];

// ─── Sub-components ─────────────────────────────────────────────────────────────

function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-black/10 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <nav className="w-full max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">
        
        {/* Left Side: Logo & Links */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-6 h-6 relative shrink-0">
              <img
                src="/atom_3d_silver.jpg"
                alt="Humanity Ledger"
                className="w-full h-full object-contain mix-blend-multiply"
              />
            </div>
            <span className="font-serif text-[18px] font-black tracking-tight text-black">AZTEC</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/research" className="text-[14px] font-sans font-medium text-black/70 hover:text-black transition-colors">
              Research
            </Link>
            <Link href="/blog" className="text-[14px] font-sans font-medium text-black/70 hover:text-black transition-colors">
              Blog
            </Link>
            
            {/* Product Dropdown */}
            <div className="relative group cursor-pointer h-14 flex items-center">
              <div className="flex items-center gap-1 text-[14px] font-sans font-medium text-black/70 hover:text-black transition-colors">
                Product 
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
              <div className="absolute top-14 left-0 hidden group-hover:flex flex-col bg-[#e8ebeb] border border-black/10 shadow-xl w-[280px] z-50">
                 <Link href="/portfolio" className="flex flex-col px-5 py-4 hover:bg-black/5 border-b border-black/10 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[14px] font-sans font-medium text-black">Whale Network</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>
                    </div>
                    <span className="text-[11px] font-sans text-black/50">Run architecture locally inside your terminal</span>
                 </Link>
                 <Link href="/developers/api-docs" className="flex flex-col px-5 py-4 hover:bg-black/5 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[14px] font-sans font-medium text-black">Aztec API</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>
                    </div>
                    <span className="text-[11px] font-sans text-black/50">Build privacy into your apps with our API</span>
                 </Link>
              </div>
            </div>

            {/* Company Dropdown */}
            <div className="relative group cursor-pointer h-14 flex items-center">
              <div className="flex items-center gap-1 text-[14px] font-sans font-medium text-black/70 hover:text-black transition-colors">
                Company 
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
              <div className="absolute top-14 left-0 hidden group-hover:flex flex-col bg-[#e8ebeb] border border-black/10 shadow-xl w-[220px] z-50">
                 <Link href="/company" className="flex flex-col px-5 py-3 hover:bg-black/5 border-b border-black/10 transition-colors">
                    <span className="text-[14px] font-sans font-medium text-black">About Us</span>
                 </Link>
                 <Link href="/careers" className="flex flex-col px-5 py-3 hover:bg-black/5 transition-colors">
                    <span className="text-[14px] font-sans font-medium text-black">Careers</span>
                 </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: GitHub, Docs, Sign In */}
        <div className="hidden md:flex items-center gap-5">
          <a href="https://github.com/aztec" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[14px] font-sans font-medium text-black/80 hover:text-black transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
            22.9K
          </a>
          <Link href="/developers/api-docs" className="px-4 py-1.5 bg-[#e5e7eb] border border-black/10 text-[14px] font-sans font-medium text-black hover:bg-[#d1d5db] transition-colors">
            Docs
          </Link>
          <Link href="/portfolio" className="px-4 py-1.5 bg-[#151515] text-[14px] font-sans font-medium text-white hover:bg-black transition-colors">
            Sign In
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden w-8 h-8 flex flex-col items-center justify-center gap-[5px]"
          aria-label="Toggle navigation"
        >
          <span className={`w-5 h-[1.5px] bg-black transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-[6.5px]" : ""}`} />
          <span className={`w-5 h-[1.5px] bg-black transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
          <span className={`w-5 h-[1.5px] bg-black transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-[6.5px]" : ""}`} />
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-[#e8ebeb] border-t border-black/10 px-6 py-6 flex flex-col gap-4"
          >
            <Link href="/research" onClick={() => setMobileOpen(false)} className="text-[15px] font-sans font-medium text-black/70 hover:text-black">Research</Link>
            <Link href="/blog" onClick={() => setMobileOpen(false)} className="text-[15px] font-sans font-medium text-black/70 hover:text-black">Blog</Link>
            <Link href="/portfolio" onClick={() => setMobileOpen(false)} className="text-[15px] font-sans font-medium text-black/70 hover:text-black">Product</Link>
            <Link href="/company" onClick={() => setMobileOpen(false)} className="text-[15px] font-sans font-medium text-black/70 hover:text-black">Company</Link>
            <div className="flex gap-4 mt-4">
              <Link href="/developers/api-docs" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2 bg-white border border-black/10 text-[14px] font-sans font-medium text-black">Docs</Link>
              <Link href="/portfolio" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2 bg-[#151515] text-[14px] font-sans font-medium text-white">Sign In</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const opacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.65], [1, 0.96]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <section
      ref={ref}
      className="relative w-full min-h-screen flex flex-col items-center justify-center bg-white overflow-hidden pt-20"
    >
      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.035) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      {/* Fade to white at bottom */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-white to-transparent pointer-events-none z-10" />

      <motion.div
        style={{ opacity, scale }}
        className="relative z-20 flex flex-col items-center text-center px-6 w-full max-w-[920px] mx-auto"
      >
        {/* Overline */}
        {mounted && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8 inline-flex items-center gap-3 border border-black/10 rounded-full px-5 py-2 bg-white/80 backdrop-blur-sm"
          >
            <span className="font-mono text-[10px] font-black uppercase tracking-[0.25em] text-black/55">
              Aztec Network — Private State Infrastructure
            </span>
          </motion.div>
        )}

        {/* Atom */}
        {mounted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="relative w-[260px] h-[260px] sm:w-[360px] sm:h-[360px] lg:w-[460px] lg:h-[460px] mb-8 shrink-0"
          >
            <img
              src="/atom_3d_silver.jpg"
              alt="Humanity Ledger Protocol"
              className="w-full h-full object-contain mix-blend-multiply"
              draggable={false}
            />
          </motion.div>
        )}

        {/* Headline */}
        {mounted && (
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
            className="text-[40px] sm:text-[56px] lg:text-[76px] font-black tracking-tighter leading-[0.92] text-black mb-6 uppercase"
          >
            Institutional-Grade
            <br />
            <span className="text-black/25">Private Infrastructure.</span>
          </motion.h1>
        )}

        {/* Sub-headline */}
        {mounted && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.38 }}
            className="font-serif text-[17px] sm:text-[20px] text-black/50 leading-relaxed max-w-[580px] mb-12"
          >
            A zero-knowledge state network built natively on the Aztec Protocol. Every record, transaction, and identity commitment is cryptographically private by design.
          </motion.p>
        )}

        {/* CTAs */}
        {mounted && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full"
          >
            <Link
              href="/portfolio"
              className="w-full sm:w-auto px-8 py-4 bg-black text-white font-mono text-[11px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-black/85 transition-all duration-200 active:scale-95 shadow-lg"
            >
              Open Application
            </Link>
            <Link
              href="/developers/api-docs"
              className="w-full sm:w-auto px-8 py-4 bg-white border border-black/15 text-black font-mono text-[11px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-black/5 transition-all duration-200 active:scale-95"
            >
              Read Documentation
            </Link>
          </motion.div>
        )}
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-30 pointer-events-none"
      >
        <span className="font-mono text-[9px] uppercase tracking-widest text-black/30">Scroll</span>
        <div className="w-[1px] h-10 bg-gradient-to-b from-black/30 to-transparent" />
      </motion.div>
    </section>
  );
}

function InfraSpecsRow() {
  return (
    <section className="w-full bg-white border-t border-black/8 overflow-hidden">
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y divide-black/8 border-b border-black/8">
        {INFRA_SPECS.map((spec) => (
          <motion.div
            key={spec.key}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="px-6 py-5 flex flex-col gap-1"
          >
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-black/35 font-bold">
              {spec.key}
            </span>
            <span className="font-mono text-[12px] font-black text-black tracking-wide leading-snug">
              {spec.value}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function CorePillarsSection() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <section className="w-full bg-white py-28 md:py-40 border-t border-black/8">
      <div className="w-full max-w-[900px] mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-16">
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-black/30">
            Protocol Foundations
          </span>
          <h2 className="text-[36px] sm:text-[48px] font-black tracking-tighter uppercase leading-[0.95] text-black max-w-[520px]">
            Built on Four
            <br />Core Principles.
          </h2>
        </div>

        {/* Accordion Pillars */}
        <div className="flex flex-col divide-y divide-black/10 border-t border-b border-black/10">
          {CORE_PILLARS.map((pillar) => {
            const isOpen = expanded === pillar.id;
            return (
              <button
                key={pillar.id}
                onClick={() => setExpanded(isOpen ? null : pillar.id)}
                className="w-full text-left py-7 flex flex-col sm:flex-row sm:items-center gap-4 group"
              >
                <span className="font-mono text-[11px] font-black text-black/18 w-10 shrink-0">
                  {pillar.id}
                </span>
                <div className="flex-1 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[13px] font-black uppercase tracking-[0.12em] text-black group-hover:text-black/80 transition-colors">
                      {pillar.label}
                    </span>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="hidden sm:block font-mono text-[9px] uppercase tracking-widest text-black/35 border border-black/10 px-2.5 py-1">
                        {pillar.spec}
                      </span>
                      <span className="font-mono text-[14px] text-black/25 select-none w-4 text-center">
                        {isOpen ? "−" : "+"}
                      </span>
                    </div>
                  </div>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.p
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden font-serif text-[15px] text-black/55 leading-[1.8] pr-8"
                      >
                        {pillar.body}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function AztecVisionSection() {
  const [activePhase, setActivePhase] = useState<number>(1);

  const filtered = useMemo(
    () => AZTEC_ROADMAP.filter((item) => item.phase === activePhase),
    [activePhase]
  );

  return (
    <section className="w-full bg-[#FAFAF8] border-t border-black/8 py-28 md:py-40">
      <div className="w-full max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="flex flex-col gap-4">
            <span className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-black/30">
              Architecture Specification
            </span>
            <h2 className="text-[36px] sm:text-[48px] font-black tracking-tighter uppercase leading-[0.95] text-black max-w-[560px]">
              50-Point Technical
              <br />
              Blueprint.
            </h2>
          </div>
          <p className="font-serif text-[15px] text-black/50 leading-relaxed max-w-[400px]">
            A structured overview of the five implementation phases covering cryptographic architecture, privacy infrastructure, security modeling, analytics tooling, and ecosystem development.
          </p>
        </div>

        {/* Phase Tabs */}
        <div className="flex flex-wrap gap-2 mb-12 border-b border-black/10 pb-6">
          {PHASES.map((phase) => (
            <button
              key={phase.id}
              onClick={() => setActivePhase(phase.id)}
              className={`px-5 py-2.5 font-mono text-[10px] font-black uppercase tracking-widest border transition-all duration-200 ${
                activePhase === phase.id
                  ? "bg-black text-white border-black"
                  : "bg-white text-black/45 border-black/15 hover:border-black/30 hover:text-black"
              }`}
            >
              Phase {phase.id} — {phase.label}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePhase}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-black/10 border border-black/10"
          >
            {filtered.map((item: AztecRoadmapItem) => (
              <div
                key={item.id}
                className="bg-white p-8 flex flex-col gap-5 group hover:bg-[#FAFAF8] transition-colors duration-200"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-black text-black/20">
                    {String(item.id).padStart(2, "0")}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-black/30 border border-black/10 px-2 py-0.5">
                    Phase {item.phase}
                  </span>
                </div>

                <h3 className="font-mono text-[13px] font-black uppercase tracking-[0.1em] text-black leading-snug">
                  {item.title}
                </h3>

                <div className="flex flex-col gap-4">
                  <div>
                    <span className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-black/30 block mb-1.5">
                      Problem
                    </span>
                    <p className="font-serif text-[13px] text-black/50 leading-relaxed">
                      {item.problem}
                    </p>
                  </div>
                  <div className="border-t border-black/8 pt-4">
                    <span className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-black/30 block mb-1.5">
                      Solution
                    </span>
                    <p className="font-serif text-[13px] text-black/70 leading-relaxed">
                      {item.solution}
                    </p>
                  </div>
                </div>

                <div className="border-t border-black/8 pt-4 mt-auto">
                  <span className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-black/30 block mb-1.5">
                    Deliverable
                  </span>
                  <p className="font-serif text-[12px] text-black/45 leading-relaxed">
                    {item.deliverable}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* View All Link */}
        <div className="mt-8 flex justify-end">
          <Link
            href="/roadmap"
            className="font-mono text-[11px] font-black uppercase tracking-[0.2em] text-black/45 hover:text-black transition-colors duration-200 flex items-center gap-2"
          >
            Full Technical Roadmap
            <span className="text-[10px]">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function DocumentationSection() {
  const DOC_SECTIONS = [
    {
      label: "Getting Started",
      href: "/developers/api-docs",
      description:
        "Connect your wallet, initialize the local proving environment, and submit your first private transaction in under 10 minutes.",
    },
    {
      label: "API Reference",
      href: "/developers/api-docs",
      description:
        "Complete endpoint documentation for REST and WebSocket interfaces. Includes authentication, rate limits, and response schemas.",
    },
    {
      label: "Noir Circuit Guides",
      href: "/developer",
      description:
        "Write, test, and deploy zero-knowledge circuits using the Noir language. Includes constraint system patterns and proving benchmarks.",
    },
    {
      label: "Compliance SDK",
      href: "/security",
      description:
        "Generate viewing keys, range proofs, and Verifiable Credentials for regulatory disclosure without revealing transactional data.",
    },
    {
      label: "Architecture Overview",
      href: "/architecture",
      description:
        "System diagrams, state machine specifications, and protocol flow documentation for the full L1–L2 integration stack.",
    },
    {
      label: "Security Audit Reports",
      href: "/security",
      description:
        "Formal verification certificates, circuit audit summaries, and dependency threat assessments published by independent reviewers.",
    },
  ];

  return (
    <section className="w-full bg-white border-t border-black/8 py-28 md:py-40">
      <div className="w-full max-w-[1200px] mx-auto px-6">
        <div className="flex flex-col gap-4 mb-16">
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-black/30">
            Documentation
          </span>
          <h2 className="text-[36px] sm:text-[48px] font-black tracking-tighter uppercase leading-[0.95] text-black max-w-[500px]">
            Everything You
            <br />Need to Build.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-black/10 border border-black/10">
          {DOC_SECTIONS.map((doc) => (
            <Link
              key={doc.label}
              href={doc.href}
              className="bg-white p-8 flex flex-col gap-4 group hover:bg-[#FAFAF8] transition-colors duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[12px] font-black uppercase tracking-[0.1em] text-black group-hover:text-black/80 transition-colors">
                  {doc.label}
                </span>
                <span className="font-mono text-[12px] text-black/20 group-hover:text-black/60 transition-colors">
                  →
                </span>
              </div>
              <p className="font-serif text-[13px] text-black/50 leading-relaxed">
                {doc.description}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-t border-black/8 pt-8">
          <p className="font-serif text-[14px] text-black/40 max-w-[480px] leading-relaxed">
            All documentation is version-controlled and synchronized with the protocol deployment state. 
          </p>
          <Link
            href="/developers/api-docs"
            className="shrink-0 px-7 py-3 bg-black text-white font-mono text-[11px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-black/85 transition-all duration-200"
          >
            Open Full Docs
          </Link>
        </div>
      </div>
    </section>
  );
}

function FinalCTASection() {
  return (
    <section className="w-full bg-black py-32 md:py-48">
      <div className="w-full max-w-[900px] mx-auto px-6 flex flex-col items-center text-center gap-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-8"
        >
          {/* Logo mark in white */}
          <div className="w-16 h-16 relative">
            <img
              src="/atom_3d_silver.jpg"
              alt="Humanity Ledger"
              className="w-full h-full object-contain brightness-[10] contrast-[0.5] opacity-80"
              draggable={false}
            />
          </div>

          <h2 className="text-[44px] sm:text-[64px] font-black tracking-tighter uppercase leading-[0.92] text-white">
            Private by
            <br />
            <span className="text-white/35">Default.</span>
          </h2>

          <p className="font-serif text-[18px] text-white/45 leading-relaxed max-w-[520px]">
            Every transaction, identity proof, and governance action on Humanity Ledger is cryptographically private. There is no opt-in — privacy is the foundational state of the network.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/portfolio"
              className="px-10 py-4 bg-white text-black font-mono text-[11px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-white/90 transition-all duration-200 active:scale-95"
            >
              Open Application
            </Link>
            <Link
              href="/whitepaper"
              className="px-10 py-4 border border-white/20 text-white font-mono text-[11px] font-black uppercase tracking-[0.2em] rounded-full hover:border-white/40 transition-all duration-200 active:scale-95"
            >
              Read Whitepaper
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Main Export ────────────────────────────────────────────────────────────────

export interface ImmersiveManifestoLandingProps {
  onOpenScanner?: () => void;
  hideMap?: boolean;
}

export function ImmersiveManifestoLanding(_props: ImmersiveManifestoLandingProps = {}) {
  return (
    <div className="relative text-[#050505] font-sans antialiased overflow-x-hidden w-full flex flex-col bg-white">
      <LandingNav />
      <HeroSection />
      <InfraSpecsRow />
      <CorePillarsSection />
      <AztecVisionSection />
      <DocumentationSection />
      <FinalCTASection />
    </div>
  );
}
