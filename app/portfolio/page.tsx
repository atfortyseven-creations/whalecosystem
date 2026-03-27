"use client";

import { useState, useEffect } from 'react';
import { InstitutionalShell } from '@/components/shared/InstitutionalShell';
import { InstitutionalPortfolioView } from '@/components/bsv/InstitutionalPortfolioView';
import { LegendaryLoader } from '@/components/ui/LegendaryLoader';
import "@/app/dashboard/dashboard.css";

export default function PortfolioPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <LegendaryLoader title="Institutional Substrate" subtitle="Initializing Legendary Deck v4..." />;
  }

  return (
    <InstitutionalShell title="Whale Portfolio" subtitle="Sovereign Capital Architecture" badge="PORTFOLIO" badgeVariant="orchid">
        <InstitutionalPortfolioView />
    </InstitutionalShell>
  );
}
