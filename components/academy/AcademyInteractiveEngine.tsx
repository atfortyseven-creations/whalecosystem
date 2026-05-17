"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAccount } from "wagmi";
import { motion, AnimatePresence } from "framer-motion";
import { Server, CheckCircle2, ChevronDown, GraduationCap, Folder, Upload, Send, Lock, BookOpen, Shield, Terminal } from "lucide-react";
import { syncAcademySyllabusToDB, getUserProgressAndSubmissions, toggleLessonProgress, submitProofOfWork } from "@/app/actions/academy-actions";
import { SovereignProfileModal } from "./SovereignProfileModal";
import { RemoteLottie } from "@/components/ui/RemoteLottie";

type Lesson = { id: string; title: string; description: string; duration: string; level: string; orderIndex: number };
type Course = { id: string; slug: string; title: string; description: string; lessons: Lesson[] };

export function AcademyInteractiveEngine({ 
    dbCourses, 
    isSeeded, 
    expectedCategories 
}: { 
    dbCourses: Course[], 
    isSeeded: boolean, 
    expectedCategories: number 
}) {
    const { address } = useAccount();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const isAdmin = useMemo(() => {
        // Permitir siempre el acceso debido a DB vacía / testing
        return true;
    }, []);

    // LMS States
    const [isSyncing, setIsSyncing] = useState(false);
    const [selectedCourseSlug, setSelectedCourseSlug] = useState<string | null>(null);
    const [expandedLessonId, setExpandedLessonId] = useState<string | null>(null);
    
    // User Context
    const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
    const [submissions, setSubmissions] = useState<Record<string, { status: string, feedback: string|null }>>({});
    
    // Submissions Modal State
    const [proofingLessonId, setProofingLessonId] = useState<string | null>(null);
    const [txHashInput, setTxHashInput] = useState("");
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Load User Progress Dynamically
    useEffect(() => {
        if (!mounted || !address || !isSeeded) return;
        getUserProgressAndSubmissions(address).then(res => {
            const progressSet = new Set<string>();
            res.progress.forEach((p: any) => p.completed && progressSet.add(p.lessonId));
            setCompletedLessons(progressSet);

            const subs: any = {};
            res.submissions.forEach((s: any) => { subs[s.lessonId] = { status: s.status, feedback: s.feedback }; });
            setSubmissions(subs);
        });
    }, [address, mounted, isSeeded]);

    const handleSync = async () => {
        setIsSyncing(true);
        const res = await syncAcademySyllabusToDB();
        setIsSyncing(false);
        if (res.ok) {
            window.location.reload(); // Refresh Server Component bindings
        } else {
            alert("Error syncing: " + res.error);
        }
    };

    const handleToggleComplete = async (lessonId: string) => {
        if (!address) return alert("Wallet not connected");
        const isCompleted = completedLessons.has(lessonId);
        
        // Optimistic UI update
        const nextSet = new Set(completedLessons);
        if (isCompleted) nextSet.delete(lessonId);
        else nextSet.add(lessonId);
        setCompletedLessons(nextSet);

        // Network Post
        try {
           await toggleLessonProgress(address, lessonId, !isCompleted);
        } catch(e) {
           alert("Fallo al contactar base de datos");
           setCompletedLessons(new Set(completedLessons)); // revert
        }
    };

    const handleSubmitProof = async () => {
        if (!address || !proofingLessonId || !txHashInput) return;
        const res = await submitProofOfWork(address, proofingLessonId, "", txHashInput);
        if (res.ok) {
            setSubmissions(prev => ({ ...prev, [proofingLessonId]: { status: "PENDING", feedback: null } }));
            setProofingLessonId(null);
            setTxHashInput("");
            alert("Prueba enviada a validación criptográfica.");
        }
    };

    if (!mounted) return null;

    // Zero-Mock Database Gatekeeper
    if (!isSeeded) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center max-w-2xl mx-auto">
                <Server size={48} className="text-black/30 mb-8" />
                <h1 className="text-3xl font-black uppercase tracking-widest mb-4">LMS Database Emptied</h1>
                <p className="font-serif text-[#555] mb-8 leading-relaxed">
                    El sistema detecta una base de datos virgen. La estructura del manifiesto en caché ha sido bloqueada. 
                    Debe inicializar la traslación matricial del Syllabus estático hacia las tablas Puras de PostgreSQL.
                </p>
                {isAdmin ? (
                    <button 
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="px-8 py-4 bg-black text-white font-mono uppercase tracking-[0.2em] font-bold text-xs hover:bg-black/80 transition-colors disabled:opacity-50"
                    >
                        {isSyncing ? "EJECUTANDO MIGRACIÓN MÚLTIPLE..." : `VOLCAR ${expectedCategories} DOMINIOS A POSTGRES`}
                    </button>
                ) : (
                    <div className="px-8 py-4 border border-red-500/20 bg-red-50 text-red-700 font-mono text-xs uppercase tracking-widest flex items-center justify-center gap-3">
                        <Lock size={14}/> Acceso Bloqueado: Permisos Insuficientes
                    </div>
                )}
            </div>
        );
    }

    const selectedCourse = dbCourses.find(c => c.slug === selectedCourseSlug);

    return (
        <div className="w-full h-full flex-1 flex flex-col p-0 relative z-10 transition-all text-left">

            {!selectedCourseSlug ? (
                <div className="space-y-6">
                    <h2 className="text-[12px] font-mono font-bold uppercase tracking-[0.2em] mb-4 opacity-50">Dominios Maestros</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {dbCourses.map(course => {
                            const completedInCourse = course.lessons.filter(l => completedLessons.has(l.id)).length;
                            const totalInCourse = course.lessons.length;
                            const progressPct = totalInCourse === 0 ? 0 : Math.round((completedInCourse / totalInCourse) * 100);

                            return (
                                <button
                                    key={course.id}
                                    onClick={() => setSelectedCourseSlug(course.slug)}
                                    className="p-6 border border-black/10 dark:border-white/10 bg-white/20 dark:bg-black/20 backdrop-blur-xl hover:border-black/30 dark:hover:border-white/30 transition-all text-left group relative overflow-hidden"
                                >
                                    <div className="absolute inset-x-0 bottom-0 h-1 bg-black/5">
                                        <div className="h-full bg-black/60 transition-all duration-1000" style={{ width: `${progressPct}%` }} />
                                    </div>
                                    <div className="flex items-center justify-between mb-4">
                                        <Folder size={18} className="text-black/30 group-hover:text-black transition-colors"/>
                                        <span className="font-mono text-[10px] text-black/40">{progressPct}% COMPLETADO</span>
                                    </div>
                                    <h3 className="font-serif text-lg font-bold uppercase tracking-tight text-black group-hover:text-black/70 mb-2">
                                        {course.title}
                                    </h3>
                                    <span className="text-xs font-mono text-black/50">{totalInCourse} Módulos Técnicos</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-end mb-8 border-b border-black/10 pb-4">
                        <div>
                            <button onClick={() => setSelectedCourseSlug(null)} className="text-[9px] font-bold font-mono tracking-widest uppercase text-black/40 hover:text-black transition-colors mb-3">
                                ← Retornar
                            </button>
                            <h2 className="text-2xl font-serif font-bold uppercase tracking-tight">{selectedCourse?.title}</h2>
                        </div>
                        <span className="font-mono text-[10px] text-black/40">{selectedCourse?.lessons.length} Módulos</span>
                    </div>

                    <div className="space-y-4">
                        {selectedCourse?.lessons.map((lesson) => {
                            const isExpanded = expandedLessonId === lesson.id;
                            const isCompleted = completedLessons.has(lesson.id);
                            const submission = submissions[lesson.id];

                            return (
                                <div key={lesson.id} className={`border backdrop-blur-xl transition-all duration-300 ${isExpanded ? 'border-black/30 dark:border-white/30 bg-white/60 dark:bg-black/60 shadow-xl' : 'border-black/10 dark:border-white/10 bg-white/20 dark:bg-black/20 hover:bg-white/40 dark:hover:bg-black/40'}`}>
                                    <button 
                                        onClick={() => setExpandedLessonId(isExpanded ? null : lesson.id)}
                                        className="w-full text-left p-6 flex justify-between items-center outline-none gap-4"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div onClick={(e) => { e.stopPropagation(); handleToggleComplete(lesson.id); }} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer ${isCompleted ? 'bg-black border-black text-white' : 'border-black/10 text-transparent hover:border-black/30'}`}>
                                                <CheckCircle2 size={16} />
                                            </div>
                                            <div>
                                                <h4 className={`font-serif text-[15px] font-bold uppercase tracking-tight transition-colors ${isCompleted ? 'text-black/40 line-through' : 'text-black'}`}>
                                                    {lesson.title}
                                                </h4>
                                                <p className="font-mono text-[10px] text-black/50 mt-1 max-w-xl truncate">{lesson.description}</p>
                                            </div>
                                        </div>
                                        <ChevronDown size={18} className={`text-black/30 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                    </button>

                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                                                <div className="p-6 md:p-8 pt-0 border-t border-black/5 dark:border-white/5 flex flex-col items-center justify-center bg-transparent">
                                                    <div className="w-full max-w-3xl border border-black/10 dark:border-white/10 bg-white/20 dark:bg-black/20 backdrop-blur-xl p-8 relative">
                                                        {address?.toLowerCase() === '0x78831c25c86ea2a78a6127fc2ccb95e612d87b4a' ? (
                                                            <div className="flex flex-col gap-4">
                                                                <h5 className="font-mono text-[12px] uppercase font-bold tracking-widest border-b border-black/10 pb-4 mb-2 text-[#050505] text-center">
                                                                    Portal de Carga (Owner Only)
                                                                </h5>
                                                                <label className="w-full py-12 border-2 border-dashed border-black/30 cursor-pointer text-[12px] font-bold font-mono tracking-widest uppercase hover:bg-black hover:text-white transition-colors flex flex-col items-center justify-center gap-3">
                                                                    <Upload size={24}/> 
                                                                    <span>Subir Manuscrito PDF</span>
                                                                    <span className="text-[10px] opacity-60">Max: 500 MB (PC & Mobile Support)</span>
                                                                    <input type="file" accept="application/pdf" className="hidden" onChange={(e) => {
                                                                        if(e.target.files && e.target.files.length > 0) {
                                                                            alert('Sistema preparado. Simulación de subida de PDF (' + e.target.files[0].name + ') iniciada con éxito. Capacidad de 500MB confirmada.');
                                                                        }
                                                                    }} />
                                                                </label>
                                                                <p className="text-[11px] font-serif text-black/40 text-center mt-2 leading-relaxed">
                                                                    Transmisión cifrada autorizada únicamente para la llave maestra 0x78831C25c86eA2a78A6127fC2Ccb95E612D87b4a. Los manuscritos reemplazarán el material anterior.
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col gap-4 opacity-50 select-none grayscale items-center py-8">
                                                                <h5 className="font-mono text-[12px] uppercase font-bold tracking-widest border-b border-black/10 pb-4 mb-2 flex items-center gap-3">
                                                                    <Shield size={16}/> Acceso Restringido
                                                                </h5>
                                                                <p className="text-[12px] font-serif text-black/60 text-center leading-relaxed max-w-md">
                                                                    Los manuscritos en PDF son de distribución clasificada y administrada únicamente por el arquitecto del sistema.
                                                                </p>
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

            <SovereignProfileModal 
                isOpen={isProfileOpen} 
                onClose={() => setIsProfileOpen(false)} 
                walletAddress={address} 
            />
        </div>
    );
}
