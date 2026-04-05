"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    GraduationCap, Lock, CheckCircle, PlayCircle,
    BookOpen, Zap, Shield, BarChart2, Code,
    TrendingUp, Globe, Clock, ChevronRight, Star
} from 'lucide-react';

interface Lesson {
    id: string;
    title: string;
    duration: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    completed: boolean;
    locked: boolean;
    description: string;
}

interface Course {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    lessons: Lesson[];
    progress: number;
    totalDuration: string;
    badge?: string;
}

const LEVEL_COLORS: Record<string, string> = { Beginner: '#00C076', Intermediate: '#FF9500', Advanced: '#FF3B30' };

import useSWR from 'swr';
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function WhaleAcademy() {
    const { data: rawData, mutate } = useSWR('/api/academy', fetcher);
    
    // Inject the Lucide icons dynamically mapped by name/theme later in mapping
    const MAPPED_ICONS: Record<string, React.ReactNode> = {
        'whale-basics': <Globe size={24}/>,
        'defi-mastery': <TrendingUp size={24}/>,
        'api-terminal': <Code size={24}/>,
        'portfolio-mgmt': <BarChart2 size={24}/>
    };
    const MAPPED_COLORS: Record<string, string> = {
        'whale-basics': '#627EEA',
        'defi-mastery': '#00C076',
        'api-terminal': '#9945FF',
        'portfolio-mgmt': '#D4AF37'
    };

    const COURSES: Course[] = rawData?.data?.map((co: any) => ({
        ...co,
        icon: MAPPED_ICONS[co.id] || <BookOpen size={24}/>,
        color: MAPPED_COLORS[co.id] || '#050505'
    })) || [];

    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

    const markLessonComplete = async () => {
        if (!selectedLesson) return;
        try {
            await fetch('/api/academy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lessonId: selectedLesson.id })
            });
            mutate(); // Rehydrate from Prisma Database
            // Optimistically update selection
            setSelectedLesson({ ...selectedLesson, completed: true });
            if (selectedCourse) setSelectedCourse({
                 ...selectedCourse,
                 lessons: selectedCourse.lessons.map(l => l.id === selectedLesson.id ? { ...l, completed: true } : l)
            });
        } catch (e) {
            console.error("Failure updating lesson", e);
        }
    };

    if (selectedLesson && selectedCourse) {
        return (
            <div className="flex flex-col h-full space-y-4">
                <div className="flex items-center gap-3">
                    <button onClick={() => setSelectedLesson(null)}
                        className="p-2 rounded-xl border border-[#E5E5E5] text-[#888888] hover:text-[#050505] transition-colors">
                        <ChevronRight size={16} className="rotate-180"/>
                    </button>
                    <span className="text-[10px] font-black text-[#888888] uppercase tracking-widest">{selectedCourse.title}</span>
                </div>
                <div className="flex-1 bg-white border border-[#E5E5E5] rounded-2xl p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-[8px] px-2 py-1 rounded font-black uppercase" style={{ background: LEVEL_COLORS[selectedLesson.level] + '20', color: LEVEL_COLORS[selectedLesson.level] }}>
                            {selectedLesson.level}
                        </span>
                        <span className="text-[9px] font-mono text-[#888888] flex items-center gap-1"><Clock size={10}/>{selectedLesson.duration}</span>
                    </div>
                    <h1 className="text-2xl font-black text-[#050505] mb-4">{selectedLesson.title}</h1>
                    <p className="text-sm text-[#888888] leading-relaxed mb-8 max-w-2xl">{selectedLesson.description}</p>

                    {/* Simulated lesson content */}
                    <div className="bg-[#FAF9F6] border border-[#E5E5E5] rounded-xl p-6 space-y-4">
                        <div className="flex items-center gap-2">
                            <PlayCircle size={20} className="text-[#050505]"/>
                            <span className="text-xs font-black text-[#050505] uppercase tracking-widest">Video Lesson</span>
                        </div>
                        <div className="aspect-video bg-[#E5E5E5] rounded-xl flex items-center justify-center">
                            <div className="text-center">
                                <PlayCircle size={56} className="text-[#888888] mx-auto mb-2"/>
                                <p className="text-[10px] font-black text-[#888888] uppercase">Connect to premium to watch</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-8">
                        <button onClick={() => setSelectedLesson(null)}
                            className="px-6 py-3 border border-[#E5E5E5] rounded-xl text-[10px] font-black uppercase tracking-widest text-[#888888] hover:text-[#050505] transition-colors">
                            ← Back to Course
                        </button>
                        <button onClick={markLessonComplete} className="flex-1 py-3 bg-[#050505] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#050505]/85 transition-colors flex items-center justify-center gap-2">
                            <CheckCircle size={14}/> {selectedLesson.completed ? 'Completed' : 'Mark Complete'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (selectedCourse) {
        return (
            <div className="flex flex-col space-y-5">
                <button onClick={() => setSelectedCourse(null)} className="flex items-center gap-2 text-[10px] font-black text-[#888888] uppercase tracking-widest hover:text-[#050505] transition-colors w-fit">
                    <ChevronRight size={14} className="rotate-180"/> All Courses
                </button>
                <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 shadow-sm">
                    <div className="flex items-start gap-4 mb-5">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0" style={{ background: selectedCourse.color }}>
                            {selectedCourse.icon}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className="text-sm font-black text-[#050505]">{selectedCourse.title}</h2>
                                {selectedCourse.badge && (
                                    <span className="text-[7px] px-1.5 py-0.5 rounded font-black uppercase bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">{selectedCourse.badge}</span>
                                )}
                            </div>
                            <p className="text-[10px] text-[#888888] leading-relaxed">{selectedCourse.description}</p>
                            <div className="flex items-center gap-4 mt-3">
                                <div className="flex-1 max-w-[200px] h-1.5 bg-[#E5E5E5] rounded-full overflow-hidden">
                                    <div className="h-full bg-[#050505] rounded-full" style={{ width: `${selectedCourse.progress}%` }}/>
                                </div>
                                <span className="text-[9px] font-black text-[#888888] uppercase">{selectedCourse.progress}% complete</span>
                                <span className="text-[9px] font-mono text-[#888888] flex items-center gap-1"><Clock size={9}/>{selectedCourse.totalDuration}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="space-y-3">
                    {selectedCourse.lessons.map((lesson, i) => (
                        <motion.div key={lesson.id}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                            onClick={() => !lesson.locked && setSelectedLesson(lesson)}
                            className={`bg-white border border-[#E5E5E5] rounded-xl p-4 flex items-center gap-4 transition-all ${lesson.locked ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-sm hover:border-[#050505]/20 cursor-pointer'}`}>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${lesson.completed ? 'bg-[#00C076] text-white' : lesson.locked ? 'bg-[#E5E5E5] text-[#888888]' : 'bg-[#FAF9F6] border border-[#E5E5E5] text-[#888888]'}`}>
                                {lesson.completed ? <CheckCircle size={18}/> : lesson.locked ? <Lock size={16}/> : <PlayCircle size={18}/>}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black text-[#888888]">Lesson {i + 1}</span>
                                    <span className="text-[7px] px-1.5 py-0.5 rounded font-black uppercase" style={{ background: LEVEL_COLORS[lesson.level] + '20', color: LEVEL_COLORS[lesson.level] }}>
                                        {lesson.level}
                                    </span>
                                </div>
                                <p className="text-[11px] font-black text-[#050505]">{lesson.title}</p>
                                <p className="text-[9px] text-[#888888] mt-0.5">{lesson.description}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[9px] font-mono text-[#888888] flex items-center gap-1"><Clock size={9}/>{lesson.duration}</span>
                                {lesson.locked && <Lock size={12} className="text-[#888888]"/>}
                                {!lesson.locked && <ChevronRight size={14} className="text-[#888888]"/>}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        );
    }

    // Main courses grid
    return (
        <div className="flex flex-col space-y-5">
            {/* Header */}
            <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#050505] flex items-center justify-center">
                    <GraduationCap size={22} className="text-white"/>
                </div>
                <div>
                    <h2 className="text-sm font-black text-[#050505] uppercase tracking-widest">Whale Academy</h2>
                    <p className="text-[10px] text-[#888888]">Professional-grade crypto education · {COURSES.reduce((s, c) => s + c.lessons.length, 0)} lessons · {COURSES.length} courses</p>
                </div>
                <div className="ml-auto flex items-center gap-4">
                    {[
                        { label: 'Total Hours', value: '12h+', color: '#050505' },
                        { label: 'Courses', value: COURSES.length.toString(), color: '#627EEA' },
                        { label: 'Avg Rating', value: '4.9★', color: '#D4AF37' },
                    ].map((s, i) => (
                        <div key={i} className="text-center">
                            <div className="text-lg font-black font-mono" style={{ color: s.color }}>{s.value}</div>
                            <div className="text-[8px] text-[#888888] uppercase tracking-widest">{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {COURSES.map((course, i) => (
                    <motion.div key={course.id}
                        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                        onClick={() => setSelectedCourse(course)}
                        className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer">
                        {/* Color stripe */}
                        <div className="h-1.5" style={{ background: course.color }}/>
                        <div className="p-6">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: course.color }}>
                                    {course.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <h3 className="text-[11px] font-black text-[#050505] truncate">{course.title}</h3>
                                        {course.badge && (
                                            <span className="text-[7px] px-1.5 py-0.5 rounded font-black uppercase bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 shrink-0">{course.badge}</span>
                                        )}
                                    </div>
                                    <p className="text-[9px] text-[#888888] leading-relaxed line-clamp-2">{course.description}</p>
                                </div>
                            </div>

                            {/* Progress */}
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex-1 h-1 bg-[#E5E5E5] rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all" style={{ width: `${course.progress}%`, background: course.color }}/>
                                </div>
                                <span className="text-[8px] font-black text-[#888888] shrink-0">{course.progress}%</span>
                            </div>

                            {/* Meta */}
                            <div className="flex items-center gap-4 text-[9px] text-[#888888]">
                                <span className="flex items-center gap-1"><BookOpen size={10}/>{course.lessons.length} lessons</span>
                                <span className="flex items-center gap-1"><Clock size={10}/>{course.totalDuration}</span>
                                <span className="flex items-center gap-1 text-[#D4AF37]"><Star size={10} className="fill-[#D4AF37]"/>4.9</span>
                            </div>

                            {/* Level badges */}
                            <div className="flex gap-1 mt-3">
                                {(['Beginner', 'Intermediate', 'Advanced'] as const).map(lvl => {
                                    const count = course.lessons.filter(l => l.level === lvl).length;
                                    return count > 0 ? (
                                        <span key={lvl} className="text-[7px] px-1.5 py-0.5 rounded font-black uppercase"
                                            style={{ background: LEVEL_COLORS[lvl] + '15', color: LEVEL_COLORS[lvl] }}>
                                            {count} {lvl}
                                        </span>
                                    ) : null;
                                })}
                            </div>
                        </div>
                        <div className="px-6 py-3 border-t border-[#E5E5E5] bg-[#FAF9F6] flex items-center justify-between">
                            <span className="text-[9px] font-black text-[#888888] uppercase tracking-widest">
                                {course.lessons.filter(l => l.completed).length}/{course.lessons.length} completed
                            </span>
                            <span className="text-[9px] font-black text-[#050505] flex items-center gap-1">
                                {course.progress === 0 ? 'Start Course' : course.progress === 100 ? 'Review' : 'Continue'} <ChevronRight size={12}/>
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
