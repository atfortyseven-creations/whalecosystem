import { Suspense } from 'react';
import { headers } from 'next/headers';
import WhaleAlertLanding from '@/components/landing/WhaleAlertLanding';
import { MobileLanding } from '@/components/landing/MobileLanding';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  const isMobile = /android|iphone|ipad|ipod/i.test(userAgent);

  let readmeContent = '';
  try {
    const readmePath = path.join(process.cwd(), 'README.md');
    readmeContent = fs.readFileSync(readmePath, 'utf8');
  } catch (error) {
    console.error("Failed to load README content", error);
  }

  return (
    <main>
      <Suspense fallback={
        <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center font-mono text-[10px] uppercase tracking-widest text-[#050505]/40 border-none outline-none">
          Synchronizing Genesis Node...
        </div>
      }>
        {isMobile ? <MobileLanding /> : <WhaleAlertLanding readmeContent={readmeContent} />}
      </Suspense>
    </main>
  );
}
