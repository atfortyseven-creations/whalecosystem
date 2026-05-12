"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function OperatorComingSoonPage() {
  return (
    <div className="doc-content animate-in fade-in duration-500">
      <Link href="/docs/operator/overview" className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] opacity-30 hover:opacity-70 transition-opacity mb-12">
        <ArrowLeft size={11} /> Operator Overview
      </Link>

      <div className="font-mono text-[9px] uppercase tracking-[0.3em] opacity-20 mb-6">
        Operator / Documentation
      </div>

      <article>
        <h1>Under Construction</h1>
        <p>
          This section of the Whale Alert Operator documentation is currently being finalized for the v2.0 mainnet release.
        </p>
        <p>
          Please refer to the <Link href="/docs/operator/setup/node" className="underline opacity-80 hover:opacity-100">Full Node Setup</Link> guide or check back soon for updates regarding Sequencer, Prover, and Keystore management.
        </p>
      </article>

      <footer className="mt-24 pt-8 border-t border-current/8">
        <p className="font-mono text-[9px] uppercase tracking-[0.3em] opacity-20">
          © 2026 atfortyseven-creations · Whale Alert Network
        </p>
      </footer>
    </div>
  );
}
