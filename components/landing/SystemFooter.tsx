"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

function ClickDot({ x, y, id }: { x: number; y: number; id: number }) {
  return (
    <motion.div
      key={id}
      style={{ position: 'absolute', left: x - 2, top: y - 2, pointerEvents: 'none', zIndex: 50 }}
      initial={{ opacity: 1, scale: 0 }}
      animate={{ opacity: 0, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#000000' }} />
    </motion.div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const NAV_COLUMNS = [
  {
    label: "Protocol",
    links: [
      { label: "Technical Whitepaper", href: "/whitepaper" },
      { label: "Privacy Manifesto",    href: "/manifesto" },
      { label: "QDs Tokenomics",       href: "/tokenomics" },
      { label: "Roadmap",              href: "/roadmap" },
    ]
  },
  {
    label: "Developers",
    links: [
      { label: "Developer Hub",  href: "/developer" },
      { label: "API Reference",  href: "/developers/api-docs" },
      { label: "API Marketplace",href: "/api-marketplace" },
      { label: "Noir Circuits",  href: "https://github.com/hvbr1s/noir-circuits", external: true },
    ]
  },
  {
    label: "Security",
    links: [
      { label: "Security Policy", href: "/security" },
      { label: "Bug Bounty",      href: "/security" },
      { label: "Audits",          href: "/security" },
    ]
  },
  {
    label: "Community",
    links: [
      { label: "Token Forum", href: "/forum" },
      { label: "Discord",     href: "https://discord.gg/aztec",          external: true },
      { label: "Twitter",     href: "https://x.com/aztecnetwork",        external: true },
    ]
  },
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
  const containerRef = useRef<HTMLElement>(null);
  const [dots, setDots] = useState<{ id: number; x: number; y: number }[]>([]);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => () => { timeoutsRef.current.forEach(clearTimeout); }, []);

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newDots = Array.from({ length: 3 }, (_, i) => ({
      id: Date.now() + i,
      x: x + (Math.random() - 0.5) * 20,
      y: y + (Math.random() - 0.5) * 20,
    }));
    setDots(prev => [...prev, ...newDots]);
    const timer = setTimeout(() => {
      const ids = new Set(newDots.map(d => d.id));
      setDots(prev => prev.filter(d => !ids.has(d.id)));
    }, 500);
    timeoutsRef.current.push(timer);
  };

  return (
    <footer
      ref={containerRef}
      onClick={handleClick}
      className="relative w-full bg-white border-t border-black/5 flex flex-col items-center overflow-hidden selection:bg-black selection:text-white"
    >
      <AnimatePresence>
        {dots.map((dot) => <ClickDot key={dot.id} {...dot} />)}
      </AnimatePresence>

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

        {/* ── Row 2: Navigation Grid (4 equal columns) ── */}
        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-8">
          {NAV_COLUMNS.map((col) => (
            <div key={col.label} className="flex flex-col gap-5">
              <span className="font-mono text-[9px] font-black uppercase tracking-[0.3em] text-[#050505]/35 pb-3 border-b border-black/5">
                {col.label}
              </span>
              <div className="flex flex-col gap-0.5">
                {col.links.map((l) => (
                  <FooterLink key={l.label} href={l.href} external={'external' in l ? l.external : false}>
                    {l.label}
                  </FooterLink>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="w-full h-px bg-black/5" />

        {/* ── Row 3: Ecosystem Collaborators ── */}
        <div className="w-full flex flex-col items-center gap-5">
          <span className="font-mono text-[9px] uppercase tracking-[0.35em] text-black/25 font-bold">
            Ecosystem Collaborators
          </span>
          <div className="flex flex-wrap justify-center items-end gap-x-8 gap-y-5">
            {ECOSYSTEM_PARTNERS.map((p) => (
              <div key={p.name} className="flex flex-col items-center gap-1.5 group cursor-default">
                <div className="flex items-center gap-2 px-4 py-2 border border-black/8 rounded-xl bg-white group-hover:border-black/20 group-hover:bg-black/[0.03] transition-all duration-200">
                  {p.isAztec ? (
                    <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2.5C12.5 2.5 13 2.7 13.4 3.1L20.9 10.6C21.7 11.4 21.7 12.6 20.9 13.4L13.4 20.9C12.6 21.7 11.4 21.7 10.6 20.9L3.1 13.4C2.3 12.6 2.3 11.4 3.1 10.6L10.6 3.1C11 2.7 11.5 2.5 12 2.5ZM12 8.5C11.6 8.5 11.2 8.7 10.9 8.9L8.9 10.9C8.3 11.5 8.3 12.5 8.9 13.1L10.9 15.1C11.5 15.7 12.5 15.7 13.1 15.1L15.1 13.1C15.7 12.5 15.7 11.5 15.1 10.9L13.1 8.9C12.8 8.7 12.4 8.5 12 8.5Z" fill="#2a1b4d"/>
                    </svg>
                  ) : p.icon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.icon} alt={p.name} className="w-4 h-4 object-contain opacity-55 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <div className="w-2 h-2 rounded-sm bg-black/20 group-hover:bg-black/40 transition-colors" />
                  )}
                  <span className="font-mono text-[10px] font-black uppercase tracking-[0.12em] text-black/55 group-hover:text-black transition-colors">
                    {p.name}
                  </span>
                </div>
                <span className="font-mono text-[7px] uppercase tracking-[0.25em] text-black/22">
                  {p.sub}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full h-px bg-black/5" />

        {/* ── Row 4: Copyright ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-[#050505]/35 text-center sm:text-left">
            © 2026 Humanity Ledger · The Architecture of Reality
          </span>
          <div className="flex items-center gap-8">
            {["Immutable", "Decentralized", "Absolute"].map((l) => (
              <span
                key={l}
                className="font-mono text-[9px] font-black uppercase tracking-[0.3em] text-[#050505]/25 cursor-crosshair hover:text-black transition-colors"
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
