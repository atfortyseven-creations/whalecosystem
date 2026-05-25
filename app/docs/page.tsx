"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Terminal, Code, Server, Shield, Zap, Book, Scale, Database, Network } from 'lucide-react';

const CARDS = [
  {
    tab: 'docs',
    icon: <Database size={18} />,
    title: 'Platform Documentation',
    desc: 'Learn about our core architecture, authentication flows, smart contract integrations, and wallet connections.',
    href: '/docs/core-concepts',
    cta: 'Read docs',
    links: [
      { label: 'Core Concepts', href: '/docs/core-concepts' },
      { label: 'Architecture Overview', href: '/docs/architecture' },
      { label: 'User Authentication', href: '/docs/authentication' },
    ],
  },
  {
    tab: 'developer',
    icon: <Code size={18} />,
    title: 'Developer API',
    desc: 'Comprehensive REST API and WebSocket reference. Integrate Whale Alert Network data into your own applications.',
    href: '/docs/api',
    cta: 'API reference',
    links: [
      { label: 'REST API Reference', href: '/docs/api#rest' },
      { label: 'WebSocket Streams', href: '/docs/api#websocket' },
      { label: 'Rate Limits & Pricing', href: '/docs/api#limits' },
    ],
  },
  {
    tab: 'operator',
    icon: <Server size={18} />,
    title: 'Node Operators',
    desc: 'Guidelines for running infrastructure nodes, validating transactions, and maintaining network health.',
    href: '/docs/operator',
    cta: 'Run a node',
    links: [
      { label: 'Hardware Prerequisites', href: '/docs/operator#prerequisites' },
      { label: 'Node Setup Guide', href: '/docs/operator#setup' },
      { label: 'Monitoring & Logs', href: '/docs/operator#monitoring' },
    ],
  },
  {
    tab: 'legal',
    icon: <Scale size={18} />,
    title: 'Legal & Compliance',
    desc: 'Review our terms of service, privacy policy, compliance frameworks, and risk disclosures.',
    href: '/legal/terms',
    cta: 'View legal',
    links: [
      { label: 'Terms of Service', href: '/legal/terms' },
      { label: 'Privacy Policy', href: '/legal/privacy' },
      { label: 'Regulatory Compliance', href: '/legal/compliance' },
    ],
  },
];

const QUICK = [
  { label: 'Quickstart Guide', href: '/docs/quickstart', badge: 'START HERE', icon: <Zap size={14} /> },
  { label: 'Authentication Setup', href: '/docs/authentication', icon: <Shield size={14} /> },
  { label: 'Full API Reference', href: '/docs/api', icon: <Code size={14} /> },
  { label: 'Run a Node', href: '/docs/operator', icon: <Terminal size={14} /> },
];

const FADE_UP: any = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

export default function DocsPage() {
  return (
    <div className="w-full min-h-screen bg-[#FFFFFF] dark:bg-[#050505] text-black dark:text-white font-sans selection:bg-black/10 dark:selection:bg-white/10">
      <div className="max-w-[1200px] mx-auto py-24 px-6 lg:px-12 flex flex-col items-center">

        {/* HERO */}
        <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }} className="w-full flex flex-col items-center text-center gap-8 mb-24">
          
          <motion.div variants={FADE_UP} className="w-full flex flex-col items-center">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 border border-black/10 dark:border-white/10 rounded-full mb-10 w-fit shadow-sm bg-white dark:bg-white/5">
                  <Book size={14} className="text-slate-900 dark:text-slate-100" />
                  <span className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase opacity-60">Whale Alert · Documentation</span>
              </div>
              
              <h1 className="text-[48px] md:text-[80px] font-black tracking-tighter uppercase leading-[0.9] mb-8 text-slate-900 dark:text-white">
                  Developer <br />
                  <span className="text-black/20 dark:text-white/20">Documentation.</span>
              </h1>
              
              <p className="text-[18px] md:text-[22px] leading-relaxed text-black/60 dark:text-white/60 max-w-2xl">
                  Everything you need to build with Whale Alert Network. Explore our APIs, integrate our data, and read our comprehensive guides.
              </p>
          </motion.div>
        </motion.div>

        {/* QUICK LINKS */}
        <motion.div initial="hidden" animate="visible" variants={FADE_UP} className="w-full mb-24">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-black/40 dark:text-white/40 mb-8 flex items-center justify-center gap-2">
              <Zap size={14} /> Quick Access
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {QUICK.map((q, i) => (
              <Link key={i} href={q.href}
                className="flex items-center justify-between p-8 rounded-3xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 hover:bg-[#F8F8F8] dark:hover:bg-white/10 transition-all group shadow-sm hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-black/20 border border-black/5 dark:border-white/5 flex items-center justify-center text-black dark:text-white">
                      {q.icon}
                  </div>
                  <span className="font-sans font-bold text-[16px] tracking-tight text-slate-900 dark:text-white">{q.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  {q.badge && (
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] bg-black/5 dark:bg-white/10 text-black dark:text-white px-3 py-1 rounded-full font-bold">{q.badge}</span>
                  )}
                  <ArrowRight size={14} className="opacity-30 group-hover:opacity-100 group-hover:translate-x-1 text-slate-900 dark:text-white transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* SECTION CARDS */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={FADE_UP} className="w-full mb-24">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-black/40 dark:text-white/40 mb-8 flex items-center justify-center gap-2">
              <Network size={14} /> Documentation Resources
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
            {CARDS.map((card, i) => (
              <div key={i} className="p-12 rounded-[2.5rem] bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 hover:shadow-xl hover:bg-[#F8F8F8] dark:hover:bg-white/5 transition-all duration-300 flex flex-col gap-8 group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 flex items-center justify-center text-black dark:text-white shadow-sm">
                        {card.icon}
                    </div>
                    <span className="font-sans text-[24px] font-black tracking-tight text-slate-900 dark:text-white">{card.title}</span>
                  </div>
                </div>
                <p className="text-[16px] leading-relaxed text-black/50 dark:text-white/50 flex-1">{card.desc}</p>
                
                <div className="flex flex-col gap-4 mt-4 border-t border-black/5 dark:border-white/10 pt-8">
                  {card.links.map((lnk, j) => (
                    <Link key={j} href={lnk.href}
                      className="flex items-center gap-3 font-sans font-bold text-[14px] text-black/40 dark:text-white/40 hover:text-slate-900 dark:hover:text-white transition-all">
                      <div className="w-1.5 h-1.5 rounded-full bg-current opacity-30" />
                      {lnk.label}
                    </Link>
                  ))}
                </div>
                
                <Link href={card.href}
                  className="mt-8 self-start flex items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-[0.2em] px-8 py-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-sm hover:shadow-md transition-all group-hover:bg-black dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black group-hover:border-transparent">
                  {card.cta} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
        </motion.div>

        {/* PLATFORM INFO */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={FADE_UP} className="w-full border-t border-black/5 dark:border-white/10 pt-24 pb-24 grid grid-cols-1 sm:grid-cols-3 gap-16 text-center">
          {[
            { value: '99.99%', label: 'API Uptime' },
            { value: '< 50ms', label: 'Average Latency' },
            { value: 'REST/WS', label: 'Protocols Supported' },
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <div className="font-black text-[48px] md:text-[72px] tracking-tighter leading-none text-slate-900 dark:text-white">{s.value}</div>
              <div className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-black/40 dark:text-white/40">{s.label}</div>
            </div>
          ))}
        </motion.div>

      </div>
    </div>
  );
}
