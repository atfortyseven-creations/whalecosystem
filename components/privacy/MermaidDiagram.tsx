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
            primaryBorderColor: 'rgba(0,0,0,0.18)',
            secondaryColor: '#f8f8f8',
            tertiaryColor: '#ffffff',
            lineColor: '#333333',
            fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
            fontSize: '13px',
            nodeBorder: '1px solid rgba(0,0,0,0.15)',
            clusterBkg: '#fafafa',
            clusterBorder: 'rgba(0,0,0,0.12)',
            edgeLabelBackground: '#ffffff',
            nodeTextColor: '#111111',
          },
          flowchart: {
            curve: 'basis',
            padding: 24,
            htmlLabels: true,
            diagramPadding: 20,
            useMaxWidth: false,
          },
          sequence: { actorMargin: 64, messageMargin: 40, boxTextMargin: 8, useMaxWidth: false },
          securityLevel: 'loose',
        });

        const { svg: rendered } = await mermaid.render(`privacy-diagram-${reactId}`, chart.trim());
        if (!cancelled) {
          // Patch SVG to be fully responsive: allow natural scaling and scrolling without constrained max-width
          const patched = rendered
            .replace(/style="max-width:[^"]*"/, 'style="max-width:100%;height:auto;display:block;margin:auto;"');
          setSvg(patched);
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
    <figure className="my-10 border border-black/10 bg-white overflow-hidden rounded-sm">
      {/* Horizontal scroll container so wide diagrams never clip */}
      <div
        className="w-full overflow-x-auto"
        style={{ WebkitOverflowScrolling: 'touch', minHeight: '120px' }}
      >
        {error ? (
          <div className="p-6">
            <p className="text-[13px] text-red-600/80 font-mono">{error}</p>
          </div>
        ) : svg ? (
          <div
            /* Removed min-w-max to prevent cutting off SVG contents */
            className="p-6 md:p-10 w-full"
            style={{ lineHeight: 1 }}
            dangerouslySetInnerHTML={{ __html: svg }}
            aria-hidden={!caption}
          />
        ) : (
          <div className="h-36 flex items-center justify-center">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#050505]/30 animate-pulse">
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
