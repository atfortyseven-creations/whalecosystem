import React from "react";
import fs from "fs";
import path from "path";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sovereign Whitepaper | Architectural Protocols",
  description: "The mathematical and strict architectural documentation of the Sovereign Vault, EVM thermodynamics, and Zero-Knowledge integration.",
};

export default async function WhitepaperPage() {
  const filePath = path.join(process.cwd(), "SOVEREIGN_WHITEPAPER.md");
  let content = "System Offline - File not found.";
  
  try {
    content = fs.readFileSync(filePath, "utf8");
  } catch (err) {
    console.error("Failed to read whitepaper", err);
  }

  // Purely rudimentary static conversion for absolute backend reliability without external pure-markdown deps.
  const htmlContent = content
    .replace(/^# (.*$)/gim, '<h1 class="text-4xl font-bold mb-8 text-[#050505]">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-12 mb-4 text-[#050505] border-b pb-2">$1</h2>')
    .replace(/^\- (.*$)/gim, '<li class="ml-6 list-disc text-[15px] mb-2">$1</li>')
    .replace(/\*\*(.*)\*\*/gim, '<strong class="font-bold text-black">$1</strong>')
    .replace(/`(.*?)`/gim, '<code class="bg-[#F5F5F5] font-mono text-[13px] px-1 py-0.5 rounded border border-black/10">$1</code>')
    .replace(/\n\n/gim, '<br /><br />')
    .replace(/---/gim, '<hr class="my-10 border-black/10" />')
    .replace(/_End of Manuscript_/gim, '<p class="font-mono text-[10px] uppercase tracking-widest text-black/40 mt-16 text-center">End of Manuscript</p>');

  return (
    <div className="min-h-screen bg-[#FAF9F6] selection:bg-[#FBC9C2]/30">
      <div className="max-w-3xl mx-auto px-6 py-32">
        <div className="mb-12">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-black/10 text-[10px] font-mono uppercase tracking-[0.2em] font-semibold text-black/60 mb-6 bg-white/50">
               <span className="w-1.5 h-1.5 rounded-full bg-[var(--aztec-orchid)]" /> Official Documentation
            </div>
        </div>
        
        <div 
          className="prose prose-p:text-black/70 prose-p:leading-relaxed prose-p:text-[15px] max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlContent }} 
        />
      </div>
    </div>
  );
}
