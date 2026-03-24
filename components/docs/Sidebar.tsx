"use client";

import React from 'react';
import Link from 'next/link';
import { Book, Terminal, Code, ChevronDown, ChevronRight } from 'lucide-react';

interface SidebarProps {
  theme: 'light' | 'dark';
  currentPath: string;
}

export function Sidebar({ theme, currentPath }: SidebarProps) {
  const sections = [
    {
      title: 'Guides',
      icon: <Book size={14} />,
      items: [
        { label: 'Letta Code ↗', href: 'https://letta.code', external: true },
        { label: 'Letta Code SDK ↗', href: 'https://letta.sdk', external: true },
        { label: 'Get started', href: '/docs/get-started' },
        { label: 'Intro to Letta', href: '/docs/intro' },
        { label: 'Quickstart (API)', href: '/docs/quickstart' },
        { label: 'Models', href: '/docs/models' },
        { label: 'Pricing', href: '/docs/pricing' },
        { label: 'Core concepts', href: '/docs/core-concepts' },
        { label: 'Stateful agents', href: '/docs/agents' },
        { label: 'Messages', href: '/docs/messages' },
        { label: 'Memory', href: '/docs/memory' },
        { label: 'Tools', href: '/docs/tools' },
        { label: 'Skills ↗', href: '/docs/skills', external: true },
        { label: 'Filesystem', href: '/docs/filesystem' },
        { label: 'AgentFile (.af)', href: '/docs/agent-file' },
        { label: 'Docker server', href: '/docs/docker' },
        { label: 'Server setup', href: '/docs/setup' },
        { label: 'Model providers', href: '/docs/providers' },
        { label: 'Tutorials', isCategory: true },
        { label: 'First steps', href: '/docs/tutorials/first-steps' },
        { label: 'Retrieval', href: '/docs/tutorials/retrieval' },
        { label: 'Multi-agent patterns', href: '/docs/tutorials/patterns' },
        { label: 'Advanced', isCategory: true },
        { label: 'Integrations', href: '/docs/integrations' },
        { label: 'Development tools', href: '/docs/dev-tools' },
        { label: 'Community tools', href: '/docs/community' },
        { label: 'Discord', href: 'https://discord.gg/whalealert', external: true },
      ]
    },
    {
      title: 'API Reference',
      icon: <Terminal size={14} />,
      items: [
        { label: 'Using the API', href: '/docs/api/usage' },
        { label: 'Introduction', href: '/docs/api/intro' },
        { label: 'Client SDKs', href: '/docs/api/sdks' },
        { label: 'v1.0 migration guide', href: '/docs/api/migration' },
        { label: 'API reference', isCategory: true },
        { label: 'Overview', href: '/docs/api/reference/overview' },
        { label: 'Agents', href: '/docs/api/reference/agents' },
        { label: 'Tools', href: '/docs/api/reference/tools' },
        { label: 'Blocks', href: '/docs/api/reference/blocks' },
        { label: 'Archives', href: '/docs/api/reference/archives' },
        { label: 'Models', href: '/docs/api/reference/models' },
        { label: 'Mcp Servers', href: '/docs/api/reference/mcp' },
        { label: 'Runs', href: '/docs/api/reference/runs' },
        { label: 'Messages', href: '/docs/api/reference/messages' },
        { label: 'Conversations', href: '/docs/api/reference/conversations' },
        { label: 'Access Tokens', href: '/docs/api/reference/tokens' },
      ]
    },
    {
      title: 'Whale Code',
      icon: <Code size={14} />,
      items: [
        { label: 'Get started', isCategory: true },
        { label: 'Overview', href: '/docs/whale-code/overview' },
        { label: 'Quickstart', href: '/docs/whale-code/quickstart' },
        { label: 'Features', isCategory: true },
        { label: 'Memory', href: '/docs/whale-code/memory' },
        { label: 'Skills', href: '/docs/whale-code/skills' },
        { label: 'Subagents', href: '/docs/whale-code/subagents' },
        { label: 'Models', href: '/docs/whale-code/models' },
        { label: 'Providers', href: '/docs/whale-code/providers' },
        { label: 'Permissions', href: '/docs/whale-code/permissions' },
        { label: 'Hooks', href: '/docs/whale-code/hooks' },
        { label: 'Letta Code SDK', isCategory: true },
        { label: 'Quickstart', href: '/docs/whale-code/sdk/quickstart' },
        { label: 'Migrate Claude SDK', href: '/docs/whale-code/sdk/migrate' },
        { label: 'Reference', isCategory: true },
        { label: 'Slash commands', href: '/docs/whale-code/reference/commands' },
        { label: 'CLI reference', href: '/docs/whale-code/reference/cli' },
        { label: 'Auto-looping', href: '/docs/whale-code/reference/auto-loop' },
        { label: 'Docker', href: '/docs/whale-code/reference/docker' },
        { label: 'How it works', href: '/docs/whale-code/reference/inner-workings' },
      ]
    }
  ];

  return (
    <aside className={`w-72 h-[calc(100vh-64px)] hidden lg:block overflow-y-auto ${theme === 'light' ? 'bg-slate-50' : 'bg-[#0F0F10]'} border-r ${theme === 'light' ? 'border-slate-200' : 'border-white/5'} p-6 custom-scrollbar`}>
      <nav className="space-y-8">
        {sections.map((section) => (
          <div key={section.title} className="space-y-4">
            <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
              {section.icon}
              {section.title}
            </div>
            
            <div className="flex flex-col gap-1.5 ml-1">
              {section.items.map((item, idx) => {
                if (item.isCategory) {
                  return (
                    <div key={`${section.title}-cat-${idx}`} className={`mt-4 mb-2 text-[9px] font-black uppercase tracking-[0.2em] ${theme === 'light' ? 'text-slate-300' : 'text-slate-600'}`}>
                      {item.label}
                    </div>
                  );
                }
                
                const isActive = currentPath === item.href;
                return (
                  <Link 
                    key={item.label}
                    href={item.href || '#'}
                    target={item.external ? '_blank' : undefined}
                    className={`group flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-all ${
                      isActive 
                        ? (theme === 'light' ? 'bg-cyan-50/50 text-cyan-600 font-bold border border-cyan-100' : 'bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/20')
                        : (theme === 'light' ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900' : 'text-slate-400 hover:bg-white/5 hover:text-slate-100')
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.external && <ArrowUpRight size={10} className="opacity-40 group-hover:opacity-100" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}

function ArrowUpRight({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <line x1="7" y1="17" x2="17" y2="7"></line>
      <polyline points="7 7 17 7 17 17"></polyline>
    </svg>
  );
}
