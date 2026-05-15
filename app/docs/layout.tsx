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

  // Force strict light mode typography for absolute contrast
  useEffect(() => {
      document.documentElement.classList.add('light');
  }, []);

  const bg      = 'bg-transparent text-black';
  const hdrBg   = 'bg-white/40 border-black/8';

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-200 font-sans`}>

      {/* ── TOP BAR ── */}
      <header className={`sticky top-0 z-50 h-[56px] border-b ${hdrBg} px-5 flex items-center gap-0 backdrop-blur-xl`}>

        {/* Logo */}
        <Link href="/docs" className={`font-mono text-[11px] font-black uppercase tracking-[0.25em] mr-8 text-black shrink-0`}>
          Whale Alert
          <span className="ml-1 opacity-25 font-normal">/ docs</span>
        </Link>

        {/* Version badge */}
        <span className={`font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 border rounded-full mr-6 border-black/15 text-black/30 shrink-0`}>
          v2.0
        </span>

        {/* Tab navigation */}
        <nav className="flex items-stretch h-full gap-1 flex-1">
          {TOP_TABS.map(tab => (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex items-center px-4 font-mono text-[10px] uppercase tracking-[0.18em] transition-all h-full border-b-2 ${
                activeTab === tab.id
                  ? 'text-black border-black'
                  : 'text-black/30 border-transparent hover:text-black/60'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-4 shrink-0">
          <Search theme="light" />
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="flex max-w-[1800px] mx-auto">

        {/* Left sidebar */}
        <Sidebar theme="light" currentPath={pathname || ''} />

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
          background: rgba(0,0,0,0.15);
          border-radius: 0;
        }
        html.light { background-color: white !important; color: black !important; }
        html.light body { background-color: white !important; color: black !important; }

        /* Doc typography */
        .doc-content h1 { font-size: 2.4rem; font-weight: 900; letter-spacing: -0.04em; text-transform: uppercase; line-height: 1.1; margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid rgba(0,0,0,0.08); }
        .doc-content h2 { font-size: 1.2rem; font-weight: 900; letter-spacing: -0.02em; text-transform: uppercase; margin-top: 3rem; margin-bottom: 1rem; }
        .doc-content h3 { font-size: 0.75rem; font-weight: 900; letter-spacing: 0.2em; text-transform: uppercase; margin-top: 2rem; margin-bottom: 0.75rem; opacity: 0.4; }
        .doc-content p { line-height: 1.8; font-size: 0.9375rem; opacity: 0.75; margin-bottom: 1.25rem; }
        .doc-content pre { background: #F5F4EF; border: 1px solid rgba(0,0,0,0.08); padding: 1.5rem; font-family: monospace; font-size: 0.8125rem; overflow-x: auto; margin: 1.5rem 0; }
        .doc-content code { background: #F0EFE9; border: 1px solid rgba(0,0,0,0.06); padding: 0.15em 0.45em; font-family: monospace; font-size: 0.8125rem; }
        .doc-content li { margin-bottom: 0.5rem; opacity: 0.7; font-size: 0.9375rem; line-height: 1.7; padding-left: 1.25rem; position: relative; }
        .doc-content li::before { content: '—'; position: absolute; left: 0; opacity: 0.3; }
        .doc-content .callout { border-left: 2px solid #050505; padding: 1rem 1.25rem; margin: 1.5rem 0; background: rgba(5,5,5,0.04); }
        .doc-content .callout p { margin: 0; opacity: 0.9; font-size: 0.875rem; }
        .doc-content table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.875rem; }
        .doc-content th { text-align: left; font-weight: 900; font-size: 0.7rem; letter-spacing: 0.2em; text-transform: uppercase; padding: 0.75rem 1rem; border-bottom: 2px solid rgba(0,0,0,0.1); opacity: 0.5; }
        .doc-content td { padding: 0.75rem 1rem; border-bottom: 1px solid rgba(0,0,0,0.05); opacity: 0.7; }
      `}</style>
    </div>
  );
}
