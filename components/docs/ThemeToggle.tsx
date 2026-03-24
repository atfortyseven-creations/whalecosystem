"use client";

import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <button 
      onClick={onToggle}
      className={`relative w-12 h-6 rounded-full p-1 transition-all duration-300 flex items-center shadow-lg ${
        theme === 'light' ? 'bg-slate-100' : 'bg-white/5 border border-white/10'
      }`}
    >
      <div className={`absolute w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300 ${
        theme === 'light' 
          ? 'translate-x-0 bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.4)]' 
          : 'translate-x-6 bg-slate-900 shadow-none'
      }`}>
        {theme === 'light' ? (
          <Sun size={10} className="text-white" />
        ) : (
          <Moon size={10} className="text-cyan-400" />
        )}
      </div>
    </button>
  );
}
