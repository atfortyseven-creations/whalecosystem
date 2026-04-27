"use client";

import React, { useEffect, useState } from "react";
import { ImmersiveManifestoLanding } from "./ImmersiveManifestoLanding";
import { AztecArchitectureSection } from "./AztecArchitectureSection";
import { SovereignFooter } from "./SovereignFooter";
import { useSovereignAccount } from "@/hooks/useSovereignAccount";
import Link from "next/link";

export function ClientRootRouter() {
  const { isConnected } = useSovereignAccount();
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const check = () => {
      const hasCookie = typeof document !== "undefined" &&
        (document.cookie.includes("sovereign_handshake=") ||
         document.cookie.includes("siwe_session="));
      
      if (isConnected || hasCookie) {
        setHasSession(true);
      } else {
        setHasSession(false);
      }
    };
    check();
    
    // Poll to catch any external cookie updates
    const interval = setInterval(check, 500);
    return () => clearInterval(interval);
  }, [isConnected]);

  return (
    <div className="flex flex-col w-full">

      {/* ── Session Navigation Bar ── */}
      {hasSession && (
        <div
          className="w-full border-b border-black/8"
          style={{ backgroundColor: "#FDFCF8" }}
        >
          <div className="max-w-[1750px] mx-auto px-6 sm:px-10 h-[44px] flex items-center justify-between">
            {/* Left — identity signal */}
            <div className="flex items-center gap-3">
              <span
                className="font-mono text-[8px] uppercase tracking-[0.35em]"
                style={{ color: "rgba(10,10,10,0.25)" }}
              >
                Authenticated
              </span>
            </div>

            {/* Right — navigation */}
            <nav className="flex items-center gap-8">
              <Link
                href="/dashboard"
                className="group relative font-mono text-[8px] uppercase tracking-[0.35em] transition-colors duration-300"
                style={{ color: "rgba(10,10,10,0.35)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "rgba(10,10,10,0.9)")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(10,10,10,0.35)")}
              >
                Dashboard
              </Link>
              <div
                className="w-px h-3"
                style={{ backgroundColor: "rgba(10,10,10,0.1)" }}
              />
              <Link
                href="/forum"
                className="font-mono text-[8px] uppercase tracking-[0.35em] transition-colors duration-300 flex items-center gap-2"
                style={{ color: "rgba(10,10,10,0.85)" }}
              >
                <span>Forum</span>
                <span
                  className="font-mono text-[8px]"
                  style={{ color: "rgba(10,10,10,0.3)" }}
                >
                  →
                </span>
              </Link>
            </nav>
          </div>
        </div>
      )}

      {/* ── Main Manifesto Landing ── */}
      <ImmersiveManifestoLanding />

      {/* ── Aztec Architecture Academic Section ── */}
      <AztecArchitectureSection />

      {/* ── Footer ── */}
      <SovereignFooter />
    </div>
  );
}
