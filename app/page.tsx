import { Suspense } from 'react';
import { headers, cookies } from 'next/headers';
import { ClientRootRouter } from '@/components/landing/ClientRootRouter';
import { MobileLanding } from '@/components/landing/MobileLanding';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  const isMobile = /android|iphone|ipad|ipod/i.test(userAgent);

  // Both authenticated and unauthenticated users see the landing page.
  // The ClientRootRouter renders a session-aware banner + DownheadSection
  // for desktop. Mobile gets its own dedicated layout.
  return (
    <main>
      <Suspense fallback={
        <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center font-mono text-[10px] uppercase tracking-widest text-black/20">
          INITIALIZING...
        </div>
      }>
        {isMobile ? <MobileLanding /> : <ClientRootRouter />}
      </Suspense>
    </main>
  );
}
