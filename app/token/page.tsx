"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TokenPage() {
  const [entropyValue, setEntropyValue] = useState(50);

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#050505]">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b bg-white/60 backdrop-blur-3xl border-black/5">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 rounded-xl border border-black/5 bg-white/65 hover:bg-black/5 transition-all text-black/40 hover:text-black">
            <ArrowLeft size={16} />
          </Link>
        </div>
      </header>

      <div className="w-full px-6 md:px-12 pb-24 pt-8 space-y-6">
        {/* Token Balance */}
        <div className="rounded-3xl border border-black/5 bg-white/65 backdrop-blur-3xl p-8">
          <div className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-black/40 mb-4">
            Token Balance
          </div>
          <div className="text-6xl md:text-7xl font-black tracking-tighter font-mono text-[#050505] mb-2">
            1,234.56
          </div>
          <div className="text-sm font-mono text-black/40">
            QDs
          </div>
        </div>

        {/* Transfer Receipts Panel */}
        <div className="rounded-3xl border border-black/5 bg-white/65 backdrop-blur-3xl p-8">
          <div className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-black/40 mb-6">
            Transfer Receipts
          </div>
          <div className="space-y-4">
            {[
              { date: '2024-01-15', amount: '100.00 QDs', to: '0x1234...5678', status: 'Completed' },
              { date: '2024-01-14', amount: '50.00 QDs', to: '0xabcd...efgh', status: 'Completed' },
              { date: '2024-01-13', amount: '25.00 QDs', to: '0x9876...5432', status: 'Completed' },
            ].map((receipt, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-2xl border border-black/5 bg-white/40">
                <div className="flex flex-col gap-1">
                  <div className="text-sm font-black text-[#050505]">
                    {receipt.amount}
                  </div>
                  <div className="text-[10px] font-mono text-black/40">
                    {receipt.date}
                  </div>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <div className="text-[10px] font-mono text-black/40">
                    {receipt.to}
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                    {receipt.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Entropy Panel */}
        <div className="rounded-3xl border border-black/5 bg-white/65 backdrop-blur-3xl p-8">
          <div className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-black/40 mb-6">
            Entropy
          </div>
          <div className="space-y-6">
            {/* Entropy Visual Representation */}
            <div className="relative h-32 rounded-2xl border border-black/5 bg-white/40 overflow-hidden">
              <div 
                className="absolute inset-0 bg-gradient-to-r from-black/5 to-black/10 transition-all duration-500"
                style={{ width: `${entropyValue}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-4xl font-black font-mono text-[#050505]">
                  {entropyValue}%
                </div>
              </div>
            </div>

            {/* Entropy Description */}
            <div className="space-y-2">
              <div className="text-sm font-black text-[#050505]">
                Current Entropy Level
              </div>
              <div className="text-sm text-black/60 leading-relaxed">
                This shows how random and unpredictable your transactions are. Higher entropy means better security and privacy for your digital assets.
              </div>
            </div>

            {/* Entropy Details */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-black/5">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-mono font-black uppercase tracking-widest text-black/40">Security Level</span>
                <div className="font-black font-mono text-2xl text-[#050505]">High</div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-mono font-black uppercase tracking-widest text-black/40">Privacy Score</span>
                <div className="font-black font-mono text-2xl text-[#050505]">Excellent</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
