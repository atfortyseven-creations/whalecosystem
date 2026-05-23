"use client";

import { DownpageLayout } from "@/components/ui/DownpageLayout";

const sections = [
  {
    title: "El Ágora Soberano",
    paragraphs: [
      "El Foro Comunitario de Whale Alert Network es el primer espacio de debate financiero libre de algoritmos de rastreo, censura corporativa y bots.",
      "Para participar en la discusión de estrategias de inversión, análisis de mercado y gobernanza del protocolo, se requiere poseer un Pase Soberano o validar tu identidad mediante criptografía Zero-Knowledge."
    ]
  },
  {
    title: "Normas de la Comunidad Cuántica",
    paragraphs: [
      "1. Absoluta Inmutabilidad: Las opiniones, datos y análisis publicados no pueden ser borrados ni censurados por administradores centrales, ya que residen en una estructura de almacenamiento distribuido.",
      "2. Veracidad Criptográfica: Ningún usuario puede fingir ser un fondo de inversión. Las reclamaciones sobre volúmenes de trading o carteras bajo gestión deben estar acompañadas de pruebas ZK (Pruebas de Solvencia o Conocimiento de Billetera).",
      "3. Respeto Técnico: El debate se centrará estrictamente en el código, el análisis matemático del mercado, la infraestructura Web3 y las implicaciones macroeconómicas."
    ]
  },
  {
    title: "Categorías Principales",
    paragraphs: [
      "- ZK-Alpha: Discusión sobre oportunidades de mercado asimétricas y movimientos anómalos detectados en el 'Humanity Ledger'.",
      "- Gobernanza del Protocolo: Propuestas para la mejora del código abierto, cambios en la purga de datos o adición de nuevas redes de Capa 2.",
      "- Criptografía Aplicada: Debates técnicos sobre la implementación del lenguaje Noir, mejoras al protocolo de Aztec Network y estrategias de Air-Gapping."
    ]
  }
];

export default function ForumPage() {
  return (
    <DownpageLayout 
      pageTitle="Foro de la Comunidad"
      subtitle="El epicentro del debate intelectual, estratégico y técnico. Acceso restringido a identidades criptográficamente soberanas."
      indexTitle="El Foro"
      sections={sections}
    />
  );
}
