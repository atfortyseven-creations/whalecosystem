"use client";

import { DownpageLayout } from "@/components/ui/DownpageLayout";

const sections = [
  {
    title: "1. Aceptación Matemática, No Contractual",
    paragraphs: [
      "A diferencia de las plataformas tradicionales Web2, el uso de Whale Alert Network no está regido exclusivamente por un contrato en prosa legal que puede ser alterado arbitrariamente. La interacción con nuestra infraestructura está gobernada por contratos inteligentes (Smart Contracts) de código abierto y reglas criptográficas deterministas.",
      "Al interactuar con nuestra red mediante la firma de protocolos de Conocimiento Cero (Zero-Knowledge) o la sincronización de tu billetera, aceptas que las matemáticas y el código desplegado en la blockchain (Ethereum, Base, etc.) son los árbitros definitivos de la ejecución."
    ]
  },
  {
    title: "2. Soberanía de Responsabilidad",
    paragraphs: [
      "Te proporcionamos un motor analítico sin precedentes, capaz de procesar y filtrar datos del mercado financiero en milisegundos de forma completamente privada. Sin embargo, no somos asesores financieros ni fiduciarios.",
      "Cualquier estrategia de inversión, movimiento de liquidez o decisión comercial que tomes utilizando nuestras herramientas analíticas o nuestros terminales de transferencia QDS es bajo tu absoluta y exclusiva responsabilidad."
    ]
  },
  {
    title: "3. La Volatilidad de los Datos (The Humanity Ledger)",
    paragraphs: [
      "Reconoces y aceptas que el motor principal de nuestra plataforma, el 'Humanity Ledger', está programado arquitectónicamente para ser volátil. Todos los datos analíticos locales y la caché de sincronización se purgan irreversiblemente cada 11 horas y 55 minutos.",
      "No existe ningún sistema de copias de seguridad de historiales de navegación privada o estrategias de alerta. Si pierdes tus llaves locales o tus tokens QDS, nosotros no tenemos la capacidad técnica ni criptográfica para recuperarlos."
    ]
  },
  {
    title: "4. No Rastreo y Ausencia de KYC",
    paragraphs: [
      "Garantizamos por diseño que no realizaremos procesos tradicionales de Conoce-a-tu-Cliente (KYC) que involucren la recolección de tus documentos de identidad, correos electrónicos o números telefónicos.",
      "La validación de tu identidad como usuario legítimo se realizará estricta y únicamente a través de protocolos Proof-of-Humanity o firmas criptográficas anónimas que protegen la red de ataques Sybil sin violar tu derecho a la privacidad."
    ]
  }
];

export default function TermsPage() {
  return (
    <DownpageLayout 
      pageTitle="Términos Soberanos"
      subtitle="El código como ley. Las reglas deterministas que gobiernan la interacción con nuestra infraestructura cuántica."
      indexTitle="Legal ZK"
      sections={sections}
    />
  );
}
