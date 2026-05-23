'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { Loader2, Package, QrCode, Anchor, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseAbi, parseEther, keccak256, toBytes, encodeAbiParameters, parseAbiParameters } from 'viem';
import { passportPublicUrl } from '@/lib/scan/parseScanPayload';
import type { ProductPassportPublic } from '@/lib/passport/types';

const LEDGER_ABI = parseAbi([
  'function transferWithReceipt(address to, uint256 amount, string calldata memo, uint256 coreEntropy, bytes calldata advancedMetadata) external returns (uint256)',
]);

const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '8453', 10);
const LEDGER_ADDR = (process.env.NEXT_PUBLIC_LEDGER_CONTRACT_ADDRESS || '0x') as `0x${string}`;

const INPUT_CLASS_MOBILE =
  'mt-1 w-full border border-black/10 rounded-xl px-4 py-3 text-base bg-white';
const INPUT_CLASS_DESKTOP =
  'mt-1 w-full border border-black/10 rounded-xl px-4 py-3 text-sm bg-white';

function generateCoreEntropy(): bigint {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return BigInt('0x' + Array.from(arr).map((b) => b.toString(16).padStart(2, '0')).join(''));
}

export function ProvenanceStudioContent({ variant = 'desktop' }: { variant?: 'mobile' | 'desktop' }) {
  const router = useRouter();
  const isMobile = variant === 'mobile';
  const inputClass = isMobile ? INPUT_CLASS_MOBILE : INPUT_CLASS_DESKTOP;

  const { address } = useAccount();
  const { writeContractAsync, data: txHash, isPending } = useWriteContract();
  const { isLoading: confirming, isSuccess: confirmed } = useWaitForTransactionReceipt({ hash: txHash });

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [origin, setOrigin] = useState('');
  const [batchId, setBatchId] = useState('');
  const [description, setDescription] = useState('');
  const [gs1Gtin, setGs1Gtin] = useState('');
  const [creating, setCreating] = useState(false);
  const [passport, setPassport] = useState<ProductPassportPublic | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [anchorEntropy, setAnchorEntropy] = useState<string | null>(null);
  const [anchoring, setAnchoring] = useState(false);

  const passportUrl = passport ? passportPublicUrl(passport.slug) : '';

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch('/api/passport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: title.trim(),
          category: category.trim() || undefined,
          gs1Gtin: gs1Gtin.replace(/\D/g, '') || undefined,
          payload: {
            description: description.trim() || undefined,
            origin: origin.trim() || undefined,
            batchId: batchId.trim() || undefined,
          },
          events: origin
            ? [{ eventType: 'manufactured', payload: { location: origin, note: 'Created in Provenance Studio' } }]
            : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Create failed');
      setPassport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed');
    } finally {
      setCreating(false);
    }
  };

  const handleAnchor = async () => {
    if (!passport || !address) {
      setError('Connect your wallet to anchor on chain.');
      return;
    }
    if (LEDGER_ADDR === '0x') {
      setError('On-chain anchor is not configured on this network.');
      return;
    }
    setAnchoring(true);
    setError(null);
    const entropy = generateCoreEntropy();
    const entropyHex = `0x${entropy.toString(16).padStart(64, '0')}` as `0x${string}`;
    setAnchorEntropy(entropyHex);
    const metadata = encodeAbiParameters(parseAbiParameters('string platform, bytes32 passportSlug'), [
      'HPF/v1',
      keccak256(toBytes(passport.slug)) as `0x${string}`,
    ]);
    try {
      await writeContractAsync({
        address: LEDGER_ADDR,
        abi: LEDGER_ABI,
        functionName: 'transferWithReceipt',
        args: [address, parseEther('0'), `PASSPORT:${passport.slug}`, entropy, metadata],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Anchor transaction failed');
      setAnchoring(false);
    }
  };

  useEffect(() => {
    if (!confirmed || !txHash || !passport || !anchorEntropy) return;
    (async () => {
      await fetch(`/api/passport/${passport.slug}/anchor`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          coreEntropy: anchorEntropy,
          txHash,
          chainId: CHAIN_ID,
        }),
      });
      setPassport((p) =>
        p ? { ...p, txHash, chainId: CHAIN_ID, coreEntropy: anchorEntropy } : p
      );
      setAnchoring(false);
    })();
  }, [confirmed, txHash, passport, anchorEntropy]);

  return (
    <div
      className={`min-h-[100dvh] bg-[#FAF9F6] text-[#050505] ${
        isMobile
          ? 'pb-[calc(2rem+env(safe-area-inset-bottom))]'
          : ''
      }`}
    >
      {isMobile && (
        <header className="sticky top-0 z-20 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-black/8 px-5 py-3 pt-[calc(0.75rem+env(safe-area-inset-top))]">
          <button
            type="button"
            onClick={() => router.push('/connect')}
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-black/50"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </header>
      )}

      <div className={`max-w-2xl mx-auto px-5 ${isMobile ? 'py-6' : 'px-6 py-12'}`}>
        {!isMobile && (
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-black/40 mb-2">Desktop</p>
        )}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <h1 className={`font-black tracking-tight ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
            Provenance Studio
          </h1>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full bg-black/5 text-black/60">
            Beta
          </span>
        </div>
        <p className="text-sm text-black/60 mb-8 leading-relaxed">
          Create a public product passport, generate a printable QR label, and optionally anchor a Core Entropy receipt on chain.
        </p>

        {!passport ? (
          <form onSubmit={handleCreate} className="space-y-4 rounded-2xl border border-black/10 bg-white p-5 sm:p-6">
            <label className="block">
              <span className="text-[10px] font-black uppercase tracking-widest text-black/40">Product name</span>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputClass}
                placeholder="Organic cotton tote"
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-black uppercase tracking-widest text-black/40">Category</span>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputClass}
                placeholder="textile"
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-black uppercase tracking-widest text-black/40">Description</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className={inputClass}
              />
            </label>
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-widest text-black/40">Origin</span>
                <input value={origin} onChange={(e) => setOrigin(e.target.value)} className={inputClass} />
              </label>
              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-widest text-black/40">Batch ID</span>
                <input value={batchId} onChange={(e) => setBatchId(e.target.value)} className={inputClass} />
              </label>
            </div>
            <label className="block">
              <span className="text-[10px] font-black uppercase tracking-widest text-black/40">GS1 GTIN (optional)</span>
              <input
                value={gs1Gtin}
                onChange={(e) => setGs1Gtin(e.target.value)}
                className={`${inputClass} font-mono`}
                placeholder="00812345678901"
              />
            </label>
            {error && <p className="text-sm text-black/70">{error}</p>}
            <button
              type="submit"
              disabled={creating}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-[#050505] text-white text-[11px] font-black uppercase tracking-widest active:scale-[0.98] transition-transform"
            >
              {creating ? <Loader2 className="animate-spin" size={16} /> : <Package size={16} />}
              Create passport
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="rounded-2xl border border-black/15 bg-white p-5 flex items-start gap-3">
              <CheckCircle2 className="text-[#050505] shrink-0 mt-0.5" size={20} />
              <div className="min-w-0">
                <p className="font-bold text-[#050505]">{passport.title}</p>
                <p className="text-xs text-black/60 mt-1 font-mono break-all">{passportUrl}</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 rounded-2xl border border-black/10 bg-white p-6 sm:p-8">
              <QrCode size={20} className="text-black/30" />
              <QRCodeSVG value={passportUrl} size={isMobile ? 180 : 200} level="M" includeMargin />
              <p className="text-[10px] font-black uppercase tracking-widest text-black/40 text-center">
                Print this on your label
              </p>
              <Link href={`/passport/${passport.slug}`} className="text-xs underline text-black/60">
                Preview passport page
              </Link>
            </div>

            {!passport.txHash && (
              <button
                type="button"
                onClick={handleAnchor}
                disabled={anchoring || isPending || confirming}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-[#050505] text-[11px] font-black uppercase tracking-widest active:scale-[0.98] transition-transform disabled:opacity-50"
              >
                {anchoring || isPending || confirming ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Anchor size={16} />
                )}
                Anchor on chain (Core Entropy)
              </button>
            )}

            {passport.txHash && (
              <p className="text-center text-xs text-black/60 font-mono break-all px-2">
                Anchored · {passport.txHash.slice(0, 18)}…
              </p>
            )}

            {error && <p className="text-sm text-black/70 text-center">{error}</p>}

            <button
              type="button"
              onClick={() => {
                setPassport(null);
                setTitle('');
                setCategory('');
                setOrigin('');
                setBatchId('');
                setDescription('');
                setGs1Gtin('');
                setError(null);
              }}
              className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-black/40"
            >
              Create another
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
