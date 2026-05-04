"use client";

import React, { useEffect, useState } from "react";
import { ImmersiveManifestoLanding } from "./ImmersiveManifestoLanding";
import { AztecArchitectureSection } from "./AztecArchitectureSection";
import { SovereignFooter } from "./SovereignFooter";
import { useSovereignAccount } from "@/hooks/useSovereignAccount";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

const MENU_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard", description: "General portfolio overview and balances." },
  {
    label: "Analytics", href: "#",
    subItems: [
      { label: "Intelligence", description: "On-chain analytics and graphing.", href: "/dashboard?tab=graph" },
      { label: "Transaction History", description: "Complete history of all wallet actions.", href: "/dashboard?tab=inst-ledger" },
    ]
  },
  { label: "Global News", href: "/dashboard?tab=news", description: "Curated market and crypto news." },
  {
    label: "Assets", href: "#",
    subItems: [
      { label: "Cold Wallet", description: "Secure long-term asset storage.", href: "/dashboard?tab=vault" },
    ]
  },
  {
    label: "Ecosystem", href: "#",
    subItems: [
      { label: "Academy", description: "Educational courses and articles.", href: "/dashboard?tab=academy" },
      { label: "Developers", description: "API links and system architecture.", href: "/developer" },
      { label: "Support", description: "Help center and system status.", href: "/dashboard?tab=support" },
    ]
  },
  { label: "Forum", href: "/forum" },
  { label: "Pricing", href: "/pricing" },
  { label: "Careers", href: "/careers" }
];

function MegaMenuItem({ item }: { item: any }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative group h-full flex items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        href={item.href}
        className="font-mono text-[8px] uppercase tracking-[0.35em] transition-colors duration-300 flex items-center gap-2 py-2"
        style={{ color: "rgba(10,10,10,0.85)" }}
        onMouseEnter={e => (e.currentTarget.style.color = "rgba(10,10,10,1)")}
        onMouseLeave={e => (e.currentTarget.style.color = "rgba(10,10,10,0.85)")}
      >
        <span>{item.label}</span>
        {item.subItems && <span className="opacity-40 text-[7px] ml-[-4px]">▼</span>}
      </Link>
      
      <AnimatePresence>
        {isHovered && (item.subItems || item.description) && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className="absolute top-[100%] left-0 w-[280px] bg-white border border-black/10 shadow-2xl z-50 p-1 rounded-sm"
          >
            {item.subItems ? (
              <div className="flex flex-col">
                {item.subItems.map((sub: any, idx: number) => (
                  <Link key={idx} href={sub.href} className="flex flex-col p-3 hover:bg-black/5 transition-colors rounded-sm">
                    <span className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-[#050505]">{sub.label}</span>
                    <span className="font-sans text-[10px] text-[#555] leading-tight mt-1 opacity-80">{sub.description}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <Link href={item.href} className="block p-3 hover:bg-black/5 transition-colors rounded-sm">
                <span className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-[#050505] block mb-1">{item.label}</span>
                <span className="font-sans text-[10px] text-[#555] leading-tight opacity-80">{item.description}</span>
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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
            <nav className="flex items-center gap-5 relative z-[100]">
              {MENU_ITEMS.map((item, index) => (
                <React.Fragment key={index}>
                  <MegaMenuItem item={item} />
                  {index < MENU_ITEMS.length - 1 && (
                    <div
                      className="w-px h-3 shrink-0"
                      style={{ backgroundColor: "rgba(10,10,10,0.1)" }}
                    />
                  )}
                </React.Fragment>
              ))}
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
