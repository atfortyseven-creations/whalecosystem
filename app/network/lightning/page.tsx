import { LightningDashboard } from '@/components/network/LightningDashboard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Lightning Network | WhaleAlert ID',
    description: 'Explore Top Lightning Nodes and Network Capacity.',
};

export default function LightningPage() {
    return <LightningDashboard />;
}

