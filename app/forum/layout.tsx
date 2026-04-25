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
    const user = await (prisma as any).user.findUnique({
      where: { walletAddress: address },
      select: { avatarUrl: true }
    });
    if (user && user.avatarUrl) avatarUrl = user.avatarUrl;
  }

  return (
    <div className="min-h-screen bg-white text-[#222222] font-sans flex flex-col">
      <TelemetryTracker />
      <ForumHeader address={address} avatarUrl={avatarUrl} />

      {/* ─── Data Container ─── */}
      <main className="flex-1 w-full max-w-[1110px] mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
      
    </div>
  );
}

