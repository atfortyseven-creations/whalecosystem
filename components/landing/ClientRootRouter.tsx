"use client";

import React from "react";
import { SovereignLanding } from "./SovereignLanding";
import { ImmersiveManifestoLanding } from "./ImmersiveManifestoLanding";
import { useSovereignAccount } from "@/hooks/useSovereignAccount";

export function ClientRootRouter() {
  const { isConnected } = useSovereignAccount();

  // If the user has authenticated with Web3, they immediately see
  // the immersive technical manifestation and lottie integration.
  if (isConnected) {
    return <ImmersiveManifestoLanding />;
  }

  // Otherwise, they see the un-authenticated public dark terminal to log in.
  return <SovereignLanding />;
}
