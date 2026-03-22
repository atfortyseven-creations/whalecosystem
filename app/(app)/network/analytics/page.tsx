import { Metadata } from 'next';
import { WhaleTrackerDashboard } from '@/components/network/whale/WhaleTrackerDashboard';

export const metadata: Metadata = {
    title: 'Network Analytics | Whale Alert Portal',
    description: 'High-fidelity Elite analytics, whale tracking, and liquidity flows.',
};

export default function NetworkAnalyticsPage() {
    return <WhaleTrackerDashboard />;
}


