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
  const [mounted, setMounted] = useState(false);
 
  useEffect(() => {
    setMounted(true);
  }, []);
 
  if (!mounted) return null;
 
  // Institutional White constants
  const cosmicoOpacity = 0.05;
  const hokusaiOpacity = 0.12;

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
          WebkitTransform: "translateZ(0)",
          backgroundImage: "url('/api/checkpoint-image?name=patron-cosmico-4k.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "280px auto", // Balanced texture scale
          backgroundAttachment: "scroll",
          opacity: cosmicoOpacity,
          mixBlendMode: "multiply",
          imageRendering: "auto",
        }}
      />

      {/* ── Layer 2: Olas Hokusai — bottom-anchored wave strip ────────────── */}
      <div
        aria-hidden="true"
        className="hokusai-strip"
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          pointerEvents: "none",
          transform: "translateZ(0)",
          WebkitTransform: "translateZ(0)",
          // Responsive height that anchors the wave perfectly
          height: "clamp(100px, 15vh, 220px)",
          backgroundImage: "url('/api/assets?name=olas-hokusai-4k.png.png')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "bottom center",
          // 'Contain' logic ensures every pixel of the wave strip is seen without cropping/zoom on small screens
          backgroundSize: "100% auto", 
          backgroundAttachment: "scroll",
          opacity: hokusaiOpacity,
          mixBlendMode: "multiply",
          // Advanced masking for 'Inhuman' fluid connection
          maskImage: "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0) 100%)",
          WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0) 100%)",
        }}
      />
    </>
  );
}
