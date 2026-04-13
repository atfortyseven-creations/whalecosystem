"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Global Application Fault:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#FAF9F6] text-[#050505] antialiased`}>
        <div className="flex flex-col items-center justify-center min-h-screen space-y-8 text-center px-4">
          
          <div className="relative z-10 w-full max-w-lg p-10 bg-white border border-black/5 rounded-[2.5rem] shadow-2xl flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-[#FF3B30]/10 text-[#FF3B30] flex items-center justify-center mb-6 ring-[12px] ring-[#FF3B30]/5">
              <AlertTriangle size={40} />
            </div>

            <h1 className="text-3xl font-black text-black uppercase tracking-widest mb-3">
              Fatal Kernel Panic
            </h1>
            
            <p className="text-sm font-bold text-black/50 leading-relaxed mb-8 max-w-sm">
              The Sovereign Terminal encountered a critical root fault in the React mounting tree. The system halted to prevent state corruption.
            </p>

            {error.digest && (
              <div className="w-full bg-black/5 rounded-2xl p-4 mb-8 border border-black/10 flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-black/40">Fault Digest ID:</span>
                <span className="text-xs font-mono font-bold text-[#FF3B30] bg-[#FF3B30]/10 px-2 py-0.5 rounded">{error.digest}</span>
              </div>
            )}

            <button 
              onClick={() => reset()}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-black hover:bg-black/90 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-black/10 hover:shadow-black/20 hover:-translate-y-0.5 active:translate-y-0"
            >
              <RefreshCw size={16} className="opacity-50" />
              Force Terminal Restart
            </button>
            <p className="mt-6 text-[10px] font-black text-black/20 uppercase tracking-widest">
              Action forces complete DOM remount
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
