import { Suspense } from 'react';
import WhaleAlertLanding from '@/components/landing/WhaleAlertLanding';

export default function Home() {
  return (
    <main>
      <Suspense fallback={
        <div className="min-h-screen bg-white dark:bg-[#050505] flex items-center justify-center font-mono text-[10px] uppercase tracking-widest text-black/10 dark:text-white/10">
          Synchronizing Genesis Node...
        </div>
      }>
        <WhaleAlertLanding />
      </Suspense>
    </main>
  );
}
