import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { SovereignFooter } from '@/components/landing/SovereignFooter';

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
    <div className="min-h-screen bg-[#FDFCF8] text-[#050505] font-sans flex flex-col relative selection:bg-black selection:text-white">
      {/* ─── Zero-UI Navigation Matrix ─── */}
      <header className="sticky top-0 z-50 bg-[#FDFCF8]/95 backdrop-blur-md px-4 sm:px-8 py-5 flex items-center justify-between border-b-[0.5px] border-black/5">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-mono text-[9px] font-black uppercase tracking-[0.3em] text-[#050505]/50 hover:text-[#050505] transition-colors">
            Sys_Root
          </Link>
          <span className="text-[#050505]/20 font-mono text-[10px]">-</span>
          <Link href="/forum" className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[#050505]">
            Global Intel Ledger
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          <NavLink href="/forum?latest=true" label="Telemetry" />
          <NavLink href="/forum/tags" label="Vectors" />
          <NavLink href="/forum/users" label="Operators" />
          <NavLink href="/forum/notifications" label="Signals" />
          <NavLink href={`/forum/u/${address}`} label={`Entity[${address.slice(0, 4)}]`} />
        </nav>
      </header>

      {/* ─── Data Container (Maximal Space) ─── */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-8 py-10 sm:py-16">
        {children}
      </main>

      <SovereignFooter />
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
