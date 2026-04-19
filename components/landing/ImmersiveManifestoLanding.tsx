"use client";

import React from "react";
import { OptimizedLocalLottie } from "./OptimizedLocalLottie";
import { SovereignFooter } from "./SovereignFooter";
import { InteractiveFluidGrid } from "./InteractiveFluidGrid";
import { Scan } from "lucide-react";

// Pre-defined list of lottie files matching the narrative sections.
// This preserves the "zero build-time bloat" since these are just string paths
// and they are fetched on-demand at runtime by OptimizedLocalLottie.
const MANIFESTO_LOTTIES = [
  "Earth globe rotating with Seamless loop animation.json",
  "DeeWork About Blockchain.json",
  "Crypto coins.json",
  "Big Data Analytics.json",
  "Isometric data analysis.json",
  "A Female Employee is Reading Financial Statements.json",
  "enterprice.json",
  "Manufacturing Industry Working Staff.json",
  "Business Analysis.json",
  "Browser Loading.json",
  "Abstract Isometric Loader #1.json",
  "Trade.json",
  "Online Payment.json",
  "Payments.json",
  "website.json",
  "Share.json",
  "History.json",
  "Search for value.json",
  "Business plan.json",
  "Business.json",
  "Virtual Education.json",
  "Distance Learning.json",
  "Geography.json",
  "Bitcoin touch.json",
  "Invest - Trade - concept.json",
  "BlockChain.json"
];

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
  },
  {
    title: "V. Perspectiva Histórica y Valor Subyacente",
    paragraphs: [
      "La cronología de la evolución criptográfica revela un patrón irrefutable: la descentralización no es un mero fenómeno cíclico, sino una reestructuración sistémica de los medios de transferencia fiduciarios hacia reservas puramente algorítmicas, impermeables a la inflación originada por políticas centrales.",
      "Identificamos que la búsqueda de valor intrínseco en la era digital no descansa en oráculos centralizados, sino en métricas deterministas extraídas de la cadena misma. Las asimetrías de información se disipan cuando la lectura termodinámica de los contratos inteligentes permite auditar el capital sin custodios.",
      "El diseño de un plan de negocio descentralizado exige la abolición total de jerarquías tradicionales. Al codificar las directivas operacionales en agentes sintéticos, la gobernanza institucional transmuta de una estructura de confianza humana hacia una certidumbre matemática implacable y automatizada.",
      "Las corporaciones soberanas del mañana no dependerán de fronteras jurisdiccionales tangibles, operando exclusivamente mediante arquitecturas en la red soberana donde la liquidación es instantánea, perpetua y verificada asíncronamente mediante atestiguaciones on-chain."
    ]
  },
  {
    title: "VI. Formación Algorítmica y Omnipresencia Geográfica",
    paragraphs: [
      "El paradigma de la educación virtual aplicado a la infraestructura de capa uno garantiza la formación asimétrica de élites técnicas. La integración académica pura directamente en el entorno de pruebas on-chain cultiva validadores y arquitectos desprovistos del sesgo de los currículos tradicionales.",
      "El aprendizaje distribuido a través de todo el consenso oblitera las barreras epistemológicas vigentes. Al destilar principios criptográficos en canales de transmisión de conocimiento cero, formamos nodos humanos que piensan y operan a la misma frecuencia de la máquina virtual subyacente.",
      "Desvinculados del concepto obsoleto de Estado-nación geográfico, la dispersión topológica de nuestro observatorio nos confiere una ubicuidad absoluta. Esta neutralidad espacial blinda nuestro radar contra incursiones regulatorias asimétricas y garantiza resiliencia perpetua ante interrupciones locales."
    ]
  },
  {
    title: "VII. Acumulación Dinámica y Soberanía Criptográfica",
    paragraphs: [
      "El contacto directo con el estrato base criptográfico no es un mero punto de entrada; es la singularidad fundacional. Al observar los movimientos génesis de capital, nuestro rastreador aísla la fuente primordial de volumen, descartando el ruido secundario propagado por mercados derivativos subyacentes.",
      "El comercio unificado bajo dinámicas de inversión institucionales transmuta de una especulación estocástica hacia ejecuciones paramétricas puras. Evaluamos los flujos cruzados de liquidez con rigor analítico, desconstruyendo portafolios agregados instante por instante mientras navegan redes ofuscadas.",
      "Finalmente, el propio sustrato del consenso distribuido actúa como el ente verificador supremo. Al adherirnos a su arquitectura modular, certificamos de manera inmutable que todos los procesos de telemetría y recolección analítica permanezcan encriptados, infalsificables y custodiados por el determinismo matemático absoluto."
    ]
  }
];

const LEFT_SIDEBAR_CONTENT = [
  {
    title: "Desfalco de Mt. Gox (2014)",
    text: "El paroxismo originario de la fragilidad del custodio centralizado. Al delegar la custodia de ochocientas cincuenta mil unidades de Bitcoin a una infraestructura de servidores tradicional con bases de datos SQL mutables, la asimetría de seguridad derivó en la sustracción silente y prolongada del setenta por ciento del volumen global. Postulado fundacional absoluto: la posesión algorítmica fidedigna es inexistente fuera de las claves privadas criptográficas."
  },
  {
    title: "Espiral de Muerte de Terra/LUNA (2022)",
    text: "La demostración empírica del fracaso matemático de las stablecoins algorítmicas subcolateralizadas. Fomentados por reservas de fe en lugar de inmutabilidad matemática sobredimensionada, los anclajes de valor colapsaron bajo presión hiperbólica, evaporando sesenta mil millones de capital fiduciario en setenta y dos horas. Revela crudamente que la economía cibernética no sobrevive al apalancamiento sin anclas tangibles en capa cero."
  },
  {
    title: "Colapso del Imperio FTX (2022)",
    text: "El cenit global de la opacidad institucional en el siglo XXI. Operando tras una falsa cortina de regulación, la rehipotecación algorítmica del capital de los usuarios mediante 'puertas traseras' en el código base tradicional facilitó la dilapidación abismal de reservas. Esta implosión sistemática purificó el ecosistema, evidenciando que sin herramientas de transparencia on-chain y liquidación determinista, los oráculos humanos caen en depravación."
  }
];

const RIGHT_SIDEBAR_CONTENT = [
  {
    title: "Bifurcación de The DAO (2016)",
    text: "El evento de fisura más profundo en la axiomática del 'Código es Ley'. Tras la recolección masiva de Ether en la naciente Máquina Virtual de Ethereum, un ataque por reentrada de funciones drenó severamente el contrato maestro. La corrección requirió una amputación brutal mediante bifurcación dura (Hard Fork), alterando para siempre la génesis de la red y exponiendo la inmadurez biológica de la lógica computacional inmutable pura."
  },
  {
    title: "Extracción del Ronin Bridge (2022)",
    text: "El siniestro absoluto por la ilusión de la descentralización. Un puente de escalabilidad cedió más de seiscientos millones de dólares porque su autoridad matemática residía en un esquema M-de-N extremadamente precario (cinco de nueve validadores). Al comprometer las firmas mediante vectores de ataque de ingeniería social corporativa, se desmanteló por completo la narrativa subyacente de seguridad distribuida real."
  },
  {
    title: "La Fisura de Wormhole (2022)",
    text: "El clímax de vulnerabilidad en la topología poli-cadena (Cross-chain). Mediante la falsificación algorítmica de atestaciones y la elusión de validaciones triviales en los contratos inteligentes de puenteo, la arquitectura sufrió una sustracción inmediata de gran magnitud sin contramedidas reactivas posibles. Concluyendo definitivamente que los vectores poli-cadena elevan la entropía sistémica exponencialmente si no se auditan a prueba de abismos."
  }
];

export function ImmersiveManifestoLanding({ onOpenScanner }: { onOpenScanner?: () => void } = {}) {
  
  return (
    <div className="min-h-[100dvh] bg-[#FDFCF8] text-[#1a1a1a] selection:bg-black selection:text-white font-sans w-full max-w-[100vw] overflow-x-hidden"
         style={{ overflowY: 'auto', scrollBehavior: 'smooth' }}>

      <InteractiveFluidGrid />

      <div className="relative z-10 w-full max-w-[1550px] mx-auto px-5 sm:px-8 flex justify-center pb-48">
        
        {/* Left Academic Column */}
        <aside className="hidden min-[1350px]:flex flex-col pt-36 pr-12 w-[320px] shrink-0">
          <div className="border-b-[1.5px] border-black pb-2 mb-8">
            <h3 className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#555]">
              Tracto I: Opacidad y Ruina
            </h3>
          </div>
          <div className="flex flex-col gap-12">
            {LEFT_SIDEBAR_CONTENT.map((item, i) => (
              <article key={i} className="flex flex-col relative group">
                <div className="absolute -left-4 top-1 bottom-0 w-px bg-black/10 group-hover:bg-black transition-colors duration-500" />
                <h4 className="font-mono text-[9px] uppercase tracking-widest text-[#222] font-bold mb-3 leading-loose">
                  [{String(i + 1).padStart(2, '0')}] {item.title}
                </h4>
                <p className="font-serif text-[11px] text-[#444] leading-[1.85] text-justify opacity-80 group-hover:opacity-100 transition-opacity duration-500">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </aside>

        {/* Central Immersive Manifesto */}
        <main className="w-full max-w-[850px] shrink-0 py-12 sm:py-16 flex flex-col gap-16 sm:gap-24">
          
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
                   const lottieFile = MANIFESTO_LOTTIES[globalIndex % MANIFESTO_LOTTIES.length];

                   return (
                     <div key={pIndex} className="bg-[#fdfbf6] flex flex-col sm:flex-row items-stretch group overflow-hidden">
                       
                       {/* Lottie fixed block on the left (solid stack integration) */}
                       <div className="w-full sm:w-[240px] bg-[#f5f4ef] flex items-center justify-center p-8 sm:p-6 border-b sm:border-b-0 sm:border-r border-black/10 shrink-0 relative overflow-hidden transition-colors duration-500 hover:bg-[#f0efe9] sm:group-hover:bg-[#f0efe9]">
                          <div className="w-[140px] h-[140px] sm:w-[180px] sm:h-[180px] grayscale mix-blend-multiply opacity-85 transition-transform duration-700 sm:group-hover:grayscale-0 sm:group-hover:opacity-100 sm:group-hover:scale-105">
                             <OptimizedLocalLottie filename={lottieFile} />
                          </div>
                          <div className="absolute top-3 left-3 text-[9px] font-mono opacity-20 select-none">
                            SEC-{pageIndex + 1}.{pIndex + 1}
                          </div>
                       </div>
                       
                       {/* Text Content */}
                       <div className="flex-1 p-5 sm:p-6 md:p-8 flex items-start">
                          <span className="font-mono text-[10px] text-black/30 tracking-widest mr-3 sm:mr-6 select-none flex-shrink-0 mt-[2px]">
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
        </main>

        {/* Right Academic Column */}
        <aside className="hidden min-[1350px]:flex flex-col pt-36 pl-12 w-[320px] shrink-0">
          <div className="border-b-[1.5px] border-black pb-2 mb-8">
            <h3 className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#555]">
              Tracto II: Entropía Central
            </h3>
          </div>
          <div className="flex flex-col gap-12">
            {RIGHT_SIDEBAR_CONTENT.map((item, i) => (
              <article key={i} className="flex flex-col relative group">
                <div className="absolute -left-4 top-1 bottom-0 w-px bg-black/10 group-hover:bg-black transition-colors duration-500" />
                <h4 className="font-mono text-[9px] uppercase tracking-widest text-[#222] font-bold mb-3 leading-loose">
                  [{String(i + 4).padStart(2, '0')}] {item.title}
                </h4>
                <p className="font-serif text-[11px] text-[#444] leading-[1.85] text-justify opacity-80 group-hover:opacity-100 transition-opacity duration-500">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </aside>

      </div>

      {/* Floating Scanner Panel (Out of flow) */}
      {onOpenScanner && (
        <div className="fixed bottom-0 left-0 w-full p-0 flex flex-col pointer-events-none z-50">
           <div className="h-24 bg-gradient-to-t from-[#FDFCF8] via-[#FDFCF8]/90 to-transparent w-full pointer-events-none" />
           <div className="w-full bg-[#FDFCF8] border-t border-black/10 flex justify-center py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
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

      {/* ─── Sovereign Footer (full-bleed, outside max-width container) ─── */}
      <div className="relative z-10">
        <SovereignFooter />
      </div>

    </div>
  );
}
