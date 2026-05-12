"use client";

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { formatDistanceToNowStrict } from 'date-fns';
import { useSearchParams } from 'next/navigation';
import { SovereignFooter } from '@/components/landing/SovereignFooter';
import { motion } from 'framer-motion';
import { RemoteLottie } from '@/components/ui/RemoteLottie';
import { Activity } from 'lucide-react';

function ForumHomeContent() {
  const [topics, setTopics] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const searchParams = useSearchParams();
  const rawFilter = searchParams.get('filter');
  const filter = rawFilter || 'matrix';
  const isRestricted = false; // Removed hardcoded restriction
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);
  useEffect(() => {
    if (!isRestricted) {
      fetch(`/api/forum/topics?limit=30&filter=${filter === 'matrix' ? 'latest' : filter}`)
        .then(r => r.json())
        .then(data => { if (Array.isArray(data)) setTopics(data); })
        .catch(console.error);
    } else {
      setTopics([]); // Clear topics if restricted
    }

    fetch('/api/forum/categories')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setCategories(data); })
      .catch(console.error);
  }, [filter]);

  return (
    <div className="w-full min-h-screen bg-[#FAFAF8] dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#FAFAF8] selection:bg-[#0044CC]/20 py-20 px-6 font-sans relative transition-colors duration-300 overflow-x-hidden">
      
      <div className="max-w-[1200px] mx-auto mb-20">
        {/* ── ACADEMIC WELCOME HERO ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full bg-white dark:bg-[#111] rounded-[2rem] md:rounded-[3rem] border border-black/5 dark:border-white/5 shadow-sm p-6 md:p-16 flex flex-col lg:flex-row items-center gap-10 md:gap-16 overflow-hidden relative">
            
            {/* Ambient background Lottie (Lottie 1) */}
            <div className="absolute opacity-[0.03] dark:opacity-[0.05] pointer-events-none -left-20 -top-20 z-0">
               <RemoteLottie path="isometric-cube.json" className="w-[500px] h-[500px]" />
            </div>

            <div className="w-full lg:w-1/2 relative z-10 space-y-6 md:space-y-8 text-center lg:text-left">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-[#FAFAF8] dark:bg-[#0A0A0A] border border-black/5 dark:border-white/5 rounded-full shadow-sm mx-auto lg:mx-0">
                    <Activity size={14} className="text-[#0044CC] dark:text-[#4d88ff]" />
                    <span className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-slate-500">Cryptographic Perimeter</span>
                </div>
                <h2 className="text-[36px] md:text-[56px] lg:text-[64px] font-black uppercase text-[#0A0A0A] dark:text-white leading-[1.05] md:leading-[0.95] tracking-tighter">
                    Sovereign <br className="hidden md:block" /><span className="text-[#0044CC] dark:text-[#4d88ff]">Dialogue.</span>
                </h2>
                <p className="font-serif text-[15px] md:text-[18px] text-slate-500 leading-relaxed max-w-lg mx-auto lg:mx-0">
                    A secure perimeter for institutional discourse. All interactions are cryptographically signed, ensuring absolute authenticity. This eliminates the noise of public networks and fosters a highly focused, academic environment strictly for authenticated participants.
                </p>
            </div>
            
            {/* Primary Display Lottie (Lottie 2) */}
            <div className="w-full lg:w-1/2 relative z-10 aspect-square md:aspect-video flex items-center justify-center bg-[#FAFAF8] dark:bg-[#0A0A0A] rounded-[1.5rem] md:rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm p-4 md:p-8 overflow-hidden">
                <RemoteLottie path="social.json" className="scale-[1.5] md:scale-[1.8] w-full" />
            </div>
        </motion.div>
      </div>
      
      <div className="max-w-[1200px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-[60px]">
        
        {/* Left Column: Categories (35% -> col-span-4) */}
        <div className="lg:col-span-4 flex flex-col gap-0 pt-4 border-t border-white/10">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-[#555]">Categories</h2>
          {categories.length === 0 ? (
             <div className="py-4 text-[13px] text-black/40 dark:text-white/30 font-sans">Loading matrix...</div>
          ) : categories.map(cat => (
            <Link key={cat.id} href={`/forum/c/${cat.slug}`} className="group flex items-start py-5 transition-all duration-300 ease-in-out px-4 rounded-xl sm:-mx-4 hover:bg-black/5 dark:hover:bg-white/[0.02] border border-transparent hover:border-black/10 dark:hover:border-white/5 border-b-black/5 dark:border-b-white/5 mb-2 hover:shadow-md dark:hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]" style={{ transformStyle: 'preserve-3d' }}>

              <div className="flex flex-col">
                <div className="flex items-center justify-between w-full">
                  <span className="text-[16px] font-black tracking-tight transition-colors text-black dark:text-white group-hover:text-[#00C076]">{cat.name}</span>
                  {cat._count?.topics !== undefined && (
                    <span className="text-[10px] font-mono font-bold text-black/40 dark:text-white/40 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-md">
                      {cat._count.topics} {cat._count.topics === 1 ? 'TOPIC' : 'TOPICS'}
                    </span>
                  )}
                </div>
                <span className="text-[12px] mt-1.5 leading-relaxed line-clamp-2 text-[#888888]">{cat.description || "Topics related to " + cat.name}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Right Column: Latest Activity (65% -> col-span-8) */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#555]">
              {filter === 'matrix' ? 'Categories Overview' : filter}
            </h2>
          </div>

          {isRestricted ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-black/[0.02] dark:bg-white/[0.02] border border-red-500/20 rounded-2xl">
              <svg className="w-12 h-12 text-red-500 mb-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              <h3 className="text-[14px] font-black uppercase tracking-widest text-red-500 mb-2">Tier 1 Clearance Required</h3>
              <p className="text-[11px] font-mono text-black/60 dark:text-white/60 max-w-sm">
                Access to {rawFilter?.toUpperCase()} is restricted. Please log in to view this section.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {topics.length === 0 ? (
                <div className="py-20 text-center text-[12px] font-black uppercase tracking-widest text-[#555]">
                  NO ACTIVE TOPICS FOUND.
                </div>
              ) : topics.map(topic => {
              const activity = formatDistanceToNowStrict(new Date(topic.updatedAt || topic.createdAt), { addSuffix: false })
                .replace(' minutes', 'm').replace(' minute', 'm')
                .replace(' hours', 'h').replace(' hour', 'h')
                .replace(' days', 'd').replace(' day', 'd')
                .replace(' months', 'mo').replace(' month', 'mo')
                .replace(' years', 'y').replace(' year', 'y');

              return (
                <Link
                  key={topic.id}
                  href={`/forum/t/${topic.id}`}
                  className="flex flex-col sm:flex-row items-start py-5 px-5 rounded-2xl group transition-all duration-300 bg-black/[0.02] dark:bg-white/[0.01] border border-black/10 dark:border-white/5 hover:bg-white dark:hover:bg-white/[0.03] hover:border-[#00C076]/30 hover:shadow-lg dark:hover:shadow-[0_10px_30px_rgba(0,192,118,0.1)] relative overflow-hidden"
                >
                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-[#00C076]/5 to-transparent pointer-events-none" />

                  <div className="flex w-full sm:w-auto items-start flex-1 min-w-0">
                    {/* Avatar */}
                    <div className="w-[50px] shrink-0 pt-1 relative z-10">
                      <div className="w-[40px] h-[40px] rounded-xl flex items-center justify-center text-[12px] font-black text-black/50 dark:text-[#555] bg-black/5 dark:bg-black border border-black/10 dark:border-white/10 group-hover:border-[#00C076]/50 transition-colors">
                        {topic.author?.walletAddress?.slice(2, 4).toUpperCase() || 'ID'}
                      </div>
                    </div>

                    {/* Title & Badges */}
                    <div className="flex-1 flex flex-col pr-0 sm:pr-4 min-w-0 relative z-10">
                      <span className="font-bold text-[18px] leading-[1.3] text-black dark:text-white group-hover:text-[#00C076] transition-colors line-clamp-2">
                        {topic.title}
                      </span>
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        {topic.category && (
                          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white dark:bg-black border border-black/10 dark:border-white/10 group-hover:border-[#00C076]/30 transition-colors">
                            <div className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: topic.category.color || '#00C076', color: topic.category.color || '#00C076' }} />
                            <span className="text-[9px] font-black tracking-widest uppercase text-black dark:text-white">{topic.category.name}</span>
                          </div>
                        )}
                        {topic.tags?.map((t: any) => (
                          <span key={t.id} className="text-[9px] font-bold tracking-widest uppercase bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 px-2 py-0.5 rounded-md text-black/60 dark:text-[#888888]">
                            {t.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="w-full sm:w-[70px] flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start shrink-0 gap-1 pt-4 sm:pt-1 mt-4 sm:mt-0 border-t sm:border-t-0 border-black/5 dark:border-white/5 relative z-10">
                    <div className="flex items-center gap-1.5 text-black/40 dark:text-[#555]">
                        <span className="text-[12px] font-black">{topic._count?.posts || 0}</span>
                        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                    </div>
                    <span className="text-[10px] font-bold text-black/60 dark:text-[#444]">{isMounted ? activity : ''}</span>
                  </div>
                </Link>
              );
            })}
          </div>
          )}
        </div>
      </div>
      </div>
      <SovereignFooter />
    </div>
  );
}

export default function ForumHomePage() {
  return (
    <Suspense fallback={<div className="w-full pt-10 px-4 text-center text-gray-500">Loading forum...</div>}>
      <ForumHomeContent />
    </Suspense>
  );
}
