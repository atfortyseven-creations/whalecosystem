import { WhaleTrackerDashboard } from '@/components/network/whale/WhaleTrackerDashboard';
import { InstitutionalShell } from "@/components/shared/InstitutionalShell";
import type { Metadata } from 'next';
import "@/app/dashboard/dashboard.css";

export const metadata: Metadata = {
    title: 'Whale Network',
    description: 'Advanced Elite on-chain intelligence hub.',
};

export default function WhaleHubPage() {
    return (
        <InstitutionalShell title="Whale Activity" subtitle="Real-time Network Velocity" badge="LIVE">
            <WhaleTrackerDashboard />
        </InstitutionalShell>
    );
}
