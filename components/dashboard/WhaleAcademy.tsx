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
            <div className="flex flex-col space-y-4 p-6">
                <div className="flex items-center gap-3">
                    <button onClick={() => setSelectedLesson(null)}
                        className="p-2 rounded-xl transition-colors" style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}>
                        <ChevronRight size={16} className="rotate-180"/>
                    </button>
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>{selectedCourse.title}</span>
                </div>
                <div className="flex-1 rounded-2xl p-7" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="flex items-center gap-3 mb-5">
                        <span className="text-[8px] px-2 py-1 rounded font-black uppercase" style={{ background: LEVEL_COLORS[selectedLesson.level] + '20', color: LEVEL_COLORS[selectedLesson.level] }}>
                            {selectedLesson.level}
                        </span>
                        <span className="text-[9px] font-mono flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.3)' }}><Clock size={10}/>{selectedLesson.duration}</span>
                    </div>
                    <h1 className="text-2xl font-black text-white mb-3">{selectedLesson.title}</h1>
                    <p className="text-sm leading-relaxed mb-7 max-w-2xl" style={{ color: 'rgba(255,255,255,0.45)' }}>{selectedLesson.description}</p>

                    {/* Simulated video */}
                    <div className="rounded-xl p-5 space-y-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="flex items-center gap-2">
                            <PlayCircle size={18} style={{ color: '#00F2EA' }}/>
                            <span className="text-xs font-black text-white uppercase tracking-widest">Video Lesson</span>
                        </div>
                        <div className="aspect-video rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div className="text-center">
                                <PlayCircle size={52} className="mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.12)' }}/>
                                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>Premium access required to watch</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-7">
                        <button onClick={() => setSelectedLesson(null)}
                            className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors"
                            style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}>
                            ← Back
                        </button>
                        <button onClick={markLessonComplete}
                            className="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 text-black"
                            style={{ background: '#fff' }}>
                            <CheckCircle size={14}/> {selectedLesson.completed ? 'Completed' : 'Mark Complete'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (selectedCourse) {
        return (
            <div className="flex flex-col space-y-4 p-6">
                <button onClick={() => setSelectedCourse(null)}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest w-fit transition-colors"
                    style={{ color: 'rgba(255,255,255,0.3)' }}>
                    <ChevronRight size={14} className="rotate-180"/> All Courses
                </button>

                <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0" style={{ background: selectedCourse.color }}>
                            {selectedCourse.icon}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className="text-sm font-black text-white">{selectedCourse.title}</h2>
                                {selectedCourse.badge && (
                                    <span className="text-[7px] px-1.5 py-0.5 rounded font-black uppercase" style={{ background: 'rgba(212,175,55,0.12)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.25)' }}>{selectedCourse.badge}</span>
                                )}
                            </div>
                            <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>{selectedCourse.description}</p>
                            <div className="flex items-center gap-4 mt-3">
                                <div className="flex-1 max-w-[200px] h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                                    <div className="h-full rounded-full transition-all" style={{ width: `${selectedCourse.progress}%`, background: selectedCourse.color }}/>
                                </div>
                                <span className="text-[9px] font-black uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>{selectedCourse.progress}% complete</span>
                                <span className="text-[9px] font-mono flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.3)' }}><Clock size={9}/>{selectedCourse.totalDuration}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    {selectedCourse.lessons.map((lesson, i) => (
                        <motion.div key={lesson.id}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                            onClick={() => !lesson.locked && setSelectedLesson(lesson)}
                            className="rounded-xl p-4 flex items-center gap-4 transition-all"
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.07)',
                                opacity: lesson.locked ? 0.5 : 1,
                                cursor: lesson.locked ? 'not-allowed' : 'pointer',
                            }}>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                style={{
                                    background: lesson.completed ? '#00C076' : 'rgba(255,255,255,0.06)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    color: lesson.completed ? '#fff' : 'rgba(255,255,255,0.4)',
                                }}>
                                {lesson.completed ? <CheckCircle size={16}/> : lesson.locked ? <Lock size={14}/> : <PlayCircle size={16}/>}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-[10px] font-black" style={{ color: 'rgba(255,255,255,0.3)' }}>Lesson {i + 1}</span>
                                    <span className="text-[7px] px-1.5 py-0.5 rounded font-black uppercase" style={{ background: LEVEL_COLORS[lesson.level] + '20', color: LEVEL_COLORS[lesson.level] }}>{lesson.level}</span>
                                </div>
                                <p className="text-[11px] font-black text-white">{lesson.title}</p>
                                <p className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{lesson.description}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[9px] font-mono flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.3)' }}><Clock size={9}/>{lesson.duration}</span>
                                <ChevronRight size={13} style={{ color: 'rgba(255,255,255,0.2)' }}/>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        );
    }

    // Main courses grid
    return (
        <div className="flex flex-col space-y-5 p-6">
            {/* Header */}
            <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(0,242,234,0.1)', border: '1px solid rgba(0,242,234,0.2)' }}>
                    <GraduationCap size={20} style={{ color: '#00F2EA' }}/>
                </div>
                <div>
                    <h2 className="text-sm font-black text-white uppercase tracking-widest">Whale Academy</h2>
                    <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Professional-grade crypto education · {COURSES.reduce((s, c) => s + c.lessons.length, 0)} lessons · {COURSES.length} courses</p>
                </div>
                <div className="ml-auto flex items-center gap-5">
                    {[
                        { label: 'Total Hours', value: '12h+', color: '#fff' },
                        { label: 'Courses', value: COURSES.length.toString(), color: '#627EEA' },
                        { label: 'Avg Rating', value: '4.9★', color: '#D4AF37' },
                    ].map((s, i) => (
                        <div key={i} className="text-center">
                            <div className="text-lg font-black font-mono" style={{ color: s.color }}>{s.value}</div>
                            <div className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {COURSES.map((course, i) => (
                    <motion.div key={course.id}
                        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                        onClick={() => setSelectedCourse(course)}
                        className="rounded-2xl overflow-hidden hover:scale-[1.02] hover:-translate-y-0.5 transition-all cursor-pointer"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        {/* Color stripe */}
                        <div className="h-1" style={{ background: course.color }}/>
                        <div className="p-5">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: course.color }}>
                                    {course.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <h3 className="text-[11px] font-black text-white truncate">{course.title}</h3>
                                        {course.badge && (
                                            <span className="text-[7px] px-1.5 py-0.5 rounded font-black uppercase shrink-0" style={{ background: 'rgba(212,175,55,0.12)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.25)' }}>{course.badge}</span>
                                        )}
                                    </div>
                                    <p className="text-[9px] leading-relaxed line-clamp-2" style={{ color: 'rgba(255,255,255,0.4)' }}>{course.description}</p>
                                </div>
                            </div>

                            {/* Progress */}
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                                    <div className="h-full rounded-full transition-all" style={{ width: `${course.progress}%`, background: course.color }}/>
                                </div>
                                <span className="text-[8px] font-black shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }}>{course.progress}%</span>
                            </div>

                            {/* Meta */}
                            <div className="flex items-center gap-4 text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                                <span className="flex items-center gap-1"><BookOpen size={10}/>{course.lessons.length} lessons</span>
                                <span className="flex items-center gap-1"><Clock size={10}/>{course.totalDuration}</span>
                                <span className="flex items-center gap-1" style={{ color: '#D4AF37' }}><Star size={10} className="fill-[#D4AF37]"/>4.9</span>
                            </div>

                            {/* Level badges */}
                            <div className="flex gap-1 mt-3">
                                {(['Beginner', 'Intermediate', 'Advanced'] as const).map(lvl => {
                                    const count = course.lessons.filter(l => l.level === lvl).length;
                                    return count > 0 ? (
                                        <span key={lvl} className="text-[7px] px-1.5 py-0.5 rounded font-black uppercase"
                                            style={{ background: LEVEL_COLORS[lvl] + '18', color: LEVEL_COLORS[lvl] }}>
                                            {count} {lvl}
                                        </span>
                                    ) : null;
                                })}
                            </div>
                        </div>
                        <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                            <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>
                                {course.lessons.filter(l => l.completed).length}/{course.lessons.length} completed
                            </span>
                            <span className="text-[9px] font-black text-white flex items-center gap-1">
                                {course.progress === 0 ? 'Start Course' : course.progress === 100 ? 'Review' : 'Continue'} <ChevronRight size={12}/>
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
