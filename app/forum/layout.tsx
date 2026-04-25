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
      const user = await (prisma as any).user.findUnique({
        where: { walletAddress: address },
        select: { avatarUrl: true }
      });
      if (user && user.avatarUrl) avatarUrl = user.avatarUrl;
    } catch (e) {
      console.error("[Layout] Failed to fetch user avatar:", e);
    }
  }

  return (
    <div className="min-h-screen flex flex-col text-white">
      <TelemetryTracker />
      <ForumHeader address={address} avatarUrl={avatarUrl} />

      {/* ─── Data Container ─── */}
      <main className="forum-container flex-1 w-full max-w-[920px] mx-auto px-6 py-6">
        {children}
      </main>
      
    </div>
  );
}

