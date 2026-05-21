"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

function FooterLink({ href, children, external = false }: { href: string; children: React.ReactNode; external?: boolean }) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="group relative font-sans text-[12px] font-medium text-[#050505]/60 hover:text-black transition-colors duration-300 py-2 whitespace-nowrap block"
    >
      {children}
    </Link>
  );
}

const MEGA_CLUSTERS = [
  {
    label: "Protocol",
    links: [
      { label: "Security Architecture", href: "/developer/security" },
      { label: "Mempool Analysis", href: "/developer/mempool" },
      { label: "Anomaly Detection", href: "/developer/anomalies" },
      { label: "Edge Computing", href: "/developer/edge" },
    ]
  },
  {
    label: "Identity & Auth",
    links: [
      { label: "Mobile Authentication", href: "/developer/mobile-auth" },
      { label: "Biometric Verification", href: "/developer/biometrics" },
      { label: "Session Management", href: "/developer/sessions" },
      { label: "Digital Signatures", href: "/developer/signatures" },
    ]
  },
  {
    label: "Storage & Data",
    links: [
      { label: "Transaction Routing", href: "/developer/routing" },
      { label: "Graph Database", href: "/developer/graph" },
      { label: "Transient Storage", href: "/developer/storage" },
      { label: "Block Analysis", href: "/developer/blocks" },
    ]
  },
  {
    label: "Network Layer",
    links: [
      { label: "WebSocket API", href: "/developer/websockets" },
      { label: "Secure Communication", href: "/developer/secure-comm" },
      { label: "Distributed Caching", href: "/developer/caching" },
      { label: "System Fallbacks", href: "/developer/fallbacks" },
    ]
  },
  {
    label: "Integrations",
    links: [
      { label: "WorldID Protocol", href: "/developer/worldid" },
      { label: "Cloudflare Workers", href: "/developer/cloudflare" },
      { label: "Railway Hosting", href: "/developer/railway" },
      { label: "EVM Compatibility", href: "/developer/evm" },
    ]
  },
  {
    label: "Legal & Ethics",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Data Independence", href: "/developer/independence" },
      { label: "User Rights", href: "/developer/user-rights" },
      { label: "Terms of Service", href: "/legal" },
    ]
  }
];

export function SovereignFooter() {
  const containerRef = useRef<HTMLElement>(null);
  const [dots, setDots] = useState<{id: number, x: number, y: number}[]>([]);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newDots = Array.from({ length: 3 }, (_, i) => ({
      id: Date.now() + i,
      x: x + (Math.random() - 0.5) * 20,
      y: y + (Math.random() - 0.5) * 20,
    }));
    setDots(prev => [...prev, ...newDots]);
    const timer = setTimeout(() => {
      const ids = new Set(newDots.map(d => d.id));
      setDots(prev => prev.filter(d => !ids.has(d.id)));
    }, 500);
    timeoutsRef.current.push(timer);
  };

  return (
    <footer
        ref={containerRef}
        onClick={handleClick}
        className="relative w-full bg-white border-t border-black/5 flex flex-col items-center overflow-hidden selection:bg-black selection:text-white group/footer"
    >
      <AnimatePresence>
        {dots.map((dot) => (
          <motion.div
            key={dot.id}
            style={{
              position: 'absolute',
              left: dot.x - 2,
              top: dot.y - 2,
              pointerEvents: 'none',
              zIndex: 50,
            }}
            initial={{ opacity: 1, scale: 0 }}
            animate={{ opacity: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div
              style={{
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: '#000000',
              }}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="relative z-20 w-full max-w-[1200px] mx-auto px-8 md:px-16 pt-24 pb-16 flex flex-col gap-16">
        
        {/* Header Branding Row */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-10">
          <div className="flex flex-col items-center sm:items-start gap-5">
            <div className="flex items-center gap-4">
                <div className="w-8 h-8 flex items-center justify-center shrink-0">
                    <img 
                        src="/official-whale-monochrome.png" 
                        alt="Whale Alert Network Logo" 
                        className="object-contain w-full h-full" 
                    />
                </div>
                <div className="flex flex-col leading-none text-[#050505] justify-center">
                    <span className="font-mono text-[14px] font-black uppercase tracking-[0.25em] leading-none">
                        Scanner Humanity Ledger
                    </span>
                </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <a href="https://t.me/WhaleAlert" target="_blank" rel="noopener noreferrer" className="font-mono text-[10px] font-black uppercase tracking-widest text-[#050505]/40 hover:text-black transition-colors">
              Transmission
            </a>
            <a href="https://x.com/WhaleAlert" target="_blank" rel="noopener noreferrer" className="font-mono text-[10px] font-black uppercase tracking-widest text-[#050505]/40 hover:text-black transition-colors">
              X Network
            </a>
          </div>
        </div>

        <div className="w-full h-px bg-black/5" />

        {/* Categories Grid */}
        <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-y-16 gap-x-8">
          {MEGA_CLUSTERS.map((cluster) => (
            <div key={cluster.label} className="flex flex-col gap-6">
              <span className="font-mono text-[10px] font-black uppercase tracking-[0.25em] text-[#050505]/40 border-b border-black/5 pb-4">
                {cluster.label}
              </span>
              <div className="flex flex-col gap-2">
                {cluster.links.map((l) => (
                  <FooterLink key={l.label} href={l.href}>
                    {l.label}
                  </FooterLink>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="w-full h-px bg-black/5" />

        {/* Copyright */}
        <div className="flex flex-col items-center gap-4 pt-8 pb-6">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-[#050505]/40 text-center">
            © 2026 Humanity Ledger · The Architecture of Reality
          </span>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 mt-2">
            {["Immutable", "Decentralized", "Absolute"].map((l) => (
              <span key={l} className="font-mono text-[9px] font-black uppercase tracking-[0.3em] text-[#050505]/30 cursor-crosshair hover:text-black transition-colors">
                {l}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
