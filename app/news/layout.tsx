import React from 'react';
import { InstitutionalHeader } from '@/components/shared/InstitutionalHeader';
import { SplashContainer } from '@/components/shared/SplashContainer';

export const metadata = {
  title: 'Whale News | Sovereign Institutional Terminal',
  description: 'Análisis del Mercado y Noticias Recientes extraídas en tiempo real para entidades institucionales.',
};

export default function WhaleNewsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen font-sans selection:bg-amber-900 selection:text-[#F7F2EA] flex flex-col" style={{ background: '#F7F2EA' }}>
      
      {/* TEXTURAS Y BLINDAJE INSTITUCIONAL */}
      <div className="absolute inset-0 z-0 pointer-events-none noise-bg mix-blend-multiply opacity-[0.03]" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute w-[80vw] h-[80vw] bg-amber-900/5 blur-[120px] rounded-full top-[-20%] right-[-10%] mix-blend-multiply" />
      </div>

      <div className="relative z-50">
        <InstitutionalHeader />
      </div>

      <main className="relative z-10 flex-1 flex flex-col items-center w-full max-w-[1920px] mx-auto overflow-y-auto">
        <div className="w-full flex-grow relative flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
}
