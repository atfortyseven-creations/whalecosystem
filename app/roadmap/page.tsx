"use client";

import { DownpageLayout } from "@/components/ui/DownpageLayout";

const sections = [
  {
    title: "Fase 1: La Fundación Cuántica (Completado)",
    paragraphs: [
      "Lanzamiento de la arquitectura base del Humanity Ledger. Implementación de nodos de procesamiento ultrarrápido y almacenamiento volátil local.",
      "Integración exitosa del sistema de validación criptográfica multi-dispositivo (Escaneo QR a Sesión Instantánea) para eliminar la fricción del usuario sin comprometer la seguridad."
    ]
  },
  {
    title: "Fase 2: Escudo ZK Institucional (Actual)",
    paragraphs: [
      "Despliegue total de la red híbrida sobre Aztec Network. Implementación de pruebas de Conocimiento Cero (Zero-Knowledge Proofs) del lado del cliente.",
      "Desarrollo del panel 'QDS Core Dots' para la transferencia de activos y metadata encriptada con entropía cuántica de 256 bits, garantizando la inmutabilidad de cada recibo de forma invisible al mercado."
    ]
  },
  {
    title: "Fase 3: Inteligencia Predictiva Blindada (Q3 2026)",
    paragraphs: [
      "Activación del Motor Predictivo Whale Alert impulsado por IA, que opera de forma estrictamente local dentro del entorno cifrado del usuario.",
      "Las instituciones podrán modelar escenarios de estrés del mercado DeFi y recibir alertas de riesgo en tiempo real sin revelar al modelo de IA qué activos poseen o qué redes operan."
    ]
  },
  {
    title: "Fase 4: Consenso Descentralizado (Q1 2027)",
    paragraphs: [
      "Transición del secuenciador principal a una red completamente distribuida. Apertura de nodos validadores ZK para la comunidad.",
      "Lanzamiento de la gobernanza criptográfica inmutable, permitiendo a los validadores del Humanity Ledger auditar y dirigir el futuro del código sin un núcleo corporativo central."
    ]
  },
  {
    title: "Fase 5: Adopción Global y Sincronización Universal (Q4 2027)",
    paragraphs: [
      "Integración multiplataforma (Cross-chain ZK-Rollups) permitiendo que cualquier movimiento masivo de liquidez en cualquier blockchain (Solana, Bitcoin, Ethereum, L2s) sea asimilado y protegido por nuestro escudo de privacidad en menos de 500 milisegundos.",
      "Expansión hacia los mercados financieros tradicionales, ofreciendo herramientas forenses de grado Wall Street protegidas por la infraestructura Web3 nativa."
    ]
  }
];

export default function RoadmapPage() {
  return (
    <DownpageLayout 
      pageTitle="Hoja de Ruta (Roadmap)"
      subtitle="La evolución de nuestra infraestructura y los próximos hitos en nuestra misión para encriptar el análisis financiero global."
      indexTitle="Evolución Técnica"
      sections={sections}
    />
  );
}
