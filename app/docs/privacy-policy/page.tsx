import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-transparent text-[#050505] selection:bg-black selection:text-white font-sans">
      <div className="max-w-3xl mx-auto px-6 pt-16 pb-24">
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#888888] hover:text-[#050505] transition-colors mb-16">
          <ArrowLeft size={14} /> Volver a la Plataforma
        </Link>

        <header className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-black text-white rounded-xl">
              <Lock size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#888888]">Marco Legal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-6">
            Política de <span className="text-[#888888]">Privacidad</span>
          </h1>
          <p className="text-sm font-bold uppercase tracking-widest text-[#888888]">
            Versión 2.0 — Última actualización: Mayo 2026
          </p>
          <p className="text-sm text-[#888888] mt-2">
            Conforme al Reglamento (UE) 2016/679 (RGPD), la Ley Orgánica 3/2018 (LOPDGDD) y la
            Ley 34/2002 (LSSICE). Responsable: atfortyseven-creations, Reino de España.
          </p>
        </header>

        <div className="space-y-16 text-sm leading-relaxed text-[#555555]">

          <section>
            <h2 className="text-xl font-black uppercase tracking-tight text-[#050505] mb-4">
              1. Responsable del Tratamiento
            </h2>
            <p className="mb-4">
              El responsable del tratamiento de los datos personales recabados a través de Whale Alert
              Network (humanidfi.com) es <strong>atfortyseven-creations</strong>, con domicilio en el
              Reino de España.
            </p>
            <p>
              Para ejercer los derechos reconocidos en el RGPD o para cualquier consulta relacionada
              con el tratamiento de datos, el usuario puede dirigirse a través de los canales de soporte
              habilitados en la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-tight text-[#050505] mb-4">
              2. Datos que Recabamos y Base Legal
            </h2>

            <h3 className="font-black text-[#050505] mb-3 mt-6">2.1 Dirección de Wallet Ethereum</h3>
            <p className="mb-2"><strong>Dato:</strong> Dirección pública del wallet Ethereum (ej: <code>0xd8dA6BF2...</code>).</p>
            <p className="mb-2"><strong>Origen:</strong> Proporcionada por el usuario durante el proceso de autenticación SIWE.</p>
            <p className="mb-2"><strong>Propósito:</strong> Identificación única del usuario, control de acceso por tier, historial de sesiones.</p>
            <p className="mb-4"><strong>Base legal:</strong> Ejecución de contrato — art. 6.1.b RGPD.</p>

            <h3 className="font-black text-[#050505] mb-3 mt-6">2.2 Dirección de Correo Electrónico</h3>
            <p className="mb-2"><strong>Dato:</strong> Email del usuario (opcional, solo si se facilita voluntariamente).</p>
            <p className="mb-2"><strong>Origen:</strong> Formulario de registro o sección de perfil.</p>
            <p className="mb-2"><strong>Propósito:</strong> Notificaciones de suscripción, alertas de seguridad, soporte técnico. Gestionado mediante <strong>Resend</strong> (resend.com).</p>
            <p className="mb-4"><strong>Base legal:</strong> Consentimiento — art. 6.1.a RGPD.</p>

            <h3 className="font-black text-[#050505] mb-3 mt-6">2.3 Datos de Sesión y Autenticación</h3>
            <p className="mb-2"><strong>Dato:</strong> Token JWT de sesión (<code>human_session</code>), cookie de dirección (<code>sovereign_handshake</code>), nonce SIWE.</p>
            <p className="mb-2"><strong>Origen:</strong> Generados automáticamente durante la autenticación.</p>
            <p className="mb-2"><strong>Propósito:</strong> Mantenimiento de la sesión autenticada, prevención de ataques de replay.</p>
            <p className="mb-4"><strong>Base legal:</strong> Interés legítimo (seguridad del sistema) — art. 6.1.f RGPD.</p>

            <h3 className="font-black text-[#050505] mb-3 mt-6">2.4 Datos de Pago</h3>
            <p className="mb-2"><strong>Dato fiat:</strong> Stripe procesa los datos de tarjeta directamente. Whale Alert Network solo recibe un identificador de suscripción (<code>sub_xxx</code>) y el estado del pago. <strong>No almacenamos datos de tarjeta.</strong></p>
            <p className="mb-4"><strong>Dato crypto:</strong> Hash de transacción y dirección de origen para pagos TRC-20 USDT. Son datos públicos en la blockchain Tron.</p>

            <h3 className="font-black text-[#050505] mb-3 mt-6">2.5 Datos de Verificación KYC</h3>
            <p className="mb-2"><strong>Dato:</strong> Documentos de identidad y datos biométricos procesados por <strong>Sumsub</strong> (sumsub.com) exclusivamente para usuarios que acceden a funciones que requieren KYC (ruta <code>/trade</code>).</p>
            <p className="mb-4"><strong>Base legal:</strong> Obligación legal (prevención de blanqueo de capitales, Directiva AML5) — art. 6.1.c RGPD.</p>

            <h3 className="font-black text-[#050505] mb-3 mt-6">2.6 Datos de Uso y Logs</h3>
            <p className="mb-2"><strong>Dato:</strong> IP de origen (para rate limiting y seguridad), ruta solicitada, timestamp, resultado de validación WAF.</p>
            <p className="mb-2"><strong>Propósito:</strong> Seguridad, detección de abuso, cumplimiento legal. Almacenados en Redis con TTL de 24 horas para rate limiting y en logs de Railway/infraestructura por el período mínimo exigido por ley.</p>
            <p className="mb-4"><strong>Base legal:</strong> Interés legítimo (seguridad) — art. 6.1.f RGPD.</p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-tight text-[#050505] mb-4">
              3. Encargados del Tratamiento (Subprocesadores)
            </h2>
            <p className="mb-4">
              Whale Alert Network utiliza los siguientes proveedores de servicios como encargados del
              tratamiento según el art. 28 RGPD. Todos han suscrito acuerdos de tratamiento de datos
              conformes al RGPD:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px] border-collapse">
                <thead>
                  <tr className="border-b border-black/10">
                    <th className="text-left py-2 pr-4 font-black uppercase tracking-widest text-[#050505] text-[10px]">Proveedor</th>
                    <th className="text-left py-2 pr-4 font-black uppercase tracking-widest text-[#050505] text-[10px]">Servicio</th>
                    <th className="text-left py-2 pr-4 font-black uppercase tracking-widest text-[#050505] text-[10px]">País</th>
                    <th className="text-left py-2 font-black uppercase tracking-widest text-[#050505] text-[10px]">Datos transferidos</th>
                  </tr>
                </thead>
                <tbody className="text-[#555555]">
                  {[
                    ['Railway', 'Hosting PostgreSQL + aplicación', 'EEUU (SCCs)', 'DB con wallet, email, suscripción'],
                    ['Upstash', 'Redis serverless', 'EEUU (SCCs)', 'IP, nonces, caché de sesión'],
                    ['Alchemy', 'Proveedor RPC blockchain', 'EEUU (SCCs)', 'Consultas on-chain sin datos personales'],
                    ['Stripe', 'Procesamiento de pagos', 'Irlanda (UE)', 'Identificador de suscripción, email'],
                    ['Sumsub', 'Verificación KYC/AML', 'Chipre (UE)', 'Documentos de identidad, biometría'],
                    ['Resend', 'Email transaccional', 'EEUU (SCCs)', 'Dirección email, contenido del mensaje'],
                    ['Neo4j AuraDB', 'Base de datos de grafo', 'UE (configurable)', 'Direcciones de wallet (datos públicos)'],
                  ].map(([prov, svc, country, data], i) => (
                    <tr key={i} className="border-b border-black/5">
                      <td className="py-3 pr-4 font-black text-[#050505]">{prov}</td>
                      <td className="py-3 pr-4">{svc}</td>
                      <td className="py-3 pr-4">{country}</td>
                      <td className="py-3">{data}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-[11px] text-[#888888]">
              SCCs: Cláusulas Contractuales Estándar aprobadas por la Comisión Europea para transferencias
              internacionales de datos conforme al art. 46.2.c RGPD.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-tight text-[#050505] mb-4">
              4. Plazos de Conservación
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px] border-collapse">
                <thead>
                  <tr className="border-b border-black/10">
                    <th className="text-left py-2 pr-4 font-black uppercase tracking-widest text-[#050505] text-[10px]">Tipo de dato</th>
                    <th className="text-left py-2 font-black uppercase tracking-widest text-[#050505] text-[10px]">Plazo de conservación</th>
                  </tr>
                </thead>
                <tbody className="text-[#555555]">
                  {[
                    ['Datos de cuenta (wallet, email, tier)', 'Mientras dure la relación contractual + 5 años (prescripción civil)'],
                    ['Datos de pago (referencia Stripe)', 'Mientras dure la suscripción + 5 años (obligación fiscal)'],
                    ['Logs de acceso (IP, timestamp)', '90 días (Rate limiting: 24h en Redis)'],
                    ['Datos KYC (Sumsub)', '5 años desde la última operación (Directiva AML5, art. 40)'],
                    ['Tokens de sesión JWT', '7 días (expiran automáticamente)'],
                    ['Datos de chat XMTP', 'Almacenados en la red XMTP descentralizada; Whale Alert Network no tiene acceso al contenido cifrado'],
                  ].map(([tipo, plazo], i) => (
                    <tr key={i} className="border-b border-black/5">
                      <td className="py-3 pr-4 font-medium">{tipo}</td>
                      <td className="py-3">{plazo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-tight text-[#050505] mb-4">
              5. Derechos del Interesado
            </h2>
            <p className="mb-4">
              Conforme a los artículos 15 a 22 del RGPD y los artículos 13 a 18 de la LOPDGDD,
              el usuario tiene derecho a:
            </p>
            <ul className="list-none pl-5 space-y-2 mb-4">
              {[
                'Acceso: conocer qué datos personales tratamos sobre usted',
                'Rectificación: corregir datos inexactos o incompletos',
                'Supresión ("derecho al olvido"): solicitar la eliminación de sus datos cuando ya no sean necesarios',
                'Oposición: oponerse al tratamiento basado en interés legítimo',
                'Limitación: solicitar la suspensión temporal del tratamiento',
                'Portabilidad: recibir sus datos en formato estructurado y de uso común',
                'No ser objeto de decisiones automatizadas: impugnar decisiones basadas exclusivamente en tratamiento automatizado',
              ].map((right, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-black/20 shrink-0 mt-2" />
                  <strong>{right.split(':')[0]}:</strong>{right.split(':')[1]}
                </li>
              ))}
            </ul>
            <p>
              Para ejercer cualquiera de estos derechos, contacte a través del canal de Soporte de la
              plataforma. Responderemos en el plazo de un mes desde la recepción de la solicitud,
              prorrogable dos meses adicionales en casos de especial complejidad (art. 12.3 RGPD).
            </p>
            <p className="mt-4">
              Si considera que el tratamiento de sus datos no se ajusta a la normativa vigente, tiene
              derecho a presentar una reclamación ante la{' '}
              <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="underline opacity-70 hover:opacity-100">
                Agencia Española de Protección de Datos (AEPD)
              </a>{' '}
              (www.aepd.es).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-tight text-[#050505] mb-4">
              6. Datos Públicos de Blockchain
            </h2>
            <p>
              Las direcciones de wallet y transacciones on-chain que la plataforma muestra son datos
              <strong> públicos por naturaleza</strong>, disponibles en cualquier explorador de bloques.
              Whale Alert Network agrega y analiza estos datos públicos para proporcionar inteligencia
              de mercado. El Considerando 26 del RGPD indica que los datos verdaderamente anónimos o
              datos sobre personas jurídicas no entran en el ámbito de aplicación del Reglamento.
              Sin embargo, cuando una dirección de wallet sea atribuible a una persona física identificada,
              se tratará como dato personal a todos los efectos del RGPD.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-tight text-[#050505] mb-4">
              7. Cookies y Almacenamiento Local
            </h2>
            <p className="mb-4">La plataforma utiliza las siguientes cookies:</p>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px] border-collapse">
                <thead>
                  <tr className="border-b border-black/10">
                    <th className="text-left py-2 pr-4 font-black uppercase tracking-widest text-[#050505] text-[10px]">Cookie</th>
                    <th className="text-left py-2 pr-4 font-black uppercase tracking-widest text-[#050505] text-[10px]">Tipo</th>
                    <th className="text-left py-2 pr-4 font-black uppercase tracking-widest text-[#050505] text-[10px]">TTL</th>
                    <th className="text-left py-2 font-black uppercase tracking-widest text-[#050505] text-[10px]">Propósito</th>
                  </tr>
                </thead>
                <tbody className="text-[#555555]">
                  {[
                    ['human_session', 'Necesaria (HttpOnly, Secure)', '7 días', 'JWT de sesión SIWE autenticada'],
                    ['sovereign_handshake', 'Necesaria', 'Sesión', 'Dirección del wallet para UX sin fricción'],
                    ['kyc_token', 'Necesaria (HttpOnly)', '30 días', 'Estado de verificación KYC'],
                    ['__stripe_mid', 'Analítica Stripe', '1 año', 'Detección de fraude en pagos (Stripe)'],
                    ['__stripe_sid', 'Analítica Stripe', '30 min', 'Sesión Stripe para checkout'],
                  ].map(([name, type, ttl, purpose], i) => (
                    <tr key={i} className="border-b border-black/5">
                      <td className="py-3 pr-4 font-mono text-[11px]">{name}</td>
                      <td className="py-3 pr-4">{type}</td>
                      <td className="py-3 pr-4">{ttl}</td>
                      <td className="py-3">{purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-tight text-[#050505] mb-4">
              8. Modificaciones de la Política
            </h2>
            <p>
              Esta Política de Privacidad puede ser actualizada para reflejar cambios en la legislación
              aplicable o en los servicios ofrecidos. Los cambios materiales serán comunicados con
              al menos 30 días de antelación mediante aviso en la plataforma y, cuando sea posible,
              por email. La versión vigente siempre estará disponible en esta URL.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
