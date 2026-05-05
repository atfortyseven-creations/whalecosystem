"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Ticket, Wallet,
  Globe, LayoutDashboard, Compass,
  Book, Network, BookOpen, Landmark,
  Newspaper, Shield, Lock, Database, MessageSquare,
  Command
} from "lucide-react";

// ── Only the routes that actually exist in SIDEBAR_ITEMS ──────────────────────
const PAGES = [
  // ── Overview ──
  { id: "gold",          label: "Ticket Mint",     group: "Overview",       icon: <Ticket size={15} /> },
  { id: "portfolio",     label: "Main Portfolio",  group: "Overview",       icon: <Wallet size={15} /> },

  // ── Intelligence ──
  { id: "market-data",   label: "Market Data",     group: "Intelligence",   icon: <Globe size={15} /> },
  { id: "markets",       label: "Top Markets",     group: "Intelligence",   icon: <LayoutDashboard size={15} /> },
  { id: "newpairs",      label: "New Listings",    group: "Intelligence",   icon: <Search size={15} /> },
  { id: "graph",         label: "Entity Graph",    group: "Intelligence",   icon: <Compass size={15} /> },

  // ── On-Chain Intel ──
  { id: "inst-ledger",   label: "Whale Ledger",    group: "On-Chain Intel", icon: <Book size={15} /> },
  { id: "mass-transfer", label: "Mass Transfers",  group: "On-Chain Intel", icon: <Network size={15} /> },
  { id: "omniexplorer",  label: "Block Explorer",  group: "On-Chain Intel", icon: <Search size={15} /> },
  { id: "defi",          label: "DeFi Yields",     group: "On-Chain Intel", icon: <Landmark size={15} /> },

  // ── Sovereign Intel ──
  { id: "news",          label: "News",            group: "Sovereign Intel", icon: <Newspaper size={15} />, external: true },
  { id: "sov-intel",     label: "Sovereign Intel", group: "Sovereign Intel", icon: <BookOpen size={15} />,  external: true },
  { id: "zk",            label: "Aztec Pipeline",  group: "Sovereign Intel", icon: <Shield size={15} /> },

  // ── Execution ──
  { id: "vault",         label: "Sovereign Vault", group: "Execution",      icon: <Lock size={15} /> },

  // ── System ──
  { id: "logs",          label: "Session Logs",    group: "System",         icon: <Database size={15} /> },
  { id: "support",       label: "Support",         group: "System",         icon: <MessageSquare size={15} /> },
];

const GROUPS = ["Overview", "Intelligence", "On-Chain Intel", "Sovereign Intel", "Execution", "System"];

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

  // ── Keyboard shortcuts ──────────────────────────────────────────────────────
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

  // ── Keyboard navigation ─────────────────────────────────────────────────────
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
            transition={{ duration: 0.12 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[9999]"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="fixed inset-0 pointer-events-none flex items-start justify-center pt-[10vh] z-[10000]">
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -10 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto w-full max-w-md bg-white border border-[#E8E8E8] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12),0_4px_16px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col"
              onClick={e => e.stopPropagation()}
              style={{ maxHeight: "72vh" }}
            >
              {/* Search Input */}
              <div className="flex items-center px-4 py-3 border-b border-[#F0F0F0] gap-3 shrink-0">
                <Search size={14} className="text-[#050505]/25 shrink-0" />
                <input
                  autoFocus
                  className="flex-1 bg-transparent border-none outline-none text-[#050505] placeholder:text-[#050505]/25 text-[13px] font-medium"
                  placeholder="Go to..."
                  value={query}
                  onChange={e => { setQuery(e.target.value); setCursor(0); }}
                />
                <kbd className="text-[9px] font-black font-mono text-[#050505]/20 bg-[#050505]/[0.04] border border-[#050505]/[0.07] rounded px-1.5 py-0.5 leading-none shrink-0">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="flex-1 overflow-y-auto py-1.5 no-scrollbar">
                {groupedView ? (
                  GROUPS.map(group => {
                    const items = PAGES.filter(p => p.group === group);
                    if (!items.length) return null;
                    return (
                      <div key={group} className="mb-0.5">
                        <div className="px-4 pt-3 pb-1">
                          <span className="text-[9px] font-black uppercase tracking-[0.22em] text-[#050505]/20">
                            {group}
                          </span>
                        </div>
                        {items.map(page => (
                          <button
                            key={page.id}
                            onClick={() => { onTabChange(page.id); setIsOpen(false); }}
                            className="w-full flex items-center justify-between px-4 py-2 hover:bg-[#050505]/[0.03] text-left transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-[#050505]/30 group-hover:text-[#050505]/55 transition-colors">
                                {page.icon}
                              </span>
                              <span className="text-[12.5px] font-medium text-[#050505]/65 group-hover:text-[#050505] transition-colors">
                                {page.label}
                              </span>
                            </div>
                            {(page as any).external && (
                              <span className="text-[9px] text-[#050505]/15 mr-1">↗</span>
                            )}
                          </button>
                        ))}
                      </div>
                    );
                  })
                ) : (
                  filtered.length > 0 ? (
                    filtered.map((page, i) => (
                      <button
                        key={page.id}
                        onClick={() => { onTabChange(page.id); setIsOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                          i === cursor ? "bg-[#050505]/[0.05]" : "hover:bg-[#050505]/[0.03]"
                        }`}
                      >
                        <span className="text-[#050505]/30">{page.icon}</span>
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="text-[12.5px] font-medium text-[#050505]/80 truncate">
                            {page.label}
                          </span>
                          <span className="text-[8.5px] font-black uppercase tracking-widest text-[#050505]/20">
                            {page.group}
                          </span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-10 text-center">
                      <span className="text-[11px] font-medium text-[#050505]/25">
                        No results for &ldquo;{query}&rdquo;
                      </span>
                    </div>
                  )
                )}
              </div>

              {/* Footer hints */}
              <div className="shrink-0 px-4 py-2 border-t border-[#F0F0F0] flex items-center justify-between bg-[#FAFAFA]">
                <div className="flex items-center gap-3 text-[8px] font-black uppercase tracking-widest text-[#050505]/20">
                  <span className="flex items-center gap-1">
                    <kbd className="bg-white border border-[#E5E5E5] rounded px-1 py-0.5 text-[7.5px] leading-none">↑↓</kbd>
                    Navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="bg-white border border-[#E5E5E5] rounded px-1 py-0.5 text-[7.5px] leading-none">↵</kbd>
                    Open
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-[#050505]/15">
                  <Command size={9} />
                  <span>K</span>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
