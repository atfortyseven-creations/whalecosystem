"use client";

import React, { useState, useEffect } from 'react';
import { BookOpen, ChevronRight, Terminal, Shield, Network, ChevronLeft, FastForward, Rewind, Search } from 'lucide-react';
import Image from 'next/image';

const parseAztecMD = (str: string) => {
    if (!str) return '';
    let html = str
        .replace(/^### (.*$)/gim, '<h3 class="font-aztec-h1 text-xl text-[var(--aztec-orchid)] mt-8 mb-3 uppercase tracking-widest">$1</h3>')
        .replace(/^## (.*$)/gim, '<h2 class="font-aztec-h1 text-2xl text-[var(--aztec-parchment)] uppercase mt-12 mb-4 tracking-light">$1</h2>')
        .replace(/^# (.*$)/gim, '<h1 class="font-aztec-h1 text-4xl lg:text-5xl font-black text-[var(--aztec-chartreuse)] uppercase mb-8 tracking-tighter leading-[0.9] border-b border-[var(--aztec-chartreuse)]/20 pb-4">$1</h1>')
        .replace(/^\* (.*$)/gim, '<li class="ml-6 mb-2 list-square marker:text-[var(--aztec-orchid)]">$1</li>')
        .replace(/^- (.*$)/gim, '<li class="ml-6 mb-2 list-diamond marker:text-[var(--aztec-chartreuse)]">$1</li>')
        .replace(/\*\*(.*?)\*\*/gim, '<strong class="text-white font-black">$1</strong>')
        .replace(/\*(.*?)\*/gim, '<em class="text-[var(--aztec-orchid)] italic">$1</em>')
        .replace(/```typescript\n([\s\S]*?)```/gim, '<pre class="bg-[#050505] p-6 border border-[var(--aztec-parchment)]/10 text-[11px] overflow-x-auto my-6 text-[var(--aztec-parchment)]/80 custom-scrollbar shadow-2xl">$1</pre>')
        .replace(/`(.*?)`/gim, '<code class="bg-black border border-[var(--aztec-parchment)]/10 px-1.5 py-0.5 text-[var(--aztec-chartreuse)] text-[10px] font-mono">$1</code>')
        .replace(/\n\n/gim, '<br/><br/>');
    return html;
};

export default function DocsPage() {
    const [pages, setPages] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [jumpInput, setJumpInput] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('/docs-400.json')
            .then(res => res.json())
            .then(data => {
                setPages(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Failed to load generic docs", err);
                setIsLoading(false);
            });
    }, []);

    const handleJump = (e: React.FormEvent) => {
        e.preventDefault();
        const num = parseInt(jumpInput, 10);
        if (!isNaN(num) && num >= 0 && num <= 400 && pages[num]) {
            setCurrentPage(num);
            setJumpInput('');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const goToPage = (num: number) => {
        if (num >= 0 && num < pages.length) {
            setCurrentPage(num);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[var(--aztec-ink)] flex items-center justify-center font-aztec-mono text-[var(--aztec-chartreuse)] uppercase tracking-widest text-xs">
                Iniciando Protocolo de Documentación [400 Pages]...
            </div>
        );
    }

    if (pages.length === 0) {
        return (
            <div className="min-h-screen bg-[var(--aztec-ink)] flex items-center justify-center font-aztec-mono text-rose-500 uppercase tracking-widest text-xs">
                Error Crítico: Falla al cargar la matriz de datos.
            </div>
        );
    }

    const currentDoc = pages[currentPage];

    // Build standard indices for the sidebar based on blocks
    const indices = [
        { label: "Génesis e Índice", target: 0, icon: <BookOpen size={12} className="text-[var(--aztec-orchid)]" /> },
        { label: "Filosofía Arquitectónica", target: 1, icon: <Shield size={12} className="text-[var(--aztec-chartreuse)]" /> },
        { label: "Análisis del Sistema N1", target: 11, icon: <Terminal size={12} className="text-[var(--aztec-parchment)]" /> },
        { label: "Análisis del Sistema N2", target: 100, icon: <Terminal size={12} className="text-[var(--aztec-parchment)]" /> },
        { label: "Análisis del Sistema N3", target: 200, icon: <Terminal size={12} className="text-[var(--aztec-parchment)]" /> },
        { label: "Análisis del Sistema N4", target: 300, icon: <Terminal size={12} className="text-[var(--aztec-parchment)]" /> },
        { label: "Motor HFT", target: 381, icon: <Network size={12} className="text-[var(--aztec-orchid)]" /> },
        { label: "Conclusión Inmortal", target: 391, icon: <BookOpen size={12} className="text-[var(--aztec-chartreuse)]" /> }
    ];

    return (
        <div className="min-h-screen bg-[var(--aztec-ink)] text-[var(--aztec-parchment)] font-sans relative overflow-hidden">
            <div className="absolute inset-0 z-0">
                <Image 
                    src="/models/update/simon-lee-hbFd11O0nwc-unsplash.jpg" 
                    alt="Sovereign Architecture" 
                    fill 
                    className="object-cover opacity-[0.10] mix-blend-screen grayscale" 
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[var(--aztec-ink)]/90 via-transparent to-[var(--aztec-ink)] pointer-events-none" />
            </div>

            <div className="max-w-[1400px] mx-auto grid lg:grid-cols-[280px,1fr] xl:grid-cols-[320px,1fr] gap-8 lg:gap-16 pt-32 lg:pt-40 pb-20 lg:pb-32 px-4 md:px-6 lg:px-12 relative z-10">
                
                {/* Aztec Restructured Sidebar */}
                <aside className="hidden lg:block h-fit sticky top-40 text-[var(--aztec-parchment)]">
                    <div className="bg-[var(--aztec-parchment)]/5 backdrop-blur-xl border border-[var(--aztec-parchment)]/10 shadow-2xl p-6 relative flex flex-col gap-8">
                        {/* Decorative Corners */}
                        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[var(--aztec-chartreuse)] opacity-60" />
                        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[var(--aztec-chartreuse)] opacity-60" />

                        <div className="font-aztec-mono text-[9px] uppercase tracking-[0.4em] text-[var(--aztec-parchment)]/40 border-b border-[var(--aztec-parchment)]/10 pb-4 flex items-center gap-2">
                            <BookOpen size={14} className="text-[var(--aztec-orchid)]" /> MAINFRAME DOCS [400 PG]
                        </div>

                        <div className="space-y-6">
                            <h3 className="font-aztec-h2 text-[10px] font-black text-[var(--aztec-parchment)] uppercase tracking-widest leading-loose">Paginación Rápida</h3>
                            <nav className="flex flex-col gap-2 font-aztec-mono text-[10px] uppercase tracking-wider">
                                {indices.map((idx, i) => {
                                    const isCurrent = currentPage >= idx.target;
                                    const isBeforeNext = i === indices.length - 1 || currentPage < indices[i+1].target;
                                    const isActive = isCurrent && isBeforeNext;
                                    return (
                                        <button 
                                            key={i} 
                                            onClick={() => goToPage(idx.target)}
                                            className={`flex items-center gap-3 p-2 border transition-all ${isActive ? 'bg-[var(--aztec-chartreuse)]/10 border-[var(--aztec-chartreuse)]/30 text-[var(--aztec-chartreuse)]' : 'border-transparent text-[var(--aztec-parchment)]/40 hover:text-[var(--aztec-parchment)] hover:border-[var(--aztec-parchment)]/10'}`}
                                        >
                                            {idx.icon}
                                            {idx.label}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Pagination Jump Tool */}
                        <div className="pt-6 border-t border-[var(--aztec-parchment)]/10">
                            <form onSubmit={handleJump} className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--aztec-parchment)]/30" size={14} />
                                <input 
                                    type="number" 
                                    min="0" 
                                    max="400" 
                                    placeholder="Ir a Pág (0-400)..." 
                                    value={jumpInput}
                                    onChange={e => setJumpInput(e.target.value)}
                                    className="w-full bg-black border border-[var(--aztec-parchment)]/20 py-2.5 pl-9 pr-3 text-[10px] font-aztec-mono uppercase tracking-widest text-[var(--aztec-parchment)] focus:outline-none focus:border-[var(--aztec-chartreuse)]/50 transition-colors placeholder:text-[var(--aztec-parchment)]/30"
                                />
                            </form>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex flex-col min-h-[70vh]">
                    
                    {/* Header Paginador / Categoría */}
                    <div className="flex items-center justify-between mb-8 border-b border-[var(--aztec-parchment)]/10 pb-6 flex-wrap gap-4">
                        <div className="font-aztec-mono text-[10px] text-[var(--aztec-chartreuse)] uppercase tracking-[0.5em] flex items-center gap-4">
                            <div className="w-8 h-[1px] bg-[var(--aztec-chartreuse)]/40" />
                            {currentDoc.category} // EXTRACCIÓN GLOBAL
                        </div>
                        <div className="font-aztec-mono text-[10px] uppercase tracking-widest text-[var(--aztec-parchment)]/40 bg-black/40 border border-white/5 px-4 py-2">
                            PÁGINA <span className="text-white font-black">{currentDoc.id}</span> DE 400
                        </div>
                    </div>

                    {/* Contenido Renderizado */}
                    <article 
                        className="flex-1 font-aztec-body text-lg lg:text-xl text-[var(--aztec-parchment)]/70 leading-relaxed break-words"
                        dangerouslySetInnerHTML={{ __html: parseAztecMD(currentDoc.content) }}
                    />

                    {/* Footer Nav Controls */}
                    <div className="mt-20 pt-8 border-t border-[var(--aztec-parchment)]/10 flex items-center justify-between">
                        <button 
                            onClick={() => goToPage(0)}
                            disabled={currentPage === 0}
                            className="p-3 border border-[var(--aztec-parchment)]/10 text-[var(--aztec-parchment)]/50 hover:bg-[var(--aztec-parchment)]/5 hover:text-white disabled:opacity-20 transition-all hidden md:block"
                        >
                            <Rewind size={16} />
                        </button>

                        <div className="flex items-center gap-4 flex-1 md:flex-none justify-center">
                            <button 
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 0}
                                className="px-6 py-3 bg-[var(--aztec-ink)] border border-[var(--aztec-parchment)]/20 text-[10px] font-aztec-mono font-black uppercase tracking-widest text-[var(--aztec-parchment)] hover:border-[var(--aztec-chartreuse)]/50 hover:text-[var(--aztec-chartreuse)] disabled:opacity-30 transition-all flex items-center gap-3"
                            >
                                <ChevronLeft size={16} /> Anterior
                            </button>
                            
                            <span className="font-aztec-mono text-[10px] font-black uppercase text-[var(--aztec-parchment)]/30 hidden sm:block">
                                [{currentPage} / 400]
                            </span>

                            <button 
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === 400}
                                className="px-6 py-3 bg-[var(--aztec-chartreuse)] text-[var(--aztec-ink)] text-[10px] font-aztec-mono font-black uppercase tracking-widest hover:bg-white disabled:opacity-30 disabled:bg-[var(--aztec-parchment)]/10 transition-all flex items-center gap-3 shadow-[0_0_20px_rgba(182,234,38,0.2)]"
                            >
                                Siguiente <ChevronRight size={16} />
                            </button>
                        </div>

                        <button 
                            onClick={() => goToPage(400)}
                            disabled={currentPage === 400}
                            className="p-3 border border-[var(--aztec-parchment)]/10 text-[var(--aztec-parchment)]/50 hover:bg-[var(--aztec-parchment)]/5 hover:text-white disabled:opacity-20 transition-all hidden md:block"
                        >
                            <FastForward size={16} />
                        </button>
                    </div>

                </main>
            </div>
            
             <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(182,234,38,0.5); }
                .list-square { list-style-type: square; }
                .list-diamond { list-style-type: disc; } /* standard fallback */
            `}</style>
        </div>
    );
}
