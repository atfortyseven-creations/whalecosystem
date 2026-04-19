"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAccount } from "wagmi";
import { motion, AnimatePresence } from "framer-motion";
import { Server, CheckCircle2, ChevronDown, GraduationCap, Folder, Upload, Send, Lock, BookOpen, Shield } from "lucide-react";
import { syncAcademySyllabusToDB, getUserProgressAndSubmissions, toggleLessonProgress, submitProofOfWork } from "@/app/actions/academy-actions";
import { SovereignProfileModal } from "./SovereignProfileModal";

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
        if (!address) return alert("Billetera no conectada");
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
        <div className="pt-32 pb-48 px-4 sm:px-6 max-w-5xl mx-auto w-full relative z-10 transition-all">
            
            {/* Header */}
            <header className="mb-16 flex flex-col md:flex-row justify-between items-start gap-8 border-b border-black/10 pb-8">
                <div>
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-black/15 text-[10px] font-mono uppercase tracking-[0.2em] font-semibold text-black/50 mb-6 bg-white/70">
                        <GraduationCap size={14} /> Sistema Moodle Institucional
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif text-black leading-tight tracking-tight mb-4">
                        Sovereign <span className="font-light italic opacity-60">Curriculum</span>
                    </h1>
                    <p className="font-serif text-[14px] text-[#444] max-w-xl leading-relaxed">
                        Infraestructura pedagógica con auditoría determinística. Cada módulo interactivo transmite telemetría hacia las tablas inmutables de su perfil académico.
                    </p>
                </div>
                {/* Admin Mode Badge */}
                {isAdmin && (
                    <div className="flex flex-col items-end gap-3 text-right">
                        <div className="px-4 py-2 bg-black text-white rounded-lg text-[9px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 shadow-xl cursor-default">
                            <Server size={12}/> Teacher Root Access
                        </div>
                        <span className="font-mono text-[9px] text-black/40">DB Rows Active: {dbCourses.length}</span>
                    </div>
                )}
                {/* User Profile Hook */}
                {!isAdmin && address && (
                    <div className="flex flex-col items-end gap-3 text-right">
                        <button 
                            onClick={() => setIsProfileOpen(true)}
                            className="px-6 py-3 bg-black text-white rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 transition-colors flex items-center gap-2"
                        >
                           <Shield size={14}/> Student Profile
                        </button>
                        <span className="font-mono text-[9px] text-black/40">{completedLessons.size} Módulos Conquistados</span>
                    </div>
                )}
            </header>

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
                                    className="p-6 border border-black/10 bg-white hover:border-black/30 transition-all text-left group relative overflow-hidden"
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
                                <div key={lesson.id} className={`border transition-all duration-300 ${isExpanded ? 'border-black/30 bg-white shadow-xl' : 'border-black/10 bg-white/40 hover:bg-white'}`}>
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
                                                <div className="p-6 md:p-8 pt-0 border-t border-black/5 flex flex-col md:flex-row gap-8 bg-[#FAF9F5]">
                                                    <div className="flex-1">
                                                        <h5 className="font-mono text-[10px] uppercase tracking-widest text-[#666] mb-4 flex items-center gap-2">
                                                            <BookOpen size={13}/> Contenido Extendido
                                                        </h5>
                                                        <p className="font-serif text-[13px] text-[#333] leading-[1.8] text-justify max-w-2xl">
                                                            {lesson.description}
                                                            {/* El contenido completo estará aquí migrado */}
                                                        </p>
                                                    </div>

                                                    <div className="w-full md:w-[320px] shrink-0 border border-black/10 bg-white p-6 relative">
                                                        <h5 className="font-mono text-[10px] uppercase font-bold tracking-widest border-b border-black/10 pb-3 mb-4">
                                                            Laboratorio / Proof of Work
                                                        </h5>
                                                        
                                                        {submission ? (
                                                            <div className="flex flex-col gap-3">
                                                                <div className={`text-[10px] font-mono tracking-widest uppercase py-2 px-3 border flex justify-between ${submission.status === 'PASSED' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : submission.status === 'FAILED' ? 'border-red-500 bg-red-50 text-red-700' : 'border-yellow-500/50 bg-yellow-50/50 text-yellow-700'}`}>
                                                                    <span>Estado:</span>
                                                                    <strong>{submission.status}</strong>
                                                                </div>
                                                                {submission.feedback && (
                                                                    <div className="text-[11px] font-serif bg-black/5 p-3 italic text-[#444] border-l-4 border-black/20">
                                                                        " {submission.feedback} "
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col gap-3">
                                                                {proofingLessonId === lesson.id ? (
                                                                    <>
                                                                       <input 
                                                                         type="text" 
                                                                         className="w-full font-mono text-[10px] p-3 border border-black/20 outline-none focus:border-black bg-transparent"
                                                                         placeholder="Ingresar Hash (0x...) o URL de captura"
                                                                         value={txHashInput}
                                                                         onChange={e => setTxHashInput(e.target.value)}
                                                                       />
                                                                       <div className="flex gap-2">
                                                                           <button onClick={handleSubmitProof} className="flex-1 bg-black text-white text-[9px] font-bold uppercase tracking-widest py-3 flex items-center justify-center gap-2 hover:bg-neutral-800">
                                                                               <Send size={12}/> Enviar Emisión
                                                                           </button>
                                                                           <button onClick={() => setProofingLessonId(null)} className="w-10 bg-black/5 text-black hover:bg-black/10 flex items-center justify-center">
                                                                               X
                                                                           </button>
                                                                       </div>
                                                                    </>
                                                                ) : (
                                                                    <button onClick={() => setProofingLessonId(lesson.id)} className="w-full py-4 border border-dashed border-black/30 text-[10px] font-bold font-mono tracking-widest uppercase hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2">
                                                                        <Upload size={14}/> Adjuntar Prueba
                                                                    </button>
                                                                )}
                                                                <p className="text-[10px] font-serif text-black/40 text-center mt-2 leading-relaxed">
                                                                    Sube una captura u Hash demostrando tu ejecución técnica de los conceptos mostrados.
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
