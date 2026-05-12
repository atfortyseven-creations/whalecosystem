"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Zap, Lock, Globe, Database } from 'lucide-react';

const ENDPOINTS = [
  { method: 'GET',  path: '/api/whale/alerts',            desc: 'Real-time whale movements above threshold' },
  { method: 'GET',  path: '/api/market/top',              desc: 'Top markets by volume across 12 chains' },
  { method: 'GET',  path: '/api/wallet/:address',         desc: 'On-chain identity, tier, and transaction history' },
  { method: 'POST', path: '/api/forum/posts',             desc: 'Create a signed forum post (ECDSA required)' },
  { method: 'POST', path: '/api/payment/confirm',         desc: 'Confirm TRC-20 USDT subscription payment' },
  { method: 'GET',  path: '/api/auth/session',            desc: 'Current session tier, address, and email' },
];

const PLANS = [
  { name: 'Starter', calls: '1,000 / day',   ws: 'No',  webhooks: 'No' },
  { name: 'Pro',     calls: '10,000 / day',  ws: 'Yes', webhooks: 'Yes' },
  { name: 'Elite',   calls: 'Unlimited',     ws: 'Yes', webhooks: 'Yes' },
];

export default function DeveloperOverviewPage() {
  return (
    <div className="doc-content">

      {/* Breadcrumb */}
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-25 mb-8">
        Developer / Overview
      </p>

      <h1>Developer Overview</h1>

      <p>
        The Whale Alert API gives you programmatic access to real-time on-chain intelligence across 12 chains.
        All endpoints require a valid session authenticated via <strong>EIP-4361 (SIWE)</strong> — no API keys,
        no passwords. Your wallet is your credential.
      </p>

      {/* Auth callout */}
      <div className="callout my-8">
        <p>
          <strong>Authentication:</strong> Every request must include the <code>x-web3-address</code> header
          with your wallet address and a valid <code>sovereign_handshake</code> session cookie.
          See the <Link href="/docs/developer/auth" className="underline opacity-80 hover:opacity-100">Authentication guide</Link>.
        </p>
      </div>

      <h2>Base URL</h2>
      <pre>{`https://your-deployment.vercel.app/api`}</pre>

      <h2>Quick Start</h2>
      <pre>{`# 1. Authenticate via SIWE (returns session cookie)
POST /api/auth/verify
{ "message": "...", "signature": "0x..." }

# 2. Call any endpoint
GET /api/whale/alerts?chain=ethereum&minUsd=1000000
x-web3-address: 0xYourWalletAddress`}</pre>

      <h2>Core Endpoints</h2>

      <div className="flex flex-col gap-px border border-black/8 dark:border-white/8 my-6">
        {ENDPOINTS.map((ep, i) => (
          <div key={i} className="flex items-start gap-4 px-5 py-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <span className={`font-mono text-[10px] font-black tracking-widest shrink-0 mt-0.5 ${
              ep.method === 'GET' ? 'text-[#00C076]' : 'text-blue-400'
            }`}>{ep.method}</span>
            <code className="font-mono text-[12px] flex-1">{ep.path}</code>
            <span className="font-mono text-[11px] opacity-40 hidden sm:block">{ep.desc}</span>
          </div>
        ))}
      </div>

      <h2>Rate Limits</h2>
      <table>
        <thead>
          <tr>
            <th>Plan</th>
            <th>REST Calls</th>
            <th>WebSocket</th>
            <th>Webhooks</th>
          </tr>
        </thead>
        <tbody>
          {PLANS.map((p, i) => (
            <tr key={i}>
              <td><strong>{p.name}</strong></td>
              <td><code>{p.calls}</code></td>
              <td>{p.ws}</td>
              <td>{p.webhooks}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Feature Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
        {[
          { icon: <Zap size={16}/>, title: 'Real-time alerts', desc: 'Subscribe to whale movements via WebSocket or REST polling.' },
          { icon: <Lock size={16}/>, title: 'Zero-password auth', desc: 'EIP-4361 SIWE: sign a message with your wallet to authenticate.' },
          { icon: <Globe size={16}/>, title: '12 chains', desc: 'Ethereum, Base, Arbitrum, Optimism, Polygon, BNB, Avalanche, and more.' },
          { icon: <Database size={16}/>, title: 'Graph queries', desc: 'Neo4j-powered 5-hop pathfinding for entity clustering and fund tracing.' },
        ].map((f, i) => (
          <div key={i} className="p-5 border border-black/8 dark:border-white/8 hover:border-[#00C076]/40 transition-colors">
            <div className="flex items-center gap-2 mb-2 opacity-60">{f.icon} <span className="font-mono text-[10px] uppercase tracking-widest font-black">{f.title}</span></div>
            <p className="text-[13px] leading-relaxed opacity-55 m-0">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Next steps */}
      <h2>Next Steps</h2>
      <div className="flex flex-col gap-2">
        {[
          { label: 'Authentication guide', href: '/docs/developer/auth' },
          { label: 'REST API reference', href: '/docs/developer/api/overview' },
          { label: 'WebSocket channels', href: '/docs/developer/ws/channels' },
          { label: 'TypeScript SDK', href: '/docs/developer/sdk/typescript' },
        ].map((lnk, i) => (
          <Link key={i} href={lnk.href}
            className="flex items-center gap-2 font-mono text-[12px] opacity-40 hover:opacity-100 hover:text-[#00C076] transition-all group py-1">
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            {lnk.label}
          </Link>
        ))}
      </div>

    </div>
  );
}
