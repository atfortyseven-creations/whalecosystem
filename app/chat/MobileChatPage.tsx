"use client";

import dynamic from "next/dynamic";
import { ArrowLeft, Shield, Lock } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// SSR-unsafe — XMTP uses browser WASM
const WhaleChat = dynamic(
  () => import("@/components/dashboard/WhaleChat").then((m) => m.WhaleChat),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#9945FF] border-t-transparent animate-spin" />
          <p className="text-[10px] font-mono uppercase tracking-widest text-black/40">
            Loading Secure Channel…
          </p>
        </div>
      </div>
    ),
  }
);

export default function MobileChatPage() {
  // ── visualViewport keyboard fix ──────────────────────────────────────────
  // On iOS Safari, 100dvh does NOT shrink when the software keyboard opens.
  // The keyboard overlaps the input bar from below. Fix: track the real
  // visible height via window.visualViewport and apply it as an inline style.
  // This prevents the layout from reflowing / scrolling erratically.
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;

    const vv = window.visualViewport!;

    const update = () => {
      // Cancel any pending RAF to batch updates
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setViewportHeight(vv.height);
      });
    };

    update(); // initial
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);

    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const containerStyle: React.CSSProperties = viewportHeight
    ? { height: `${viewportHeight}px`, overflow: "hidden" }
    : { height: "100dvh", overflow: "hidden" };

  return (
    <div
      className="flex flex-col bg-[#FAFAFA] text-[#050505]"
      style={containerStyle}
    >
      {/* ── Top Navigation Bar ── */}
      <header className="shrink-0 h-14 flex items-center justify-between px-4 bg-white border-b border-black/8 z-10">
        <Link
          href="/"
          className="flex items-center gap-2 text-black/50 hover:text-black transition-colors"
          aria-label="Back to home"
        >
          <ArrowLeft size={18} />
          <span className="text-[11px] font-bold uppercase tracking-widest">Back</span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Shield size={16} strokeWidth={1.5} className="text-[#9945FF]" />
            <Lock
              size={8}
              className="absolute -bottom-0.5 -right-1 text-[#050505] bg-white rounded-full p-[1px]"
            />
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest text-[#050505]">
            Whale Chat
          </span>
        </div>

        {/* Spacer to keep title centered */}
        <div className="w-[60px]" />
      </header>

      {/* ── Chat Panel (fills remaining height, no overflow) ── */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {/* forceAutoInit disabled: prevents automatic initialization failures on mobile.
            Users can read the protocol explanation and activate manually. */}
        <WhaleChat />
      </div>
    </div>
  );
}
