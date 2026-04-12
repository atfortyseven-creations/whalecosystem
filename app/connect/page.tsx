import { Suspense } from 'react';
import ConnectPage from "@/components/landing/ConnectPage";

export default function Page() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center font-mono text-[10px] uppercase tracking-widest text-black/20 dark:text-white/20">
                Initializing Sovereign Handshake...
            </div>
        }>
            <ConnectPage />
        </Suspense>
    );
}
