import { Suspense } from 'react';
import WhaleAlertLanding from '@/components/landing/WhaleAlertLanding';

export default function Home() {
  return (
    <main>
      <Suspense fallback={
        <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center font-mono text-[10px] uppercase tracking-widest text-[#050505]/40 border-none outline-none">
          Synchronizing Genesis Node...
        </div>
      }>
        <WhaleAlertLanding />
      </Suspense>
    </main>
  );
}
