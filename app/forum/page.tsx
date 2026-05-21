"use client";

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { formatDistanceToNowStrict } from 'date-fns';
import { useSearchParams } from 'next/navigation';
import { SovereignFooter } from '@/components/landing/SovereignFooter';
import { WhaleChatLink } from '@/components/shared/WhaleChatLink';
import { motion, Variants } from 'framer-motion';
import { useRouter } from 'next/navigation';

const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

const FORUM_STATS = [
  { value: '12,400+', label: 'Members' },
  { value: '3,800+', label: 'Discussions' },
  { value: '98K+', label: 'Replies' },
];

function ForumHomeContent() {
  const [topics, setTopics] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const searchParams = useSearchParams();
  const router = useRouter();
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
    <div className="flex-1 flex flex-col bg-white text-slate-900 w-full min-h-screen">
      
      <div className="w-full flex flex-col items-center justify-start p-4 md:p-8 relative min-h-screen">
        <div className="w-full max-w-[1200px] bg-white/80 backdrop-blur-2xl border border-slate-200/60 rounded-[2rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.07)] flex flex-col transition-all duration-500 z-10 mt-16 md:mt-24 p-8 md:p-16">
          
          {/* ═══════════════════════════════════════════════════════════════
              HERO WELCOME
          ═══════════════════════════════════════════════════════════════ */}
          <section className="w-full flex flex-col items-center justify-center text-center relative px-6 py-12 md:py-24 border-b border-slate-200/60 mb-12">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.12 } } }}
              className="relative z-10 flex flex-col items-center max-w-3xl mx-auto"
            >
              {/* Title */}
              <motion.h1 variants={FADE_UP}
                className="text-5xl md:text-7xl font-black tracking-tight leading-[1] text-slate-900 mb-8">
                Forum.
              </motion.h1>

              {/* Subtitle */}
              <motion.p variants={FADE_UP}
                className="text-[17px] sm:text-[19px] leading-relaxed text-slate-500 max-w-xl font-medium mb-12">
                A structured space for discussion, ideas, and knowledge sharing.
              </motion.p>

              {/* CTAs */}
              <motion.div variants={FADE_UP} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                <Link href="/forum/new"
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-slate-900 text-white font-sans text-[12px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-lg">
                  Start a Discussion
                </Link>
              </motion.div>

              {/* Stats row */}
              <motion.div variants={FADE_UP}
                className="flex items-center justify-center gap-8 md:gap-16 w-full max-w-2xl">
                {FORUM_STATS.map((s, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="font-black text-2xl md:text-3xl tracking-tight text-slate-900">{s.value}</div>
                    <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">{s.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </section>

          {/* ═══════════════════════════════════════════════════════════════
              MAIN CONTENT — Categories + Topics
          ═══════════════════════════════════════════════════════════════ */}
          <div className="w-full flex flex-col lg:flex-row gap-12">

            {/* LEFT — Topics */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200/60">
                <h2 className="font-sans text-[16px] font-black tracking-tight text-slate-900">
                  Latest Discussions
                </h2>
                <Link href="/forum/new"
                  className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors">
                  New
                </Link>
              </div>

              <div className="flex flex-col gap-4">
                {topics.length === 0 ? (
                  <div className="py-20 flex flex-col items-center gap-4 text-center">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      No active discussions yet.
                    </p>
                    <Link href="/forum/new"
                      className="mt-2 inline-flex items-center px-6 py-3 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all">
                      Start a Discussion
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
                      className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200/60 hover:bg-slate-100 hover:border-slate-300 transition-all duration-300"
                    >
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-white border border-slate-200 shrink-0">
                        {topic.author?.walletAddress?.slice(2, 4) || 'ID'}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-sans text-[16px] font-bold leading-tight text-slate-900 mb-2 line-clamp-2">
                          {topic.title}
                        </h3>
                        <div className="flex items-center gap-3 flex-wrap">
                          {topic.category && (
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500">{topic.category.name}</span>
                            </div>
                          )}
                          {topic.tags?.map((t: any) => (
                            <span key={t.id} className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-400">
                              #{t.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex flex-col sm:items-end gap-1 shrink-0 mt-3 sm:mt-0">
                        <div className="font-mono text-[10px] font-bold text-slate-500">
                          {topic._count?.posts || 0} REPLIES
                        </div>
                        <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-400">{isMounted ? activity : ''}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* RIGHT SIDEBAR — Categories */}
            <div className="w-full lg:w-[280px] shrink-0">
              <div className="mb-8 pb-4 border-b border-slate-200/60">
                 <h2 className="font-sans text-[16px] font-black tracking-tight text-slate-900">Categories</h2>
              </div>
              <div className="flex flex-col gap-3">
                {categories.length === 0 ? (
                  <div className="py-4 text-[10px] font-bold text-slate-400 font-mono uppercase tracking-widest">Loading...</div>
                ) : categories.map(cat => (
                  <Link key={cat.id} href={`/forum/c/${cat.slug}`}
                    className="group flex flex-col p-4 rounded-2xl bg-slate-50 border border-slate-200/60 hover:bg-slate-100 hover:border-slate-300 transition-all">
                    <div className="flex items-center justify-between mb-1">
                      <span className="block text-[14px] font-bold text-slate-900">{cat.name}</span>
                      {cat._count?.topics !== undefined && (
                        <span className="font-mono text-[10px] font-bold text-slate-400">{cat._count.topics}</span>
                      )}
                    </div>
                    {cat.description && (
                      <span className="block text-[12px] font-medium text-slate-500 line-clamp-2 leading-relaxed">{cat.description}</span>
                    )}
                  </Link>
                ))}
              </div>

              {/* Forum guidelines */}
              <div className="mt-8 p-6 rounded-2xl border border-slate-200/60 bg-slate-50">
                <p className="font-sans text-[14px] font-bold text-slate-900 mb-2">Community Standards</p>
                <p className="text-[12px] font-medium text-slate-500 leading-relaxed mb-4">
                  Maintain professional and constructive discourse.
                </p>
                <Link href="/docs/code-of-conduct"
                  className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:text-slate-900 transition-colors">
                  Read Guidelines
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <WhaleChatLink />
      <SovereignFooter />

      {/* Semantic spacer so SovereignFooter content is not hidden behind the fixed mobile bottom nav */}
      <div className="lg:hidden w-full" style={{ height: 'calc(64px + env(safe-area-inset-bottom, 0px))' }} />

      {/* ─── Bottom Tab Navigation (Mobile Only) ─── */}
      <nav className="mobile-bottom-nav lg:hidden fixed bottom-0 left-0 right-0 border-t border-slate-200/60 bg-white/90 backdrop-blur-md flex items-center justify-around px-1 shrink-0 z-50 transition-colors w-full" style={{ minHeight: 'calc(64px + env(safe-area-inset-bottom, 0px))', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
           {[
              { id: 'markets',     label: 'Telemetry' },
              { id: 'portfolio',   label: 'Portfolio' },
              { id: 'chat',        label: 'Chat' },
              { id: 'menu',        label: 'Menu' },
          ].map(tab => {
              return (
                  <button
                      key={tab.id}
                      onClick={() => {
                          if (tab.id === 'menu') {
                              router.push('/dashboard?tab=menu');
                          }
                          else if (tab.id === 'chat') router.push('/chat');
                          else if (tab.id === 'portfolio') router.push('/portfolio');
                          else router.push('/dashboard?tab=markets');
                      }}
                      style={{ minHeight: 0, minWidth: 0 }}
                      className={`relative flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-colors text-slate-500 hover:text-slate-900 py-4`}
                  >
                      <span className="font-mono text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
                  </button>
              );
          })}
      </nav>
    </div>
  );
}

export default function ForumHomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ForumHomeContent />
    </Suspense>
  );
}
