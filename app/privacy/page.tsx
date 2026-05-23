"use client";

import { DownpageLayout } from "@/components/ui/DownpageLayout";

const sections = [
  {
    title: "Privacidad Programable por Defecto",
    paragraphs: [
      "La arquitectura actual de las finanzas descentralizadas (DeFi) impone una transparencia radical y tóxica, obligando a los usuarios a transmitir todo su historial financiero para participar en el ecosistema. Esto limita fundamentalmente el alcance de lo que se puede construir en la blockchain y compromete la soberanía individual de cada inversor.",
      "En Whale Alert Network, creemos que la privacidad es un derecho humano innegociable, no una característica opcional. Al integrar la arquitectura de Conocimiento Cero (Zero-Knowledge) de Aztec Network, establecemos un paradigma donde la privacidad programable es el estado por defecto. Mantienes un control absoluto sobre tu red de transacciones, tus saldos y tu historial de interacción.",
      "Nuestra infraestructura utiliza Noir, el lenguaje universal de Zero-Knowledge, para crear interacciones de contratos inteligentes completamente privadas. Esto asegura que tus estados financieros sean verificados criptográficamente por la red sin exponer jamás los datos subyacentes a observadores públicos."
    ]
  },
  {
    title: "Pruebas de Validación del Lado del Cliente (Client-Side Proving)",
    paragraphs: [
      "La verdadera descentralización requiere eliminar la confianza en intermediarios. Enviar datos en bruto a un servidor central viola inherentemente la privacidad. Nosotros imponemos un modelo de 'Client-Side Proving' donde todas las pruebas de Conocimiento Cero se generan localmente en tu propio dispositivo.",
      "Cuando ejecutas una transacción o consultas un estado sensible, las operaciones matemáticas ocurren dentro de tu entorno local de ejecución. Solamente la prueba matemática verificada y los compromisos de estado se transmiten a la red principal. La blockchain valida las matemáticas sin obtener jamás visibilidad sobre tus datos de entrada.",
      "Esta arquitectura cuántica garantiza que ni nuestros servidores, ni los secuenciadores, ni ningún tercero puedan interceptar o reconstruir tu actividad. Tus datos nunca abandonan tu dispositivo físico."
    ]
  },
  {
    title: "Arquitectura de Estado Encriptado",
    paragraphs: [
      "A diferencia de las redes EVM tradicionales donde toda la información es de dominio público, nuestro protocolo utiliza el modelo de estado híbrido de Aztec. Combinamos variables públicas con notas de estado privado totalmente encriptadas. El estado privado se representa como un árbol inmutable de UTXOs (Unspent Transaction Outputs).",
      "Cuando recibes activos o configuras una estrategia en nuestros contratos inteligentes, los cambios resultantes se registran como compromisos encriptados en la cadena de bloques. Únicamente tú posees las llaves criptográficas (Viewing Keys) necesarias para desencriptar y acceder a esta información.",
      "Este mecanismo asegura que el balance de tu portafolio y tu historial permanezcan matemáticamente invisibles para el mercado, sin dejar de ser completamente componibles y funcionales."
    ]
  },
  {
    title: "Secuenciadores Descentralizados",
    paragraphs: [
      "Una red de privacidad es tan segura como su capa de secuenciación. Depender de un secuenciador central crea un punto de fallo único y graves riesgos de censura. Nuestra integración está totalmente alineada con la visión de Aztec de establecer una red verdaderamente descentralizada de provers y secuenciadores.",
      "Al participar en esta infraestructura, garantizamos que ninguna entidad aislada, gobierno o corporación pueda censurar tus transacciones, reordenar tus ejecuciones para extracción de valor (MEV), o denegarte el acceso a la verdad del mercado."
    ]
  },
  {
    title: "Cumplimiento y Revelación Selectiva",
    paragraphs: [
      "La privacidad no significa operar en la opacidad regulatoria; significa tener el derecho soberano de decidir cuándo y con quién compartes tus datos. Nuestra plataforma permite la revelación selectiva de información mediante pruebas criptográficas de cumplimiento.",
      "Si en algún momento requieres demostrar el origen de tus fondos, verificar tu identidad ante una institución, o demostrar solvencia a un auditor, puedes generar pruebas matemáticas específicas que validan esos hechos sin exponer la totalidad de tu historial de transacciones.",
      "Esta capacidad dual (privacidad absoluta combinada con revelación programable) proporciona la infraestructura definitiva para la adopción institucional en Web3, protegiendo ferozmente tu libertad financiera."
    ]
  }
];

export default function PrivacyPage() {
  return (
    <DownpageLayout 
      pageTitle="Políticas de Privacidad ZK"
      subtitle="La fundación para la privacidad programable utilizando la infraestructura criptográfica de Aztec Network y pruebas Zero-Knowledge."
      indexTitle="Privacidad Criptográfica"
      sections={sections}
    />
  );
}
