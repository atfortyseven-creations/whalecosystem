"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertOctagon, RotateCcw } from "lucide-react";

interface Props {
  children?: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class DashboardErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("DashboardErrorBoundary caught an error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[#FAF9F6] border border-[#E5E5E5] rounded-[2rem]">
          <div className="flex bg-[#FF3B30]/10 p-4 rounded-full mb-4">
            <AlertOctagon size={32} className="text-[#FF3B30]" />
          </div>
          <h2 className="text-sm font-black text-[#050505] tracking-tight mb-2">Module Execution Failure</h2>
          <p className="text-[10px] font-bold text-[#888888] uppercase tracking-widest text-center max-w-sm mb-6 leading-relaxed">
            {this.props.fallbackMessage || 
              "A critical fault occurred within this terminal module. The integrity of the application ring-fenced this failure to prevent system-wide collapse."}
          </p>
          
          {this.state.error && (
            <div className="w-full max-w-lg bg-white border border-[#E5E5E5] rounded-xl p-4 mb-6 overflow-x-auto">
              <pre className="text-[9px] font-mono font-bold text-[#FF3B30] whitespace-pre-wrap">
                {this.state.error.toString()}
              </pre>
            </div>
          )}

          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#050505] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#888888] transition-all"
          >
            <RotateCcw size={14} />
            Reboot Interface
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
