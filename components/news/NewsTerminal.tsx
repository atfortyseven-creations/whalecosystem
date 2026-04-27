"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Download, Mail, X, Calendar, ChevronLeft, ArrowRight, Clock, BookOpen } from 'lucide-react';
import { useNewsStore, NewsArticle } from '@/lib/store/news-store';
import { useAccount } from 'wagmi';
import { CryptoCheckoutModal } from './CryptoCheckoutModal';

const HEADER_H = 68;

const FALLBACK_BGS = Array.from({ length: 10 }, (_, i) => `/api/proxy-image?seed=${i + 1}`);

function getArticleImage(article: NewsArticle): string {
  if (article.imageUrl && article.imageUrl.startsWith('http')) {
    return `/api/proxy-image?url=${encodeURIComponent(article.imageUrl)}`;
  }
  let hash = 0;
  for (let i = 0; i < article.id.length; i++) {
    hash = article.id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return FALLBACK_BGS[Math.abs(hash) % FALLBACK_BGS.length];
}

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

// ─────────────────────────────────────────────────────────────────────────────
export function NewsTerminal() {
  const { isNewsSubscribed, lastBackupDate, setLastBackupDate, archive, upsertDayArticles, getArchiveDates } = useNewsStore();
  const { address } = useAccount();
  const router = useRouter();

  const hasAccess = true;

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
  const [imgError,     setImgError]     = useState(false);

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

  // Auto-scroll to top when article changes
  useEffect(() => {
    rightRef.current?.scrollTo({ top: 0, behavior: 'instant' });
    setImgError(false);
  }, [selected?.id]);

  // ── Download JSON ──────────────────────────────────────────────────────────
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

  // ── Share by email ─────────────────────────────────────────────────────────
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

  // Navigate to full report
  const openFullReport = () => {
    if (!selected) return;
    router.push(`/whalepost/full-report?id=${encodeURIComponent(selected.id)}`);
  };

  const BG      = '#FAF9F6';
  const TEXT    = '#0A0A0A';
  const DIV     = 'rgba(0,0,0,0.08)';
  const MUTED   = 'rgba(0,0,0,0.4)';
  const ACTIVE_BG = 'rgba(0,0,0,0.04)';

  const archiveDates = getArchiveDates();

  return (
    <>
      <div
        className="w-full h-full flex-1 relative flex flex-col min-h-0"
        style={{ background: BG, color: TEXT, willChange: 'transform', transform: 'translateZ(0)', backfaceVisibility: 'hidden', overscrollBehavior: 'none' }}
      >
        <div className="flex flex-1 w-full h-full min-h-0 overflow-hidden">

          {/* ═══════════════════════════════════════════════
              LEFT PANEL — Article list
          ══════════════════════════════════════════════ */}
          <div
            style={{ borderRight: `1px solid ${DIV}`, background: BG, overflowY: 'auto', height: '100%', WebkitOverflowScrolling: 'touch', willChange: 'transform', transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
            className={`flex-col shrink-0 w-full md:w-[28%] md:min-w-[320px] lg:min-w-[360px] ${selected ? 'hidden md:flex' : 'flex'}`}
          >
            {/* Sticky header */}
            <div style={{ borderBottom: `1px solid ${DIV}`, background: BG, backdropFilter: 'blur(10px)' }}
                 className="sticky top-0 z-10 flex items-center justify-between px-6 py-5">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 md:gap-5 flex-wrap">
                  {marketTimes.map(t => (
                    <div key={t.name} className="flex items-center gap-1.5 shrink-0">
                      <div className={`w-1 h-1 rounded-full ${t.isOpen ? 'bg-[#00C076] shadow-[0_0_8px_#00C076]' : 'bg-[#FF3B30] opacity-50'}`} />
                      <span className="font-mono text-[9px] font-black uppercase tracking-widest text-[#050505]">
                        {t.name} <span className="font-normal opacity-50 ml-0.5">{t.time}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {hasAccess && (
                  <button onClick={handleDownload} title="Save to disk"
                          className="w-8 h-8 flex items-center justify-center border transition-opacity hover:opacity-60"
                          style={{ borderColor: DIV }}>
                    <Download size={13} color={MUTED} />
                  </button>
                )}
                <button onClick={() => setShowArchive(v => !v)} title="News archive"
                        className="w-8 h-8 flex items-center justify-center border transition-opacity hover:opacity-60"
                        style={{ borderColor: DIV, background: showArchive ? TEXT : 'transparent' }}>
                  <Calendar size={13} color={showArchive ? BG : MUTED} />
                </button>
              </div>
            </div>

            {/* Archive browser */}
            {showArchive && archiveDates.length > 0 && (
              <div style={{ borderBottom: `2px solid ${TEXT}`, background: 'rgba(0,0,0,0.02)' }}>
                <p className="px-6 pt-4 pb-2 font-mono text-[8px] uppercase tracking-[0.35em] font-black" style={{ color: MUTED }}>
                  Archive — {archiveDates.length} days
                </p>
                {archiveDates.map(date => {
                  const count = archive[date]?.length ?? 0;
                  const isToday = date === todayKey();
                  return (
                    <button key={date}
                      onClick={() => {
                        const dayArticles = archive[date];
                        if (dayArticles?.length) { setArticles(dayArticles); setSelected(dayArticles[0]); setShowArchive(false); }
                      }}
                      className="w-full text-left px-6 py-3 flex items-center justify-between border-b transition-colors hover:opacity-70"
                      style={{ borderColor: DIV }}>
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: isToday ? TEXT : MUTED }}>
                        {new Date(date + 'T12:00:00').toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                        {isToday && <span className="ml-2 text-[7px]">· TODAY</span>}
                      </span>
                      <span className="font-mono text-[9px] font-black" style={{ color: MUTED }}>{count}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Article list */}
            <div className="flex flex-col">
              {articles.slice(0, 50).map(art => {
                const isActive = selected?.id === art.id;
                return (
                  <button key={art.id} onClick={() => setSelected(art)}
                    className="text-left w-full px-6 py-5 border-b relative group"
                    style={{ borderColor: DIV, background: isActive ? ACTIVE_BG : 'transparent', color: TEXT, WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation', transition: 'background 0.1s ease' }}>
                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: TEXT }} />}
                    <p className="font-mono text-[8px] uppercase tracking-[0.2em] font-bold mb-2 transition-colors" style={{ color: isActive ? TEXT : MUTED }}>
                      {formatShort(art.date)}
                    </p>
                    <p className="font-sans font-black leading-tight text-[13px] group-hover:opacity-80 transition-opacity">{art.title}</p>
                  </button>
                );
              })}
              {articles.length === 0 && (
                <p className="p-6 font-mono text-xs uppercase" style={{ color: MUTED }}>No articles available.</p>
              )}
            </div>
          </div>

          {/* ═══════════════════════════════════════════════
              RIGHT PANEL — Article reader
          ══════════════════════════════════════════════ */}
          <div
            ref={rightRef}
            style={{ flex: 1, height: '100%', overflowY: 'auto', background: BG, WebkitOverflowScrolling: 'touch', willChange: 'transform', transform: 'translateZ(0)' }}
            className={`${selected ? 'flex' : 'hidden md:flex'} flex-col w-full md:w-auto relative`}
          >
            <AnimatePresence mode="wait">
              {selected && (
                <motion.article key={selected.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}>

                  {/* ── Top control bar ── */}
                  <div className="flex items-center justify-between px-6 md:px-10 xl:px-16 py-4 border-b sticky top-0 z-10"
                       style={{ borderColor: DIV, background: 'rgba(250,249,246,0.94)', backdropFilter: 'blur(12px)' }}>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelected(null)}
                        className="md:hidden flex items-center justify-center p-1 -ml-2 rounded-full border transition-all"
                        style={{ borderColor: DIV, background: 'rgba(0,0,0,0.03)' }}>
                        <ChevronLeft size={16} color={MUTED} />
                      </button>
                      <span className="font-mono text-[8px] uppercase tracking-[0.3em] font-medium hidden sm:block" style={{ color: MUTED }}>
                        {formatDate(selected.date)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {ethEur && (
                        <span className="font-mono text-[8px] uppercase tracking-widest px-2 py-1 border hidden sm:block" style={{ borderColor: DIV, color: MUTED }}>
                          1 ETH ≈ {ethEur.toLocaleString('en-US')} €
                        </span>
                      )}
                      {hasAccess && (
                        <button onClick={() => setShareOpen(true)}
                                className="w-8 h-8 flex items-center justify-center border transition-opacity hover:opacity-60"
                                style={{ borderColor: DIV }}>
                          <Mail size={13} color={MUTED} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ── Hero image — wide, not cramped ── */}
                  <div className="w-full">
                    <div className="w-full overflow-hidden bg-[#F0EFEC]"
                         style={{ height: 'clamp(220px, 38vh, 480px)', willChange: 'transform', transform: 'translateZ(0)' }}>
                      <motion.img
                        key={selected.id}
                        initial={{ opacity: 0, scale: 1.04 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
                        src={imgError ? FALLBACK_BGS[0] : getArticleImage(selected)}
                        alt={selected.title}
                        className="w-full h-full object-cover"
                        loading="eager"
                        decoding="async"
                        onError={() => setImgError(true)}
                      />
                    </div>
                  </div>

                  {/* ── Article header ── */}
                  <div className="px-6 md:px-10 xl:px-16 pt-8 pb-0 max-w-[860px]">
                    {/* Source + category */}
                    <p className="font-mono text-[9px] uppercase tracking-[0.3em] mb-3 font-bold flex items-center gap-2" style={{ color: '#0044CC' }}>
                      {selected.source}
                      <span className="text-black/20">|</span>
                      <span style={{ color: MUTED }}>Analytical Report</span>
                    </p>

                    {/* Title */}
                    <h1 className="font-sans font-semibold tracking-tight leading-[1.1] mb-5"
                        style={{ fontSize: 'clamp(1.6rem, 3vw, 2.8rem)', color: TEXT, textWrap: 'balance' as any }}>
                      {selected.title}
                    </h1>

                    {/* Meta row */}
                    <div className="flex items-center gap-3 flex-wrap pb-6 border-b" style={{ borderColor: DIV }}>
                      <span className="font-mono text-[9px] uppercase tracking-[0.18em] flex items-center gap-1.5" style={{ color: MUTED }}>
                        <Clock size={10} />
                        {formatDate(selected.date)}
                      </span>
                      <span className="w-1 h-1 rounded-full" style={{ background: DIV }} />
                      <span className="font-mono text-[9px] uppercase tracking-[0.18em] flex items-center gap-1.5" style={{ color: MUTED }}>
                        <BookOpen size={10} />
                        {estimateReadTime(selected.description ?? '')} min read
                      </span>
                    </div>
                  </div>

                  {/* ── Article body — Preview Mode ── */}
                  <div className="px-6 md:px-10 xl:px-16 pt-8 pb-0 max-w-[860px] relative">
                    <div className="space-y-6" lang="en"
                         style={{ color: '#1a1a1a', fontSize: 'clamp(15px, 1.05vw, 18px)', fontFamily: 'Georgia, serif', lineHeight: '1.9', letterSpacing: '0.008em' }}>
                      {selected.description
                        ? selected.description.split(/\n\n+/).slice(0, 2).map((para, i) => {
                            const trimmed = para.trim();
                            if (!trimmed) return null;
                            if (trimmed.startsWith('## ')) {
                              return (
                                <h2 key={i} style={{ fontFamily: 'inherit', fontSize: 'clamp(1rem, 1.2vw, 1.15rem)', fontWeight: 800, letterSpacing: '-0.01em', color: TEXT, marginTop: '2rem', marginBottom: '0.25rem', paddingLeft: '0.75rem', borderLeft: `3px solid ${TEXT}` }}>
                                  {trimmed.replace(/^##\s+/, '')}
                                </h2>
                              );
                            }
                            return (
                              <p key={i} style={{ fontFamily: 'Georgia, serif', fontSize: i === 0 ? 'clamp(16px, 1.1vw, 19px)' : undefined, fontWeight: i === 0 ? 400 : 400, color: i === 0 ? '#111111' : '#1a1a1a' }}>
                                {trimmed}
                              </p>
                            );
                          })
                        : <p style={{ color: MUTED, fontFamily: 'Georgia, serif' }}>No content available for this article.</p>
                      }
                    </div>
                    {/* Fade out gradient for preview */}
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#FAF9F6] to-transparent pointer-events-none" />
                  </div>

                  {/* ── Full Report CTA ── */}
                  <div className="px-6 md:px-10 xl:px-16 pb-8 max-w-[860px]">
                    <div className="pt-6 border-t" style={{ borderColor: DIV }}>
                      <button
                        onClick={openFullReport}
                        className="group inline-flex items-center gap-3 px-6 py-4 border-2 transition-all hover:bg-[#0A0A0A] hover:border-[#0A0A0A]"
                        style={{ borderColor: TEXT, background: 'transparent' }}>
                        <span className="font-mono text-[10px] font-black uppercase tracking-[0.2em] transition-colors group-hover:text-[#FAF9F6]" style={{ color: TEXT }}>
                          Full Report
                        </span>
                        <ArrowRight size={13} className="transition-colors group-hover:text-[#FAF9F6]" style={{ color: TEXT }} />
                      </button>
                      <p className="mt-3 font-mono text-[8px] uppercase tracking-[0.15em]" style={{ color: MUTED }}>
                        Maximum expansion · Structured analysis
                      </p>
                    </div>
                  </div>

                  {/* ── Legal footer ── */}
                  <div className="px-6 md:px-10 xl:px-16 pb-20 max-w-[860px]">
                    <div className="pt-6 border-t" style={{ borderColor: DIV }}>
                      <div className="flex justify-between items-center font-mono text-[9px] uppercase tracking-widest font-bold mb-3" style={{ color: MUTED }}>
                        <span>Professional Analysis Report</span>
                        <span>Strictly Educational Insights</span>
                      </div>
                      <p className="font-mono text-[10px] leading-relaxed uppercase tracking-wide opacity-50" style={{ color: MUTED }}>
                        The analytical material provided herein is solely for educational purposes and should not be construed as investment, financial, or legal advice. Trading and interacting with digital assets inherently involves substantial risk, and full capital loss is possible. Information provided reflects market states at the time of publication.
                      </p>
                    </div>
                  </div>

                </motion.article>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <CryptoCheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} />

      <AnimatePresence>
        {shareOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="fixed inset-0 z-50 flex items-center justify-center p-4"
                      style={{ background: 'rgba(0,0,0,0.82)' }}>
            <motion.div initial={{ scale: 0.97, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.97 }}
                        className="w-full max-w-md relative"
                        style={{ background: '#FAF9F6', color: '#0A0A0A', border: '2px solid #0A0A0A' }}>
              <div className="flex items-center justify-between px-7 py-5 border-b" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
                <div className="flex items-center gap-3">
                  <Mail size={18} />
                  <span className="font-black text-lg uppercase tracking-tight">Share Intel</span>
                </div>
                <button onClick={() => setShareOpen(false)} className="opacity-50 hover:opacity-100 transition-opacity">
                  <X size={18} />
                </button>
              </div>
              {shareSent ? (
                <div className="p-16 text-center font-mono text-sm font-black uppercase tracking-widest">Transmission Complete ✓</div>
              ) : (
                <form onSubmit={handleShare} className="p-7 space-y-7">
                  <div>
                    <label className="block font-mono text-[9px] uppercase tracking-widest font-bold mb-2" style={{ color: 'rgba(0,0,0,0.4)' }}>Recipient</label>
                    <input type="email" required value={shareEmail} onChange={e => setShareEmail(e.target.value)}
                           className="w-full bg-transparent outline-none border-b py-2 font-mono text-sm"
                           style={{ borderColor: 'rgba(0,0,0,0.08)', color: '#0A0A0A' }} placeholder="email@domain.com" />
                  </div>
                  <div>
                    <label className="block font-mono text-[9px] uppercase tracking-widest font-bold mb-2" style={{ color: 'rgba(0,0,0,0.4)' }}>Note (Optional)</label>
                    <textarea value={shareNote} onChange={e => setShareNote(e.target.value)} rows={3}
                              className="w-full bg-transparent outline-none border p-3 font-serif text-sm resize-none"
                              style={{ borderColor: 'rgba(0,0,0,0.08)', color: '#0A0A0A' }} />
                  </div>
                  <button type="submit" disabled={isSending}
                          className="w-full py-4 font-mono text-[10px] font-black uppercase tracking-widest disabled:opacity-40"
                          style={{ background: '#0A0A0A', color: '#FAF9F6' }}>
                    {isSending ? 'Sending...' : 'Transmit One-Time Access'}
                  </button>
                  <p className="text-center font-mono text-[8px] uppercase tracking-widest" style={{ color: 'rgba(0,0,0,0.4)' }}>
                    The recipient can read this article only once.
                  </p>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
