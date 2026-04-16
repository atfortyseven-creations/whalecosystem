"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Monitor, Terminal, Map, Shield, DollarSign,
  Landmark, Network, Zap, Rocket, TrendingUp, Star,
  Newspaper, Wallet, Lock, Database, FlaskConical,
  BarChart3, Ticket, Compass, Layers, Book, HeadphonesIcon,
  Activity, Globe
} from "lucide-react";

// ── Full tab registry — all 22 routes ─────────────────────────────────────────
const PAGES = [
  // ── Command ──
  { id: "dashboard",            label: "The Terminal",         group: "Command",      icon: <Monitor size={15} /> },
  { id: "news",                 label: "The Whale Post",        group: "Command",      icon: <Newspaper size={15} /> },
  { id: "watchlist",            label: "Watchlist Pro",         group: "Command",      icon: <Star size={15} /> },
  { id: "gold-ticket",          label: "Ticket Minting",        group: "Command",      icon: <Ticket size={15} /> },

  // ── Markets ──
  { id: "whale-events",         label: "Mempool Radar",         group: "Markets",      icon: <Globe size={15} /> },
  { id: "gainers",              label: "Gainers & Losers",      group: "Markets",      icon: <TrendingUp size={15} /> },
  { id: "new-pairs",            label: "Token Discovery",       group: "Markets",      icon: <Rocket size={15} /> },
  { id: "omni-explorer",        label: "Omni Explorer",         group: "Markets",      icon: <Compass size={15} /> },
  { id: "brc-explorer",         label: "BRC-20 Explorer",       group: "Markets",      icon: <Layers size={15} /> },

  // ── Intelligence ──
  { id: "neural-graph",         label: "Entity Graph",          group: "Intelligence", icon: <Network size={15} /> },
  { id: "sovereign-intel",      label: "Voss Matrix",           group: "Intelligence", icon: <Zap size={15} /> },
  { id: "institutional-ledger", label: "Institutional Ledger",  group: "Intelligence", icon: <Landmark size={15} /> },
  { id: "mass-transfer",        label: "Mass Transfer Intel",   group: "Intelligence", icon: <Activity size={15} /> },
  { id: "defi-yield",           label: "DeFi Yield Optimizer",  group: "Intelligence", icon: <FlaskConical size={15} /> },
  { id: "polymarket",           label: "Polymarket Oracle",     group: "Intelligence", icon: <BarChart3 size={15} /> },

  // ── Sovereignty ──
  { id: "portfolio",            label: "Akashic Vault",         group: "Sovereignty",  icon: <Wallet size={15} /> },
  { id: "sovereign-vault",      label: "Sovereign Vault",       group: "Sovereignty",  icon: <Lock size={15} /> },
  { id: "zk-shield",            label: "ZK Shield Station",     group: "Sovereignty",  icon: <Shield size={15} /> },
  { id: "whale-portfolio",      label: "Whale Portfolio",       group: "Sovereignty",  icon: <Database size={15} /> },
  { id: "humanidfi-portfolio",  label: "HumanID Portfolio",     group: "Sovereignty",  icon: <Shield size={15} /> },

  // ── Learn ──
  { id: "academy",              label: "Whale Academy",         group: "Learn",        icon: <Book size={15} /> },
  { id: "support",              label: "Support",               group: "Learn",        icon: <HeadphonesIcon size={15} /> },
];

const GROUPS = ["Command", "Markets", "Intelligence", "Sovereignty", "Learn"];

export function GlobalCommandPalette({
  isOpen,
  setIsOpen,
  onTabChange
}: {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  onTabChange: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);

  // ── Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
      if (e.key === "Escape" && isOpen) setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setIsOpen]);

  useEffect(() => {
    if (!isOpen) { setQuery(""); setCursor(0); }
  }, [isOpen]);

  const filtered = query
    ? PAGES.filter(p =>
        p.label.toLowerCase().includes(query.toLowerCase()) ||
        p.group.toLowerCase().includes(query.toLowerCase()) ||
        p.id.toLowerCase().includes(query.toLowerCase())
      )
    : PAGES;

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setCursor(c => Math.min(c + 1, filtered.length - 1)); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)); }
      if (e.key === "Enter" && filtered[cursor]) {
        onTabChange(filtered[cursor].id);
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [isOpen, filtered, cursor, onTabChange, setIsOpen]);

  // Grouped view (no query) vs flat view (query active)
  const groupedView = !query;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9999]"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="fixed inset-0 pointer-events-none flex items-start justify-center pt-[12vh] z-[10000]">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -16 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto w-full max-w-lg bg-white border border-[#E5E5E5] rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.18)] overflow-hidden flex flex-col"
              onClick={e => e.stopPropagation()}
              style={{ maxHeight: "70vh" }}
            >
              {/* Search Input */}
              <div className="flex items-center px-4 py-3.5 border-b border-[#E5E5E5] gap-3 shrink-0">
                <Search size={16} className="text-[#050505]/30 shrink-0" />
                <input
                  autoFocus
                  className="flex-1 bg-transparent border-none outline-none text-[#050505] placeholder:text-[#050505]/25 text-[14px] font-medium"
                  placeholder="Search sections, modules, actions..."
                  value={query}
                  onChange={e => { setQuery(e.target.value); setCursor(0); }}
                />
                <span className="text-[9px] font-black text-[#050505]/25 uppercase tracking-widest bg-[#050505]/5 px-2 py-1 rounded-lg shrink-0">ESC</span>
              </div>

              {/* Results */}
              <div className="flex-1 overflow-y-auto p-2 no-scrollbar">
                {groupedView ? (
                  // Grouped display
                  GROUPS.map(group => {
                    const items = PAGES.filter(p => p.group === group);
                    return (
                      <div key={group} className="mb-1">
                        <div className="px-3 py-1.5">
                          <span className="text-[8px] font-black uppercase tracking-[0.25em] text-[#050505]/25">{group}</span>
                        </div>
                        {items.map(page => (
                          <button
                            key={page.id}
                            onClick={() => { onTabChange(page.id); setIsOpen(false); }}
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#050505]/[0.04] text-left transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-[#050505]/35 group-hover:text-[#050505]/70 transition-colors">{page.icon}</span>
                              <span className="text-[13px] font-semibold text-[#050505]/80 group-hover:text-[#050505] transition-colors">{page.label}</span>
                            </div>
                            <span className="text-[9px] uppercase font-black text-[#050505]/20 tracking-widest">→</span>
                          </button>
                        ))}
                      </div>
                    );
                  })
                ) : (
                  // Flat filtered results
                  filtered.length > 0 ? (
                    filtered.map((page, i) => (
                      <button
                        key={page.id}
                        onClick={() => { onTabChange(page.id); setIsOpen(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors group ${
                          i === cursor ? "bg-[#050505]/[0.06]" : "hover:bg-[#050505]/[0.04]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-[#050505]/35 group-hover:text-[#050505]/70 transition-colors">{page.icon}</span>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[13px] font-semibold text-[#050505]/80 group-hover:text-[#050505] transition-colors">{page.label}</span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#050505]/25">{page.group}</span>
                          </div>
                        </div>
                        <span className="text-[9px] uppercase font-black text-[#050505]/20 tracking-widest">→</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-10 text-center">
                      <span className="text-[12px] font-black uppercase tracking-widest text-[#050505]/25">No results for "{query}"</span>
                    </div>
                  )
                )}
              </div>

              {/* Footer hint */}
              <div className="shrink-0 px-4 py-2.5 border-t border-[#E5E5E5] flex items-center justify-between">
                <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-[#050505]/25">
                  <span>↑↓ Navigate</span>
                  <span>↵ Open</span>
                  <span>ESC Close</span>
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-[#050505]/20">
                  {PAGES.length} modules
                </span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
