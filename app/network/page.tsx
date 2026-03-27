import { WhaleTrackerDashboard } from '@/components/network/whale/WhaleTrackerDashboard';
import { InstitutionalShell } from '@/components/shared/InstitutionalShell';
import "@/app/dashboard/dashboard.css";
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Whale Network',
    description: 'Advanced Elite on-chain intelligence hub.',
};

export default function WhaleHubPage() {
    return (
        <InstitutionalShell 
            title="Whale Network" 
            subtitle="Protocol Activity Substrate" 
            badge="NETWORK" 
            badgeVariant="emerald"
        >
            <div style={{ height: "calc(100vh - 160px)", overflow: "hidden" }}>
                <WhaleTrackerDashboard />
            </div>
        </InstitutionalShell>
    );
}

