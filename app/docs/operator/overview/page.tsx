"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Server, Cpu, Shield, Activity } from 'lucide-react';

const ROLES = [
  {
    icon: <Server size={18} />,
    title: 'Full Node Operator',
    desc: 'Sync and maintain a complete copy of the chain state. Required baseline for all other roles.',
    links: [
      { label: 'Running a Full Node', href: '/docs/operator/setup/node' },
      { label: 'Snapshots & Syncing', href: '/docs/operator/setup/snapshots' },
    ],
  },
  {
    icon: <Cpu size={18} />,
    title: 'Sequencer Operator',
    desc: 'Produce blocks, participate in consensus, and earn rewards. Requires staking and registration.',
    links: [
      { label: 'Sequencer Setup', href: '/docs/operator/setup/sequencer' },
      { label: 'Sequencer Management', href: '/docs/operator/sequencer-mgmt' },
    ],
  },
  {
    icon: <Shield size={18} />,
    title: 'Prover Operator',
    desc: 'Generate zero-knowledge cryptographic proofs for the network. Computationally intensive.',
    links: [
      { label: 'Running a Prover', href: '/docs/operator/setup/prover' },
    ],
  },
  {
    icon: <Activity size={18} />,
    title: 'Monitoring & Ops',
    desc: 'Day-to-day infrastructure operations: observability, key management, and incident response.',
    links: [
      { label: 'Monitoring', href: '/docs/operator/monitoring' },
      { label: 'Keystore Management', href: '/docs/operator/keystore' },
      { label: 'FAQs & Issues', href: '/docs/operator/faq' },
    ],
  },
];

const HARDWARE = [
  { spec: 'CPU',     req: '8-core dedicated (16 recommended for sequencer)' },
  { spec: 'RAM',     req: '32 GB ECC (64 GB for local Neo4j instances)' },
  { spec: 'Storage', req: '2 TB NVMe SSD (synchronized RPC + graph persistence)' },
  { spec: 'Network', req: '1 Gbps dedicated uplink, static IP recommended' },
  { spec: 'OS',      req: 'Ubuntu 22.04 LTS or Debian 12 (bare-metal or VPS)' },
];

export default function OperatorOverviewPage() {
  return (
    <div className="doc-content">

      <p className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-25 mb-8">
        Operator / Overview
      </p>

      <h1>Operator Overview</h1>

      <p>
        This section covers everything you need to run and maintain Whale Alert Network infrastructure.
        Whether you're running a full node for personal sovereignty or operating a professional sequencer,
        every guide you need is here.
      </p>

      <div className="callout">
        <p>
          <strong>Getting started:</strong> Review <Link href="/docs/operator/prerequisites" className="underline opacity-80 hover:opacity-100">Prerequisites</Link> first,
          then <Link href="/docs/operator/setup/node" className="underline opacity-80 hover:opacity-100">run a full node</Link>.
          Sequencer and Prover roles build on top of a running node.
        </p>
      </div>

      <h2>Roles</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px border border-black/8 dark:border-white/8 my-6">
        {ROLES.map((role, i) => (
          <div key={i} className="p-7 border-b border-r border-black/8 dark:border-white/8 flex flex-col gap-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3 opacity-70">
              {role.icon}
              <span className="font-mono text-[11px] font-black uppercase tracking-[0.2em]">{role.title}</span>
            </div>
            <p className="text-[13px] opacity-55 leading-relaxed m-0">{role.desc}</p>
            <div className="flex flex-col gap-1">
              {role.links.map((lnk, j) => (
                <Link key={j} href={lnk.href}
                  className="flex items-center gap-2 font-mono text-[11px] opacity-40 hover:opacity-100 hover:text-[#00C076] transition-all group">
                  <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                  {lnk.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <h2>Getting Started</h2>
      <div className="flex flex-col gap-px border border-black/8 dark:border-white/8 my-4">
        {[
          { step: '01', label: 'Review Prerequisites', href: '/docs/operator/prerequisites', note: 'Hardware & software requirements' },
          { step: '02', label: 'Run a Full Node', href: '/docs/operator/setup/node', note: 'The foundation for all roles' },
          { step: '03', label: 'Choose your path', href: '/docs/operator/setup/sequencer', note: 'Sequencer or Prover' },
          { step: '04', label: 'Set up Monitoring', href: '/docs/operator/monitoring', note: 'Observability & alerting' },
        ].map((s, i) => (
          <Link key={i} href={s.href}
            className="flex items-center gap-5 px-5 py-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
            <span className="font-mono text-[22px] font-black opacity-10 group-hover:opacity-25 transition-opacity w-8 shrink-0">{s.step}</span>
            <div className="flex-1">
              <div className="font-mono text-[12px] font-black uppercase tracking-wide">{s.label}</div>
              <div className="font-mono text-[10px] opacity-35 mt-0.5">{s.note}</div>
            </div>
            <ArrowRight size={12} className="opacity-20 group-hover:opacity-60 group-hover:translate-x-0.5 transition-all" />
          </Link>
        ))}
      </div>

      <h2>Hardware Requirements</h2>
      <table>
        <thead>
          <tr><th>Component</th><th>Requirement</th></tr>
        </thead>
        <tbody>
          {HARDWARE.map((h, i) => (
            <tr key={i}>
              <td><strong>{h.spec}</strong></td>
              <td>{h.req}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Reference</h2>
      <div className="flex flex-col gap-2">
        {[
          { label: 'CLI Reference', href: '/docs/operator/reference/cli' },
          { label: 'Node JSON RPC API', href: '/docs/operator/reference/rpc' },
          { label: 'Changelog', href: '/docs/operator/reference/changelog' },
          { label: 'Glossary', href: '/docs/operator/reference/glossary' },
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
