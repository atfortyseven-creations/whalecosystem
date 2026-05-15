import React from "react";
import fs from "fs";
import path from "path";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Network Whitepaper | Architectural Protocols | Whale Alert Network",
  description: "The mathematical and architectural documentation of the Whale Alert Network: EVM architecture, Zero-Knowledge integration, and on-chain identity standards.",
};

export default async function WhitepaperPage() {
  const filePath = path.join(process.cwd(), "SOVEREIGN_WHITEPAPER.md");
  let content = "System Offline — Whitepaper file not found.";

  try {
    content = fs.readFileSync(filePath, "utf8");
  } catch (err) {
    console.error("Failed to read whitepaper", err);
  }

  // Inline HTML rendering — no external markdown deps required for SSR
  const htmlContent = content
    .replace(
      /^# (.*$)/gim,
      '<h1 class="text-4xl font-bold mb-8 text-white">$1</h1>'
    )
    .replace(
      /^## (.*$)/gim,
      '<h2 class="text-2xl font-bold mt-12 mb-4 text-white border-b border-white/10 pb-2">$1</h2>'
    )
    .replace(
      /^\- (.*$)/gim,
      '<li class="ml-6 list-disc text-[15px] mb-2 text-white/80">$1</li>'
    )
    .replace(
      /\*\*(.*)\*\*/gim,
      '<strong class="font-bold text-white">$1</strong>'
    )
    .replace(
      /`(.*?)`/gim,
      '<code class="bg-white/10 font-mono text-[13px] px-1 py-0.5 rounded border border-white/10 text-white/90">$1</code>'
    )
    .replace(/\n\n/gim, "<br /><br />")
    .replace(/---/gim, '<hr class="my-10 border-white/10" />')
    .replace(
      /_End of Manuscript_/gim,
      '<p class="font-mono text-[10px] uppercase tracking-widest text-white/30 mt-16 text-center">End of Document</p>'
    );

  return (
    <div className="min-h-screen bg-transparent selection:bg-white/10">
      <div className="max-w-3xl mx-auto px-6 py-32">
        <div className="mb-12">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-white/10 text-[10px] font-mono uppercase tracking-[0.2em] font-semibold text-white/60 mb-6 bg-white/5 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--aztec-orchid)]" /> Official Documentation
          </div>
        </div>

        <div
          className="prose prose-invert prose-p:text-white/70 prose-p:leading-relaxed prose-p:text-[15px] max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    </div>
  );
}
