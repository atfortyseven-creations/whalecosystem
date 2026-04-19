"use client";

import React, { useEffect, useState } from "react";
import { OptimizedLocalLottie } from "./OptimizedLocalLottie";
import { SovereignFooter } from "./SovereignFooter";
import { Scan } from "lucide-react";

const IMMERSIVE_PAGES = [
  {
    title: "I. Telemetría de Capa Base y Extracción Determinística",
    paragraphs: [
      "La red opera intrínsecamente como un panóptico descentralizado sobre el protocolo de consenso. Renunciando a dependencias exógenas y a indexadores de alta latencia, el núcleo troncal se amalgama a la base criptográfica de la máquina virtual nativa. Establecemos conexiones en un nivel de zócalo web de latencia cero, absorbiendo cada trazo termodinámico de las transacciones en el preciso instante en que la mempool las consolida. Prescindimos de abstracciones de intermediarios para consumir directamente el calldata crudo codificado en secuencias puramente hexadecimales.",
      "A través de heurísticas formales de multidimensionalidad algorítmica, nuestro motor deductivo desvela los flujos ofuscados que transitan entre puentes cruzados y bóvedas en la sombra. Esto transciende la simple medición del volumen termodinámico observable; la infraestructura interroga activamente las mutaciones de estado para abstraer la genuina intencionalidad computacional. Correlacionando la entropía geométrica de los sumideros de recepción, dictaminamos la diferencia fundamental entre diversificaciones rutinarias y la consolidación de asedios por entidades hiper-estructuradas.",
      "Cada exhalación paramétrica que distorsiona nuestros intervalos estáticos genera coeficientes de ponderación inexorables. La evaluación sistémica no consiste en el simple trazado de proyecciones probables, sino en ejecuciones forenses matemáticas de autopsias predictivas, orquestadas y resueltas a ráfagas continuas de doscientos cuarenta nanosegundos analíticos por ciclo métrico del motor base."
    ]
  },
  {
    title: "II. Validadores de Conocimiento Cero y Árboles Inmutables",
    paragraphs: [
      "El modelo de intercesión algorítmica destierra categóricamente las premisas laxas de los sistemas analíticos públicos, operando en dominios exclusivamente criptográficos. Las atestiguaciones asíncronas exigen una verificación matemática prístina: pruebas integrales de conocimiento cero (ZK-SNARKs). Este paradigma valida proposiciones booleanas y condiciones operativas puras sin vulnerar la opacidad del canal subyacente. Tal infraestructura anula drásticamente la propensión a la corrosión estadística provocada por inyecciones y manipulaciones externas.",
      "Dentro de este estrato abstracto e inescrutable se aloja el Registro Algorítmico Funcional, un baluarte hermético ensamblado en secuencias de Merkle jerarquizadas. Todas las alteraciones sistémicas, las anomalías topológicas y las trazas asimétricas quedan incrustadas en hashes irrevocables y perpetuamente trazables mediante derivaciones formales algorítmicas. La robustez técnica de nuestra compilación fáctica asegura una infalibilidad criptográfica absoluta.",
      "Nos desligamos completamente de los mecanismos de confianza tradicionales vulnerables; nuestra garantía de precisión no emana de la reputación humana, sino del determinismo algorítmico distribuido inmutable. Uniendo los protocolos matemáticos más prístinos disponibles, cristalizamos un perímetro de ingestión en la gran red que funciona como un observatorio impenetrable e inmarcesible, absolutamente aislado de la volatilidad emocional."
    ]
  },
  {
    title: "III. Expansión Autónoma y Soberanía Inter-Cadena",
    paragraphs: [
      "La directiva evolutiva concebida en la arquitectura de génesis encamina a la superestructura hacia una hibridación autónoma con frameworks de abstrusión inter-cadena inexplorables. Priorizamos converger paramétricamente con ecosistemas subyacentes de agregación cero, con la intención primordial de ofuscar exhaustivamente cualquier rúbrica operativa generada por la comunicación de los procesos observadores, instaurando invisibilidad técnica con máxima fidelidad determinista.",
      "Desbordando los horizontes contemporáneos del cálculo polinómico, el cianotipo base de nuestra arquitectura de ingestión está siendo re-instrumentado para integrar primitivas de resistencia post-cuántica y curvas elípticas aberrantes. Codificamos los agregados de datos teóricos bajo dominios de confinamiento temporal asíncrono que son matemáticamente impenetrables frente al descifrado de algoritmos de Shor y a la desfragmentación entrópica ejecutada por topologías supraconductivas.",
      "A medida que avanzamos hacia este vector, garantizamos implícitamente el axioma fundador de soberanía infraestructural, blindando los cimientos de la red analítica como una fortaleza hiperdimensional a un nivel abisal. El objetivo supremo no descansa en atenuar superficialmente los vectores de ataque contemporáneos, sino en invalidar algorítmicamente la viabilidad misma de la interceptación matemática externa en las inminentes eras del dominio cuántico digital."
    ]
  },
  {
    title: "IV. Neuralidad Predictiva Abisal y Filtrado Máximo",
    paragraphs: [
      "Nuestra concepción topológica final incuba sin retorno un subsistema matricial abisal configurado en torno a arquitecturas de Graph Neural Networks (GNN). Esta inyección arquitectónica habilita autónomamente al núcleo cognitivo para tejer cartografías completas sobre agrupaciones inescrutables de firmas oscuras. Subyugando a las redes de nodos subyacentes e inferiendo su estructura celular original determinista, el ensamblador lógico pulveriza con precisión la entropía de los clusters estocásticos.",
      "Estando pertrechados y preparados para subsumir la fricción letal de los mecanismos de Valor Máximo Extraíble (MEV), nuestros conductos base canalizan toda la lógica deductiva por subsistemas totalmente apartados del mempool primario. Esta convergencia técnica y asilamiento criptográfico mitiga algorítmicamente la fagocitación parasitaria de datos, estabilizando permanentemente nuestros canales métricos y aislando la asimetría sistémica contra las maquinaciones caníbales de los bots competidores en épocas de distorsión líquida.",
      "Como manifestación incontestable de trascendencia digital matemática, el pináculo evolutivo disecciona y amalgama sus funciones deductivas con las infraestructuras modulares de validadores fraccionados (Liquid Restaking). Esta hibridación hiperespacial nos confiere, como protocolo maestro, las facultades de desglosar instantáneamente las cascadas regresivas del consenso central de la red global inmutada, consolidando el arma criptográfica analítica incontestable para el futuro."
    ]
  }
];

export function ImmersiveManifestoLanding({ onOpenScanner }: { onOpenScanner?: () => void } = {}) {
  const [lotties, setLotties] = useState<string[]>([]);
  
  useEffect(() => {
    // Attempt to dynamically fetch whatever Lotties are available
    fetch('/api/lottie?file=__list__')
      .then(r => r.json())
      .then(d => {
         if (d.files && d.files.length > 0) setLotties(d.files);
      }).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#1a1a1a] selection:bg-black selection:text-white font-sans w-full"
         style={{ overflowY: 'auto', scrollBehavior: 'smooth' }}>

      <main className="max-w-[850px] mx-auto px-6 py-16 flex flex-col gap-24">
        
        <header className="flex flex-col gap-6 text-center mb-8">
          <h1 className="text-[32px] md:text-[42px] font-serif text-black leading-tight tracking-tight">
            En la búsqueda de la <br/><span className="italic font-light">transparencia</span>
          </h1>
          <div className="flex justify-center -mt-2 mb-2">
            <span className="text-[9px] font-mono font-bold uppercase tracking-[0.3em] text-black/30">
              © 2026 atfortyseven-creations
            </span>
          </div>
          <p className="font-serif text-[13px] text-[#444] max-w-xl mx-auto leading-relaxed border-t border-b border-black/10 py-6">
            Documento fundacional sobre la abstracción matemática pura, los mecanismos criptográficos de 
            conocimiento cero y los paradigmas heurísticos deterministas que cimentan la infraestructura global inmutable.
          </p>
        </header>

        <div className="flex flex-col gap-16">
          {IMMERSIVE_PAGES.map((page, pageIndex) => (
            <section key={pageIndex} className="flex flex-col relative w-full">
              <div className="w-full border-b-[1.5px] border-black pb-3 mb-6 flex items-end">
                <h2 className="text-[12px] font-bold font-mono tracking-[0.2em] uppercase text-black">
                  {page.title}
                </h2>
              </div>
              
              {/* Stack Data Grid - Dense and tightly packed */}
              <div className="flex flex-col gap-[1px] bg-black border border-black shadow-sm">
                {page.paragraphs.map((para, pIndex) => {
                   const globalIndex = (pageIndex * 3) + pIndex;
                   const lottieFile = lotties[globalIndex % Math.max(lotties.length, 1)];

                   return (
                     <div key={pIndex} className="bg-[#fdfbf6] flex flex-col sm:flex-row items-stretch group overflow-hidden">
                       
                       {/* Lottie fixed block on the left (solid stack integration) */}
                       <div className="w-full sm:w-[140px] bg-[#f5f4ef] flex items-center justify-center p-4 border-b sm:border-b-0 sm:border-r border-black/10 shrink-0 relative overflow-hidden transition-colors duration-500 group-hover:bg-[#f0efe9]">
                          {lottieFile && lotties.length > 0 && (
                             <div className="w-[100px] h-[100px] grayscale mix-blend-multiply opacity-85 transition-all duration-700 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105">
                                <OptimizedLocalLottie filename={lottieFile} />
                             </div>
                          )}
                          <div className="absolute top-2 left-2 text-[8px] font-mono opacity-20 select-none">
                            SEC-{pageIndex + 1}.{pIndex + 1}
                          </div>
                       </div>
                       
                       {/* Text Content */}
                       <div className="flex-1 p-6 md:p-8 flex items-start">
                          <span className="font-mono text-[10px] text-black/30 tracking-widest mr-4 sm:mr-6 select-none flex-shrink-0 mt-[2px]">
                             [{String(pageIndex + 1).padStart(2, '0')}.{String(pIndex + 1).padStart(2, '0')}]
                          </span>
                          <p className="font-serif text-[12px] sm:text-[13px] text-[#222] leading-[1.8] text-justify w-full">
                             {para}
                          </p>
                       </div>

                     </div>
                   );
                })}
              </div>
            </section>
          ))}
        </div>



        {onOpenScanner && (
          <div className="fixed bottom-0 left-0 w-full p-0 flex flex-col pointer-events-none z-50">
             <div className="h-20 bg-gradient-to-t from-[#FDFCF8] via-[#FDFCF8]/80 to-transparent w-full" />
             <div className="w-full bg-[#FDFCF8] border-t border-black/10 flex justify-center py-4">
               <button
                 onClick={onOpenScanner}
                 className="pointer-events-auto px-10 py-3 bg-black text-white font-mono text-[10px] uppercase tracking-[0.2em] hover:bg-neutral-800 transition-colors flex items-center gap-3"
               >
                 <Scan size={13} />
                 Session Log &amp; Scan
               </button>
             </div>
          </div>
        )}
      </main>

      {/* ─── Sovereign Footer (full-bleed, outside max-width container) ─── */}
      <SovereignFooter />

    </div>
  );
}
