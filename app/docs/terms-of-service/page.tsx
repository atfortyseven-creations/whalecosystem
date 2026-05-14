import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-transparent text-[#050505] selection:bg-black selection:text-white font-sans">
      <div className="max-w-3xl mx-auto px-6 pt-16 pb-24">
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#888888] hover:text-[#050505] transition-colors mb-16">
          <ArrowLeft size={14} /> Volver a la Plataforma
        </Link>

        <header className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-black text-white rounded-xl">
              <BookOpen size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#888888]">Marco Legal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-6">
            Términos de <span className="text-[#888888]">Servicio</span>
          </h1>
          <p className="text-sm font-bold uppercase tracking-widest text-[#888888]">
            Versión 2.0 — Última actualización: Mayo 2026
          </p>
          <p className="text-sm text-[#888888] mt-2">
            Jurisdicción: Reino de España — Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la
            Información y de Comercio Electrónico (LSSICE) y Ley Orgánica 3/2018, de 5 de diciembre,
            de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD).
          </p>
        </header>

        <div className="space-y-16 text-sm leading-relaxed text-[#555555]">

          <section>
            <h2 className="text-xl font-black uppercase tracking-tight text-[#050505] mb-4">
              1. Identificación del Titular
            </h2>
            <p className="mb-4">
              Whale Alert Network es una plataforma de tecnología financiera operada por{' '}
              <strong>atfortyseven-creations</strong>, con domicilio en el Reino de España.
              La plataforma es accesible en <strong>humanidfi.com</strong> y sus subdominios asociados.
            </p>
            <p>
              Para consultas relacionadas con estos Términos de Servicio, los usuarios pueden contactar
              mediante los canales habilitados en la sección de Soporte de la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-tight text-[#050505] mb-4">
              2. Objeto del Servicio y Naturaleza de la Plataforma
            </h2>
            <p className="mb-4">
              Whale Alert Network es una <strong>plataforma de observabilidad on-chain</strong> que proporciona
              acceso en tiempo real a datos procedentes de redes blockchain públicas. La plataforma agrega,
              analiza y visualiza información de transacciones on-chain, flujos de capital institucional,
              datos de protocolos de finanzas descentralizadas (DeFi), y mercados de predicción.
            </p>
            <p className="mb-4">
              El servicio incluye, con carácter no exhaustivo, las siguientes funcionalidades:
            </p>
            <ul className="list-none pl-5 space-y-2 mb-4">
              {[
                'Monitorización de transacciones de alto valor en múltiples redes blockchain (Ethereum, Base, Polygon, Arbitrum, Optimism, Binance Smart Chain, entre otras)',
                'Análisis de grafo de relaciones entre wallets mediante la base de datos Neo4j',
                'Detección de anomalías mediante algoritmos estadísticos (Z-Score sobre ventana deslizante de 14 bloques)',
                'Visualización de datos de protocolos DeFi (tasas de interés, TVL)',
                'Mensajería cifrada punto a punto entre wallets mediante el protocolo XMTP',
                'Acceso a mercados de predicción (datos de Polymarket)',
                'Sistema de acceso por niveles (FREE, STANDARD, PRO, ELITE) gestionado mediante suscripciones',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-black/20 shrink-0 mt-2" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-tight text-[#050505] mb-4">
              3. Condiciones de Acceso y Autenticación
            </h2>
            <p className="mb-4">
              El acceso a la plataforma requiere la autenticación mediante <strong>Sign-In With Ethereum
              (EIP-4361 SIWE)</strong>, un estándar criptográfico que utiliza la clave privada del wallet
              del usuario para firmar un mensaje de identidad. Este proceso no implica la custodia,
              almacenamiento ni transmisión de claves privadas a los servidores de Whale Alert Network.
            </p>
            <p className="mb-4">
              Al completar el proceso de autenticación, el usuario:
            </p>
            <ul className="list-none pl-5 space-y-2 mb-4">
              {[
                'Acepta íntegramente estos Términos de Servicio y la Política de Privacidad',
                'Confirma ser mayor de edad según la legislación de su país de residencia (mínimo 18 años)',
                'Declara que el uso de la plataforma es compatible con la legislación aplicable en su jurisdicción',
                'Reconoce que la plataforma no proporciona servicios de asesoramiento financiero ni de inversión',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-black/20 shrink-0 mt-2" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-tight text-[#050505] mb-4">
              4. Exclusión de Asesoramiento Financiero
            </h2>
            <p className="mb-4">
              La información proporcionada por Whale Alert Network tiene carácter exclusivamente
              <strong> informativo y estadístico</strong>. En ningún caso constituye:
            </p>
            <ul className="list-none pl-5 space-y-2 mb-4">
              {[
                'Asesoramiento de inversión o financiero en el sentido de la Directiva MiFID II (2014/65/UE)',
                'Recomendación de compra, venta o mantenimiento de ningún activo digital o instrumento financiero',
                'Servicio de gestión de cartera o intermediación financiera',
                'Pronóstico o garantía sobre la evolución futura de los precios',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-black/20 shrink-0 mt-2" />
                  {item}
                </li>
              ))}
            </ul>
            <p>
              Las señales estadísticas generadas por el motor de detección (Z-Score) son herramientas
              de análisis cuantitativo. La interpretación y las decisiones de inversión derivadas de
              dicho análisis son responsabilidad exclusiva del usuario. Whale Alert Network no responde
              de pérdidas derivadas de tales decisiones.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-tight text-[#050505] mb-4">
              5. Operaciones DeFi y Contratos Inteligentes
            </h2>
            <p className="mb-4">
              Determinadas funcionalidades de la plataforma permiten la interacción con contratos
              inteligentes desplegados en redes blockchain públicas. Estas operaciones:
            </p>
            <ul className="list-none pl-5 space-y-2 mb-4">
              {[
                'Son peer-to-peer e irreversibles una vez confirmadas en la blockchain',
                'Se ejecutan directamente contra contratos inmutables; Whale Alert Network no actúa como intermediario custodio',
                'Pueden estar sujetas a slippage, front-running, fallos de protocolo o exploits de contratos, cuya responsabilidad recae exclusivamente en el usuario',
                'Requieren la firma explícita del usuario con su wallet; nunca se ejecutan sin consentimiento activo',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-black/20 shrink-0 mt-2" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-tight text-[#050505] mb-4">
              6. Suscripciones y Pagos
            </h2>
            <p className="mb-4">
              La plataforma ofrece niveles de acceso de pago (STANDARD, PRO, ELITE) gestionados
              mediante dos modalidades de pago:
            </p>
            <p className="mb-2"><strong>6.1 Pago en moneda fiat (Stripe):</strong> Las suscripciones
              en EUR o USD se procesan a través de Stripe Payments Europe, Ltd., con sede en Irlanda.
              Los datos de tarjeta son tratados directamente por Stripe bajo el estándar PCI-DSS
              Level 1. Whale Alert Network no almacena datos de tarjeta de pago.
            </p>
            <p className="mb-4"><strong>6.2 Pago en USDT (TRC-20):</strong> La plataforma acepta pagos
              mediante la red Tron en la stablecoin USDT (TRC-20). Los pagos en criptomoneda son
              definitivos e irreversibles. En caso de error en la dirección o el importe, Whale Alert
              Network no puede garantizar la recuperación de fondos.
            </p>
            <p>
              Las suscripciones se renuevan automáticamente al inicio de cada período (mensual o anual)
              hasta su cancelación explícita por el usuario desde el panel de Billing. El derecho de
              desistimiento de 14 días reconocido en el art. 102 del Real Decreto Legislativo 1/2007
              puede no ser aplicable a contenidos digitales de prestación inmediata, conforme al art.
              103.m) del mismo texto legal.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-tight text-[#050505] mb-4">
              7. Restricciones de Uso y Conductas Prohibidas
            </h2>
            <p className="mb-4">Queda expresamente prohibido:</p>
            <ul className="list-none pl-5 space-y-2 mb-4">
              {[
                'El acceso automatizado masivo (scraping, bots) que exceda los límites de rate limiting publicados',
                'Cualquier intento de eludir los sistemas de autenticación, WAF, o controles de acceso',
                'La reventa, sublicencia o cesión del acceso a terceros sin autorización expresa',
                'El uso de la plataforma para actividades de lavado de capitales, financiación del terrorismo o cualquier actividad ilícita conforme a la legislación española y de la UE',
                'La utilización de wallets vinculados a actividades sancionadas por OFAC, la UE o el GAFI',
                'La reproducción, distribución o explotación comercial de los datos agregados de la plataforma sin licencia explícita',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-black/20 shrink-0 mt-2" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-tight text-[#050505] mb-4">
              8. Suspensión y Terminación del Acceso
            </h2>
            <p className="mb-4">
              Whale Alert Network se reserva el derecho a suspender o terminar el acceso de cualquier
              usuario, dirección de wallet o IP que:
            </p>
            <ul className="list-none pl-5 space-y-2 mb-4">
              {[
                'Incurra en conductas prohibidas descritas en la cláusula 7',
                'Supere repetidamente los límites de rate limiting o intente ataques de denegación de servicio',
                'Acceda desde jurisdicciones restringidas con datos falsos o VPN para eludir controles geográficos',
                'Utilice la plataforma en violación de normativa sancionatoria internacional',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-black/20 shrink-0 mt-2" />
                  {item}
                </li>
              ))}
            </ul>
            <p>La suspensión preventiva no conlleva derecho automático a compensación económica.</p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-tight text-[#050505] mb-4">
              9. Propiedad Intelectual
            </h2>
            <p className="mb-4">
              El código fuente, diseño, arquitectura, marca y contenidos originales de Whale Alert Network
              son propiedad de atfortyseven-creations y están protegidos por la legislación de propiedad
              intelectual española (Real Decreto Legislativo 1/1996, de 12 de abril) y por el Convenio de Berna.
            </p>
            <p>
              Los datos on-chain mostrados en la plataforma provienen de redes blockchain públicas y
              no son propiedad de Whale Alert Network. Los algoritmos de análisis y agregación aplicados
              sobre dichos datos sí constituyen creación original protegida.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-tight text-[#050505] mb-4">
              10. Limitación de Responsabilidad
            </h2>
            <p className="mb-4">
              En la máxima extensión permitida por el derecho español, Whale Alert Network no será
              responsable de:
            </p>
            <ul className="list-none pl-5 space-y-2 mb-4">
              {[
                'Pérdidas económicas derivadas de decisiones de inversión basadas en datos de la plataforma',
                'Interrupciones de servicio causadas por fallos de proveedores externos (Alchemy, Railway, Upstash, Stripe)',
                'Pérdidas derivadas de exploits, vulnerabilidades de protocolo o condiciones adversas del mercado',
                'Inexactitudes en datos on-chain originadas en los propios nodos RPC o exploradores de bloques',
                'Pérdidas de fondos criptográficos por error del usuario en operaciones de firma o transferencia',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-black/20 shrink-0 mt-2" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-tight text-[#050505] mb-4">
              11. Ley Aplicable y Jurisdicción
            </h2>
            <p className="mb-4">
              Estos Términos de Servicio se rigen por la legislación del <strong>Reino de España</strong>.
              Las partes se someten a la jurisdicción exclusiva de los Juzgados y Tribunales de España
              para la resolución de cualquier controversia que pudiera surgir en relación con la
              interpretación, cumplimiento o ejecución de los presentes términos.
            </p>
            <p>
              En caso de que el usuario tenga la condición de consumidor según el Real Decreto
              Legislativo 1/2007, podrá acudir a la plataforma europea de resolución de litigios
              en línea (ODR) disponible en{' '}
              <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="underline opacity-70 hover:opacity-100">
                ec.europa.eu/consumers/odr
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-tight text-[#050505] mb-4">
              12. Modificaciones
            </h2>
            <p>
              Whale Alert Network puede modificar estos Términos con un preaviso mínimo de 30 días
              publicado en la plataforma y notificado por email a los usuarios con suscripción activa.
              El uso continuado de la plataforma tras la entrada en vigor de los nuevos términos
              implicará su aceptación. Si el usuario no acepta las modificaciones, podrá cancelar
              su suscripción sin penalización antes de la fecha de entrada en vigor.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
