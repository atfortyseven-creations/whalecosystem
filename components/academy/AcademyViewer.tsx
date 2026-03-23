"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock as ClockIcon, Search, Hash, Target, ChevronRight } from 'lucide-react';
import { ACADEMY_MODULES } from '@/lib/data/academy-data';

export function AcademyViewer() {
    const [searchQuery, setSearchQuery] = useState('');
    const [time, setTime] = useState(new Date());
    const [activeSection, setActiveSection] = useState<string>('');
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

    // Filter modules based on search
    const filteredModules = React.useMemo(() => {
        if (!searchQuery.trim()) return ACADEMY_MODULES;
        
        const query = searchQuery.toLowerCase();
        return ACADEMY_MODULES.map(module => ({
            ...module,
            articles: module.articles.filter(a => 
                a.title.toLowerCase().includes(query) || 
                a.description.toLowerCase().includes(query) ||
                a.content.toLowerCase().includes(query)
            )
        })).filter(module => module.articles.length > 0);
    }, [searchQuery]);

    // Intersection Observer for the Sticky TOC
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { rootMargin: '-20% 0px -80% 0px' }
        );

        const sections = document.querySelectorAll('article[id]');
        sections.forEach((section) => observer.observe(section));

        return () => {
            sections.forEach((section) => observer.unobserve(section));
        };
    }, [filteredModules]);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element && contentRef.current) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="flex h-[calc(100vh-80px)] mt-20 bg-transparent border-t border-[var(--aztec-ink)]/10 relative z-20 overflow-hidden">
            
            {/* STICKY SIDEBAR NAVIGATION (Table of Contents) */}
            <div className="hidden lg:flex w-80 flex-shrink-0 border-r border-[var(--aztec-ink)]/10 bg-white/90 flex-col h-full overflow-hidden backdrop-blur-xl relative">
                
                {/* Decorative border glow */}
                <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[var(--aztec-orchid)]/50 to-transparent" />

                <div className="p-8 border-b border-[var(--aztec-ink)]/10 flex-shrink-0 bg-transparent">
                    <h2 className="font-aztec-h2 text-xl font-black uppercase tracking-widest text-[var(--aztec-ink)] mb-1 flex items-center gap-3">
                        <Target size={20} className="text-[var(--aztec-orchid)]" />
                        Intelligence Matrix
                    </h2>
                    
                    <div className="flex items-center gap-2 text-[10px] font-aztec-h2 font-bold text-[var(--aztec-ink)]/40 mb-6 uppercase tracking-widest">
                        <ClockIcon size={12} className="text-[var(--aztec-orchid)]" />
                        {timeString} SERVER_SYNC
                    </div>
                    
                    <div className="relative">
                        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--aztec-ink)]/40" />
                        <input 
                            type="text"
                            placeholder="Filtrar base de datos..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="font-aztec-body w-full pl-10 pr-4 py-3 bg-[var(--aztec-parchment)] border border-[var(--aztec-ink)]/20 rounded-xl text-[13px] font-medium text-[var(--aztec-ink)] placeholder:text-[var(--aztec-ink)]/30 focus:outline-none focus:border-[var(--aztec-orchid)] transition-all shadow-inner"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
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
                                        className={`text-left pl-4 py-2 pr-2 text-[12px] font-aztec-body transition-all relative flex items-center group
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
                                        <span className="truncate leading-tight">{(article.title || '').substring((article.title || '').indexOf('.') + 1).trim()}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* MAIN CONTINUOUS SCROLL CONTENT AREA */}
            <div 
                ref={contentRef}
                className="flex-1 overflow-y-auto custom-scrollbar relative w-full bg-white"
            >
                {/* Decorative background mesh */}
                <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-[var(--aztec-orchid)]/5 rounded-full blur-[150px] pointer-events-none" />
                
                <div className="max-w-[1200px] mx-auto px-6 lg:px-20 py-16 lg:py-24 relative z-10 transition-opacity">
                    
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
                            {/* Module Header Segment */}
                            <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl pt-8 pb-4 border-b border-[var(--aztec-ink)]/10 mb-16">
                                <h2 className="font-aztec-h1 text-4xl md:text-5xl text-[var(--aztec-ink)] tracking-tight">
                                    {module.title}
                                </h2>
                                <p className="font-aztec-body text-lg text-[var(--aztec-ink)]/60 mt-3 font-medium uppercase tracking-widest text-xs">
                                    {module.description}
                                </p>
                            </div>

                            {/* Articles Continuous Rendering */}
                            <div className="space-y-32">
                                {module.articles.map((article, index) => (
                                    <article 
                                        key={article.id} 
                                        id={article.id}
                                        className="group relative"
                                    >
                                        <div className="absolute -left-12 top-2 hidden xl:flex flex-col items-center">
                                            <div className="w-8 flex justify-end">
                                               <span className="text-[10px] font-black text-[var(--aztec-ink)]/20 uppercase tracking-widest rotate-180" style={{ writingMode: 'vertical-rl' }}>
                                                   LOG_{index.toString().padStart(3, '0')}
                                               </span>
                                            </div>
                                        </div>

                                        <div className="mb-8 space-y-4">
                                            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--aztec-orchid)]/80 font-mono">
                                                <span className="flex items-center gap-1.5 bg-[var(--aztec-orchid)]/10 px-3 py-1 rounded-full"><ClockIcon size={12} /> {article.readTime} MIN READ</span>
                                                <span className="text-[var(--aztec-ink)]/30">ID: {article.id.toUpperCase()}</span>
                                            </div>
                                            
                                            <h3 className="font-aztec-h1 text-4xl md:text-6xl text-[var(--aztec-ink)] tracking-tight leading-[1.1]">
                                                {article.title}
                                            </h3>
                                            
                                            <p className="font-aztec-body text-xl md:text-2xl text-[var(--aztec-ink)]/70 leading-relaxed border-l-2 border-[var(--aztec-orchid)]/50 pl-6 italic">
                                                {article.description}
                                            </p>
                                        </div>

                                        <div 
                                            className="prose-aztec prose max-w-none prose-headings:font-aztec-h1 prose-headings:tracking-tight prose-headings:text-[var(--aztec-ink)] prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:border-b-2 border-dashed prose-h2:border-[var(--aztec-ink)]/10 prose-h2:pb-4 prose-h3:text-2xl prose-h3:text-[var(--aztec-ink)]/80 prose-h3:mt-8 prose-p:font-aztec-body prose-p:text-[var(--aztec-ink)]/70 prose-p:leading-relaxed prose-p:text-lg md:prose-p:text-xl prose-strong:text-[var(--aztec-ink)] prose-strong:font-black prose-ul:text-[var(--aztec-ink)]/70 prose-li:marker:text-[var(--aztec-orchid)] selection:bg-[var(--aztec-orchid)]/20"
                                            dangerouslySetInnerHTML={{ __html: article.content }}
                                        />

                                        {/* Divider between articles */}
                                        <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--aztec-ink)]/10 to-transparent mt-32" />
                                    </article>
                                ))}
                            </div>
                        </div>
                    ))}
                    
                    {filteredModules.length === 0 && (
                        <div className="text-center py-20">
                            <Hash size={48} className="mx-auto text-[var(--aztec-ink)]/20 mb-4" />
                            <p className="text-xl font-bold text-[var(--aztec-ink)]/50">El Archivo Solicitado No Existe en la Base de Datos.</p>
                        </div>
                    )}
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: var(--aztec-ink);
                    border-radius: 10px;
                    opacity: 0.2;
                }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                    background-color: var(--aztec-orchid);
                }
                .prose-aztec-block {
                    border-radius: 8px;
                    box-shadow: inset 0 2px 10px rgba(0,0,0,0.5);
                }
                .diagram-container {
                    margin: 3rem 0;
                    padding: 2rem;
                    background: rgba(0, 0, 0, 0.02);
                    border: 1px solid rgba(0, 0, 0, 0.05);
                    border-radius: 16px;
                }
                .diagram-caption {
                    font-size: 0.85rem !important;
                    text-align: center;
                    color: rgba(0, 0, 0, 0.6) !important;
                    margin-top: 1rem !important;
                    font-style: italic;
                    letter-spacing: 0.05em;
                }
            `}</style>
        </div>
    );
}
