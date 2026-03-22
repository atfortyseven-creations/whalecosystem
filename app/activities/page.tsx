"use client";
import InstitutionalHeader from '@/components/premium/InstitutionalHeader';
import InstitutionalFooter from '@/components/premium/InstitutionalFooter';

export default function ActivitiesPage() {
    return (
        <div className="min-h-screen bg-[#f3efe9] text-[#1a1a1a] font-serif">
            <InstitutionalHeader />
            <main className="max-w-7xl mx-auto px-6 py-32 text-center space-y-8">
                <h1 className="text-6xl font-black tracking-tighter uppercase">Activities</h1>
                <p className="text-xl text-black/60 max-w-2xl mx-auto font-serif">
                    Monitor real-time on-chain activity through the Sovereign Intelligence lens.
                </p>
                <div className="h-96 border border-black/10 rounded-3xl flex items-center justify-center bg-white/20 backdrop-blur-md">
                    Activity Feed Initializing...
                </div>
            </main>
            <InstitutionalFooter />
        </div>
    );
}
