import { Suspense } from 'react';
import { headers } from 'next/headers';
import { ClientRootRouter } from '@/components/landing/ClientRootRouter';
import dynamicImport from 'next/dynamic';

export const dynamic = 'force-dynamic';

// MobileLanding must NEVER be server-rendered — it uses wagmi/rainbowkit client-only hooks.
// Dynamic import with ssr:false guarantees it only runs in the browser.
const MobileLanding = dynamicImport(
  () => import('@/components/landing/MobileLanding').then(m => ({ default: m.MobileLanding })),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center font-mono text-[10px] uppercase tracking-widest text-black/20">
        INITIALIZING...
      </div>
    ),
  }
);

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
        {isMobile ? <MobileLanding /> : <ClientRootRouter />}
      </Suspense>
    </main>
  );
}
