"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, AlertTriangle, ShieldCheck } from 'lucide-react';
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
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch('/api/news', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setArticles(data.articles || []);
        } else {
          console.error("Forensic Core Fallback...");
          setArticles([]);
        }
      } catch (e) {
        console.error("Network termal threshold reached:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, []);

  // Guardado local a D:\WhaleNewsArchive mediante ShowSaveFilePicker
  const handleSaveToDrive = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const fileName = `${today}.json`;
      
      const fileData = JSON.stringify({
        date: new Date().toISOString(),
        metadata: 'WHALE_ALERT_NETWORK_ARCHIVE',
        compliance: 'NO RELIANCE / EDUCATIONAL PURPOSES ONLY',
        content: articles
      }, null, 2);

      // Verificamos si File System Access API está disponible
      if ('showSaveFilePicker' in window) {
        // @ts-ignore - TS a veces no tiene definidos los tipos de File System Access API
        const handle = await window.showSaveFilePicker({
          suggestedName: fileName,
          types: [{
            description: 'Archivo JSON Diario',
            accept: { 'application/json': ['.json'] },
          }],
        });
        
        // @ts-ignore
        const writable = await handle.createWritable();
        await writable.write(fileData);
        await writable.close();
      } else {
        // Fallback genérico si el navegador (Safari iOS p.ej) no soporta la API nativa
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
      if (err.name !== 'AbortError') {
        console.error("Fallo de infraestructura en FileSystem API", err);
      }
    }
  };

  const visibleArticles = isNewsSubscribed ? articles : articles.slice(0, 3);
  const todayDateString = new Date().toISOString().split('T')[0];
  const isAlreadyBackedUp = lastBackupDate === todayDateString;

  if (loading) {
    return (
      <div className="w-full flex justify-center py-20 opacity-40">
        <span className="font-mono text-xs uppercase tracking-[0.3em] flex items-center gap-2">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="w-3 h-3 border border-black border-t-transparent rounded-full" />
          Inicializando Terminal Forense...
        </span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-12">
      {/* HEADER SOSTENIDO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b pb-6" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
        <div>
          <h1 className="font-aztec-serif text-4xl md:text-5xl font-black text-black uppercase tracking-tighter leading-none mb-2">
            Noticias Recientes
          </h1>
          <p className="font-mono text-xs uppercase tracking-[0.2em] font-bold" style={{ color: 'rgba(0,0,0,0.5)' }}>
            Termodinámica de Información y Análisis del Mercado
          </p>
        </div>
        
        {isNewsSubscribed && (
          <button
            onClick={handleSaveToDrive}
            disabled={isAlreadyBackedUp}
            className="flex items-center gap-2 px-5 py-3 rounded-lg border font-mono text-[10px] uppercase font-black tracking-widest transition-all"
            style={{
              background: isAlreadyBackedUp ? 'transparent' : '#000',
              color: isAlreadyBackedUp ? 'rgba(0,0,0,0.4)' : '#F7F2EA',
              borderColor: isAlreadyBackedUp ? 'rgba(0,0,0,0.1)' : '#000'
            }}
          >
            {isAlreadyBackedUp ? <ShieldCheck size={14} /> : <Download size={14} />}
            {isAlreadyBackedUp ? 'Archivo Consolidado' : 'Guardar archivo diario en D:'}
          </button>
        )}
      </div>

      {/* FEED DEL TERMINAL */}
      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleArticles.map((article, idx) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex flex-col justify-between p-6 rounded-2xl border bg-[#FDFAF5] transition-all hover:shadow-lg group"
              style={{ borderColor: 'rgba(0,0,0,0.06)' }}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className="font-mono text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded" style={{ background: 'rgba(0,0,0,0.04)', color: 'rgba(0,0,0,0.6)' }}>
                    {new Date(article.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h3 className="font-aztec-serif text-lg font-bold leading-tight line-clamp-3">
                  {article.title}
                </h3>
                <p className="font-mono text-[11px] leading-relaxed opacity-70 line-clamp-4">
                  {article.description || 'Disipación algorítmica sin datos adyacentes.'}
                </p>
              </div>
              
              <div className="pt-6 mt-4 border-t flex justify-between items-center" style={{ borderColor: 'rgba(0,0,0,0.04)' }}>
                <span className="font-mono text-[9px] uppercase tracking-wider opacity-40">
                  Fuente: {article.source}
                </span>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full border flex items-center justify-center transition-all group-hover:bg-black group-hover:border-black group-hover:text-[#F7F2EA]"
                  style={{ borderColor: 'rgba(0,0,0,0.15)', color: 'rgba(0,0,0,0.9)' }}
                >
                  <ArrowDiagonalIcon />
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CORTINILLA Y BLOQUEO PARA NO SUSCRIPTORES */}
        {!isNewsSubscribed && (
          <div className="absolute bottom-0 left-0 w-full h-[400px] flex flex-col items-center justify-end pb-12 z-20"
            style={{ background: 'linear-gradient(180deg, transparent 0%, #F7F2EA 60%, #F7F2EA 100%)' }}>
            <div className="max-w-md w-full px-6 flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full border bg-[#FDFAF5] flex items-center justify-center shadow-md" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
                <AlertTriangle size={18} style={{ color: 'rgba(0,0,0,0.6)' }} />
              </div>
              <h2 className="font-aztec-serif text-2xl font-black">LÍMITE ALCANZADO</h2>
              <p className="font-mono text-xs uppercase tracking-widest leading-relaxed opacity-60">
                La vista previa se ha agotado. Desbloquee el análisis del mercado restante operando de forma soberana.
              </p>
              
              <button
                onClick={() => setCheckoutOpen(true)}
                className="mt-6 w-full py-4 rounded-xl font-mono text-[11px] font-black uppercase tracking-[0.15em] hover:scale-[1.02] transition-all"
                style={{ background: '#000', color: '#F7F2EA', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}
              >
                Suscribirte a Whale News por 1,99 USD/mes
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER INMUTABLE DE COMPLIANCE */}
      <div className="pt-20 pb-10 w-full flex justify-center">
        <h1 className="font-mono text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-[0.2em] text-center opacity-90 border-t-4 pt-8 w-full max-w-4xl" style={{ borderTopColor: 'rgba(0,0,0,0.8)', color: '#000' }}>
          NO RELIANCE / EDUCATIONAL PURPOSES ONLY
        </h1>
      </div>

      <CryptoCheckoutModal isOpen={isCheckoutOpen} onClose={() => setCheckoutOpen(false)} />
    </div>
  );
}

// Icono utilitario interno
function ArrowDiagonalIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path opacity="0.8" d="M1 9L9 1M9 1H2.5M9 1V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
