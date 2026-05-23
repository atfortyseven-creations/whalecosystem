import React from 'react';
import { AztecDocPage } from '@/components/landing/AztecDocPage';
import { TOKENOMICS_SECTIONS } from '@/lib/content/footerPagesAztec';

export default function TokenomicsPage() {
  return (
    <AztecDocPage
      eyebrow="Protocol · QDs Tokenomics"
      title="QDs Tokenomics & Shielded Distribution"
      subtitle="Supply limits, private transfers on Aztec, and Proof of Contribution—how QDs rewards real work instead of passive watching."
      sections={TOKENOMICS_SECTIONS}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Max Supply', value: '21,000,000', sub: 'QDs' },
          { label: 'Consensus', value: 'Proof of Contribution', sub: 'ZK-validated' },
          { label: 'Privacy Model', value: 'Aztec Shielded', sub: 'UTXO notes' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-6 rounded-2xl border border-black/10 bg-[#2a1b4d]/[0.04] text-center"
          >
            <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#050505]/40 mb-2">
              {stat.label}
            </p>
            <p className="text-xl font-black text-[#050505]">{stat.value}</p>
            <p className="font-mono text-[9px] text-[#050505]/35 mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>
    </AztecDocPage>
  );
}
