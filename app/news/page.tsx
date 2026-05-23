"use client";

import { DownpageLayout } from "@/components/ui/DownpageLayout";

const sections = [
  {
    title: "Sincronización Total con Aztec Network",
    paragraphs: [
      "Hemos completado la fase arquitectónica más crítica de Whale Alert Network. La integración total de las pruebas Zero-Knowledge del lado del cliente (Client-Side Proving) ya está activa en producción.",
      "Cualquier análisis de mercado, escaneo de liquidez o rastreo de carteras se realiza ahora bajo un escudo criptográfico impenetrable. El observador es matemáticamente invisible."
    ]
  },
  {
    title: "Lanzamiento del Motor 'QDS Core Dots'",
    paragraphs: [
      "Hemos desplegado exitosamente nuestro terminal de recibos inmutables. El sistema permite la transferencia de metadata utilizando firmas avanzadas ERC-2612 y validación ZK, generando entropía de 256 bits por transacción.",
      "El mercado institucional ahora puede mover información de liquidez de forma programática y privada con recibos on-chain matemáticamente inviolables."
    ]
  },
  {
    title: "El 'Humanity Ledger' alcanza Nivel de Madurez Institucional",
    paragraphs: [
      "Nuestro motor de almacenamiento táctico local superó recientemente pruebas de estrés masivas, indexando datos en tiempo real sin latencia observable.",
      "A pesar del volumen masivo de datos de mercado procesados, el sistema continúa ejecutando sus ciclos de purga criptográfica cada 11 horas y 55 minutos a la perfección, garantizando un entorno de investigación completamente aséptico."
    ]
  }
];

export default function NewsPage() {
  return (
    <DownpageLayout 
      pageTitle="Transmisiones de la Red"
      subtitle="El centro de actualizaciones oficiales, despliegues técnicos y arquitectura ZK del protocolo."
      indexTitle="Noticias"
      sections={sections}
    />
  );
}
