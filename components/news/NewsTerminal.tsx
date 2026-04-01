"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Download, Mail, Moon, Sun, X, ChevronDown, ChevronUp, Calendar, Lock } from 'lucide-react';
import { useNewsStore, NewsArticle } from '@/lib/store/news-store';
import { useAccount } from 'wagmi';
import { WhaleAlertLoader } from '@/components/ui/WhaleAlertLoader';
import { CryptoCheckoutModal } from './CryptoCheckoutModal';

// ── Altura del InstitutionalHeader global ─────────────────────────────────────
const HEADER_H = 68;

// ── Fallback de imagen determinista por nuestro proxy ─
const FALLBACK_BGS = [
  "/api/proxy-image?seed=1",
  "/api/proxy-image?seed=2",
  "/api/proxy-image?seed=3",
  "/api/proxy-image?seed=4",
  "/api/proxy-image?seed=5",
  "/api/proxy-image?seed=6",
  "/api/proxy-image?seed=7",
  "/api/proxy-image?seed=8",
  "/api/proxy-image?seed=9",
  "/api/proxy-image?seed=10"
];

function getArticleImage(article: NewsArticle): string {
  if (article.imageUrl && article.imageUrl.startsWith('http')) {
    return `/api/proxy-image?url=${encodeURIComponent(article.imageUrl)}`;
  }
  
  let hash = 0;
  for (let i = 0; i < article.id.length; i++) {
    hash = article.id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % FALLBACK_BGS.length;
  return FALLBACK_BGS[index];
}

// ── Formato de fecha legible ──────────────────────────────────────────────────
function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }) + ' · ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function formatShort(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
    + ' · ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function todayKey(): string {
  return new Date().toISOString().split('T')[0];
}

// Fetches EUR equivalent for 0.015 ETH
async function fetchEthEur(): Promise<number | null> {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=eur',
      { cache: 'no-store', signal: AbortSignal.timeout(4000) }
    );
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

  // Whitelist user address for full premium access
  const IS_WHITELISTED = address?.toLowerCase() === '0x78831C25c86eA2a78A6127fC2Ccb95E612D87b4a'.toLowerCase();
  const hasAccess = isNewsSubscribed || IS_WHITELISTED;

  const [articles,    setArticles]    = useState<NewsArticle[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [selected,    setSelected]    = useState<NewsArticle | null>(null);
  const [isDark,      setIsDark]      = useState(false);
  const [fontSize,    setFontSize]    = useState(1);
  const [checkoutOpen,setCheckoutOpen]= useState(false);
  const [shareOpen,   setShareOpen]   = useState(false);
  const [shareEmail,  setShareEmail]  = useState('');
  const [shareNote,   setShareNote]   = useState('');
  const [isSending,   setIsSending]   = useState(false);
  const [shareSent,   setShareSent]   = useState(false);
  const [ethEur,      setEthEur]      = useState<number | null>(null);
  // Archive sidebar toggle
  const [showArchive, setShowArchive] = useState(false);

  const rightRef = useRef<HTMLDivElement>(null);
  const imgRef   = useRef<HTMLImageElement>(null);

  // ── Carga de datos ───────────────────────────────────────────────────────
  useEffect(() => {
    // Load ETH→EUR rate
    fetchEthEur().then(setEthEur);

    // Check 1-Time share token
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const token  = params.get('share_token');
      if (token && !hasAccess) {
        try {
          const decoded = JSON.parse(atob(token));
          const key = `has_read_${decoded.id}`;
          if (localStorage.getItem(key)) { setLoading(false); return; }
          localStorage.setItem(key, '1');
          window.history.replaceState({}, '', '/news');
        } catch { /* token corrupto */ }
      }
    }

    fetch('/api/news', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        const items: NewsArticle[] = data.articles ?? [];
        setArticles(items);
        if (items.length > 0) setSelected(items[0]);
        // Persist into today's archive bucket
        if (items.length > 0) {
          upsertDayArticles(todayKey(), items);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [hasAccess, upsertDayArticles]);

  // Auto-scroll to top when article changes
  useEffect(() => {
    rightRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [selected?.id]);

  // ── Descarga JSON al disco ───────────────────────────────────────────────
  const handleDownload = useCallback(async () => {
    const today = todayKey();
    const blob  = new Blob([JSON.stringify({ date: today, articles }, null, 2)], { type: 'application/json' });
    if ('showSaveFilePicker' in window) {
      try {
        const handle   = await (window as any).showSaveFilePicker({ suggestedName: `${today}_WhaleNews.json`, types: [{ accept: { 'application/json': ['.json'] } }] });
        const writable = await handle.createWritable();
        await writable.write(blob); await writable.close();
        setLastBackupDate(today); return;
      } catch (e: any) { if (e.name === 'AbortError') return; }
    }
    const url = URL.createObjectURL(blob);
    const a   = Object.assign(document.createElement('a'), { href: url, download: `${today}_WhaleNews.json` });
    a.click(); URL.revokeObjectURL(url);
    setLastBackupDate(today);
  }, [articles, setLastBackupDate]);

  // ── Compartir por email ──────────────────────────────────────────────────
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

  // ── Paleta — sin bug: todo el DOM recibe el bg correcto ─────────────────
  const BG    = isDark ? '#080808' : '#ffffff';
  const TEXT  = isDark ? '#f4f4f4' : '#0a0a0a';
  const DIV   = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.09)';
  const MUTED = isDark ? 'rgba(255,255,255,0.32)' : 'rgba(0,0,0,0.36)';
  const ACTIVE_BG = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';

  const panelH = `calc(100vh - ${HEADER_H}px)`;

  // ── Pantalla: Carga ──────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ background: BG, minHeight: panelH }}>
      <WhaleAlertLoader bg={BG} color={TEXT} />
    </div>
  );

  // ── Archive dates for sidebar ────────────────────────────────────────────
  const archiveDates = getArchiveDates();

  // ── Render principal ─────────────────────────────────────────────────────
  return (
    <>
      {/* Root container — full bg override for dark/light fix */}
      <div
        style={{ background: BG, color: TEXT, minHeight: panelH }}
        className="w-full relative"
      >
        <div style={{ height: panelH, overflow: 'hidden' }} className="flex w-full">

          {/* ═══════════════════════════════════════════════════════════════
              PANEL IZQUIERDO — Lista + Archivo
              ═══════════════════════════════════════════════════════════ */}
          <div
            style={{
              width: '28%',
              minWidth: 240,
              borderRight: `1px solid ${DIV}`,
              background: BG,
              overflowY: 'auto',
              height: '100%',
            }}
            className="flex flex-col shrink-0"
          >
            {/* Cabecera sticky */}
            <div
              style={{ borderBottom: `1px solid ${DIV}`, background: BG, backdropFilter: 'blur(10px)' }}
              className="sticky top-0 z-10 flex items-center justify-between px-6 py-5"
            >
              <div>
                <h2 className="font-black text-xl uppercase tracking-tighter leading-none" style={{ color: TEXT }}>
                  News of today
                </h2>
                <p className="font-mono text-[8px] uppercase tracking-[0.3em] mt-0.5" style={{ color: MUTED }}>
                  {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {hasAccess && (
                  <button onClick={handleDownload} title="Guardar en disco"
                          className="w-8 h-8 flex items-center justify-center border transition-opacity hover:opacity-60"
                          style={{ borderColor: DIV }}>
                    <Download size={13} color={MUTED} />
                  </button>
                )}
                {/* Archivo por fecha */}
                <button onClick={() => setShowArchive(v => !v)} title="Archivo de noticias"
                        className="w-8 h-8 flex items-center justify-center border transition-opacity hover:opacity-60"
                        style={{ borderColor: DIV, background: showArchive ? TEXT : 'transparent' }}>
                  <Calendar size={13} color={showArchive ? BG : MUTED} />
                </button>
                <button onClick={() => setIsDark(d => !d)}
                        className="w-8 h-8 flex items-center justify-center border transition-opacity hover:opacity-60"
                        style={{ borderColor: DIV }}>
                  {isDark ? <Sun size={13} color={MUTED} /> : <Moon size={13} color={MUTED} />}
                </button>
              </div>
            </div>

            {/* Archive browser */}
            {showArchive && archiveDates.length > 0 && (
              <div style={{ borderBottom: `2px solid ${TEXT}`, background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                <p className="px-6 pt-4 pb-2 font-mono text-[8px] uppercase tracking-[0.35em] font-black" style={{ color: MUTED }}>
                  Archivo — {archiveDates.length} días
                </p>
                {archiveDates.map(date => {
                  const count = archive[date]?.length ?? 0;
                  const isToday = date === todayKey();
                  return (
                    <button
                      key={date}
                      onClick={() => {
                        const dayArticles = archive[date];
                        if (dayArticles?.length) {
                          setArticles(dayArticles);
                          setSelected(dayArticles[0]);
                          setShowArchive(false);
                        }
                      }}
                      className="w-full text-left px-6 py-3 flex items-center justify-between border-b transition-colors hover:opacity-70"
                      style={{ borderColor: DIV }}
                    >
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: isToday ? TEXT : MUTED }}>
                        {new Date(date + 'T12:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                        {isToday && <span className="ml-2 text-[7px]">· HOY</span>}
                      </span>
                      <span className="font-mono text-[9px] font-black" style={{ color: MUTED }}>{count}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Lista de artículos */}
            <div className="flex flex-col">
              {articles.map(art => {
                const isActive = selected?.id === art.id;
                return (
                  <button key={art.id} onClick={() => setSelected(art)} className="text-left w-full px-6 py-5 border-b transition-all relative group"
                    style={{ borderColor: DIV, background: isActive ? ACTIVE_BG : 'transparent', color: TEXT }}>
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: TEXT }} />
                    )}
                    <p className="font-mono text-[8px] uppercase tracking-[0.2em] font-bold mb-2 transition-colors"
                       style={{ color: isActive ? TEXT : MUTED }}>
                      {formatShort(art.date)}
                    </p>
                    <p className="font-sans font-black leading-tight text-[13px] group-hover:opacity-80 transition-opacity">{art.title}</p>
                  </button>
                );
              })}
              {articles.length === 0 && (
                <p className="p-6 font-mono text-xs uppercase" style={{ color: MUTED }}>Sin noticias disponibles.</p>
              )}
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              PANEL DERECHO — Lectura institucional
              ═══════════════════════════════════════════════════════════ */}
          <div ref={rightRef} style={{ flex: 1, height: '100%', overflowY: 'auto', background: BG }}>

            <AnimatePresence mode="wait">
              {selected && (
                <motion.article key={selected.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}>

                  {/* ── Barra de controles ─────────────────────────────── */}
                  <div className="flex items-center justify-between px-10 xl:px-16 py-5 border-b"
                       style={{ borderColor: DIV }}>
                    <span className="font-mono text-[8px] uppercase tracking-[0.3em]" style={{ color: MUTED }}>
                      {formatDate(selected.date)}
                    </span>
                    <div className="flex items-center gap-2">
                      {/* EUR conversion */}
                      {ethEur && (
                        <span className="font-mono text-[8px] uppercase tracking-widest px-2 py-1 border" style={{ borderColor: DIV, color: MUTED }}>
                          1 ETH ≈ {ethEur.toLocaleString('es-ES')} €
                        </span>
                      )}
                      {/* Tamaño tipográfico */}
                      <div className="flex border" style={{ borderColor: DIV }}>
                        <button onClick={() => setFontSize(f => Math.max(0.85, +(f - 0.1).toFixed(1)))}
                                className="px-2.5 py-1.5 font-mono text-[10px] font-bold hover:opacity-60 transition-opacity"
                                style={{ color: MUTED }}>A−</button>
                        <button onClick={() => setFontSize(1)}
                                className="px-2.5 py-1.5 font-mono text-[10px] font-bold hover:opacity-60 transition-opacity border-x"
                                style={{ color: MUTED, borderColor: DIV }}>A</button>
                        <button onClick={() => setFontSize(f => Math.min(1.6, +(f + 0.1).toFixed(1)))}
                                className="px-2.5 py-1.5 font-mono text-[10px] font-bold hover:opacity-60 transition-opacity"
                                style={{ color: MUTED }}>A+</button>
                      </div>
                      {hasAccess && (
                        <button onClick={() => setShareOpen(true)}
                                className="w-8 h-8 flex items-center justify-center border transition-opacity hover:opacity-60"
                                style={{ borderColor: DIV }}>
                          <Mail size={13} color={MUTED} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* IMAGEN HERO — APARECE ARRIBA DEL TITULO EN FULL BLEED */}
                  <div className="w-full pb-8">
                    <div
                      className="w-full overflow-hidden bg-[#080808]"
                      style={{
                        height: `clamp(320px, ${Math.round(480 * fontSize)}px, 720px)`,
                      }}
                    >
                      <motion.img
                        initial={{ opacity: 0, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, filter: 'blur(0px)' }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        ref={imgRef}
                        src={getArticleImage(selected)}
                        alt={selected.title}
                        className="w-full h-full object-cover grayscale transition-all duration-700"
                        loading="eager"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (target.dataset.errorHandled) return;
                          target.dataset.errorHandled = "true";
                          let hash = 0;
                          for (let i = 0; i < selected.id.length; i++) {
                            hash = selected.id.charCodeAt(i) + ((hash << 5) - hash);
                          }
                          const index = (Math.abs(hash) + 1) % FALLBACK_BGS.length;
                          target.src = FALLBACK_BGS[index];
                        }}
                      />
                    </div>
                  </div>

                  {/* ── Contenido del artículo: Fuente + Título ──────────────── */}
                  <div className="px-10 xl:px-16 pt-10 pb-4">
                    {/* FUENTE + ETIQUETA */}
                    <p className="font-mono text-[8px] uppercase tracking-[0.4em] mb-4" style={{ color: MUTED }}>
                      {selected.source} · Análisis Institucional
                    </p>

                    {/* TÍTULO PRINCIPAL - Peso medio-alto */}
                    <h1
                      className="font-sans font-medium tracking-tight leading-[1.04] mb-0 translate-y-[-2px]"
                      style={{
                        fontSize: `clamp(2rem, ${3.2 * fontSize}rem, 5rem)`,
                        color: TEXT,
                        textWrap: 'balance' as any,
                      }}
                    >
                      {selected.title}
                    </h1>
                  </div>

                  {/* ANÁLISIS PRINCIPAL */}
                  <div className="px-10 xl:px-16 pt-10 pb-6 max-w-[900px]">
                      {!hasAccess ? (
                        <div className="relative">
                          {/* Pseudo-content blurred */}
                          <div
                            className="font-sans font-light tracking-wide leading-[2.2] space-y-7 blur-sm select-none opacity-30 pointer-events-none"
                            style={{
                              fontSize: `${1.18 * fontSize}rem`,
                              color: isDark ? 'rgba(244,244,244,0.84)' : 'rgba(10,10,10,0.82)',
                            }}
                          >
                            <p>GLOBAL INTELLIGENCE BRIEF — Our thermodynamic telemetry nodes have detected an asymmetric event vector. This development triggers Level-Alpha monitoring protocols within our institutional infrastructure, as its propagation signature exceeds standard baseline metrics. Early warning systems indicate an anomalous concentration of high-value liquidity flows preceding this event horizon.</p>
                            <p>MACRO LIQUIDITY ANALYSIS — From an institutional liquidity standpoint, Tier-1 operators (wallets holding &gt;$10M in digital assets) are executing quiet but systematic exposure realignments. On-chain flow data points to structural reallocation away from centralized order books toward self-custody layers, a pattern historically correlated with major directional expansions within 48 hours. The latent buy-side pressure suggests an impending delta squeeze.</p>
                            <p>REGULATORY &amp; PROTOCOL IMPLICATIONS — Correlated analysis across the EVM ecosystem suggests immediate derivatives repricing. Open Interest metrics reflect a structural divergence between retail sentiment and institutional strategic positioning (accumulating heavily hedged longs). Operators equipped with sovereign intelligence engines are advised to maintain a Strategic Observer stance, awaiting 15-minute structural confirmation before committing algorithmic capital. End of sovereign transmission.</p>
                          </div>
                          
                          {/* Paywall Overlay */}
                          <div className="absolute inset-0 flex flex-col items-center justify-start pt-10">
                            <div 
                              className="max-w-md w-full border-4 p-10 text-center shadow-2xl relative overflow-hidden" 
                              style={{ borderColor: TEXT, background: BG }}
                            >
                              <div className="absolute top-0 left-0 w-full h-1" style={{ background: TEXT }} />
                              <Lock size={28} className="mx-auto mb-5" style={{ color: TEXT }} />
                              <h3 className="font-black text-2xl uppercase tracking-tighter mb-2" style={{ color: TEXT }}>
                                Terminal Restringida
                              </h3>
                              <p className="font-mono text-[9px] uppercase tracking-[0.2em] mb-8" style={{ color: MUTED }}>
                                El acceso a inteligencia institucional requiere verificación on-chain.
                              </p>
                              <button 
                                onClick={() => setCheckoutOpen(true)}
                                className="w-full py-4 font-mono text-xs font-black uppercase tracking-widest hover:opacity-80 transition-all border"
                                style={{ background: TEXT, color: BG, borderColor: TEXT }}
                              >
                                Desbloquear Acceso Seguro →
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="font-sans font-light tracking-wide leading-[2.2] space-y-7 opacity-80"
                          style={{
                            fontSize: `${1.18 * fontSize}rem`,
                            color: isDark ? 'rgba(244,244,244,0.84)' : 'rgba(10,10,10,0.82)',
                          }}
                        >
                          {selected.description
                            ? selected.description.split(/\n\n+/).map((p, i) => (
                                <p key={i}>{p}</p>
                              ))
                            : (
                                <>
                                  <p>GLOBAL INTELLIGENCE BRIEF — Our thermodynamic telemetry nodes have detected an asymmetric event vector. This development triggers Level-Alpha monitoring protocols within our institutional infrastructure, as its propagation signature exceeds standard baseline metrics. Early warning systems indicate an anomalous concentration of high-value liquidity flows preceding this event horizon.</p>
                                  <p>MACRO LIQUIDITY ANALYSIS — From an institutional liquidity standpoint, Tier-1 operators (wallets holding &gt;$10M in digital assets) are executing quiet but systematic exposure realignments. On-chain flow data points to structural reallocation away from centralized order books toward self-custody layers, a pattern historically correlated with major directional expansions within 48 hours. The latent buy-side pressure suggests an impending delta squeeze.</p>
                                  <p>REGULATORY &amp; PROTOCOL IMPLICATIONS — Correlated analysis across the EVM ecosystem suggests immediate derivatives repricing. Open Interest metrics reflect a structural divergence between retail sentiment and institutional strategic positioning (accumulating heavily hedged longs). Operators equipped with sovereign intelligence engines are advised to maintain a Strategic Observer stance, awaiting 15-minute structural confirmation before committing algorithmic capital. End of sovereign transmission.</p>
                                </>
                              )
                          }
                        </div>
                      )}

                    {/* FOOTER LEGAL */}
                    <div className="mt-20 pt-8 border-t" style={{ borderColor: DIV }}>
                      <div className="flex justify-between items-center font-mono text-[8px] uppercase tracking-[0.3em] mb-3"
                           style={{ color: MUTED }}>
                        <span>Whale Alert Network — Intel Report</span>
                        <span>No Reliance / Educational Only</span>
                      </div>
                      <p className="font-mono text-[8px] leading-relaxed uppercase tracking-wide" style={{ color: MUTED }}>
                        La información presentada tiene fines exclusivamente educativos e informativos. Operar en mercados de criptoactivos implica riesgo de pérdida total de capital. Ningún contenido de esta terminal constituye asesoramiento financiero, legal ni fiscal. Zero almacenamiento de datos personales. Todas las transacciones están sujetas a las leyes vigentes de su jurisdicción.
                      </p>
                    </div>
                  </div>
                </motion.article>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          MODALES
          ═══════════════════════════════════════════════════════════ */}
      <CryptoCheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} />

      <AnimatePresence>
        {shareOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="fixed inset-0 z-50 flex items-center justify-center p-4"
                      style={{ background: 'rgba(0,0,0,0.82)' }}>
            <motion.div initial={{ scale: 0.97, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.97 }}
                        className="w-full max-w-md relative"
                        style={{ background: BG, color: TEXT, border: `2px solid ${TEXT}` }}>
              <div className="flex items-center justify-between px-7 py-5 border-b" style={{ borderColor: DIV }}>
                <div className="flex items-center gap-3">
                  <Mail size={18} />
                  <span className="font-black text-lg uppercase tracking-tight">Compartir Intel</span>
                </div>
                <button onClick={() => setShareOpen(false)} className="opacity-50 hover:opacity-100 transition-opacity">
                  <X size={18} />
                </button>
              </div>

              {shareSent ? (
                <div className="p-16 text-center font-mono text-sm font-black uppercase tracking-widest">Transmisión Completada ✓</div>
              ) : (
                <form onSubmit={handleShare} className="p-7 space-y-7">
                  <div>
                    <label className="block font-mono text-[9px] uppercase tracking-widest font-bold mb-2" style={{ color: MUTED }}>Destinatario</label>
                    <input type="email" required value={shareEmail} onChange={e => setShareEmail(e.target.value)}
                           className="w-full bg-transparent outline-none border-b py-2 font-mono text-sm"
                           style={{ borderColor: DIV, color: TEXT }} placeholder="correo@dominio.com" />
                  </div>
                  <div>
                    <label className="block font-mono text-[9px] uppercase tracking-widest font-bold mb-2" style={{ color: MUTED }}>Nota (Opcional)</label>
                    <textarea value={shareNote} onChange={e => setShareNote(e.target.value)} rows={3}
                              className="w-full bg-transparent outline-none border p-3 font-serif text-sm resize-none"
                              style={{ borderColor: DIV, color: TEXT }} />
                  </div>
                  <button type="submit" disabled={isSending}
                          className="w-full py-4 font-mono text-[10px] font-black uppercase tracking-widest disabled:opacity-40"
                          style={{ background: TEXT, color: BG }}>
                    {isSending ? 'Enviando...' : 'Transmitir Acceso Único (1-Time)'}
                  </button>
                  <p className="text-center font-mono text-[8px] uppercase tracking-widest" style={{ color: MUTED }}>
                    El destinatario solo podrá leer esta noticia una vez.
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
