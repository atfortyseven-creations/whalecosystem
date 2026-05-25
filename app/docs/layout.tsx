"use client";

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/docs/Sidebar';
import { Search } from '@/components/docs/Search';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { SystemFooter } from '@/components/landing/SystemFooter';

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

  // NOTE: We do NOT force light mode  the system dark mode (html.dark) must
  // be respected so the docs text is white over the black wallpaper background.
  // The docs sidebar and content use dark-mode-aware classes.

  const bg    = 'bg-[#FFFFFF] text-black';
  const hdrBg = 'bg-white border-black/10';

  return (
    <div className={`h-full flex flex-col ${bg} transition-colors duration-200 font-sans overflow-hidden`}>

      {/*  TOP BAR  */}
      <header className={`sticky top-0 z-50 h-[56px] border-b ${hdrBg} w-full flex items-center px-6 backdrop-blur-xl`}>

        {/* Logo */}
        <Link href="/docs" className="font-mono text-[11px] font-black uppercase tracking-[0.25em] mr-8 text-black shrink-0 hover:text-black/80 transition-colors">
          Whale Alert
          <span className="ml-1 opacity-40 font-normal">/ docs</span>
        </Link>

        {/* Version badge */}
        <span className="font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 border rounded-full mr-6 border-black/10 text-black/40 shrink-0">
          v2.0
        </span>

        {/* Tab navigation  perfectly centered in the header */}
        <nav className="flex items-stretch h-full gap-0 flex-1 justify-center">
          {TOP_TABS.map(tab => (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex items-center justify-center px-5 font-mono text-[10px] uppercase tracking-[0.18em] transition-all h-full border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-black border-black font-black'
                  : 'text-black/40 border-transparent hover:text-black/80 hover:border-black/30'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-4 shrink-0 ml-auto">
          <Search theme="light" />
        </div>
      </header>

      {/*  BODY  */}
      <div className="flex flex-1 w-full min-h-0 overflow-hidden">

        {/* Left sidebar */}
        <Sidebar theme="light" currentPath={pathname || ''} />

        {/* Main content */}
        <main className={`flex-1 min-w-0 overflow-y-auto overflow-x-hidden custom-scrollbar flex flex-col bg-white`}>
          <div className="w-full max-w-[900px] mx-auto py-16 px-8 lg:px-16 flex-1 pb-32">
            {children}
          </div>
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1);
          border-radius: 10px;
        }

        /* Doc typography  Light mode with "White Titles / Black Text" */
        .doc-content { color: #111111; }
        .doc-content h1 { 
          font-size: 2.2rem; 
          font-weight: 900; 
          letter-spacing: -0.04em; 
          text-transform: uppercase; 
          line-height: 1.1; 
          margin-bottom: 2rem; 
          padding: 1.5rem 2rem;
          background: #000000;
          color: #FFFFFF;
          border-radius: 4px;
        }
        .doc-content h2 { 
          font-size: 1.1rem; 
          font-weight: 900; 
          letter-spacing: 0.1em; 
          text-transform: uppercase; 
          margin-top: 4rem; 
          margin-bottom: 1.5rem; 
          padding: 0.75rem 1.5rem;
          background: #111111;
          color: #FFFFFF;
          border-radius: 4px;
          display: inline-block;
        }
        .doc-content h3 { font-size: 0.75rem; font-weight: 900; letter-spacing: 0.2em; text-transform: uppercase; margin-top: 2.5rem; margin-bottom: 1rem; color: rgba(0,0,0,0.4); }
        .doc-content p { line-height: 1.9; font-size: 1rem; color: #333333; margin-bottom: 1.5rem; }
        .doc-content pre { background: #F8F8F8; border: 1px solid #EEEEEE; padding: 1.5rem; font-family: monospace; font-size: 0.8125rem; overflow-x: auto; margin: 1.5rem 0; color: #111111; border-radius: 8px; }
        .doc-content code { background: #F0F0F0; border: 1px solid #E0E0E0; padding: 0.15em 0.45em; font-family: monospace; font-size: 0.8125rem; color: #0056B3; border-radius: 3px; }
        .doc-content li { margin-bottom: 0.75rem; color: #333333; font-size: 1rem; line-height: 1.8; padding-left: 1.5rem; position: relative; }
        .doc-content li::before { content: ""; position: absolute; left: 0; color: rgba(0,0,0,0.2); }
        .doc-content .callout { border-left: 3px solid #000000; padding: 1.25rem 1.5rem; margin: 2rem 0; background: #F9F9F9; border-radius: 0 8px 8px 0; }
        .doc-content .callout p { margin: 0; color: #111111; font-size: 0.9375rem; }
        .doc-content table { width: 100%; border-collapse: collapse; margin: 2rem 0; font-size: 0.9375rem; }
        .doc-content th { text-align: left; font-weight: 900; font-size: 0.7rem; letter-spacing: 0.2em; text-transform: uppercase; padding: 1rem; border-bottom: 2px solid #000000; color: #000000; }
        .doc-content td { padding: 1rem; border-bottom: 1px solid #EEEEEE; color: #333333; }
        .doc-content a { color: #0070F3; text-decoration: none; border-bottom: 1px solid #0070F3; }
        .doc-content a:hover { opacity: 0.7; }
      `}</style>
    </div>
  );
}
