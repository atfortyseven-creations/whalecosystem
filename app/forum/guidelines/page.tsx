import React from 'react';

export default function ForumGuidelinesPage() {
  const rules = [
    {
      n: '01',
      title: 'Keep it substantive',
      body: 'Share analysis, research, trade ideas, or questions that add real value for other members. Low-effort posts, memes, and content-free commentary will be removed.',
    },
    {
      n: '02',
      title: 'No market manipulation or spam',
      body: 'Do not coordinate pump-and-dump activity, post misleading signals, or create multiple accounts to game the community. Violations result in a permanent ban.',
    },
    {
      n: '03',
      title: 'Support your claims with data',
      body: 'If you make a bold on-chain claim, back it up with transaction hashes, verified sources, or reproducible analysis. Unsupported assertions lower the quality of discussion for everyone.',
    },
    {
      n: '04',
      title: 'Be respectful',
      body: 'Debate ideas, not people. Personal attacks, harassment, and abusive language are not tolerated. Disagreement is welcome; disrespect is not.',
    },
  ];

  return (
    <div className="flex flex-col w-full max-w-[860px] mx-auto py-10 px-4">

      <div className="mb-8 pb-6 border-b border-black/10 dark:border-white/10">
        <div className="text-[12px] font-sans font-bold mb-2 text-black/50 dark:text-[#888888]">FORUM / GUIDELINES</div>
        <h1 className="text-[28px] font-sans font-black uppercase tracking-tight text-black dark:text-white">
          Community Guidelines
        </h1>
      </div>

      <div className="flex flex-col">
        {rules.map(r => (
          <div key={r.n} className="flex gap-8 py-7 border-b border-black/10 dark:border-white/10">
            <div className="text-[14px] font-sans font-bold w-6 shrink-0 pt-0.5 text-black/50 dark:text-[#888888]">{r.n}</div>
            <div className="flex flex-col gap-2">
              <div className="text-[15px] font-sans font-bold tracking-wide text-black dark:text-white">{r.title}</div>
              <div className="text-[15px] font-sans leading-relaxed text-black/70 dark:text-[#888888]">{r.body}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-black/10 dark:border-white/10">
        <div className="text-[11px] font-sans font-bold uppercase tracking-widest text-center text-black/40 dark:text-white/40">
          LAST UPDATED APRIL 2026
        </div>
        <div className="mt-4 px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-[#111111]">
          <div className="text-[13px] font-sans italic text-center text-black dark:text-white">
            "A community is only as good as its worst-tolerated behaviour. We set the bar high."
          </div>
        </div>
      </div>
    </div>
  );
}
