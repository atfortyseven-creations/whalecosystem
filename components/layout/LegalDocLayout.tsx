'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export interface TocItem {
  id: string;
  label: string;
}

interface LegalDocLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  lastUpdated?: string;
  category: string;
  toc: TocItem[];
  backHref?: string;
  backLabel?: string;
}

export default function LegalDocLayout({
  children,
  title,
  subtitle,
  lastUpdated,
  category,
  toc,
  backHref = '/',
  backLabel = 'Back',
}: LegalDocLayoutProps) {
  const [activeId, setActiveId] = useState<string>(toc[0]?.id ?? '');

  useEffect(() => {
    if (!toc.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) =>
            a.boundingClientRect.top > b.boundingClientRect.top ? 1 : -1
          );
        if (visible[0]?.target?.id) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-15% 0px -60% 0px', threshold: 0.01 }
    );
    toc.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [toc]);

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Page Header */}
      <div className="border-b border-black/8 bg-white">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-12 md:py-20">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-black/40 hover:text-black text-[11px] font-mono font-semibold uppercase tracking-[0.25em] transition-colors mb-8"
          >
            <ArrowLeft size={13} strokeWidth={2.5} />
            {backLabel}
          </Link>
          <div className="inline-block px-3 py-1 border border-black/15 rounded-full text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-black/50 mb-5">
            {category}
          </div>
          <h1 className="text-[2.75rem] md:text-[3.5rem] lg:text-[4rem] font-black leading-[1.05] tracking-[-0.025em] text-black mb-4 max-w-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="text-base md:text-lg text-black/55 max-w-2xl leading-relaxed font-normal">
              {subtitle}
            </p>
          )}
          {lastUpdated && (
            <p className="mt-5 text-[11px] font-mono text-black/35 uppercase tracking-[0.25em]">
              Last updated: {lastUpdated}
            </p>
          )}
        </div>
      </div>

      {/* Body: sidebar + content */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 flex flex-col lg:flex-row gap-0 lg:gap-16 py-12 md:py-16">

        {/* Left Sidebar TOC */}
        <aside className="lg:w-[220px] xl:w-[240px] shrink-0 lg:sticky lg:top-8 lg:self-start lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto mb-10 lg:mb-0">
          <p className="text-[10px] font-mono font-bold uppercase tracking-[0.35em] text-black/35 mb-4 px-1">
            Contents
          </p>
          <nav aria-label="Table of contents" className="flex flex-col">
            {toc.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`
                  block text-[13px] leading-snug py-2 px-3 rounded-md transition-all duration-150
                  border-l-2
                  ${activeId === item.id
                    ? 'border-black text-black font-semibold bg-black/[0.035]'
                    : 'border-transparent text-black/45 hover:text-black hover:border-black/25 font-normal'
                  }
                `}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 max-w-[760px]">
          {children}
        </main>
      </div>

      {/* Footer */}
      <div className="border-t border-black/8 mt-8 py-10">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 text-center">
          <p className="text-[11px] font-mono text-black/35 uppercase tracking-[0.25em]">
            For inquiries:{' '}
            <a href="mailto:legal@whalecosystem.io" className="text-black/60 hover:text-black transition-colors underline underline-offset-2">
              legal@whalecosystem.io
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
