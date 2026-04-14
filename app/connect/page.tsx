import { Suspense } from 'react';
import ConnectPage from "@/components/landing/ConnectPage";

export default function Page() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center font-mono text-[10px] uppercase tracking-widest text-[#050505]/40">
                Initializing Sovereign Handshake...
            </div>
        }>
            <ConnectPage />
        </Suspense>
    );
}
