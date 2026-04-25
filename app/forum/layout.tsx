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
    <div className="min-h-screen flex flex-col text-white" style={{ backgroundColor: '#9A7BB5' }}>
      <TelemetryTracker />
      <ForumHeader address={address} avatarUrl={avatarUrl} />

      {/* ─── Data Container ─── */}
      <main className="forum-container flex-1 w-full max-w-[920px] mx-auto px-6 py-6">
        {children}
      </main>
      
    </div>
  );
}

