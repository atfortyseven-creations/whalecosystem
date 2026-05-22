"use client";

import { useEffect, useState } from "react";

/**
 * WavePatternOverlay  Dual Wallpaper System
 *
 * Layer 1  patron-cosmico-4k.png (top):
 *   Seamless abstract circular wave pattern as full-viewport texture.
 *   DPI-CORRECTED: tile size halved on 2x+ retina so physical pixels
 *   match the design intent  prevents the "zoomed/blurry" artifact on
 *   iPhone / Android at 2x3x device pixel ratio.
 *
 * Layer 2  olas-hokusai-4k.png (bottom):
 *   The Hokusai great wave anchored to the bottom of every page.
 *   DPI-CORRECTED: `cover` replaces `100% auto` so the wave fills at
 *   the correct aspect ratio on every screen size without stretching.
 *
 * RENDERING CONTRACT (both layers):
 *  - position: fixed           GPU compositor layer, never re-paints on scroll
 *  - translateZ(0)             own GPU layer
 *  - backfaceVisibility:hidden  prevents Safari layer-flip toggle
 *  - backgroundAttachment: scroll (NOT fixed!)  'fixed' inside fixed = iOS jank
 *  - NO blur() filter          #1 cause of iPad/iPhone scroll lag. Removed.
 *  - pointer-events: none      never blocks touch/scroll events
 */
export function WavePatternOverlay() {
  const [mounted, setMounted] = useState(false);
  const [dpr, setDpr]         = useState(1);

  useEffect(() => {
    setMounted(true);
    // Capture device pixel ratio once on mount  never changes during session
    setDpr(window.devicePixelRatio || 1);
  }, []);

  if (!mounted) return null;

  //  Layer 1 tile size 
  // At 1x: 280px CSS  280 physical px  (desktop standard)
  // At 2x: 140px CSS  280 physical px  (retina phones / MacBook Pro)
  // At 3x: 93px CSS   279 physical px  (iPhone Pro / Samsung Ultra)
  // This ensures the texture always renders at the SAME physical resolution
  // regardless of DPI, eliminating the "zoomed in" artifact on mobile.
  const TILE_BASE  = 280; // px at 1x
  const tileSize   = Math.round(TILE_BASE / Math.max(dpr, 1));

  // Institutional White constants
  const cosmicoOpacity = 0.05;
  const hokusaiOpacity = 0.12;

  return (
    <>
      {/*  Layer 1: Patron Cosmico  DPI-aware seamless tile  */}
      <div
        aria-hidden="true"
        style={{
          position:           "fixed",
          inset:              0,
          zIndex:             0,
          pointerEvents:      "none",
          transform:          "translateZ(0)",
          WebkitTransform:    "translateZ(0)",
          backfaceVisibility: "hidden",
          // 4K source at small tile  crisp at any DPI, never blurry
          backgroundImage:    "url('/patron-cosmico-4k.png')",
          backgroundRepeat:   "repeat",
          backgroundSize:     `${tileSize}px auto`,
          backgroundAttachment: "scroll",
          opacity:            cosmicoOpacity,
          mixBlendMode:       "multiply",
          // `crisp-edges` preserves texture sharpness; `auto` allows
          // browser upscaling  use `auto` here since source is 4K
          imageRendering:     "auto",
        }}
      />

      {/*  Layer 2: Olas Hokusai  bottom-anchored, DPI-corrected  */}
      <div
        aria-hidden="true"
        className="hokusai-strip"
        style={{
          position:        "fixed",
          left:            0,
          right:           0,
          bottom:          0,
          zIndex:          0,
          pointerEvents:   "none",
          transform:       "translateZ(0)",
          WebkitTransform: "translateZ(0)",
          backfaceVisibility: "hidden",
          // Height: tall enough to see the full crest on desktop,
          // smaller on mobile to avoid the "zoomed in" vertical crop.
          // clamp(min, preferred, max)
          height:          "clamp(80px, 18vh, 240px)",
          backgroundImage: "url('/olas-hokusai-4k.png')",
          backgroundRepeat:   "no-repeat",
          backgroundPosition: "bottom center",
          // KEY FIX: `cover` instead of `100% auto`
          // `100% auto` on a tall strip forces the image to scale vertically,
          // which zooms into the wave crest and loses the full Hokusai silhouette.
          // `cover` scales the image so its SHORTER dimension fits, preserving
          // the correct aspect ratio and showing the complete wave on all screens.
          backgroundSize:   "cover",
          backgroundAttachment: "scroll",
          opacity:          hokusaiOpacity,
          mixBlendMode:     "multiply",
          // Fade from solid at bottom to transparent at top
          maskImage:        "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0) 100%)",
          WebkitMaskImage:  "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0) 100%)",
        }}
      />
    </>
  );
}
