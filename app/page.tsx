import { Suspense } from 'react';
import { headers } from 'next/headers';
import { SmartLandingRouter } from '@/components/landing/SmartLandingRouter';
import { WhaleAlertLoader } from '@/components/ui/WhaleAlertLoader';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  const isMobile = /android|iphone|ipad|ipod/i.test(userAgent);

  return (
    <main>
      <Suspense fallback={<WhaleAlertLoader bg="#FDFCF8" color="#050505" />}>
        <SmartLandingRouter isMobileUserAgent={isMobile} />
      </Suspense>
    </main>
  );
}
