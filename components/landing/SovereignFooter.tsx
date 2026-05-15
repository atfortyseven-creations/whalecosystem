"use client";

/**
 * SovereignFooter
 * ═══════════════════════════════════════════════════════════════
 * Editorial-grade footer for the ImmersiveManifestoLanding.
 *
 * Design spec:
 *   • Immersive 4K Hokusai wave acting as an interactive button/banner.
 *   • Protruding box with 2rem border radius and heavy shadows.
 *   • Custom 50% smaller blue tracking cursor inside the banner.
 *   • Minimalist text layout reflecting pure institutional aesthetics.
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, useSpring } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

// Internal link component
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
      className="group relative font-mono text-[9px] sm:text-[11px] tracking-[0.2em] uppercase text-black/60 hover:text-black transition-colors duration-300 py-2 px-1 whitespace-nowrap"
    >
      {children}
      {/* underline on hover */}
      <span className="absolute bottom-0 left-0 w-0 md:group-hover:w-full h-[1.5px] bg-black/80 transition-all duration-300" />
    </Link>
  );
}

export function SovereignFooter() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  // Framer Motion Springs for smooth cursor tracking
  const cursorX = useSpring(0, { stiffness: 150, damping: 20 });
  const cursorY = useSpring(0, { stiffness: 150, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    cursorX.set(e.clientX - rect.left);
    cursorY.set(e.clientY - rect.top);
  };

  const LEGAL_LINKS = [
    { label: 'Terms', href: '/terms' },
    { label: 'Privacy', href: '/privacy' },
    { label: 'Docs', href: '/docs' },
    { label: 'Developer', href: '/developer' },
  ];

  const CORE_LINKS = [
    { label: 'Portfolio', href: '/portfolio' },
  ];

  const COMMUNITY_LINKS = [
    { label: 'Forum', href: '/forum' },
    { label: 'Academy', href: '/academy' },
  ];

  const INTEL_LINKS = [
    { label: 'News', href: '/news' },
    { label: 'Careers', href: '/careers' },
  ];

  return (
    <footer
      className="relative w-full overflow-hidden bg-[#FDFCF8] flex flex-col items-center pb-0"
      style={{ marginTop: "0", paddingTop: 0 }}
    >
      {/* ═══ 4K Wave Banner (Interactive Protruding Button) ═══ */}
      <div className="w-full mt-0 relative z-10 font-sans border-t border-black/10">
        <div
           ref={containerRef as React.Ref<HTMLDivElement>}
           onMouseMove={handleMouseMove}
           onMouseEnter={() => setIsHovered(true)}
           onMouseLeave={() => setIsHovered(false)}
           className="relative w-full h-[auto] min-h-[500px] md:min-h-[600px] overflow-hidden bg-white flex flex-col items-center justify-end group"
        >
          {/* Wave Wallpaper 4K */}
          <Image
            src="/olas-hokusai-4k.png"
            alt="Hokusai Waves 4K"
            fill
            className="object-cover object-center sm:object-bottom opacity-100 pointer-events-none transition-transform duration-1000 group-hover:scale-[1.02]"
            sizes="100vw"
            quality={100}
            unoptimized
            priority
          />

          {/* Interactive Blue Cursor */}
          {!isMobile && (
            <>
                <motion.div
                    className="pointer-events-none absolute w-48 h-48 rounded-full z-20 opacity-0 transition-opacity duration-300"
                    style={{
                        x: cursorX,
                        y: cursorY,
                        translateX: '-50%',
                        translateY: '-50%',
                        opacity: isHovered ? 1 : 0,
                        background: 'radial-gradient(circle, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0) 70%)',
                        mixBlendMode: 'multiply'
                    }}
                />
                
                <motion.div
                    className="pointer-events-none absolute w-5 h-5 border border-black/30 rounded-full z-30 flex items-center justify-center transition-opacity duration-300"
                    style={{
                        x: cursorX,
                        y: cursorY,
                        translateX: '-50%',
                        translateY: '-50%',
                        opacity: isHovered ? 1 : 0,
                    }}
                    animate={{ scale: isHovered ? [1, 1.2, 1] : 1 }}
                    transition={{ repeat: Infinity, duration: 2 }}
                >
                    <div className="w-1.5 h-1.5 bg-black rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" />
                </motion.div>
            </>
          )}

          {/* Fog gradient */}
          <div className="absolute inset-x-0 bottom-0 h-[80%] bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none z-10" />

          {/* ═══ Footer Inner Body ═════════════════════════════════════════════ */}
          <div className="relative z-40 w-full max-w-[2560px] mx-auto px-6 md:px-12 lg:px-20 pb-12 pt-20 flex flex-col items-start gap-12 text-left">

            {/* ─── HumanID Logo ─── */}
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="flex flex-col items-start gap-6"
            >
              <img
                src="/official-whale-monochrome.png"
                alt="Whale Alert Network"
                className="w-24 h-24 sm:w-32 sm:h-32 object-contain"
              />
              <span className="font-mono text-[11px] font-black uppercase tracking-[0.4em] text-black/80">
                Whale Alert Network
              </span>
            </motion.div>

            {/* ─── Social Connectivity ─── */}
            <div className="flex items-center gap-6">
              {/* Telegram — official paper-plane logo */}
              <a href="https://t.me/WhaleAlert" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-full flex items-center justify-center transition-all bg-black/5 group-hover:bg-black">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0z" className="fill-black/20 group-hover:fill-white transition-colors"/>
                    <path d="M5.491 11.74 17.094 7.24c.539-.194 1.01.131.835.951l-1.97 9.28c-.147.664-.537.825-1.087.513l-3.004-2.213-1.45 1.394c-.16.16-.295.295-.606.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L6.08 14.348l-2.951-.924c-.641-.2-.656-.641.136-.951z" className="fill-white group-hover:fill-black transition-colors"/>
                  </svg>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-black/40 group-hover:text-black transition-colors">Telegram</span>
              </a>

              {/* X (Twitter) — official X logo */}
              <a href="https://x.com/WhaleAlert" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-full flex items-center justify-center transition-all bg-black/5 group-hover:bg-black">
                  <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.26 5.632L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" className="fill-black/40 group-hover:fill-white transition-colors"/>
                  </svg>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-black/40 group-hover:text-black transition-colors">X / Network</span>
              </a>
            </div>

            {/* ─── Clusters ─── */}
            <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8 pt-4">
              <div className="flex flex-col gap-6">
                <span className="font-mono text-[9px] font-black uppercase tracking-[0.25em] text-black/20">Network</span>
                <div className="flex flex-col gap-3">
                  {LEGAL_LINKS.map(l => (
                    <FooterLink key={l.label} href={l.href} external={true}>{l.label}</FooterLink>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <span className="font-mono text-[9px] font-black uppercase tracking-[0.25em] text-black/20">Platform</span>
                <div className="flex flex-col gap-3">
                  {CORE_LINKS.map(l => (
                    <FooterLink key={l.label} href={l.href} external={true}>{l.label}</FooterLink>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <span className="font-mono text-[9px] font-black uppercase tracking-[0.25em] text-black/20">Academy</span>
                <div className="flex flex-col gap-3">
                  {COMMUNITY_LINKS.map(l => (
                    <FooterLink key={l.label} href={l.href} external={true}>{l.label}</FooterLink>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <span className="font-mono text-[9px] font-black uppercase tracking-[0.25em] text-black/20">Careers</span>
                <div className="flex flex-col gap-3">
                  {INTEL_LINKS.map(l => (
                    <FooterLink key={l.label} href={l.href} external={true}>{l.label}</FooterLink>
                  ))}
                </div>
              </div>
            </div>

            {/* ─── Regulatory Suite ─── */}
            <div className="w-full h-px bg-black/5" />
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">

              {/* GDPR COMPLIANT — EU Stars Badge */}
              <div className="flex items-center gap-3 opacity-55 hover:opacity-100 transition-opacity cursor-default">
                <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center shrink-0">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    {/* 12 EU stars in circle */}
                    {Array.from({length:12}).map((_,i) => {
                      const angle = (i * 30 - 90) * (Math.PI / 180);
                      const cx = 11 + 7.5 * Math.cos(angle);
                      const cy = 11 + 7.5 * Math.sin(angle);
                      return <circle key={i} cx={cx} cy={cy} r="1.2" fill="#333333" />;
                    })}
                  </svg>
                </div>
                <div className="flex flex-col gap-0">
                  <span className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-black/80">GDPR</span>
                  <span className="font-mono text-[7px] uppercase tracking-[0.15em] text-black/40">Compliant</span>
                </div>
              </div>

              {/* KYC/AML VERIFIED — Shield Eye Badge */}
              <div className="flex items-center gap-3 opacity-55 hover:opacity-100 transition-opacity cursor-default">
                <div className="w-10 h-10 rounded-[10px] bg-black/10 flex items-center justify-center shrink-0">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L4 5v6c0 5.25 3.5 10.15 8 11.35C16.5 21.15 20 16.25 20 11V5L12 2Z" fill="#333333" fillOpacity="0.15" stroke="#333333" strokeWidth="1.5"/>
                    <circle cx="12" cy="12" r="3" fill="#333333"/>
                    <ellipse cx="12" cy="12" rx="6" ry="3.5" stroke="#333333" strokeWidth="1.2" fill="none"/>
                  </svg>
                </div>
                <div className="flex flex-col gap-0">
                  <span className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-black/80">KYC/AML</span>
                  <span className="font-mono text-[7px] uppercase tracking-[0.15em] text-black/40">Verified</span>
                </div>
              </div>

              {/* MiCA REGULATED — EU Stars Square Badge */}
              <div className="flex items-center gap-3 opacity-55 hover:opacity-100 transition-opacity cursor-default">
                <div className="w-10 h-10 rounded-[10px] bg-black/10 flex items-center justify-center shrink-0">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    {Array.from({length:12}).map((_,i) => {
                      const angle = (i * 30 - 90) * (Math.PI / 180);
                      const cx = 11 + 7.5 * Math.cos(angle);
                      const cy = 11 + 7.5 * Math.sin(angle);
                      return <circle key={i} cx={cx} cy={cy} r="1.2" fill="#333333" />;
                    })}
                  </svg>
                </div>
                <div className="flex flex-col gap-0">
                  <span className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-black/80">MICA</span>
                  <span className="font-mono text-[7px] uppercase tracking-[0.15em] text-black/40">Regulated</span>
                </div>
              </div>

              {/* ISO 27001 — Globe Grid Badge */}
              <div className="flex items-center gap-3 opacity-55 hover:opacity-100 transition-opacity cursor-default">
                <div className="w-10 h-10 rounded-full border-2 border-black/20 bg-white flex items-center justify-center shrink-0">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="#333333" strokeWidth="1.5" fill="none"/>
                    <ellipse cx="12" cy="12" rx="4.5" ry="9" stroke="#333333" strokeWidth="1.2" fill="none"/>
                    <line x1="3" y1="9" x2="21" y2="9" stroke="#333333" strokeWidth="1.2"/>
                    <line x1="3" y1="15" x2="21" y2="15" stroke="#333333" strokeWidth="1.2"/>
                    <text x="12" y="14" textAnchor="middle" fontSize="4" fontWeight="900" fill="#333333">ISO</text>
                  </svg>
                </div>
                <div className="flex flex-col gap-0">
                  <span className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-black/80">ISO 27001</span>
                  <span className="font-mono text-[7px] uppercase tracking-[0.15em] text-black/40">Secure</span>
                </div>
              </div>

            </div>

            {/* ─── Copyright & Powered By ─── */}
            <div className="flex flex-col items-start gap-6 pt-4">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-black/30">
                © 2026 Whale Alert Network. Pure Mathematics.
              </span>
              
              <div className="flex flex-col items-start gap-3">
                <span className="font-mono text-[9px] font-bold uppercase tracking-[0.35em] text-black/40">Powered by</span>
                <a href="https://aztec.network" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 opacity-60 hover:opacity-100 transition-all">
                  <svg width="20" height="20" viewBox="0 0 32 32" fill="none" className="group-hover:scale-110 transition-transform">
                    <path d="M16 2L30 16L16 30L2 16Z" fill="black" fillOpacity="0.85"/>
                    <path d="M16 7L25 16L16 25L7 16Z" fill="white" fillOpacity="0.9"/>
                    <path d="M16 11L21 16L16 21L11 16Z" fill="black" fillOpacity="0.75"/>
                  </svg>
                  <span className="font-sans text-[12px] font-black uppercase tracking-[0.22em] text-black">Aztec</span>
                </a>
              </div>
            </div>

          </div>
          
          {/* Removed inner edge highlight */}
        </div>
      </div>
    </footer>
  );
}
