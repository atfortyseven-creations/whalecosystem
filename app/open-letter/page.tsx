"use client";

import { DownpageLayout } from "@/components/ui/DownpageLayout";

const sections = [
  {
    title: "A la Industria Criptográfica y Financiera Tradicional",
    paragraphs: [
      "Nos encontramos en una encrucijada crítica en la historia de internet y las finanzas globales. La tecnología blockchain nos prometió la liberación de los monopolios financieros, pero en su estado actual, nos ha entregado la prisión de vigilancia más transparente jamás construida.",
      "Las corporaciones de análisis on-chain están indexando, categorizando y vendiendo las huellas financieras de millones de personas a gobiernos, agencias y al mejor postor. Esto no es libertad financiera; es un retroceso hacia el control totalitario."
    ]
  },
  {
    title: "La Falsa Dicotomía",
    paragraphs: [
      "La narrativa dominante sugiere que debemos elegir entre 'cumplimiento regulatorio' y 'privacidad'. Nos dicen que la privacidad solo sirve a criminales. Esta es una mentira diseñada para mantener el monopolio de los datos.",
      "La infraestructura que hemos construido hoy junto a Aztec Network demuestra que podemos tener un mercado completamente transparente y auditable a nivel macroscópico, manteniendo una privacidad absoluta e inquebrantable a nivel individual."
    ]
  },
  {
    title: "Nuestro Compromiso Inquebrantable",
    paragraphs: [
      "Whale Alert Network rechaza categoricamente la recolección masiva de datos personales. Hemos quemado los puentes hacia la web corporativa tradicional. No tenemos bases de datos de correos electrónicos, no guardamos contraseñas y no rastreamos tus clics.",
      "Hemos transformado nuestra arquitectura para que el poder resida en tu dispositivo físico, garantizado por las leyes de las matemáticas y la criptografía de Conocimiento Cero."
    ]
  },
  {
    title: "El Siguiente Paso",
    paragraphs: [
      "Hacemos un llamado a todos los desarrolladores, fundadores institucionales y analistas de mercado: Exijan infraestructuras de privacidad por defecto. La tecnología ya está aquí. Las excusas se han agotado.",
      "El futuro de las finanzas pertenece a los soberanos."
    ]
  }
];

export default function OpenLetterPage() {
  return (
    <DownpageLayout 
      pageTitle="Carta Abierta"
      subtitle="Un mensaje inquebrantable a la industria sobre el futuro de la vigilancia financiera y el derecho a la soberanía de los datos."
      indexTitle="Declaración"
      sections={sections}
    />
  );
}
