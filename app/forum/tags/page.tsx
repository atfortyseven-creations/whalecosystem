"use client";

import React, { useEffect, useState } from 'react';

export default function TagsPage() {
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/forum/tags')
      .then(r => r.json())
      .then(data => { if (!data.error) setTags(data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64 font-mono text-[10px] uppercase tracking-widest text-[#050505]/30">[ INDEXING_VECTORS ]</div>;
  }

  const maxTopics = tags.reduce((max, t) => Math.max(max, t._count?.topics || 0), 1);

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto gap-10">

      {/* ── Table Header ── */}
      <div className="flex items-center px-2 pb-4 border-b-[0.5px] border-black/10 select-none">
        <div className="flex-1 font-mono text-[8px] font-black uppercase tracking-[0.2em] text-[#050505]/40">Vector_Tag</div>
        <div className="w-32 font-mono text-[8px] font-black uppercase tracking-[0.2em] text-[#050505]/40 text-right">Frequency</div>
        <div className="w-48 font-mono text-[8px] font-black uppercase tracking-[0.2em] text-[#050505]/40 text-right hidden sm:block">Signal_Mass</div>
      </div>

      {tags.length === 0 ? (
        <div className="py-12 text-center font-mono text-[9px] uppercase tracking-widest text-[#050505]/20">[ NULL_VECTORS ]</div>
      ) : (
        <div className="flex flex-col">
          {tags.map(tag => {
            const freq = tag._count?.topics || 0;
            const signalPct = Math.round((freq / maxTopics) * 100);

            return (
              <div key={tag.id} className="flex items-center px-2 py-5 border-b-[0.5px] border-black/5 hover:bg-black/[0.02] transition-colors group">
                <div className="flex-1 min-w-0">
                  <span className="font-mono text-[13px] font-black uppercase tracking-widest text-[#050505] group-hover:underline">#{tag.name}</span>
                </div>
                <div className="w-32 text-right font-mono text-[10px] text-[#050505]/70">{freq}</div>
                <div className="w-48 hidden sm:flex justify-end items-center gap-2 pl-4">
                  <div className="flex-1 h-[2px] bg-black/5">
                    <div className="h-full bg-black/30 group-hover:bg-black transition-all duration-500" style={{ width: `${signalPct}%` }} />
                  </div>
                  <span className="font-mono text-[7px] text-[#050505]/30 uppercase tracking-widest w-8 text-right">{signalPct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 text-center">
        <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-[#050505]/20 select-none">END_OF_VECTOR_INDEX</span>
      </div>
    </div>
  );
}
