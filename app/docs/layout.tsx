"use client";

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/docs/Sidebar';
import { Search } from '@/components/docs/Search';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { SovereignFooter } from '@/components/landing/SovereignFooter';

const TOP_TABS = [
  { id: 'docs',      label: 'Docs',      href: '/docs' },
  { id: 'developer', label: 'Developer', href: '/docs/developer/overview' },
  { id: 'operator',  label: 'Operator',  href: '/docs/operator/overview' },
  { id: 'legal',     label: 'Legal',     href: '/docs/terms-of-service' },
];

function getActiveTopTab(path: string): string {
  if (path.startsWith('/docs/developer')) return 'developer';
  if (path.startsWith('/docs/operator'))  return 'operator';
  if (
    path.startsWith('/docs/terms') ||
    path.startsWith('/docs/privacy') ||
    path.startsWith('/docs/cookie') ||
    path.startsWith('/docs/risk') ||
    path.startsWith('/docs/whale-code') ||
    path.startsWith('/docs/whitepaper')
  ) return 'legal';
  return 'docs';
}

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activeTab = getActiveTopTab(pathname || '');

  // NOTE: We do NOT force light mode — the system dark mode (html.dark) must
  // be respected so the docs text is white over the black wallpaper background.
  // The docs sidebar and content use dark-mode-aware classes.

  const bg    = 'bg-transparent text-white dark:text-white';
  const hdrBg = 'bg-black/60 dark:bg-black/70 border-white/10';

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-200 font-sans`}>

      {/* ── TOP BAR ── */}
      <header className={`sticky top-0 z-50 h-[56px] border-b ${hdrBg} px-5 flex items-center backdrop-blur-xl`}>

        {/* Logo */}
        <Link href="/docs" className="font-mono text-[11px] font-black uppercase tracking-[0.25em] mr-8 text-white shrink-0 hover:text-white/80 transition-colors">
          Whale Alert
          <span className="ml-1 opacity-40 font-normal">/ docs</span>
        </Link>

        {/* Version badge */}
        <span className="font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 border rounded-full mr-6 border-white/20 text-white/40 shrink-0">
          v2.0
        </span>

        {/* Tab navigation — perfectly centered in the header */}
        <nav className="flex items-stretch h-full gap-0 flex-1 justify-start">
          {TOP_TABS.map(tab => (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex items-center justify-center px-5 font-mono text-[10px] uppercase tracking-[0.18em] transition-all h-full border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-white border-white font-black'
                  : 'text-white/40 border-transparent hover:text-white/80 hover:border-white/30'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-4 shrink-0 ml-auto">
          <Search theme="dark" />
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="flex max-w-[1800px] mx-auto">

        {/* Left sidebar */}
        <Sidebar theme="dark" currentPath={pathname || ''} />

        {/* Main content */}
        <main className={`flex-1 min-w-0 h-[calc(100vh-56px)] overflow-y-auto custom-scrollbar flex flex-col`}>
          <div className="max-w-[780px] mx-auto py-16 px-6 lg:px-12 flex-1">
            {children}
          </div>
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.15);
          border-radius: 0;
        }

        /* Doc typography — dark mode */
        .doc-content { color: #F5F5F5; }
        .doc-content h1 { font-size: 2.4rem; font-weight: 900; letter-spacing: -0.04em; text-transform: uppercase; line-height: 1.1; margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); color: #FFFFFF; }
        .doc-content h2 { font-size: 1.2rem; font-weight: 900; letter-spacing: -0.02em; text-transform: uppercase; margin-top: 3rem; margin-bottom: 1rem; color: #FFFFFF; }
        .doc-content h3 { font-size: 0.75rem; font-weight: 900; letter-spacing: 0.2em; text-transform: uppercase; margin-top: 2rem; margin-bottom: 0.75rem; color: rgba(255,255,255,0.5); }
        .doc-content p { line-height: 1.8; font-size: 0.9375rem; color: rgba(245,245,245,0.8); margin-bottom: 1.25rem; }
        .doc-content pre { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 1.5rem; font-family: monospace; font-size: 0.8125rem; overflow-x: auto; margin: 1.5rem 0; color: #E2E8F0; border-radius: 4px; }
        .doc-content code { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1); padding: 0.15em 0.45em; font-family: monospace; font-size: 0.8125rem; color: #A5D8FF; border-radius: 3px; }
        .doc-content li { margin-bottom: 0.5rem; color: rgba(245,245,245,0.75); font-size: 0.9375rem; line-height: 1.7; padding-left: 1.25rem; position: relative; }
        .doc-content li::before { content: '\2014'; position: absolute; left: 0; color: rgba(255,255,255,0.3); }
        .doc-content .callout { border-left: 2px solid rgba(255,255,255,0.5); padding: 1rem 1.25rem; margin: 1.5rem 0; background: rgba(255,255,255,0.04); }
        .doc-content .callout p { margin: 0; color: rgba(245,245,245,0.9); font-size: 0.875rem; }
        .doc-content table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.875rem; }
        .doc-content th { text-align: left; font-weight: 900; font-size: 0.7rem; letter-spacing: 0.2em; text-transform: uppercase; padding: 0.75rem 1rem; border-bottom: 2px solid rgba(255,255,255,0.12); color: rgba(255,255,255,0.5); }
        .doc-content td { padding: 0.75rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.06); color: rgba(245,245,245,0.75); }
        .doc-content a { color: #60A5FA; text-decoration: underline; }
        .doc-content a:hover { color: #93C5FD; }
      `}</style>
    </div>
  );
}
