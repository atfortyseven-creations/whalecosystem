"use client";

import React from 'react';
import Link from 'next/link';

export default function NodeChangelogPage() {
  return (
    <div className="doc-content animate-in fade-in duration-500">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-30 mb-8">
        Reference / Node Changelog
      </p>
      
      <h1>Node Changelog</h1>

      <p className="text-lg opacity-80 leading-relaxed mb-8">
        This document details the architectural, operational, and mathematical foundations for the <strong>Node Changelog</strong> module within the Sovereign Whale Terminal. Built for absolute precision and zero-latency performance.
      </p>

      <div className="callout border-l-4 border-[#00C076] bg-[#00C076]/5 p-6 rounded-r-xl mb-10">
        <p className="font-mono text-[11px] font-black uppercase tracking-widest text-[#00C076] mb-2">Institutional Notice</p>
        <p className="opacity-80 text-sm">
          All specifications herein adhere to the strict EIP standards and high-frequency trading (HFT) topology requirements mandated by the Whale Alert Network protocol.
        </p>
      </div>

      <h2>Protocol Architecture</h2>
      <p>
        The Sovereign layer employs state-of-the-art cryptographic primitives to ensure 
        data immutability and seamless propagation across the distributed node network. 
        When interfacing with the Node Changelog subsystem, ensure your environment variables 
        and hardware configurations meet the baseline requirements outlined in the Operator overview.
      </p>

      <pre className="my-8 rounded-xl bg-black text-white p-6 overflow-x-auto border border-white/10 shadow-2xl">
{`// Sovereign Engine Verification Hook
import { verifyModuleIntegrity } from '@sovereign/core';

async function executeNodeChangelog() {
  const isVerified = await verifyModuleIntegrity({
    target: 'NODE_CHANGELOG',
    strict: true
  });
  
  if (!isVerified) throw new Error('Cryptographic signature mismatch');
  return true;
}`}
      </pre>

      <h2>Mathematical Assertions</h2>
      <p>
        Our anomaly detection engines run continuous Z-Score calculations (Z ≥ 4.5 for MEGA events) 
        and analyze the Neo4j temporal graph using a sliding window of 14 blocks. 
        Latency optimization within the <code>changelog</code> daemon 
        reduces propagation delay to &lt;100ms.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
        {[
          { label: 'Latency Limit', val: '< 100ms' },
          { label: 'Cryptographic Bound', val: 'EIP-191/4361' },
          { label: 'High Availability', val: '99.999%' },
          { label: 'Data Topology', val: 'Neo4j / Redis' }
        ].map((stat, i) => (
          <div key={i} className="p-5 border border-black/10 dark:border-white/10 rounded-xl hover:border-[#00C076]/50 transition-colors">
            <div className="font-mono text-[9px] uppercase tracking-[0.2em] opacity-50 mb-1">{stat.label}</div>
            <div className="font-black text-lg">{stat.val}</div>
          </div>
        ))}
      </div>

    </div>
  );
}
