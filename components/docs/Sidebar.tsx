"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';

interface NavItem {
  label: string;
  href?: string;
  external?: boolean;
  isCategory?: boolean;
  badge?: string;
}
interface NavSection { title: string; tab: string; items: NavItem[]; }

const NAV: NavSection[] = [
  //  DOCS TAB 
  {
    title: 'Getting Started',
    tab: 'docs',
    items: [
      { label: 'Overview', href: '/docs/overview' },
      { label: 'Quickstart', href: '/docs/quickstart' },
      { label: 'Core Concepts', href: '/docs/core-concepts' },
      { label: 'Whale Code', href: '/docs/whale-code', badge: '' },
    ]
  },
  {
    title: 'Platform',
    tab: 'docs',
    items: [
      { label: 'Architecture', href: '/docs/platform/architecture' },
      { label: 'Authentication (SIWE)', href: '/docs/platform/authentication' },
      { label: 'Neo4j Akashic Ledger', href: '/docs/platform/neo4j' },
      { label: 'Smart Contracts', href: '/docs/platform/smart-contracts' },
      { label: 'Node Deployment', href: '/docs/platform/node-deployment' },
      { label: 'WebSocket Streams', href: '/docs/platform/websocket-streams' },
      { label: 'Whale Chat Forum', href: '/docs/platform/whale-chat' },
    ]
  },
  {
    title: 'Integrations',
    tab: 'docs',
    items: [
      { label: 'WalletConnect v2', href: '/docs/integrations/walletconnect' },
      { label: 'Tron / TRC-20', href: '/docs/integrations/tron' },
      { label: 'GetBlock RPC', href: '/docs/integrations/getblock' },
      { label: 'Resend Email', href: '/docs/integrations/resend' },
      { label: 'Prisma ORM', href: '/docs/integrations/prisma' },
    ]
  },

  //  DEVELOPER TAB 
  {
    title: 'Getting Started',
    tab: 'developer',
    items: [
      { label: 'Developer Overview', href: '/docs/developer/overview' },
      { label: 'Authentication', href: '/docs/developer/auth' },
      { label: 'API Keys', href: '/docs/developer/api-keys' },
      { label: 'Rate Limits', href: '/docs/developer/rate-limits' },
    ]
  },
  {
    title: 'REST API',
    tab: 'developer',
    items: [
      { label: 'Reference Overview', href: '/docs/developer/rest/overview' },
      { label: 'Whale Alerts', href: '/docs/developer/rest/whale-alerts' },
      { label: 'Market Data', href: '/docs/developer/rest/market-data' },
      { label: 'Wallets & Entities', href: '/docs/developer/rest/wallets' },
      { label: 'Forum Posts', href: '/docs/developer/rest/forum' },
      { label: 'Subscriptions', href: '/docs/developer/rest/subscriptions' },
      { label: 'Transactions', href: '/docs/developer/rest/transactions' },
    ]
  },
  {
    title: 'WebSocket API',
    tab: 'developer',
    items: [
      { label: 'Connection', href: '/docs/developer/ws/connection' },
      { label: 'Channels', href: '/docs/developer/ws/channels' },
      { label: 'Events', href: '/docs/developer/ws/events' },
    ]
  },
  {
    title: 'SDKs',
    tab: 'developer',
    items: [
      { label: 'TypeScript SDK', href: '/docs/developer/sdk/typescript' },
      { label: 'Python SDK', href: '/docs/developer/sdk/python' },
      { label: 'Webhook Guide', href: '/docs/developer/sdk/webhooks' },
      { label: 'Changelog', href: '/docs/developer/sdk/changelog' },
    ]
  },

  //  OPERATOR TAB 
  {
    title: 'Getting Started',
    tab: 'operator',
    items: [
      { label: 'Operator Overview', href: '/docs/operator/overview' },
      { label: 'Prerequisites', href: '/docs/operator/prerequisites' },
    ]
  },
  {
    title: 'Setup',
    tab: 'operator',
    items: [
      { label: 'Running a Full Node', href: '/docs/operator/setup/node' },
      { label: 'Running a Sequencer', href: '/docs/operator/setup/sequencer' },
      { label: 'Running a Prover', href: '/docs/operator/setup/prover' },
      { label: 'Building from Source', href: '/docs/operator/setup/source' },
      { label: 'Snapshots & Syncing', href: '/docs/operator/setup/snapshots' },
    ]
  },
  {
    title: 'Operation',
    tab: 'operator',
    items: [
      { label: 'Monitoring', href: '/docs/operator/operation/monitoring' },
      { label: 'Keystore Management', href: '/docs/operator/operation/keystore' },
      { label: 'Sequencer Management', href: '/docs/operator/operation/sequencer' },
      { label: 'FAQs & Common Issues', href: '/docs/operator/operation/faq' },
    ]
  },
  {
    title: 'Reference',
    tab: 'operator',
    items: [
      { label: 'CLI Reference', href: '/docs/operator/reference/cli' },
      { label: 'Node JSON RPC API', href: '/docs/operator/reference/rpc' },
      { label: 'Changelog', href: '/docs/operator/reference/changelog' },
      { label: 'Glossary', href: '/docs/operator/reference/glossary' },
    ]
  },

  //  LEGAL TAB 
  {
    title: 'Legal',
    tab: 'legal',
    items: [
      { label: 'Terms of Service', href: '/docs/legal/terms-of-service' },
      { label: 'Privacy Policy', href: '/docs/legal/privacy-policy' },
      { label: 'Cookie Policy', href: '/docs/legal/cookie-policy' },
      { label: 'Risk Disclosure', href: '/docs/legal/risk-disclosure' },
      { label: 'Whale Code', href: '/docs/legal/whale-code' },
      { label: 'Whitepaper', href: '/docs/legal/whitepaper' },
    ]
  },
];

// Determine active tab from path
function getActiveTab(path: string): string {
  if (path.startsWith('/docs/developer')) return 'developer';
  if (path.startsWith('/docs/operator'))  return 'operator';
  if (path.startsWith('/docs/legal'))     return 'legal';
  return 'docs';
}

const TABS = [
  { id: 'docs',      label: 'Docs',      href: '/docs/overview' },
  { id: 'developer', label: 'Developer', href: '/docs/developer/overview' },
  { id: 'operator',  label: 'Operator',  href: '/docs/operator/overview' },
  { id: 'legal',     label: 'Legal',     href: '/docs/legal/terms-of-service' },
];

interface SidebarProps { theme: 'light' | 'dark'; currentPath: string; }

export function Sidebar({ theme, currentPath }: SidebarProps) {
  const [activeTab, setActiveTab] = useState(() => getActiveTab(currentPath));
  const [openSections, setOpenSections] = useState<Set<string>>(() => {
    const tab = getActiveTab(currentPath);
    return new Set(NAV.filter(s => s.tab === tab).map(s => s.title + s.tab));
  });

  useEffect(() => {
    const tab = getActiveTab(currentPath);
    setActiveTab(tab);
    // Auto-expand all sections of the newly selected tab
    setOpenSections(new Set(NAV.filter(s => s.tab === tab).map(s => s.title + s.tab)));
  }, [currentPath]);

  const toggle = (title: string) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      next.has(title) ? next.delete(title) : next.add(title);
      return next;
    });
  };

  const bg     = 'bg-[#FFFFFF]';
  const border  = 'border-black/10';
  const tabTextInactive = 'text-black/30 hover:text-black/70';
  const tabTextActive   = 'text-black border-b-2 border-black font-black';
  const catColor        = 'text-black/25';
  const itemInactive    = 'text-black/50 hover:text-black hover:bg-black/5';
  const itemActive      = 'text-black font-black border-l-2 border-black pl-3 bg-black/5';
  const sectionTitle    = 'text-black/40';

  const visibleSections = NAV.filter(s => s.tab === activeTab);

  return (
    <aside className={`w-72 h-full hidden lg:flex flex-col ${bg} border-r ${border} overflow-hidden flex-shrink-0`}>
      {/* Tab bar */}
      <div className={`flex border-b ${border} px-2 shrink-0`}>
        {TABS.map(tab => (
          <Link
            key={tab.id}
            href={tab.id === 'docs' ? '/docs/overview' : tab.id === 'developer' ? '/docs/developer/overview' : tab.id === 'operator' ? '/docs/operator/overview' : '/docs/legal/terms-of-service'}
            onClick={() => {
              setActiveTab(tab.id);
              setOpenSections(new Set(NAV.filter(s => s.tab === tab.id).map(s => s.title + s.tab)));
            }}
            className={`px-3 py-3.5 font-mono text-[9px] uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
              activeTab === tab.id ? tabTextActive : tabTextInactive
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Nav items */}
      <nav className="flex-1 flex flex-col overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {visibleSections.map(section => {
          const isOpen = openSections.has(section.title + section.tab);
          return (
            <div key={section.title + section.tab}>
              <button
                onClick={() => toggle(section.title + section.tab)}
                className={`w-full flex items-center justify-between text-[10px] font-black uppercase tracking-[0.25em] ${sectionTitle} mb-3 hover:opacity-100 transition-opacity`}
              >
                <span>{section.title}</span>
                {isOpen
                  ? <ChevronDown size={11} className="opacity-40" />
                  : <ChevronRight size={11} className="opacity-40" />
                }
              </button>

              {(isOpen || openSections.size === 0) && (
                <div className="flex flex-col gap-1.5">
                  {section.items.map((item, idx) => {
                    if (item.isCategory) {
                      return (
                        <div key={idx} className={`mt-4 mb-1.5 text-[9px] font-black uppercase tracking-[0.3em] ${catColor}`}>
                          {item.label}
                        </div>
                      );
                    }
                    const isActive = currentPath === item.href;
                    return (
                      <Link
                        key={idx}
                        href={item.href || '#'}
                        target={item.external ? '_blank' : undefined}
                        className={`flex items-center justify-between py-2 px-3 text-[12px] tracking-tight transition-all rounded-md ${
                          isActive ? itemActive : itemInactive
                        }`}
                      >
                        <span>{item.label}</span>
                        <span className="flex items-center gap-1">
                          {item.badge && <span className={`font-mono text-[9px] text-black/25`}>{item.badge}</span>}
                          {item.external && <ExternalLink size={9} className="opacity-20" />}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
