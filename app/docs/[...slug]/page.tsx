"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { docContent } from '@/lib/docs/data';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DynamicDocPage() {
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
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^\* (.*$)/gim, '<li>$1</li>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/```([a-z]*)\n([\s\S]*?)```/gim, '<pre><code>$2</code></pre>')
      .replace(/`(.*?)`/gim, '<code>$1</code>')
      .replace(/\n\n/gim, '<br/>');
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
