"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Calendar, Globe, Clock, Share2, Download,
  BookOpen, ChevronRight, ExternalLink, ShieldCheck,
  Activity, BarChart3, Fingerprint, Lock
} from 'lucide-react';
import { useNewsStore, NewsArticle } from '@/lib/store/news-store';
import Link from 'next/link';
import { SovereignFooter } from '@/components/landing/SovereignFooter';

function formatFullDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
}

function estimateReadTime(text: string): number {
  return Math.max(1, Math.ceil(text.split(/\s+/).length / 220));
}

function renderBody(description: string) {
  if (!description) return null;

  const rawParagraphs = description.split(/\n\n+/).map(p => p.trim()).filter(Boolean);

  return rawParagraphs.map((para, i) => {
    if (para.startsWith('## ')) {
      return (
        <h2 key={i} className="font-sans text-2xl font-bold tracking-tight text-[#0A0A0A] mt-12 mb-6 pb-2 border-b border-black/5">
          {para.replace(/^##\s+/, '')}
        </h2>
      );
    }
    if (para.startsWith('# ')) {
      return (
        <h3 key={i} className="font-mono text-[11px] font-bold tracking-widest uppercase text-[#0044CC] mt-10 mb-4">
          {para.replace(/^#\s+/, '')}
        </h3>
      );
    }
    if (para.startsWith('> ')) {
      return (
        <blockquote key={i} className="pl-6 border-l-2 border-[#0044CC] my-8 font-serif text-[20px] italic leading-[1.7] text-[#222]">
          {para.replace(/^>\s+/, '')}
        </blockquote>
      );
    }
    if (/^[-•]\s/.test(para)) {
      const items = para.split('\n').map(l => l.replace(/^[-•]\s+/, '').trim()).filter(Boolean);
      return (
        <ul key={i} className="list-none pl-4 my-6 space-y-3 font-serif text-[18px] leading-[1.8] text-[#111]">
          {items.map((item, j) => (
            <li key={j} className="relative pl-6">
              <span className="absolute left-0 top-[0.6em] w-1.5 h-1.5 bg-[#0044CC] opacity-60 rounded-sm"></span>
              {item}
            </li>
          ))}
        </ul>
      );
    }
    return (
      <p key={i} className={`${i === 0 ? 'text-[21px] leading-[1.8] font-normal text-[#000]' : 'text-[18px] leading-[1.85] text-[#1a1a1a]'} mb-6 tracking-[0.01em]`}>
        {para}
      </p>
    );
  });
}

function getIntelligenceBrief(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  const h = Math.abs(hash);
  
  const impactScore = 70 + (h % 29);
  const sentiments = ["Risk Averse", "Market Neutral", "Expansionary", "High Liquidity Event", "Systemic Vulnerability"];
  const sentiment = sentiments[h % sentiments.length];
  const relevance = ["Tier-1 Sovereign", "Macro-Institutional", "Protocol Foundation", "Geopolitical Impact"];
  
  return {
    impact: impactScore,
    sentiment,
    relevance: relevance[h % relevance.length]
  };
}

function FullReportContent() {
  const params = useSearchParams();
  const articleId = params.get('id');
  const { archive } = useNewsStore();

  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [allArticles, setAllArticles] = useState<NewsArticle[]>([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!articleId) { setNotFound(true); return; }

    for (const date of Object.keys(archive)) {
      const found = archive[date].find(a => a.id === articleId);
      if (found) {
        setArticle(found);
        setAllArticles(archive[date].filter(a => a.id !== articleId).slice(0, 3));
        return;
      }
    }

    fetch('/api/news', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        const items: NewsArticle[] = data.articles ?? [];
        const found = items.find(a => a.id === articleId);
        if (found) {
          setArticle(found);
          setAllArticles(items.filter(a => a.id !== articleId).slice(0, 3));
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true));
  }, [articleId, archive]);

  const readTime = article ? estimateReadTime(article.description ?? '') : 0;

  if (notFound) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-transparent">
        <ShieldCheck size={48} className="text-black/20 mb-6" />
        <h1 className="font-sans text-2xl font-bold tracking-tight mb-2">Classified Dossier Unavailable</h1>
        <p className="font-mono text-[11px] uppercase tracking-widest text-black/50 mb-8">The requested intelligence report cannot be located in current archives.</p>
        <Link href="/news" className="inline-flex items-center gap-2 px-6 py-3 bg-[#0A0A0A] text-white font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-[#222] transition-colors">
          <ArrowLeft size={14} /> Return to Terminal
        </Link>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-transparent">
        <div className="w-8 h-8 border-2 border-black/10 border-t-black rounded-full animate-spin mb-4" />
        <p className="font-mono text-[10px] uppercase tracking-widest text-black/50">Decrypting Intelligence Protocol...</p>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-transparent text-[#0A0A0A] dark:text-[#FAF9F6] pb-32">
      
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-30 w-full bg-white/20 dark:bg-black/20 backdrop-blur-3xl border-b border-black/5 dark:border-white/5 px-6 md:px-12 py-4 flex items-center justify-between">
        <Link href="/news" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-full border border-black/10 flex items-center justify-center group-hover:bg-black/5 transition-colors">
            <ArrowLeft size={14} className="text-black/60 group-hover:text-black transition-colors" />
          </div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-black/60 group-hover:text-black transition-colors">Return</span>
        </Link>
        <div className="flex items-center gap-2 text-black/40">
          {/* Verified Secure End-to-End - Removed for minimalism */}
        </div>
      </nav>

      {/* Hero Header Area (No Image) */}
      <header className="max-w-[900px] mx-auto px-6 md:px-12 pt-20 pb-12">
        <div className="flex items-center gap-4 mb-8">
          <span className="font-mono text-[10px] uppercase tracking-widest text-black/40 flex items-center gap-1.5">
            <Globe size={11} /> {article.source}
          </span>
        </div>

        <h1 className="font-serif text-4xl md:text-5xl lg:text-[54px] leading-[1.1] font-normal tracking-tight text-[#0A0A0A] mb-8" style={{ textWrap: 'balance' as any }}>
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center gap-6 py-6 border-y border-black/10">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-black/60">
            <Calendar size={14} className="text-black/40" /> {formatFullDate(article.date)}
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-black/60">
            <Clock size={14} className="text-black/40" /> {formatTime(article.date)}
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-black/60">
            <BookOpen size={14} className="text-black/40" /> {readTime} min analysis
          </div>
          {article.url && article.url.startsWith('http') && (
            <a href={article.url} target="_blank" rel="noopener noreferrer" className="ml-auto flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-[#0044CC] hover:text-[#002266] transition-colors">
              <ExternalLink size={12} /> External Reference
            </a>
          )}
        </div>
      </header>

      {/* Executive Intelligence Brief - Removed for minimalism */}

      {/* Main Content Body */}
      <main className="max-w-[800px] mx-auto px-6 md:px-12 font-serif text-[#111]">
        {renderBody(article.description ?? '')}
      </main>

      {/* Disclaimers & Signoff */}
      <footer className="max-w-[900px] mx-auto px-6 md:px-12 mt-24">
        <div className="border-t border-black/10 pt-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-black/40 flex items-center gap-2">
              {/* Officially Sanitized Intelligence - Removed for minimalism */}
            </div>
            <div className="font-mono text-[9px] uppercase tracking-widest text-black/30">
              ID: {article.id.substring(0, 16)}
            </div>
          </div>
          <p className="font-mono text-[9px] leading-[1.8] uppercase tracking-[0.05em] text-black/30 text-justify">
            The documentation presented herein constitutes comprehensive analytical research intended strictly for macro-educational and institutional review purposes. Under no jurisdiction should this compilation be interpreted as bespoke financial instruction, legal consultation, or definitive market foresight. Engaging with digital sovereignty frameworks and volatile market paradigms inherently carries profound capital risk. Data encapsulated reflects synchronized snapshots at the exact moment of protocol formulation. Extrapolating historical metrics to forecast future viability remains empirically unverified. Discretion is absolute.
          </p>
        </div>
      </footer>

      {/* Related Reading (No images) */}
      {allArticles.length > 0 && (
        <section className="max-w-[900px] mx-auto px-6 md:px-12 mt-24">
          <h3 className="font-mono text-[11px] font-bold uppercase tracking-widest mb-8 pb-4 border-b border-black/10">Supplemental Briefings</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {allArticles.map(rel => (
              <Link key={rel.id} href={`/whalepost/full-report?id=${encodeURIComponent(rel.id)}`} className="group block bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-black/10 dark:border-white/10 p-6 hover:shadow-xl transition-all duration-300 rounded-sm">
                <span className="block font-mono text-[9px] font-bold uppercase tracking-widest text-black/40 mb-3">{formatFullDate(rel.date)}</span>
                <h4 className="font-serif text-[17px] leading-[1.4] text-[#0A0A0A] group-hover:text-[#0044CC] transition-colors line-clamp-3">
                  {rel.title}
                </h4>
              </Link>
            ))}
          </div>
        </section>
      )}
      <SovereignFooter />
    </article>
  );
}

export default function FullReportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-black/10 border-t-black rounded-full animate-spin mb-4" />
        <p className="font-mono text-[10px] uppercase tracking-widest text-black/50">Establishing Secure Connection...</p>
      </div>
    }>
      <FullReportContent />
    </Suspense>
  );
}
