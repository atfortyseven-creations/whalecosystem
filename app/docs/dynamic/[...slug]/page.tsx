"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { docContent } from '@/lib/docs/data';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DynamicDocPage({ slug: propSlug }: { slug?: string } = {}) {
  const params = useParams();
  const rawSlug = params?.slug;
  const slug = propSlug || (Array.isArray(rawSlug) ? rawSlug.join('/') : (rawSlug || ''));
  
  const content = (slug && docContent[slug]) || {
    title: 'Architectural Specification',
    category: 'Protocol Repository',
    content: '# Institutional Documentation\n\nThis section of the Whale Alert Corporation Protocol Repository contains advanced operational data. The telemetry feed is currently synchronizing with the primary chain nodes.\n\n## Network Status\nAll nodes are fully operational and maintaining a strict zero-knowledge posture. Please refer to the Developer Overview for immediate API references.'
  };

  const parseMD = (str: string) => {
    return str
      .replace(/^# (.*$)/gim, '<h1 class="font-aztec-h1 text-4xl sm:text-5xl font-light text-black mb-10 pb-4 border-b border-black/10 tracking-tight">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="font-mono text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-black mt-16 mb-6">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="font-serif text-lg text-black font-semibold mt-8 mb-4">$1</h3>')
      .replace(/^\* (.*$)/gim, '<li class="font-serif text-[14px] sm:text-[15px] text-[#333] leading-relaxed mb-2 ml-4 list-disc pl-2 marker:text-black/30">$1</li>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold text-black">$1</strong>')
      .replace(/```([a-z]*)\n([\s\S]*?)```/gim, '<div class="my-6"><div class="bg-black/5 border border-black/10 px-3 py-1 font-mono text-[9px] uppercase tracking-widest text-black/50 w-full">$1 code</div><pre class="bg-[#FAFAF8] border border-t-0 border-black/10 p-5 overflow-x-auto text-black/80 font-mono text-xs sm:text-[13px] leading-relaxed"><code>$2</code></pre></div>')
      .replace(/`(.*?)`/gim, '<code class="bg-black/5 border border-black/10 px-1.5 py-0.5 rounded-sm font-mono text-[11px] text-black">$1</code>')
      .replace(/^(?!<h|<li|<div|<pre)(.+)$/gim, '<p class="font-serif text-[15px] sm:text-[16px] text-[#222] leading-[1.8] mb-6 text-justify">$1</p>')
      .replace(/\n/gim, '');
  };

  return (
    <div className="doc-content animate-in fade-in duration-500">
      <Link href="/docs" className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] opacity-30 hover:opacity-70 transition-opacity mb-12">
        <ArrowLeft size={11} /> Docs
      </Link>

      <div className="font-mono text-[9px] uppercase tracking-[0.3em] opacity-20 mb-6">
        {content.category} / {slug.replace(/\//g, ' / ')}
      </div>

      <article
        dangerouslySetInnerHTML={{ __html: parseMD(content.content) }}
      />

      <footer className="mt-24 pt-8 border-t border-current/8">
        <p className="font-mono text-[9px] uppercase tracking-[0.3em] opacity-20">
          © 2026 atfortyseven-creations · Whale Alert Network
        </p>
      </footer>
    </div>
  );
}
