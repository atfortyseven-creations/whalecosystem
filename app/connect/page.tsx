import { Suspense } from 'react';
import { headers } from 'next/headers';
import ConnectPage from "@/components/landing/ConnectPage";
import { MobileLanding } from '@/components/landing/MobileLanding';

export const dynamic = 'force-dynamic';

export default async function Page() {
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    const isMobile = /android|iphone|ipad|ipod/i.test(userAgent);

    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center font-mono text-[10px] uppercase tracking-widest text-[#050505]/40">
                Initializing Sovereign Handshake...
            </div>
        }>
            {isMobile ? <MobileLanding /> : <ConnectPage />}
        </Suspense>
    );
}
