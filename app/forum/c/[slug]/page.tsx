"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function CategoryPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/forum/categories/${slug}`)
      .then(r => r.json())
      .then(data => setCategory(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="flex items-center justify-center h-64 font-mono text-[10px] uppercase tracking-widest text-[#050505]/30">[ DECRYPTING_VECTOR ]</div>;
  if (!category || category.error) return <div className="flex items-center justify-center h-64 font-mono text-[10px] uppercase tracking-widest text-red-500">[ VECTOR_NOT_FOUND ]</div>;

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto">

      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-3 mb-10">
        <Link href="/forum" className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#050505]/30 hover:text-[#050505] transition-colors">
          Global_Ledger
        </Link>
        <span className="font-mono text-[8px] text-[#050505]/20">—</span>
        <span className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-[#050505] flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-sm inline-block" style={{ backgroundColor: category.color }} />
          {category.slug}
        </span>
        <div className="ml-auto">
          <Link
            href={`/forum/new?category=${category.id}`}
            className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#050505]/50 hover:text-[#050505] transition-colors border-b border-transparent hover:border-[#050505] pb-0.5"
          >
            [ + Initialize_Vector ]
          </Link>
        </div>
      </div>

      {/* ── Category Descriptor ── */}
      <div className="mb-10 flex flex-col gap-2">
        <p className="font-serif text-[16px] text-[#050505]/50 leading-relaxed max-w-2xl">
          {category.description}
        </p>
        <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#050505]/30">
          {category._count?.topics || 0} transmissions indexed
        </span>
      </div>

      {/* ── Table Header ── */}
      <div className="flex items-center px-2 pb-4 border-b-[0.5px] border-black/10 select-none">
        <div className="w-14 font-mono text-[8px] font-black uppercase tracking-[0.2em] text-[#050505]/40">Hash</div>
        <div className="flex-1 font-mono text-[8px] font-black uppercase tracking-[0.2em] text-[#050505]/40 pl-4">Payload</div>
        <div className="w-20 text-right font-mono text-[8px] font-black uppercase tracking-[0.2em] text-[#050505]/40">SNR</div>
        <div className="w-20 text-right font-mono text-[8px] font-black uppercase tracking-[0.2em] text-[#050505]/40">Velocity</div>
      </div>

      {/* ── Topic Rows ── */}
      <div className="flex flex-col">
        {!category.topics?.length ? (
          <div className="py-12 text-center font-mono text-[9px] uppercase tracking-widest text-[#050505]/20">[ NULL_DATA_IN_VECTOR ]</div>
        ) : category.topics.map((topic: any) => {
          const hashId = `0x${topic.id.slice(0, 4)}…`;
          const snrRaw = topic.views > 0 ? (((topic._count?.posts || 0) + (topic._count?.likes || 0) * 2) / topic.views) * 100 : 0;
          const snr = Math.min(100, snrRaw).toFixed(1);
          const hoursActive = Math.max(1, (new Date().getTime() - new Date(topic.createdAt).getTime()) / 3600000);
          const velocity = (topic.views / hoursActive).toFixed(1);

          return (
            <Link
              key={topic.id}
              href={`/forum/t/${topic.id}`}
              className="flex items-center px-2 py-5 border-b-[0.5px] border-black/5 hover:bg-black/[0.02] transition-colors group relative"
            >
              <div
                className="absolute left-0 top-0 bottom-0 w-[2px] opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: `linear-gradient(to bottom, transparent, ${category.color}, transparent)` }}
              />
              <div className="w-14 font-mono text-[9px] text-[#050505]/30 group-hover:text-[#050505]/60 transition-colors">{hashId}</div>
              <div className="flex-1 flex flex-col gap-1 pl-4 min-w-0">
                <span className="font-serif text-[15px] text-[#050505] truncate">{topic.title}</span>
                <span className="font-mono text-[8px] uppercase tracking-widest text-[#050505]/40">
                  op_{topic.author?.walletAddress.slice(0, 6)}
                  {topic.author?.isPro && <span className="ml-2 text-[#D4AF37]">•</span>}
                </span>
              </div>
              <div className="w-20 text-right font-mono text-[10px] text-[#050505]/70">{snr}%</div>
              <div className="w-20 text-right font-mono text-[10px] text-[#050505]/70">
                {velocity} <span className="text-[7px] text-[#050505]/30">v/h</span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-10 text-center">
        <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-[#050505]/20 select-none">END_OF_VECTOR</span>
      </div>
    </div>
  );
}
