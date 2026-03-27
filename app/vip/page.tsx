import { Metadata } from 'next';
import { MasterMatrix as MasterMatrixComponent } from "@/components/premium/MasterMatrix";
import "@/app/dashboard/dashboard.css";

export const metadata: Metadata = {
  title: 'Whale VIP',
  description: 'Access the inner sanctum of whale activity via the Whale Monitor. Real-time buy/sell pressure and institutional positioning.',
}

export default function VipPage() {
  return (
    <div className="min-h-screen bg-[#050505]">
      <MasterMatrixComponent />
    </div>
  );
}
