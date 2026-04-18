import { Suspense } from 'react';
import { headers } from 'next/headers';
import { SovereignLanding } from '@/components/landing/SovereignLanding';
import { MobileLanding } from '@/components/landing/MobileLanding';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  const isMobile = /android|iphone|ipad|ipod/i.test(userAgent);

  return (
    <main>
      <Suspense fallback={
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center font-mono text-[10px] uppercase tracking-widest text-[#00f5ff]/40">
          INITIALIZING SOVEREIGN ENGINE...
        </div>
      }>
        {isMobile ? <MobileLanding /> : <SovereignLanding />}
      </Suspense>
    </main>
  );
}
