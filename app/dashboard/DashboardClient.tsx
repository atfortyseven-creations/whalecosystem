"use client";

import dynamic from 'next/dynamic';

const WhaleDashboard = dynamic(
  () => import('@/components/dashboard/WhaleDashboard'),
  { ssr: false, loading: () => <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-[#00FF55] border-t-transparent animate-spin"/></div> }
);

export default function DashboardClient() {
  return <WhaleDashboard />;
}
