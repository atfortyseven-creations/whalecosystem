'use client';

import Link from 'next/link';
import { ExternalLink, Package, Leaf, MapPin, ShieldCheck, Hash } from 'lucide-react';
import { ATOM_PNGTREE } from '@/lib/constants/systemAssets';
import type { ProductPassportPublic } from '@/lib/passport/types';

const CHAIN_EXPLORERS: Record<number, string> = {
  1: 'https://etherscan.io/tx/',
  8453: 'https://basescan.org/tx/',
  137: 'https://polygonscan.com/tx/',
};

function explorerUrl(chainId: number | null, txHash: string | null): string | null {
  if (!txHash || !chainId) return null;
  const base = CHAIN_EXPLORERS[chainId];
  if (!base) return null;
  return `${base}${txHash}`;
}

export function PassportView({ passport }: { passport: ProductPassportPublic }) {
  const p = passport.payload;
  const txUrl = explorerUrl(passport.chainId, passport.txHash);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#050505] pb-16">
      <header className="px-5 pt-[calc(1.25rem+env(safe-area-inset-top))] pb-6 border-b border-black/8 bg-white">
        <div className="max-w-lg mx-auto flex flex-col items-center gap-3 text-center">
          <div className="w-20 h-20">
            <img
              src={ATOM_PNGTREE}
              alt=""
              className="w-full h-full object-contain"
              style={{ mixBlendMode: 'multiply' }}
            />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">Product passport</p>
          <h1 className="text-2xl font-black tracking-tight">{passport.title}</h1>
          {passport.category && (
            <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-black/5 text-black/60">
              {passport.category}
            </span>
          )}
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5 py-6 space-y-5">
        {p.description && (
          <section className="rounded-2xl border border-black/8 bg-white p-5">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-2">Overview</h2>
            <p className="text-sm leading-relaxed text-black/80">{p.description}</p>
          </section>
        )}

        <section className="rounded-2xl border border-black/8 bg-white p-5 space-y-3">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-black/40">Details</h2>
          {p.origin && (
            <div className="flex items-start gap-3 text-sm">
              <MapPin size={16} className="text-black/30 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-black/40">Origin</p>
                <p className="font-medium">{p.origin}</p>
              </div>
            </div>
          )}
          {p.batchId && (
            <div className="flex items-start gap-3 text-sm">
              <Package size={16} className="text-black/30 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-black/40">Batch</p>
                <p className="font-mono text-xs">{p.batchId}</p>
              </div>
            </div>
          )}
          {typeof p.carbonKg === 'number' && (
            <div className="flex items-start gap-3 text-sm">
              <Leaf size={16} className="text-black/30 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-black/40">Carbon footprint</p>
                <p className="font-medium">{p.carbonKg} kg CO₂e (reported)</p>
              </div>
            </div>
          )}
          {p.certifications && p.certifications.length > 0 && (
            <ul className="flex flex-wrap gap-2 pt-1">
              {p.certifications.map((c) => (
                <li
                  key={c}
                  className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-black/5 text-black/80 border border-black/10"
                >
                  {c}
                </li>
              ))}
            </ul>
          )}
        </section>

        {passport.events.length > 0 && (
          <section className="rounded-2xl border border-black/8 bg-white p-5">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-4">Chain of custody</h2>
            <ol className="space-y-4 border-l-2 border-black/10 pl-4">
              {passport.events.map((ev) => (
                <li key={ev.id} className="relative">
                  <span className="absolute -left-[1.35rem] top-1.5 w-2 h-2 rounded-full bg-[#050505]" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-black/50">{ev.eventType}</p>
                  <p className="text-xs text-black/40">{new Date(ev.createdAt).toLocaleString()}</p>
                  {ev.payload?.location && (
                    <p className="text-sm mt-1 text-black/70">{String(ev.payload.location)}</p>
                  )}
                  {ev.payload?.note && (
                    <p className="text-sm mt-0.5 text-black/60">{String(ev.payload.note)}</p>
                  )}
                </li>
              ))}
            </ol>
          </section>
        )}

        {(passport.coreEntropy || passport.txHash || passport.issuerAddress) && (
          <section className="rounded-2xl border border-black/8 bg-white p-5 space-y-3">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-black/40">On-chain proof</h2>
            {passport.issuerAddress && (
              <div className="flex items-start gap-3 text-sm">
                <ShieldCheck size={16} className="text-black/30 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-black/40">Verified issuer</p>
                  <p className="font-mono text-xs break-all">{passport.issuerAddress}</p>
                </div>
              </div>
            )}
            {passport.coreEntropy && (
              <div className="flex items-start gap-3 text-sm">
                <Hash size={16} className="text-black/30 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-black/40">Core entropy receipt</p>
                  <p className="font-mono text-[10px] break-all text-black/70">{passport.coreEntropy}</p>
                </div>
              </div>
            )}
            {txUrl && (
              <a
                href={txUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#050505] underline underline-offset-2"
              >
                View transaction <ExternalLink size={12} />
              </a>
            )}
            {!passport.txHash && (
              <p className="text-xs text-black/50">Public passport — not yet anchored on chain.</p>
            )}
          </section>
        )}

        {passport.gs1Gtin && (
          <p className="text-center text-[10px] font-mono text-black/40">GTIN {passport.gs1Gtin}</p>
        )}

        <p className="text-center text-xs text-black/40 pt-4">
          <Link href="/privacy#product-scan" className="underline hover:text-black">
            How product scanning works
          </Link>
        </p>
      </main>
    </div>
  );
}
