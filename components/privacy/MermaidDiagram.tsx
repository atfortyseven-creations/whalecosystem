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
            primaryTextColor: '#111111',
            primaryBorderColor: 'rgba(0,0,0,0.15)',
            secondaryColor: '#f4f4f4',
            tertiaryColor: '#ffffff',
            lineColor: '#333333',
            fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
            fontSize: '14px',
            nodeBorder: '1px solid rgba(0,0,0,0.15)',
            clusterBkg: '#f9f9f9',
            clusterBorder: 'rgba(0,0,0,0.12)',
            edgeLabelBackground: '#ffffff',
          },
          flowchart: { curve: 'basis', padding: 20, htmlLabels: true, diagramPadding: 16 },
          sequence: { actorMargin: 64, messageMargin: 40, boxTextMargin: 8 },
          securityLevel: 'loose',
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
    <figure className="my-10 border border-black/10 bg-white overflow-hidden">
      <div className="overflow-x-auto overflow-y-hidden w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
        {error ? (
          <div className="p-6">
            <p className="text-[13px] text-red-600/80 font-mono">{error}</p>
          </div>
        ) : svg ? (
          <div
            className="p-6 md:p-10 [&_svg]:w-full [&_svg]:max-w-full [&_svg]:h-auto [&_svg]:block [&_.label]:text-[14px] [&_.node]:text-[14px]"
            dangerouslySetInnerHTML={{ __html: svg }}
            aria-hidden={!caption}
          />
        ) : (
          <div className="h-36 flex items-center justify-center">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#050505]/30">
              Loading diagram…
            </span>
          </div>
        )}
      </div>
      {caption && (
        <figcaption className="px-6 py-3 border-t border-black/8 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#050505]/40">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
