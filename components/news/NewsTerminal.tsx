"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, ShieldCheck, Mail, Moon, Sun, X, AlertTriangle } from 'lucide-react';
import { useNewsStore } from '@/lib/store/news-store';
import { CryptoCheckoutModal } from './CryptoCheckoutModal';

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  date: string;
  url: string;
  source: string;
}

// ─────────────────────────────────────────────────────────────
// CONSTANTE DE ALTURA DEL HEADER GLOBAL (InstitutionalHeader)
// Ajusta este valor si el header global mide diferente.
// ─────────────────────────────────────────────────────────────
const HEADER_HEIGHT = 64; // px

export function NewsTerminal() {
  const { isNewsSubscribed, lastBackupDate, setLastBackupDate, setNewsSubscribed } = useNewsStore();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  // UI Controls
  const [isDark, setIsDark] = useState(false);
  const [fontSize, setFontSize] = useState(1); // Multiplicador relativo
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareNote, setShareNote] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [shareSent, setShareSent] = useState(false);
  const [isBlockedByCaducity, setIsBlockedByCaducity] = useState(false);

  const [dataSource, setDataSource] = useState<'live' | 'rss' | 'db-cache' | 'none' | null>(null);

  // Referencias para scroll programático (auto-scroll al seleccionar)
  const rightPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // ── 1-Time Read: Caducidad de token compartido ──
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('share_token');
      if (token && !isNewsSubscribed) {
        try {
          const decoded = JSON.parse(atob(token));
          const key = `has_read_${decoded.id}`;
          if (localStorage.getItem(key)) {
            setIsBlockedByCaducity(true);
            setLoading(false);
            return;
          }
          localStorage.setItem(key, '1');
          window.history.replaceState({}, '', '/news');
        } catch {
          // Token malformado, ignorar
        }
      }
    }

    fetch('/api/news', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        const items: NewsArticle[] = data.articles ?? [];
        setArticles(items);
        setDataSource(data.source ?? null);
        if (items.length > 0) setSelectedArticle(items[0]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isNewsSubscribed]);

  // Scroll to top derecho al cambiar artículo
  useEffect(() => {
    rightPanelRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedArticle?.id]);

  // Download al disco D:
  const handleDownload = async () => {
    const today = new Date().toISOString().split('T')[0];
    const blob = new Blob([JSON.stringify({ date: today, articles }, null, 2)], { type: 'application/json' });
    if ('showSaveFilePicker' in window) {
      try {
        // @ts-ignore
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: `${today}_WhaleNews.json`,
          types: [{ accept: { 'application/json': ['.json'] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        setLastBackupDate(today);
        return;
      } catch (e: any) {
        if (e.name === 'AbortError') return;
      }
    }
    // Fallback genérico
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${today}_WhaleNews.json`; a.click();
    URL.revokeObjectURL(url);
    setLastBackupDate(today);
  };

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArticle || !shareEmail) return;
    setIsSending(true);
    try {
      await fetch('/api/news/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailTarget: shareEmail, articleId: selectedArticle.id, articleTitle: selectedArticle.title, messageNote: shareNote }),
      });
      setShareSent(true);
      setTimeout(() => { setShareOpen(false); setShareSent(false); setShareEmail(''); setShareNote(''); }, 2200);
    } finally {
      setIsSending(false);
    }
  };

  // ── Paleta ──────────────────────────────────────────────────
  const bg   = isDark ? '#0a0a0a' : '#FFFFFF';
  const text  = isDark ? '#f0f0f0' : '#060606';
  const div   = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  const muted = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';

  const panelH = `calc(100vh - ${HEADER_HEIGHT}px)`;

  // ── Pantalla caducidad ───────────────────────────────────────
  if (isBlockedByCaducity) {
    return (
      <div style={{ background: bg, color: text, minHeight: '100vh' }}
           className="flex flex-col items-center justify-center text-center p-8">
        <AlertTriangle size={40} className="mb-6" />
        <h1 className="font-black text-5xl uppercase tracking-tighter mb-4">Acceso Expirado</h1>
        <p className="font-mono text-xs uppercase tracking-widest max-w-md mb-10 leading-relaxed" style={{ color: muted }}>
          El privilegio de lectura única ha sido consumido. Para restablecer acceso permanente, active su nodo institucional.
        </p>
        <button onClick={() => setCheckoutOpen(true)}
          className="font-mono text-xs font-black uppercase tracking-widest px-10 py-4 border transition-colors"
          style={{ background: text, color: bg, borderColor: text }}>
          Activar Acceso (0.015 ETH)
        </button>
        <CryptoCheckoutModal isOpen={isCheckoutOpen} onClose={() => setCheckoutOpen(false)} />
      </div>
    );
  }

  // ── Loader ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ background: bg, color: text, height: panelH }}
           className="flex items-center justify-center">
        <span className="font-mono text-[10px] uppercase tracking-[0.4em] flex items-center gap-3" style={{ color: muted }}>
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
            className="block w-4 h-4 border-2 border-current border-t-transparent"
          />
          Sincronizando Terminal Forense...
        </span>
      </div>
    );
  }

  return (
    <div style={{ background: bg, color: text, height: panelH, overflow: 'hidden' }}
         className="flex flex-row w-full">

      {/* ══════════════════════════════════════════════════
          PANEL IZQUIERDO — Lista de 50 noticias
          ══════════════════════════════════════════════════ */}
      <div style={{ width: '32%', borderRight: `1px solid ${div}`, height: '100%', overflowY: 'auto' }}
           className="flex flex-col shrink-0">

        {/* Cabecera fija del panel izquierdo */}
        <div style={{ borderBottom: `1px solid ${div}`, background: bg }}
             className="sticky top-0 z-10 flex items-center justify-between px-6 py-4">
          <div>
            <h2 className="font-black text-2xl uppercase tracking-tighter" style={{ color: text }}>
              WHALE NEWS
            </h2>
            {dataSource && (
              <span className="font-mono text-[8px] uppercase tracking-[0.25em] flex items-center gap-1.5 mt-0.5"
                    style={{ color: dataSource === 'live' ? '#16a34a' : dataSource === 'rss' ? '#2563eb' : dataSource === 'db-cache' ? '#b45309' : '#dc2626' }}>
                <span className="w-1.5 h-1.5 rounded-full inline-block"
                      style={{ background: dataSource === 'live' ? '#16a34a' : dataSource === 'rss' ? '#2563eb' : dataSource === 'db-cache' ? '#b45309' : '#dc2626' }} />
                {dataSource === 'live'     ? 'En vivo · CryptoPanic'
                : dataSource === 'rss'     ? 'En vivo · RSS Institucional'
                : dataSource === 'db-cache' ? 'Caché · Últimos 30 días'
                :                            'Sin datos — Revisar fuentes'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isNewsSubscribed && (
              <button onClick={handleDownload}
                      title="Descargar archivo a disco D:"
                      className="w-8 h-8 flex items-center justify-center border transition-all hover:opacity-70"
                      style={{ borderColor: div, color: muted }}>
                <Download size={13} />
              </button>
            )}
            <button onClick={() => setIsDark(d => !d)}
                    className="w-8 h-8 flex items-center justify-center border transition-all hover:opacity-70"
                    style={{ borderColor: div, color: muted }}>
              {isDark ? <Sun size={13} /> : <Moon size={13} />}
            </button>
          </div>
        </div>

        {/* Lista de artículos */}
        <div className="flex flex-col">
          {articles.map((art) => {
            const active = selectedArticle?.id === art.id;
            return (
              <button
                key={art.id}
                onClick={() => setSelectedArticle(art)}
                className="text-left w-full px-6 py-5 border-b transition-colors"
                style={{
                  borderColor: div,
                  background: active ? text : 'transparent',
                  color: active ? bg : text,
                }}>
                <div className="font-mono text-[9px] uppercase tracking-[0.2em] mb-2 flex items-center gap-2"
                     style={{ color: active ? (isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.6)') : muted }}>
                  <span className="w-1.5 h-1.5 rounded-full inline-block"
                        style={{ background: active ? (isDark ? '#000' : '#fff') : muted }} />
                  {new Date(art.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                  {' · '}
                  {new Date(art.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <p className="font-sans font-black leading-tight text-[15px]">
                  {art.title}
                </p>
              </button>
            );
          })}
          {articles.length === 0 && (
            <p className="p-6 font-mono text-xs uppercase" style={{ color: muted }}>
              Sin noticias disponibles. Reconectando...
            </p>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          PANEL DERECHO — Lectura extendida
          ══════════════════════════════════════════════════ */}
      <div ref={rightPanelRef}
           style={{ flex: 1, height: '100%', overflowY: 'auto', position: 'relative', background: bg }}>

        <AnimatePresence mode="wait">
          {selectedArticle ? (
            <motion.div
              key={selectedArticle.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="px-12 py-10 max-w-4xl"
            >
              {/* ── Barra de controles ── */}
              <div className="flex items-center justify-between mb-12 pb-4"
                   style={{ borderBottom: `1px solid ${div}` }}>
                <span className="font-mono text-[9px] uppercase tracking-[0.3em]" style={{ color: muted }}>
                  {new Date(selectedArticle.date).toLocaleString('es-ES', {
                    weekday: 'short', day: '2-digit', month: 'long', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>

                <div className="flex items-center gap-1.5">
                  {/* Font Size Controls */}
                  <div className="flex border" style={{ borderColor: div }}>
                    <button onClick={() => setFontSize(f => Math.max(0.8, +(f - 0.1).toFixed(1)))}
                            className="px-2.5 py-1.5 font-mono text-[10px] font-bold hover:opacity-60 transition-opacity"
                            style={{ color: muted }}>A−</button>
                    <button onClick={() => setFontSize(1)}
                            className="px-2.5 py-1.5 font-mono text-[10px] font-bold hover:opacity-60 transition-opacity border-x"
                            style={{ color: muted, borderColor: div }}>A</button>
                    <button onClick={() => setFontSize(f => Math.min(1.5, +(f + 0.1).toFixed(1)))}
                            className="px-2.5 py-1.5 font-mono text-[10px] font-bold hover:opacity-60 transition-opacity"
                            style={{ color: muted }}>A+</button>
                  </div>
                  {/* Share (solo suscritos) */}
                  {isNewsSubscribed && (
                    <button onClick={() => setShareOpen(true)}
                            className="w-8 h-8 flex items-center justify-center border transition-all hover:opacity-60"
                            style={{ borderColor: div, color: muted }}>
                      <Mail size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* ── Título ── */}
              <h1 className="font-black tracking-tighter leading-[1.05] mb-12"
                  style={{ fontSize: `${3.5 * fontSize}rem`, color: text }}>
                {selectedArticle.title}
              </h1>

              {/* ── Cuerpo analítico ── */}
              <div className="font-serif leading-8 space-y-7"
                   style={{ fontSize: `${1.15 * fontSize}rem`, color: isDark ? 'rgba(240,240,240,0.85)' : 'rgba(6,6,6,0.82)' }}>
                {selectedArticle.description
                  ? selectedArticle.description.split('\n\n').map((p, i) => <p key={i}>{p}</p>)
                  : <p>Procesando análisis forense...</p>}
              </div>

              {/* ── Footer Compliance ── */}
              <div className="mt-24 pt-8 space-y-4"
                   style={{ borderTop: `1px solid ${div}` }}>
                <div className="flex justify-between items-center font-mono text-[9px] uppercase tracking-[0.3em]"
                     style={{ color: muted }}>
                  <span>Whale Alert Network — Intel Report</span>
                  <span>No Reliance / Educational Purposes Only</span>
                </div>
                <p className="font-mono text-[9px] leading-relaxed uppercase tracking-wide"
                   style={{ color: muted }}>
                  La información presentada tiene fines exclusivamente educativos e informativos. Operar en mercados de criptoactivos implica riesgos de pérdida total de capital. Ningún contenido de esta terminal constituye asesoramiento financiero, legal ni fiscal. Zero almacenamiento de datos personales (Privacy by Void). Todas las transacciones están sujetas a las leyes vigentes de su jurisdicción.
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex items-center justify-center" style={{ color: muted }}>
              <p className="font-mono text-xs uppercase tracking-widest">Seleccione un nodo de la izquierda</p>
            </div>
          )}
        </AnimatePresence>

        {/* ── PAYWALL: Cortina sobre el panel derecho ── */}
        {!isNewsSubscribed && selectedArticle && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-end pb-20 px-10 pointer-events-none"
               style={{ background: isDark
                 ? 'linear-gradient(to bottom, transparent 0%, #0a0a0a 65%)'
                 : 'linear-gradient(to bottom, transparent 0%, #ffffff 65%)' }}>
            <div className="pointer-events-auto w-full max-w-sm border p-10 text-center"
                 style={{ background: bg, borderColor: text }}>
              <ShieldCheck size={32} className="mx-auto mb-5" style={{ color: text }} />
              <h2 className="font-black text-3xl uppercase tracking-tighter mb-3" style={{ color: text }}>
                Acceso Restringido
              </h2>
              <p className="font-mono text-[10px] uppercase tracking-widest leading-relaxed mb-8"
                 style={{ color: muted }}>
                Las 50 noticias con análisis institucional completo están disponibles exclusivamente para nodos suscritos.
              </p>
              <button onClick={() => setCheckoutOpen(true)}
                      className="w-full py-4 font-mono text-[11px] font-black uppercase tracking-[0.3em] border transition-all"
                      style={{ background: text, color: bg, borderColor: text }}>
                Activar Nodo — 0.015 ETH
              </button>
              <p className="mt-4 font-mono text-[8px] uppercase tracking-widest"
                 style={{ color: muted }}>
                Red Optimism · Pago One-Shot · Sin datos personales
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════
          MODALES AUXILIARES
          ══════════════════════════════════════════════════ */}
      <CryptoCheckoutModal isOpen={isCheckoutOpen} onClose={() => setCheckoutOpen(false)} />

      <AnimatePresence>
        {shareOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="fixed inset-0 z-50 flex items-center justify-center p-4"
                      style={{ background: 'rgba(0,0,0,0.75)' }}>
            <motion.div initial={{ scale: 0.97, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.97 }}
                        className="w-full max-w-md border relative"
                        style={{ background: bg, borderColor: text }}>
              {/* Header modal */}
              <div className="flex items-center justify-between px-7 py-5 border-b"
                   style={{ borderColor: div }}>
                <div className="flex items-center gap-3">
                  <Mail size={18} style={{ color: text }} />
                  <span className="font-black text-lg uppercase tracking-tight" style={{ color: text }}>
                    Compartir Intel
                  </span>
                </div>
                <button onClick={() => setShareOpen(false)} className="hover:opacity-50 transition-opacity">
                  <X size={18} style={{ color: text }} />
                </button>
              </div>

              {/* Body modal */}
              {shareSent ? (
                <div className="p-12 text-center font-mono text-sm uppercase font-black tracking-widest"
                     style={{ color: text }}>
                  Transmisión Completada ✓
                </div>
              ) : (
                <form onSubmit={handleShare} className="p-7 space-y-6">
                  <div>
                    <label className="block font-mono text-[9px] uppercase tracking-widest font-bold mb-2"
                           style={{ color: muted }}>
                      Destinatario
                    </label>
                    <input type="email" required value={shareEmail}
                           onChange={e => setShareEmail(e.target.value)}
                           className="w-full bg-transparent outline-none border-b py-2 font-mono text-sm"
                           style={{ borderColor: div, color: text }}
                           placeholder="correo@dominio.com" />
                  </div>
                  <div>
                    <label className="block font-mono text-[9px] uppercase tracking-widest font-bold mb-2"
                           style={{ color: muted }}>
                      Nota (Opcional)
                    </label>
                    <textarea value={shareNote}
                              onChange={e => setShareNote(e.target.value)}
                              rows={3}
                              className="w-full bg-transparent outline-none border p-3 font-serif text-sm resize-none"
                              style={{ borderColor: div, color: text }} />
                  </div>
                  <button type="submit" disabled={isSending}
                          className="w-full py-4 font-mono text-[10px] font-black uppercase tracking-widest border disabled:opacity-40"
                          style={{ background: text, color: bg, borderColor: text }}>
                    {isSending ? 'Enviando...' : 'Transmitir Acceso Único (1-Time)'}
                  </button>
                  <p className="text-center font-mono text-[8px] uppercase tracking-widest" style={{ color: muted }}>
                    El destinatario solo podrá leer esta noticia una vez.
                  </p>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
