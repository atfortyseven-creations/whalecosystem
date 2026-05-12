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
        setViewportOffset(vv.offsetTop);
        
        // CRITICAL: Force window scroll to 0 to prevent browser from 
        // "helping" us by pushing the layout up when keyboard opens.
        if (vv.offsetTop > 0) {
            window.scrollTo(0, 0);
        }
      });
    };

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);

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
    backgroundColor: '#FAFAFA',
    zIndex: 1000,
  };

  return (
    <div style={containerStyle} className="text-[#050505]">
      {/* ── Top Navigation Bar ── */}
      <header className="shrink-0 h-14 flex items-center justify-between px-4 bg-white border-b border-black/8 z-10">
        <Link
          href="/"
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 text-black/40 transition-colors"
          aria-label="Back to home"
        >
          <ArrowLeft size={20} />
        </Link>

        <div className="flex items-center gap-2">
          {/* Central brand symbol could go here, or remain empty for maximum minimalism */}
        </div>

        <div className="w-10" />
      </header>

      {/* ── Chat Panel ── */}
      <div className="flex-1 min-h-0 overflow-hidden relative">
        <WhaleChat forceAutoInit={true} />
      </div>
    </div>
  );
}
