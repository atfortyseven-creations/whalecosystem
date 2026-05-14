"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Terminal, Code, Server, Shield, Zap, Book, Scale, Database, Network } from 'lucide-react';
import { RemoteLottie } from '@/components/ui/RemoteLottie';

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
    <div className="w-full font-sans max-w-[1200px] mx-auto py-12 px-6 lg:px-12">

      {/* ── MASSIVE BENTO HERO ── */}
      <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }} className="w-full flex flex-col lg:flex-row gap-8 mb-16">
        
        {/* Left Side: Copy */}
        <motion.div variants={FADE_UP} className="w-full lg:w-1/2 flex flex-col justify-center">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 border border-black/10 dark:border-white/10 rounded-full mb-8 w-fit shadow-sm">
                <Book size={14} className="text-[#0044CC] dark:text-[#4d88ff]" />
                <span className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase opacity-60">Whale Alert · Docs v2.0</span>
            </div>
            
            <h1 className="text-[48px] md:text-[64px] font-black tracking-tighter uppercase leading-[0.95] mb-6">
                Professional <br />
                <span className="text-[#0044CC] dark:text-[#4d88ff]">Documentation.</span>
            </h1>
            
            <p className="text-[16px] leading-relaxed font-serif opacity-70 max-w-lg">
                Everything you need to integrate, operate, and build atop the Network Core. Architected for quantitative teams requiring absolute mathematical precision.
            </p>
        </motion.div>

        <motion.div variants={FADE_UP} className="w-full lg:w-1/2 aspect-square max-h-[400px] bg-white/40 backdrop-blur-3xl dark:bg-[#111]/40 rounded-[2.5rem] border border-black/5 dark:border-white/5 flex items-center justify-center p-8 shadow-sm">
            <RemoteLottie path="DeeWork About Blockchain.json" className="scale-125" />
        </motion.div>

      </motion.div>

      {/* ── QUICK LINKS ── */}
      <motion.div initial="hidden" animate="visible" variants={FADE_UP} className="mb-16">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 mb-6 flex items-center gap-2">
            <Zap size={14} /> Quick Access
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {QUICK.map((q, i) => (
            <Link key={i} href={q.href}
              className="flex items-center justify-between p-6 rounded-2xl bg-white/40 backdrop-blur-3xl dark:bg-[#111]/40 border border-black/5 dark:border-white/5 hover:border-[#0044CC]/30 dark:hover:border-[#4d88ff]/30 transition-all group shadow-sm hover:shadow-md">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#222] border border-black/5 dark:border-white/5 flex items-center justify-center text-[#0044CC] dark:text-[#4d88ff]">
                    {q.icon}
                </div>
                <span className="font-sans font-bold text-[15px] tracking-tight">{q.label}</span>
              </div>
              <div className="flex items-center gap-3">
                {q.badge && (
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] bg-[#0044CC]/10 text-[#0044CC] dark:text-[#4d88ff] px-3 py-1 rounded-full font-black">{q.badge}</span>
                )}
                <ArrowRight size={14} className="opacity-30 group-hover:opacity-100 group-hover:translate-x-1 group-hover:text-[#0044CC] dark:group-hover:text-[#4d88ff] transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* ── SECTION CARDS ── */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={FADE_UP} className="mb-24">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 mb-6 flex items-center gap-2">
            <Network size={14} /> Core Architecture
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          {CARDS.map((card, i) => (
            <div key={i} className="p-10 rounded-[2rem] bg-white/40 backdrop-blur-3xl dark:bg-[#111]/40 border border-black/5 dark:border-white/5 hover:shadow-xl transition-all duration-300 flex flex-col gap-6 group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#222] border border-black/5 dark:border-white/5 flex items-center justify-center text-[#0044CC] dark:text-[#4d88ff] shadow-sm">
                      {card.icon}
                  </div>
                  <span className="font-sans text-[20px] font-black uppercase tracking-tight">{card.title}</span>
                </div>
              </div>
              <p className="text-[15px] leading-relaxed font-serif opacity-70 flex-1">{card.desc}</p>
              
              <div className="flex flex-col gap-3 mt-4 border-t border-black/5 dark:border-white/5 pt-6">
                {card.links.map((lnk, j) => (
                  <Link key={j} href={lnk.href}
                    className="flex items-center gap-3 font-sans font-bold text-[14px] opacity-60 hover:opacity-100 hover:text-[#0044CC] dark:hover:text-[#4d88ff] transition-all">
                    <div className="w-1.5 h-1.5 rounded-full bg-current opacity-30" />
                    {lnk.label}
                  </Link>
                ))}
              </div>
              
              <Link href={card.href}
                className="mt-6 self-start flex items-center gap-3 font-mono text-[11px] font-black uppercase tracking-[0.2em] px-6 py-3 rounded-xl bg-white dark:bg-[#222] border border-black/5 dark:border-white/5 shadow-sm hover:shadow-md transition-all group-hover:bg-[#0044CC] group-hover:text-white dark:group-hover:text-white dark:group-hover:bg-[#4d88ff] group-hover:border-transparent">
                {card.cta} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── PLATFORM INFO ── */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={FADE_UP} className="border-t border-black/10 dark:border-white/10 pt-16 pb-24 grid grid-cols-1 sm:grid-cols-3 gap-12 text-center">
        {[
          { value: '14+', label: 'Networks Supported' },
          { value: 'v3.0', label: 'Core Engine' },
          { value: '< 100ms', label: 'Telemetry Latency' },
        ].map((s, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="font-black text-[40px] md:text-[56px] tracking-tighter leading-none text-[#0044CC] dark:text-[#4d88ff]">{s.value}</div>
            <div className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] opacity-50">{s.label}</div>
          </div>
        ))}
      </motion.div>

    </div>
  );
}
