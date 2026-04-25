"use client";

import React, { useEffect, useState } from 'react';

export default function TagsPage() {
  const [tags, setTags] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/forum/tags')
      .then(r => r.json())
      .then(data => { if (!data.error) setTags(data); })
      .catch(console.error);
  }, []);

  const maxTopics = tags.reduce((m, t) => Math.max(m, t._count?.topics || 0), 1);

  return (
    <div className="flex flex-col w-full max-w-[860px] mx-auto py-10 px-4">

      <div className="mb-8 pb-6 border-b border-[#E0E0E0]">
        <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#050505]/30 mb-2">FORUM / TAGS</div>
        <h1 className="text-[13px] font-mono font-black uppercase tracking-[0.2em] text-[#050505]">
          VECTOR INDEX
        </h1>
      </div>

      {/* Table header */}
      <div className="flex items-center pb-3 border-b border-[#E0E0E0] text-[9px] font-mono font-black uppercase tracking-[0.2em] text-[#050505]/30">
        <div className="flex-1">TAG</div>
        <div className="w-48 hidden sm:block">SIGNAL MASS</div>
        <div className="w-16 text-right">COUNT</div>
      </div>

      {tags.length === 0 ? (
        <div className="py-16 text-center text-[10px] font-mono uppercase tracking-[0.2em] text-[#050505]/20">
          [ NULL VECTORS ]
        </div>
      ) : tags.map(tag => {
        const freq = tag._count?.topics || 0;
        const pct  = Math.round((freq / maxTopics) * 100);
        return (
          <div
            key={tag.id}
            className="flex items-center py-4 border-b border-[#F0F0F0] hover:bg-[#FAF9F6] transition-colors group"
          >
            <div className="flex-1 min-w-0">
              <span className="text-[12px] font-mono font-black uppercase tracking-widest text-[#050505] group-hover:underline underline-offset-2">
                #{tag.name}
              </span>
            </div>
            <div className="w-48 hidden sm:flex items-center gap-3 pr-4">
              <div className="flex-1 h-px bg-[#E0E0E0]">
                <div
                  className="h-full bg-[#050505] transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-[9px] font-mono text-[#050505]/30 w-8 text-right">{pct}%</span>
            </div>
            <div className="w-16 text-right text-[11px] font-mono font-black text-[#050505]">
              {freq}
            </div>
          </div>
        );
      })}
    </div>
  );
}
