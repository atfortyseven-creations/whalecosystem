"use client";

import React from 'react';
import { ArrowRight, Book, Terminal, Code, Cpu, Shield, Zap, Layers, Database } from 'lucide-react';
import Link from 'next/link';

export default function DocsLanding() {
  const cards = [
    {
      title: 'Structural Guides',
      desc: 'Institutional protocols for orchestrating node-based topologies within the Whale Alert Matrix.',
      href: '/docs/intro',
      links: [
        { label: 'Introduction to the Network', href: '/docs/intro' },
        { label: 'Initialization Guide', href: '/docs/quickstart' },
        { label: 'Core Epistemology', href: '/docs/core-concepts' },
      ]
    },
    {
      title: 'Telemetry Reference',
      desc: 'High-frequency data access via REST and WebSocket architectures for institutional analysts.',
      href: '/docs/api/usage',
      links: [
        { label: 'Authentication Protocols', href: '/docs/api/reference/tokens' },
        { label: 'Agent Connectivity', href: '/docs/api/reference/agents' },
        { label: 'Deterministic Signal Models', href: '/docs/api/reference/models' },
      ]
    },
    {
      title: 'Whale SDK',
      desc: 'The official toolkit for programmable surveillance and kinetic capital flow analysis.',
      href: '/docs/whale-code/overview',
      links: [
        { label: 'SDK Methodology', href: '/docs/whale-code/sdk/quickstart' },
        { label: 'Hooks & System Skills', href: '/docs/whale-code/skills' },
        { label: 'Computational Patterns', href: '/docs/whale-code/subagents' },
      ]
    }
  ];

  return (
    <div className="space-y-32">
      {/* Hero Section */}
      <section className="space-y-12">
        <div style={{ color: "#D4AF37", borderLeft: "1px solid rgba(212, 175, 55, 0.4)" }} className="pl-6 mb-8 uppercase font-mono text-[10px] tracking-[0.4em] opacity-80">
          Official Repository
        </div>
        <h1 style={{ color: "#F5F5F5", fontFamily: "'Space Grotesk', sans-serif" }} className="text-5xl md:text-7xl font-light tracking-tight leading-[1.05] uppercase">
          Whale Alert Network <br/> <span style={{ color: "#8A94A6" }}>Technical Documentation.</span>
        </h1>
        <p style={{ color: "#8A94A6" }} className="text-base md:text-lg max-w-2xl leading-relaxed font-light italic">
          Ensuring the integrity of institutional-grade data ingestion and sovereign node management through a 
          rigorous, academically-driven technical framework.
        </p>
      </section>

      {/* Grid Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 border-t border-white/5 pt-12">
        {cards.map((card, idx) => (
          <div key={card.title} style={{ borderLeft: idx > 0 ? "1px solid rgba(255, 255, 255, 0.05)" : "none" }} className="group p-8 md:p-12 flex flex-col justify-between min-h-[420px]">
             <div className="space-y-8">
                <h2 style={{ color: "#F5F5F5" }} className="text-xl font-light uppercase tracking-tight">{card.title}</h2>
                <p style={{ color: "#545F73" }} className="text-[12px] leading-relaxed font-light uppercase tracking-widest">
                  {card.desc}
                </p>
                <div className="flex flex-col gap-4">
                  {card.links.map(link => (
                    <Link 
                      key={link.label}
                      href={link.href}
                      style={{ color: "#8A94A6" }}
                      className="text-[11px] font-mono hover:text-[#D4AF37] flex items-center gap-2 transition-colors uppercase tracking-[0.2em]"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
             </div>
             
             <Link 
               href={card.href}
               style={{ border: "1px solid rgba(255, 255, 255, 0.1)", color: "#F5F5F5" }}
               className="mt-12 inline-flex items-center justify-center py-4 text-[10px] uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all"
             >
               Explore Section
             </Link>
          </div>
        ))}
      </div>

      {/* Featured Architecture Section */}
      <section className="py-24 border-t border-white/5">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
              <div className="space-y-10">
                  <div style={{ color: "#D4AF37" }} className="text-[10px] font-mono uppercase tracking-[0.4em] opacity-60">System Core Architecture</div>
                  <h3 style={{ color: "#F5F5F5" }} className="text-4xl font-light uppercase tracking-tight leading-none">
                    Financial Event <br/> <span style={{ color: "#8A94A6" }}>Normalization.</span>
                  </h3>
                  <p style={{ color: "#8A94A6" }} className="text-sm leading-relaxed font-light italic">
                    All telemetry is processed through a strict normalization layer, converting raw EVM and L1 state shifts into a 
                    verifiable, deterministic graph. Our Zero-Trust handshake ensures that analysis resides locally 
                    while maintaining synchronization with global protocol status.
                  </p>
                  <Link href="/docs/core-concepts" style={{ color: "#EAEAEA" }} className="inline-flex items-center gap-4 text-[10px] font-medium hover:text-[#D4AF37] transition-all uppercase tracking-[0.4em]">
                    View Protocol Specifications ———
                  </Link>
              </div>
              <div className="grid grid-cols-2 gap-px bg-white/5 border border-white/5">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-square bg-[#020202] flex items-center justify-center group overflow-hidden">
                       <div style={{ borderColor: i % 2 === 0 ? "#D4AF37" : "rgba(255,255,255,0.05)" }} 
                            className="w-10 h-10 border rotate-45 transition-transform group-hover:scale-125 duration-1000" />
                    </div>
                  ))}
              </div>
          </div>
      </section>

      {/* Technical Footer */}
      <div className="pt-24 border-t border-white/5 flex flex-col items-center">
        <Database size={24} style={{ color: "#D4AF37" }} strokeWidth={1} className="mb-8 opacity-40" />
        <p style={{ color: "#545F73" }} className="text-[10px] font-mono uppercase tracking-[0.2em] mb-4">
          END OF REPOSITORY INDEX · DOCUMENTATION V2.1.0
        </p>
      </div>
    </div>
  );
}
