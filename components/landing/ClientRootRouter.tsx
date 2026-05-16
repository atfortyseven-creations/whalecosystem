"use client";

import React, { useEffect, useState } from "react";
import { ImmersiveManifestoLanding } from "./ImmersiveManifestoLanding";
import { AztecArchitectureSection } from "./AztecArchitectureSection";
import { SovereignFooter } from "./SovereignFooter";
import { useSovereignAccount } from "@/hooks/useSovereignAccount";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";



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
    <div className="flex flex-col w-full min-w-full flex-1 bg-[#F9F8F6]" style={{width:'100%',minWidth:'100%'}}>

      {/* Session Navigation Bar removed — Now handled by the Unified Master InstitutionalHeader */}

      {/* ── Main Manifesto Landing ── */}
      <ImmersiveManifestoLanding />

      {/* ── Footer ── */}
      <SovereignFooter />
    </div>
  );
}
