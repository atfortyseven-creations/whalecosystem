"use client";

import React, { useEffect, useState } from "react";
import { ImmersiveManifestoLanding } from "./ImmersiveManifestoLanding";
import { DownheadSection } from "./DownheadSection";
import { SovereignFooter } from "./SovereignFooter";
import { useSovereignAccount } from "@/hooks/useSovereignAccount";
import Link from "next/link";

export function ClientRootRouter() {
  const { isConnected } = useSovereignAccount();
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    // Check for sovereign session cookie synchronously
    const check = () => {
      if (
        typeof document !== "undefined" &&
        (document.cookie.includes("sovereign_handshake=") ||
          document.cookie.includes("siwe_session="))
      ) {
        setHasSession(true);
      }
    };
    check();
    if (isConnected) {
      const interval = setInterval(() => { check(); }, 500);
      return () => clearInterval(interval);
    }
  }, [isConnected]);

  return (
    <div className="flex flex-col w-full">
      {/* ── Authenticated Session Banner ── */}
      {hasSession && (
        <div className="w-full bg-[#050505] border-b border-white/5 px-8 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00f2ea] animate-pulse" />
            <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-white/40">
              SOVEREIGN SESSION ACTIVE
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/manifesto"
              className="text-[9px] font-mono uppercase tracking-[0.25em] text-white/30 hover:text-white transition-colors"
            >
              DASHBOARD
            </Link>
            <Link
              href="/forum"
              className="text-[9px] font-mono uppercase tracking-[0.25em] text-[#00f2ea] hover:text-white transition-colors"
            >
              FORUM →
            </Link>
          </div>
        </div>
      )}

      {/* ── Main Manifesto Landing ── */}
      <ImmersiveManifestoLanding />

      {/* ── Downhead Architecture Section ── */}
      <DownheadSection />

      {/* ── Footer ── */}
      <SovereignFooter />
    </div>
  );
}
