"use client";
import InstitutionalHeader from '@/components/premium/InstitutionalHeader';
import InstitutionalFooter from '@/components/premium/InstitutionalFooter';

export default function ActivitiesPage() {
    return (
        <div className="min-h-screen bg-transparent text-[var(--aztec-ink)] font-aztec-mono">
            <main className="max-w-7xl mx-auto px-6 py-32 text-center space-y-8 glass-aztek rounded-3xl mt-10">
                <h1 className="text-6xl font-black tracking-tighter uppercase italic">Activities</h1>
                <p className="text-xl text-[var(--aztec-ink)]/60 max-w-2xl mx-auto font-aztec-body uppercase tracking-widest font-bold">
                    Monitor real-time on-chain activity through the Sovereign Intelligence lens.
                </p>
                <div className="h-96 border border-white/5 rounded-3xl flex items-center justify-center bg-white/5 backdrop-blur-md text-[10px] uppercase tracking-[0.4em]">
                    Activity Feed Initializing...
                </div>
            </main>
        </div>
    );
}
