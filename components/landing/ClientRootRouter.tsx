"use client";

import React, { useEffect, useState } from "react";
import { ImmersiveManifestoLanding } from "./ImmersiveManifestoLanding";
import { useSovereignAccount } from "@/hooks/useSovereignAccount";

export function ClientRootRouter() {
  const { isConnected } = useSovereignAccount();
  const [hasValidSession, setHasValidSession] = useState(false);

  // Once connected, verify the sovereign_handshake cookie exists.
  // We track this internally but do NOT navigate — the user is sovereign
  // and chooses their own destination via CTAs on the /connect page.
  useEffect(() => {
    if (isConnected) {
      const checkSiwe = setInterval(() => {
        if (
          typeof document !== "undefined" &&
          (document.cookie.includes("sovereign_handshake=") ||
            document.cookie.includes("siwe_session="))
        ) {
          clearInterval(checkSiwe);
          setHasValidSession(true);
        }
      }, 500);
      return () => clearInterval(checkSiwe);
    }
  }, [isConnected]);

  // The Immersive Manifesto is the universal public face of the platform.
  return <ImmersiveManifestoLanding />;
}
