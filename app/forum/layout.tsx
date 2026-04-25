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

  let avatarUrl = undefined;
  if (address) {
    try {
      // Use raw SQL to avoid Prisma schema mismatch on columns not yet in remote DB
      const rows = await prisma.$queryRaw<{ avatarUrl: string | null }[]>`
        SELECT "avatarUrl" FROM "User" WHERE "walletAddress" = ${address} LIMIT 1
      `;
      if (rows.length > 0 && rows[0].avatarUrl) avatarUrl = rows[0].avatarUrl;
    } catch {
      // Column not yet in remote DB — silently ignore, avatar will be initials
    }
  }

  return (
    <div className="min-h-screen flex flex-col forum-theme-root">
      <TelemetryTracker />
      <ForumHeader address={address} avatarUrl={avatarUrl} />

      {/* ─── Data Container ─── */}
      <main className="forum-container flex-1 w-full mx-auto px-2 sm:px-6 py-6 overflow-x-hidden">
        {children}
      </main>
      
      {/* ─── Footer ─── */}
      <footer className="w-full py-8 mt-auto border-t border-white/5 flex flex-col items-center justify-center opacity-60 hover:opacity-100 transition-opacity">
        <span className="text-[9px] font-sans font-bold uppercase tracking-[0.2em] text-white/50 mb-1">
          powered by
        </span>
        <div className="flex items-baseline text-white">
          <span className="text-[24px] font-aztec-logo leading-none">A</span>
          <span className="text-[14px] font-serif font-black uppercase tracking-[0.15em] leading-none ml-[2px]">ztec</span>
        </div>
      </footer>
    </div>
  );
}

