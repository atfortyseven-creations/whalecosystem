"use client";

import React, { ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

interface DashboardPanelShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onRefresh?: () => void;
  loading?: boolean;
  rightAction?: ReactNode;
}

export function DashboardPanelShell({ 
  title, 
  subtitle, 
  children, 
  onRefresh, 
  loading = false,
  rightAction 
}: DashboardPanelShellProps) {
  return (
    <div className="w-full h-full min-h-0 flex flex-col items-start justify-start p-4 md:p-8 text-black font-sans overflow-y-auto no-scrollbar relative bg-white">
      {/* MAIN PANEL centered */}
      <div className="w-full max-w-[880px] mx-auto bg-white/80 backdrop-blur-2xl border border-slate-200/60 rounded-[2rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.07)] p-7 md:p-10 flex flex-col transition-all duration-500 z-10">

        {/* HEADER */}
        <div className="w-full flex-shrink-0 border-b border-slate-200/60 pb-5 mb-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left w-full">
              <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase text-slate-900 leading-none">
                {title}
              </h1>
              {subtitle && (
                <span className="mt-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  {subtitle}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-black hover:bg-slate-800 text-white rounded-xl font-mono text-xs uppercase tracking-wider transition-all disabled:opacity-50 active:scale-95 shadow-sm shrink-0"
                >
                  <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                  Refresh
                </button>
              )}
              {rightAction}
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="w-full flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
