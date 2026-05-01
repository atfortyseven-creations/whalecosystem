"use client";

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { formatDistanceToNowStrict } from 'date-fns';
import { useSearchParams } from 'next/navigation';

function ForumHomeContent() {
  const [topics, setTopics] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const searchParams = useSearchParams();
  const rawFilter = searchParams.get('filter');
  const filter = rawFilter || 'matrix';
  const isRestricted = false; // Removed hardcoded restriction
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
    <div className="w-full min-h-screen bg-[#FFFDF8] dark:bg-[#050505] text-[#1C1917] dark:text-[#FAF9F6] selection:bg-[#00C076]/30 py-12 px-4 font-sans relative overflow-hidden transition-colors duration-300">
      {/* Background Volumetric Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#00C076]/10 blur-[150px] pointer-events-none -z-10 rounded-full mix-blend-screen" />
      
      <div className="max-w-[1110px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-[60px]">
        
        {/* Left Column: Categories (35% -> col-span-4) */}
        <div className="lg:col-span-4 flex flex-col gap-0 pt-4 border-t border-white/10">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-[#555]">Categories</h2>
          {categories.length === 0 ? (
             <div className="py-4 text-[13px] text-black/40 dark:text-white/30 font-sans">Loading matrix...</div>
          ) : categories.map(cat => (
            <Link key={cat.id} href={`/forum/c/${cat.slug}`} className="group flex items-start py-5 transition-all duration-300 ease-in-out px-4 rounded-xl sm:-mx-4 hover:bg-black/5 dark:hover:bg-white/[0.02] border border-transparent hover:border-black/10 dark:hover:border-white/5 border-b-black/5 dark:border-b-white/5 mb-2 hover:shadow-md dark:hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]" style={{ transformStyle: 'preserve-3d' }}>
              <div className="w-1.5 h-1.5 rounded-full mr-4 mt-2 shadow-[0_0_10px_currentColor]" style={{ backgroundColor: cat.color || '#00C076', color: cat.color || '#00C076' }}></div>
              <div className="flex flex-col">
                <span className="text-[16px] font-black tracking-tight transition-colors text-black dark:text-white group-hover:text-[#00C076]">{cat.name}</span>
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
                  className="flex items-start py-5 px-5 rounded-2xl group transition-all duration-300 bg-black/[0.02] dark:bg-white/[0.01] border border-black/10 dark:border-white/5 hover:bg-white dark:hover:bg-white/[0.03] hover:border-[#00C076]/30 hover:shadow-lg dark:hover:shadow-[0_10px_30px_rgba(0,192,118,0.1)] relative overflow-hidden"
                >
                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-[#00C076]/5 to-transparent pointer-events-none" />

                  {/* Avatar */}
                  <div className="w-[50px] shrink-0 pt-1 relative z-10">
                    <div className="w-[40px] h-[40px] rounded-xl flex items-center justify-center text-[12px] font-black text-black/50 dark:text-[#555] bg-black/5 dark:bg-black border border-black/10 dark:border-white/10 group-hover:border-[#00C076]/50 transition-colors">
                      {topic.author?.walletAddress?.slice(2, 4).toUpperCase() || 'ID'}
                    </div>
                  </div>

                  {/* Title & Badges */}
                  <div className="flex-1 flex flex-col pr-4 min-w-0 relative z-10">
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

                  {/* Stats */}
                  <div className="w-[70px] flex flex-col items-end shrink-0 gap-1 pt-1 relative z-10">
                    <div className="flex items-center gap-1.5 text-black/40 dark:text-[#555]">
                        <span className="text-[12px] font-black">{topic._count?.posts || 0}</span>
                        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                    </div>
                    <span className="text-[10px] font-bold text-black/60 dark:text-[#444]">{activity}</span>
                  </div>
                </Link>
              );
            })}
          </div>
          )}
        </div>
      </div>
      </div>
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
