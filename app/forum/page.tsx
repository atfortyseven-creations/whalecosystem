"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNowStrict } from 'date-fns';

export default function ForumHomePage() {
  const [topics, setTopics] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/forum/topics?limit=30')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setTopics(data); })
      .catch(console.error);

    fetch('/api/forum/categories')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setCategories(data); })
      .catch(console.error);
  }, []);

  return (
    <div className="w-full max-w-[1110px] mx-auto pt-10 pb-20 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-[40px]">
        
        {/* Left Column: Categories (35% -> col-span-4) */}
        <div className="lg:col-span-4 flex flex-col gap-0 pt-4" style={{ borderTop: '1px solid var(--forum-border)' }}>
          <h2 className="text-[13px] font-sans font-bold uppercase tracking-widest mb-6" style={{ color: 'var(--forum-text-muted)' }}>Categories</h2>
          {categories.length === 0 ? (
             <div className="py-4 text-[13px] text-white/30 font-sans">Loading categories...</div>
          ) : categories.map(cat => (
            <Link key={cat.id} href={`/forum/c/${cat.slug}`} className="group flex items-start py-4 transition-all duration-200 ease-in-out px-2 rounded-sm sm:-mx-2 transform-gpu" style={{ borderBottom: '1px solid var(--forum-border)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--forum-hover)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
              <div className="w-1 h-10 rounded-sm mr-4 mt-1" style={{ backgroundColor: cat.color || '#6366f1' }}></div>
              <div className="flex flex-col">
                <span className="text-[18.4px] font-sans font-bold transition-colors" style={{ color: 'var(--forum-text)' }}>{cat.name}</span>
                <span className="text-[13px] mt-1 leading-[1.4] line-clamp-2" style={{ color: 'var(--forum-text-muted)' }}>{cat.description || "Discuss topics related to " + cat.name}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Right Column: Latest Activity (65% -> col-span-8) */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="flex items-center justify-between pb-2 mb-4" style={{ borderBottom: '1px solid var(--forum-border)' }}>
            <h2 className="text-[13px] font-sans font-bold uppercase tracking-widest" style={{ color: 'var(--forum-text-muted)' }}>Latest</h2>
          </div>

          <div className="flex flex-col">
            {topics.length === 0 ? (
              <div className="py-16 text-center text-[13px] font-sans text-[#919191]">
                No topics found.
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
                  className="flex items-start py-4 transition-all duration-200 ease-in-out px-2 rounded-sm sm:-mx-2 group transform-gpu"
                  style={{ borderBottom: '1px solid var(--forum-border)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--forum-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {/* Avatar */}
                  <div className="w-[45px] shrink-0 pt-1">
                    <div className="w-[32px] h-[32px] rounded-full flex items-center justify-center text-[10px] font-mono" style={{ backgroundColor: 'var(--forum-surface)', border: '1px solid var(--forum-border)', color: 'var(--forum-text-muted)' }}>
                      {topic.author?.walletAddress?.slice(2, 4).toUpperCase() || 'A'}
                    </div>
                  </div>

                  {/* Title & Badges */}
                  <div className="flex-1 flex flex-col pr-4 min-w-0">
                    <span className="font-sans font-semibold text-[20px] leading-[1.4] tracking-[-0.01em] break-words" style={{ color: 'var(--forum-text)' }}>
                      {topic.title}
                    </span>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {topic.category && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[2px]" style={{ backgroundColor: 'var(--forum-surface)', border: '1px solid var(--forum-border)' }}>
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: topic.category.color || '#6366f1' }} />
                          <span className="text-[12px] font-sans font-bold" style={{ color: 'var(--forum-text)' }}>{topic.category.name}</span>
                        </div>
                      )}
                      {topic.tags?.map((t: any) => (
                        <span key={t.id} className="text-[12px] font-sans before:content-['#'] before:mr-[1px] transition-colors" style={{ color: 'var(--forum-text-muted)' }}>
                          {t.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="w-[60px] flex flex-col items-end shrink-0 gap-1 pt-1">
                    <span className="text-[14px] font-sans" style={{ color: 'var(--forum-text-muted)' }}>{topic._count?.posts || 0}</span>
                    <span className="text-[14px] font-sans" style={{ color: 'var(--forum-text-muted)' }}>{activity}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
