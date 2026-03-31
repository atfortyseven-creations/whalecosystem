"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, AlertTriangle, ShieldCheck, Mail, Moon, Sun, Type, X } from 'lucide-react';
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

export function NewsTerminal() {
  const { isNewsSubscribed, lastBackupDate, setLastBackupDate } = useNewsStore();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Master-Detail State
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  
  // Settings State (Por defecto es BLANCO PURO)
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontSizeRatio, setFontSizeRatio] = useState<number>(1);
  
  // Lock States
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareNote, setShareNote] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  // Caducidad 1-Time Read (Comprobador)
  const [isBlockedByCaducity, setIsBlockedByCaducity] = useState(false);

  useEffect(() => {
    // REVISIÓN ALGORÍTMICA: 1-Time Read caducity
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const shareToken = urlParams.get('share_token');
      
      if (shareToken && !isNewsSubscribed) {
        try {
          const decoded = JSON.parse(atob(shareToken));
          const flagKey = `has_read_${decoded.id}`;
          
          if (localStorage.getItem(flagKey)) {
            setIsBlockedByCaducity(true);
            setLoading(false);
            return;
          } else {
            localStorage.setItem(flagKey, 'true');
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } catch (e) {
          console.warn("Token biométrico de noticias corrompido");
        }
      }
    }

    async function fetchNews() {
      try {
        const res = await fetch('/api/news', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const loadedArticles = data.articles || [];
          setArticles(loadedArticles);
          if (loadedArticles.length > 0) {
            setSelectedArticle(loadedArticles[0]);
          }
        } else {
          setArticles([]);
        }
      } catch (e) {
        console.error("Network termal threshold reached", e);
      } finally {
        setLoading(false);
      }
    }
    
    if (!isBlockedByCaducity) {
      fetchNews();
    }
  }, [isNewsSubscribed]);

  // Download Handler (Whale Archive D:\)
  const handleSaveToDrive = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const fileName = `${today}_WhaleNewsArchive.json`;
      const fileData = JSON.stringify({
        date: new Date().toISOString(),
        metadata: 'WHALE_ALERT_NETWORK_ARCHIVE',
        content: articles
      }, null, 2);

      if ('showSaveFilePicker' in window) {
        // @ts-ignore
        const handle = await window.showSaveFilePicker({
          suggestedName: fileName,
          types: [{ description: 'Archivo Diario', accept: { 'application/json': ['.json'] } }],
        });
        // @ts-ignore
        const writable = await handle.createWritable();
        await writable.write(fileData);
        await writable.close();
      } else {
        const blob = new Blob([fileData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
      }
      setLastBackupDate(today);
    } catch (err: any) {
      if (err.name !== 'AbortError') console.error("Fallo de FileSystem", err);
    }
  };

  const handleShareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArticle || !shareEmail) return;
    
    setIsSharing(true);
    try {
      const res = await fetch('/api/news/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailTarget: shareEmail,
          articleId: selectedArticle.id,
          articleTitle: selectedArticle.title,
          messageNote: shareNote
        })
      });
      if (res.ok) {
        setShareSuccess(true);
        setTimeout(() => { setShareModalOpen(false); setShareSuccess(false); setShareEmail(''); setShareNote(''); }, 2000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSharing(false);
    }
  };

  const todayDateString = new Date().toISOString().split('T')[0];
  const isAlreadyBackedUp = lastBackupDate === todayDateString;

  // Render para "Muerto por Refresh" One-Time Read Limit
  if (isBlockedByCaducity) {
    return (
      <div className="w-full flex-grow flex flex-col items-center justify-center p-6 text-center bg-white text-black min-h-[calc(100vh-80px)]">
        <div className="w-20 h-20 bg-black flex items-center justify-center mb-6">
          <AlertTriangle className="text-white" size={32} />
        </div>
        <h1 className="font-sans text-6xl font-black uppercase mb-4 text-black tracking-tighter">ACCESO DENEGADO</h1>
        <p className="font-mono text-xs max-w-lg mb-10 tracking-widest leading-relaxed opacity-100">
           LA REGLA SOBERANA DE "UNA SOLA LECTURA" HA SIDO EJECUTADA. LA OPORTUNIDAD DE VISUALIZACIÓN FUE EXPIRADA. OBTENGA ACCESO ABSOLUTO MEDIANTE TRANSFERENCIA ETH.
        </p>
        <button
          onClick={() => setCheckoutOpen(true)}
          className="bg-black text-white font-mono text-sm uppercase px-12 py-5 font-black tracking-widest hover:bg-black/80 transition-all border border-black"
        >
          DESBLOQUEAR TERMINAL FORENSE (0.015 ETH)
        </button>
        <CryptoCheckoutModal isOpen={isCheckoutOpen} onClose={() => setCheckoutOpen(false)} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full min-h-[calc(100vh-80px)] flex justify-center py-40 opacity-100 bg-white">
        <span className="font-mono text-xs uppercase tracking-[0.3em] flex items-center gap-2 text-black">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="w-4 h-4 border-2 border-black border-t-transparent" />
          Sincronizando 50 Nodos Forenses...
        </span>
      </div>
    );
  }

  // Estilos Bloomberg-style: Sharp, flat colors, no shadows, simple borders
  const panelBg = isDarkMode ? '#000000' : '#FFFFFF';
  const panelText = isDarkMode ? '#FFFFFF' : '#000000';
  const panelBorder = isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)';

  return (
    <div className="w-full max-w-[1920px] mx-auto flex flex-col lg:flex-row h-[calc(100vh-80px)] border-t" style={{ borderColor: panelBorder }}>
      
      {/* ───────────────────────────────────────────────────────── 
          LEFT PANEL: 50 Noticias de Indexación (35%)
          ───────────────────────────────────────────────────────── */}
      <div className="w-full lg:w-[30%] h-full overflow-y-auto border-r bg-white" style={{ borderColor: panelBorder, background: panelBg }}>
        <div className="sticky top-0 bg-inherit border-b z-10 px-6 py-5 flex justify-between items-center" style={{ borderColor: panelBorder }}>
           <h2 className="font-sans text-3xl font-black uppercase tracking-tighter" style={{ color: panelText }}>ÍNDICE FORENSE</h2>
           {isNewsSubscribed && (
              <button
                onClick={handleSaveToDrive}
                disabled={isAlreadyBackedUp}
                className="w-8 h-8 flex items-center justify-center border transition-all"
                style={{
                  background: isAlreadyBackedUp ? 'transparent' : panelText,
                  color: isAlreadyBackedUp ? panelBg : panelBg,
                  borderColor: panelText
                }}
              >
                {isAlreadyBackedUp ? <ShieldCheck size={14} /> : <Download size={14} />}
              </button>
            )}
        </div>
        
        <div className="flex flex-col">
          {articles.map((article, idx) => {
            const isActive = selectedArticle?.id === article.id;
            return (
              <div
                key={article.id}
                onClick={() => setSelectedArticle(article)}
                className="cursor-pointer p-6 border-b transition-colors relative"
                style={{ 
                  background: isActive ? panelText : panelBg, 
                  color: isActive ? panelBg : panelText,
                  borderColor: panelBorder,
                }}
              >
                <div className="font-mono text-[9px] uppercase tracking-[0.2em] font-bold mb-3 flex items-center gap-2">
                  <div className="w-2 h-2" style={{ background: isActive ? panelBg : panelText }}/>
                  {new Date(article.date).toLocaleDateString('es-ES', { month: 'short', day: '2-digit' })} — {new Date(article.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <h3 className="font-sans text-xl font-black leading-none tracking-tight">
                  {article.title}
                </h3>
              </div>
            );
          })}
          {articles.length === 0 && <div className="p-6 font-mono text-xs font-bold uppercase">Zero intel fetched.</div>}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────── 
          RIGHT PANEL: Máxima Extensión (Master-Detail) (70%)
          ───────────────────────────────────────────────────────── */}
      <div className="w-full lg:w-[70%] h-full relative" style={{ background: panelBg, color: panelText }}>
        <AnimatePresence mode="popLayout">
          {selectedArticle && (
            <motion.div
              key={selectedArticle.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0 }} // Flat cuts, no cheesy animations. Institutional feel.
              className="w-full h-full p-8 md:p-20 overflow-y-auto"
            >
              {/* CONTROLES SUPERIORES */}
              <div className="flex justify-between items-center mb-16 border-b pb-4" style={{ borderColor: panelBorder }}>
                <span className="font-mono text-[10px] uppercase font-bold tracking-[0.4em]">
                   T. {new Date(selectedArticle.date).toLocaleString('es-ES')}
                </span>
                
                <div className="flex items-center gap-2">
                  {/* TEXT RESIZER */}
                  <div className="flex border items-center" style={{ borderColor: panelBorder }}>
                     <button onClick={() => setFontSizeRatio(r => Math.max(0.8, r - 0.1))} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"><Type size={12} /></button>
                     <button onClick={() => setFontSizeRatio(1)} className="p-2 font-mono text-[10px] font-bold tracking-widest border-x hover:bg-black/5 dark:hover:bg-white/10" style={{ borderColor: panelBorder }}>RESET</button>
                     <button onClick={() => setFontSizeRatio(r => Math.min(1.5, r + 0.1))} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"><Type size={16} /></button>
                  </div>
                  {/* GMAIL SHARE BUTTON (Premium) */}
                  {isNewsSubscribed && (
                    <button onClick={() => setShareModalOpen(true)} className="p-2 border hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center" style={{ borderColor: panelBorder }}>
                      <Mail size={16} />
                    </button>
                  )}
                  {/* DARK MODE TOGGLE */}
                  <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 border hover:bg-black/5 dark:hover:bg-white/10 transition-colors" style={{ borderColor: panelBorder }}>
                    {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                  </button>
                </div>
              </div>

              {/* TÍTULO */}
              <h1 className="font-sans font-black tracking-tighter leading-[0.9] mb-16" style={{ fontSize: `${4 * fontSizeRatio}rem`, textWrap: 'balance' }}>
                {selectedArticle.title}
              </h1>

              {/* CONTENIDO EXPLOTADO (TEXTO FINANCIERO) */}
              <div 
                className="font-serif leading-relaxed space-y-8 select-text w-full max-w-4xl"
                style={{ fontSize: `${1.2 * fontSizeRatio}rem` }}
              >
                {(selectedArticle.description || "Reporte en tránsito. Procesando oráculo criptográfico...").split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>

              {/* POLÍTICA DE PRIVACIDAD / DISCLAIMER OFICIAL */}
              <div className="mt-32 pt-10 border-t flex flex-col gap-6 w-full max-w-4xl" style={{ borderColor: panelBorder }}>
                  <div className="flex justify-between items-center w-full font-mono text-[9px] uppercase font-black tracking-[0.3em]">
                     <span>WHALE ALERT NETWORK — CONFIDENTIAL REPORT</span>
                     <span>DOCUMENTO SOBERANO</span>
                  </div>
                  <div className="font-sans text-[10px] leading-relaxed uppercase" style={{ color: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.5)' }}>
                    <b>PRIVACY POLICY & DISCLOSURES:</b> TRADING EN MERCADOS DE CRIPTOMONEDAS IMPLICA RIESGOS TOTALES. LA RED NO SE HACE RESPONSABLE POR PÉRDIDAS ASIMÉTRICAS DE CAPITAL BASADAS EN ESTOS REGISTROS FORENSES. ESTE PANEL PROVEE LA METRÍZ DE INTELIGENCIA PURA, SIN EMBARGO "NO RELIANCE / EDUCATIONAL PURPOSES ONLY" DEBE SER ASUMIDO. DATOS PRESERVADOS SIN COMPROMISO PII (ZERO PROTOCOL).
                  </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ───────────────────────────────────────────────────────── 
            CORTINILLA DE PAGO SOBRE PANEL DERECHO
            ───────────────────────────────────────────────────────── */}
        {!isNewsSubscribed && selectedArticle && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-end p-10 pb-20 pointer-events-none" style={{ background: isDarkMode ? 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.95) 60%, rgba(0,0,0,1) 100%)' : 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.95) 60%, rgba(255,255,255,1) 100%)' }}>
            <div className="pointer-events-auto w-full max-w-lg border p-12 flex flex-col items-center text-center shadow-2xl relative overflow-hidden" style={{ background: panelBg, borderColor: panelText }}>
              <div className="absolute top-0 left-0 w-full h-2" style={{ background: panelText }}></div>
              <ShieldCheck size={40} className="mb-6" style={{ color: panelText }}/>
              <h2 className="font-sans text-4xl font-black mb-4 uppercase tracking-tighter" style={{ color: panelText }}>Bloqueo Institucional</h2>
              <p className="font-mono text-[10px] uppercase font-bold tracking-[0.2em] mb-10 leading-relaxed" style={{ color: panelText, opacity: 0.7 }}>
                Para acceder a la red neuronal completa y visualizar eternamente las diseciones algorítmicas, formalice su nodo.
              </p>
              <button
                onClick={() => setCheckoutOpen(true)}
                className="w-full py-5 text-sm font-mono font-black uppercase tracking-[0.3em] transition-all"
                style={{ background: panelText, color: panelBg }}
              >
                AUTORIZAR PAGO ON-CHAIN
              </button>
            </div>
          </div>
        )}
      </div>

      <CryptoCheckoutModal isOpen={isCheckoutOpen} onClose={() => setCheckoutOpen(false)} />

      {/* ───────────────────────────────────────────────────────── 
          GMAIL-LIKE SHARE MODAL
          ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {shareModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.8)' }}
          >
            <motion.div 
              initial={{ scale: 0.98, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.98, y: 10 }}
              className="w-full max-w-md border shadow-2xl relative"
              style={{ background: panelBg, borderColor: panelText, color: panelText }}
            >
              <div className="flex justify-between items-center bg-inherit border-b p-6" style={{ borderColor: panelBorder }}>
                <div className="flex items-center gap-3">
                  <Mail size={20} />
                  <h3 className="font-sans text-xl font-black uppercase tracking-tighter mt-1">Satelital Share</h3>
                </div>
                <button onClick={() => setShareModalOpen(false)} className="opacity-50 hover:opacity-100">
                  <X size={20} />
                </button>
              </div>

              {shareSuccess ? (
                <div className="text-center py-20 font-mono text-sm uppercase font-black tracking-[0.3em]">
                  Transmisión <br/> Inmaculada ✓
                </div>
              ) : (
                <form onSubmit={handleShareSubmit} className="p-8 space-y-8">
                  <div>
                    <label className="block font-mono text-[9px] uppercase tracking-[0.2em] font-bold mb-3">Destinatario Soberano (Email)</label>
                    <input type="email" required value={shareEmail} onChange={e => setShareEmail(e.target.value)}
                      className="w-full bg-transparent border-b outline-none py-2 font-mono"
                      style={{ borderColor: panelBorder, borderBottomWidth: '2px' }}
                      placeholder="ejemplo@corporation.com"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[9px] uppercase tracking-[0.2em] font-bold mb-3">Petición Abierta (Nota Opcional)</label>
                    <textarea value={shareNote} onChange={e => setShareNote(e.target.value)} rows={3}
                      className="w-full bg-transparent border outline-none font-serif p-3"
                      style={{ borderColor: panelBorder }}
                      placeholder="Identificando turbulencias..."
                    />
                  </div>
                  <button type="submit" disabled={isSharing} className="w-full font-mono text-[10px] uppercase font-black py-5 tracking-[0.3em] transition-all"
                    style={{ background: panelText, color: panelBg }}>
                    {isSharing ? 'DIFUNDIENDO...' : 'TRANSMITIR ACCESO (1-Time)'}
                  </button>
                  <p className="text-center font-mono text-[8px] uppercase tracking-[0.2em] opacity-40">
                    *El destinatario purgará la visualización al recargar la comunicación.
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
