"use client";

import { DownpageLayout } from "@/components/ui/DownpageLayout";

const sections = [
  {
    title: "Construyendo el Escudo Analítico del Futuro",
    paragraphs: [
      "Whale Alert Network es un equipo de ingenieros, criptógrafos, analistas de datos cuantitativos y diseñadores obsesionados con un objetivo unificado: devolver la privacidad absoluta a las finanzas globales sin sacrificar la inteligencia del mercado.",
      "Estamos financiados agresivamente (más de 100,000 euros garantizados por Aztec Network para nuestras próximas 5 fases) y estamos buscando mentes brillantes que no tengan miedo de destruir arquitecturas Web2 obsoletas para construir infraestructura Web3 nativa."
    ]
  },
  {
    title: "Roles Abiertos (Expansión Fase 3 y 4)",
    paragraphs: [
      "Ingeniero de Criptografía Aplicada (Noir / Rust): Requerido para desarrollar circuitos ZK-SNARK personalizados y optimizar la generación de pruebas en el navegador (Client-Side Proving) para el motor de alertas.",
      "Ingeniero Cuantitativo (EVM / MEV): Para diseñar modelos predictivos que analicen las anomalías de liquidez en tiempo real a través del 'Humanity Ledger'.",
      "Ingeniero Front-End Especialista en WebGL/Animaciones: Buscamos a alguien capaz de transformar datos financieros áridos en interfaces inmersivas, fluidas y con calidad cinemática (Máxima Perfección Visual)."
    ]
  },
  {
    title: "La Cultura del Equipo",
    paragraphs: [
      "No creemos en horarios rígidos, burocracia ni oficinas tradicionales. Creemos en el código inmutable, la belleza del diseño matemático y la entrega de productos revolucionarios.",
      "Si crees que la transparencia blockchain actual es un error de diseño y tienes la capacidad técnica para solucionarlo, este es tu sitio."
    ]
  },
  {
    title: "Proceso de Solicitud ZK",
    paragraphs: [
      "Para aplicar, no necesitamos tu nombre ni tu currículum tradicional. Simplemente interactúa con nuestro contrato de reclutamiento desplegado en Base o Aztec, demuestra tu competencia resolviendo nuestro desafío criptográfico on-chain, y envíanos la prueba de Conocimiento Cero de tu éxito."
    ]
  }
];

export default function CareersPage() {
  return (
    <DownpageLayout 
      pageTitle="Únete a la Vanguardia"
      subtitle="Estamos contratando a los mejores criptógrafos e ingenieros del planeta para asegurar el futuro de las finanzas privadas."
      indexTitle="Carreras"
      sections={sections}
    />
  );
}
