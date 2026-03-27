import { Metadata } from 'next';
import { MasterMatrix as MasterMatrixComponent } from "@/components/premium/MasterMatrix";
import { InstitutionalShell } from "@/components/shared/InstitutionalShell";
import "@/app/dashboard/dashboard.css";

export const metadata: Metadata = {
  title: 'Whale VIP',
  description: 'Access the inner sanctum of whale activity via the Whale Monitor. Real-time buy/sell pressure and institutional positioning.',
}

export default function VipPage() {
  return (
    <InstitutionalShell title="Whale VIP" subtitle="Sovereign Transaction Nexus" badge="PREMIUM" badgeVariant="amber">
      <MasterMatrixComponent />
    </InstitutionalShell>
  );
}
