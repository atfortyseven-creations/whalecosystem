"use client";

import React from 'react';
import Link from 'next/link';

export default function QuickstartGuidePage() {
  return (
    <div className="doc-content animate-in fade-in duration-500">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-30 mb-8">
        Docs / Quickstart Guide
      </p>
      
      <h1>Quickstart Guide</h1>

      <p className="text-lg opacity-80 leading-relaxed mb-8">
        This document details the architectural, operational, and mathematical foundations for the <strong>Quickstart Guide</strong> module within the Whale Alert Network. Built for absolute precision and high-performance data integrity.
      </p>

      <div className="callout border-l-4 border-black bg-black/5 p-6 rounded-r-xl mb-10">
        <p className="font-mono text-[11px] font-black uppercase tracking-widest text-black mb-2">Institutional Notice</p>
        <p className="opacity-80 text-sm">
          All specifications herein adhere to the strict EIP standards and institutional data management requirements mandated by the Whale Alert Network protocol.
        </p>
      </div>

      <h2>Protocol Architecture</h2>
      <p>
        The protocol employs state-of-the-art cryptographic primitives to ensure 
        data immutability and seamless propagation across the distributed node network. 
        When interfacing with the Quickstart Guide subsystem, ensure your environment variables 
        and hardware configurations meet the baseline requirements outlined in the Operator overview.
      </p>

      <pre className="my-8 rounded-xl bg-[#F8F8F8] text-black p-6 overflow-x-auto border border-black/5 shadow-sm">
{`// Engine Verification Hook
import { verifyModuleIntegrity } from '@network/core';

async function executeQuickstartGuide() {
  const isVerified = await verifyModuleIntegrity({
    target: 'QUICKSTART_GUIDE',
    strict: true
  });
  
  if (!isVerified) throw new Error('Cryptographic signature mismatch');
  return true;
}`}
      </pre>

      <h2>Mathematical Assertions</h2>
      <p>
        Our verification engines run continuous mathematical assessments across high-density data matrices.
        Latency optimization within the <code>quickstart</code> daemon 
        ensures efficient data synchronization.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
        {[
          { label: 'Latency Limit', val: '< 100ms' },
          { label: 'Cryptographic Bound', val: 'EIP-191/4361' },
          { label: 'High Availability', val: '99.99%' },
          { label: 'Data Topology', val: 'Distributed Ledger' }
        ].map((stat, i) => (
          <div key={i} className="p-5 border border-black/5 rounded-xl bg-black/5 hover:bg-black/10 transition-colors">
            <div className="font-mono text-[9px] uppercase tracking-[0.2em] opacity-40 mb-1">{stat.label}</div>
            <div className="font-black text-lg text-black">{stat.val}</div>
          </div>
        ))}
      </div>

    </div>
  );
}
