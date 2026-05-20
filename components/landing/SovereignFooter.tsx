"use client";

/**
 * QuantumFooter — Maximum Precision Light Mode Mega-Footer
 * ═══════════════════════════════════════════════════════════════
 * • Light mode aesthetic with absolute abysmal perfection.
 * • 12 integrated nav tabs in a 6-column mega-grid.
 * • Interactive purple cursor-cracking animation for maximum immersion.
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

function FooterLink({ href, children, external = false }: { href: string; children: React.ReactNode; external?: boolean }) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="group relative font-sans text-[11.5px] font-medium text-[#050505]/60 hover:text-[#7C3AED] transition-colors duration-300 py-1.5 whitespace-nowrap block"
    >
      {children}
      <span className="absolute bottom-1 left-0 w-0 group-hover:w-full h-[1px] bg-[#7C3AED]/40 transition-all duration-300" />
    </Link>
  );
}

// ── Ecosystem logo data ────────────────────────────────────────────────────
const ECOSYSTEM_LOGOS = [
  { name: "MetaMask", src: "/wallets/metamask.svg", href: "https://metamask.io" },
  { name: "Coinbase", src: "/wallets/coinbase.png", href: "https://www.coinbase.com/wallet" },
  { name: "Rainbow", src: "/wallets/rainbow.png", href: "https://rainbow.me" },
];

function EthereumLogo() { return (<svg viewBox="0 0 32 32" width="22" height="22" fill="none"><path d="M16 2L6 16.5 16 21.5 26 16.5z" fill="#627EEA" opacity="0.6"/><path d="M16 2v14.5l10-5.5z" fill="#627EEA"/><path d="M16 21.5l10-5-10 13.5z" fill="#627EEA" opacity="0.6"/><path d="M16 21.5V30l-10-13z" fill="#627EEA"/><path d="M16 16.5l10-5-10-9.5v14.5z" fill="#627EEA" opacity="0.2"/><path d="M6 16.5l10 5V2z" fill="#627EEA" opacity="0.6"/></svg>); }
function PolygonLogo() { return (<svg viewBox="0 0 32 32" width="22" height="22" fill="none"><path d="M21.5 12.5l-4-2.3-1.5-.87-1.5.87-4 2.3-4 2.31v4.62l4 2.3 1.5.87 1.5-.87 4-2.3V15.5l1.5-.87V12.5z" fill="none"/><path d="M21.5 9.12L16 6l-5.5 3.12-4 2.31v10.74l4 2.31L16 26l5.5-3.12 4-2.31V11.43z" stroke="#8247E5" strokeWidth="1.5"/><path d="M13 14l3 1.73 3-1.73v-3.46l-3-1.73-3 1.73z" fill="#8247E5"/></svg>); }
function ArbitrumLogo() { return (<svg viewBox="0 0 32 32" width="22" height="22" fill="none"><circle cx="16" cy="16" r="14" fill="#2D374B"/><path d="M11 22l5-10 5 10" stroke="#28A0F0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M12.5 19h7" stroke="#28A0F0" strokeWidth="1.8" strokeLinecap="round"/></svg>); }
function BaseLogo() { return (<svg viewBox="0 0 32 32" width="22" height="22" fill="none"><circle cx="16" cy="16" r="14" fill="#0052FF"/><path d="M16 9a7 7 0 1 1 0 14A7 7 0 0 1 16 9z" fill="#fff"/><path d="M16 12.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7z" fill="#0052FF"/></svg>); }
function WalletConnectLogo() { return (<svg viewBox="0 0 32 32" width="22" height="22" fill="none"><circle cx="16" cy="16" r="14" fill="#3B99FC"/><path d="M9.5 14c3.6-3.6 9.4-3.6 13 0l.43.43a.45.45 0 0 1 0 .64l-1.47 1.47a.23.23 0 0 1-.32 0l-.6-.6c-2.52-2.52-6.6-2.52-9.12 0l-.63.63a.23.23 0 0 1-.32 0L9 15.07a.45.45 0 0 1 0-.64zm16.1 3l1.31 1.31a.45.45 0 0 1 0 .64l-5.9 5.9a.45.45 0 0 1-.64 0l-4.18-4.18a.11.11 0 0 0-.16 0l-4.18 4.18a.45.45 0 0 1-.64 0l-5.9-5.9a.45.45 0 0 1 0-.64l1.31-1.31a.45.45 0 0 1 .64 0l4.18 4.18c.04.04.12.04.16 0l4.18-4.18a.45.45 0 0 1 .64 0l4.18 4.18c.04.04.12.04.16 0l4.18-4.18a.45.45 0 0 1 .64 0z" fill="#fff"/></svg>); }
function AztecLogo() { return (<svg viewBox="0 0 32 32" width="22" height="22" fill="none"><path d="M16 2L30 16L16 30L2 16Z" fill="#0a0a0a"/><path d="M16 7L25 16L16 25L7 16Z" fill="white" opacity="0.85"/><path d="M16 11L21 16L16 21L11 16Z" fill="#0a0a0a" opacity="0.7"/></svg>); }

const CHAIN_LOGOS = [
  { name: "Ethereum", el: <EthereumLogo />, href: "https://ethereum.org" },
  { name: "Polygon", el: <PolygonLogo />, href: "https://polygon.technology" },
  { name: "Arbitrum", el: <ArbitrumLogo />, href: "https://arbitrum.io" },
  { name: "Base", el: <BaseLogo />, href: "https://base.org" },
  { name: "WalletConnect", el: <WalletConnectLogo />, href: "https://walletconnect.com" },
  { name: "Aztec", el: <AztecLogo />, href: "https://aztec.network" },
];

const MEGA_CLUSTERS = [
  {
    label: "Docs",
    links: [
      { label: "Getting Started", href: "/docs/getting-started" },
      { label: "Overview", href: "/docs/overview" },
      { label: "Quickstart", href: "/docs/quickstart" },
      { label: "Core Concepts", href: "/docs/core-concepts" },
      { label: "Whale Code", href: "/docs/whale-code" },
    ]
  },
  {
    label: "Platform",
    links: [
      { label: "Architecture", href: "/platform/architecture" },
      { label: "Authentication (SIWE)", href: "/platform/auth" },
      { label: "Neo4j Akashic Ledger", href: "/platform/neo4j" },
      { label: "Smart Contracts", href: "/platform/contracts" },
      { label: "Node Deployment", href: "/platform/nodes" },
      { label: "WebSocket Streams", href: "/platform/streams" },
      { label: "Whale Chat Forum", href: "/forum" },
    ]
  },
  {
    label: "Integrations",
    links: [
      { label: "WalletConnect v2", href: "/integrations/walletconnect" },
      { label: "Tron / TRC-20", href: "/integrations/tron" },
      { label: "GetBlock RPC", href: "/integrations/getblock" },
      { label: "Resend Email", href: "/integrations/resend" },
      { label: "Prisma ORM", href: "/integrations/prisma" },
    ]
  },
  {
    label: "Developer",
    links: [
      { label: "Getting Started", href: "/developer/getting-started" },
      { label: "Developer Overview", href: "/developer/overview" },
      { label: "Authentication", href: "/developer/auth" },
      { label: "API Keys", href: "/developer/api-keys" },
      { label: "Rate Limits", href: "/developer/rate-limits" },
    ]
  },
  {
    label: "REST API",
    links: [
      { label: "Reference Overview", href: "/api/overview" },
      { label: "Whale Alerts", href: "/api/alerts" },
      { label: "Market Data", href: "/api/markets" },
      { label: "Wallets & Entities", href: "/api/wallets" },
      { label: "Forum Posts", href: "/api/forum" },
      { label: "Subscriptions", href: "/api/subscriptions" },
      { label: "Transactions", href: "/api/transactions" },
    ]
  },
  {
    label: "WebSocket API",
    links: [
      { label: "Connection", href: "/ws/connection" },
      { label: "Channels", href: "/ws/channels" },
      { label: "Events", href: "/ws/events" },
    ]
  },
  {
    label: "SDKs",
    links: [
      { label: "TypeScript SDK", href: "/sdks/typescript" },
      { label: "Python SDK", href: "/sdks/python" },
      { label: "Webhook Guide", href: "/sdks/webhooks" },
      { label: "Changelog", href: "/sdks/changelog" },
    ]
  },
  {
    label: "Operator",
    links: [
      { label: "Getting Started", href: "/operator/getting-started" },
      { label: "Operator Overview", href: "/operator/overview" },
      { label: "Prerequisites", href: "/operator/prerequisites" },
    ]
  },
  {
    label: "Setup",
    links: [
      { label: "Running a Full Node", href: "/setup/full-node" },
      { label: "Running a Sequencer", href: "/setup/sequencer" },
      { label: "Running a Prover", href: "/setup/prover" },
      { label: "Building from Source", href: "/setup/build" },
      { label: "Snapshots & Syncing", href: "/setup/snapshots" },
    ]
  },
  {
    label: "Operation",
    links: [
      { label: "Monitoring", href: "/operation/monitoring" },
      { label: "Keystore Management", href: "/operation/keystore" },
      { label: "Sequencer Management", href: "/operation/sequencer" },
      { label: "FAQs & Common Issues", href: "/operation/faqs" },
    ]
  },
  {
    label: "Reference",
    links: [
      { label: "CLI Reference", href: "/reference/cli" },
      { label: "Node JSON RPC API", href: "/reference/rpc" },
      { label: "Changelog", href: "/reference/changelog" },
      { label: "Glossary", href: "/reference/glossary" },
    ]
  },
  {
    label: "Legal",
    links: [
      { label: "Terms of Service", href: "/legal/terms" },
      { label: "Privacy Policy", href: "/legal/privacy" },
      { label: "Cookie Policy", href: "/docs/cookie-policy" },
      { label: "Risk Disclosure", href: "/legal/risk" },
      { label: "Whale Code", href: "/docs/whale-code" },
      { label: "Whitepaper", href: "/docs/whitepaper" },
    ]
  }
];

export function SovereignFooter() {
  const containerRef = useRef<HTMLElement>(null);
  const [dots, setDots] = useState<{id: number, x: number, y: number}[]>([]);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // Spawn a cluster of 5 small purple dots around the click point
    const newDots = Array.from({ length: 5 }, (_, i) => ({
      id: Date.now() + i,
      x: x + (Math.random() - 0.5) * 28,
      y: y + (Math.random() - 0.5) * 28,
    }));
    setDots(prev => [...prev, ...newDots]);
    const timer = setTimeout(() => {
      const ids = new Set(newDots.map(d => d.id));
      setDots(prev => prev.filter(d => !ids.has(d.id)));
    }, 700);
    timeoutsRef.current.push(timer);
  };

  return (
    <footer
        ref={containerRef}
        onClick={handleClick}
        className="relative w-full bg-[#FAF9F6] border-t border-[#050505]/5 flex flex-col items-center overflow-hidden selection:bg-[#7C3AED]/20 group/footer"
    >
      {/* Small purple dots on click */}
      <AnimatePresence>
        {dots.map((dot) => (
          <motion.div
            key={dot.id}
            style={{
              position: 'absolute',
              left: dot.x - 3,
              top: dot.y - 3,
              pointerEvents: 'none',
              zIndex: 50,
            }}
            initial={{ opacity: 1, scale: 0 }}
            animate={{ opacity: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#7C3AED',
                boxShadow: '0 0 6px rgba(124,58,237,0.7)',
              }}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="relative z-20 w-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 pt-24 pb-16 flex flex-col gap-16">
        
        {/* Header Branding Row */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-10">
          <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }} className="flex flex-col items-center sm:items-start gap-5">
            <div className="flex items-center gap-4">
                <div className="relative flex items-center justify-center rounded-xl border border-black/5 bg-black/5 overflow-hidden w-[58px] h-[36px] transition-transform hover:scale-105 duration-300">
                    <img 
                        src="/official-whale-monochrome.png" 
                        alt="Whale Alert Network Logo" 
                        className="object-contain w-full h-full p-1 opacity-80 mix-blend-multiply" 
                    />
                </div>
                <div className="flex flex-col leading-none text-[#050505] justify-center">
                    <span className="font-aztec-serif text-[26px] font-black uppercase tracking-tighter leading-none">
                        Whale Alert Network
                    </span>
                </div>
            </div>
          </motion.div>

          {/* Minimalist Text Social Links */}
          <div className="flex items-center gap-6">
            <a href="https://t.me/WhaleAlert" target="_blank" rel="noopener noreferrer" className="font-mono text-[10px] font-black uppercase tracking-widest text-[#050505]/40 hover:text-[#7C3AED] transition-colors">
              Telegram
            </a>
            <a href="https://x.com/WhaleAlert" target="_blank" rel="noopener noreferrer" className="font-mono text-[10px] font-black uppercase tracking-widest text-[#050505]/40 hover:text-[#7C3AED] transition-colors">
              Twitter / X
            </a>
          </div>
        </div>

        <div className="w-full h-px bg-[#050505]/5" />

        {/* 12-Category Mega Grid */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-y-16 gap-x-8">
          {MEGA_CLUSTERS.map((cluster) => (
            <div key={cluster.label} className="flex flex-col gap-5">
              <span className="font-mono text-[10px] font-black uppercase tracking-[0.25em] text-[#050505]/40 border-b border-[#050505]/5 pb-3">
                {cluster.label}
              </span>
              <div className="flex flex-col gap-1.5">
                {cluster.links.map((l) => (
                  <FooterLink key={l.label} href={l.href}>
                    {l.label}
                  </FooterLink>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="w-full h-px bg-[#050505]/5" />

        {/* Ecosystem Logos (Powered By) */}
        <div className="flex flex-col gap-10">
          <span className="font-mono text-[9px] font-black uppercase tracking-[0.3em] text-[#050505]/30 text-center">
            Powered By · Integrated With
          </span>
          <div className="flex flex-wrap justify-center gap-5 sm:gap-8">
            {ECOSYSTEM_LOGOS.map((l) => (
              <a key={l.name} href={l.href} target="_blank" rel="noopener noreferrer" title={l.name} className="group flex flex-col items-center gap-3 opacity-60 hover:opacity-100 hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 rounded-[14px] bg-white border border-[#050505]/10 shadow-sm flex items-center justify-center p-2.5 group-hover:shadow-md group-hover:border-[#050505]/20 transition-all">
                  <img src={l.src} alt={l.name} className="w-full h-full object-contain" />
                </div>
              </a>
            ))}
            {CHAIN_LOGOS.map((l) => (
              <a key={l.name} href={l.href} target="_blank" rel="noopener noreferrer" title={l.name} className="group flex flex-col items-center gap-3 opacity-60 hover:opacity-100 hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 rounded-[14px] bg-white border border-[#050505]/10 shadow-sm flex items-center justify-center p-2 group-hover:shadow-md group-hover:border-[#050505]/20 transition-all">
                  {l.el}
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="w-full h-px bg-[#050505]/5" />

        {/* Whale x Aztec Logo Section */}
        <div className="flex flex-col items-center justify-center gap-4 py-2">
             <div className="flex items-center gap-6 md:gap-8">
                {/* Whale Logo */}
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-[#050505]/10 shadow-sm p-2.5 hover:scale-105 transition-transform duration-300">
                   <img src="/official-whale-monochrome.png" alt="Whale Network" className="w-full h-full object-contain opacity-80 mix-blend-multiply" />
                </div>
                {/* X */}
                <div className="text-[#050505]/40 font-mono text-xl font-black">X</div>
                {/* Aztec Logo */}
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-[#050505]/10 shadow-sm p-2.5 hover:scale-105 transition-transform duration-300">
                   <svg viewBox="0 0 32 32" className="w-full h-full" fill="none">
                      <path d="M16 2L30 16L16 30L2 16Z" fill="#7C3AED"/>
                      <path d="M16 7L25 16L16 25L7 16Z" fill="white" opacity="0.85"/>
                      <path d="M16 11L21 16L16 21L11 16Z" fill="#7C3AED" opacity="0.9"/>
                   </svg>
                </div>
             </div>
             <div className="font-mono text-[11px] md:text-[13px] font-black uppercase tracking-[0.3em] text-[#050505]/70 mt-2">
                Whale Network x Aztec Network
             </div>
        </div>

        <div className="w-full h-px bg-[#050505]/5" />



        {/* Copyright */}
        <div className="flex flex-col items-center gap-4 pt-10 pb-6">
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.25em] text-[#050505]/40 text-center">
            © 2026 Whale Alert Network. All rights reserved.
          </span>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 mt-1">
            {["Privacy", "Terms", "Cookies"].map((l) => (
              <span key={l} className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-[#050505]/30 cursor-crosshair hover:text-[#7C3AED] transition-colors">
                {l}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      {/* Wave Graphic overlay (Subtle sketch effect for Light Mode) */}
      <div className="absolute bottom-0 left-0 right-0 h-[220px] pointer-events-none opacity-20 mix-blend-multiply" style={{ background: "url('/olas-hokusai-4k.png') repeat-x bottom", backgroundSize: "auto 100%" }} />
    </footer>
  );
}
