"use client";

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { formatDistanceToNowStrict } from 'date-fns';
import { useSearchParams } from 'next/navigation';
import { SovereignFooter } from '@/components/landing/SovereignFooter';
import { motion, Variants } from 'framer-motion';
import { WhaleAlertLoader } from '@/components/ui/WhaleAlertLoader';
import { MessageSquare, Users, TrendingUp, Shield, PenSquare, ArrowRight, Hash } from 'lucide-react';

const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

const FORUM_STATS = [
  { value: '12,400+', label: 'Members', icon: <Users size={16} /> },
  { value: '3,800+', label: 'Discussions', icon: <MessageSquare size={16} /> },
  { value: '98K+', label: 'Replies', icon: <TrendingUp size={16} /> },
  { value: 'End-to-End', label: 'Encrypted', icon: <Shield size={16} /> },
];

function ForumHomeContent() {
  const [topics, setTopics] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const searchParams = useSearchParams();
  const rawFilter = searchParams.get('filter');
  const filter = rawFilter || 'latest';
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    fetch(`/api/forum/topics?limit=30&filter=${filter}`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setTopics(data); })
      .catch(console.error);

    fetch('/api/forum/categories')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setCategories(data); })
      .catch(console.error);
  }, [filter]);

  return (
    <div className="w-full flex-1 flex flex-col bg-transparent text-[#0A0A0A] font-sans relative">

      {/* ═══════════════════════════════════════════════════════════════
          HERO WELCOME — Whale Forum
      ═══════════════════════════════════════════════════════════════ */}
      <section className="w-full min-h-[70vh] flex flex-col items-center justify-center text-center relative overflow-hidden px-6 py-32 border-b border-black/10">
        {/* Subtle radial glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0.02) 0%, transparent 70%)' }} />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.12 } } }}
          className="relative z-10 flex flex-col items-center max-w-3xl mx-auto"
        >


          {/* Title */}
          <motion.h1 variants={FADE_UP}
            className="text-[56px] sm:text-[72px] lg:text-[88px] font-black tracking-tighter uppercase leading-[0.92] text-[#0A0A0A] mb-8">
            Whale<br />
            <span className="text-black/20">Forum.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={FADE_UP}
            className="text-[17px] sm:text-[19px] leading-relaxed text-black/60 max-w-xl font-light mb-12">
            A structured space for rigorous discourse on on-chain intelligence, market architecture, 
            protocol governance, and the future of decentralized finance. Every voice, cryptographically verified.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={FADE_UP} className="flex flex-col sm:flex-row items-center gap-4 mb-16">
            <Link href="/forum/new"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#0A0A0A] text-white font-mono text-[11px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_8px_30px_rgba(0,0,0,0.1)]">
              <PenSquare size={14} />
              Start a Discussion
            </Link>
            <Link href="/forum?filter=top"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl border border-black/10 bg-black/5 backdrop-blur-md font-mono text-[11px] font-black uppercase tracking-[0.2em] text-black/60 hover:text-black hover:border-black/20 hover:bg-black/10 transition-all">
              <TrendingUp size={14} />
              Top Discussions
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div variants={FADE_UP}
            className="grid grid-cols-2 sm:grid-cols-4 gap-px border border-black/10 rounded-2xl overflow-hidden bg-black/5 w-full max-w-2xl">
            {FORUM_STATS.map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 py-5 px-4 bg-white/80 backdrop-blur-md">
                <div className="text-black/30">{s.icon}</div>
                <div className="font-black text-[22px] tracking-tighter text-[#0A0A0A]">{s.value}</div>
                <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-black/40">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FILTER TABS
      ═══════════════════════════════════════════════════════════════ */}
      <div className="w-full border-b border-black/10 bg-white/80 backdrop-blur-xl sticky top-0 z-20">
        <div className="w-full max-w-[1100px] mx-auto px-6 md:px-12 flex items-center gap-0 h-12">
          {[
            { id: 'latest', label: 'Latest' },
            { id: 'top', label: 'Top' },
            { id: 'hot', label: 'Hot' },
          ].map(tab => (
            <Link
              key={tab.id}
              href={`/forum?filter=${tab.id}`}
              className={`flex items-center px-5 h-full font-mono text-[10px] uppercase tracking-[0.15em] border-b-2 transition-all ${
                filter === tab.id
                  ? 'text-[#0A0A0A] border-[#0A0A0A] font-black'
                  : 'text-black/40 border-transparent hover:text-black/70 hover:border-black/20'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          MAIN CONTENT — Categories + Topics
      ═══════════════════════════════════════════════════════════════ */}
      <div className="w-full max-w-[1100px] mx-auto px-6 md:px-12 py-16 flex flex-col lg:flex-row gap-12">

        {/* LEFT — Topics */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-mono text-[10px] font-black uppercase tracking-[0.25em] text-black/40">
              {filter === 'latest' ? 'Latest Discussions' : filter === 'top' ? 'Top Discussions' : 'Hot Right Now'}
            </h2>
            <Link href="/forum/new"
              className="flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.15em] text-black/40 hover:text-[#0A0A0A] transition-colors">
              <PenSquare size={12} /> New
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {topics.length === 0 ? (
              <div className="py-20 flex flex-col items-center gap-4">
                <MessageSquare size={32} className="text-black/15" />
                <p className="font-mono text-[11px] uppercase tracking-widest text-black/30">
                  No active discussions yet. Be the first to start one.
                </p>
                <Link href="/forum/new"
                  className="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-black/5 border border-black/10 font-mono text-[10px] uppercase tracking-widest text-black/60 hover:text-black hover:bg-black/10 transition-all">
                  <PenSquare size={12} /> Start a Discussion <ArrowRight size={12} />
                </Link>
              </div>
            ) : topics.map(topic => {
              const activity = formatDistanceToNowStrict(new Date(topic.updatedAt || topic.createdAt), { addSuffix: false })
                .replace(' minutes', 'm').replace(' minute', 'm')
                .replace(' hours', 'h').replace(' hour', 'h')
                .replace(' days', 'd').replace(' day', 'd')
                .replace(' months', 'mo').replace(' month', 'mo');

              return (
                <Link
                  key={topic.id}
                  href={`/forum/t/${topic.id}`}
                  className="group flex items-start gap-4 p-5 rounded-2xl bg-black/[0.02] border border-black/5 hover:bg-black/[0.04] hover:border-black/10 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.02) 0%, transparent 50%)' }} />

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[11px] font-black text-black/50 bg-black/5 border border-black/10 group-hover:border-black/20 transition-colors shrink-0 relative z-10">
                    {topic.author?.walletAddress?.slice(2, 4).toUpperCase() || 'ID'}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 relative z-10">
                    <h3 className="font-bold text-[15px] leading-[1.4] text-[#0A0A0A]/85 group-hover:text-[#0A0A0A] transition-colors mb-2 line-clamp-2">
                      {topic.title}
                    </h3>
                    <div className="flex items-center gap-3 flex-wrap">
                      {topic.category && (
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: topic.category.color || '#00C076' }} />
                          <span className="font-mono text-[9px] uppercase tracking-widest text-black/40">{topic.category.name}</span>
                        </div>
                      )}
                      {topic.tags?.map((t: any) => (
                        <span key={t.id} className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest text-black/30">
                          <Hash size={8} />{t.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-col items-end gap-1 shrink-0 relative z-10">
                    <div className="flex items-center gap-1 text-black/30">
                      <span className="font-mono text-[12px] font-black">{topic._count?.posts || 0}</span>
                      <MessageSquare size={10} />
                    </div>
                    <span className="font-mono text-[9px] text-black/30">{isMounted ? activity : ''}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* RIGHT SIDEBAR — Categories */}
        <div className="w-full lg:w-[280px] shrink-0">
          <h2 className="font-mono text-[10px] font-black uppercase tracking-[0.25em] text-black/40 mb-6">Categories</h2>
          <div className="flex flex-col gap-2">
            {categories.length === 0 ? (
              <div className="py-4 text-[11px] text-black/30 font-mono uppercase tracking-widest">Loading...</div>
            ) : categories.map(cat => (
              <Link key={cat.id} href={`/forum/c/${cat.slug}`}
                className="group flex items-center justify-between p-4 rounded-xl bg-black/[0.02] border border-black/5 hover:bg-black/[0.04] hover:border-black/10 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color || '#00C076' }} />
                  <div>
                    <span className="block text-[13px] font-bold text-[#0A0A0A]/80 group-hover:text-[#0A0A0A] transition-colors">{cat.name}</span>
                    {cat.description && (
                      <span className="block text-[10px] text-black/40 line-clamp-1 mt-0.5">{cat.description}</span>
                    )}
                  </div>
                </div>
                {cat._count?.topics !== undefined && (
                  <span className="font-mono text-[9px] text-black/30 shrink-0 ml-2">{cat._count.topics}</span>
                )}
              </Link>
            ))}
          </div>

          {/* Forum guidelines link */}
          <div className="mt-8 p-4 rounded-xl border border-black/5 bg-black/[0.02]">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-black/30 mb-3">Community Standards</p>
            <p className="text-[11px] text-black/50 leading-relaxed mb-3">
              All discussions are subject to the Whale Forum Code of Conduct. Maintain professional discourse.
            </p>
            <Link href="/docs/whale-code"
              className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-black/40 hover:text-black transition-colors">
              <Shield size={10} /> Read Guidelines <ArrowRight size={9} />
            </Link>
          </div>
        </div>
      </div>

      <SovereignFooter />
    </div>
  );
}

export default function ForumHomePage() {
  return (
    <Suspense fallback={<WhaleAlertLoader bg="transparent" color="#0A0A0A" />}>
      <ForumHomeContent />
    </Suspense>
  );
}
