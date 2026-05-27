"use client";

import React from "react";
import Link from "next/link";

// ─── Sub-components ──────────────────────────────────────────────────────────

function FooterLink({ href, children, external = false }: { href: string; children: React.ReactNode; external?: boolean }) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="group relative font-sans text-[12px] font-medium text-[#050505]/55 hover:text-black transition-colors duration-200 py-1.5 whitespace-nowrap block"
    >
      {children}
    </Link>
  );
}
// ─── Data ─────────────────────────────────────────────────────────────────────

const NAV_COLUMNS = [
  {
    label: "Platform",
    links: [
      { label: "Portfolio",            href: "/portfolio" },
      { label: "News Analytics",       href: "/news" },
      { label: "Status",               href: "/status" },
      { label: "Architecture Guide",   href: "/architecture" },
      { label: "API Docs",             href: "/developers/api-docs" },
    ]
  },
  {
    label: "Company",
    links: [
      { label: "About Us",             href: "/company/about" },
      { label: "Careers",              href: "/careers" },
      { label: "Whale Chat",           href: "/chat" },
    ]
  },
  {
    label: "Legal & Security",
    links: [
      { label: "Terms of Service",     href: "/legal/terms" },
      { label: "Privacy Policy",       href: "/legal/privacy" },
      { label: "Security Architecture",href: "/legal/security" },
      { label: "Regulatory Compliance",href: "/legal/compliance" },
    ]
  }
];

const ECOSYSTEM_PARTNERS = [
  { name: "Aztec Network",  sub: "Privacy Layer",       icon: "/system-shots/PARTNERS/Captura de pantalla 2026-05-22 030758.png", isAztec: false },
  { name: "Noir",           sub: "ZK Circuits",         icon: "/system-shots/PARTNERS/64b5696bf0d1f9bd7b9b0f22_400-400Logo-300x300.png", isAztec: false },
  { name: "Ethereum",       sub: "L1 Settlement",       icon: "/system-shots/PARTNERS/icon.png", isAztec: false },
  { name: "MetaMask",       sub: "Identity Bridge",     icon: "/system-shots/PARTNERS/MetaMask_Fox.svg.png", isAztec: false },
  { name: "Railway",        sub: "Infrastructure",      icon: "/system-shots/PARTNERS/railway.webp", isAztec: false },
  { name: "Cloudflare",     sub: "Edge Security",       icon: "/system-shots/PARTNERS/cloudflare_logo_icon_170372.png", isAztec: false },
  { name: "Neo4j",          sub: "Graph DB",            icon: "/system-shots/PARTNERS/neo4j-logo-png-transparent.png", isAztec: false },
  { name: "Upstash",        sub: "Redis Cache",         icon: "/system-shots/PARTNERS/upstash-icon-white-bg.png", isAztec: false },
  { name: "Coinbase",       sub: "Exchange Base",       icon: "/system-shots/PARTNERS/coinbase-logo-icon.webp", isAztec: false },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export function SystemFooter() {
  return (
    <footer
      className="relative w-full bg-white border-t border-black/5 flex flex-col items-center overflow-hidden selection:bg-black selection:text-white"
    >
      <div className="relative z-20 w-full max-w-[1200px] mx-auto px-8 md:px-16 pt-20 pb-12 flex flex-col gap-14">

        {/* ── Row 1: Brand + Social ── */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 shrink-0 flex items-center justify-center">
              <img
                src="/system-shots/PARTNERS/pngtree-3d-silver-atom-symbol-matter-quantum-fiction-photo-picture-image_3222092.jpg"
                alt="Humanity Ledger"
                className="object-contain w-full h-full mix-blend-multiply"
              />
            </div>
            <div className="flex flex-col leading-none text-[#050505]">
              <span className="font-mono text-[13px] font-black uppercase tracking-[0.22em] leading-none">
                HUMANITY LEDGER
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-black/30 mt-1 font-medium">
                Powered by Aztec Network
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6 pt-1">
            <a
              href="https://t.me/humanityledger"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[10px] font-black uppercase tracking-widest text-[#050505]/40 hover:text-black transition-colors"
            >
              Telegram
            </a>
            <a
              href="https://x.com/whalecosystem"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[10px] font-black uppercase tracking-widest text-[#050505]/40 hover:text-black transition-colors"
            >
              X / Twitter
            </a>
          </div>
        </div>

        <div className="w-full h-px bg-black/5" />

        {/* ── Row 2: Letta-style Navigation Grid (3 link columns + 1 newsletter column) ── */}
        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-8">
          {NAV_COLUMNS.map((col) => (
            <div key={col.label} className="flex flex-col gap-5">
              <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-[#050505]/40">
                {col.label}
              </span>
              <div className="flex flex-col gap-3">
                {col.links.map((l) => (
                  <FooterLink key={l.label} href={l.href}>
                    {l.label}
                  </FooterLink>
                ))}
              </div>
            </div>
          ))}

          {/* Newsletter Column */}
          <div className="flex flex-col gap-5 col-span-2 md:col-span-1">
            <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-[#050505]/40">
              Newsletter
            </span>
            <div className="flex items-center gap-2">
              <div className="flex items-center border border-black/20 bg-transparent px-3 py-2 w-full max-w-[240px]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-black/40 mr-2 shrink-0">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="bg-transparent border-none outline-none text-[13px] font-sans text-black w-full placeholder:text-black/30"
                />
              </div>
              <button className="w-10 h-[38px] bg-[#111111] hover:bg-black text-white flex items-center justify-center shrink-0 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
                  <path d="M7 17L17 7" />
                  <path d="M7 7h10v10" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-black/5" />

        {/* ── Row 3: Protocol Vision & Introduction ── */}
        <div className="w-full flex flex-col items-start gap-4">
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[#050505] pb-2 border-b border-black/10">
            HUMANITY LEDGER PROTOCOL & WHALE ALERT NETWORK
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[#050505]/60 text-xs font-sans leading-relaxed text-justify">
            <p>
              Humanity Ledger operates as an advanced cryptographic coordination layer built natively on the Aztec Network. By leveraging zero-knowledge proofs (zkSNARKs) and Noir circuits, the protocol ensures that all financial, identity, and governance state transitions execute with absolute privacy. Unlike transparent public ledgers where surveillance is a default state, Humanity Ledger provides verifiable execution where sensitive user inputs remain permanently shielded on the client device. 
            </p>
            <p>
              Integrated directly with Whale Alert Network, the system provides high-precision market intelligence and forensic analytics without compromising individual user privacy. Whale Alert Network monitors macroeconomic capital flows across Omnichain networks, aggregating data into the Humanity Ledger through private indexing logic. Together, they establish a secure, immutable, and fully decentralized foundation for institutional-grade portfolio management and private decentralized finance.
            </p>
          </div>
        </div>

        <div className="w-full h-px bg-black/5" />

        {/* ── Row 4: Copyright ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-[#050505]/35 text-center sm:text-left">
            © 2026 Humanity Ledger — Built on Aztec Network
          </span>
          <div className="flex items-center gap-8">
            {["Private", "Verifiable", "Open"].map((l) => (
              <span
                key={l}
                className="font-mono text-[9px] font-black uppercase tracking-[0.3em] text-[#050505]/25"
              >
                {l}
              </span>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
