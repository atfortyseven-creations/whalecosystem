"use client";

/**
 * SovereignFooter
 * ═══════════════════════════════════════════════════════════════
 * Editorial-grade footer for the ImmersiveManifestoLanding.
 *
 * Design spec:
 *   • Wave background — three GPU-composited SVG wave layers
 *     animated at different speeds (18s / 24s / 30s), uses the
 *     crema-to-black gradient matching the landing palette.
 *   • Whale logo — /official-whale.png, centered, with gentle
 *     float animation.
 *   • Navigation pills — Terms · Privacy · Developer · Docs
 *   • Copyright — © 2026 atfortyseven-creations
 *   • Strictly white/crema/black palette — no color accents.
 *   • GPU contract: transform + opacity only. No filter changes.
 */

import React from "react";
import { motion } from "framer-motion";

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

// Wave SVG path — two offsetted versions for seamless tiling
const WAVE_PATH =
  "M0,80 C180,120 360,20 540,60 C720,100 900,140 1080,80 C1260,20 1440,100 1440,80 L1440,160 L0,160 Z";
const WAVE_PATH_2 =
  "M0,100 C150,60 320,140 480,90 C640,40 800,120 960,85 C1120,50 1300,130 1440,100 L1440,160 L0,160 Z";
const WAVE_PATH_3 =
  "M0,60 C200,110 400,30 600,70 C800,110 1000,50 1200,90 C1350,115 1420,80 1440,75 L1440,160 L0,160 Z";

export function SovereignFooter() {
  return (
    <footer
      className="relative w-full overflow-hidden"
      style={{ marginTop: "0", paddingTop: 0 }}
    >
      {/* ═══ Wave Band ═══════════════════════════════════════════════
          Three offset SVG wave layers at different animation speeds.
          Each is 200% wide and translates from 0% to -50% for seamless loop.
          All use crema tones to match the landing background (#FDFCF8).
      ══════════════════════════════════════════════════════════════ */}
      <div
        className="relative w-full overflow-hidden leading-[0]"
        style={{ height: "180px" }}
        aria-hidden="true"
      >
        {/* Layer 1 — slowest, most opaque */}
        <motion.svg
          className="absolute top-0 left-0 h-full"
          style={{ width: "200%", transform: "translateZ(0)" }}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 160"
          preserveAspectRatio="none"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
        >
          <path fill="rgba(10,10,10,0.06)" d={WAVE_PATH} />
          <path fill="rgba(10,10,10,0.06)" d={WAVE_PATH} transform="translate(1440,0)" />
        </motion.svg>

        {/* Layer 2 — medium speed */}
        <motion.svg
          className="absolute top-0 left-0 h-full"
          style={{ width: "200%", transform: "translateZ(0)" }}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 160"
          preserveAspectRatio="none"
          animate={{ x: ["-50%", "0%"] }}
          transition={{ repeat: Infinity, duration: 24, ease: "linear" }}
        >
          <path fill="rgba(10,10,10,0.05)" d={WAVE_PATH_2} />
          <path fill="rgba(10,10,10,0.05)" d={WAVE_PATH_2} transform="translate(1440,0)" />
        </motion.svg>

        {/* Layer 3 — fastest, subtlest */}
        <motion.svg
          className="absolute top-0 left-0 h-full"
          style={{ width: "200%", transform: "translateZ(0)" }}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 160"
          preserveAspectRatio="none"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
        >
          <path fill="rgba(10,10,10,0.04)" d={WAVE_PATH_3} />
          <path fill="rgba(10,10,10,0.04)" d={WAVE_PATH_3} transform="translate(1440,0)" />
        </motion.svg>

        {/* Gradient fill below the waves — matches body bg */}
        <div
          className="absolute bottom-0 left-0 w-full"
          style={{
            height: "80px",
            background: "linear-gradient(to bottom, transparent, #FDFCF8)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* ═══ Footer Body ═════════════════════════════════════════════ */}
      <div
        className="w-full bg-[#FDFCF8]"
        style={{ borderTop: "1px solid rgba(10,10,10,0.08)" }}
      >
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
