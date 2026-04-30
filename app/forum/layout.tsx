import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ForumHeader } from '@/components/forum/ForumHeader';

import { prisma } from '@/lib/prisma';
import { TelemetryTracker } from '@/components/forum/TelemetryTracker';

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
    <div className="min-h-screen flex flex-col forum-theme-root">
      {/* Theme persistence is handled natively by next-themes in app/layout.tsx */}
      <TelemetryTracker />
      <ForumHeader address={address} avatarUrl={avatarUrl} />

      {/* ─── Data Container ─── */}
      <main className="forum-container flex-1 w-full mx-auto px-2 sm:px-6 py-6 overflow-x-hidden">
        {children}
      </main>
      
      {/* ─── Footer ─── */}
      <footer className="w-full py-8 mt-auto flex flex-col items-center justify-center opacity-60 hover:opacity-100 transition-opacity" style={{ borderTop: '1px solid var(--forum-border)' }}>
        <span className="text-[9px] font-sans font-bold uppercase tracking-[0.2em] mb-1" style={{ color: 'var(--forum-text-muted)' }}>
          powered by
        </span>
        <div className="flex items-baseline" style={{ color: 'var(--forum-text)' }}>
          <span className="text-[24px] font-aztec-logo leading-none">A</span>
          <span className="text-[14px] font-serif font-black uppercase tracking-[0.15em] leading-none ml-[2px]">ztec</span>
        </div>
      </footer>
    </div>
  );
}

