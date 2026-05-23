"use client";

import React from 'react';
import { NewsTerminal } from '@/components/news/NewsTerminal';
import { SystemFooter } from '@/components/landing/SystemFooter';
import { WhaleChatLink } from '@/components/shared/WhaleChatLink';

export default function WhaleNewsPage() {
  return (
    <div className="flex-1 flex flex-col bg-white text-slate-900 w-full min-h-screen">
      
      <div className="w-full h-full flex-1 flex flex-col relative">
        <div className="w-full flex-1 bg-white flex flex-col z-10 overflow-hidden">
          <NewsTerminal />
        </div>
      </div>
      
      <WhaleChatLink />
      <SystemFooter />
    </div>
  );
}
