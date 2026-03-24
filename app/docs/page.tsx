"use client";

import React from 'react';
import { ArrowRight, Book, Terminal, Code, Cpu, Shield, Zap, Layers } from 'lucide-react';
import Link from 'next/link';

export default function DocsLanding() {
  const cards = [
    {
      title: 'Guides',
      desc: 'Institutional protocols for orchestrating sovereign agent networks on the Whale Alert Protocol.',
      href: '/docs/get-started',
      links: [
        { label: 'Intro to Whale Alert', href: '/docs/intro' },
        { label: 'Quickstart Guide', href: '/docs/quickstart' },
        { label: 'Core Concepts', href: '/docs/core-concepts' },
      ]
    },
    {
      title: 'API Reference',
      desc: 'High-frequency telemetry access for Whale Alert REST and WebSocket architectures.',
      href: '/docs/api/usage',
      links: [
        { label: 'Authentication', href: '/docs/api/reference/tokens' },
        { label: 'Agent Endpoints', href: '/docs/api/reference/agents' },
        { label: 'Protocol Models', href: '/docs/api/reference/models' },
      ]
    },
    {
      title: 'Whale Code',
      desc: 'Proprietary DSL for programmable data surveillance and kinetic flow analysis.',
      href: '/docs/whale-code/overview',
      links: [
        { label: 'Whale Code SDK', href: '/docs/whale-code/sdk/quickstart' },
        { label: 'Hooks & Skills', href: '/docs/whale-code/skills' },
        { label: 'Execution Patterns', href: '/docs/whale-code/subagents' },
      ]
    }
  ];

  return (
    <div className="space-y-32 animate-in fade-in duration-1000">
      {/* Hero Section */}
      <section className="space-y-12">
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] uppercase font-web3">
          Whale Alert <br/> Corporation™ <br/> <span className="opacity-20">Repository</span>
        </h1>
        <p className="text-xl text-black/40 dark:text-white/40 max-w-2xl leading-relaxed uppercase tracking-tight font-black">
          THE OFFICIAL TECHNICAL REPOSITORY FOR INSTITUTIONAL-GRADE DATA SURVEILLANCE AND SOVEREIGN AGENT ORCHESTRATION.
        </p>
      </section>

      {/* Grid Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-black/10 dark:bg-white/10 border border-black/10 dark:border-white/10">
        {cards.map((card) => (
          <div key={card.title} className="group p-12 bg-white dark:bg-black transition-all hover:bg-zinc-50 dark:hover:bg-zinc-950 flex flex-col justify-between min-h-[400px]">
             <div className="space-y-8">
                <h2 className="text-2xl font-black uppercase tracking-tighter font-web3 border-b border-black/5 dark:border-white/10 pb-4">{card.title}</h2>
                <p className="text-xs text-black/40 dark:text-white/40 leading-relaxed uppercase tracking-widest font-black">
                  {card.desc}
                </p>
                <div className="flex flex-col gap-3">
                  {card.links.map(link => (
                    <Link 
                      key={link.label}
                      href={link.href}
                      className="text-[10px] text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white flex items-center gap-2 transition-colors uppercase font-black tracking-[0.2em]"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
             </div>
             
             <Link 
               href={card.href}
               className="mt-12 inline-flex items-center justify-center py-4 border border-black dark:border-white text-[10px] font-black uppercase tracking-[0.4em] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
             >
               Explore
             </Link>
          </div>
        ))}
      </div>

      {/* Featured Architecture Section */}
      <section className="py-24 border-t border-black/10 dark:border-white/10">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
              <div className="space-y-10">
                  <div className="text-[10px] font-black text-black/40 dark:text-white/40 uppercase tracking-[0.4em]">Proprietary Layer</div>
                  <h3 className="text-4xl font-black uppercase tracking-tighter leading-none font-web3">
                    Zero-Knowledge Settlement <br/> Architecture
                  </h3>
                  <p className="text-sm text-black/60 dark:text-white/60 leading-relaxed uppercase tracking-widest font-black">
                    Whale Alert Protocol utilizes advanced ZK-proofs to ensure sovereign identities remain untraceable. 
                    Our "Neural Handshake" technology is the institutional gold standard for cross-device synchronization.
                  </p>
                  <Link href="/docs/core-concepts" className="inline-flex items-center gap-4 text-[10px] font-black hover:opacity-50 transition-all uppercase tracking-[0.4em]">
                    STudy Infrastructure ———
                  </Link>
              </div>
              <div className="grid grid-cols-2 gap-1 border border-black/10 dark:border-white/10 bg-black/10 dark:bg-white/10">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-square bg-white dark:bg-black flex items-center justify-center">
                       <div className={`w-8 h-8 border-2 ${i % 2 === 0 ? 'border-black dark:border-white' : 'border-black/20 dark:border-white/20'} rotate-45`} />
                    </div>
                  ))}
              </div>
          </div>
      </section>
    </div>
  );
}
