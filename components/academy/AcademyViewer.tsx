"use client";

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { Clock as ClockIcon, Search, Hash, Target } from 'lucide-react';
import { ACADEMY_MODULES } from '@/lib/data/academy-data';

// ─── MEMOIZED ARTICLE ────────────────────────────────────────────────────────
const ArticleBlock = memo(function ArticleBlock({
    article,
    index,
}: {
    article: { id: string; title: string; description: string; content: string; readTime: number };
    index: number;
}) {
    return (
        <article
            key={article.id}
            id={article.id}
            className="group relative academy-article border-b border-white/5 pb-24 mb-24 last:border-0"
        >
            <div className="absolute -left-16 top-0 hidden 2xl:flex flex-col items-center">
                <span className="text-[10px] font-black text-white/10 uppercase tracking-[0.5em] rotate-180" style={{ writingMode: 'vertical-rl' }}>
                    MODULE_{index.toString().padStart(3, '0')}
                </span>
            </div>

            <div className="mb-12 space-y-6">
                <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] font-mono">
                    <span className="flex items-center gap-2 bg-white/5 text-white px-4 py-1.5 rounded-full border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                        <ClockIcon size={12} /> {article.readTime} MIN READ
                    </span>
                    <span className="bg-white/5 text-white/30 px-3 py-1.5 rounded-full border border-white/10">
                        DEPTH: SECURE_ALPHA
                    </span>
                    <span className="text-white/20 ml-auto">
                        REF: {article.id?.toUpperCase()}
                    </span>
                </div>

                <h3 className="font-aztec-h1 text-5xl md:text-7xl lg:text-8xl text-white tracking-tighter leading-[0.95] drop-shadow-2xl">
                    {article.title}
                </h3>

                <p className="font-aztec-body text-xl md:text-2xl text-white/60 leading-relaxed max-w-3xl">
                    {article.description}
                </p>
            </div>

            <div
                className="prose-aztec-v3 prose max-w-none prose-invert
                prose-headings:font-aztec-h2 prose-headings:tracking-tighter prose-headings:text-white
                prose-h2:text-4xl prose-h2:mt-20 prose-h2:mb-8 prose-h2:font-black
                prose-p:font-aztec-body prose-p:text-white/70 prose-p:leading-[1.8] prose-p:text-xl md:prose-p:text-2xl
                prose-strong:text-white prose-strong:font-black
                prose-ul:text-white/70 prose-li:marker:text-white/50"
                dangerouslySetInnerHTML={{ __html: article.content }}
            />
        </article>
    );
});

// ─── CORPORATE MINI LOGO ───
function AcademyLogo() {
    return (
        <img src="/logo-landingpage.png" alt="Whale" className="w-8 h-8 object-contain opacity-80 group-hover:opacity-100 transition-opacity" />
    );
}

export function AcademyViewer() {
    const [searchQuery, setSearchQuery] = useState('');
    const [time, setTime] = useState(new Date());
    const [activeSection, setActiveSection] = useState<string>('');
    const [scrollProgress, setScrollProgress] = useState(0);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const scrollEl = document.querySelector('[data-scroll-container]') as HTMLElement | null;
        const handleScroll = () => {
            const element = scrollEl || document.documentElement;
            const totalHeight = element.scrollHeight - element.clientHeight;
            const progress = totalHeight > 0 ? (element.scrollTop / totalHeight) * 100 : 0;
            setScrollProgress(progress);
        };
        const target = scrollEl || window;
        target.addEventListener('scroll', handleScroll);
        return () => target.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

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

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActiveSection(entry.target.id);
                });
            },
            { rootMargin: '-30% 0px -60% 0px' }
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
            <style dangerouslySetInnerHTML={{ __html: `
                .academy-article { content-visibility: auto; contain-intrinsic-size: 1px 1500px; }
                .academy-scroll-container::-webkit-scrollbar { width: 3px; }
                .academy-scroll-container::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
                .academy-scroll-container::-webkit-scrollbar-thumb { 
                    background: linear-gradient(to bottom, transparent, #ffffff, transparent);
                    border-radius: 10px;
                }
                .sidebar-hide-scroll::-webkit-scrollbar { display: none; }
                .sidebar-hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
                .no-copy { user-select: none; -webkit-user-select: none; }
                .glass-sidebar { background: rgba(5,5,5,0.8); backdrop-filter: blur(100px); }
                .prose-aztec-v3 p { margin-bottom: 2rem; }
                .module-category { writing-mode: vertical-rl; text-orientation: mixed; }
            ` }} />

            <div className="flex w-full bg-[#050505] relative z-20 text-white font-aztec-body shadow-2xl" style={{ minHeight: '80vh' }}>
                
                {/* PROGRESS BAR (STRATOSPHERIC PRECISION) */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/5 z-[100]">
                    <motion.div 
                        className="h-full bg-gradient-to-r from-white/20 via-white to-white/20 shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                        style={{ width: `${scrollProgress}%` }}
                    />
                </div>

                {/* SIDEBAR: KNOWLEDGE INDEX */}
                <aside className="hidden lg:flex w-[380px] flex-shrink-0 border-r border-white/5 glass-sidebar flex-col min-h-[80vh] relative no-copy sticky top-0 self-start" style={{ maxHeight: '100vh', overflowY: 'auto' }}>
                    <div className="p-10 border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
                        <div className="flex items-center gap-4 mb-2 group cursor-pointer">
                            <AcademyLogo />
                            <div>
                                <h2 className="font-aztec-h1 text-2xl font-black uppercase tracking-tighter text-white">
                                    Knowledge <span className="text-white/60">Hub</span>
                                </h2>
                                <p className="text-[7px] font-mono text-white/30 uppercase tracking-[0.5em] font-black">Institutional Repository</p>
                            </div>
                        </div>
                        
                        <div className="mt-8 relative">
                            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search archives..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-4 bg-white/[0.03] border border-white/5 rounded-2xl text-[12px] font-medium text-white placeholder:text-white/20 focus:outline-none focus:border-white/50 transition-all focus:bg-white/[0.06] shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto sidebar-hide-scroll p-6 space-y-10">
                        {filteredModules.map((module) => (
                            <div key={module.id} className="relative pl-4">
                                <div className="absolute left-0 top-0 bottom-0 w-px bg-white/10" />
                                <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 mb-4 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
                                    {module.title}
                                </h3>
                                <div className="flex flex-col gap-1">
                                    {module.articles.map(article => (
                                        <button
                                            key={article.id}
                                            onClick={() => scrollToSection(article.id)}
                                            className={`text-left px-4 py-3 text-[13px] transition-all rounded-xl flex items-center justify-between group
                                                ${activeSection === article.id
                                                    ? 'text-white font-black bg-white/[0.05] shadow-lg border border-white/5'
                                                    : 'text-white/40 hover:text-white/70 hover:bg-white/[0.02] font-medium border border-transparent'
                                                }`}
                                        >
                                            <span className="truncate max-w-[240px]">
                                                {article.title}
                                            </span>
                                            {activeSection === article.id && (
                                                <div className="w-1 h-1 rounded-full bg-white" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-8 border-t border-white/5 bg-black/40">
                        <div className="flex items-center justify-between text-[8px] font-mono text-white/20 uppercase tracking-widest font-black">
                            <span>Status: Synchronized</span>
                            <span className="animate-pulse flex items-center gap-1">
                                <div className="w-1 h-1 rounded-full bg-white" /> Secure
                            </span>
                        </div>
                    </div>
                </aside>

                {/* MAIN CONTENT: CLASS-LEVEL EDUCATION */}
                <main
                    ref={contentRef}
                    className="flex-1 bg-transparent relative no-copy overflow-y-auto"
                    onContextMenu={(e) => e.preventDefault()}
                >
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />
                    
                    <div className="max-w-[900px] mx-auto px-8 lg:px-16 py-24 lg:py-40 relative z-10">
                        <header className="mb-48 border-l-4 border-white/30 pl-12">
                            <h1 className="font-aztec-h1 text-6xl md:text-9xl text-white tracking-tighter mb-8 uppercase leading-[0.85]">
                                Strategic <br />
                                <span className="bg-gradient-to-r from-white/70 via-white to-white/70 bg-clip-text text-transparent">Intelligence</span>
                            </h1>
                            <p className="font-aztec-body text-2xl lg:text-3xl text-white/40 max-w-2xl leading-relaxed font-light">
                                60 years of sovereign expertise consolidated into a single cryptographic knowledge architecture.
                            </p>
                        </header>

                        {filteredModules.map((module) => (
                            <section key={module.id} className="mb-64">
                                <div className="flex items-start gap-12 mb-24 sticky top-0 z-20 pt-8 bg-[#050505]/80 backdrop-blur-xl -mx-8 px-8 pb-8 border-b border-white/5">
                                    <div className="flex flex-col">
                                        <h2 className="font-aztec-h1 text-5xl md:text-6xl text-white tracking-tighter">
                                            {module.title}
                                        </h2>
                                        <p className="text-[10px] font-mono text-white/60 uppercase tracking-[0.5em] mt-3 font-black">
                                            {module.description}
                                        </p>
                                    </div>
                                    <div className="ml-auto hidden sm:flex items-center gap-3 bg-white/5 px-6 py-2 rounded-full border border-white/10">
                                        <Target size={14} className="text-white/60" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/50">{module.articles.length} FILES</span>
                                    </div>
                                </div>

                                <div className="space-y-40">
                                    {module.articles.map((article, index) => (
                                        <ArticleBlock key={article.id} article={article} index={index} />
                                    ))}
                                </div>
                            </section>
                        ))}

                        {filteredModules.length === 0 && (
                            <div className="text-center py-40 border border-dashed border-white/10 rounded-3xl">
                                <Hash size={48} className="mx-auto text-white/10 mb-6" />
                                <p className="text-2xl font-black text-white/30 uppercase tracking-widest opacity-50">
                                    No classified files match query.
                                </p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}

