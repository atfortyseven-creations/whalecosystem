"use client";

import { DownpageLayout } from "@/components/ui/DownpageLayout";

const sections = [
  {
    title: "El Nacimiento en la Oscuridad del Mercado",
    paragraphs: [
      "Whale Alert Network nació de una observación inquietante: las instituciones y los grandes capitales (las 'ballenas') jugaban con una baraja marcada. Ellos poseían herramientas forenses capaces de rastrear al inversor minorista en tiempo real, mientras que el público general navegaba a ciegas.",
      "Nuestra misión inicial fue democratizar estos datos. Construimos escáneres capaces de detectar transacciones masivas instantáneamente y enviarlas a la luz pública. Nivelamos el campo de juego."
    ]
  },
  {
    title: "El Costo Inaceptable de la Luz",
    paragraphs: [
      "Sin embargo, pronto descubrimos el efecto secundario de la transparencia radical de las blockchains públicas. A medida que democratizábamos la información, nos dábamos cuenta de que la red entera se estaba convirtiendo en un panóptico.",
      "Las mismas herramientas de análisis que creamos para vigilar a los grandes capitales estaban siendo utilizadas por terceros para vigilar al ciudadano de a pie. Estábamos resolviendo la asimetría de la información, pero destruyendo el derecho a la privacidad en el proceso."
    ]
  },
  {
    title: "El Punto de Inflexión: La Convergencia Aztec",
    paragraphs: [
      "La solución llegó a través de la criptografía avanzada. Conocimos la misión de Aztec Network y comprendimos que el Conocimiento Cero (Zero-Knowledge) era el único camino para resolver esta paradoja.",
      "Tuvimos que destruir y reconstruir nuestra plataforma desde los cimientos. Decidimos que ofreceríamos los datos financieros más rápidos y potentes del mundo, pero a través de un prisma criptográfico que blindara al observador."
    ]
  },
  {
    title: "El Presente: El Analista Invisible",
    paragraphs: [
      "Hoy, Whale Alert Network no es solo una plataforma de datos. Es un escudo de grado militar para tu mente financiera.",
      "Nuestra historia es la prueba viva de que la evolución tecnológica no tiene por qué sacrificar las libertades civiles. El cazador de ballenas ahora es completamente invisible."
    ]
  }
];

export default function StoryPage() {
  return (
    <DownpageLayout 
      pageTitle="Nuestra Historia"
      subtitle="Desde la transparencia radical hasta la privacidad absoluta. El camino para construir el radar financiero definitivo."
      indexTitle="Orígenes"
      sections={sections}
    />
  );
}
