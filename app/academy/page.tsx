"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, GraduationCap, FileText, Upload, Download, BookOpen, Lock, Folder, Printer } from "lucide-react";
import { useAccount } from "wagmi";
import { ALL_MODULES, TOPIC_CATEGORIES } from "@/lib/data/academy-curriculum";

export default function AcademyPage() {
    const { address } = useAccount();
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    // Check if the connected wallet is the creator (ends with 'b4a')
    // Deferred until after mount to prevent SSR hydration mismatch
    const isAdmin = useMemo(() => {
        if (!mounted || !address) return false;
        return address.toLowerCase().endsWith('b4a');
    }, [address, mounted]);

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const itemsPerPage = 20;
    
    // PDF storage state (Topic ID -> Base64) + Global Index
    const [pdfs, setPdfs] = useState<Record<string, string>>({});
    const [availablePdfs, setAvailablePdfs] = useState<string[]>([]);

    // Fetch PDF directory on mount
    useEffect(() => {
        if (!mounted) return;
        fetch('/api/academy/material?action=index')
            .then(res => res.json())
            .then(data => { if (data.ok && data.index) setAvailablePdfs(data.index); })
            .catch(() => {});
    }, [mounted]);

    const categoryModules = useMemo(() => {
        if (!selectedCategory) return [];
        return ALL_MODULES.filter(m => m.category === selectedCategory);
    }, [selectedCategory]);

    const currentModules = useMemo(() => {
        const start = (page - 1) * itemsPerPage;
        return categoryModules.slice(start, start + itemsPerPage);
    }, [categoryModules, page]);

    const totalPages = Math.ceil(categoryModules.length / itemsPerPage);

    const toggleModule = async (id: string) => {
        setExpandedId(prev => prev === id ? null : id);
        
        // Fetch material lazy-load from Redis if known to exist but not cached
        if (availablePdfs.includes(id) && !pdfs[id]) {
            try {
                const res = await fetch(`/api/academy/material?moduleId=${id}`);
                const json = await res.json();
                if (json.ok && json.base64) {
                    setPdfs(prev => ({ ...prev, [id]: json.base64 }));
                }
            } catch (e) {
                console.error("Failed to load PDF", e);
            }
        }
    };

    const handlePdfUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        if (file.size > 8 * 1024 * 1024) {
             alert("File too large. Maximum size is 8MB.");
             return;
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
            const data = event.target?.result as string;
            // Optimistic UI Update
            setPdfs(prev => ({ ...prev, [id]: data }));
            if (!availablePdfs.includes(id)) setAvailablePdfs(prev => [...prev, id]);
            
            // Persist to Server via our Redis wrapper
            try {
                const res = await fetch('/api/academy/material', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ moduleId: id, base64: data, walletAddress: address })
                });
                if (!res.ok) {
                    alert("Failed to save module to the Sovereign Network.");
                } else {
                    alert("Module securely uploaded and encrypted.");
                }
            } catch (e) {
                alert("Network error saving module.");
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="min-h-screen text-black/80 font-sans pb-0 pt-28 relative overflow-x-hidden print-container">
            {/* IN-HOUSE VECTORIZED PRINT ENGINE FOR MASTER SYLLABUS */}
            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    @page { margin: 20mm; size: A4; }
                    body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .print-hidden, nav, header, button, .lucide { display: none !important; }
                    .print-only { display: block !important; }
                    .print-container { pt-0; overflow: visible !important; }
                    .syllabus-module { page-break-inside: avoid; border: 1px solid #ddd; margin-bottom: 2rem; padding: 1.5rem; border-radius: 12px; }
                }
                @media screen {
                    .print-only { display: none !important; }
                }
            `}} />

            {/* PRINT-ONLY MASTER SYLLABUS RENDER (Hidden on Web) */}
            <div className="print-only max-w-4xl mx-auto text-black">
                <div className="text-center mb-12 border-b-4 border-black pb-8">
                    <h1 className="text-4xl font-black uppercase tracking-widest mb-4">Sovereign Terminal</h1>
                    <h2 className="text-2xl font-bold text-gray-500 uppercase tracking-widest">Institutional Curriculum · Master Syllabus</h2>
                    <p className="mt-4 font-mono text-xs text-gray-400">Autogenerated Encrypted Extract • 490 Modules</p>
                </div>
                {TOPIC_CATEGORIES.map(category => (
                    <div key={'print-'+category} className="mb-12">
                        <h2 className="text-2xl font-black uppercase tracking-tight mb-6 bg-black text-white p-4">{category}</h2>
                        <div className="space-y-6">
                            {ALL_MODULES.filter(m => m.category === category).map(mod => (
                                <div key={'print-'+mod.id} className="syllabus-module">
                                    <h3 className="text-lg font-black uppercase tracking-tight mb-2">{mod.title}</h3>
                                    <p className="text-sm font-mono text-gray-600 mb-4">{mod.desc}</p>
                                    <div className="text-sm bg-gray-50 border-l-4 border-gray-300 p-4">
                                        <div className="font-bold mb-1 uppercase text-xs tracking-widest text-gray-400">Core Content</div>
                                        {mod.content}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="fixed inset-0 pointer-events-none -z-10 bg-[#FAF9F4] print-hidden" />

            <div className="relative z-10 px-6 pb-0 print-hidden">
                <div className="max-w-5xl mx-auto">
                    
                    {/* Header */}
                    <div className="mb-16 text-center md:text-left flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div className="flex-1">
                            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-black/15 text-[10px] font-mono uppercase tracking-[0.2em] font-semibold text-black/50 mb-8 bg-white/70 shadow-sm backdrop-blur-sm">
                                <GraduationCap size={14} />
                                Professional Academy
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-black mb-6 uppercase flex flex-col md:flex-row md:items-center gap-6">
                                <div>
                                    Institutional <br className="hidden md:block" />
                                    <span className="text-black/30">Curriculum</span>
                                </div>
                                <button 
                                    onClick={() => window.print()}
                                    className="px-6 py-4 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-black/80 transition-all flex items-center justify-center gap-3 shadow-2xl mt-4 md:mt-0"
                                >
                                    <Printer size={16}/> Extract Master Syllabus PDF
                                </button>
                            </h1>
                            <p className="text-lg text-black/50 max-w-2xl leading-relaxed md:border-l-2 md:border-black/20 md:pl-6">
                                Theoretical mastery is the prerequisite for flawless execution. Explore {ALL_MODULES.length} deep-dive topics to master digital asset architecture and market logic.
                            </p>
                        </div>
                        
                        {/* Admin Display */}
                        {isAdmin && (
                            <div className="mt-8 md:mt-0 right-0 top-0">
                                <div className="flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest bg-black text-white shadow-xl">
                                    <Lock size={14}/> Creator Mode Active
                                </div>
                            </div>
                        )}
                    </div>

                    {!selectedCategory ? (
                        <div className="space-y-8">
                            <h2 className="text-2xl font-black tracking-tight uppercase border-b border-black/10 pb-4">
                                Select Curriculum Domain
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {TOPIC_CATEGORIES.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => { setSelectedCategory(cat); setPage(1); setExpandedId(null); }}
                                        className="text-left p-6 rounded-2xl border border-black/10 bg-white hover:border-black/30 hover:shadow-lg transition-all duration-300 flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center">
                                                <Folder size={18} className="text-black/60"/>
                                            </div>
                                            <span className="font-bold uppercase tracking-tight text-lg">{cat}</span>
                                        </div>
                                        <ChevronDown size={20} className="text-black/30 -rotate-90"/>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div>
                            {/* Navigation back and Pagination */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-black/10 pb-6 gap-4">
                                <div>
                                    <button onClick={() => setSelectedCategory(null)} className="text-[10px] font-bold uppercase tracking-widest text-[#888888] hover:text-black mb-2 block transition-colors">
                                        ← Return to Domains
                                    </button>
                                    <h2 className="text-2xl font-black tracking-tight uppercase">{selectedCategory}</h2>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="font-mono text-xs font-bold text-black/40">Showing {(page-1)*itemsPerPage + 1} - {Math.min(page*itemsPerPage, categoryModules.length)} of {categoryModules.length} Topics</span>
                                    <div className="flex items-center gap-2">
                                        <button disabled={page === 1} onClick={() => setPage(p => p-1)} className="px-4 py-2 bg-black/5 text-sm font-bold disabled:opacity-30 rounded-lg hover:bg-black/10">Prev</button>
                                        <button disabled={page === totalPages} onClick={() => setPage(p => p+1)} className="px-4 py-2 bg-black/5 text-sm font-bold disabled:opacity-30 rounded-lg hover:bg-black/10">Next</button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {currentModules.map((mod) => {
                                    const isExpanded = expandedId === mod.id;
                                    const hasPdf = availablePdfs.includes(mod.id) || !!pdfs[mod.id];
                                    
                                    return (
                                        <div key={mod.id} className={`rounded-3xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-black/20 bg-white shadow-xl' : 'border-black/[0.07] bg-white/50 hover:bg-white hover:border-black/15 shadow-sm'}`}>
                                            <button
                                                onClick={() => toggleModule(mod.id)}
                                                className="w-full text-left p-6 flex flex-col md:flex-row md:items-center justify-between outline-none gap-4"
                                            >
                                                <div className="flex-1 pr-6 flex items-start gap-4">
                                                    <div>
                                                        <h3 className={`text-lg md:text-xl font-bold uppercase tracking-tight mb-2 transition-colors ${isExpanded ? 'text-black' : 'text-black/80'}`}>
                                                            {mod.title}
                                                        </h3>
                                                        <p className="text-sm font-mono text-black/50 leading-relaxed max-w-3xl">
                                                            {mod.desc}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 shrink-0 justify-end w-full md:w-auto">
                                                    {hasPdf && (
                                                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                                                            <FileText size={12}/> Material
                                                        </span>
                                                    )}
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isExpanded ? 'bg-black text-white shadow-lg rotate-180' : 'bg-black/5 text-black/40 border border-black/10'}`}>
                                                        <ChevronDown size={18} />
                                                    </div>
                                                </div>
                                            </button>
                                            
                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <div className="p-6 md:p-8 pt-0 border-t border-black/[0.06] bg-black/5 flex flex-col md:flex-row gap-8">
                                                            <div className="flex-1 space-y-6">
                                                                <h4 className="text-xs font-bold text-black/40 uppercase tracking-widest flex items-center gap-2">
                                                                    <BookOpen size={14} /> Curriculum Insight
                                                                </h4>
                                                                <p className="text-base text-black/70 leading-relaxed">
                                                                    {mod.content}
                                                                </p>
                                                            </div>
                                                            
                                                            <div className="md:w-80 bg-white rounded-2xl p-6 border border-black/10 space-y-6 shadow-sm">
                                                                {/* User Display: Download if exists */}
                                                                <div className="space-y-3">
                                                                    <h5 className="text-[10px] font-bold text-black/50 tracking-widest uppercase">Course Material</h5>
                                                                    {hasPdf ? (
                                                                        <a 
                                                                            href={pdfs[mod.id]} 
                                                                            download={`${mod.title.replace(/[^a-z0-9]/gi, '_')}.pdf`}
                                                                            className="w-full flex items-center justify-center gap-2 py-4 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
                                                                        >
                                                                            <Download size={16}/> Download PDF
                                                                        </a>
                                                                    ) : (
                                                                        <div className="w-full py-4 bg-black/5 text-black/40 text-xs font-bold uppercase tracking-widest rounded-xl text-center border border-dashed border-black/10 cursor-not-allowed">
                                                                            No Material Yet
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Admin Display: Upload override */}
                                                                {isAdmin && (
                                                                    <div className="pt-6 border-t border-black/10 space-y-3">
                                                                        <h5 className="text-[10px] font-bold text-[#b19331] tracking-widest uppercase flex items-center gap-2">
                                                                           <Lock size={10}/> Creator Panel
                                                                        </h5>
                                                                        <div className="relative">
                                                                            <input 
                                                                                type="file" 
                                                                                accept="application/pdf"
                                                                                onChange={(e) => handlePdfUpload(mod.id, e)}
                                                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                                            />
                                                                            <div className="w-full py-3 bg-white border-2 border-dashed border-black/20 text-black/50 text-[10px] font-bold uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 hover:bg-black/5 transition-colors">
                                                                                <Upload size={14}/> Upload New PDF Target
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="relative pt-24 pb-12 mt-20 border-t border-black/10 text-center">
                <span className="font-mono text-[10px] uppercase tracking-widest text-black/40 font-bold">
                    Professional Education Portal · Verifiable Contents
                </span>
            </div>
        </div>
    );
}
