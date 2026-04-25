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
      <div className="flex items-center gap-6 border-b border-white/20 px-1 mb-0 text-[10px] font-mono font-black uppercase tracking-[0.2em]">
        <span className="pb-3 border-b-2 border-white text-white">LATEST</span>
        <span className="pb-3 text-white/40">NEW</span>
        <span className="pb-3 text-white/40">TOP</span>
      </div>

      {/* ── Table header ── */}
      <div className="flex items-center py-3 border-b border-white/20 text-[9px] font-mono font-black uppercase tracking-[0.2em] text-white/40">
        <div className="flex-1">SUBJECT</div>
        <div className="w-16 text-center hidden sm:block">REPLIES</div>
        <div className="w-16 text-center hidden sm:block">VIEWS</div>
        <div className="w-20 text-right">ACTIVITY</div>
      </div>

      {/* ── Topic rows ── */}
      <div className="flex flex-col">
        {topics.length === 0 ? (
          <div className="py-16 text-center text-[10px] font-mono uppercase tracking-[0.2em] text-white/30">
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
              className="flex items-center py-4 border-b border-white/10 hover:bg-white/5 transition-colors group"
            >
              <div className="flex-1 min-w-0 pr-6">
                <div className="text-[13px] font-mono font-black text-white truncate group-hover:underline underline-offset-2">
                  {topic.title}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: topic.category.color }}
                  />
                  <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-white/40">
                    {topic.category.name}
                  </span>
                </div>
              </div>

              <div className="w-16 text-center hidden sm:block text-[11px] font-mono text-white/50">
                {topic._count?.posts || 0}
              </div>
              <div className="w-16 text-center hidden sm:block text-[11px] font-mono text-white/50">
                {topic.views > 999 ? `${(topic.views / 1000).toFixed(1)}k` : topic.views}
              </div>
              <div className="w-20 text-right text-[11px] font-mono text-white/50">
                {activity}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
