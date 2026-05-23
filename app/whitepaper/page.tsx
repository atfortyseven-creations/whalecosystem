"use client";

import { DownpageLayout } from "@/components/ui/DownpageLayout";

const sections = [
  {
    title: "Abstract",
    paragraphs: [
      "Este documento detalla la arquitectura técnica de Whale Alert Network, una plataforma híbrida de análisis financiero descentralizado impulsada por la tecnología Zero-Knowledge de Aztec Network.",
      "El objetivo del protocolo es resolver la paradoja de la visibilidad en blockchains públicas (Ethereum, Solana, Base) permitiendo a los inversores acceder a inteligencia de mercado institucional en tiempo real sin revelar su vector de análisis, identidad o estrategia de inversión."
    ]
  },
  {
    title: "Arquitectura Híbrida de Análisis",
    paragraphs: [
      "La plataforma opera sobre un motor asíncrono que indexa bloques crudos (Raw Blocks) directamente desde nodos de Capa 1 y Capa 2. Este proceso alimenta el 'Humanity Ledger', una base de datos táctica de alta velocidad que reside temporalmente en los servidores de borde.",
      "La innovación cuántica ocurre en la capa de interacción del usuario. Cuando el cliente consulta estos datos para configurar una alerta de ballenas o analizar un portafolio, la petición se cifra mediante pruebas ZK-SNARK del lado del cliente. La red no sabe qué contrato o qué billetera específica está siendo monitoreada por el usuario."
    ]
  },
  {
    title: "Autenticación Soberana sin Servidor (Serverless Auth)",
    paragraphs: [
      "El sistema de inicio de sesión erradica el concepto de contraseñas. Implementamos un modelo 'Air-Gapped' mediante códigos QR dinámicos. El teléfono móvil del usuario actúa como un HSM (Hardware Security Module) soberano.",
      "Al escanear el código, el dispositivo móvil firma un payload único generado por un CSPRNG de 256 bits y envía la firma criptográfica al ordenador anfitrión. La sesión se instaura sin que las claves privadas toquen la memoria del PC."
    ]
  },
  {
    title: "Purgado Matemático del 'Humanity Ledger'",
    paragraphs: [
      "A diferencia de plataformas como Etherscan que mantienen un registro perpetuo, Whale Alert Network implementa un ciclo de autodestrucción. Todos los datos analíticos cacheados se purgan localmente cada 11 horas y 55 minutos.",
      "Esto asegura que, incluso frente a un ataque de día cero o una incautación física de hardware, no exista material forense que correlacione a los usuarios con sus estrategias de mercado."
    ]
  },
  {
    title: "Conclusión Técnica",
    paragraphs: [
      "Hemos condensado las operaciones criptográficas más exigentes computacionalmente en una interfaz fluida e instantánea. Whale Alert Network es el primer radar on-chain donde el analista se convierte matemáticamente en un fantasma indiscutible."
    ]
  }
];

export default function WhitepaperPage() {
  return (
    <DownpageLayout 
      pageTitle="Whitepaper Técnico"
      subtitle="Especificaciones técnicas y arquitectónicas del protocolo de análisis de estado híbrido de Whale Alert Network."
      indexTitle="Documentación"
      sections={sections}
    />
  );
}
