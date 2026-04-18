"use client";

import React, { useEffect, useMemo, useState } from "react";
import { OptimizedLocalLottie } from './OptimizedLocalLottie';
import { useRouter } from "next/navigation";

export interface ManifestoSection {
  id: string;
  title: string;
  body: string[];
}

interface WhaleAlertLandingProps {
  sections?: ManifestoSection[];
}

const LOTTIE_FILES = [
  "A Female Employee is Reading Financial Statements.json",
  "Abstract Isometric Loader #1.json",
  "Ball playing.json",
  "Big Data Analytics.json",
  "Browser Loading.json",
  "Business Analysis.json",
  "Business.json",
  "Crypto coins.json",
  "DeeWork About Blockchain.json",
  "Earth globe rotating with Seamless loop animation.json",
  "File Loading.json",
  "Interactive Save & Bookmark Button with Dark Mode.json",
  "Isometric data analysis.json",
  "Manufacturing Industry Working Staff.json",
  "Metaverse animations.json",
  "Online Payment.json",
  "Payment Success.json",
  "Payments.json",
  "Share.json",
  "Trade.json",
  "enterprice.json",
  "successfully.json",
  "website.json"
];

/**
 * Pre-computes which lottie to attach to each paragraph.
 * This MUST happen outside render to avoid mutating state during JSX evaluation
 * (which would cause React StrictMode double-invoke bugs and non-deterministic renders).
 */
function buildRenderPlan(sections: ManifestoSection[]) {
  let counter = 0;
  const plan: Array<{
    sectionId: string;
    paraIndex: number;
    lottie: string | null;
  }> = [];

  for (const section of sections) {
    for (let i = 0; i < section.body.length; i++) {
      const para = section.body[i];
      const isStructural = para.startsWith('[SUBTITLE]') || para.startsWith('[LIST_ITEM]');
      if (!isStructural && counter < LOTTIE_FILES.length) {
        plan.push({ sectionId: section.id, paraIndex: i, lottie: LOTTIE_FILES[counter] });
        counter++;
      } else {
        plan.push({ sectionId: section.id, paraIndex: i, lottie: null });
      }
    }
  }
  return { plan, usedCount: counter };
}

export default function WhaleAlertLanding({ sections = [] }: WhaleAlertLandingProps) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  // Memoize so re-renders don't recount lotties
  const { plan, usedCount } = useMemo(() => buildRenderPlan(sections), [sections]);

  const getLottie = (sectionId: string, paraIndex: number) =>
    plan.find(p => p.sectionId === sectionId && p.paraIndex === paraIndex)?.lottie ?? null;

  const remainingLotties = LOTTIE_FILES.slice(usedCount);

  if (!mounted) return null;

  return (
    <div className="w-full min-h-screen bg-[#050505] text-[#E0E0E0] font-mono selection:bg-[#E0E0E0] selection:text-[#050505]">
      <div className="w-full max-w-5xl mx-auto px-6 md:px-0 pt-24 pb-32">

        {/* Header */}
        <div className="mb-16 border-b border-[#E0E0E0]/20 pb-8">
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#E0E0E0]/50 mb-8">
            SYSTEM EXPLANATION / LEGACY TERMINAL VIEW
          </p>
          <h1 className="text-xl md:text-2xl font-normal text-[#E0E0E0] uppercase tracking-widest mb-6">
            WHALE ALERT NETWORK PROTOCOL
          </h1>
          <p className="text-[12px] text-[#E0E0E0]/70 leading-[2] mb-4 uppercase tracking-widest max-w-3xl">
            THE FOLLOWING DOCUMENT EXPLAINS WHAT THE SYSTEM IS, WHAT IT IS FOR, AND WHAT WE CAN DO WITH IT.
            ALL LOTTIE TELEMETRY NODES ARE SYNCHRONIZED BELOW IN PURE MONOCHROME.
          </p>
          <button
            onClick={() => router.push('/')}
            className="mt-8 text-[10px] uppercase tracking-widest text-[#050505] bg-[#E0E0E0] px-6 py-3 hover:bg-white transition-colors"
          >
            RETURN TO MAIN TERMINAL
          </button>
        </div>

        <div className="w-full border border-[#E0E0E0]/20 bg-[#0A0A0A]">

          {/* Index */}
          <div className="px-8 pt-8 pb-8 border-b border-[#E0E0E0]/20">
            <p className="text-[11px] uppercase tracking-[0.3em] text-[#E0E0E0]/50 mb-6">INDEX</p>
            <ol className="space-y-4">
              {sections.map((section, index) => (
                <li key={section.id}>
                  <button
                    onClick={() => {
                      const el = document.getElementById(section.id);
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className="text-[12px] text-[#E0E0E0]/70 hover:text-[#E0E0E0] uppercase tracking-widest text-left w-full flex gap-4"
                  >
                    <span className="text-[#E0E0E0]/40 w-8 shrink-0">{String(index + 1).padStart(2, "0")}.</span>
                    <span>{section.title}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>

          {/* Body */}
          <div className="divide-y divide-[#E0E0E0]/10">
            {sections.map((section) => (
              <div
                key={section.id}
                id={section.id}
                className="px-8 py-12 scroll-mt-8"
              >
                <h2 className="text-[14px] font-bold uppercase tracking-[0.3em] text-[#E0E0E0] mb-8 pb-4 border-b border-[#E0E0E0]/10">
                  {section.title}
                </h2>
                <div className="space-y-12">
                  {section.body.map((para, i) => {
                    if (para.startsWith('[SUBTITLE]')) {
                      return (
                        <h3 key={i} className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E0E0E0]/60 pt-6 mb-4">
                          {para.replace('[SUBTITLE]', '')}
                        </h3>
                      );
                    }
                    if (para.startsWith('[LIST_ITEM]')) {
                      return (
                        <div key={i} className="flex gap-4 text-[12px] leading-[1.8] text-[#E0E0E0]/80 lowercase tracking-widest pl-4 border-l border-[#E0E0E0]/20">
                          <span className="text-[#E0E0E0]/40 shrink-0">—</span>
                          <span className="flex-1">{para.replace('[LIST_ITEM]', '')}</span>
                        </div>
                      );
                    }

                    const lottie = getLottie(section.id, i);
                    return (
                      <div key={i} className="flex flex-col md:flex-row gap-12 items-start">
                        <div className="flex-1 w-full">
                          <p className="text-[12px] leading-[2] text-[#E0E0E0]/80 lowercase tracking-widest">
                            {para}
                          </p>
                        </div>
                        {lottie && (
                          <div className="w-full md:w-64 h-64 shrink-0 border border-[#E0E0E0]/10 bg-[#000000] overflow-hidden p-6 flex flex-col items-center justify-center">
                            <OptimizedLocalLottie
                              filename={lottie}
                              className="w-full h-full grayscale opacity-70"
                            />
                            <span className="text-[8px] uppercase tracking-widest text-[#E0E0E0]/30 mt-4 block w-full text-center truncate">
                              {lottie.replace('.json', '')}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Remaining lotties that weren't paired with paragraphs */}
            {remainingLotties.length > 0 && (
              <div className="px-8 py-12">
                <h2 className="text-[14px] font-bold uppercase tracking-[0.3em] text-[#E0E0E0] mb-8">
                  ADDITIONAL TELEMETRY MODULES
                </h2>
                <div className="flex flex-wrap gap-6">
                  {remainingLotties.map((lottie, idx) => (
                    <div
                      key={idx}
                      className="w-48 h-48 shrink-0 border border-[#E0E0E0]/10 bg-[#000000] p-4 flex flex-col items-center justify-center"
                    >
                      <OptimizedLocalLottie
                        filename={lottie}
                        className="w-full h-full grayscale opacity-70"
                      />
                      <span className="text-[8px] uppercase tracking-widest text-[#E0E0E0]/30 mt-4 truncate w-full text-center">
                        {lottie.replace('.json', '')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <footer className="mt-16 pt-8 border-t border-[#E0E0E0]/20 text-[10px] uppercase tracking-widest text-[#E0E0E0]/30 flex justify-between">
          <span>© WHALE ALERT NETWORK</span>
          <span>END OF DOCUMENT</span>
        </footer>

      </div>
    </div>
  );
}
