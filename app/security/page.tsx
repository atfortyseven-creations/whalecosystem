"use client";

import { DownpageLayout } from "@/components/ui/DownpageLayout";

const sections = [
  {
    title: "El Paradigma del Hardware Aislado (Air-Gapping)",
    paragraphs: [
      "La seguridad moderna no puede depender únicamente del cifrado de software si el dispositivo anfitrión está comprometido. En Whale Alert Network hemos implementado un modelo de seguridad multi-dispositivo.",
      "Al utilizar tu teléfono móvil para escanear y firmar transacciones de inicio de sesión, conviertes tu smartphone en una bóveda criptográfica aislada. Tu ordenador de sobremesa actúa simplemente como un monitor ciego que recibe pruebas matemáticas ya verificadas, eliminando por completo los vectores de ataque como keyloggers o malware en el PC."
    ]
  },
  {
    title: "Criptografía de Conocimiento Cero (ZK-Proofs)",
    paragraphs: [
      "La seguridad de tus datos no radica en cuán fuerte sea el muro que los protege en nuestros servidores, sino en el hecho de que nosotros jamás recibimos tus datos. Utilizamos el lenguaje Noir y la infraestructura de Aztec Network para generar pruebas matemáticas en el lado del cliente.",
      "Cuando demuestras tu humanidad, validas una transacción o estableces una alerta de mercado, nos envías únicamente la prueba de que el evento es válido, sin transmitir ni un solo byte de la información subyacente que lo causó."
    ]
  },
  {
    title: "Volatilidad Táctica del Entorno (Autodestrucción de Datos)",
    paragraphs: [
      "El 'Humanity Ledger' procesa millones de transacciones por hora para proveerte análisis institucional. Sin embargo, un registro perpetuo es un pasivo de seguridad. Hemos programado el entorno para ser tácticamente volátil.",
      "Toda la caché local y los registros de transacciones sincronizados para tu sesión se purgan matemáticamente cada 11 horas y 55 minutos. Esto garantiza que no quede ningún rastro forense de tus consultas, estrategias o hábitos de análisis en el navegador o en la red."
    ]
  },
  {
    title: "Auditoría Continua y Contratos Inmutables",
    paragraphs: [
      "Todos los contratos inteligentes fundamentales, desde la distribución de tokens QDS hasta el motor de recibos encriptados del CoreLedger, han sido rigurosamente desarrollados para ser inmutables tras su despliegue.",
      "Ninguna llave maestra de administrador puede alterar el funcionamiento del escudo de privacidad. La red es determinista, matemáticamente demostrable y de código abierto para escrutinio independiente."
    ]
  }
];

export default function SecurityPage() {
  return (
    <DownpageLayout 
      pageTitle="Arquitectura de Seguridad"
      subtitle="Defensas criptográficas activas, validación ZK y aislamiento de hardware. Construido para resistir cualquier amenaza."
      indexTitle="Escudo ZK"
      sections={sections}
    />
  );
}
