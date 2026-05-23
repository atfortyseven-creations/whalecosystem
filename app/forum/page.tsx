"use client";

import React, { useEffect, useState, useCallback, Suspense, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatDistanceToNowStrict } from 'date-fns';
import { SystemFooter } from '@/components/landing/SystemFooter';
import { WhaleChatLink } from '@/components/shared/WhaleChatLink';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Hash, ChevronRight, MessageSquare, Eye, ThumbsUp,
  Clock, TrendingUp, Flame, Star, Filter, Bell, Settings, Users,
  BarChart2, Shield, Zap, Globe, Code, Bug, Radio, Activity,
  X, ArrowRight, Bookmark, Share2, MoreHorizontal, Layers
} from 'lucide-react';

// ─── Category Metadata ────────────────────────────────────────────────────────
const CATEGORY_META: Record<string, { icon: React.ReactNode; color: string; bg: string; ring: string }> = {
  'whale-network':  { icon: <Activity size={14} />,     color: '#050505', bg: 'bg-black',        ring: 'ring-black/20' },
  'general':        { icon: <Globe size={14} />,         color: '#0088cc', bg: 'bg-[#0088cc]',   ring: 'ring-blue-200' },
  'applications':   { icon: <Layers size={14} />,        color: '#00C076', bg: 'bg-emerald-500', ring: 'ring-emerald-200' },
  'testnets':       { icon: <Radio size={14} />,         color: '#F59E0B', bg: 'bg-amber-500',   ring: 'ring-amber-200' },
  'noir':           { icon: <Shield size={14} />,        color: '#7C3AED', bg: 'bg-violet-600',  ring: 'ring-violet-200' },
  'site-feedback':  { icon: <Bug size={14} />,           color: '#64748B', bg: 'bg-slate-500',   ring: 'ring-slate-200' },
  'qds-connect':    { icon: <Zap size={14} />,           color: '#EC4899', bg: 'bg-pink-500',    ring: 'ring-pink-200' },
};

const FILTER_TABS = [
  { id: 'categories', label: 'Categories',  icon: <Hash size={13} /> },
  { id: 'latest',     label: 'Latest',      icon: <Clock size={13} /> },
  { id: 'new',        label: 'New',         icon: <Star size={13} /> },
  { id: 'unread',     label: 'Unread',      icon: <Eye size={13} /> },
  { id: 'top',        label: 'Top',         icon: <TrendingUp size={13} /> },
];

// ─── Search Modal ─────────────────────────────────────────────────────────────
function SearchModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/forum/topics?search=${encodeURIComponent(query)}&limit=8`);
        const data = await r.json();
        if (Array.isArray(data)) setResults(data);
      } catch {} finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[680px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
            <Search size={18} className="text-slate-400 shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search discussions, topics, categories…"
              className="flex-1 text-[15px] text-slate-900 placeholder-slate-400 outline-none bg-transparent"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            )}
            <button onClick={onClose} className="ml-1 text-slate-400 hover:text-slate-600 text-[11px] font-mono uppercase tracking-wider px-2 py-1 border border-slate-200 rounded">
              Esc
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[420px] overflow-y-auto">
            {loading ? (
              <div className="py-8 text-center text-slate-400 text-sm">Searching…</div>
            ) : results.length > 0 ? (
              <div className="py-2">
                <p className="px-5 py-2 text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">Results</p>
                {results.map(topic => (
                  <button
                    key={topic.id}
                    onClick={() => { router.push(`/forum/t/${topic.id}`); onClose(); }}
                    className="w-full flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[11px] font-bold text-slate-500 shrink-0 uppercase">
                      {topic.author?.walletAddress?.slice(2, 4) || '??'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-slate-900 truncate">{topic.title}</p>
                      {topic.category && (
                        <p className="text-[12px] text-slate-400">{topic.category.name}</p>
                      )}
                    </div>
                    <ArrowRight size={14} className="text-slate-300 shrink-0" />
                  </button>
                ))}
              </div>
            ) : query ? (
              <div className="py-12 text-center">
                <p className="text-slate-500 text-[14px]">No results for <strong>"{query}"</strong></p>
                <p className="text-slate-400 text-[12px] mt-1">Try a different keyword or start a new topic.</p>
              </div>
            ) : (
              <div className="py-8 px-5">
                <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold mb-3">Quick Links</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Latest Topics', href: '/forum?filter=latest', icon: <Clock size={13} /> },
                    { label: 'Unread Discussions', href: '/forum?filter=unread', icon: <Eye size={13} /> },
                    { label: 'New Posts', href: '/forum?filter=new', icon: <Star size={13} /> },
                    { label: 'Top Topics', href: '/forum?filter=top', icon: <TrendingUp size={13} /> },
                  ].map(link => (
                    <Link key={link.label} href={link.href} onClick={onClose}
                      className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors text-[13px] text-slate-600">
                      <span className="text-slate-400">{link.icon}</span>
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer hint */}
          <div className="px-5 py-3 border-t border-slate-100 flex items-center gap-4 bg-slate-50/50">
            <span className="text-[11px] text-slate-400 font-mono">@ to filter by author</span>
            <span className="text-[11px] text-slate-400 font-mono"># to filter by category</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Hamburger Menu ───────────────────────────────────────────────────────────
function HamburgerMenu({ categories, onClose }: { categories: any[]; onClose: () => void }) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const menuLinks = [
    { label: 'All Topics',    href: '/forum?filter=latest', icon: <MessageSquare size={16} /> },
    { label: 'My Posts',      href: '/forum/u/me',          icon: <Bookmark size={16} /> },
    { label: 'Users',         href: '/forum/users',         icon: <Users size={16} /> },
    { label: 'Guidelines',    href: '/forum/guidelines',    icon: <Shield size={16} /> },
    { label: 'Badges',        href: '/forum/badges',        icon: <Star size={16} /> },
    { label: 'Groups',        href: '/forum/groups',        icon: <BarChart2 size={16} /> },
    { label: 'Anniversaries', href: '/forum/anniversaries', icon: <Activity size={16} /> },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[150] bg-black/20 backdrop-blur-[2px]"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, x: 20, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 20, scale: 0.96 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-[54px] right-4 w-[380px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        >
          {/* Main links grid */}
          <div className="p-4 grid grid-cols-2 gap-1">
            {menuLinks.map(link => (
              <Link key={link.label} href={link.href} onClick={onClose}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-[13px] text-slate-700 font-medium">
                <span className="text-slate-400">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="border-t border-slate-100 px-4 pt-3 pb-1">
            <p className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Categories</p>
            <div className="grid grid-cols-2 gap-1">
              {categories.map(cat => {
                const meta = CATEGORY_META[cat.slug] || { icon: <Hash size={14} />, color: '#64748B', bg: 'bg-slate-500', ring: 'ring-slate-200' };
                return (
                  <Link key={cat.id} href={`/forum/c/${cat.slug}`} onClick={onClose}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors text-[13px] text-slate-700 font-medium">
                    <span className={`w-3 h-3 rounded-sm ${meta.bg} shrink-0`} style={{ background: meta.color }} />
                    {cat.name}
                  </Link>
                );
              })}
              <Link href="/forum" onClick={onClose}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors text-[13px] text-slate-500 col-span-1">
                <Hash size={13} />
                All categories
              </Link>
            </div>
          </div>

          <div className="border-t border-slate-100 px-4 pt-3 pb-3 mt-1">
            <p className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Tags</p>
            <div className="flex flex-wrap gap-2">
              {['noir', 'zk-proof', 'aztec', 'whale', 'defi', 'testnet', 'specs'].map(tag => (
                <Link key={tag} href={`/forum/tags/${tag}`} onClick={onClose}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[12px] hover:bg-slate-200 transition-colors">
                  <Hash size={10} />
                  {tag}
                </Link>
              ))}
              <Link href="/forum/tags" onClick={onClose}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-400 text-[12px] hover:bg-slate-200 transition-colors">
                All tags
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 px-4 py-3 flex items-center justify-between bg-slate-50/50">
            <Link href="/forum/new" onClick={onClose}
              className="inline-flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-slate-800 transition-colors">
              <Plus size={13} />
              New Topic
            </Link>
            <Link href="/forum/settings" onClick={onClose}
              className="inline-flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-slate-800 transition-colors">
              <Settings size={13} />
              Settings
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Category Card ────────────────────────────────────────────────────────────
function CategoryCard({ cat, index }: { cat: any; index: number }) {
  const meta = CATEGORY_META[cat.slug] || { icon: <Hash size={14} />, color: '#64748B', bg: 'bg-slate-500', ring: 'ring-slate-200' };
  const latest = cat.topics?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/forum/c/${cat.slug}`}
        className="group flex flex-col h-full bg-white border border-slate-200 rounded-2xl p-6 hover:border-slate-300 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
              style={{ background: meta.color }}
            >
              {meta.icon}
            </div>
            <div>
              <h3 className="font-bold text-[16px] text-slate-900 group-hover:text-slate-700 transition-colors leading-tight">
                {cat.name}
              </h3>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                {cat._count?.topics ?? 0} topics
              </span>
            </div>
          </div>
          <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center transition-colors">
            <ChevronRight size={14} className="text-slate-400" />
          </div>
        </div>

        {/* Description */}
        {cat.description && (
          <p className="text-[13px] text-slate-500 leading-relaxed flex-1 mb-4 line-clamp-2">
            {cat.description}
          </p>
        )}

        {/* Latest post */}
        {latest ? (
          <div className="pt-3 border-t border-slate-100">
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-300 mb-1 font-bold">Latest</p>
            <p className="text-[12px] text-slate-500 truncate leading-snug">{latest.title}</p>
          </div>
        ) : (
          <div className="pt-3 border-t border-slate-100">
            <p className="text-[12px] text-slate-300 italic">No topics yet — be the first!</p>
          </div>
        )}
      </Link>
    </motion.div>
  );
}

// ─── Topic Row ────────────────────────────────────────────────────────────────
function TopicRow({ topic, mounted }: { topic: any; mounted: boolean }) {
  const meta = CATEGORY_META[topic.category?.slug] || { color: '#64748B', bg: 'bg-slate-400' };
  const activity = mounted
    ? formatDistanceToNowStrict(new Date(topic.updatedAt || topic.createdAt), { addSuffix: false })
        .replace(' minutes', 'm').replace(' minute', 'm')
        .replace(' hours', 'h').replace(' hour', 'h')
        .replace(' days', 'd').replace(' day', 'd')
        .replace(' months', 'mo').replace(' month', 'mo')
    : '';

  return (
    <Link
      href={`/forum/t/${topic.id}`}
      className="group flex items-center justify-between py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors px-3 -mx-3 rounded-xl gap-4"
    >
      {/* Left: avatar + info */}
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-black text-white shrink-0 uppercase shadow-sm"
          style={{ background: meta.color }}>
          {topic.author?.walletAddress?.slice(2, 4) || '??'}
        </div>

        <div className="flex flex-col min-w-0 gap-1">
          <span className="font-medium text-[15px] text-slate-900 group-hover:text-slate-700 transition-colors truncate leading-tight">
            {topic.title}
          </span>
          <div className="flex items-center gap-2">
            {topic.category && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: meta.color }} />
                {topic.category.name}
              </span>
            )}
            {topic.isPinned && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-500">
                <Star size={10} fill="currentColor" /> Pinned
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: stats */}
      <div className="flex items-center gap-5 shrink-0 text-slate-400">
        <div className="hidden sm:flex flex-col items-center min-w-[32px]">
          <span className="text-[14px] font-bold text-slate-700 leading-none">{topic._count?.posts || 0}</span>
          <span className="text-[10px] font-mono uppercase tracking-wider opacity-60">rep</span>
        </div>
        <div className="hidden md:flex flex-col items-center min-w-[32px]">
          <span className="text-[14px] font-medium leading-none">{topic._count?.likes || topic.likeCount || 0}</span>
          <span className="text-[10px] font-mono uppercase tracking-wider opacity-60">likes</span>
        </div>
        <div className="flex flex-col items-end min-w-[36px]">
          <span className="text-[13px] text-slate-400 leading-none">{activity}</span>
        </div>
      </div>
    </Link>
  );
}


// ─── Main Forum Content ───────────────────────────────────────────────────────
function ForumHomeContent() {
  const [topics, setTopics]         = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false);
  const [isMounted, setIsMounted]   = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawFilter = searchParams.get('filter');
  const activeTab = rawFilter || 'categories';

  useEffect(() => {
    setIsMounted(true);
    // Keyboard shortcut for search
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true); }
      if (e.key === 'Escape') { setSearchOpen(false); setMenuOpen(false); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [topicsRes, catsRes] = await Promise.all([
        fetch(`/api/forum/topics?limit=40&filter=${activeTab === 'categories' ? 'latest' : activeTab}`),
        fetch('/api/forum/categories'),
      ]);
      const [topicsData, catsData] = await Promise.all([topicsRes.json(), catsRes.json()]);
      if (Array.isArray(topicsData)) setTopics(topicsData);
      if (Array.isArray(catsData)) setCategories(catsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <div className="flex-1 flex flex-col bg-[#FAFAF9] text-slate-900 w-full min-h-screen">

      {/* ── Secondary Sub-nav (Discourse-style) ── */}
      <div className="w-full bg-white border-b border-slate-200 sticky top-0 z-[100] shadow-sm">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 flex items-center justify-between h-[52px]">

          {/* Left: Filter tabs */}
          <div className="flex items-center gap-0 h-full overflow-x-auto no-scrollbar">
            {FILTER_TABS.map(tab => {
              const isActive = activeTab === tab.id || (tab.id === 'categories' && !rawFilter);
              return (
                <Link
                  key={tab.id}
                  href={tab.id === 'categories' ? '/forum' : `/forum?filter=${tab.id}`}
                  className={`flex items-center gap-1.5 h-full px-4 text-[13px] font-medium whitespace-nowrap border-b-2 transition-colors ${
                    isActive
                      ? 'border-[#0088cc] text-[#0088cc]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span className="hidden sm:block opacity-70">{tab.icon}</span>
                  {tab.label}
                </Link>
              );
            })}
          </div>

          {/* Right: Action icons */}
          <div className="flex items-center gap-3 shrink-0 ml-4">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors text-slate-500 hover:text-slate-700"
              title="Search (⌘K)"
            >
              <Search size={14} />
              <span className="hidden sm:block text-[12px] font-mono text-slate-400">⌘K</span>
            </button>

            {/* New Topic */}
            <Link
              href="/forum/new"
              className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#0088cc] text-white text-[12px] font-bold hover:bg-[#0077b3] transition-colors shadow-sm"
            >
              <Plus size={13} />
              New Topic
            </Link>

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(v => !v)}
              className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${menuOpen ? 'bg-slate-200 text-slate-700' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'}`}
              title="Menu"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Page Content ── */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-10 flex flex-col gap-10">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[28px] md:text-[36px] font-black tracking-tight text-slate-900 leading-none mb-2">Forum</h1>
            <p className="text-[14px] text-slate-500 font-medium">A structured space for discussion, ideas, and knowledge sharing.</p>
          </div>
          <div className="flex flex-col gap-3">
          </div>
        </div>

        {/* ── CATEGORIES VIEW ── */}
        {activeTab === 'categories' && (
          <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">

            {/* Category Grid */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-black text-[11px] uppercase tracking-[0.2em] text-slate-400">All Categories</h2>
                <span className="text-[11px] text-slate-300 font-mono">{categories.length} categories</span>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="h-40 bg-white rounded-2xl border border-slate-200 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {categories.map((cat, i) => <CategoryCard key={cat.id} cat={cat} index={i} />)}
                </div>
              )}
            </div>

            {/* Right Panel: Latest Topics */}
            <div className="w-full lg:w-[360px] xl:w-[400px] shrink-0">
              <div className="sticky top-[72px]">
                <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-[#0088cc]">
                  <h2 className="text-[13px] font-bold text-[#0088cc] uppercase tracking-wide flex items-center gap-2">
                    <Clock size={13} /> Latest
                  </h2>
                  <Link href="/forum?filter=latest" className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors">
                    See all →
                  </Link>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-14 animate-pulse bg-slate-50" />
                    ))
                  ) : topics.slice(0, 10).map(topic => (
                    <Link
                      key={topic.id}
                      href={`/forum/t/${topic.id}`}
                      className="group flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                    >
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black text-white shrink-0"
                        style={{ background: CATEGORY_META[topic.category?.slug]?.color || '#64748B' }}
                      >
                        {topic.author?.walletAddress?.slice(2, 4) || '??'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-slate-700 group-hover:text-slate-900 truncate transition-colors">
                          {topic.title}
                        </p>
                      </div>
                      <span className="text-[11px] text-slate-400 shrink-0 font-mono">{topic._count?.posts || 0}</span>
                    </Link>
                  ))}
                  {topics.length === 0 && !loading && (
                    <div className="py-10 text-center text-slate-400 text-[13px]">No topics yet.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TOPICS LIST VIEW ── */}
        {activeTab !== 'categories' && (
          <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">

            {/* Topics feed */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-black text-[11px] uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                  {FILTER_TABS.find(t => t.id === activeTab)?.icon}
                  {FILTER_TABS.find(t => t.id === activeTab)?.label} Topics
                </h2>
                <Link href="/forum/new"
                  className="sm:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0088cc] text-white text-[11px] font-bold">
                  <Plus size={11} /> New
                </Link>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 px-4 py-2 divide-y divide-slate-100">
                {/* Column headers */}
                <div className="grid grid-cols-[1fr_auto] gap-4 py-2 text-[10px] font-mono font-black uppercase tracking-widest text-slate-300">
                  <span>Topic</span>
                  <span className="flex items-center gap-5 shrink-0">
                    <span className="w-8 text-center">Rep</span>
                    <span className="w-8 text-center hidden md:block">Likes</span>
                    <span className="w-9 text-right">Age</span>
                  </span>
                </div>

                {loading ? (
                  Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="h-14 animate-pulse bg-slate-50 rounded-lg my-1" />
                  ))
                ) : topics.length === 0 ? (
                  <div className="py-20 flex flex-col items-center gap-4 text-center">
                    <MessageSquare size={32} className="text-slate-200" />
                    <p className="text-[14px] text-slate-400">No discussions here yet.</p>
                    <Link href="/forum/new"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0088cc] text-white text-[13px] font-bold hover:bg-[#0077b3] transition-colors">
                      <Plus size={14} />
                      Start a Discussion
                    </Link>
                  </div>
                ) : topics.map(topic => (
                  <TopicRow key={topic.id} topic={topic} mounted={isMounted} />
                ))}
              </div>
            </div>

            {/* Right sidebar: Categories quick-nav */}
            <div className="w-full lg:w-[280px] shrink-0">
              <div className="sticky top-[72px]">
                <h2 className="font-black text-[11px] uppercase tracking-[0.2em] text-slate-400 mb-4">Categories</h2>
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  {categories.map((cat, i) => {
                    const meta = CATEGORY_META[cat.slug] || { color: '#64748B', icon: <Hash size={13} /> };
                    return (
                      <Link key={cat.id} href={`/forum/c/${cat.slug}`}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 group">
                        <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: meta.color }} />
                        <span className="flex-1 text-[13px] font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{cat.name}</span>
                        <span className="text-[12px] font-mono text-slate-300">{cat._count?.topics ?? 0}</span>
                      </Link>
                    );
                  })}
                </div>

                {/* New topic CTA */}
                <Link href="/forum/new"
                  className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#0088cc] text-white text-[12px] font-bold hover:bg-[#0077b3] transition-colors shadow-sm">
                  <Plus size={14} />
                  Start a New Discussion
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
      {menuOpen && <HamburgerMenu categories={categories} onClose={() => setMenuOpen(false)} />}

      <WhaleChatLink />
      <SystemFooter />
    </div>
  );
}

export default function ForumHomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAF9]" />}>
      <ForumHomeContent />
    </Suspense>
  );
}
