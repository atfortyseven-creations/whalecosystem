"use client";

import React from 'react';
import { ArrowRight, Book, Terminal, Code, Cpu, Shield, Zap, Layers } from 'lucide-react';
import Link from 'next/link';

export default function DocsLanding() {
  const cards = [
    {
      title: 'Guides',
      desc: 'Learn how to build, deploy, and manage sovereign agents on the Whale Alert Network.',
      icon: <Book className="text-cyan-500" />,
      href: '/docs/get-started',
      links: [
        { label: 'Introduction to Whale Alert', href: '/docs/intro' },
        { label: 'Quickstart Guide', href: '/docs/quickstart' },
        { label: 'Core Concepts', href: '/docs/core-concepts' },
      ]
    },
    {
      title: 'API Reference',
      desc: 'Detailed documentation for the Whale Alert REST and WebSocket APIs.',
      icon: <Terminal className="text-purple-500" />,
      href: '/docs/api/usage',
      links: [
        { label: 'Authentication', href: '/docs/api/reference/tokens' },
        { label: 'Agent Endpoints', href: '/docs/api/reference/agents' },
        { label: 'Tool Registry', href: '/docs/api/reference/tools' },
      ]
    },
    {
      title: 'Whale Code',
      desc: 'Master the proprietary scripting language for programmable data surveillance.',
      icon: <Code className="text-emerald-500" />,
      href: '/docs/whale-code/overview',
      links: [
        { label: 'Whale Code SDK', href: '/docs/whale-code/sdk/quickstart' },
        { label: 'Skill Development', href: '/docs/whale-code/skills' },
        { label: 'Subagent Patterns', href: '/docs/whale-code/subagents' },
      ]
    }
  ];

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Hero Section */}
      <section className="space-y-6 border-b border-slate-200/5 pb-10">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none uppercase font-web3">
          Whale Alert <br/><span className="text-cyan-500">Corporation™</span> Docs
        </h1>
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl leading-relaxed">
          Welcome to the official technical repository of the Whale Alert Corporation. 
          Everything you need to orchestrate institutional-grade data surveillance and sovereign agent networks.
        </p>
      </section>

      {/* Grid Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {cards.map((card) => (
          <div key={card.title} className="group p-8 rounded-[2rem] border border-slate-200/5 bg-white/5 hover:bg-white/[0.08] transition-all hover:border-cyan-500/20 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-100 transition-opacity">
               {React.cloneElement(card.icon as React.ReactElement<any>, { size: 40 })}
             </div>
             
             <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-3">
                  {React.cloneElement(card.icon as React.ReactElement<any>, { size: 20 })}
                  <h2 className="text-xl font-black uppercase tracking-widest font-web3">{card.title}</h2>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
                  {card.desc}
                </p>
                <div className="pt-4 flex flex-col gap-2">
                  {card.links.map(link => (
                    <Link 
                      key={link.label}
                      href={link.href}
                      className="text-xs text-slate-500 hover:text-cyan-400 flex items-center gap-2 transition-colors uppercase font-black tracking-widest"
                    >
                      <ArrowRight size={10} /> {link.label}
                    </Link>
                  ))}
                </div>
                <Link 
                  href={card.href}
                  className="mt-8 inline-flex items-center gap-2 px-6 py-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-cyan-500/20 hover:bg-cyan-500 hover:text-white transition-all"
                >
                  Explore {card.title}
                </Link>
             </div>
          </div>
        ))}
      </div>

      {/* Featured Architecture Section */}
      <section className="p-10 rounded-[3rem] bg-gradient-to-br from-cyan-950/20 to-black border border-cyan-500/10 shadow-3xl">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
              <div className="space-y-6 flex-1">
                  <div className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.4em]">Zero-Knowledge Settlement</div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter leading-none font-web3">
                    Programmable Privacy Core
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Whale Alert Protocol utilizes advanced ZK-proofs to ensure that sovereign identities remain untraceable while maintaining 100% regulatory transparency where required. Our "Neural Handshake" technology is the gold standard for cross-device synchronization.
                  </p>
                  <Link href="/docs/core-concepts" className="inline-flex items-center gap-2 text-[10px] font-black text-white hover:text-cyan-400 transition-colors uppercase tracking-widest">
                    Study Architecture <ArrowRight size={14} />
                  </Link>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full lg:w-1/3">
                  {[Cpu, Shield, Zap, Layers].map((Icon, i) => (
                    <div key={i} className="aspect-square rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-cyan-400 hover:border-cyan-500/30 transition-all">
                       <Icon size={32} strokeWidth={1} />
                    </div>
                  ))}
              </div>
          </div>
      </section>
    </div>
  );
}
