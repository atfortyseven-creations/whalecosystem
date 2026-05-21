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
    
    // Run immediately on mount
    check();
    
    // [ANDROID PERF FIX] Replace 500ms setInterval with event-driven checks.
    // A continuous 500ms poll on the landing page consumes unnecessary CPU/battery
    // on Android Chrome and causes laggy animations. Replace with:
    // 1. visibilitychange: fires when user returns from wallet app (Android back gesture)
    // 2. A single 1.5s delayed check to catch the immediate post-auth cookie write
    // 3. storage event: fires when wagmi writes to localStorage after reconnection
    const onVisibility = () => { if (document.visibilityState === 'visible') check(); };
    const onStorage = () => check();
    
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('storage', onStorage);
    
    // Single delayed check: catches cookies set within 1.5s of mount (post-redirect auth)
    const delayedCheck = setTimeout(check, 1500);
    
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('storage', onStorage);
      clearTimeout(delayedCheck);
    };
  }, [isConnected]);

  return (
    <div className="flex flex-col w-full min-w-full flex-1 bg-white" style={{width:'100%',minWidth:'100%'}}>

      {/* Session Navigation Bar removed — Now handled by the Unified Master InstitutionalHeader */}

      {/* ── Main Manifesto Landing ── */}
      <ImmersiveManifestoLanding />

      {/* ── Footer ── */}
      <SovereignFooter />
    </div>
  );
}
