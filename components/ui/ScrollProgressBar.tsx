"use client";

/**
 * ScrollProgressBar — Thin top-of-page progress indicator
 * Renders a 2px line that fills from left to right as the page scrolls.
 * CPU cost: zero after mount — runs entirely on scroll event + RAF.
 */

import { useEffect, useRef } from "react";

export function ScrollProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId: number;

    const update = () => {
      const bar = barRef.current;
      if (!bar) return;
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const max = el.scrollHeight - el.clientHeight;
      const pct = max > 0 ? (scrolled / max) * 100 : 0;
      bar.style.width = `${pct}%`;
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update(); // initial
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[999] pointer-events-none"
      style={{ height: "2px", background: "transparent" }}
    >
      <div
        ref={barRef}
        className="h-full hz-240"
        style={{
          width: "0%",
          background: "linear-gradient(90deg, #00F2EA, #00C4E0)",
          boxShadow: "0 0 8px rgba(0,242,234,0.6)",
          transition: "width 0.05s linear",
          transformOrigin: "left center",
        }}
      />
    </div>
  );
}
