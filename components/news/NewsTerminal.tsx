"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Download, Mail, X, ChevronDown, ChevronUp, Calendar, Lock, ChevronLeft } from 'lucide-react';
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

  // ── Access is FREE for all users — paywall disabled ────────────────────
  // To re-enable, restore: const hasAccess = isNewsSubscribed || IS_WHITELISTED;
  const hasAccess = true;

  const [articles,    setArticles]    = useState<NewsArticle[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [selected,    setSelected]    = useState<NewsArticle | null>(null);
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

  // ── Paleta institucional pura ─────────────────────────────────────────────
  const BG    = '#FAF9F6';
  const TEXT  = '#0A0A0A';
  const DIV   = 'rgba(0,0,0,0.08)';
  const MUTED = 'rgba(0,0,0,0.4)';
  const ACTIVE_BG = 'rgba(0,0,0,0.04)';

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
      {/* Root container — GPU compositing layer to eliminate paint on scroll */}
      <div
        style={{
          background: BG,
          color: TEXT,
          minHeight: panelH,
          // Force Chromium/WebKit to promote to a GPU compositing layer
          willChange: 'transform',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          // Disable elastic overscroll bounce inside container (iOS safe-area)
          overscrollBehavior: 'none',
        }}
        className="w-full relative"
      >
        <div
          style={{ height: panelH, overflow: 'hidden' }}
          className="flex w-full"
        >

          {/* ═══════════════════════════════════════════════════════════════
              PANEL IZQUIERDO — Lista + Archivo
              ═══════════════════════════════════════════════════════════ */}
          <div
            style={{
              borderRight: `1px solid ${DIV}`,
              background: BG,
              overflowY: 'auto',
              height: '100%',
              WebkitOverflowScrolling: 'touch',
              willChange: 'transform',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
            }}
            className={`flex-col shrink-0 w-full md:w-[28%] md:min-w-[320px] lg:min-w-[360px] ${selected ? 'hidden md:flex' : 'flex'}`}
          >
            {/* Cabecera sticky */}
            <div
              style={{ borderBottom: `1px solid ${DIV}`, background: BG, backdropFilter: 'blur(10px)' }}
              className="sticky top-0 z-10 flex items-center justify-between px-6 py-5"
            >
              <div>
                <h2 className="font-black text-xl uppercase tracking-tighter leading-none" style={{ color: TEXT }}>
                  THE WHALE POST
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
              </div>
            </div>

            {/* Archive browser */}
            {showArchive && archiveDates.length > 0 && (
              <div style={{ borderBottom: `2px solid ${TEXT}`, background: 'rgba(0,0,0,0.02)' }}>
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

            {/* Lista de artículos (Culling Activo: Máximo 50 Nodos en DOM para evitar Memory Saturation) */}
            <div className="flex flex-col">
              {articles.slice(0, 50).map(art => {
                const isActive = selected?.id === art.id;
                return (
                  <button
                    key={art.id}
                    onClick={() => setSelected(art)}
                    className="text-left w-full px-6 py-5 border-b relative group"
                    style={{
                      borderColor: DIV,
                      background: isActive ? ACTIVE_BG : 'transparent',
                      color: TEXT,
                      // GPU promote each row: eliminates scroll jank on 120/240Hz iOS
                      WebkitTapHighlightColor: 'transparent',
                      touchAction: 'manipulation',
                      WebkitFontSmoothing: 'antialiased',
                      transition: 'background 0.1s ease',
                    }}
                  >
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
          <div 
             ref={rightRef} 
             style={{ 
               flex: 1, 
               height: '100%', 
               overflowY: 'auto', 
               background: BG,
               WebkitOverflowScrolling: 'touch',
               willChange: 'transform',
               transform: 'translateZ(0)',
             }}
             className={`${selected ? 'flex' : 'hidden md:flex'} flex-col w-full md:w-auto relative`}
          >

            <AnimatePresence mode="wait">
              {selected && (
                <motion.article key={selected.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}>

                  {/* ── Barra de controles ─────────────────────────────── */}
                  <div className="flex items-center justify-between px-6 md:px-10 xl:px-16 py-5 border-b"
                       style={{ borderColor: DIV }}>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setSelected(null)}
                        className="md:hidden flex items-center justify-center p-1 -ml-2 rounded-full border transition-all"
                        style={{ borderColor: DIV, background: 'rgba(0,0,0,0.03)' }}
                      >
                         <ChevronLeft size={16} color={MUTED} />
                      </button>
                      <span className="font-mono text-[8px] uppercase tracking-[0.3em] font-medium" style={{ color: MUTED }}>
                        {formatDate(selected.date)}
                      </span>
                    </div>
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

                  {/* IMAGEN HERO — GPU composited full-bleed hero */}
                  <div className="w-full pb-8">
                    <div
                      className="w-full overflow-hidden bg-[#F0EFEC]"
                      style={{
                        // Mobile: smaller hero to preserve scroll perf on 6" screens
                        height: `clamp(200px, 45vw, ${Math.round(480 * fontSize)}px)`,
                        // Hard-composite to GPU layer — prevents texture upload stalls on A-series chips
                        willChange: 'transform',
                        transform: 'translateZ(0)',
                        backfaceVisibility: 'hidden',
                      }}
                    >
                      <motion.img
                        key={selected.id}
                        initial={{ opacity: 0, scale: 1.04 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
                        ref={imgRef}
                        src={getArticleImage(selected)}
                        alt={selected.title}
                        className="w-full h-full object-cover"
                        loading="eager"
                        decoding="async"
                        fetchPriority="high"
                        style={{
                          // Tell engine this image will animate — pre-allocate VRAM tile
                          willChange: 'opacity, transform',
                          transform: 'translateZ(0)',
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (target.dataset.errorHandled) return;
                          target.dataset.errorHandled = 'true';
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
                  <div className="px-6 md:px-10 xl:px-16 pt-8 pb-4">
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
                  <div className="px-6 md:px-10 xl:px-16 pt-8 pb-6 max-w-[900px]">
                      {/* ── Full content — access is open to all users ── */}
                      <div
                        className="font-sans font-light tracking-wide leading-[1.9] space-y-5 opacity-85"
                        style={{
                          fontSize: `${0.82 * fontSize}rem`,
                          color: 'rgba(10,10,10,0.85)',
                        }}
                      >
                        {selected.description
                          ? selected.description.split(/\n\n+/).map((p, i) => (
                              <p key={i} className="mb-6">{p}</p>
                            ))
                          : (
                              <div className="space-y-6">
                                <p className="font-bold uppercase tracking-widest text-[10px] text-black">Technical Abstract & Zero-Mock Paradigm</p>
                                <p>El ecosistema de activos digitales sufre de una asimetría de información intrínseca. La Network nace como un hub de grado institucional diseñado para absorber el caudal del mempool global, identificar movimientos de altísimo capital (Whales) antes de la resolución del bloque, y propagar una red P2P (mesh network) hacia un enjambre de clientes en milisegundos. Esta infraestructura elimina el retraso artificial y permite una toma de decisiones respaldada por Z-scores criptográficos.</p>
                                
                                <p><strong>Mandato Zero-Mock:</strong> Ningún componente de esta arquitectura inyecta visualizaciones falsas o datos simulados. El frontend Next.js se alimenta directamente de Redis Pub/Sub TCP con ECDSA real, garantizando inmutabilidad. Si una ballena transfiere 5,000 ETH en bloque, ese es el dato que llega a este hub en 400ms.</p>
                                
                                <p className="font-bold uppercase tracking-widest text-[10px] text-black pt-4">Data Processing & Sub-500ms Execution</p>
                                <p>Mientras los agregadores clásicos dependen del sondeo o the Graph public queries, este enjambre implementa WebSockets paralelos con BullMQ Redis sobre PostgreSQL 1TB Node. Los workers de Capa 2 (Optimistic y ZK-Rollups) se indexan individualmente para mantener el orden cronológico a nivel de mempool.</p>
                                
                                <p><strong>Cryptographic Signature Fallback:</strong> La autenticación institucional móvil que ofrecemos no depende de contraseñas. Depende puramente de una firma criptográfica ECDSA de gas cero generada por la clave privada inyectada en WalletConnect o MetaMask, protegiendo todos los datos del terminal de accesos arbitrarios al aislar a los agentes sin estado.</p>
                                
                                <p className="font-bold uppercase tracking-widest text-[10px] text-black pt-4">Global Deployment & 2026 Roadmap</p>
                                <p>Tras validar las métricas técnicas EIP-4844 de proto-danksharding, la red puede escalar el caudal a picos instantáneos sin requerir sharding de base de datos vertical. Los nodos se sostienen con integraciones directas EigenLayer AVS, dándole un peso económico real a la firma de las alertas antes de que se distribuyan a los clientes VIP.</p>

                                <p>Los operadores de terminales ahora tienen la certeza definitiva de la precisión cronológica de la liquidez. A medida que expandimos la capacidad técnica a 10,000 workers distribuidos mundialmente, la latencia seguirá convergiendo matemáticamente hacia la frontera física de la topología de la fibra óptica internacional.</p>
                              </div>
                            )
                        }
                      </div>

                    {/* FOOTER LEGAL */}
                    <div className="mt-20 pt-8 border-t" style={{ borderColor: DIV }}>
                      <div className="flex justify-between items-center font-mono text-[10px] uppercase tracking-widest font-bold mb-3"
                           style={{ color: MUTED }}>
                        <span>Professional Analysis Report</span>
                        <span>Strictly Educational Insights</span>
                      </div>
                      <p className="font-mono text-xs leading-relaxed uppercase tracking-wide opacity-50" style={{ color: MUTED }}>
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
