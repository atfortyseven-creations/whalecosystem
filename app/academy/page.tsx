"use client";

import { DownpageLayout } from "@/components/ui/DownpageLayout";

const sections = [
  {
    title: "Módulo 1: La Transparencia como Vector de Ataque",
    paragraphs: [
      "Aprende cómo operan las herramientas forenses modernas de análisis on-chain (como Arkham o Nansen) para de-anonimizar a los usuarios.",
      "Analizaremos casos reales donde la falta de privacidad ha resultado en la pérdida de ventajas competitivas en el mercado, secuestros de estrategias MEV y violaciones de seguridad personal."
    ]
  },
  {
    title: "Módulo 2: Criptografía Zero-Knowledge (ZK)",
    paragraphs: [
      "Desmitificando el 'Conocimiento Cero'. Aprenderás cómo es matemáticamente posible demostrar que tienes fondos suficientes para realizar una transacción, sin revelar cuál es tu saldo total ni a quién le estás enviando el dinero.",
      "Exploración interactiva del lenguaje Noir y la arquitectura de estado híbrido de Aztec Network."
    ]
  },
  {
    title: "Módulo 3: El Escáner de Ballenas Híbrido",
    paragraphs: [
      "Masterclass técnica sobre cómo funciona Whale Alert Network. Aprende a conectar el flujo masivo de datos públicos y cruzarlo con tus estrategias privadas sin filtrar inteligencia al mercado.",
      "Configuración de alertas de liquidez, monitorización de puentes inter-cadena (cross-chain bridges) y detección de rug-pulls institucionales."
    ]
  },
  {
    title: "Módulo 4: Soberanía de Hardware y Sesiones Aisladas",
    paragraphs: [
      "Comprende el protocolo de seguridad que ocurre cuando escaneas el código QR para entrar a nuestra plataforma. Aprende por qué aislar tus llaves privadas en un dispositivo móvil (Air-Gapping) es la única defensa efectiva contra el malware de escritorio moderno."
    ]
  }
];

export default function AcademyPage() {
  return (
    <DownpageLayout 
      pageTitle="Academia Criptográfica"
      subtitle="Domina la inteligencia de mercado, la seguridad operacional (OpSec) y los fundamentos de la criptografía de Conocimiento Cero."
      indexTitle="Academia ZK"
      sections={sections}
    />
  );
}
