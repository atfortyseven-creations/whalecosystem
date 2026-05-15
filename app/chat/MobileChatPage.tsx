"use client";

import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { UniversalEliteWallpaper } from "@/components/shared/UniversalEliteWallpaper";

// SSR-unsafe — XMTP uses browser WASM
const WhaleChat = dynamic(
  () => import("@/components/dashboard/WhaleChat").then((m) => m.WhaleChat),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#9945FF] border-t-transparent animate-spin" />
          <p className="text-[10px] font-mono uppercase tracking-widest text-white/40">
            Loading Secure Channel…
          </p>
        </div>
      </div>
    ),
  }
);

export default function MobileChatPage() {
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  const [viewportOffset, setViewportOffset] = useState<number>(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // ── Body Scroll Lock ───────────────────────────────────────────────────
    // Prevent the entire page from bouncing or scrolling on mobile
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.body.style.overscrollBehavior = 'none';

    if (!window.visualViewport) return;

    const vv = window.visualViewport!;

    const update = () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setViewportHeight(vv.height);
        // We do NOT fight the browser with window.scrollTo(0,0) anymore.
        // We just let the visual viewport top dictate the fixed offset cleanly.
        setViewportOffset(vv.offsetTop);
      });
    };

    update();
    vv.addEventListener("resize", update, { passive: true });
    vv.addEventListener("scroll", update, { passive: true });

    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      
      // Cleanup body styles
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.body.style.overscrollBehavior = '';
      document.body.style.touchAction = '';
    };
  }, []);

  // Use fixed positioning to occupy exactly the visual viewport space.
  // This is the "Master" solution for mobile messaging apps in the browser.
  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    top: `${viewportOffset}px`,
    left: 0,
    right: 0,
    height: viewportHeight ? `${viewportHeight}px` : '100dvh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    backgroundColor: 'transparent',
    zIndex: 1000,
    touchAction: 'none', // Prevent bounce at container level
  };

  return (
    <>
      <UniversalEliteWallpaper />
      <div style={containerStyle} className="text-[#050505] dark:text-white">
        {/* ── Top Navigation Bar ── */}
        <header className="shrink-0 h-14 flex items-center justify-between px-5 bg-white/60 dark:bg-black/60 backdrop-blur-[60px] border-b border-black/5 dark:border-white/5 z-10">
          <Link
            href="/"
            className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-[#050505]/50 dark:text-white/50 transition-colors"
            aria-label="Back to home"
          >
            <ArrowLeft size={18} />
          </Link>

          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px] font-black uppercase tracking-[0.25em] text-[#050505] dark:text-white">Whale Chat</span>
          </div>

          <div className="w-9 flex items-center justify-center">
            <span className="font-mono text-[9px] font-black uppercase tracking-widest text-black/20 dark:text-white/20">P2P</span>
          </div>
        </header>

        {/* Chat fills the remainder transparently — wallpaper shows through */}
        <div className="flex-1 min-h-0 overflow-hidden relative">
          <WhaleChat forceAutoInit={false} />
        </div>
      </div>
    </>
  );
}
