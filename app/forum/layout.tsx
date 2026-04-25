import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ForumHeader } from '@/components/forum/ForumHeader';

export default async function ForumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const address = cookieStore.get('sovereign_handshake')?.value;

  if (!address) {
    redirect('/connect');
  }

  return (
    <div className="min-h-screen bg-white text-[#222222] font-sans flex flex-col">
      <ForumHeader address={address} />

      {/* ─── Data Container ─── */}
      <main className="flex-1 w-full max-w-[1110px] mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
      
    </div>
  );
}

