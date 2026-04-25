import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Search, Menu, User } from 'lucide-react';

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
      {/* ─── Discourse Style Header ─── */}
      <header className="sticky top-0 z-50 bg-white shadow-[0_2px_4px_rgba(0,0,0,0.06)] px-4 sm:px-6 h-[60px] flex items-center justify-between">
        <div className="flex items-center gap-4 h-full">
          <Link href="/forum" className="flex items-center gap-2 text-black hover:opacity-80 transition-opacity">
            <span className="font-serif text-[22px] font-bold tracking-tight">SOVEREIGN</span>
          </Link>
        </div>

        <div className="flex items-center gap-3 sm:gap-5 text-[#919191]">
          <button className="p-1.5 hover:bg-gray-100 rounded-full transition-colors" aria-label="Search">
            <Search size={20} />
          </button>
          <button className="p-1.5 hover:bg-gray-100 rounded-full transition-colors" aria-label="Menu">
            <Menu size={22} />
          </button>
          <Link href={`/forum/u/${address}`} className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border border-gray-200 ml-1 transition-transform hover:scale-105">
            <User size={18} className="text-blue-500" />
          </Link>
        </div>
      </header>

      {/* ─── Data Container ─── */}
      <main className="flex-1 w-full max-w-[1110px] mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
      
      {/* ─── Minimal Footer (Discourse style) ─── */}
      <footer className="w-full text-center py-6 text-sm text-gray-400 mt-auto">
        <p>Powered by Sovereign Terminal</p>
      </footer>
    </div>
  );
}


function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#050505]/40 hover:text-[#050505] transition-colors relative group"
    >
      {label}
      <span className="absolute -bottom-1.5 left-0 w-0 h-[1px] bg-black group-hover:w-full transition-all duration-300" />
    </Link>
  );
}

