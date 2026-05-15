"use client";

/**
 * NetworkFooter — Rebuilt
 * ═══════════════════════════════════════════════════════════════
 * • Hokusai wave banner at natural scale (object-cover from bottom, no zoom).
 * • Full ecosystem logo row: MetaMask · Coinbase · Rainbow · WalletConnect
 *   · Aztec · Ethereum · Polygon · Arbitrum · Base.
 * • GDPR / KYC / MiCA / ISO 27001 compliance badges.
 * • Pixel-perfect mobile-first layout — all items centred on small screens.
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, useSpring } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

// ── Internal link component ────────────────────────────────────────────────
function FooterLink({
  href,
  children,
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="group relative font-mono text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-white/50 hover:text-white transition-colors duration-300 py-1 whitespace-nowrap"
    >
      {children}
      <span className="absolute bottom-0 left-0 w-0 group-hover:w-full h-[1px] bg-white/60 transition-all duration-300" />
    </Link>
  );
}

// ── Ecosystem logo data ────────────────────────────────────────────────────
const ECOSYSTEM_LOGOS = [
  { name: "MetaMask",     src: "/wallets/metamask.svg",   href: "https://metamask.io" },
  { name: "Coinbase",     src: "/wallets/coinbase.png",   href: "https://www.coinbase.com/wallet" },
  { name: "Rainbow",      src: "/wallets/rainbow.png",    href: "https://rainbow.me" },
];

// Inline SVG logos for chains (no external files needed)
function EthereumLogo() {
  return (
    <svg viewBox="0 0 32 32" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 2L6 16.5 16 21.5 26 16.5z" fill="#627EEA" opacity="0.6"/>
      <path d="M16 2v14.5l10-5.5z" fill="#627EEA"/>
      <path d="M16 21.5l10-5-10 13.5z" fill="#627EEA" opacity="0.6"/>
      <path d="M16 21.5V30l-10-13z" fill="#627EEA"/>
      <path d="M16 16.5l10-5-10-9.5v14.5z" fill="#627EEA" opacity="0.2"/>
      <path d="M6 16.5l10 5V2z" fill="#627EEA" opacity="0.6"/>
    </svg>
  );
}
function PolygonLogo() {
  return (
    <svg viewBox="0 0 32 32" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21.5 12.5l-4-2.3-1.5-.87-1.5.87-4 2.3-4 2.31v4.62l4 2.3 1.5.87 1.5-.87 4-2.3V15.5l1.5-.87V12.5z" fill="none"/>
      <path d="M21.5 9.12L16 6l-5.5 3.12-4 2.31v10.74l4 2.31L16 26l5.5-3.12 4-2.31V11.43z" stroke="#8247E5" strokeWidth="1.5"/>
      <path d="M13 14l3 1.73 3-1.73v-3.46l-3-1.73-3 1.73z" fill="#8247E5"/>
    </svg>
  );
}
function ArbitrumLogo() {
  return (
    <svg viewBox="0 0 32 32" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" fill="#2D374B"/>
      <path d="M11 22l5-10 5 10" stroke="#28A0F0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12.5 19h7" stroke="#28A0F0" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
function BaseLogo() {
  return (
    <svg viewBox="0 0 32 32" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" fill="#0052FF"/>
      <path d="M16 9a7 7 0 1 1 0 14A7 7 0 0 1 16 9z" fill="#fff"/>
      <path d="M16 12.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7z" fill="#0052FF"/>
    </svg>
  );
}
function WalletConnectLogo() {
  return (
    <svg viewBox="0 0 32 32" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" fill="#3B99FC"/>
      <path d="M9.5 14c3.6-3.6 9.4-3.6 13 0l.43.43a.45.45 0 0 1 0 .64l-1.47 1.47a.23.23 0 0 1-.32 0l-.6-.6c-2.52-2.52-6.6-2.52-9.12 0l-.63.63a.23.23 0 0 1-.32 0L9 15.07a.45.45 0 0 1 0-.64zm16.1 3l1.31 1.31a.45.45 0 0 1 0 .64l-5.9 5.9a.45.45 0 0 1-.64 0l-4.18-4.18a.11.11 0 0 0-.16 0l-4.18 4.18a.45.45 0 0 1-.64 0l-5.9-5.9a.45.45 0 0 1 0-.64l1.31-1.31a.45.45 0 0 1 .64 0l4.18 4.18c.04.04.12.04.16 0l4.18-4.18a.45.45 0 0 1 .64 0l4.18 4.18c.04.04.12.04.16 0l4.18-4.18a.45.45 0 0 1 .64 0z" fill="#fff"/>
    </svg>
  );
}
function AztecLogo() {
  return (
    <svg viewBox="0 0 32 32" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 2L30 16L16 30L2 16Z" fill="#0a0a0a"/>
      <path d="M16 7L25 16L16 25L7 16Z" fill="white" opacity="0.85"/>
      <path d="M16 11L21 16L16 21L11 16Z" fill="#0a0a0a" opacity="0.7"/>
    </svg>
  );
}

const CHAIN_LOGOS = [
  { name: "Ethereum",      el: <EthereumLogo />,      href: "https://ethereum.org" },
  { name: "Polygon",       el: <PolygonLogo />,       href: "https://polygon.technology" },
  { name: "Arbitrum",      el: <ArbitrumLogo />,      href: "https://arbitrum.io" },
  { name: "Base",          el: <BaseLogo />,           href: "https://base.org" },
  { name: "WalletConnect", el: <WalletConnectLogo />, href: "https://walletconnect.com" },
  { name: "Aztec",         el: <AztecLogo />,         href: "https://aztec.network" },
];

// ── Nav clusters ──────────────────────────────────────────────────────────
const NAV_CLUSTERS = [
  {
    label: "Documentation",
    links: [
      { label: "Docs",      href: "/docs" },
      { label: "Developer", href: "/developer" },
      { label: "Legal",     href: "/legal" },
    ],
  },
  {
    label: "Platform",
    links: [
      { label: "Portfolio", href: "/portfolio" },
      { label: "Pricing",   href: "/pricing" },
    ],
  },
  {
    label: "Community",
    links: [
      { label: "Academy", href: "/academy" },
      { label: "Forum",   href: "/forum" },
    ],
  },
  {
    label: "Company",
    links: [
      { label: "Careers", href: "/careers" },
      { label: "News",    href: "/news" },
    ],
  },
];

// ── Main Component ─────────────────────────────────────────────────────────
export function SovereignFooter() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered]   = useState(false);
  const [isMobile, setIsMobile]     = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const cursorX = useSpring(0, { stiffness: 150, damping: 20 });
  const cursorY = useSpring(0, { stiffness: 150, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    cursorX.set(e.clientX - rect.left);
    cursorY.set(e.clientY - rect.top);
  };

  return (
    <footer className="relative w-full bg-[#060606] border-t border-white/5 flex flex-col items-center">

      {/* ═══ Wave Banner ═══════════════════════════════════════════════════ */}
      <div className="w-full relative" style={{ height: isMobile ? '260px' : '380px' }}>
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="absolute inset-0 overflow-hidden bg-transparent group"
        >
          {/* Wave image — natural scale, anchored to bottom */}
          <Image
            src="/olas-hokusai-4k.png"
            alt="Hokusai Waves"
            fill
            className="object-cover object-bottom pointer-events-none transition-transform duration-[1400ms] ease-out group-hover:scale-[1.015]"
            sizes="100vw"
            quality={90}
            priority
          />

          {/* Interactive cursor (desktop only) */}
          {!isMobile && (
            <>
              <motion.div
                className="pointer-events-none absolute rounded-full z-20"
                style={{
                  x: cursorX, y: cursorY,
                  translateX: "-50%", translateY: "-50%",
                  width: 160, height: 160,
                  opacity: isHovered ? 1 : 0,
                  background: "radial-gradient(circle, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0) 70%)",
                  mixBlendMode: "multiply",
                  transition: "opacity 0.3s",
                }}
              />
              <motion.div
                className="pointer-events-none absolute z-30 flex items-center justify-center"
                style={{
                  x: cursorX, y: cursorY,
                  translateX: "-50%", translateY: "-50%",
                  width: 20, height: 20,
                  opacity: isHovered ? 1 : 0,
                  border: "1px solid rgba(255,255,255,0.4)",
                  borderRadius: "50%",
                  transition: "opacity 0.3s",
                }}
                animate={{ scale: isHovered ? [1, 1.2, 1] : 1 }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </motion.div>
            </>
          )}

          {/* Gradient fade into the dark footer body below */}
          <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-[#060606] via-[#060606]/60 to-transparent pointer-events-none z-10" />
        </div>
      </div>

      {/* ═══ Footer Body ═══════════════════════════════════════════════════ */}
      <div className="relative z-20 w-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 pt-16 pb-16 flex flex-col gap-16">

        {/* ─── Brand + Social ─── */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-10">
          
          {/* Logo */}
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="flex flex-col items-center sm:items-start gap-4"
          >
            <img
              src="/official-whale-monochrome.png"
              alt="Whale Alert Network"
              className="w-16 h-16 object-contain"
            />
            <span className="font-mono text-[10px] font-black uppercase tracking-[0.35em] text-white/80 text-center sm:text-left">
              Whale Alert Network
            </span>
            <p className="font-mono text-[9px] text-white/40 tracking-wider max-w-[220px] text-center sm:text-left leading-relaxed">
              Professional on-chain intelligence &amp; identity layer.
            </p>
          </motion.div>

          {/* Socials */}
          <div className="flex items-center gap-4">
            {/* Telegram */}
            <a
              href="https://t.me/WhaleAlert"
              target="_blank"
              rel="noopener noreferrer"
              className="group w-10 h-10 rounded-full flex items-center justify-center transition-all bg-[#229ED9]/10 hover:bg-[#229ED9] border border-[#229ED9]/20"
              aria-label="Telegram"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0z" className="fill-[#229ED9] group-hover:fill-white/20"/>
                <path d="M5.491 11.74 17.094 7.24c.539-.194 1.01.131.835.951l-1.97 9.28c-.147.664-.537.825-1.087.513l-3.004-2.213-1.45 1.394c-.16.16-.295.295-.606.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L6.08 14.348l-2.951-.924c-.641-.2-.656-.641.136-.951z" className="fill-white"/>
              </svg>
            </a>

            {/* X */}
            <a
              href="https://x.com/WhaleAlert"
              target="_blank"
              rel="noopener noreferrer"
              className="group w-10 h-10 rounded-full flex items-center justify-center transition-all bg-black/5 hover:bg-black border border-black/10"
              aria-label="X / Twitter"
            >
              <svg viewBox="0 0 24 24" width="14" height="14">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.26 5.632L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" className="fill-black/60 group-hover:fill-white"/>
              </svg>
            </a>
          </div>
        </div>

        {/* ─── Nav Clusters ─── */}
        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-10">
          {NAV_CLUSTERS.map((cluster) => (
            <div key={cluster.label} className="flex flex-col gap-5">
              <span className="font-mono text-[8px] font-black uppercase tracking-[0.3em] text-white/30">
                {cluster.label}
              </span>
              <div className="flex flex-col gap-3">
                {cluster.links.map((l) => (
                  <FooterLink key={l.label} href={l.href}>
                    {l.label}
                  </FooterLink>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ─── Divider ─── */}
        <div className="w-full h-px bg-white/8" />

        {/* ─── Ecosystem Logos ─── */}
        <div className="flex flex-col gap-6">
          <span className="font-mono text-[8px] font-black uppercase tracking-[0.3em] text-white/30 text-center">
            Powered By · Integrated With
          </span>

          {/* Wallet logos row */}
          <div className="flex flex-wrap justify-center gap-5 sm:gap-8">
            {ECOSYSTEM_LOGOS.map((l) => (
              <a
                key={l.name}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                title={l.name}
                className="group flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-black/8 shadow-sm flex items-center justify-center p-2 group-hover:shadow-md transition-shadow">
                  <img src={l.src} alt={l.name} className="w-full h-full object-contain" />
                </div>
                <span className="font-mono text-[7px] uppercase tracking-[0.2em] text-black/40">{l.name}</span>
              </a>
            ))}

            {/* Chain / protocol logos */}
            {CHAIN_LOGOS.map((l) => (
              <a
                key={l.name}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                title={l.name}
                className="group flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-black/8 shadow-sm flex items-center justify-center p-1.5 group-hover:shadow-md transition-shadow">
                  {l.el}
                </div>
                <span className="font-mono text-[7px] uppercase tracking-[0.2em] text-black/40">{l.name}</span>
              </a>
            ))}
          </div>
        </div>

        {/* ─── Divider ─── */}
        <div className="w-full h-px bg-black/5" />

        {/* ─── Compliance Badges ─── */}
        <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16 pt-8 pb-4">

          {/* GDPR */}
          <div className="flex flex-col items-center justify-center opacity-80 hover:opacity-100 transition-opacity shrink-0">
             <div className="w-[100px] h-[100px] relative flex flex-col items-center justify-center bg-white/10 backdrop-blur-sm rounded-full">
               <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" fill="none">
                  {Array.from({ length: 12 }).map((_, i) => {
                    const angle = (i * 30 - 90) * (Math.PI / 180);
                    const cx = 50 + 40 * Math.cos(angle);
                    const cy = 50 + 40 * Math.sin(angle);
                    return (
                      <polygon key={i} points={`${cx},${cy-6} ${cx+2},${cy-2} ${cx+6},${cy-2} ${cx+3},${cy+1} ${cx+4},${cy+5} ${cx},${cy+3} ${cx-4},${cy+5} ${cx-3},${cy+1} ${cx-6},${cy-2} ${cx-2},${cy-2}`} fill="#C9A355" />
                    );
                  })}
                  {/* Padlock */}
                  <path d="M42 45V38C42 33.5817 45.5817 30 50 30C54.4183 30 58 33.5817 58 38V45H60C61.1046 45 62 45.8954 62 47V65C62 66.1046 61.1046 67 60 67H40C38.8954 67 38 66.1046 38 65V47C38 45.8954 38.8954 45 40 45H42ZM46 45H54V38C54 35.7909 52.2091 34 50 34C47.7909 34 46 35.7909 46 38V45ZM50 58C51.1046 58 52 57.1046 52 56C52 54.8954 51.1046 54 50 54C48.8954 54 48 54.8954 48 56C48 57.1046 48.8954 58 50 58Z" fill="#1C4B82"/>
               </svg>
               <span className="font-sans text-[14px] font-black tracking-widest text-[#1C4B82] absolute bottom-1">GDPR</span>
             </div>
          </div>

          {/* SOC 2 */}
          <div className="flex flex-col items-center justify-center opacity-80 hover:opacity-100 transition-opacity shrink-0">
            <div className="w-[100px] h-[100px] rounded-full border-[3.5px] border-[#2267A8] bg-white relative flex flex-col items-center justify-center shadow-sm overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1/2 flex flex-col items-center justify-end pb-[2px] bg-white z-10 border-b-[1.5px] border-[#2267A8]/20">
                <span className="text-[#2267A8] font-sans text-[12px] font-medium leading-none tracking-wide">AICPA</span>
                <span className="text-black font-sans text-[19px] font-black leading-none mt-1">SOC 2</span>
              </div>
              <div className="absolute bottom-0 inset-x-0 h-1/2 bg-black flex flex-col items-center justify-start pt-2 z-10">
                 <span className="text-white font-sans text-[6px] tracking-widest uppercase">Formerly SAS 70 Reports</span>
              </div>
              {/* Outer text arc */}
              <svg className="absolute inset-0 w-full h-full z-0" viewBox="0 0 100 100">
                <path id="soc2Arc" d="M 12 50 A 38 38 0 1 1 88 50" fill="none" />
                <text fontSize="5.5" fill="#2267A8" fontWeight="bold">
                  <textPath href="#soc2Arc" startOffset="50%" textAnchor="middle">AICPA Service Organization Control Reports</textPath>
                </text>
              </svg>
            </div>
          </div>

          {/* ISO 27001 */}
          <div className="flex flex-col items-center justify-center opacity-80 hover:opacity-100 transition-opacity shrink-0">
            <div className="w-[100px] h-[100px] rounded-full border-[3px] border-[#254585] bg-white relative flex items-center justify-center shadow-sm">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                <path id="isoArc" d="M 15 50 A 35 35 0 1 1 85 50" fill="none" />
                <text fontSize="5.5" fill="#254585" fontWeight="bold">
                  <textPath href="#isoArc" startOffset="50%" textAnchor="middle">Information Security Management System</textPath>
                </text>
              </svg>
              <div className="w-[66px] h-[66px] rounded-full bg-[#B2B5B8] flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
                 {/* Globe Grid */}
                 <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="48" fill="none" stroke="white" strokeWidth="2.5"/>
                    <ellipse cx="50" cy="50" rx="20" ry="48" fill="none" stroke="white" strokeWidth="2.5"/>
                    <ellipse cx="50" cy="50" rx="40" ry="48" fill="none" stroke="white" strokeWidth="2.5"/>
                    <line x1="2" y1="50" x2="98" y2="50" stroke="white" strokeWidth="2.5"/>
                    <line x1="12" y1="25" x2="88" y2="25" stroke="white" strokeWidth="2.5"/>
                    <line x1="12" y1="75" x2="88" y2="75" stroke="white" strokeWidth="2.5"/>
                 </svg>
                 <span className="text-white font-sans text-[20px] font-black leading-none z-10 tracking-tight text-shadow-sm">ISO</span>
                 <span className="text-[#254585] font-sans text-[13px] font-black leading-none z-10 bg-white px-1 mt-0.5 rounded-sm shadow-sm">27001</span>
              </div>
              <div className="absolute bottom-2 inset-x-0 flex justify-center z-20">
                  <span className="text-[#254585] font-sans text-[8px] font-bold tracking-widest bg-white px-1 shadow-sm rounded-sm">Certified</span>
              </div>
            </div>
          </div>

        </div>

        {/* ─── Copyright ─── */}
        <div className="flex flex-col items-center gap-2 pt-2">
          <span className="font-mono text-[8px] uppercase tracking-[0.25em] text-white/30 text-center">
            © 2026 Whale Alert Network. All rights reserved.
          </span>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 mt-1">
            {[["Privacy", "/privacy"], ["Terms", "/terms"], ["Cookies", "/legal"]].map(([l, h]) => (
              <a key={l} href={h} className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/30 hover:text-white/70 transition-colors">
                {l}
              </a>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
