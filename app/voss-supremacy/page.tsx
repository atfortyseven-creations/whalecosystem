import { VOSS_MASTER_MATRIX } from '@/lib/vossIntelligenceEngine';

export const metadata = {
  title: 'VOSS 2026 Supreme Roadmap | Whale Alert Network',
  description: 'The 500 Dimensions of Apex Dominance.',
};

export default function VossSupremacyPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1A1A1A] font-sans selection:bg-[#EAE5D9] p-8 md:p-16">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="border-b-[1px] border-[#EAE5D9] pb-8 mb-16">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-[#8C8C8C] mb-4">
            CONFIDENTIAL // SYSTEM ARCHITECTURE V4.2.0 EXTENSION
          </p>
          <h1 className="text-4xl md:text-6xl font-light tracking-tight mb-6">
            VOSS 2026: The 500 Dimensions of Apex Dominance
          </h1>
          <p className="text-lg md:text-xl text-[#666666] max-w-3xl leading-relaxed">
            Sovereign-grade intelligence output. Constructed on the principles of Zero-Mock Mandate, Akashic Permanence, and Institutional Ivory. Every signal sourced directly from live blockchain state. 100% Non-Custodial. 100% Trustless.
          </p>
        </header>

        <div className="grid gap-8">
          {Array.from({ length: 10 }).map((_, catIndex) => {
            const categoryItems = VOSS_MASTER_MATRIX.filter(item => item.category === catIndex + 1);
            if (!categoryItems.length) return null;
            
            return (
              <section key={catIndex} className="mb-16">
                <h2 className="text-2xl font-medium tracking-tight mb-8 sticky top-0 bg-[#FDFBF7]/90 backdrop-blur-sm py-4 z-10 border-b border-[#EAE5D9]">
                  Categoría {catIndex + 1}: {categoryItems[0].categoryName}
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {categoryItems.map((item) => (
                    <article 
                      key={item.id} 
                      className="bg-white border border-[#EAE5D9] p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-mono text-[#8C8C8C]">#{item.id}</span>
                        <span className={\`text-xs font-mono px-2 py-1 uppercase tracking-wider \${
                          item.priority === 'Crítica' ? 'bg-red-100 text-red-800' :
                          item.priority === 'Alta' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }\`}>
                          Prio: {item.priority}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold mb-3">{item.title}</h3>
                      
                      <div className="space-y-3 text-sm text-[#404040]">
                        <p><strong className="text-[#1A1A1A]">Descripción:</strong> {item.description}</p>
                        <p><strong className="text-[#1A1A1A]">Superioridad:</strong> {item.competitiveEdge}</p>
                        <p><strong className="text-[#1A1A1A]">Implementación:</strong> {item.implementation}</p>
                        
                        <div className="pt-4 mt-4 border-t border-[#F2F0EA] grid grid-cols-2 gap-4">
                          <div>
                            <span className="block text-xs uppercase tracking-wider text-[#8C8C8C]">Esfuerzo</span>
                            <span className="font-mono">{item.effort}</span>
                          </div>
                          <div>
                            <span className="block text-xs uppercase tracking-wider text-[#8C8C8C]">Riesgos</span>
                            <span className="truncate block" title={item.risks}>{item.risks}</span>
                          </div>
                        </div>
                        <div className="bg-[#F9F8F6] p-3 mt-4 border border-[#EAE5D9]">
                          <span className="block text-xs uppercase tracking-wider text-[#8C8C8C] mb-1">Impacto Esperado</span>
                          <span className="font-medium">{item.impact}</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <footer className="mt-24 border-t-[1px] border-[#1A1A1A] pt-12 pb-24">
          <h2 className="text-3xl font-light mb-8">PLAN DE EJECUCIÓN MAESTRO (2026-2027)</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#1A1A1A] text-white p-8">
               <h3 className="font-mono text-sm tracking-widest text-[#8C8C8C] mb-4">FASE 1 // DÍAS 1-30</h3>
               <p className="text-lg font-medium mb-2">Soberanía Absoluta</p>
               <p className="text-sm text-gray-400">Implementación 1-125. Transición de PM2 Node a Rust Bindings (Prisma) y el ZK-Rollup Sovereign Mesh. Se inyecta la liquidez masiva.</p>
            </div>
            <div className="bg-[#1A1A1A] text-white p-8">
               <h3 className="font-mono text-sm tracking-widest text-[#8C8C8C] mb-4">FASE 2 // DÍAS 31-90</h3>
               <p className="text-lg font-medium mb-2">Dominación Institucional</p>
               <p className="text-sm text-gray-400">Despliegue 126-250. Activación del AI Agentic Vault y Zero-Mock WebRTC P2P Ingestion. Latencia global {`<`} 2ms.</p>
            </div>
            <div className="bg-[#1A1A1A] text-white p-8">
               <h3 className="font-mono text-sm tracking-widest text-[#8C8C8C] mb-4">FASE 3 // DÍAS 91-180</h3>
               <p className="text-lg font-medium mb-2">Flywheel Cósmico</p>
               <p className="text-sm text-gray-400">Elementos 251-500. El Akashic Ledger es validado por EigenLayer. Competencia delegada a legacy. Monopolio de grado estado-nación.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
