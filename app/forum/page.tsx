"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNowStrict } from 'date-fns';

export default function ForumHomePage() {
  const [topics, setTopics] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/forum/topics?limit=30')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setTopics(data); })
      .catch(console.error);
  }, []);

  return (
    <div className="flex flex-col w-full">

      {/* ── Tab bar ── */}
      <div className="flex items-center gap-6 border-b border-[#E0E0E0] px-1 mb-0 text-[10px] font-mono font-black uppercase tracking-[0.2em]">
        <span className="pb-3 border-b-2 border-[#050505] text-[#050505]">LATEST</span>
        <span className="pb-3 text-[#050505]/30">NEW</span>
        <span className="pb-3 text-[#050505]/30">TOP</span>
      </div>

      {/* ── Table header ── */}
      <div className="flex items-center py-3 border-b border-[#E0E0E0] text-[9px] font-mono font-black uppercase tracking-[0.2em] text-[#050505]/30">
        <div className="flex-1">SUBJECT</div>
        <div className="w-16 text-center hidden sm:block">REPLIES</div>
        <div className="w-16 text-center hidden sm:block">VIEWS</div>
        <div className="w-20 text-right">ACTIVITY</div>
      </div>

      {/* ── Topic rows ── */}
      <div className="flex flex-col">
        {topics.length === 0 ? (
          <div className="py-16 text-center text-[10px] font-mono uppercase tracking-[0.2em] text-[#050505]/20">
            [ NO TRANSMISSIONS ]
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
              className="flex items-center py-4 border-b border-[#F0F0F0] hover:bg-[#FAF9F6] transition-colors group"
            >
              <div className="flex-1 min-w-0 pr-6">
                <div className="text-[13px] font-mono font-black text-[#050505] truncate group-hover:underline underline-offset-2">
                  {topic.title}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: topic.category.color }}
                  />
                  <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-[#050505]/30">
                    {topic.category.name}
                  </span>
                </div>
              </div>

              <div className="w-16 text-center hidden sm:block text-[11px] font-mono text-[#050505]/40">
                {topic._count?.posts || 0}
              </div>
              <div className="w-16 text-center hidden sm:block text-[11px] font-mono text-[#050505]/40">
                {topic.views > 999 ? `${(topic.views / 1000).toFixed(1)}k` : topic.views}
              </div>
              <div className="w-20 text-right text-[11px] font-mono text-[#050505]/40">
                {activity}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
