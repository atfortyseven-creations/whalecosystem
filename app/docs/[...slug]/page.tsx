"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { docContent } from '@/lib/docs/data';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export function DynamicDocPage() {
  const params = useParams();
  const rawSlug = params?.slug;
  const slug = Array.isArray(rawSlug) ? rawSlug.join('/') : (rawSlug || '');
  
  const content = (slug && docContent[slug]) || {
    title: 'Component Under Construction',
    category: 'Protocol Repository',
    content: '# Work in Progress\n\nThis section of the Whale Alert Corporation Protocol Repository is currently being synchronized with the main chain nodes. Please check back in a subsequent epoch.'
  };

  const parseMD = (str: string) => {
    return str
      .replace(/^# (.*$)/gim, '<h1 class="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-12 border-b border-zinc-100 dark:border-zinc-900 pb-8">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-black uppercase tracking-tighter mt-16 mb-6">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-sm font-black uppercase tracking-[0.3em] mt-10 mb-4 opacity-40">$1</h3>')
      .replace(/^\* (.*$)/gim, '<li class="ml-6 mb-3 list-none before:content-[\'—\'] before:mr-4 before:opacity-20">$1</li>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-black text-black dark:text-white">$1</strong>')
      .replace(/```typescript\n([\s\S]*?)```/gim, '<pre class="bg-zinc-50 dark:bg-zinc-950 p-8 border border-black/5 dark:border-white/5 text-[12px] font-mono my-10 overflow-x-auto selection:bg-zinc-200 selection:text-black"><code>$1</code></pre>')
      .replace(/`(.*?)`/gim, '<code class="bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 text-[11px] font-mono border border-black/5 dark:border-white/5">$1</code>')
      .replace(/\n\n/gim, '<div class="h-6"></div>');
  };

  return (
    <div className="animate-in fade-in duration-700">
      <Link href="/docs" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] opacity-40 hover:opacity-100 transition-opacity mb-16">
        <ArrowLeft size={12} /> Back to Repository
      </Link>
      
      <div className="mb-12">
        <div className="text-[10px] font-black opacity-20 uppercase tracking-[0.5em] mb-4">
          {content.category} / {slug.replace('/', ' / ')}
        </div>
      </div>

      <article 
        className="prose prose-zinc dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-400 font-medium"
        dangerouslySetInnerHTML={{ __html: parseMD(content.content) }}
      />

      <footer className="mt-32 pt-12 border-t border-black/5 dark:border-white/5">
         <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-20">
           © Whale Alert Corporation — Proprietary Repository Access v2.0
         </p>
      </footer>
    </div>
  );
}
