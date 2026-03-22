"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, BookOpen, Clock as ClockIcon, Shield, Search, ArrowRight, Hash } from 'lucide-react';
import { ACADEMY_MODULES, AcademyArticle, AcademyModule } from '@/lib/data/academy-data';

export function AcademyViewer() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedArticleId, setSelectedArticleId] = useState<string>(ACADEMY_MODULES[0].articles[0].id);
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set([ACADEMY_MODULES[0].id]));
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

    const toggleModule = (moduleId: string) => {
        const newExpanded = new Set(expandedModules);
        if (newExpanded.has(moduleId)) {
            newExpanded.delete(moduleId);
        } else {
            newExpanded.add(moduleId);
        }
        setExpandedModules(newExpanded);
    };

    // Flatten all articles for easy lookup and numbering
    const { allArticles, flatArticles } = React.useMemo(() => {
        const articlesMap: Record<string, AcademyArticle> = {};
        const flat: AcademyArticle[] = [];
        ACADEMY_MODULES.forEach(m => {
            m.articles.forEach(a => {
                articlesMap[a.id] = a;
                flat.push(a);
            });
        });
        return { allArticles: articlesMap, flatArticles: flat };
    }, []);

    const currentIndex = flatArticles.findIndex(a => a.id === selectedArticleId);
    const totalArticles = flatArticles.length;

    const selectedArticle = allArticles[selectedArticleId];

    // Filter modules based on search
    const filteredModules = React.useMemo(() => {
        if (!searchQuery.trim()) return ACADEMY_MODULES;
        
        const query = searchQuery.toLowerCase();
        return ACADEMY_MODULES.map(module => ({
            ...module,
            articles: module.articles.filter(a => 
                a.title.toLowerCase().includes(query) || 
                a.description.toLowerCase().includes(query)
            )
        })).filter(module => module.articles.length > 0);
    }, [searchQuery]);

    return (
        <div className="flex h-[calc(100vh-80px)] mt-20 bg-transparent border-t border-[var(--aztec-ink)]/10 relative z-20 overflow-hidden">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div 
                    className="absolute inset-0 bg-[var(--aztec-ink)]/40 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* SIDEBAR NAVIGATION */}
            <div className={`
                w-[85%] max-w-[320px] lg:w-80 flex-shrink-0 border-r border-white/10 bg-black/20 lg:bg-black/10 flex flex-col h-full overflow-hidden shadow-2xl lg:shadow-none
                transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-8 border-b border-[var(--aztec-ink)]/10 flex-shrink-0 bg-transparent backdrop-blur-md">
                    <h2 className="font-aztec-h2 text-xl font-black uppercase tracking-widest text-[var(--aztec-ink)] mb-1 flex items-center gap-3">
                        <BookOpen size={20} className="text-[var(--aztec-orchid)]" />
                        Whale Academy
                    </h2>
                    
                    <div className="flex items-center gap-2 text-[10px] font-aztec-h2 font-bold text-[var(--aztec-ink)]/40 mb-6 uppercase tracking-widest">
                        <ClockIcon size={12} className="text-[var(--aztec-orchid)]" />
                        {timeString} SERVER_TIME
                    </div>
                    
                    <div className="relative">
                        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--aztec-ink)]/40" />
                        <input 
                            type="text"
                            placeholder="Buscar en el compendio..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="font-aztec-body w-full pl-10 pr-4 py-3 bg-[var(--aztec-parchment)] border border-[var(--aztec-ink)]/10 rounded-2xl text-[13px] font-medium text-[var(--aztec-ink)] placeholder:text-[var(--aztec-ink)]/30 focus:outline-none focus:border-[var(--aztec-orchid)] transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-1">
                    {filteredModules.map((module) => (
                        <div key={module.id} className="mb-2">
                            <button
                                onClick={() => toggleModule(module.id)}
                                className="w-full flex items-center justify-between p-2 hover:bg-[var(--aztec-ink)]/5 rounded-lg transition-colors group"
                            >
                                <span className="text-[11px] font-black uppercase tracking-wider text-[var(--aztec-ink)]/70 group-hover:text-[var(--aztec-ink)] text-left">
                                    {module.title}
                                </span>
                                {expandedModules.has(module.id) || searchQuery ? (
                                    <ChevronDown size={14} className="text-[var(--aztec-ink)]/40" />
                                ) : (
                                    <ChevronRight size={14} className="text-[var(--aztec-ink)]/40" />
                                )}
                            </button>
                            
                            <AnimatePresence>
                                {(expandedModules.has(module.id) || searchQuery) && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="pl-4 py-1 flex flex-col gap-0.5 border-l-2 border-[var(--aztec-ink)]/10 ml-3 mt-1">
                                            {module.articles.map(article => (
                                                <button
                                                    key={article.id}
                                                    onClick={() => {
                                                        setSelectedArticleId(article.id);
                                                        setSidebarOpen(false);
                                                    }}
                                                    className={`text-left px-3 py-1.5 rounded-lg text-[13px] transition-all ${
                                                        selectedArticleId === article.id 
                                                        ? 'bg-[var(--aztec-ink)] text-[var(--aztec-parchment)] font-black shadow-sm' 
                                                        : 'text-[var(--aztec-ink)]/50 hover:text-[var(--aztec-ink)] hover:bg-[var(--aztec-ink)]/5 font-medium'
                                                    }`}
                                                >
                                                    {article.title}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                    
                    {filteredModules.length === 0 && (
                        <div className="text-center py-10">
                            <Shield size={24} className="mx-auto text-[var(--aztec-ink)]/30 mb-2" />
                            <p className="text-xs font-bold text-[var(--aztec-ink)]/40 uppercase">Sin resultados en los archivos</p>
                        </div>
                    )}
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 overflow-y-auto bg-[var(--aztec-ink)]/5 custom-scrollbar relative w-full lg:w-auto">
                <div className="lg:hidden sticky top-0 z-30 bg-[var(--aztec-parchment)] border-b border-[var(--aztec-ink)]/10 backdrop-blur-xl p-4 flex items-center justify-between">
                    <button 
                        onClick={() => setSidebarOpen(true)}
                        className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[var(--aztec-ink)]/80 bg-[var(--aztec-ink)]/5 px-4 py-2.5 rounded-xl hover:bg-[var(--aztec-ink)]/10 transition-colors"
                    >
                        <BookOpen size={14} className="text-[var(--aztec-orchid)]" /> Índice de Archivos
                    </button>
                    <div className="text-[10px] font-black uppercase tracking-tighter text-[var(--aztec-ink)]/40 font-mono">
                        {timeString}
                    </div>
                </div>

                {/* Decorative background mesh */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--aztec-orchid)]/10 rounded-full blur-[100px] pointer-events-none opacity-50 hidden lg:block" />
                
                <div className="w-full px-6 lg:px-12 py-8 lg:py-10 relative z-10 glitch-hover">
                    {/* Centered Page Numbering */}
                    <div className="flex justify-center mb-8">
                        <div className="px-4 py-1.5 bg-[var(--aztec-ink)] rounded-full flex items-center gap-2 shadow-xl border border-[var(--aztec-ink)]/10">
                            <Hash size={12} className="text-[var(--aztec-orchid)]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--aztec-parchment)]">
                                ARCHIVO {currentIndex} DE {totalArticles - 1}
                            </span>
                        </div>
                    </div>
                    {selectedArticle ? (
                        <motion.div
                            key={selectedArticle.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            <div className="mb-12 space-y-6">
                                <div className="flex items-center gap-4 text-[11px] font-aztec-h2 uppercase tracking-[0.3em] text-[var(--aztec-ink)]/40">
                                    <span className="flex items-center gap-1.5"><ClockIcon size={12} className="text-[var(--aztec-orchid)]" /> {selectedArticle.readTime} MIN READ</span>
                                    <span>•</span>
                                    <span>INSTITUTIONAL CURRICULUM</span>
                                </div>
                                
                                <h1 className="font-aztec-h1 text-6xl md:text-7xl text-[var(--aztec-ink)] tracking-tight leading-[0.9]">
                                    {selectedArticle.title}
                                </h1>
                                
                                <p className="font-aztec-body text-2xl text-[var(--aztec-ink)]/60 leading-relaxed border-l-4 border-[var(--aztec-orchid)] pl-8 italic">
                                    {selectedArticle.description}
                                </p>
                            </div>

                            <div className="w-full h-px bg-[var(--aztec-ink)]/5 my-12" />

                            <div 
                                className={`prose-aztec prose max-w-none prose-headings:font-aztec-h1 prose-headings:tracking-tight prose-headings:text-[var(--aztec-ink)] prose-h2:text-4xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:border-b prose-h2:border-[var(--aztec-ink)]/10 prose-h2:pb-4 prose-h3:text-2xl prose-h3:text-[var(--aztec-orchid)] prose-h3:mt-10 prose-p:font-aztec-body prose-p:text-[var(--aztec-ink)]/70 prose-p:leading-relaxed prose-p:text-xl prose-strong:text-[var(--aztec-ink)] prose-strong:font-black prose-ul:text-[var(--aztec-ink)]/60 prose-li:marker:text-[var(--aztec-orchid)] selection:bg-[var(--aztec-orchid)]/20`}
                                dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                            />

                            {/* Footer Next Article Logic (Simplified) */}
                            <div className="mt-20 pt-10 border-t border-[var(--aztec-ink)]/10 flex justify-end">
                                <button className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-[var(--aztec-orchid)] hover:text-[var(--aztec-ink)] transition-colors group">
                                    Siguiente Capítulo
                                    <div className="w-10 h-10 rounded-full bg-[var(--aztec-orchid)]/10 flex items-center justify-center group-hover:bg-[var(--aztec-orchid)] transition-colors">
                                        <ArrowRight size={18} className="group-hover:text-[var(--aztec-parchment)]" />
                                    </div>
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                            <BookOpen size={48} className="text-[var(--aztec-ink)]/20 mb-6" />
                            <h2 className="text-2xl font-aztec-h1 text-[var(--aztec-ink)] mb-2">Compendio de Inteligencia</h2>
                            <p className="font-aztec-body text-[var(--aztec-ink)]/50">Seleccione un archivo en el índice del panel izquierdo.</p>
                        </div>
                    )}
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1;
                }
            `}</style>
        </div>
    );
}
