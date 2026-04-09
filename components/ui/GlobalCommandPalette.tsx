"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Monitor, Terminal, Map, Shield, DollarSign } from "lucide-react";
import { useTheme } from "next-themes";

const PAGES = [
    { id: "dashboard", label: "Markets Dashboard", icon: <Monitor size={16} /> },
    { id: "watchlist", label: "Watchlist Pro", icon: <DollarSign size={16} /> },
    { id: "whale-portfolio", label: "Whale Intelligence", icon: <Terminal size={16} /> },
    { id: "zk-shield", label: "ZK Shield Station", icon: <Shield size={16} /> },
    { id: "omni-explorer", label: "Aztec Explorer", icon: <Map size={16} /> },
];

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
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                setIsOpen(!isOpen);
            }
            if (e.key === "Escape" && isOpen) {
                setIsOpen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, setIsOpen]);

    // Reset query when closed
    useEffect(() => {
        if (!isOpen) setQuery("");
    }, [isOpen]);

    const filteredPages = PAGES.filter(p => p.label.toLowerCase().includes(query.toLowerCase()));

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-sm z-[9999]"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="fixed inset-0 pointer-events-none flex items-start justify-center pt-[15vh] z-[10000]">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className="pointer-events-auto w-full max-w-xl bg-white dark:bg-[#111111] border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center px-4 py-4 border-b border-black/5 dark:border-white/5">
                                <Search size={20} className="text-[#888888] mr-3" />
                                <input
                                    autoFocus
                                    className="flex-1 bg-transparent border-none outline-none text-black dark:text-white placeholder:text-[#888888] text-lg font-mono"
                                    placeholder="Jump to route or search..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                                <span className="text-[10px] font-mono text-[#888888] uppercase bg-black/5 dark:bg-white/5 px-2 py-1 rounded">ESC</span>
                            </div>

                            <div className="max-h-[60vh] overflow-y-auto p-2">
                                {filteredPages.length > 0 ? (
                                    filteredPages.map((page, index) => (
                                        <button
                                            key={page.id}
                                            onClick={() => {
                                                onTabChange(page.id);
                                                setIsOpen(false);
                                            }}
                                            className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-left transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="text-[#888888]">{page.icon}</div>
                                                <span className="text-sm font-semibold text-black dark:text-white">
                                                    {page.label}
                                                </span>
                                            </div>
                                            <span className="text-[10px] uppercase font-mono text-[#888888]">Navigate</span>
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-4 py-8 text-center text-sm font-mono text-[#888888]">
                                        No exact matches found. 
                                    </div>
                                )}
                                
                                <div className="mt-4 mb-2 mx-4 h-px bg-black/5 dark:bg-white/5" />
                                
                                {/* System Commands (Real) */}
                                <div className="px-4 py-2">
                                    <span className="text-[10px] font-mono uppercase text-[#888888] tracking-widest">Global Utilities</span>
                                </div>
                                <button
                                    onClick={() => {
                                        setTheme(theme === "dark" ? "light" : "dark");
                                        setIsOpen(false);
                                    }}
                                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-left transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="text-[#888888]"><Monitor size={16} /></div>
                                        <span className="text-sm font-semibold text-black dark:text-white">
                                            Toggle {theme === "dark" ? "Light" : "Dark"} Mode
                                        </span>
                                    </div>
                                    <span className="text-[10px] uppercase font-mono text-[#888888]">Action</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
