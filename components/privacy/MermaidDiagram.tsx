'use client';

import React, { useEffect, useId, useState } from 'react';

type MermaidDiagramProps = {
  chart: string;
  caption?: string;
};

export function MermaidDiagram({ chart, caption }: MermaidDiagramProps) {
  const reactId = useId().replace(/:/g, '');
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: 'base',
          themeVariables: {
            primaryColor: '#f5f4f2',
            primaryTextColor: '#050505',
            primaryBorderColor: 'rgba(5,5,5,0.12)',
            secondaryColor: '#faf9f6',
            tertiaryColor: '#ffffff',
            lineColor: '#2a1b4d',
            fontFamily: 'ui-sans-serif, system-ui, sans-serif',
            fontSize: '13px',
          },
          flowchart: { curve: 'basis', padding: 12, htmlLabels: true },
          sequence: { actorMargin: 48, messageMargin: 32 },
          securityLevel: 'strict',
        });

        const { svg: rendered } = await mermaid.render(`privacy-diagram-${reactId}`, chart.trim());
        if (!cancelled) {
          setSvg(rendered);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Diagram could not be rendered');
          setSvg('');
        }
      }
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [chart, reactId]);

  return (
    <figure className="my-8 rounded-2xl border border-black/8 bg-[#faf9f6] p-4 md:p-6 overflow-x-auto">
      {error ? (
        <p className="text-[13px] text-red-600/80 font-mono">{error}</p>
      ) : svg ? (
        <div
          className="flex justify-center min-w-[280px] [&_svg]:max-w-full [&_svg]:h-auto"
          dangerouslySetInnerHTML={{ __html: svg }}
          aria-hidden={!caption}
        />
      ) : (
        <div className="h-32 flex items-center justify-center">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#050505]/30">
            Loading diagram…
          </span>
        </div>
      )}
      {caption && (
        <figcaption className="mt-4 font-mono text-[9px] font-black uppercase tracking-[0.25em] text-[#050505]/45 text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
