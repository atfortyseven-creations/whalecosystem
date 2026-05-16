"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Terminal, Code, Server, Shield, Zap, Book, Scale, Database, Network } from 'lucide-react';

const CARDS = [
  {
    tab: 'docs',
    icon: <Database size={18} />,
    title: 'Documentation',
    desc: 'Platform architecture, SIWE authentication, Neo4j Akashic Ledger, smart contracts, and node deployment.',
    href: '/docs/overview',
    cta: 'Read docs',
    links: [
      { label: 'Core Concepts', href: '/docs/core-concepts' },
      { label: 'Architecture', href: '/docs/platform/architecture' },
      { label: 'Authentication', href: '/docs/platform/authentication' },
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
      { label: 'REST API', href: '/docs/developer/rest/overview' },
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
      { label: 'Monitoring', href: '/docs/operator/operation/monitoring' },
    ],
  },
  {
    tab: 'legal',
    icon: <Scale size={18} />,
    title: 'Legal',
    desc: 'Terms of service, privacy policy, cookie policy, risk disclosure, and the Whale Code of conduct.',
    href: '/docs/legal/terms-of-service',
    cta: 'View legal',
    links: [
      { label: 'Terms of Service', href: '/docs/legal/terms-of-service' },
      { label: 'Privacy Policy', href: '/docs/legal/privacy-policy' },
      { label: 'Risk Disclosure', href: '/docs/legal/risk-disclosure' },
    ],
  },
];

const QUICK = [
  { label: 'Quickstart (5 min)', href: '/docs/quickstart', badge: 'START HERE', icon: <Zap size={14} /> },
  { label: 'Authentication guide', href: '/docs/platform/authentication', icon: <Shield size={14} /> },
  { label: 'API reference', href: '/docs/developer/rest/overview', icon: <Code size={14} /> },
  { label: 'Run a full node', href: '/docs/operator/setup/node', icon: <Terminal size={14} /> },
];

const FADE_UP: any = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

export default function DocsPage() {
  return (
    <div className="w-full min-h-screen bg-[#FAFAF8] text-black font-sans selection:bg-black/10">
      <div className="max-w-[1200px] mx-auto py-24 px-6 lg:px-12 flex flex-col items-center">

        {/* ── MASSIVE BENTO HERO ── */}
        <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }} className="w-full flex flex-col items-center text-center gap-8 mb-24">
          
          <motion.div variants={FADE_UP} className="w-full flex flex-col items-center">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 border border-black/10 rounded-full mb-10 w-fit shadow-sm bg-white">
                  <Book size={14} className="text-[#050505]" />
                  <span className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase opacity-60">System Protocol · Documentation</span>
              </div>
              
              <h1 className="text-[48px] md:text-[80px] font-black tracking-tighter uppercase leading-[0.9] mb-8 text-[#050505]">
                  Network <br />
                  <span className="text-black/20">System Reference.</span>
              </h1>
              
              <p className="text-[18px] md:text-[22px] leading-relaxed font-serif text-black/60 max-w-2xl">
                  Comprehensive documentation for the Whale Alert Network infrastructure. Technical specifications for secure identity management and institutional record preservation.
              </p>
          </motion.div>
        </motion.div>

        {/* ── QUICK LINKS ── */}
        <motion.div initial="hidden" animate="visible" variants={FADE_UP} className="w-full mb-24">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-black/40 mb-8 flex items-center justify-center gap-2">
              <Zap size={14} /> Quick System Access
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {QUICK.map((q, i) => (
              <Link key={i} href={q.href}
                className="flex items-center justify-between p-8 rounded-3xl bg-white border border-black/5 hover:border-black/20 hover:bg-[#F8F8F8] transition-all group shadow-sm hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-black/5 border border-black/5 flex items-center justify-center text-black">
                      {q.icon}
                  </div>
                  <span className="font-sans font-bold text-[16px] tracking-tight text-[#050505]">{q.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  {q.badge && (
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] bg-black/5 text-black px-3 py-1 rounded-full font-black">{q.badge}</span>
                  )}
                  <ArrowRight size={14} className="opacity-30 group-hover:opacity-100 group-hover:translate-x-1 text-[#050505] transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* ── SECTION CARDS ── */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={FADE_UP} className="w-full mb-24">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-black/40 mb-8 flex items-center justify-center gap-2">
              <Network size={14} /> System Architecture
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
            {CARDS.map((card, i) => (
              <div key={i} className="p-12 rounded-[2.5rem] bg-white border border-black/5 hover:shadow-xl hover:bg-[#F8F8F8] transition-all duration-300 flex flex-col gap-8 group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-black/5 border border-black/5 flex items-center justify-center text-black shadow-sm">
                        {card.icon}
                    </div>
                    <span className="font-sans text-[24px] font-black uppercase tracking-tight text-[#050505]">{card.title}</span>
                  </div>
                </div>
                <p className="text-[16px] leading-relaxed font-serif text-black/50 flex-1">{card.desc}</p>
                
                <div className="flex flex-col gap-4 mt-4 border-t border-black/5 pt-8">
                  {card.links.map((lnk, j) => (
                    <Link key={j} href={lnk.href}
                      className="flex items-center gap-3 font-sans font-bold text-[14px] text-black/40 hover:text-[#050505] transition-all">
                      <div className="w-1.5 h-1.5 rounded-full bg-current opacity-30" />
                      {lnk.label}
                    </Link>
                  ))}
                </div>
                
                <Link href={card.href}
                  className="mt-8 self-start flex items-center gap-3 font-mono text-[11px] font-black uppercase tracking-[0.2em] px-8 py-4 rounded-2xl bg-black/5 border border-black/5 shadow-sm hover:shadow-md transition-all group-hover:bg-black group-hover:text-white group-hover:border-transparent">
                  {card.cta} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── PLATFORM INFO ── */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={FADE_UP} className="w-full border-t border-black/5 pt-24 pb-24 grid grid-cols-1 sm:grid-cols-3 gap-16 text-center">
          {[
            { value: '14+', label: 'Networks Supported' },
            { value: 'v3.0', label: 'System Engine' },
            { value: '< 100ms', label: 'Verification Latency' },
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <div className="font-black text-[48px] md:text-[72px] tracking-tighter leading-none text-[#050505]">{s.value}</div>
              <div className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-black/40">{s.label}</div>
            </div>
          ))}
        </motion.div>

      </div>
    </div>
  );
}
