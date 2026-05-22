"use client";

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { formatDistanceToNowStrict } from 'date-fns';
import { useSearchParams } from 'next/navigation';
import { SystemFooter } from '@/components/landing/SystemFooter';
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
      
      <div className="w-full flex flex-col items-center justify-start relative min-h-screen bg-white pt-24 pb-20">
        <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 flex flex-col z-10">
          
          {/* 
              DISCOURSE-STYLE HEADER
           */}
          <section className="w-full flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-200/60 pb-6 mb-10 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 mb-2">Forum</h1>
              <p className="text-sm font-medium text-slate-500">A structured space for discussion, ideas, and knowledge sharing.</p>
            </div>
            <Link href="/forum/new"
              className="inline-flex items-center justify-center px-6 py-3 rounded bg-[#0088cc] text-white font-sans text-[14px] font-bold hover:bg-[#0077b3] transition-all shadow-sm">
              + New Topic
            </Link>
          </section>

          {/* 
              MAIN CONTENT  Categories (Left) + Topics (Right)
           */}
          <div className="w-full flex flex-col lg:flex-row gap-12 lg:gap-16">

            {/* LEFT SIDEBAR  Categories */}
            <div className="w-full lg:w-[340px] shrink-0">
              <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-slate-200">
                 <h2 className="font-sans text-[13px] font-bold text-slate-500 uppercase tracking-wide">Category</h2>
                 <span className="font-sans text-[13px] font-bold text-slate-500 uppercase tracking-wide">Topics</span>
              </div>
              <div className="flex flex-col">
                {categories.length === 0 ? (
                  <div className="py-4 text-[12px] font-medium text-slate-400">Loading...</div>
                ) : categories.map((cat, i) => {
                  // Generate a deterministic color based on category index
                  const colors = ['bg-green-500', 'bg-blue-500', 'bg-red-500', 'bg-amber-500', 'bg-sky-500', 'bg-slate-800', 'bg-pink-500', 'bg-purple-500'];
                  const color = colors[i % colors.length];

                  return (
                    <Link key={cat.id} href={`/forum/c/${cat.slug}`}
                      className="group flex flex-col py-4 border-b border-slate-100 hover:bg-slate-50 transition-colors px-2 -mx-2">
                      <div className="flex items-start justify-between mb-1 gap-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-sm ${color} shrink-0 mt-1`} />
                          <span className="text-[15px] font-bold text-slate-900 group-hover:text-[#0088cc] transition-colors">{cat.name}</span>
                        </div>
                        {cat._count?.topics !== undefined && (
                          <span className="text-[15px] font-medium text-slate-500 shrink-0">{cat._count.topics}</span>
                        )}
                      </div>
                      {cat.description && (
                        <span className="block text-[13px] text-slate-500 leading-snug pl-4.5">{cat.description}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* RIGHT  Topics */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-[#0088cc]">
                <h2 className="font-sans text-[13px] font-bold text-[#0088cc] uppercase tracking-wide">
                  Latest
                </h2>
              </div>

              <div className="flex flex-col">
                {topics.length === 0 ? (
                  <div className="py-20 flex flex-col items-center gap-4 text-center">
                    <p className="text-[14px] text-slate-500">No active discussions yet.</p>
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
                      className="group flex items-center justify-between py-4 border-b border-slate-100 hover:bg-slate-50 transition-colors px-2 -mx-2 gap-4"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-bold text-slate-600 bg-slate-200 shrink-0 uppercase">
                          {topic.author?.walletAddress?.slice(2, 4) || 'ID'}
                        </div>

                        {/* Content */}
                        <div className="flex flex-col min-w-0 gap-1">
                          <h3 className="font-sans text-[16px] font-medium text-slate-900 group-hover:text-[#0088cc] transition-colors truncate">
                            {topic.title}
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            {topic.category && (
                              <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-sm bg-slate-400" />
                                <span className="text-[12px] text-slate-500">{topic.category.name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-6 shrink-0 text-slate-500">
                        <div className="flex flex-col items-end">
                          <span className="text-[14px] font-medium text-slate-700">{topic._count?.posts || 0}</span>
                          <span className="text-[12px] opacity-0 group-hover:opacity-100 transition-opacity">replies</span>
                        </div>
                        <div className="flex flex-col items-end min-w-[30px]">
                          <span className="text-[14px] text-slate-500">{isMounted ? activity : ''}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>

      <WhaleChatLink />
      <SystemFooter />
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
