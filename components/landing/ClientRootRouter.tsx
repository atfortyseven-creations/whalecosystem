"use client";

import React, { useEffect, useState } from "react";
import { SovereignLanding } from "./SovereignLanding";
import { ImmersiveManifestoLanding } from "./ImmersiveManifestoLanding";
import { useSovereignAccount } from "@/hooks/useSovereignAccount";
import { useRouter } from "next/navigation";

export function ClientRootRouter() {
  const { isConnected } = useSovereignAccount();
  const router = useRouter();
  const [hasValidSession, setHasValidSession] = useState(false);

  useEffect(() => {
     if (isConnected) {
        // Only redirect if they've completed the handshake (AppKit SIWE success)
        const checkSiwe = setInterval(() => {
           if (typeof document !== 'undefined' && 
               (document.cookie.includes('sovereign_handshake=') || document.cookie.includes('siwe_session='))
           ) {
               clearInterval(checkSiwe);
               setHasValidSession(true);
               router.push('/dashboard');
           }
        }, 500);
        return () => clearInterval(checkSiwe);
     }
  }, [isConnected, router]);

  // If the user has authenticated with Web3 but is waiting for redirection
  if (isConnected || hasValidSession) {
    return <ImmersiveManifestoLanding />;
  }

  // Otherwise, they see the un-authenticated public dark terminal to log in.
  return <SovereignLanding />;
}
