"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  moduleName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * InstitutionalErrorBoundary
 * 
 * A robust, high-fidelity error boundary designed for the Sovereign Terminal.
 * Prevents local module failures from crashing the entire session.
 * Features an "Aztec Brutalist" fallback UI with a localized reset trigger.
 */
export class InstitutionalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[Term-Error-Node]: ${this.props.moduleName || 'Global'} Failure`, error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[#FAF9F6] border-2 border-dashed border-black/10 rounded-2xl">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-[#FF3B30]/10 blur-2xl rounded-full" />
            <div className="relative p-4 bg-white border border-[#FF3B30]/30 rounded-full">
              <ShieldAlert size={32} className="text-[#FF3B30]" />
            </div>
          </div>
          
          <h2 className="text-[14px] font-black uppercase tracking-[0.2em] text-[#050505] mb-2 text-center">
            Critical Module Decoupling Detected
          </h2>
          <p className="text-[10px] font-mono text-[#888888] uppercase tracking-widest mb-6 text-center max-w-sm leading-relaxed">
            The {this.props.moduleName || 'active'} intelligence node has encountered an unhandled exception. Parity check failed.
          </p>
          
          <button
            onClick={handleReset}
            className="flex items-center gap-2.5 px-6 py-3 bg-[#050505] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10"
          >
            <RefreshCw size={14} /> Re-initialize Protocol
          </button>
          
          <div className="mt-8 pt-8 border-t border-black/5 w-full flex justify-center">
             <span className="text-[8px] font-mono text-[#CCCCCC] uppercase tracking-widest italic">
               ID Code: {this.state.error?.name || 'ERR_NODE_UNKNOWN'} // Clearance Redacted
             </span>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
