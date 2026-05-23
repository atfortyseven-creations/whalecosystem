"use client";

import { DownpageLayout } from "@/components/ui/DownpageLayout";

const sections = [
  {
    title: "El Fin de la Era de la Vigilancia Financiera",
    paragraphs: [
      "Durante más de una década, la tecnología blockchain ha operado bajo una ilusión fundamental: la creencia de que la transparencia radical es un requisito indispensable para la descentralización. Este modelo ha creado el ecosistema de vigilancia financiera más perfecto de la historia humana.",
      "Cada movimiento, cada inversión, cada estrategia ha quedado expuesta permanentemente en un libro mayor inmutable para que cualquier corporación, fondo de inversión o actor malicioso pueda analizarla, rastrearla y explotarla.",
      "En Whale Alert Network, declaramos el fin de esta era. La transparencia debe aplicarse a las instituciones y a la infraestructura, no a los individuos. Exigimos privacidad absoluta para el usuario."
    ]
  },
  {
    title: "Soberanía de Datos como Derecho Fundamental",
    paragraphs: [
      "Tu historial de transacciones es un mapa exacto de tu vida, tus ideas y tu patrimonio. Forzar a los usuarios a publicarlo para poder participar en la economía del futuro no es innovación; es coerción.",
      "Rechazamos los modelos de negocio basados en la venta y monetización de los datos del usuario. Hemos rediseñado toda nuestra infraestructura integrando la criptografía Zero-Knowledge (Conocimiento Cero) de Aztec Network, devolviendo el control absoluto de la identidad y el patrimonio a quien legítimamente le pertenece: a ti."
    ]
  },
  {
    title: "El Principio de la Invisibilidad Matemática",
    paragraphs: [
      "No dependemos de la confianza humana. Las promesas de privacidad de las corporaciones tradicionales son documentos vacíos de 'Términos y Condiciones' que cambian a conveniencia. Nuestra privacidad está respaldada por leyes matemáticas inquebrantables.",
      "A través de pruebas de validación del lado del cliente y arquitecturas de estado encriptado, garantizamos que tus datos sean verificados por la red sin ser revelados jamás. Ni siquiera nosotros, como creadores de la plataforma, podemos acceder a tu información."
    ]
  },
  {
    title: "Una Alianza para el Futuro",
    paragraphs: [
      "Nuestra integración profunda con Aztec Network no es una simple asociación técnica; es una alineación filosófica. Compartimos la visión de que el futuro de Ethereum y de la web financiera requiere una capa de privacidad nativa, programable y descentralizada.",
      "Al construir la herramienta analítica de mercados más potente del mundo (el Humanity Ledger) sobre este escudo criptográfico, estamos demostrando que las herramientas de grado institucional ya no requieren que el usuario sacrifique su identidad. Hemos construido el verdadero ecosistema financiero del mañana."
    ]
  }
];

export default function ManifestoPage() {
  return (
    <DownpageLayout 
      pageTitle="Manifiesto Soberano"
      subtitle="Nuestra declaración fundacional sobre la libertad de datos, la criptografía de Conocimiento Cero y el derecho a la privacidad financiera."
      indexTitle="El Manifiesto"
      sections={sections}
    />
  );
}
