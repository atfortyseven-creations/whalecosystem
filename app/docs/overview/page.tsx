"use client";

import React from 'react';
import Link from 'next/link';

export default function PlatformOverviewPage() {
  return (
    <div className="doc-content animate-in fade-in duration-500">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-30 mb-8">
        Docs / Platform Overview
      </p>
      
      <h1>Platform Overview</h1>

      <p className="text-lg opacity-80 leading-relaxed mb-8">
        This document details the architectural, operational, and mathematical foundations for the <strong>Platform Overview</strong> module within the Whale Alert Network. Built for absolute precision, zero-latency performance, and medical/financial data integrity.
      </p>

      <div className="callout border-l-4 border-black bg-black/5 p-6 rounded-r-xl mb-10">
        <p className="font-mono text-[11px] font-black uppercase tracking-widest text-black mb-2">Institutional Notice</p>
        <p className="opacity-80 text-sm">
          All specifications herein adhere to the strict EIP standards and high-reliability requirements mandated by the Whale Alert Network. Our core engines ensure absolute systemic integrity for all managed data.
        </p>
      </div>

      <h2>Protocol Architecture</h2>
      <p>
        The platform employs state-of-the-art cryptographic primitives to ensure 
        data immutability and seamless propagation across the distributed node network. 
        When interfacing with the Platform Overview subsystem, ensure your environment variables 
        and hardware configurations meet the baseline requirements outlined in the Operator overview.
      </p>

      <pre className="my-8 rounded-xl bg-[#F8F8F8] text-black p-6 overflow-x-auto border border-black/5 shadow-sm">
{`// Engine Verification Hook
import { verifyModuleIntegrity } from '@network/core';

async function executePlatformOverview() {
  const isVerified = await verifyModuleIntegrity({
    target: 'PLATFORM_OVERVIEW',
    strict: true
  });
  
  if (!isVerified) throw new Error('Cryptographic signature mismatch');
  return true;
}`}
      </pre>

      <h2>Mathematical Assertions</h2>
      <p>
        Our anomaly detection engines run continuous verification across historical data points,
        analyzing temporal graphs using optimized consensus windows. 
        Latency optimization within the <code>overview</code> daemon 
        reduces propagation delay, securing data instantly.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
        {[
          { label: 'Latency Limit', val: '< 100ms' },
          { label: 'Cryptographic Bound', val: 'EIP-191 / SHA-3' },
          { label: 'High Availability', val: '99.99%' },
          { label: 'Integrity Verification', val: 'Mathematical Hashing' }
        ].map((stat, i) => (
          <div key={i} className="p-5 bg-black/5 border border-black/5 rounded-xl hover:bg-black/10 transition-all duration-300">
            <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-black/40 mb-1">{stat.label}</div>
            <div className="font-black text-lg text-black">{stat.val}</div>
          </div>
        ))}
      </div>

    </div>
  );
}
