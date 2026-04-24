"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ForumHomePage() {
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/forum/topics?limit=30')
      .then(r => r.json())
      .then(data => setTopics(data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 font-mono text-[10px] uppercase tracking-widest text-[#050505]/30">
        [ SYNCING_LEDGER ]
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0 w-full max-w-5xl mx-auto">
      
      {/* ── Header Actions ── */}
      <div className="flex items-center justify-end mb-8">
        <Link 
          href="/forum/new" 
          className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#050505]/50 hover:text-[#050505] transition-colors border-b border-transparent hover:border-[#050505] pb-0.5"
        >
          [ + Initialize_Vector ]
        </Link>
      </div>

      {/* ── Table Header ── */}
      <div className="flex items-center px-2 pb-4 border-b-[0.5px] border-black/10 select-none">
         <div className="w-16 font-mono text-[8px] font-black uppercase tracking-[0.2em] text-[#050505]/40 text-left">Hash</div>
         <div className="flex-1 font-mono text-[8px] font-black uppercase tracking-[0.2em] text-[#050505]/40 pl-4">Intelligence Payload</div>
         <div className="w-24 font-mono text-[8px] font-black uppercase tracking-[0.2em] text-[#050505]/40 text-center hidden md:block">Classification</div>
         <div className="w-20 font-mono text-[8px] font-black uppercase tracking-[0.2em] text-[#050505]/40 text-right">SNR</div>
         <div className="w-20 font-mono text-[8px] font-black uppercase tracking-[0.2em] text-[#050505]/40 text-right">Velocity</div>
      </div>

      {/* ── Telemetry Rows ── */}
      <div className="flex flex-col">
        {topics.length === 0 ? (
          <div className="py-12 text-center font-mono text-[9px] uppercase tracking-widest text-[#050505]/20">
            [ NULL_DATA ]
          </div>
        ) : topics.map(topic => {
          // Mathematical abstractions for Vanguard Design
          const hashId = `0x${topic.id.slice(0, 4)}…`;
          const snrRaw = topic.views > 0 ? ((topic._count.posts + topic._count.likes * 2) / topic.views) * 100 : 0;
          const snr = snrRaw > 100 ? 100 : snrRaw.toFixed(1);
          
          const hoursActive = Math.max(1, (new Date().getTime() - new Date(topic.createdAt).getTime()) / 3600000);
          const velocity = (topic.views / hoursActive).toFixed(1);

          return (
            <Link 
              key={topic.id} 
              href={`/forum/t/${topic.id}`}
              className="flex items-center px-2 py-5 border-b-[0.5px] border-black/5 hover:bg-black/[0.02] transition-colors group relative"
            >
              {/* Subtle ambient heat map based on velocity */}
              <div 
                className="absolute left-0 top-0 bottom-0 w-[2px] opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ 
                  background: parseFloat(velocity) > 10 ? 'linear-gradient(to bottom, transparent, #ef4444, transparent)' : 'linear-gradient(to bottom, transparent, #050505, transparent)' 
                }}
              />

              <div className="w-16 font-mono text-[9px] text-[#050505]/30 group-hover:text-[#050505]/60 transition-colors">
                {hashId}
              </div>
              
              <div className="flex-1 flex flex-col gap-1 pl-4 min-w-0">
                <span className="font-serif text-[15px] text-[#050505] truncate">
                  {topic.title}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[8px] uppercase tracking-widest text-[#050505]/40">
                    op_{topic.author.walletAddress.slice(0,6)}
                  </span>
                  {topic.author.isPro && (
                    <span className="w-1 h-1 rounded-full bg-[#D4AF37]" title="Proof of Skin in the Game (POSG)" />
                  )}
                </div>
              </div>

              <div className="w-24 text-center hidden md:flex justify-center">
                 <span 
                   className="font-mono text-[8px] uppercase tracking-[0.2em] border px-1.5 py-0.5 rounded-sm"
                   style={{ borderColor: `${topic.category.color}40`, color: topic.category.color }}
                 >
                   {topic.category.slug.slice(0,3)}
                 </span>
              </div>

              <div className="w-20 text-right font-mono text-[10px] text-[#050505]/70">
                {snr}%
              </div>
              
              <div className="w-20 text-right font-mono text-[10px] text-[#050505]/70">
                {velocity} <span className="text-[7px] text-[#050505]/30">v/h</span>
              </div>
            </Link>
          );
        })}
      </div>
      
      <div className="mt-8 text-center">
         <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-[#050505]/20 select-none">
           END_OF_LEDGER
         </span>
      </div>
    </div>
  );
}
