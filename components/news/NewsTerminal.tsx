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
  
  // Settings State
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontSizeRatio, setFontSizeRatio] = useState<number>(1); // Multiplicator
  
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
            // Ya la leyó y acaba de recargar -> MUERTE POR REFRESH
            setIsBlockedByCaducity(true);
            setLoading(false);
            return;
          } else {
            // Es su primera vez, dejamos la marca inquebrantable
            localStorage.setItem(flagKey, 'true');
            // Eliminamos param visual de la URL para no ensuciar
            window.history.replaceState({}, document.title, window.location.pathname);
            // Autoseleccionaríamos la noticia más adelante cuando se carguen
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
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mb-6 shadow-2xl">
          <AlertTriangle className="text-[#F2ECD8]" size={32} />
        </div>
        <h1 className="font-aztec-serif text-5xl font-black uppercase mb-4 text-black tracking-tighter">CADUCIDAD ALCANZADA</h1>
        <p className="font-mono text-xs max-w-lg mb-10 tracking-[0.2em] leading-relaxed opacity-60">
          Usted advirtió una advertencia One-Time Read. La carga residual de este manuscrito ha sido purgada instantáneamente tras refrescar la terminal. Para reconectar el nodo de lectura y obtener acceso vitalicio, active la línea criptográfica institucional.
        </p>
        <button
          onClick={() => setCheckoutOpen(true)}
          className="bg-black text-[#F2ECD8] font-mono text-xs uppercase px-10 py-5 font-black tracking-widest hover:scale-105 transition-all shadow-xl rounded-lg"
        >
          DESBLOQUEAR OMNISCIENCIA (1.99$)
        </button>
        <CryptoCheckoutModal isOpen={isCheckoutOpen} onClose={() => setCheckoutOpen(false)} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full flex justify-center py-40 opacity-40">
        <span className="font-mono text-xs uppercase tracking-[0.3em] flex items-center gap-2">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="w-3 h-3 border border-black border-t-transparent rounded-full" />
          Sincronizando 50 Nodos Forenses...
        </span>
      </div>
    );
  }

  // Estilos termodinámicos
  const panelBg = isDarkMode ? '#11100f' : '#FDFAF5';
  const panelText = isDarkMode ? '#e6dfce' : '#11100f';
  const panelBorder = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';

  return (
    <div className="w-full max-w-[1400px] mx-auto min-h-[80vh] flex flex-col lg:flex-row gap-6">
      
      {/* LEFT PANEL: 50 Noticias de Indexación (35%) */}
      <div className="w-full lg:w-[35%] lg:h-[80vh] overflow-y-auto pr-2 rounded-xl border flex flex-col space-y-4 pt-1" style={{ borderColor: panelBorder }}>
        <h2 className="font-aztec-serif text-2xl font-black uppercase sticky top-0 bg-[#F7F2EA] py-4 z-10 select-none">ÍNDICE FORENSE</h2>
        
        {articles.map((article, idx) => {
          const isActive = selectedArticle?.id === article.id;
          return (
            <div
              key={article.id}
              onClick={() => setSelectedArticle(article)}
              className="cursor-pointer p-5 rounded-lg border transition-all hover:-translate-y-1 relative"
              style={{ 
                background: isActive ? (isDarkMode ? '#222' : '#000') : panelBg, 
                color: isActive ? '#F2ECD8' : panelText,
                borderColor: isActive ? 'transparent' : panelBorder,
                boxShadow: isActive ? '0 10px 20px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              <div className="font-mono text-[9px] uppercase tracking-widest opacity-60 mb-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: isActive ? '#B6EA26' : (isDarkMode ? '#555' : '#ccc') }}/>
                {new Date(article.date).toLocaleDateString('es-ES', { month: 'short', day: '2-digit' })} — {new Date(article.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <h3 className="font-serif text-md md:text-lg font-black leading-snug line-clamp-3">
                {article.title}
              </h3>
            </div>
          );
        })}
        {articles.length === 0 && <div className="p-4 font-mono text-xs opacity-50">Zero intel fetched. Reconectando origen.</div>}
      </div>

      {/* RIGHT PANEL: Máxima Extensión (Master-Detail) (65%) */}
      <div className="w-full lg:w-[65%] lg:h-[80vh] pb-10 perspective-1000 relative">
        <AnimatePresence mode="wait">
          {selectedArticle && (
            <motion.div
              key={selectedArticle.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="w-full h-full p-8 md:p-12 rounded-xl sticky top-0 overflow-y-auto"
              style={{ background: panelBg, color: panelText, borderColor: panelBorder, borderWidth: '1px' }}
            >
              {/* Controles Opcionales Superior */}
              <div className="flex justify-between items-center mb-12">
                <span className="font-mono text-[10px] uppercase font-bold tracking-widest border px-3 py-1 rounded" style={{ borderColor: panelBorder, opacity: 0.7 }}>
                   REGISTRO EXACTO: {new Date(selectedArticle.date).toLocaleString('es-ES')}
                </span>
                
                <div className="flex items-center gap-3">
                  {/* TEXT RESIZER */}
                  <div className="flex bg-black/5 rounded items-center p-1">
                     <button onClick={() => setFontSizeRatio(r => Math.max(0.8, r - 0.1))} className="p-2 opacity-50 hover:opacity-100 transition-opacity"><Type size={12} /></button>
                     <button onClick={() => setFontSizeRatio(1)} className="p-2 opacity-50 hover:opacity-100 font-mono text-[10px] tracking-widest"><Type size={14} /></button>
                     <button onClick={() => setFontSizeRatio(r => Math.min(1.5, r + 0.1))} className="p-2 opacity-50 hover:opacity-100 transition-opacity"><Type size={16} /></button>
                  </div>
                  {/* GMAIL SHARE BUTTON (Premium) */}
                  {isNewsSubscribed && (
                    <button onClick={() => setShareModalOpen(true)} className="p-2 rounded-full border border-black/10 hover:bg-black/5 transition-all flex items-center gap-2 group">
                      <Mail size={16} />
                    </button>
                  )}
                  {/* DARK MODE TOGGLE */}
                  <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full border hover:bg-black/5 transition-all" style={{ borderColor: panelBorder }}>
                    {isDarkMode ? <Sun size={16} color="#e6dfce"/> : <Moon size={16} color="#000" />}
                  </button>
                </div>
              </div>

              {/* Título Principal */}
              <h1 className="font-aztec-serif text-3xl md:text-5xl font-black tracking-tighter leading-[1.1] mb-12" style={{ fontSize: `${2.5 * fontSizeRatio}rem` }}>
                {selectedArticle.title}
              </h1>

              {/* CONTENIDO EXPLICADO A LA PERFECCIÓN */}
              <div 
                className="font-serif leading-relaxed space-y-8 select-auto"
                style={{ fontSize: `${1.125 * fontSizeRatio}rem`, color: isDarkMode ? 'rgba(230, 223, 206, 0.85)' : 'rgba(17, 16, 15, 0.85)' }}
              >
                {/* Dividimos el párrafo por "\n\n" para hacer bloques perfectos */}
                {(selectedArticle.description || "Incapacidad algorítmica de extraer termodinámica.").split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>

              {/* Footer Falso: Eliminamos Fuente como se solicitó */}
              <div className="mt-20 pt-8 border-t flex justify-between" style={{ borderColor: panelBorder }}>
                  <span className="font-mono text-[10px] uppercase font-bold tracking-[0.2em] opacity-40">CLASSIFIED INTEL</span>
                  <span className="font-mono text-[10px] uppercase font-bold tracking-[0.2em] opacity-40">Whale Alert Network</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* COMPLIANCE OVERLAY SI NO SUSCRITO (En Detail Panel) */}
        {!isNewsSubscribed && selectedArticle && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-end p-10 pb-20 pointer-events-none" style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(247,242,234,0.95) 70%, #F7F2EA 100%)' }}>
            <div className="pointer-events-auto max-w-sm w-full bg-[#11100f] text-[#F7F2EA] p-8 rounded-2xl shadow-2xl flex flex-col items-center text-center">
              <ShieldCheck size={32} className="mb-4 text-[#B6EA26]"/>
              <h2 className="font-aztec-serif text-2xl font-black mb-3">ACCESO RETENIDO</h2>
              <p className="font-mono text-xs uppercase tracking-widest opacity-60 mb-6 leading-relaxed">Solo los nodos suscritos acceden al descifrado infinito de 50 canales integrales.</p>
              <button
                onClick={() => setCheckoutOpen(true)}
                className="w-full py-4 text-xs font-mono font-black uppercase tracking-widest bg-[#F7F2EA] text-black hover:bg-[#B6EA26] transition-colors rounded"
              >
                1.99 USD / VITALICIO
              </button>
            </div>
          </div>
        )}
      </div>

      <CryptoCheckoutModal isOpen={isCheckoutOpen} onClose={() => setCheckoutOpen(false)} />

      {/* GMAIL-LIKE SHARE MODAL */}
      <AnimatePresence>
        {shareModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-[#F7F2EA] rounded-xl p-8 shadow-2xl relative"
            >
              <button onClick={() => setShareModalOpen(false)} className="absolute top-6 right-6 opacity-50 hover:opacity-100">
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-8">
                <Mail size={24} />
                <h3 className="font-aztec-serif text-2xl font-black uppercase leading-none mt-1">Satelital Share</h3>
              </div>

              {shareSuccess ? (
                <div className="text-center py-10 font-mono text-sm uppercase font-bold tracking-widest text-green-700">
                  Transmisión inmaculada ✓
                </div>
              ) : (
                <form onSubmit={handleShareSubmit} className="space-y-6">
                  <div>
                    <label className="block font-mono text-[9px] uppercase tracking-widest opacity-60 mb-2">Destinatario Soberano (Email)</label>
                    <input type="email" required value={shareEmail} onChange={e => setShareEmail(e.target.value)}
                      className="w-full bg-transparent border-b-2 border-black/20 focus:border-black outline-none py-2 font-mono"
                      placeholder="ejemplo@corporation.com"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[9px] uppercase tracking-widest opacity-60 mb-2">Nota encriptada (Opcional)</label>
                    <textarea value={shareNote} onChange={e => setShareNote(e.target.value)} rows={3}
                      className="w-full bg-black/5 rounded-lg p-3 outline-none font-serif text-sm border border-transparent focus:border-black/20"
                      placeholder="Observa los últimos nodos descubiertos en esta purga..."
                    />
                  </div>
                  <button type="submit" disabled={isSharing} className="w-full bg-black text-[#F7F2EA] font-mono text-xs uppercase font-black py-4 tracking-[0.2em] rounded-lg">
                    {isSharing ? 'DIFUNDIENDO...' : 'TRANSMITIR ACCESO TEMPORAL (1-Time)'}
                  </button>
                  <p className="text-center font-mono text-[8px] uppercase tracking-widest opacity-40">
                    *El destinatario purgará su visualización inmediatamente después de recargar. Requerirá suscripción para retomar.
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
