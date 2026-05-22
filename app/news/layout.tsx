import React from 'react';

export const metadata = {
  title: 'News of today | Whale Alert Network',
  description: 'Las noticias más críticas del mercado cripto en tiempo real. Análisis institucional permanente. Archivo mensual persistente.',
};

// Layout minimalista absoluto para /news.
// Dark/Light mode lo controla NewsTerminal desde su estado interno.
// Sin background fijo  NewsTerminal ocupa el 100% del viewport.
export default function WhaleNewsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
