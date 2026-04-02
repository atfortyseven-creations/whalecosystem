"use client";

/**
 * ClientOverlays — thin "use client" wrapper so we can use dynamic({ ssr: false })
 * for decorative / utility components without polluting the Server Component layout.
 *
 * Rules:
 *  - This file MUST stay "use client"
 *  - No state, no hooks, just lazy-loaded overlays
 */

import dynamic from 'next/dynamic';

const AztecNoise      = dynamic(() => import("@/components/ui/AztecNoise").then(m => m.AztecNoise),           { ssr: false });
const ClientFortress  = dynamic(() => import("@/components/ui/ClientFortress").then(m => m.ClientFortress),   { ssr: false });
const OfflineDetector = dynamic(() => import("@/components/ui/OfflineScreen").then(m => m.OfflineDetector),  { ssr: false });

export function ClientOverlays() {
  return (
    <>
      <AztecNoise />
      <OfflineDetector />
      <ClientFortress />
    </>
  );
}
