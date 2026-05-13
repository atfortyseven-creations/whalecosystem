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
      <Suspense fallback={null}>
        <SmartLandingRouter isMobileUserAgent={isMobile} />
      </Suspense>
    </main>
  );
}
