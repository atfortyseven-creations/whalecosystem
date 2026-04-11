"use client";

import { useState, useEffect } from 'react';
import PortfolioView from '@/components/rainbow/PortfolioView';
import { LegendaryLoader } from '@/components/ui/LegendaryLoader';
import { useLivePortfolio } from '@/hooks/useLivePortfolio';
import "@/app/dashboard/dashboard.css";

export default function PortfolioPage() {
  const [mounted, setMounted] = useState(false);
  const { totalPnl, assets, change24hUSD, change24hPercent } = useLivePortfolio();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <LegendaryLoader title="Institutional Substrate" subtitle="Initializing Legendary Deck v4..." />;
  }

  return (
    <div className="min-h-screen bg-[#0B0E11]">
      <PortfolioView 
        totalValue={totalPnl}
        balances={assets || []}
        prices={{}}
        change24hValue={change24hUSD}
        change24hPercent={change24hPercent}
      />
    </div>
  );
}
