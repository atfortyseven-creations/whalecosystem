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
import { ShieldCheck, Lock, Fingerprint, Activity } from "lucide-react";

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
            <div className="flex items-center gap-8">
              <a href="https://t.me/humanityledger" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center group-hover:bg-[#0088cc] transition-all">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="group-hover:text-white"><path d="M11.944 0C5.346 0 0 5.346 0 11.944c0 6.598 5.346 11.944 11.944 11.944 6.598 0 11.944-5.346 11.944-11.944C23.888 5.346 18.542 0 11.944 0zm5.206 16.561c-.19.19-.481.253-.741.16l-3.321-1.2c-.3-.11-.532-.361-.6-.67l-.76-3.411c-.07-.311.05-.631.3-.82l3.411-2.581c.311-.231.751-.12.91.241.16.361-.01.78-.381 1.05l-2.481 1.881.44 2.001 2.221.8c.371.13.561.541.431.91-.07.2-.23.35-.43.41z"/></svg>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-black/40 group-hover:text-black transition-colors">Telegram</span>
              </a>
              <a href="https://twitter.com/whalecosystem" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center group-hover:bg-[#1DA1F2] transition-all">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="group-hover:text-white"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-black/40 group-hover:text-black transition-colors">Twitter</span>
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
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-30 hover:opacity-60 transition-opacity">
               {[
                 { label: 'GDPR COMPLIANT', icon: ShieldCheck },
                 { label: 'KYC/AML VERIFIED', icon: Fingerprint },
                 { label: 'MICA REGULATED', icon: Lock },
                 { label: 'ISO 27001 SECURE', icon: Activity }
               ].map((reg) => (
                 <div key={reg.label} className="flex items-center gap-2.5">
                   <reg.icon size={14} className="text-black" />
                   <span className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-black">{reg.label}</span>
                 </div>
               ))}
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
