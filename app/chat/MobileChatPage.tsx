"use client";

import dynamic from "next/dynamic";
import { ArrowLeft, Shield, Lock } from "lucide-react";
import Link from "next/link";

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
  return (
    <div
      className="flex flex-col bg-[#FAFAFA] text-[#050505]"
      style={{ height: "100dvh", overflow: "hidden" }}
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

      {/* ── Chat Panel (fills remaining height) ── */}
      <div className="flex-1 overflow-hidden">
        {/* forceAutoInit=true: overrides mobile guard so XMTP auto-connects on /chat */}
        <WhaleChat forceAutoInit />
      </div>
    </div>
  );
}
