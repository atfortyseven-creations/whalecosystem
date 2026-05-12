"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Terminal, Code, Server, Shield, Zap, Book, Scale } from 'lucide-react';

const CARDS = [
  {
    tab: 'docs',
    icon: <Book size={18} />,
    title: 'Documentation',
    desc: 'Platform architecture, SIWE authentication, Neo4j Akashic Ledger, smart contracts, and node deployment.',
    href: '/docs/intro',
    cta: 'Read docs',
    links: [
      { label: 'Core Concepts', href: '/docs/intro' },
      { label: 'Architecture', href: '/docs/platform/architecture' },
      { label: 'Authentication', href: '/docs/platform/auth' },
    ],
  },
  {
    tab: 'developer',
    icon: <Code size={18} />,
    title: 'Developer',
    desc: 'REST API, WebSocket streams, TypeScript & Python SDKs, webhooks, and rate limits per plan.',
    href: '/docs/developer/overview',
    cta: 'API reference',
    links: [
      { label: 'REST API', href: '/docs/developer/api/overview' },
      { label: 'WebSocket API', href: '/docs/developer/ws/connection' },
      { label: 'TypeScript SDK', href: '/docs/developer/sdk/typescript' },
    ],
  },
  {
    tab: 'operator',
    icon: <Server size={18} />,
    title: 'Operator',
    desc: 'Run full nodes, sequencers, and provers. Hardware requirements, keystore management, and monitoring.',
    href: '/docs/operator/overview',
    cta: 'Run a node',
    links: [
      { label: 'Prerequisites', href: '/docs/operator/prerequisites' },
      { label: 'Running a Node', href: '/docs/operator/setup/node' },
      { label: 'Monitoring', href: '/docs/operator/monitoring' },
    ],
  },
  {
    tab: 'legal',
    icon: <Scale size={18} />,
    title: 'Legal',
    desc: 'Terms of service, privacy policy, cookie policy, risk disclosure, and the Whale Code of conduct.',
    href: '/docs/terms-of-service',
    cta: 'View legal',
    links: [
      { label: 'Terms of Service', href: '/docs/terms-of-service' },
      { label: 'Privacy Policy', href: '/docs/privacy-policy' },
      { label: 'Risk Disclosure', href: '/docs/risk-disclosure' },
    ],
  },
];

const QUICK = [
  { label: 'Quickstart (5 min)', href: '/docs/quickstart', badge: 'START HERE', icon: <Zap size={13} /> },
  { label: 'Authentication guide', href: '/docs/platform/auth', icon: <Shield size={13} /> },
  { label: 'API reference', href: '/docs/developer/api/overview', icon: <Code size={13} /> },
  { label: 'Run a full node', href: '/docs/operator/setup/node', icon: <Terminal size={13} /> },
];

export default function DocsPage() {
  return (
    <div className="doc-content">

      {/* Hero */}
      <div className="mb-16">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-25 mb-4">
          Whale Alert · Documentation v2.0
        </p>
        <h1 className="text-[2.5rem] md:text-[3.5rem] font-black tracking-tighter uppercase leading-none mb-6">
          Documentation
        </h1>
        <p className="text-[1rem] leading-relaxed opacity-60 max-w-xl">
          Everything you need to integrate, operate, and build on top of the Whale Alert Network —
          the institutional on-chain intelligence platform.
        </p>
      </div>

      {/* Quick links */}
      <div className="mb-16">
        <p className="font-mono text-[9px] uppercase tracking-[0.3em] opacity-25 mb-4">Quick access</p>
        <div className="flex flex-col gap-px border border-black/8 dark:border-white/8">
          {QUICK.map((q, i) => (
            <Link key={i} href={q.href}
              className="flex items-center justify-between px-5 py-3.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
              <div className="flex items-center gap-3">
                <span className="opacity-35 group-hover:opacity-70 transition-opacity">{q.icon}</span>
                <span className="font-mono text-[12px] tracking-tight">{q.label}</span>
              </div>
              <div className="flex items-center gap-3">
                {q.badge && (
                  <span className="font-mono text-[9px] uppercase tracking-widest text-[#00C076] font-black">{q.badge}</span>
                )}
                <ArrowRight size={12} className="opacity-20 group-hover:opacity-60 group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Section cards */}
      <div className="mb-16">
        <p className="font-mono text-[9px] uppercase tracking-[0.3em] opacity-25 mb-4">Sections</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px border border-black/8 dark:border-white/8">
          {CARDS.map((card, i) => (
            <div key={i} className="p-7 hover:bg-black/[0.025] dark:hover:bg-white/[0.025] transition-colors flex flex-col gap-4 border-b border-r border-black/8 dark:border-white/8 last:border-b-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="opacity-40">{card.icon}</span>
                  <span className="font-mono text-[11px] font-black uppercase tracking-[0.2em]">{card.title}</span>
                </div>
                <span className="font-mono text-[9px] uppercase tracking-widest opacity-20 border border-current px-2 py-0.5">
                  {card.tab}
                </span>
              </div>
              <p className="text-[13px] leading-relaxed opacity-55">{card.desc}</p>
              <div className="flex flex-col gap-1 mt-1">
                {card.links.map((lnk, j) => (
                  <Link key={j} href={lnk.href}
                    className="flex items-center gap-2 font-mono text-[11px] opacity-40 hover:opacity-100 hover:text-[#00C076] transition-all group">
                    <span className="opacity-30 group-hover:opacity-100">→</span>
                    {lnk.label}
                  </Link>
                ))}
              </div>
              <Link href={card.href}
                className="mt-2 self-start flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.15em] px-4 py-2 border border-current opacity-30 hover:opacity-100 transition-all group">
                {card.cta} <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Platform info */}
      <div className="border-t border-black/8 dark:border-white/8 pt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
        {[
          { value: '12', label: 'Chains indexed' },
          { value: 'v2.0', label: 'Current version' },
          { value: 'TRC-20', label: 'Payment network' },
        ].map((s, i) => (
          <div key={i}>
            <div className="font-black text-[2rem] tracking-tighter">{s.value}</div>
            <div className="font-mono text-[10px] uppercase tracking-widest opacity-30 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

    </div>
  );
}
