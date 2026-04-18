import { Suspense } from 'react';
import { headers } from 'next/headers';
import WhaleAlertLanding from '@/components/landing/WhaleAlertLanding';
import { parseReadmeToManifesto } from '@/lib/manifesto-parser';

export const dynamic = 'force-dynamic';

export default async function DeveloperPage() {
  const sections = parseReadmeToManifesto();

  return (
    <main>
      {/* We add a subtle banner to indicate this is the legacy version as per plan, but the component itself is 100% clone */}
      <div className="fixed top-0 left-0 w-full bg-[#050505] text-[#FAF9F6] text-center font-mono text-[9px] uppercase tracking-[0.5em] py-1 z-50 opacity-80 pointer-events-none">
        LEGACY VIEW — v6.12.0
      </div>
      <Suspense fallback={
        <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center font-mono text-[10px] uppercase tracking-widest text-[#050505]/40">
          synchronizing...
        </div>
      }>
        <WhaleAlertLanding sections={sections} />
      </Suspense>
    </main>
  );
}
