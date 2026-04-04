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

const COURSES: Course[] = [
    {
        id: 'whale-basics',
        title: 'Whale Intelligence Fundamentals',
        description: 'Learn how to identify and track institutional whale wallets, interpret on-chain signals, and build your first watchlist.',
        icon: <Globe size={24}/>, color: '#627EEA',
        totalDuration: '2h 30m', progress: 80, badge: 'Popular',
        lessons: [
            { id: 'w1', title: 'What is a Whale?', duration: '8m', level: 'Beginner', completed: true,  locked: false, description: 'Defining institutional wallets vs retail. Size thresholds and behavioral patterns.' },
            { id: 'w2', title: 'Reading On-Chain Data', duration: '15m', level: 'Beginner', completed: true,  locked: false, description: 'Understanding Etherscan, Solscan, block explorers. Interpreting transaction flows.' },
            { id: 'w3', title: 'Setting Up Your Watchlist', duration: '12m', level: 'Beginner', completed: true,  locked: false, description: 'Adding tokens and wallets. Configuring entry prices and alert thresholds.' },
            { id: 'w4', title: 'Whale Accumulation Signals', duration: '22m', level: 'Intermediate', completed: true,  locked: false, description: 'Identifying stealth accumulation patterns using large OTC transfers and exchange withdrawals.' },
            { id: 'w5', title: 'Smart Money vs Dumb Money', duration: '18m', level: 'Intermediate', completed: false, locked: false, description: 'Scoring algorithms for wallet intelligence. Win rate calculation and alpha decay.' },
            { id: 'w6', title: 'Building a SOVEREIGN NETWORK SYSTEM', duration: '25m', level: 'Advanced', completed: false, locked: true,  description: 'Multi-parameter alert rules. Webhook integration for real-time Telegram notifications.' },
        ],
    },
    {
        id: 'defi-mastery',
        title: 'DeFi & New Pairs Mastery',
        description: 'Master the art of detecting new liquidity pools, evaluating rug-pull risk, and timing entries with precision.',
        icon: <TrendingUp size={24}/>, color: '#00C076',
        totalDuration: '3h 15m', progress: 33, badge: 'New',
        lessons: [
            { id: 'd1', title: 'How DEXes Create New Pairs', duration: '10m', level: 'Beginner', completed: true,  locked: false, description: 'AMM mechanics, Uniswap V3, Raydium. Understanding liquidity pool creation events.' },
            { id: 'd2', title: 'Reading New Pairs Metrics', duration: '20m', level: 'Beginner', completed: true,  locked: false, description: 'MCap, Vol, Liquidity, Holder count, Sniper count — what each metric tells you.' },
            { id: 'd3', title: 'Rug Pull Detection', duration: '18m', level: 'Intermediate', completed: false, locked: false, description: 'Security score interpretation, honeypot checks, LP lock verification.' },
            { id: 'd4', title: 'Sniper & Insider Detection', duration: '22m', level: 'Intermediate', completed: false, locked: true,  description: 'Identifying coordinated buys in the first 30 seconds. Bot wallets vs genuine demand.' },
            { id: 'd5', title: 'Entry Timing Strategies', duration: '30m', level: 'Advanced', completed: false, locked: true,  description: 'Volume precursor analysis. Optimal entry windows after LP deployment.' },
            { id: 'd6', title: 'Portfolio Risk Management', duration: '25m', level: 'Advanced', completed: false, locked: true,  description: 'Position sizing for high-risk new pairs. Stop-loss mechanics in volatile DEX markets.' },
        ],
    },
    {
        id: 'api-terminal',
        title: 'API Terminal & Quant Tools',
        description: 'Access the full power of the Whalecosystem API to build custom bots, dashboards and trading strategies.',
        icon: <Code size={24}/>, color: '#9945FF',
        totalDuration: '4h 00m', progress: 0, badge: undefined,
        lessons: [
            { id: 'a1', title: 'API Authentication & Keys', duration: '8m', level: 'Beginner', completed: false, locked: false, description: 'Generating API keys, setting permissions. Rate-limit tiers explained.' },
            { id: 'a2', title: 'Market & New Pairs Endpoints', duration: '20m', level: 'Beginner', completed: false, locked: false, description: 'Querying new pairs feed, filtering by chain, security score, and volume.' },
            { id: 'a3', title: 'Watchlist & Alert Automation', duration: '22m', level: 'Intermediate', completed: false, locked: true,  description: 'POST/DELETE watchlist entries programmatically. Building automated alert triggers.' },
            { id: 'a4', title: 'Webhook & Telegram Integration', duration: '28m', level: 'Intermediate', completed: false, locked: true,  description: 'Configuring push notifications. Building a live monitoring Telegram bot in Node.js.' },
            { id: 'a5', title: 'Backtesting Whale Signals', duration: '40m', level: 'Advanced', completed: false, locked: true,  description: 'Using historical signals API to backtest entry strategies. Walk-forward optimization.' },
            { id: 'a6', title: 'Building a Trading Bot', duration: '45m', level: 'Advanced', completed: false, locked: true,  description: 'End-to-end: signal detection → position sizing → DEX execution with wagmi.' },
        ],
    },
    {
        id: 'portfolio-mgmt',
        title: 'Institutional Portfolio Management',
        description: 'Learn professional portfolio construction, risk analysis, and performance attribution used by crypto funds.',
        icon: <BarChart2 size={24}/>, color: '#D4AF37',
        totalDuration: '2h 45m', progress: 0, badge: 'Pro',
        lessons: [
            { id: 'p1', title: 'Portfolio Construction Basics', duration: '15m', level: 'Beginner', completed: false, locked: false, description: 'Asset allocation frameworks. Diversification across chains, sectors, and market caps.' },
            { id: 'p2', title: 'Risk Metrics Deep Dive', duration: '20m', level: 'Intermediate', completed: false, locked: false, description: 'Sharpe ratio, max drawdown, volatility-adjusted returns. Whale concentration risk.' },
            { id: 'p3', title: 'On-Chain Portfolio Tracking', duration: '18m', level: 'Intermediate', completed: false, locked: true,  description: 'Syncing live positions. Unrealized/realized PnL. Cost-basis tracking across wallets.' },
            { id: 'p4', title: 'Institutional Reporting', duration: '22m', level: 'Advanced', completed: false, locked: true,  description: 'Generating tax reports, performance attribution. Fund-grade accounting standards.' },
        ],
    },
];

const LEVEL_COLORS = { Beginner: '#00C076', Intermediate: '#FF9500', Advanced: '#FF3B30' };

export function WhaleAcademy() {
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

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
                        <button className="flex-1 py-3 bg-[#050505] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#050505]/85 transition-colors flex items-center justify-center gap-2">
                            <CheckCircle size={14}/> Mark Complete
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
