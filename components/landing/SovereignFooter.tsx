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
      <div className="w-full px-4 md:px-12 lg:px-16 mt-6 md:mt-16 mb-0 relative z-10 font-sans">
        <motion.div
           ref={containerRef as React.Ref<HTMLDivElement>}
           onMouseMove={handleMouseMove}
           onMouseEnter={() => setIsHovered(true)}
           onMouseLeave={() => setIsHovered(false)}
           className="relative w-full h-[720px] sm:h-[650px] md:h-[700px] lg:h-[760px] rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-[#E5E5E5] flex flex-col items-center justify-end group transition-shadow duration-700 hover:shadow-[0_30px_70px_rgba(0,0,0,0.18)]"
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
                        background: 'radial-gradient(circle, rgba(0,102,255,0.25) 0%, rgba(0,102,255,0) 70%)',
                        mixBlendMode: 'multiply'
                    }}
                />
                
                <motion.div
                    className="pointer-events-none absolute w-5 h-5 border border-[#0066FF]/30 rounded-full z-30 flex items-center justify-center transition-opacity duration-300"
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
                    <div className="w-1.5 h-1.5 bg-[#0066FF] rounded-full shadow-[0_0_8px_#0066FF]" />
                </motion.div>
            </>
          )}

          {/* Fog gradient */}
          <div className="absolute inset-x-0 bottom-0 h-[65%] sm:h-[75%] bg-gradient-to-t from-[#FDFCF8] via-[#FDFCF8]/80 to-transparent pointer-events-none z-10" />

          {/* ═══ Footer Inner Body ═════════════════════════════════════════════ */}
          <div className="relative z-40 w-full max-w-[1000px] mx-auto px-6 pb-12 flex flex-col items-center gap-12">

            {/* ─── Whale Logo ─── */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="flex flex-col items-center gap-6"
            >
              <img
                src="/official-whale.png"
                alt="Whale Alert Network"
                className="w-24 h-24 sm:w-32 sm:h-32 object-contain grayscale opacity-80"
              />
              <span className="font-mono text-[11px] font-black uppercase tracking-[0.4em] text-black/80">
                Whale Alert Network
              </span>
            </motion.div>

            {/* ─── Social Connectivity ─── */}
            <div className="flex items-center gap-6">
              {/* Telegram — official paper-plane logo */}
              <a href="https://t.me/humanityledger" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-full flex items-center justify-center transition-all bg-[#0088cc]/10 group-hover:bg-[#0088cc]">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0z" className="fill-[#0088cc] group-hover:fill-white transition-colors"/>
                    <path d="M5.491 11.74 17.094 7.24c.539-.194 1.01.131.835.951l-1.97 9.28c-.147.664-.537.825-1.087.513l-3.004-2.213-1.45 1.394c-.16.16-.295.295-.606.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L6.08 14.348l-2.951-.924c-.641-.2-.656-.641.136-.951z" className="fill-white group-hover:fill-[#0088cc] transition-colors"/>
                  </svg>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-black/40 group-hover:text-[#0088cc] transition-colors">Telegram</span>
              </a>

              {/* X (Twitter) — official X logo */}
              <a href="https://x.com/whalecosystem" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-full flex items-center justify-center transition-all bg-black/5 group-hover:bg-black">
                  <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.26 5.632L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" className="fill-black/40 group-hover:fill-white transition-colors"/>
                  </svg>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-black/40 group-hover:text-black transition-colors">X (Twitter)</span>
              </a>
            </div>

            {/* ─── Clusters ─── */}
            <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8 pt-4">
              <div className="flex flex-col gap-6">
                <span className="font-mono text-[9px] font-black uppercase tracking-[0.25em] text-black/20">Legal / Dev</span>
                <div className="flex flex-col gap-3">
                  {LEGAL_LINKS.map(l => (
                    <FooterLink key={l.label} href={l.href}>{l.label}</FooterLink>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <span className="font-mono text-[9px] font-black uppercase tracking-[0.25em] text-black/20">Portfolio</span>
                <div className="flex flex-col gap-3">
                  {CORE_LINKS.map(l => (
                    <FooterLink key={l.label} href={l.href}>{l.label}</FooterLink>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <span className="font-mono text-[9px] font-black uppercase tracking-[0.25em] text-black/20">Community</span>
                <div className="flex flex-col gap-3">
                  {COMMUNITY_LINKS.map(l => (
                    <FooterLink key={l.label} href={l.href}>{l.label}</FooterLink>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <span className="font-mono text-[9px] font-black uppercase tracking-[0.25em] text-black/20">News & Careers</span>
                <div className="flex flex-col gap-3">
                  {INTEL_LINKS.map(l => (
                    <FooterLink key={l.label} href={l.href}>{l.label}</FooterLink>
                  ))}
                </div>
              </div>
            </div>

            {/* ─── Regulatory Suite ─── */}
            <div className="w-full h-px bg-black/5" />
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">

              {/* GDPR COMPLIANT — EU circle of stars */}
              <div className="flex items-center gap-2.5 opacity-50 hover:opacity-100 transition-opacity group cursor-default">
                <svg viewBox="0 0 44 44" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="22" cy="22" r="21" fill="#003399" stroke="#003399" strokeWidth="0"/>
                  {Array.from({length:12}).map((_,i)=>{
                    const angle=(i*30-90)*Math.PI/180;
                    const cx=22+14*Math.cos(angle);
                    const cy=22+14*Math.sin(angle);
                    return <polygon key={i} points="0,-3.5 0.8,-1.1 3.3,-1.1 1.3,0.7 2.1,3.1 0,1.5 -2.1,3.1 -1.3,0.7 -3.3,-1.1 -0.8,-1.1" fill="#FFCC00" transform={`translate(${cx},${cy})`}/>;
                  })}
                  <text x="22" y="26" textAnchor="middle" fill="white" fontFamily="Arial Black,sans-serif" fontWeight="900" fontSize="7.5">GDPR</text>
                </svg>
                <div className="flex flex-col gap-0">
                  <span className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-black/80">GDPR</span>
                  <span className="font-mono text-[7px] uppercase tracking-[0.15em] text-black/40">Compliant</span>
                </div>
              </div>

              {/* KYC/AML VERIFIED — Shield with fingerprint */}
              <div className="flex items-center gap-2.5 opacity-50 hover:opacity-100 transition-opacity group cursor-default">
                <svg viewBox="0 0 44 44" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 2 L38 8 L38 22 C38 31 30 39 22 42 C14 39 6 31 6 22 L6 8 Z" fill="#0044CC"/>
                  <path d="M22 2 L38 8 L38 22 C38 31 30 39 22 42 C14 39 6 31 6 22 L6 8 Z" fill="none" stroke="#0066FF" strokeWidth="1.5"/>
                  {/* fingerprint arcs */}
                  <path d="M22 28 C18 28 15 25 15 22 C15 19 18 16 22 16 C26 16 29 19 29 22" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M22 32 C15 32 10 27.5 10 22 C10 16.5 15.5 12 22 12 C28.5 12 34 16.5 34 22" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
                  <circle cx="22" cy="22" r="2.5" fill="white"/>
                  <path d="M19 22 C19 20.3 20.3 19 22 19 C23.7 19 25 20.3 25 22 C25 23.7 23.7 25 22 25" fill="none" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
                  <path d="M16 36 L28 36" stroke="#00C8FF" strokeWidth="1.5" strokeLinecap="round" opacity="0.8"/>
                </svg>
                <div className="flex flex-col gap-0">
                  <span className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-black/80">KYC/AML</span>
                  <span className="font-mono text-[7px] uppercase tracking-[0.15em] text-black/40">Verified</span>
                </div>
              </div>

              {/* MiCA REGULATED — EU flag with regulation label */}
              <div className="flex items-center gap-2.5 opacity-50 hover:opacity-100 transition-opacity group cursor-default">
                <svg viewBox="0 0 44 44" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
                  <rect width="44" height="44" rx="6" fill="#003399"/>
                  {Array.from({length:12}).map((_,i)=>{
                    const angle=(i*30-90)*Math.PI/180;
                    const cx=22+11*Math.cos(angle);
                    const cy=22+11*Math.sin(angle);
                    return <polygon key={i} points="0,-2.8 0.65,-0.9 2.7,-0.9 1.1,0.55 1.7,2.5 0,1.2 -1.7,2.5 -1.1,0.55 -2.7,-0.9 -0.65,-0.9" fill="#FFCC00" transform={`translate(${cx},${cy})`}/>;
                  })}
                  <text x="22" y="37" textAnchor="middle" fill="#FFCC00" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="5.5" letterSpacing="1">MiCA</text>
                </svg>
                <div className="flex flex-col gap-0">
                  <span className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-black/80">MiCA</span>
                  <span className="font-mono text-[7px] uppercase tracking-[0.15em] text-black/40">Regulated</span>
                </div>
              </div>

              {/* ISO 27001 — Globe seal */}
              <div className="flex items-center gap-2.5 opacity-50 hover:opacity-100 transition-opacity group cursor-default">
                <svg viewBox="0 0 44 44" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="22" cy="22" r="21" fill="none" stroke="#0055A4" strokeWidth="2"/>
                  <circle cx="22" cy="22" r="17" fill="#E8EEF7"/>
                  {/* globe grid lines */}
                  <ellipse cx="22" cy="22" rx="10" ry="17" fill="none" stroke="#0055A4" strokeWidth="1"/>
                  <ellipse cx="22" cy="22" rx="17" ry="8" fill="none" stroke="#0055A4" strokeWidth="1"/>
                  <line x1="5" y1="22" x2="39" y2="22" stroke="#0055A4" strokeWidth="1"/>
                  <line x1="22" y1="5" x2="22" y2="39" stroke="#0055A4" strokeWidth="1"/>
                  <text x="22" y="20" textAnchor="middle" fill="#0055A4" fontFamily="Arial Black,sans-serif" fontWeight="900" fontSize="8">ISO</text>
                  <text x="22" y="28" textAnchor="middle" fill="#0055A4" fontFamily="Arial Black,sans-serif" fontWeight="900" fontSize="7">27001</text>
                  {/* outer ring text arc simulation */}
                  <path id="arcTop" d="M 4,22 A 18,18 0 0,1 40,22" fill="none"/>
                  <text fontFamily="Arial,sans-serif" fontSize="4.5" fill="#0055A4" fontWeight="700" letterSpacing="0.5">
                    <textPath href="#arcTop" startOffset="10%">INFORMATION SECURITY</textPath>
                  </text>
                  <path id="arcBot" d="M 5,24 A 18,18 0 0,0 39,24" fill="none"/>
                  <text fontFamily="Arial,sans-serif" fontSize="4.5" fill="#0055A4" fontWeight="700" letterSpacing="1">
                    <textPath href="#arcBot" startOffset="22%">CERTIFIED</textPath>
                  </text>
                </svg>
                <div className="flex flex-col gap-0">
                  <span className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-black/80">ISO 27001</span>
                  <span className="font-mono text-[7px] uppercase tracking-[0.15em] text-black/40">Secure</span>
                </div>
              </div>

            </div>

            {/* ─── Copyright & Powered By ─── */}
            <div className="flex flex-col items-center gap-6 pt-4">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-black/30">
                © 2026 Whale Alert Network. Pure Mathematics.
              </span>
              
              <div className="flex flex-col items-center gap-3">
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
          
          {/* Subtle Inner Edge Highlight */}
          <div className="absolute inset-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.5),inset_0_0_40px_rgba(0,0,0,0.02)] rounded-[2.5rem] pointer-events-none z-50" />
        </motion.div>
      </div>
    </footer>
  );
}
