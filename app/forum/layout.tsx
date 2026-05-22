import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ForumHeader } from '@/components/forum/ForumHeader';

import { prisma } from '@/lib/prisma';
import { TelemetryTracker } from '@/components/forum/TelemetryTracker';
import { MobileBottomNav } from '@/components/forum/MobileBottomNav';

export default async function ForumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const address = cookieStore.get('sovereign_handshake')?.value;

  let avatarUrl: string | undefined = undefined;
  if (address) {
    try {
      // Use raw SQL scoped to only select if avatarUrl column exists
      const rows = await prisma.$queryRaw<{ avatarUrl: string | null }[]>`
        SELECT "avatarUrl" FROM "User" WHERE "walletAddress" = ${address} LIMIT 1
      `;
      if (rows.length > 0 && rows[0].avatarUrl) avatarUrl = rows[0].avatarUrl;
    } catch {
      // avatarUrl column not yet in remote DB — silently ignore (run /api/admin/sync-db to fix)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <TelemetryTracker />
      <ForumHeader address={address} avatarUrl={avatarUrl} />

      {/* ─── Data Container — True full-width ─── */}
      <main className="flex-1 w-full overflow-x-hidden">
        {children}
      </main>
      
      {/* ─── Footer ─── */}
      <footer className="w-full py-6 mt-auto flex flex-col items-center justify-center border-t border-slate-200/60">
        <span className="text-[9px] font-sans font-bold uppercase tracking-[0.2em] mb-1 text-slate-400">
          powered by
        </span>
        <div className="flex items-baseline text-slate-900">
          <span className="text-[20px] leading-none font-black">A</span>
          <span className="text-[13px] font-serif font-black uppercase tracking-[0.15em] leading-none ml-[2px]">ztec</span>
        </div>
      </footer>

      {/* Semantic spacer so Footer content is not hidden behind the fixed mobile bottom nav */}
      <div className="lg:hidden w-full" style={{ height: 'calc(64px + env(safe-area-inset-bottom, 0px))' }} />
      <MobileBottomNav />
    </div>
  );
}

