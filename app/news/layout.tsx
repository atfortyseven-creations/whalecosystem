import React from 'react';

export const metadata = {
  title: 'Whale News | Sovereign Intelligence Terminal',
  description: 'Las 50 noticias más críticas del mercado cripto en tiempo real. Análisis institucional permanente.',
};

// Este layout es minimalista absoluto.
// El InstitutionalHeader viene inyectado desde ClientLayout (ya configurado).
// El fondo blanco y la erradicación del wallpaper se ejecutan desde ClientLayout.
export default function WhaleNewsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', color: '#000000', overflow: 'hidden' }}>
      {children}
    </div>
  );
}
