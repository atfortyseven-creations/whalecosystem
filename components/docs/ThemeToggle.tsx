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
      className={`relative w-12 h-6 rounded-none border transition-all duration-300 flex items-center ${
        theme === 'light' ? 'bg-white border-black/20' : 'bg-black border-white/20'
      }`}
    >
      <div className={`absolute w-4 h-4 rounded-none flex items-center justify-center transition-all duration-300 ${
        theme === 'light' 
          ? 'translate-x-1 bg-black ring-2 ring-black/5' 
          : 'translate-x-6 bg-white ring-2 ring-white/5'
      }`}>
        {theme === 'light' ? (
          <Sun size={10} className="text-white" />
        ) : (
          <Moon size={10} className="text-black" />
        )}
      </div>
    </button>
  );
}
