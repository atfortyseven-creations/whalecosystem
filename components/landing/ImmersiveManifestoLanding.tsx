"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

// ─── Nav Data ────────────────────────────────────────────────────────────────

const PRODUCT_LINKS = [
  { label: "Whale Network", sub: "Real-time on-chain capital flow tracking", href: "/portfolio" },
  { label: "Aztec API", sub: "Build privacy into your applications", href: "/developers/api-docs" },
  { label: "Developer Hub", sub: "Circuits, SDKs, and sandbox tools", href: "/developer" },
];

const COMPANY_LINKS = [
  { label: "About", href: "/company" },
  { label: "Careers", href: "/careers" },
  { label: "Security", href: "/security" },
  { label: "Blog", href: "/blog" },
];

// ─── Network stat strip ───────────────────────────────────────────────────────

const STATS = [
  { label: "Network Layer", value: "Aztec L2 zkRollup" },
  { label: "State Model", value: "Private Notes (UTXO)" },
  { label: "Circuit Language", value: "Noir" },
  { label: "Settlement", value: "Ethereum L1" },
  { label: "Identity", value: "ZK Biometric Liveness" },
  { label: "Compliance", value: "W3C Verifiable Credentials" },
];

// ─── Feature cards ───────────────────────────────────────────────────────────

const FEATURES = [
  {
    title: "Private Execution",
    body: "All computation happens on your device. Your inputs and outputs never leave your machine — the network validates a proof, not your data.",
    tag: "Zero-Knowledge",
  },
  {
    title: "Selective Disclosure",
    body: "Generate viewing keys and range proofs for compliance or audits. Verifiable by regulators, invisible to observers.",
    tag: "Compliance Ready",
  },
  {
    title: "On-Chain Intelligence",
    body: "Whale Network monitors capital flows across major chains in real time. Act on institutional-grade data without exposing your position.",
    tag: "Whale Network",
  },
  {
    title: "Threshold Authorization",
    body: "Multi-party approvals proven inside a zero-knowledge circuit. No signer identities leak. Built for treasury and governance.",
    tag: "Multi-Sig ZK",
  },
  {
    title: "Stealth Addresses",
    body: "Each transaction generates a unique, single-use address. On-chain observers cannot link sender to receiver.",
    tag: "Unlinkability",
  },
  {
    title: "Cross-Chain Bridges",
    body: "Move assets across networks through encrypted bridge contracts. Capital flows become invisible to traditional forensic analysis.",
    tag: "Omnichain",
  },
];

// ─── Documentation cards ─────────────────────────────────────────────────────

const DOC_CARDS = [
  {
    label: "Getting Started",
    href: "/developers/api-docs",
    body: "Connect your wallet, initialize the proving environment, and submit your first private transaction.",
  },
  {
    label: "API Reference",
    href: "/developers/api-docs",
    body: "REST and WebSocket endpoints with authentication, rate limits, and full response schemas.",
  },
  {
    label: "Noir Circuit Guides",
    href: "/developer",
    body: "Write, test, and deploy zero-knowledge circuits using the Noir language with Barretenberg.",
  },
  {
    label: "Compliance SDK",
    href: "/security",
    body: "Generate viewing keys, range proofs, and Verifiable Credentials for regulatory disclosure.",
  },
  {
    label: "Architecture Overview",
    href: "/architecture",
    body: "System diagrams, state machine specs, and protocol flow documentation for the full L1–L2 stack.",
  },
  {
    label: "Security Audits",
    href: "/security",
    body: "Formal verification certificates, circuit audit summaries, and threat assessments from independent reviewers.",
  },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);

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

        {/* Left: Logo + nav links */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-6 h-6 shrink-0">
              <img
                src="/atom_3d_silver.jpg"
                alt="Humanity Ledger"
                className="w-full h-full object-contain mix-blend-multiply"
              />
            </div>
            <span className="font-serif text-[17px] font-black tracking-tight text-black leading-none">
              Humanity Ledger
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-5">
            <Link href="/architecture" className="text-[13.5px] font-medium text-black/65 hover:text-black transition-colors">
              Architecture
            </Link>
            <Link href="/roadmap" className="text-[13.5px] font-medium text-black/65 hover:text-black transition-colors">
              Roadmap
            </Link>

            {/* Product Dropdown */}
            <div
              className="relative group h-14 flex items-center"
              onMouseEnter={() => setProductOpen(true)}
              onMouseLeave={() => setProductOpen(false)}
            >
              <button className="flex items-center gap-1 text-[13.5px] font-medium text-black/65 hover:text-black transition-colors">
                Product
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${productOpen ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6"/></svg>
              </button>
              <AnimatePresence>
                {productOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-14 left-0 bg-white border border-black/10 shadow-xl w-[300px] z-50"
                  >
                    {PRODUCT_LINKS.map((l) => (
                      <Link key={l.label} href={l.href} className="flex flex-col px-5 py-4 hover:bg-black/[0.03] border-b border-black/5 last:border-b-0 transition-colors">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[13.5px] font-semibold text-black">{l.label}</span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-black/30"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>
                        </div>
                        <span className="text-[11.5px] text-black/45">{l.sub}</span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Company Dropdown */}
            <div
              className="relative group h-14 flex items-center"
              onMouseEnter={() => setCompanyOpen(true)}
              onMouseLeave={() => setCompanyOpen(false)}
            >
              <button className="flex items-center gap-1 text-[13.5px] font-medium text-black/65 hover:text-black transition-colors">
                Company
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${companyOpen ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6"/></svg>
              </button>
              <AnimatePresence>
                {companyOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-14 left-0 bg-white border border-black/10 shadow-xl w-[180px] z-50"
                  >
                    {COMPANY_LINKS.map((l) => (
                      <Link key={l.label} href={l.href} className="flex items-center px-5 py-3 hover:bg-black/[0.03] border-b border-black/5 last:border-b-0 transition-colors">
                        <span className="text-[13.5px] font-medium text-black">{l.label}</span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right: GitHub + Docs + Sign In */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href="https://github.com/atfortyseven-creations/Humanity-Ledger"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-[13.5px] font-medium text-black/70 hover:text-black transition-colors"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
            GitHub
          </a>
          <Link
            href="/developers/api-docs"
            className="px-4 py-1.5 border border-black/15 text-[13.5px] font-medium text-black hover:bg-black/[0.04] transition-colors"
          >
            Docs
          </Link>
          <Link
            href="/portfolio"
            className="px-4 py-1.5 bg-black text-white text-[13.5px] font-medium hover:bg-black/85 transition-colors"
          >
            Sign In
          </Link>
        </div>

        {/* Mobile toggle */}
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
            transition={{ duration: 0.18 }}
            className="md:hidden bg-white border-t border-black/10 px-6 py-6 flex flex-col gap-4"
          >
            <Link href="/architecture" onClick={() => setMobileOpen(false)} className="text-[15px] font-medium text-black/70 hover:text-black">Architecture</Link>
            <Link href="/roadmap" onClick={() => setMobileOpen(false)} className="text-[15px] font-medium text-black/70 hover:text-black">Roadmap</Link>
            <Link href="/portfolio" onClick={() => setMobileOpen(false)} className="text-[15px] font-medium text-black/70 hover:text-black">Product</Link>
            <Link href="/company" onClick={() => setMobileOpen(false)} className="text-[15px] font-medium text-black/70 hover:text-black">Company</Link>
            <div className="flex gap-3 mt-2">
              <Link href="/developers/api-docs" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 border border-black/15 text-[14px] font-medium text-black">Docs</Link>
              <Link href="/portfolio" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 bg-black text-[14px] font-medium text-white">Sign In</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.6], [0, 60]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section
      ref={ref}
      className="relative w-full min-h-screen flex flex-col items-center justify-center bg-white overflow-hidden"
    >
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-white to-transparent pointer-events-none z-10" />

      <motion.div
        style={{ opacity, y }}
        className="relative z-20 flex flex-col items-center text-center px-6 w-full max-w-[880px] mx-auto pt-20"
      >
        {mounted && (
          <>


            {/* Atom */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
              className="relative w-[220px] h-[220px] sm:w-[300px] sm:h-[300px] lg:w-[380px] lg:h-[380px] mb-10 shrink-0"
            >
              <img
                src="/atom_3d_silver.jpg"
                alt="Humanity Ledger"
                className="w-full h-full object-contain mix-blend-multiply"
                draggable={false}
              />
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              className="text-[42px] sm:text-[60px] lg:text-[80px] font-black tracking-tighter leading-[0.9] text-black mb-5"
            >
              Private by
              <br />
              <span className="text-black/22">Default.</span>
            </motion.h1>

            {/* Sub */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.32 }}
              className="text-[16px] sm:text-[18px] text-black/50 leading-relaxed max-w-[560px] mb-10 font-light"
            >
              A zero-knowledge network built on Aztec. Every transaction, record, and identity proof
              is cryptographically private — not opt-in, not optional. Private by design.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.44 }}
              className="flex flex-col sm:flex-row items-center gap-3"
            >
              <Link
                href="/portfolio"
                className="w-full sm:w-auto px-8 py-3.5 bg-black text-white text-[13px] font-semibold hover:bg-black/85 transition-colors"
              >
                Open Application
              </Link>
              <Link
                href="/developers/api-docs"
                className="w-full sm:w-auto px-8 py-3.5 border border-black/15 text-black text-[13px] font-semibold hover:bg-black/[0.04] transition-colors"
              >
                Read Documentation
              </Link>
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-30 pointer-events-none"
      >
        <div className="w-[1px] h-12 bg-gradient-to-b from-black/25 to-transparent" />
      </motion.div>
    </section>
  );
}

// ─── Network stat strip ───────────────────────────────────────────────────────

function StatStrip() {
  return (
    <section className="w-full bg-white border-t border-black/8 overflow-hidden">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-y divide-black/8 border-b border-black/8">
        {STATS.map((s) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="px-5 py-5 flex flex-col gap-1"
          >
            <span className="text-[9px] font-mono font-bold uppercase tracking-[0.22em] text-black/35">
              {s.label}
            </span>
            <span className="text-[12px] font-mono font-black text-black leading-snug">
              {s.value}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── How it works (immersive scroll) ─────────────────────────────────────────



// ─── Whale Network callout ────────────────────────────────────────────────────

function WhaleNetworkSection() {
  return (
    <section className="w-full bg-white border-t border-black/8 py-28 md:py-40">
      <div className="w-full max-w-[1100px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-black/30">
              Whale Network
            </span>
            <h2 className="mt-4 text-[36px] sm:text-[52px] font-black tracking-tighter leading-[0.93] text-black">
              Market intelligence.<br />
              <span className="text-black/22">Privately acted on.</span>
            </h2>
            <p className="mt-6 text-[15px] text-black/55 leading-[1.75] max-w-[480px]">
              Whale Network monitors capital flows across major blockchains in real time. Large
              transfers, exchange inflows, and wallet activations are surfaced as structured events.
            </p>
            <p className="mt-4 text-[15px] text-black/55 leading-[1.75] max-w-[480px]">
              Because Humanity Ledger runs inside the Aztec shielded pool, you can act on this
              data — set alerts, execute trades, route capital — without your own position being
              visible to anyone else.
            </p>
            <div className="mt-10 flex items-center gap-4">
              <Link
                href="/portfolio"
                className="px-6 py-3 bg-black text-white text-[13px] font-semibold hover:bg-black/85 transition-colors"
              >
                Open Dashboard
              </Link>
              <Link
                href="/architecture"
                className="text-[13px] font-semibold text-black/50 hover:text-black transition-colors flex items-center gap-1.5"
              >
                See Architecture
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-[1px] bg-black/8 border border-black/8">
            {[
              { label: "Chains Monitored", value: "20+" },
              { label: "Alert Latency", value: "< 1s" },
              { label: "Transactions Tracked", value: "50M+" },
              { label: "Private by Default", value: "Always" },
            ].map((c) => (
              <div key={c.label} className="bg-white p-7 flex flex-col gap-2">
                <span className="text-[28px] font-black tracking-tight text-black">{c.value}</span>
                <span className="text-[12px] font-mono font-bold uppercase tracking-wider text-black/35">{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Documentation ────────────────────────────────────────────────────────────

function DocumentationSection() {
  return (
    <section className="w-full bg-[#fafafa] border-t border-black/8 py-28 md:py-40">
      <div className="w-full max-w-[1100px] mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14">
          <div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-black/30">
              Documentation
            </span>
            <h2 className="mt-4 text-[36px] sm:text-[52px] font-black tracking-tighter leading-[0.93] text-black max-w-[440px]">
              Everything you<br />
              <span className="text-black/22">need to build.</span>
            </h2>
          </div>
          <Link
            href="/developers/api-docs"
            className="shrink-0 px-6 py-3 bg-black text-white text-[13px] font-semibold hover:bg-black/85 transition-colors"
          >
            Open Full Docs
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-black/8 border border-black/8">
          {DOC_CARDS.map((d) => (
            <Link
              key={d.label}
              href={d.href}
              className="bg-white p-8 flex flex-col gap-3 group hover:bg-[#fafafa] transition-colors duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-black tracking-tight text-black group-hover:text-black/80 transition-colors">
                  {d.label}
                </span>
                <span className="text-black/20 group-hover:text-black/50 transition-colors text-[14px]">→</span>
              </div>
              <p className="text-[13px] text-black/50 leading-relaxed">{d.body}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA ────────────────────────────────────────────────────────────────

function FinalCTASection() {
  return (
    <section className="w-full bg-black py-36 md:py-52">
      <div className="w-full max-w-[800px] mx-auto px-6 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-8"
        >
          <div className="w-14 h-14">
            <img
              src="/atom_3d_silver.jpg"
              alt="Humanity Ledger"
              className="w-full h-full object-contain brightness-[8] contrast-50 opacity-75"
              draggable={false}
            />
          </div>

          <h2 className="text-[44px] sm:text-[68px] font-black tracking-tighter leading-[0.9] text-white">
            Start building
            <br />
            <span className="text-white/25">privately.</span>
          </h2>

          <p className="text-[17px] text-white/40 leading-relaxed max-w-[480px] font-light">
            Join the developers and protocols using Humanity Ledger to bring
            verifiable privacy to every interaction on Aztec.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/portfolio"
              className="px-9 py-3.5 bg-white text-black text-[13px] font-semibold hover:bg-white/90 transition-colors"
            >
              Open Application
            </Link>
            <Link
              href="/developers/api-docs"
              className="px-9 py-3.5 border border-white/20 text-white text-[13px] font-semibold hover:border-white/35 transition-colors"
            >
              Read the Docs
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export interface ImmersiveManifestoLandingProps {
  onOpenScanner?: () => void;
  hideMap?: boolean;
}

export function ImmersiveManifestoLanding(_props: ImmersiveManifestoLandingProps = {}) {
  return (
    <div className="relative text-[#050505] font-sans antialiased overflow-x-hidden w-full flex flex-col bg-white">
      <LandingNav />
      <HeroSection />
      <StatStrip />
      <WhaleNetworkSection />
      <DocumentationSection />
      <FinalCTASection />
    </div>
  );
}
