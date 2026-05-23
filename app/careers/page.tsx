import type { Metadata } from 'next';
import { CareersPageClient } from './CareersPageClient';

export const metadata: Metadata = {
  title: 'Careers | Whale Alert Network',
  description: 'Join the engineering and analytics teams building the most trusted on-chain forensic platform for global institutions.',
  openGraph: {
    title: 'Careers | Whale Alert Network',
    description: 'Architect the global financial ledger. Remote-first, high-autonomy, and institutional scale.',
    url: 'https://humanidfi.com/careers',
    siteName: 'Whale Alert Network',
    locale: 'en_US',
    type: 'website',
  },
};

export default function CareersPage() {
  return <CareersPageClient />;
}
