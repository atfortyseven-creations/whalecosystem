"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Download, Mail, X, Calendar, ChevronLeft, ArrowRight, Clock, BookOpen, ExternalLink, Globe, Activity } from 'lucide-react';
import { useNewsStore, NewsArticle } from '@/lib/store/news-store';
import { useAccount } from 'wagmi';
import { CryptoCheckoutModal } from './CryptoCheckoutModal';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }) + ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function formatShort(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })
    + ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function todayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function estimateReadTime(text: string): number {
  return Math.max(1, Math.ceil((text ?? '').split(/\s+/).length / 220));
}

async function fetchEthEur(): Promise<number | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=eur',
      { cache: 'no-store', signal: controller.signal }
    );
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.ethereum?.eur ?? null;
  } catch {
    return null;
  }
}

export function NewsTerminal() {
  const { isNewsSubscribed, lastBackupDate, setLastBackupDate, archive, upsertDayArticles, getArchiveDates } = useNewsStore();
  const { address } = useAccount();
  const router = useRouter();

  const [tier,         setTier]         = useState<string>('FREE');
  const [articles,     setArticles]     = useState<NewsArticle[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [selected,     setSelected]     = useState<NewsArticle | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [shareOpen,    setShareOpen]    = useState(false);
  const [shareEmail,   setShareEmail]   = useState('');
  const [shareNote,    setShareNote]    = useState('');
  const [isSending,    setIsSending]    = useState(false);
  const [shareSent,    setShareSent]    = useState(false);
  const [ethEur,       setEthEur]       = useState<number | null>(null);
  const [showArchive,  setShowArchive]  = useState(false);
  const [marketTimes,  setMarketTimes]  = useState<{name: string, time: string, isOpen: boolean}[]>([]);

  const rightRef = useRef<HTMLDivElement>(null);

  // ── Market clocks ──────────────────────────────────────────────────────────
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const utcHour = now.getUTCHours();
      const isWeekend = now.getUTCDay() === 0 || now.getUTCDay() === 6;
      const f = (tz: string) => now.toLocaleTimeString('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false });
      setMarketTimes([
        { name: 'NY',  time: f('America/New_York'), isOpen: !isWeekend && (utcHour >= 13 && utcHour < 20) },
        { name: 'LON', time: f('Europe/London'),    isOpen: !isWeekend && (utcHour >= 8  && utcHour < 16) },
        { name: 'TYO', time: f('Asia/Tokyo'),       isOpen: !isWeekend && (utcHour >= 0  && utcHour < 6)  },
      ]);
    };
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);

  // ── Load data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchEthEur().then(setEthEur);

    fetch('/api/auth/session', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.user?.tier) setTier(data.user.tier.split('_')[0].toUpperCase());
      })
      .catch(console.error);

    fetch('/api/news', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        const items: NewsArticle[] = data.articles ?? [];
        setArticles(items);
        if (items.length > 0) {
          setSelected(items[0]);
          upsertDayArticles(todayKey(), items);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [upsertDayArticles]);

  useEffect(() => {
    rightRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [selected?.id]);

  const handleDownload = useCallback(async () => {
    const today = todayKey();
    const blob = new Blob([JSON.stringify({ date: today, articles }, null, 2)], { type: 'application/json' });
    if ('showSaveFilePicker' in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({ suggestedName: `${today}_WhaleNews.json`, types: [{ accept: { 'application/json': ['.json'] } }] });
        const writable = await handle.createWritable();
        await writable.write(blob); await writable.close();
        setLastBackupDate(today); return;
      } catch (e: any) { if (e.name === 'AbortError') return; }
    }
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: `${today}_WhaleNews.json` });
    a.click(); URL.revokeObjectURL(url);
    setLastBackupDate(today);
  }, [articles, setLastBackupDate]);

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !shareEmail) return;
    setIsSending(true);
    try {
      await fetch('/api/news/share', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailTarget: shareEmail, articleId: selected.id, articleTitle: selected.title, messageNote: shareNote }),
      });
      setShareSent(true);
      setTimeout(() => { setShareOpen(false); setShareSent(false); setShareEmail(''); setShareNote(''); }, 2200);
    } finally { setIsSending(false); }
  };

  const openFullReport = () => {
    if (!selected) return;
    router.push(`/whalepost/full-report?id=${encodeURIComponent(selected.id)}`);
  };

  const hasAccess = tier === 'PRO' || tier === 'ELITE';

  const BG      = '#FAF9F6';
  const TEXT    = '#0A0A0A';
  const DIV     = 'rgba(0,0,0,0.08)';
  const MUTED   = 'rgba(0,0,0,0.45)';
  const ACTIVE_BG = '#FFFFFF';
  
  const archiveDates = getArchiveDates();

  return (
    <>
      <div className="w-full h-full flex-1 relative flex flex-col min-h-0 font-serif bg-[#FAF9F6] dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#FAF9F6]">
        <div className="flex flex-1 w-full h-full min-h-0 overflow-hidden">
          {/* LEFT PANEL */}
          <div
            className={`flex-col shrink-0 w-full md:w-[32%] md:min-w-[340px] lg:min-w-[380px] ${selected ? 'hidden md:flex' : 'flex'} border-r border-black/[0.08] dark:border-white/10 bg-[#F4F3EE] dark:bg-[#111111] overflow-y-auto`}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 border-b border-black/[0.08] dark:border-white/10 bg-[#F4F3EE] dark:bg-[#111111]">
              <div className="flex items-center gap-4 flex-wrap">
                {marketTimes.map(t => (
                  <div key={t.name} className="flex items-center gap-1.5 shrink-0">
                    <div className={`w-1.5 h-1.5 rounded-full ${t.isOpen ? 'bg-[#00C076]' : 'bg-[#FF3B30] opacity-50'}`} />
                    <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-[#050505] dark:text-white">
                      {t.name} <span className="font-normal opacity-50 ml-0.5">{t.time}</span>
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                {hasAccess && (
                  <button onClick={handleDownload} title="Save Archives" className="w-8 h-8 flex items-center justify-center rounded-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <Download size={14} className="text-[#0A0A0A] dark:text-white" />
                  </button>
                )}
                <button onClick={() => setShowArchive(v => !v)} title="News Archive" className="w-8 h-8 flex items-center justify-center rounded-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <Calendar size={14} className="text-[#0A0A0A] dark:text-white" />
                </button>
              </div>
            </div>

            {showArchive && archiveDates.length > 0 && (
              <div className="border-b border-black dark:border-white/20 bg-[#EAE9E4] dark:bg-[#1A1A1A]">
                <p className="px-6 pt-5 pb-3 font-mono text-[9px] uppercase tracking-[0.25em] font-bold text-black/45 dark:text-white/45">Archive ({archiveDates.length})</p>
                {archiveDates.map(date => {
                  const count = archive[date]?.length ?? 0;
                  const isToday = date === todayKey();
                  return (
                    <button key={date} onClick={() => {
                        const dayArticles = archive[date];
                        if (dayArticles?.length) { setArticles(dayArticles); setSelected(dayArticles[0]); setShowArchive(false); }
                      }}
                      className="w-full text-left px-6 py-4 flex items-center justify-between border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <span className={`font-sans text-xs font-semibold tracking-wide ${isToday ? 'text-[#0A0A0A] dark:text-white' : 'text-black/45 dark:text-white/45'}`}>
                        {new Date(date + 'T12:00:00').toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })}
                        {isToday && <span className="ml-2 font-mono text-[8px] px-1.5 py-0.5 bg-black dark:bg-white text-white dark:text-black rounded-sm">TODAY</span>}
                      </span>
                      <span className="font-mono text-[10px] text-black/45 dark:text-white/45">{count} Updates</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Article list */}
            <div className="flex flex-col py-2">
              {articles.slice(0, 50).map((art, idx) => {
                const isActive = selected?.id === art.id;
                return (
                  <button key={art.id} onClick={() => setSelected(art)}
                    className={`text-left w-full px-6 py-5 relative group transition-colors ${isActive ? 'bg-white dark:bg-[#1A1A1A]' : 'bg-transparent'}`}>
                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-black dark:bg-white" />}
                    {!isActive && <div className="absolute bottom-0 left-6 right-6 h-[1px] bg-black/[0.08] dark:bg-white/10" />}
                    
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className={`font-mono text-[9px] uppercase tracking-widest font-bold ${isActive ? 'text-[#050505] dark:text-white' : 'text-black/45 dark:text-white/45'}`}>
                        {formatShort(art.date)}
                      </span>
                      {art.source && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-black/20 dark:bg-white/20" />
                          <span className="font-mono text-[9px] uppercase tracking-widest truncate max-w-[120px] text-black/45 dark:text-white/45">{art.source}</span>
                        </>
                      )}
                    </div>
                    
                    <h3 className={`font-serif text-[15px] leading-[1.4] font-medium ${isActive ? 'text-[#0A0A0A] dark:text-white' : 'text-[#0A0A0A]/70 dark:text-white/70'}`}>
                      {art.title}
                    </h3>
                  </button>
                );
              })}
              {articles.length === 0 && (
                <div className="px-6 py-10 flex flex-col items-center text-center opacity-50 text-[#0A0A0A] dark:text-white">
                  <BookOpen size={24} className="mb-3" />
                  <p className="font-mono text-[10px] uppercase tracking-widest">No news available.</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div ref={rightRef} className={`flex-1 overflow-y-auto ${selected ? 'flex' : 'hidden md:flex'} flex-col relative bg-[#FAF9F6] dark:bg-[#0A0A0A]`}>
            <AnimatePresence mode="wait">
              {selected && (
                <motion.article key={selected.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  
                  {/* Top Bar */}
                  <div className="sticky top-0 z-20 flex items-center justify-between px-6 md:px-12 py-5 border-b border-black/10 dark:border-white/10 bg-[#FAF9F6]/95 dark:bg-[#0A0A0A]/95 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                      <button onClick={() => setSelected(null)} className="md:hidden p-1.5 -ml-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors">
                        <ChevronLeft size={18} className="text-[#0A0A0A] dark:text-white" />
                      </button>
                      <div className="font-mono text-[9px] uppercase tracking-[0.2em] font-semibold text-black/40 dark:text-white/40">
                        {/* Global Intelligence Network - Removed for minimalism */}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {ethEur && (
                        <span className="font-mono text-[9px] uppercase tracking-widest text-black/60 dark:text-white/60 hidden sm:block">
                          ETH/EUR {ethEur.toLocaleString('en-US')}
                        </span>
                      )}
                      {hasAccess && (
                        <button onClick={() => setShareOpen(true)} className="flex items-center gap-2 px-3 py-1.5 border border-black/10 dark:border-white/10 rounded-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-[#0A0A0A] dark:text-white">
                          <Mail size={12} />
                          <span className="font-mono text-[9px] uppercase tracking-widest font-bold">Share</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Header */}
                  <div className="px-6 md:px-12 pt-16 pb-12 max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 flex items-center gap-1.5">
                        <Globe size={11} /> {selected.source}
                      </span>
                    </div>

                    <h1 className="font-serif text-3xl md:text-4xl lg:text-[42px] leading-[1.15] font-normal tracking-tight text-[#0A0A0A] dark:text-white mb-8" style={{ textWrap: 'balance' as any }}>
                      {selected.title}
                    </h1>

                    <div className="flex items-center gap-5 pt-6 border-t border-black/10 dark:border-white/10">
                      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-black/50 dark:text-white/50">
                        <Calendar size={12} /> {formatDate(selected.date)}
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-black/50 dark:text-white/50">
                        <Clock size={12} /> {estimateReadTime(selected.description ?? '')} min read
                      </div>
                    </div>
                  </div>

                  {/* Content Preview */}
                  <div className="px-6 md:px-12 pb-8 max-w-4xl mx-auto relative">
                    <div className="prose prose-lg prose-neutral max-w-none font-serif text-[17px] leading-[1.9] text-[#222] dark:text-white/90">
                      {selected.description ? selected.description.split(/\n\n+/).slice(0, 3).map((para, i) => {
                        const text = para.trim();
                        if (!text) return null;
                        if (text.startsWith('## ')) return <h2 key={i} className="font-sans text-xl font-bold mt-8 mb-4 tracking-tight text-[#111] dark:text-white">{text.replace(/^##\s+/, '')}</h2>;
                        return <p key={i} className={i === 0 ? "text-[19px] leading-[1.8] text-[#111] dark:text-white" : ""}>{text}</p>;
                      }) : <p className="text-black/40 dark:text-white/40 italic">Analysis unavailable.</p>}
                    </div>
                    
                    <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#FAF9F6] dark:from-[#0A0A0A] to-transparent pointer-events-none" />
                  </div>

                  {/* Call to Action */}
                  <div className="px-6 md:px-12 pb-24 max-w-4xl mx-auto text-center relative z-10">
                    <button onClick={openFullReport} className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#0A0A0A] dark:bg-white text-[#FAF9F6] dark:text-black hover:bg-[#222] dark:hover:bg-gray-200 transition-colors rounded-sm shadow-xl hover:shadow-2xl">
                      <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em]">Read Full Analysis</span>
                      <ArrowRight size={14} />
                    </button>
                    <p className="mt-4 font-mono text-[9px] uppercase tracking-widest text-black/40 dark:text-white/40">
                      Comprehensive insights and structured geopolitical breakdown.
                    </p>
                  </div>

                </motion.article>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <CryptoCheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
      
      <AnimatePresence>
        {shareOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 dark:bg-black/90 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }} className="w-full max-w-md bg-[#FAF9F6] dark:bg-[#111111] border border-black/10 dark:border-white/10 shadow-2xl rounded-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/5 bg-white dark:bg-[#1A1A1A]">
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-black dark:text-white" />
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">Share News</span>
                </div>
                <button onClick={() => setShareOpen(false)} className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-sm text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors"><X size={16} /></button>
              </div>
              
              {shareSent ? (
                <div className="p-12 text-center">
                  <div className="w-12 h-12 bg-[#00C076]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#00C076]"><X size={24} className="rotate-45" style={{ display: 'none' }} />✓</div>
                  <h3 className="font-serif text-xl mb-2 text-black dark:text-white">Sent</h3>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-black/50 dark:text-white/50">The news has been sent.</p>
                </div>
              ) : (
                <form onSubmit={handleShare} className="p-6">
                  <div className="mb-5">
                    <label className="block font-mono text-[9px] uppercase tracking-widest font-bold text-black/50 dark:text-white/50 mb-2">Email Address</label>
                    <input type="email" required value={shareEmail} onChange={e => setShareEmail(e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-[#111111] border border-black/10 dark:border-white/10 font-mono text-[11px] outline-none focus:border-black dark:focus:border-white text-black dark:text-white transition-colors rounded-sm" placeholder="delegate@institution.com" />
                  </div>
                  <div className="mb-8">
                    <label className="block font-mono text-[9px] uppercase tracking-widest font-bold text-black/50 dark:text-white/50 mb-2">Note (Optional)</label>
                    <textarea value={shareNote} onChange={e => setShareNote(e.target.value)} rows={3} className="w-full px-4 py-3 bg-white dark:bg-[#111111] border border-black/10 dark:border-white/10 font-serif text-[14px] outline-none focus:border-black dark:focus:border-white text-black dark:text-white transition-colors rounded-sm resize-none" placeholder="Provide context..." />
                  </div>
                  <button type="submit" disabled={isSending} className="w-full py-4 bg-[#0A0A0A] dark:bg-white text-white dark:text-black font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-[#222] dark:hover:bg-gray-200 disabled:opacity-50 transition-colors rounded-sm">
                    {isSending ? 'Sending...' : 'Send'}
                  </button>
                  <p className="text-center font-mono text-[8px] uppercase tracking-widest text-black/40 dark:text-white/40 mt-4">Private sharing link.</p>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
