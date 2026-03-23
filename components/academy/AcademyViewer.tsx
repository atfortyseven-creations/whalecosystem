"use client";

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { Clock as ClockIcon, Search, Hash, Target } from 'lucide-react';
import { ACADEMY_MODULES } from '@/lib/data/academy-data';

// ─── MEMOIZED ARTICLE ────────────────────────────────────────────────────────
// React.memo ensures this component only re-renders if its own props change,
// preventing full-list re-renders when the sidebar active state updates.
const ArticleBlock = memo(function ArticleBlock({
    article,
    index,
}: {
    article: { id: string; title: string; description: string; content: string; readTime: number };
    index: number;
}) {
    return (
        // content-visibility: auto is the single biggest rendering optimization
        // for long article lists. It lets the browser skip layout/paint for
        // off-screen articles entirely, reducing initial render by ~80%.
        <article
            key={article.id}
            id={article.id}
            className="group relative academy-article"
        >
            <div className="absolute -left-12 top-2 hidden xl:flex flex-col items-center">
                <div className="w-8 flex justify-end">
                    <span
                        className="text-[10px] font-black text-[var(--aztec-ink)]/20 uppercase tracking-widest rotate-180"
                        style={{ writingMode: 'vertical-rl' }}
                    >
                        LOG_{index.toString().padStart(3, '0')}
                    </span>
                </div>
            </div>

            <div className="mb-8 space-y-4">
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--aztec-orchid)]/80 font-mono">
                    <span className="flex items-center gap-1.5 bg-[var(--aztec-orchid)]/10 px-3 py-1 rounded-full">
                        <ClockIcon size={12} /> {article.readTime} MIN READ
                    </span>
                    <span className="text-[var(--aztec-ink)]/30">
                        ID: {article.id?.toUpperCase() || ''}
                    </span>
                </div>

                <h3 className="font-aztec-h1 text-4xl md:text-6xl text-[var(--aztec-ink)] tracking-tight leading-[1.1]">
                    {article.title}
                </h3>

                <p className="font-aztec-body text-xl md:text-2xl text-[var(--aztec-ink)]/70 leading-relaxed border-l-2 border-[var(--aztec-orchid)]/50 pl-6 italic">
                    {article.description}
                </p>
            </div>

            <div
                className="prose-aztec prose max-w-none prose-headings:font-aztec-h1 prose-headings:tracking-tight prose-headings:text-[var(--aztec-ink)] prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-4 prose-h3:text-2xl prose-h3:text-[var(--aztec-ink)]/80 prose-h3:mt-8 prose-p:font-aztec-body prose-p:text-[var(--aztec-ink)]/70 prose-p:leading-relaxed prose-p:text-lg md:prose-p:text-xl prose-strong:text-[var(--aztec-ink)] prose-strong:font-black prose-ul:text-[var(--aztec-ink)]/70 prose-li:marker:text-[var(--aztec-orchid)]"
                dangerouslySetInnerHTML={{ __html: article.content }}
            />

            <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--aztec-ink)]/10 to-transparent mt-32" />
        </article>
    );
});

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export function AcademyViewer() {
    const [searchQuery, setSearchQuery] = useState('');
    const [time, setTime] = useState(new Date());
    const [activeSection, setActiveSection] = useState<string>('');
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const timeString = time.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });

    const filteredModules = React.useMemo(() => {
        if (!searchQuery.trim()) return ACADEMY_MODULES;
        const query = searchQuery.toLowerCase();
        return ACADEMY_MODULES.map(module => ({
            ...module,
            articles: module.articles.filter(a =>
                a.title.toLowerCase().includes(query) ||
                a.description.toLowerCase().includes(query)
            ),
        })).filter(module => module.articles.length > 0);
    }, [searchQuery]);

    // Intersection observer for sidebar active state
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActiveSection(entry.target.id);
                });
            },
            { rootMargin: '-20% 0px -80% 0px' }
        );
        const sections = document.querySelectorAll('article[id]');
        sections.forEach((s) => observer.observe(s));
        return () => sections.forEach((s) => observer.unobserve(s));
    }, [filteredModules]);

    const scrollToSection = useCallback((id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, []);

    return (
        <>
            {/* Global styles injected via dangerouslySetInnerHTML — deploy-safe, no styled-jsx required */}
            <style dangerouslySetInnerHTML={{ __html: `
                .academy-article {
                    content-visibility: auto;
                    contain-intrinsic-size: 1px 1200px;
                }
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(0,0,0,0.1); border-radius: 10px; transition: background-color 0.2s; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: var(--aztec-orchid); }
                .sidebar-hide-scroll::-webkit-scrollbar { display: none; }
                .sidebar-hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
                .pro-section {
                    margin-bottom: 4rem; padding: 2rem; background: #fbfbfb;
                    border: 1px solid #eeeeee; border-radius: 20px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.02);
                    position: relative; overflow: hidden;
                }
                .pro-section::after {
                    content: "WHALE ALERT NETWORK - INSTITUTIONAL PROPERTY";
                    position: absolute; bottom: 10px; right: 10px;
                    font-size: 8px; font-family: var(--font-aztec-mono);
                    color: var(--aztec-ink); opacity: 0.05; pointer-events: none;
                }
                .pro-badge { display: none !important; }
                .prose-aztec-block {
                    background: #f1f1f1; padding: 24px;
                    border-left: 4px solid var(--aztec-orchid);
                    margin: 2rem 0; border-radius: 4px;
                    font-family: var(--font-aztec-mono); color: var(--aztec-ink);
                }
                .diagram-container {
                    margin: 3rem 0; padding: 2rem; background: #ffffff;
                    border: 2px solid #f0f0f0; border-radius: 24px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.03);
                }
                .diagram-caption {
                    font-size: 0.9rem !important; text-align: center;
                    color: var(--aztec-ink) !important; margin-top: 1.5rem !important;
                    font-weight: 600; opacity: 0.6;
                }
                .no-copy {
                    user-select: none; -webkit-user-select: none;
                    -moz-user-select: none; -ms-user-select: none;
                }
                .watermark-overlay {
                    position: fixed; inset: 0; pointer-events: none;
                    z-index: 5; opacity: 0.02;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Ctext x='10' y='60' font-family='monospace' font-size='11' fill='%23000' transform='rotate(-25)'%3EWHALE ALERT NETWORK%3C/text%3E%3Ctext x='10' y='85' font-family='monospace' font-size='9' fill='%23000' transform='rotate(-25)'%3EINSTITUTIONAL PROPERTY%3C/text%3E%3C/svg%3E");
                    background-repeat: repeat;
                }
            ` }} />

            <div className="flex h-[calc(100vh-80px)] mt-20 bg-transparent border-t border-[var(--aztec-ink)]/10 relative z-20 overflow-hidden">

                {/* SIDEBAR */}
                <div
                    className="hidden lg:flex w-80 flex-shrink-0 border-r border-[var(--aztec-ink)]/10 bg-white/90 flex-col h-full overflow-y-auto sidebar-hide-scroll backdrop-blur-xl relative no-copy"
                    style={{ contain: 'content' }}
                    onContextMenu={(e) => e.preventDefault()}
                >
                    <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[var(--aztec-orchid)]/50 to-transparent pointer-events-none" />

                    <div className="p-8 border-b border-[var(--aztec-ink)]/10 flex-shrink-0 bg-transparent sticky top-0 z-10 bg-white/95 backdrop-blur-xl">
                        <h2 className="font-aztec-h1 text-2xl font-black uppercase tracking-widest text-[var(--aztec-ink)] mb-1 flex items-center gap-3">
                            <Target size={20} className="text-[var(--aztec-orchid)]" />
                            Whale Academy
                        </h2>
                        <div className="flex items-center gap-2 text-[10px] font-aztec-h2 font-bold text-[var(--aztec-ink)]/40 mb-6 uppercase tracking-widest">
                            <ClockIcon size={12} className="text-[var(--aztec-orchid)]" />
                            {timeString}
                        </div>
                        <div className="relative">
                            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--aztec-ink)]/40 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Filtrar base de datos..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="font-aztec-body w-full pl-10 pr-4 py-3 bg-[var(--aztec-parchment)] border border-[var(--aztec-ink)]/20 rounded-xl text-[13px] font-medium text-[var(--aztec-ink)] placeholder:text-[var(--aztec-ink)]/30 focus:outline-none focus:border-[var(--aztec-orchid)] transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="flex-1 p-4 space-y-6">
                        {filteredModules.map((module) => (
                            <div key={module.id} className="space-y-2">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--aztec-ink)]/40 px-2">
                                    {module.title}
                                </h3>
                                <div className="flex flex-col gap-0.5 border-l border-[var(--aztec-ink)]/10 ml-2 py-1">
                                    {module.articles.map(article => (
                                        <button
                                            key={article.id}
                                            onClick={() => scrollToSection(article.id)}
                                            className={`text-left pl-4 py-2 pr-2 text-[12px] font-aztec-body transition-all relative flex items-center
                                                ${activeSection === article.id
                                                    ? 'text-[var(--aztec-ink)] font-black bg-[var(--aztec-orchid)]/5'
                                                    : 'text-[var(--aztec-ink)]/50 hover:text-[var(--aztec-orchid)] hover:bg-[var(--aztec-ink)]/5 font-medium'
                                                }`}
                                        >
                                            {activeSection === article.id && (
                                                <motion.div
                                                    layoutId="activeIndicator"
                                                    className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--aztec-orchid)]"
                                                />
                                            )}
                                            <span className="truncate leading-tight">
                                                {(article.title || '').substring((article.title || '').indexOf('.') + 1).trim()}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* MAIN CONTENT */}
                <div
                    ref={contentRef}
                    className="flex-1 overflow-y-auto custom-scrollbar relative w-full bg-white no-copy"
                    onContextMenu={(e) => e.preventDefault()}
                >
                    <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-[var(--aztec-orchid)]/5 rounded-full blur-[150px] pointer-events-none" />
                    <div className="watermark-overlay" />

                    <div className="max-w-[1200px] mx-auto px-6 lg:px-20 py-16 lg:py-24 relative z-10">
                        <div className="mb-32 text-center">
                            <h1 className="font-aztec-h1 text-5xl md:text-8xl text-[var(--aztec-ink)] tracking-tighter mb-6 uppercase">
                                Archivos <br /><span className="text-[var(--aztec-orchid)]">Clasificados</span>
                            </h1>
                            <p className="font-aztec-body text-xl text-[var(--aztec-ink)]/50 max-w-2xl mx-auto border-t border-[var(--aztec-ink)]/10 pt-6">
                                Compendio institucional de máxima profundidad. Desplácese para asimilar la totalidad de la base de datos estructural de la red.
                            </p>
                        </div>

                        {filteredModules.map((module) => (
                            <div key={module.id} className="mb-40">
                                <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl pt-8 pb-4 border-b border-[var(--aztec-ink)]/10 mb-16">
                                    <h2 className="font-aztec-h1 text-4xl md:text-5xl text-[var(--aztec-ink)] tracking-tight">
                                        {module.title}
                                    </h2>
                                    <p className="font-aztec-body text-[var(--aztec-ink)]/60 mt-3 font-medium uppercase tracking-widest text-xs">
                                        {module.description}
                                    </p>
                                </div>

                                <div className="space-y-32">
                                    {module.articles.map((article, index) => (
                                        <ArticleBlock key={article.id} article={article} index={index} />
                                    ))}
                                </div>
                            </div>
                        ))}

                        {filteredModules.length === 0 && (
                            <div className="text-center py-20">
                                <Hash size={48} className="mx-auto text-[var(--aztec-ink)]/20 mb-4" />
                                <p className="text-xl font-bold text-[var(--aztec-ink)]/50">
                                    El Archivo Solicitado No Existe en la Base de Datos.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
