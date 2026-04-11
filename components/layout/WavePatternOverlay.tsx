"use client";

import { useEffect, useState } from "react";

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
        transform: "translateZ(0)",
        willChange: "auto",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        backgroundImage: "url('/wave-pattern-bg.jpg')",
        backgroundRepeat: "repeat",
        backgroundSize: "auto",
        backgroundAttachment: "scroll",
        opacity: isLight ? 0.15 : 0.04,
        mixBlendMode: isLight ? "multiply" : "screen",
        filter: isLight ? "none" : "invert(1)",
      }}
    />
  );
}
