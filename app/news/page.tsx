"use client";

import React from 'react';
import { Globe } from 'lucide-react';
import { NewsTerminal } from '@/components/news/NewsTerminal';
import { SovereignFooter } from '@/components/landing/SovereignFooter';

export default function WhaleNewsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      
      {/* ── PRISTINE SPACING ── */}
      <div className="w-full pt-24" />

      <div className="flex-1 max-w-[2560px] mx-auto w-full px-6 lg:px-12 mb-20">
        <NewsTerminal />
      </div>
      
      <SovereignFooter />
    </div>
  );
}
