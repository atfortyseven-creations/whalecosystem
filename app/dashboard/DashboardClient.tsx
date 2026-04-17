"use client";

import dynamic from 'next/dynamic';

const WhaleDashboard = dynamic(
  () => import('@/components/dashboard/WhaleDashboard'),
  { ssr: false, loading: () => <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center"><div className="w-6 h-6 rounded-full border-2 border-[#050505] border-t-transparent animate-spin"/></div> }
);

export default function DashboardClient() {
  return <WhaleDashboard />;
}
