'use client';

import React, { useEffect, useId, useRef, useState } from 'react';

type MermaidDiagramProps = {
  chart: string;
  caption?: string;
};

export function MermaidDiagram({ chart, caption }: MermaidDiagramProps) {
  const reactId = useId().replace(/:/g, '');
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
            secondaryColor: '#f5f5f5',
            tertiaryColor: '#f9f9f9',
            lineColor: '#555555',
            fontFamily: '"Inter", ui-sans-serif, system-ui, -apple-system, sans-serif',
            fontSize: '12px',
            nodeBorder: '1px solid rgba(0,0,0,0.2)',
            clusterBkg: '#fafafa',
            clusterBorder: 'rgba(0,0,0,0.12)',
            edgeLabelBackground: '#ffffff',
            nodeTextColor: '#111111',
            labelTextColor: '#111111',
          },
          flowchart: {
            curve: 'basis',
            padding: 20,
            htmlLabels: true,
            diagramPadding: 16,
            useMaxWidth: true,
            rankSpacing: 60,
            nodeSpacing: 40,
          },
          sequence: {
            actorMargin: 50,
            messageMargin: 35,
            boxTextMargin: 6,
            useMaxWidth: true,
            mirrorActors: false,
            showSequenceNumbers: false,
          },
          securityLevel: 'loose',
          maxEdges: 500,
        });

        const diagramId = `mermaid-${reactId}-${Math.random().toString(36).slice(2, 7)}`;
        const { svg: rendered } = await mermaid.render(diagramId, chart.trim());

        if (!cancelled) {
          // Fully responsive patch:
          // 1. Strip any inline max-width / width / height style that forces overflow
          // 2. Set explicit width=100% so SVG fills the container
          // 3. Preserve viewBox so browsers can scale proportionally
          const patched = rendered
            .replace(/\sstyle="[^"]*max-width[^"]*"/g, '')
            .replace(/\sheight="[^"]*"/g, '')
            .replace(/\swidth="[^"]*"/g, ' width="100%"');

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
    <figure className="my-10 border border-black/10 bg-white overflow-hidden" style={{ borderRadius: 2 }}>
      {/* Scroll horizontally on mobile so nothing is clipped. On desktop the SVG scales to 100% width naturally. */}
      <div
        ref={containerRef}
        className="w-full overflow-x-auto"
        style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehaviorX: 'contain',
          minHeight: '120px',
        }}
      >
        {error ? (
          <div className="p-6 flex items-start gap-3">
            <span className="font-mono text-[10px] uppercase tracking-widest text-red-500/80 mt-0.5">ERR</span>
            <p className="text-[12px] text-red-600/70 font-mono leading-relaxed">{error}</p>
          </div>
        ) : svg ? (
          <div
            className="p-4 md:p-8 w-full"
            style={{
              lineHeight: 1,
              minWidth: 0,
            }}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: Mermaid SVG output
            dangerouslySetInnerHTML={{ __html: svg }}
            aria-hidden={!caption}
          />
        ) : (
          <div className="h-36 flex items-center justify-center">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#050505]/25 animate-pulse">
              Rendering diagram…
            </span>
          </div>
        )}
      </div>
      {caption && (
        <figcaption className="px-5 py-3 border-t border-black/8 font-mono text-[9px] font-bold uppercase tracking-[0.25em] text-[#050505]/35">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
