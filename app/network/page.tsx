import { WhaleTrackerDashboard } from '@/components/network/whale/WhaleTrackerDashboard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Whale Activity',
    description: 'Advanced Elite on-chain intelligence hub.',
};

export default function WhaleHubPage() {
    return <WhaleTrackerDashboard />;
}

