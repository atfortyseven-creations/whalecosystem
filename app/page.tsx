import { Suspense } from 'react';
import { headers } from 'next/headers';
import { SmartLandingRouter } from '@/components/landing/SmartLandingRouter';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  const isMobile = /android|iphone|ipad|ipod/i.test(userAgent);

  return (
    <main>
      <Suspense fallback={
        <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center font-mono text-[10px] uppercase tracking-widest text-black/20">
          INITIALIZING...
        </div>
      }>
        <SmartLandingRouter isMobileUserAgent={isMobile} />
      </Suspense>
    </main>
  );
}
