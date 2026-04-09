"use client";

import { useEffect, useState } from "react";

export function WavePatternOverlay() {
  // Only mount in light mode — detect the theme class on <html>
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const html = document.documentElement;

    const check = () => setIsLight(!html.classList.contains("dark"));
    check();

    // Watch for theme toggles
    const obs = new MutationObserver(check);
    obs.observe(html, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  if (!isLight) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        // ── Positioning ─────────────────────────────────────────────
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",

        // ── GPU compositor isolation ─────────────────────────────────
        transform: "translateZ(0)",
        willChange: "auto",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",

        // ── Native Image Tile (No Zoom) ──────────────────────────────
        backgroundImage: "url('/wave-pattern-bg.jpg')",
        backgroundRepeat: "repeat",
        backgroundSize: "auto",          // CRITICAL: auto ensures 1:1 pixel size (no zoom)
        backgroundAttachment: "scroll",

        // ── Visibility ───────────────────────────────────────────────
        opacity: 0.15,
        mixBlendMode: "multiply",        // invisible on dark, visible on cream
      }}
    />
  );
}
