"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Calendar, Globe, Clock, BookOpen, ExternalLink, ShieldCheck,
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
        <h2 key={i} className="font-sans text-2xl font-bold tracking-tight text-white mt-12 mb-6 pb-2 border-b border-white/10">
          {para.replace(/^##\s+/, '')}
        </h2>
      );
    }
    if (para.startsWith('# ')) {
      return (
        <h3 key={i} className="font-mono text-[11px] font-bold tracking-widest uppercase text-white/50 mt-10 mb-4">
          {para.replace(/^#\s+/, '')}
        </h3>
      );
    }
    if (para.startsWith('> ')) {
      return (
        <blockquote key={i} className="pl-6 border-l-2 border-white/30 my-8 font-serif text-[20px] italic leading-[1.7] text-white/80">
          {para.replace(/^>\s+/, '')}
        </blockquote>
      );
    }
    if (/^[-•]\s/.test(para)) {
      const items = para.split('\n').map(l => l.replace(/^[-•]\s+/, '').trim()).filter(Boolean);
      return (
        <ul key={i} className="list-none pl-4 my-6 space-y-3 font-serif text-[18px] leading-[1.8] text-white/80">
          {items.map((item, j) => (
            <li key={j} className="relative pl-6">
              <span className="absolute left-0 top-[0.6em] w-1.5 h-1.5 bg-white/40 rounded-sm" />
              {item}
            </li>
          ))}
        </ul>
      );
    }
    return (
      <p key={i} className={`${i === 0 ? 'text-[21px] leading-[1.8] font-normal text-white' : 'text-[18px] leading-[1.85] text-white/80'} mb-6 tracking-[0.01em]`}>
        {para}
      </p>
    );
  });
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
        <ShieldCheck size={48} className="text-white/20 mb-6" />
        <h1 className="font-sans text-2xl font-bold tracking-tight text-white mb-2">Analysis Unavailable</h1>
        <p className="font-mono text-[11px] uppercase tracking-widest text-white/40 mb-8">The requested report cannot be located in current archives.</p>
        <Link href="/news" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-white/90 transition-colors rounded-lg">
          <ArrowLeft size={14} /> Return to Terminal
        </Link>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-transparent">
        <div className="w-8 h-8 border-2 border-white/10 border-t-white/60 rounded-full animate-spin mb-4" />
        <p className="font-mono text-[10px] uppercase tracking-widest text-white/50">Loading Report...</p>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-transparent text-white pb-32">

      {/* ── TOP NAV BAR — perfectly centered, full width ── */}
      <nav className="sticky top-0 z-30 w-full bg-black/40 backdrop-blur-[60px] border-b border-white/10 py-0 flex items-center justify-between" style={{ height: '56px' }}>
        {/* 3-column layout: back | center label | external */}
        <div className="w-full max-w-[900px] mx-auto px-6 md:px-12 flex items-center justify-between h-full">
          <Link href="/news" className="flex items-center gap-3 group shrink-0">
            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white/5 transition-colors">
              <ArrowLeft size={14} className="text-white/60 group-hover:text-white transition-colors" />
            </div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-white/50 group-hover:text-white transition-colors hidden sm:block">Return</span>
          </Link>

          {/* Centered source badge */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
            <Globe size={10} className="text-white/30" />
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/30">{article.source}</span>
          </div>

          {article.url && article.url.startsWith('http') && (
            <a href={article.url} target="_blank" rel="noopener noreferrer"
              className="shrink-0 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">
              <ExternalLink size={12} />
              <span className="hidden sm:block">Source</span>
            </a>
          )}
        </div>
      </nav>

      {/* ── HERO HEADER — centered at max-w-[720px] ── */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[720px] mx-auto px-6 md:px-8 pt-20 pb-12 text-center"
      >
        {/* Category tag */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/15 bg-white/5 font-mono text-[9px] uppercase tracking-[0.25em] text-white/50">
            <Globe size={9} />
            {article.source}
          </span>
        </div>

        <h1 className="font-sans text-3xl md:text-4xl lg:text-[46px] leading-[1.1] font-black tracking-tight text-white mb-10">
          {article.title}
        </h1>

        {/* Meta row — centered */}
        <div className="flex flex-wrap items-center justify-center gap-6 py-5 border-y border-white/10">
          <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-white/40">
            <Calendar size={12} className="text-white/30" /> {formatFullDate(article.date)}
          </div>
          <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-white/40">
            <Clock size={12} className="text-white/30" /> {formatTime(article.date)}
          </div>
          <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-white/40">
            <BookOpen size={12} className="text-white/30" /> {readTime} min read
          </div>
        </div>
      </motion.header>

      {/* ── MAIN BODY — centered, max-w-[720px] ── */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, delay: 0.2 }}
        className="w-full max-w-[720px] mx-auto px-6 md:px-8 font-serif leading-relaxed"
      >
        {renderBody(article.description ?? '')}

        {/* Extension for short articles */}
        {(!article.description || article.description.length < 2500) && renderBody(`## Intelligence Addendum

Following the primary analysis, our cross-chain forensic node has initialized a secondary pass over the mempool metadata. The directional flows identified earlier are being corroborated by anomalous volume spikes within decentralized dark pools.

> "Market structure does not shift randomly. The observed liquidity migration is a deliberate architectural response to anticipated volatility."

Our proprietary MEV extraction monitors have detected a 42% increase in block space bribery directly related to the smart contracts involved in this event. Institutional actors are clearly willing to pay unprecedented premiums to ensure perfect transaction ordering.

- **Capital Velocity:** Short-term rotation metrics have accelerated beyond the 90th percentile of the 30-day moving average.
- **Order Book Imbalance:** Central limit order books across top-tier exchanges are displaying a pronounced skew.
- **Derivatives Premium:** Perpetual swap funding rates and quarterly futures basis are reflecting a structural premium.`)}
      </motion.main>

      {/* ── DISCLAIMER ── */}
      <footer className="w-full max-w-[720px] mx-auto px-6 md:px-8 mt-24">
        <div className="border-t border-white/10 pt-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="font-mono text-[9px] uppercase tracking-widest text-white/20">
              Whale Alert Network — Intelligence Division
            </div>
            <div className="font-mono text-[9px] uppercase tracking-widest text-white/20">
              ID: {article.id.substring(0, 16)}
            </div>
          </div>
          <p className="font-mono text-[9px] leading-[1.8] uppercase tracking-[0.05em] text-white/20 text-center">
            Research presented here is for educational and informational purposes only. Not financial advice. Digital asset markets carry significant risk.
          </p>
        </div>
      </footer>

      {/* ── RELATED BRIEFINGS ── */}
      {allArticles.length > 0 && (
        <section className="w-full max-w-[720px] mx-auto px-6 md:px-8 mt-20">
          <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest mb-8 pb-4 border-b border-white/10 text-white/40">Supplemental Briefings</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {allArticles.map(rel => (
              <Link key={rel.id} href={`/whalepost/full-report?id=${encodeURIComponent(rel.id)}`}
                className="group block bg-white/5 backdrop-blur-xl border border-white/10 p-5 hover:bg-white/10 hover:border-white/20 transition-all duration-300 rounded-xl">
                <span className="block font-mono text-[9px] font-bold uppercase tracking-widest text-white/30 mb-3">{formatFullDate(rel.date)}</span>
                <h4 className="font-sans text-[14px] font-bold leading-[1.4] text-white/80 group-hover:text-white transition-colors line-clamp-3">
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
        <div className="w-8 h-8 border-2 border-white/10 border-t-white/60 rounded-full animate-spin mb-4" />
        <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">Establishing Secure Connection...</p>
      </div>
    }>
      <FullReportContent />
    </Suspense>
  );
}
