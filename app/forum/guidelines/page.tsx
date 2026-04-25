import React from 'react';

export default function ForumGuidelinesPage() {
  const rules = [
    {
      n: '01',
      title: 'ABSOLUTE SIGNAL — ZERO NOISE',
      body: 'All transmissions must contribute actionable intelligence, structural analysis, or cryptographic research. Low-effort posts and speculative noise without data backing will be removed by the moderation consensus.',
    },
    {
      n: '02',
      title: 'ZERO-TOLERANCE FOR MANIPULATION',
      body: 'Coordinated market manipulation, false signal broadcasting, and Sybil attacks are strictly prohibited. The Entity Graph actively monitors cross-account coordination. Violators will have their access permanently revoked.',
    },
    {
      n: '03',
      title: 'CRYPTOGRAPHIC VERIFICATION',
      body: 'Claims regarding MEV strategies, on-chain yields, and execution logic must be backed by verified on-chain transactions or Zero-Knowledge proofs. Do not trust; verify.',
    },
    {
      n: '04',
      title: 'PROFESSIONAL DISCOURSE',
      body: 'Debate ideas, not individuals. Ad hominem attacks and harassment degrade the quality of the intelligence network. Maintain an institutional and respectful tone at all times.',
    },
  ];

  return (
    <div className="flex flex-col w-full max-w-[860px] mx-auto py-10 px-4">

      <div className="mb-8 pb-6" style={{ borderBottom: '1px solid var(--forum-border)' }}>
        <div className="text-[12px] font-sans font-bold mb-2" style={{ color: 'var(--forum-text-muted)' }}>FORUM / GUIDELINES</div>
        <h1 className="text-[28px] font-sans font-bold tracking-tight" style={{ color: 'var(--forum-text)' }}>
          Institutional Protocol
        </h1>
      </div>

      <div className="flex flex-col">
        {rules.map(r => (
          <div key={r.n} className="flex gap-8 py-7" style={{ borderBottom: '1px solid var(--forum-border)' }}>
            <div className="text-[14px] font-sans font-bold w-6 shrink-0 pt-0.5" style={{ color: 'var(--forum-text-muted)' }}>{r.n}</div>
            <div className="flex flex-col gap-2">
              <div className="text-[15px] font-sans font-bold tracking-wide" style={{ color: 'var(--forum-text)' }}>{r.title}</div>
              <div className="text-[15px] font-sans leading-relaxed" style={{ color: 'var(--forum-text-muted)' }}>{r.body}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--forum-border)' }}>
        <div className="text-[11px] font-sans font-bold uppercase tracking-widest text-center" style={{ color: 'var(--forum-text-muted)', opacity: 0.5 }}>
          LAST UPDATED APRIL 2026 — SOVEREIGN CONSENSUS PROTOCOL
        </div>
        <div className="mt-4 px-4 py-3 rounded-sm" style={{ border: '1px solid var(--forum-border)', backgroundColor: 'var(--forum-surface)' }}>
          <div className="text-[13px] font-sans italic text-center" style={{ color: 'var(--forum-text)' }}>
            "In a trustless ecosystem, your signature is your bond."
          </div>
        </div>
      </div>
    </div>
  );
}
