import React from 'react';
import { InstitutionalHeader } from '@/components/shared/InstitutionalHeader';

export const metadata = {
  title: 'Whale News | Sovereign Institutional Terminal',
  description: 'Análisis del Mercado y Noticias Recientes extraídas en tiempo real para entidades institucionales.',
};

export default function WhaleNewsLayout({ children }: { children: React.ReactNode }) {
  // Erradicado el fondo crema y los blurs. Dashboard puro, blanco absoluto.
  return (
    <div className="relative min-h-screen flex flex-col font-sans" style={{ background: '#FFFFFF', color: '#000000' }}>
      <div className="relative z-50">
        <InstitutionalHeader />
      </div>

      {/* Pantalla completa, encajado matemático. Sin padding sobrante. */}
      <main className="relative z-10 flex-1 w-full mx-auto overflow-hidden">
        {children}
      </main>
    </div>
  );
}
