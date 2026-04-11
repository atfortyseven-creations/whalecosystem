"use client";

import { useEffect, useState } from "react";

/**
 * WavePatternOverlay — patron-cosmico-4k.png
 *
 * RENDERING CONTRACT:
 * - position: fixed           → stays on GPU compositor layer, never re-paints on scroll
 * - translateZ(0)             → forces own GPU layer (no shared layer blending)
 * - backfaceVisibility:hidden → prevents Safari from toggling paint on layer flip
 * - backgroundAttachment: scroll (NOT fixed!) → 'fixed' inside a fixed element causes
 *   iOS Safari remaps to 'scroll' anyway + causes massive composite invalidations.
 *   Using 'scroll' on a fixed element = same visual result, zero jank.
 * - will-change: auto         → do NOT set will-change:transform — it would force
 *   re-compositing EVERY frame even when nothing changes.
 * - NO blur() filter          → blur on a fixed element forces rasterize + composite
 *   every frame (60 * blurPasses * pixels) = #1 cause of iPad lag. Removed entirely.
 * - pointer-events: none      → never blocks touch / scroll events
 */
export function WavePatternOverlay() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const check = () => setIsLight(!html.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(html, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        // GPU compositor layer — own layer, never invalidated by scroll
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        // NO will-change — avoids unnecessary rasterize cycles
        // patron-cosmico-4k.png served via /api/checkpoint-image CDN route
        backgroundImage: "url('/api/checkpoint-image?name=patron-cosmico-4k.png')",
        backgroundRepeat: "repeat",
        backgroundSize: "280px auto",
        // 'scroll' on a fixed div = correct visual on ALL platforms, zero jank
        backgroundAttachment: "scroll",
        // Light mode: visible subtle ink texture
        // Dark mode: inverted to white, screen blend, very faint
        opacity: isLight ? 0.072 : 0.035,
        mixBlendMode: isLight ? "multiply" : "screen",
        filter: isLight ? "none" : "invert(1) hue-rotate(180deg)",
        // Pixel-perfect rendering at all DPR scales
        imageRendering: "auto",
      }}
    />
  );
}
