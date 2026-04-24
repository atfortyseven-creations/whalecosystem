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
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="group relative font-mono text-[9px] sm:text-[11px] tracking-[0.2em] uppercase text-black/60 hover:text-black transition-colors duration-300 py-2 px-1 whitespace-nowrap"
    >
      {children}
      {/* underline on hover */}
      <span className="absolute bottom-0 left-0 w-0 md:group-hover:w-full h-[1.5px] bg-black/80 transition-all duration-300" />
    </a>
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

  return (
    <footer
      className="relative w-full overflow-hidden bg-[#FDFCF8] flex flex-col items-center pb-0"
      style={{ marginTop: "0", paddingTop: 0 }}
    >
      {/* ═══ 4K Wave Banner (Interactive Protruding Button) ═══ */}
      <div className="w-full px-4 md:px-12 lg:px-16 mt-32 mb-12 relative z-10 font-sans">
        <motion.div
           ref={containerRef as React.Ref<HTMLDivElement>}
           onMouseMove={handleMouseMove}
           onMouseEnter={() => setIsHovered(true)}
           onMouseLeave={() => setIsHovered(false)}
           className="relative w-full h-[350px] md:h-[450px] lg:h-[550px] rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-[#E5E5E5] flex flex-col items-center justify-end group transition-shadow duration-700 hover:shadow-[0_30px_70px_rgba(0,0,0,0.18)]"
        >
          {/* Wave Wallpaper 4K */}
          <Image
            src="/olas-hokusai-4k.png"
            alt="Hokusai Waves 4K"
            fill
            className="object-cover object-bottom opacity-100 pointer-events-none transition-transform duration-1000 group-hover:scale-[1.02]"
            sizes="100vw"
            quality={100}
            unoptimized
            priority
          />

          {/* Interactive Blue Cursor (50% smaller than previous purple) */}
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

          {/* Fog gradient to ensure readability of text over waves at the bottom */}
          <div className="absolute inset-x-0 bottom-0 h-[60%] sm:h-[75%] bg-gradient-to-t from-[#FDFCF8] via-[#FDFCF8]/70 to-transparent pointer-events-none z-10" />

          {/* ═══ Footer Inner Body ═════════════════════════════════════════════ */}
          <div className="relative z-40 w-full max-w-[850px] mx-auto px-6 pb-12 flex flex-col items-center gap-8">

            {/* ─── Whale Logo (Enlarged & Unsquished) ─────────────────────────────────────────── */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              style={{ willChange: "transform" }}
              className="flex flex-col items-center gap-6 mb-4"
            >
              <img
                src="/official-whale.png"
                alt="Whale Alert Network"
                className="w-28 h-28 sm:w-36 sm:h-36 object-contain"
                style={{
                  filter: "grayscale(1) contrast(1.2)",
                  opacity: 0.9,
                }}
              />
              <span
                style={{
                  fontFamily: '"Inter", sans-serif',
                  fontSize: "11px",
                  letterSpacing: "0.4em",
                  textTransform: "uppercase",
                  color: "rgba(10,10,10,0.8)",
                  fontWeight: "900"
                }}
              >
                Whale Alert Network
              </span>
            </motion.div>

            {/* ─── Navigation Links (Glassmorphism Pill) ─────────────────────────────────── */}
            <div className="relative z-50 w-full max-w-lg mx-auto">
              <nav
                className="flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-12 gap-y-3 px-4 sm:px-8 py-4 sm:py-4 rounded-3xl sm:rounded-full bg-white/40 backdrop-blur-md border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                aria-label="Footer navigation"
              >
                <FooterLink href="/terms">Terms</FooterLink>
                <FooterLink href="/privacy">Privacy</FooterLink>
                <FooterLink href="/docs">Docs</FooterLink>
                <FooterLink href="/developer">Developer</FooterLink>
                <FooterLink href="/news">News Terminal</FooterLink>
                <FooterLink href="/forum">Forum</FooterLink>
              </nav>
            </div>

            {/* ─── Horizontal Rule ──────────────────────────────────── */}
            <div
              style={{
                width: "60%",
                height: "1px",
                background: "linear-gradient(to right, transparent, rgba(10,10,10,0.15) 50%, transparent)",
              }}
              className="my-1"
            />

            {/* ─── Copyright ────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center z-50 relative">
              <span
                style={{
                  fontFamily: '"Inter", monospace',
                  fontSize: "9px",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "rgba(10,10,10,0.45)",
                }}
              >
                © 2026{" "}
                <a
                  href="https://github.com/atfortyseven"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "rgba(10,10,10,0.7)", fontWeight: "bold" }}
                  className="hover:text-black hover:bg-black/5 px-2 py-1 rounded transition-colors duration-200"
                >
                  atfortyseven-creations
                </a>
                {" "}— All rights reserved.
              </span>
            </div>

            {/* ─── Powered By Aztec ─────────────────────────────────── */}
            <div className="flex flex-col items-center gap-2.5 pt-4 pb-2 z-[99] relative">
              <span
                style={{
                  fontFamily: '"Inter", monospace',
                  fontSize: "9px",
                  letterSpacing: "0.35em",
                  textTransform: "uppercase",
                  color: "rgba(10,10,10,0.6)",
                  fontWeight: "bold"
                }}
              >
                Powered by
              </span>
              <a
                href="https://aztec.network"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2.5 opacity-80 hover:opacity-100 transition-all duration-500 cursor-pointer"
                aria-label="Built on Aztec Network"
              >
                {/* Aztec geometric diamond mark */}
                <svg
                  width="18" height="18"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="group-hover:scale-110 transition-transform duration-300"
                >
                  <path d="M16 2L30 16L16 30L2 16Z" fill="#0A0A0A" fillOpacity="0.85"/>
                  <path d="M16 7L25 16L16 25L7 16Z" fill="white" fillOpacity="0.9"/>
                  <path d="M16 11L21 16L16 21L11 16Z" fill="#0A0A0A" fillOpacity="0.75"/>
                </svg>
                <span
                  style={{
                    fontFamily: '"Inter", sans-serif',
                    fontSize: "11px",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    fontWeight: "900",
                    color: "rgba(10,10,10,0.85)",
                  }}
                >
                  Aztec
                </span>
              </a>
            </div>

          </div>
          
          {/* Subtle Inner Edge Highlight */}
          <div className="absolute inset-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.5),inset_0_0_40px_rgba(0,0,0,0.02)] rounded-[2.5rem] pointer-events-none z-50" />
        </motion.div>
      </div>
    </footer>
  );
}
