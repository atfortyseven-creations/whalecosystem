import { Metadata } from 'next';
import { MasterMatrix as MasterMatrixComponent } from "@/components/premium/MasterMatrix";

export const metadata: Metadata = {
  title: 'Whale Vip',
  description: 'Access the inner sanctum of whale activity via the Whale Monitor. Real-time buy/sell pressure and institutional positioning.',
}

export default function VipPage() {
  return (
    <main className="min-h-screen bg-transparent">
      <MasterMatrixComponent />
    </main>
  );
}
