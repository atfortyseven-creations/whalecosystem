import React from "react";
import { notFound } from "next/navigation";
import { docsData } from "@/lib/docs-data";
import { SovereignFooter } from "@/components/landing/SovereignFooter";

// We disable caching to ensure the latest documentation is always served
export const revalidate = 0;

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = docsData[slug];

  if (!doc) {
    // If a slug is not found in the local data, we show a generic not found or fallback
    notFound();
  }

  return (
    <div className="relative min-h-[100dvh] w-full overflow-x-hidden font-sans flex flex-col bg-white text-black selection:bg-black selection:text-white">
      
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 w-full py-6 px-8 flex justify-between items-center bg-white/95 backdrop-blur-xl border-b border-black/5">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 flex items-center justify-center shrink-0">
            <img src="/official-whale-monochrome.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] font-black">
            Scanner Humanity Ledger
          </div>
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-40 hidden md:block">
          Technical Documentation
        </div>
      </header>

      {/* ── MAIN LAYOUT ── */}
      <div className="flex-1 w-full max-w-[1400px] mx-auto flex flex-col md:flex-row">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-full md:w-[320px] shrink-0 border-b md:border-b-0 md:border-r border-black/10 flex flex-col px-6 pt-12 pb-12 md:min-h-[calc(100vh-80px)] bg-white z-40">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] font-black text-black/50 mb-8 px-4">
            Documentation Index
          </div>
          
          <nav className="flex flex-col gap-2 overflow-y-auto pr-2 custom-scrollbar">
            {Object.entries(docsData).map(([key, data]) => (
              <a 
                key={key} 
                href={`/developer/${key}`} 
                className={`group w-full flex flex-col gap-1 p-4 rounded-2xl border transition-all duration-200 shadow-sm ${
                  slug === key 
                    ? "border-black/20 bg-black/[0.04]" 
                    : "border-transparent hover:bg-black/[0.02] hover:border-black/5"
                }`}
              >
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-black/40">
                  {data.category}
                </span>
                <p className={`text-[13px] font-black tracking-tight ${slug === key ? "text-black" : "text-[#050505]/70"}`}>
                  {data.title}
                </p>
              </a>
            ))}
          </nav>
        </aside>

        {/* DOCUMENT CONTENT */}
        <main className="flex-1 px-8 md:px-16 pt-16 md:pt-24 pb-32 max-w-[900px]">
          
          <div className="mb-16">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] font-black text-black/50 mb-6">
              {doc.category}
            </div>
            <h1 className="text-[40px] md:text-[56px] font-normal tracking-[-0.03em] leading-[1.05] font-sans">
              {doc.title}
            </h1>
          </div>

          <article className="flex flex-col gap-8">
            {doc.content.map((paragraph, idx) => (
              <p 
                key={idx} 
                className="text-[16px] md:text-[18px] leading-[1.8] text-[#111111] font-light text-justify"
              >
                {paragraph}
              </p>
            ))}
          </article>

          <div className="mt-32 pt-12 border-t border-black/10">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-40">
              © 2026 Humanity Ledger · Technical Specification
            </p>
          </div>
        </main>
      </div>

      <SovereignFooter />
    </div>
  );
}
