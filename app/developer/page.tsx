import { Suspense } from 'react';
import WhaleAlertLanding from '@/components/landing/WhaleAlertLanding';
import { parseReadmeToManifesto } from '@/lib/manifesto-parser';

export const dynamic = 'force-dynamic';

export default async function DeveloperPage() {
  const sections = parseReadmeToManifesto('WHALE_ALERT_NETWORK_PRESENTATION.md');

  return (
    <main>
      <Suspense
        fallback={
          <div
            style={{
              minHeight: '100vh',
              backgroundColor: '#FDFCF8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: '"Inter", sans-serif',
              fontSize: 12,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#aaa',
            }}
          >
            Loading…
          </div>
        }
      >
        <WhaleAlertLanding sections={sections} />
      </Suspense>
    </main>
  );
}
