"use client";

import React from 'react';
import { Globe } from 'lucide-react';
import { NewsTerminal } from '@/components/news/NewsTerminal';
import { SovereignFooter } from '@/components/landing/SovereignFooter';

export default function WhaleNewsPage() {
  return (
    <div className="flex-1 flex flex-col bg-transparent w-full">
      
      {/* ── PRISTINE SPACING ── */}
      <div className="w-full pt-24" />

      <div className="flex-1 w-full px-0 mb-20">
        <NewsTerminal />
      </div>
      
      <SovereignFooter />
    </div>
  );
}
