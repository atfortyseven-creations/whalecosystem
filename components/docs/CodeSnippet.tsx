'use client';

import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export default function CodeSnippet({ code, language = 'bash' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 relative group rounded-xl overflow-hidden border border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center justify-between px-4 py-2 border-b border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02]">
        <span className="font-mono text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40">{language}</span>
        <button
          onClick={handleCopy}
          className="text-black/30 hover:text-black dark:text-white/30 dark:hover:text-white transition-colors"
          title="Copy code"
        >
          {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="font-mono text-[12px] text-black/80 dark:text-white/80 whitespace-pre">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
