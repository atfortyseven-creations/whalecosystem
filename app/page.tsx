import { Suspense } from 'react';
import { headers, cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ClientRootRouter } from '@/components/landing/ClientRootRouter';
import { MobileLanding } from '@/components/landing/MobileLanding';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  const isMobile = /android|iphone|ipad|ipod/i.test(userAgent);
  
  const cookieStore = await cookies();
  const hasSovereignHandshake = cookieStore.has('sovereign_handshake');

  // Enforce all PC users to pass through /connect if they haven't established a handshake
  if (!isMobile && !hasSovereignHandshake) {
    redirect('/connect');
  }

  return (
    <main>
      <Suspense fallback={
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center font-mono text-[10px] uppercase tracking-widest text-[#00f5ff]/40">
          INITIALIZING...
        </div>
      }>
        {isMobile ? <MobileLanding /> : <ClientRootRouter />}
      </Suspense>
    </main>
  );
}
