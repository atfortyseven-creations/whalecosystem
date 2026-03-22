import { DashboardShell } from '@/components/dashboard/DashboardShell';
import type { Metadata } from 'next';
import './dashboard.css';

export const metadata: Metadata = {
    title: "Whale Dashboard | Operations Canvas",
    description: "Institutional Sovereign Project Topology Terminal",
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function DashboardPage() {
    return <DashboardShell />;
}
