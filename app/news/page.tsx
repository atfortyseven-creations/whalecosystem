import React from 'react';
import { NewsTerminal } from '@/components/news/NewsTerminal';
import { SovereignFooter } from '@/components/landing/SovereignFooter';

export default function WhaleNewsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">
        <NewsTerminal />
      </div>
      <SovereignFooter />
    </div>
  );
}
