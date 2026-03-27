import { WhaleTrackerDashboard } from '@/components/network/whale/WhaleTrackerDashboard';
import "@/app/dashboard/dashboard.css";
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Whale Network',
    description: 'Advanced Elite on-chain intelligence hub.',
};

export default function WhaleHubPage() {
    return (
        <div className="min-h-screen bg-[#050505]">
            <WhaleTrackerDashboard />
        </div>
    );
}
