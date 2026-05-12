"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * DownheadCursor
 * ─────────────────
 * Click-activated cursor spotlight effect.
 * - Triggers ONLY on click (mousedown) — never on hover.
 * - 30% smaller than the original (67px spotlight vs 96px).
 * - Fades out automatically after 550ms.
 * - Uses mix-blend-difference for the white-on-light "inverted glow" look.
 */
interface ClickRipple {
  id: number;
  x: number;
  y: number;
}

export const DownheadCursor = ({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) => {
  const [ripples, setRipples] = useState<ClickRipple[]>([]);
  const nextId = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = nextId.current++;

      setRipples(prev => [...prev, { id, x, y }]);

      // Auto-remove after animation completes (550ms)
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== id));
      }, 550);
    };

    container.addEventListener("mousedown", handleClick);
    return () => container.removeEventListener("mousedown", handleClick);
  }, [containerRef]);

  return (
    <>
      {ripples.map(({ id, x, y }) => (
        <div
          key={id}
          className="pointer-events-none absolute z-50 mix-blend-difference"
          style={{
            left: x,
            top: y,
            transform: "translate(-50%, -50%)",
          }}
        >
          {/* Spotlight — 67px (30% smaller than original 96px) */}
          <div
            className="w-[67px] h-[67px] bg-white rounded-full opacity-0"
            style={{
              filter: "blur(18px)",
              animation: "downhead-burst 550ms ease-out forwards",
            }}
          />

          {/* Rotating cross — proportionally scaled */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ animation: "downhead-spin 550ms linear forwards" }}
          >
            <div className="w-px h-14 bg-gradient-to-t from-transparent via-white/60 to-transparent rotate-45" />
            <div className="w-px h-14 bg-gradient-to-t from-transparent via-white/60 to-transparent -rotate-45" />
          </div>

          {/* Central core dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_white]" />
          </div>
        </div>
      ))}

      {/* Keyframe injector */}
      <style>{`
        @keyframes downhead-burst {
          0%   { opacity: 0;    transform: scale(0.3); }
          25%  { opacity: 0.45; transform: scale(1);   }
          70%  { opacity: 0.30; transform: scale(1.1); }
          100% { opacity: 0;    transform: scale(1.2); }
        }
        @keyframes downhead-spin {
          0%   { opacity: 0;   transform: rotate(0deg)   scale(0.4); }
          20%  { opacity: 0.6; transform: rotate(45deg)  scale(1);   }
          100% { opacity: 0;   transform: rotate(180deg) scale(0.8); }
        }
      `}</style>
    </>
  );
};
