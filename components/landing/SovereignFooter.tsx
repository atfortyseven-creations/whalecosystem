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
      className="group relative font-mono text-[10px] tracking-[0.2em] uppercase text-black/40 hover:text-black transition-colors duration-300"
    >
      {children}
      {/* underline on hover */}
      <span className="absolute -bottom-px left-0 w-0 group-hover:w-full h-px bg-black/60 transition-all duration-300" />
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
      <div className="w-full px-4 md:px-12 lg:px-16 mt-16 mb-4 relative z-10">
        <motion.div
           ref={containerRef as React.Ref<HTMLDivElement>}
           onMouseMove={handleMouseMove}
           onMouseEnter={() => setIsHovered(true)}
           onMouseLeave={() => setIsHovered(false)}
           className="relative w-full h-[200px] md:h-[320px] lg:h-[400px] rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-black/5 cursor-pointer flex items-center justify-center group transition-shadow duration-500 hover:shadow-[0_30px_70px_rgba(0,0,0,0.18)]"
           whileHover={{ scale: 1.005 }}
           whileTap={{ scale: 0.995 }}
        >
          {/* Wave Wallpaper 4K */}
          <Image
            src="/olas-hokusai-4k.png"
            alt="Hokusai Waves 4K"
            fill
            className="object-cover object-center pointer-events-none transition-transform duration-1000 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 90vw"
            quality={90}
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

          {/* Subtle Inner Shadow to make it look like a physical button */}
          <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.05)] rounded-[2rem] pointer-events-none" />
        </motion.div>
      </div>

      {/* ═══ Footer Body ═════════════════════════════════════════════ */}
      <div className="w-full bg-[#FDFCF8] relative z-0">
        <div className="max-w-[850px] mx-auto px-6 py-12 flex flex-col items-center gap-10">

          {/* ─── Whale Logo ─────────────────────────────────────────── */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            style={{ willChange: "transform" }}
            className="flex flex-col items-center gap-3"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/official-whale.png"
              alt="Whale Alert Network"
              width={56}
              height={56}
              style={{
                objectFit: "contain",
                filter: "grayscale(1)",
                opacity: 0.75,
              }}
            />
            <span
              style={{
                fontFamily: '"Inter", sans-serif',
                fontSize: "9px",
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                color: "rgba(10,10,10,0.3)",
              }}
            >
              Whale Alert Network
            </span>
          </motion.div>

          {/* ─── Navigation Links ─────────────────────────────────── */}
          <nav
            className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4"
            aria-label="Footer navigation"
          >
            <FooterLink href="/terms">Terms</FooterLink>
            <FooterLink href="/privacy">Privacy</FooterLink>
            <FooterLink href="/docs">Docs</FooterLink>
            <FooterLink href="/developer">Developer</FooterLink>
            <FooterLink href="/news">News Terminal</FooterLink>
          </nav>

          {/* ─── Horizontal Rule ──────────────────────────────────── */}
          <div
            style={{
              width: "100%",
              height: "1px",
              background: "linear-gradient(to right, transparent, rgba(10,10,10,0.12) 30%, rgba(10,10,10,0.12) 70%, transparent)",
            }}
          />

          {/* ─── Copyright ────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
            <span
              style={{
                fontFamily: '"Inter", monospace',
                fontSize: "9px",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(10,10,10,0.28)",
              }}
            >
              © 2026{" "}
              <a
                href="https://github.com/atfortyseven"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "rgba(10,10,10,0.45)" }}
                className="hover:text-black transition-colors duration-200"
              >
                atfortyseven-creations
              </a>
              {" "}— All rights reserved.
            </span>

          </div>
        </div>
      </div>
    </footer>
  );
}
