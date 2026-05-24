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
            primaryColor: '#ffffff',
            primaryTextColor: '#050505',
            primaryBorderColor: 'rgba(5,5,5,0.12)',
            secondaryColor: '#ffffff',
            tertiaryColor: '#ffffff',
            lineColor: '#050505',
            fontFamily: 'ui-sans-serif, system-ui, sans-serif',
            fontSize: '18px',
          },
          flowchart: { curve: 'basis', padding: 24, htmlLabels: true },
          sequence: { actorMargin: 64, messageMargin: 48 },
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
    <figure className="my-8 rounded-2xl border border-black/8 bg-white p-6 md:p-8 overflow-x-auto">
      {error ? (
        <p className="text-base text-red-600/80 font-mono">{error}</p>
      ) : svg ? (
        <div
          className="flex justify-center min-w-[600px] md:min-w-[800px] [&_svg]:max-w-full [&_svg]:h-auto"
          dangerouslySetInnerHTML={{ __html: svg }}
          aria-hidden={!caption}
        />
      ) : (
        <div className="h-32 flex items-center justify-center">
          <span className="font-mono text-sm uppercase tracking-widest text-[#050505]/30">
            Loading diagram…
          </span>
        </div>
      )}
      {caption && (
        <figcaption className="mt-4 font-mono text-sm font-black uppercase tracking-[0.25em] text-[#050505]/45 text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
