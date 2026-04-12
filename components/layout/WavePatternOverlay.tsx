"use client";

import { useEffect, useState } from "react";

/**
 * WavePatternOverlay — Dual Wallpaper System
 *
 * Layer 1 — patron-cosmico-4k.png (top):
 *   Seamless abstract circular wave pattern as full-viewport texture.
 *   Fixed, GPU compositor layer, zero scroll re-paint.
 *   Dark: inverted subtle screen blend. Light: ink multiply.
 *
 * Layer 2 — olas-hokusai-4k.png (bottom):
 *   The Hokusai great wave anchored to the bottom of every page.
 *   Width: 100%, height: auto. Covers the entire bottom edge.
 *   Very low opacity — purely decorative, never competing with content.
 *
 * RENDERING CONTRACT (both layers):
 *  - position: fixed          → GPU compositor layer, never re-paints on scroll
 *  - translateZ(0)            → own GPU layer
 *  - backfaceVisibility:hidden → prevents Safari layer-flip toggle
 *  - backgroundAttachment: scroll (NOT fixed!) → 'fixed' inside fixed = iOS jank
 *  - NO blur() filter         → #1 cause of iPad/iPhone scroll lag. Removed.
 *  - pointer-events: none     → never blocks touch/scroll events
 */
export function WavePatternOverlay() {
  const [isLight, setIsLight] = useState(false);
  const [mounted, setMounted] = useState(false);
 
  useEffect(() => {
    setMounted(true);
    const html = document.documentElement;
    const check = () => setIsLight(!html.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(html, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
 
  if (!mounted) return null;
 
  const cosmicoOpacity = isLight ? 0.065 : 0.028;
  const hokusaiOpacity = isLight ? 0.10 : 0.055;

  return (
    <>
      {/* ── Layer 1: Patron Cosmico — seamless tiled texture ──────────────── */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden" as any,
          backgroundImage: "url('/patron-cosmico-4k.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "260px auto",
          backgroundAttachment: "scroll",
          opacity: cosmicoOpacity,
          mixBlendMode: (isLight ? "multiply" : "screen") as any,
          filter: isLight ? "none" : "invert(1) hue-rotate(180deg)",
          imageRendering: "auto",
        }}
      />

      {/* ── Layer 2: Olas Hokusai — bottom-anchored wave strip ────────────── */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          pointerEvents: "none",
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden" as any,
          height: "clamp(120px, 18vw, 280px)",
          backgroundImage: "url('/olas-hokusai-4k.png')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "bottom center",
          backgroundSize: "100% auto",
          backgroundAttachment: "scroll",
          opacity: hokusaiOpacity,
          mixBlendMode: (isLight ? "multiply" : "screen") as any,
          filter: isLight ? "none" : "invert(1) hue-rotate(200deg)",
          // Subtle fade toward the top of the strip to blend into content
          maskImage: "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0) 100%)",
          WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0) 100%)",
        }}
      />
    </>
  );
}
