"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Key, RefreshCcw, LogOut } from 'lucide-react';

export default function PlatformAuthPage() {
  const [copied, setCopied] = React.useState<number | null>(null);

  const copy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="doc-content">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-25 mb-8">Platform / Authentication</p>
      <h1>SIWE Authentication (EIP-4361)</h1>

      <p>
        Whale Alert Network ha eliminado por completo el uso de contraseñas y registros tradicionales.
        En su lugar, implementamos <strong>Sign-In With Ethereum (SIWE)</strong> según el estándar
        EIP-4361. Este método proporciona seguridad de nivel criptográfico, asegurando que solo
        el poseedor de la clave privada de un wallet puede autenticarse.
      </p>

      <h2>¿Por qué SIWE?</h2>
      <ul className="list-none pl-0 space-y-3 my-6">
        {[
          { title: 'Zero-Knowledge de Claves', desc: 'El servidor nunca ve ni almacena contraseñas. Solo verifica firmas ECDSA matemáticas.' },
          { title: 'Anti-Phishing', desc: 'El mensaje SIWE vincula la firma al dominio exacto (URI) previniendo ataques de intermediario.' },
          { title: 'UX Sin Fricción', desc: 'Los usuarios de Web3 pueden autenticarse en 2 clics sin tener que recordar credenciales.' }
        ].map((item, i) => (
          <li key={i} className="flex items-start gap-3 p-4 border border-black/8 dark:border-white/8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00C076] shrink-0 mt-2" />
            <div>
              <strong className="block text-[13px] uppercase tracking-wide mb-1">{item.title}</strong>
              <span className="text-[12px] opacity-70 leading-relaxed">{item.desc}</span>
            </div>
          </li>
        ))}
      </ul>

      <h2>El Flujo de Autenticación</h2>

      <div className="space-y-8 my-8">
        {[
          {
            icon: RefreshCcw,
            title: '1. Solicitud de Nonce',
            desc: 'El cliente solicita un nonce (número arbitrario de un solo uso) al servidor para prevenir ataques de replay.',
            code: `const res = await fetch('/api/auth/nonce');
const { nonce } = await res.json();`
          },
          {
            icon: ShieldCheck,
            title: '2. Firma del Mensaje',
            desc: 'El cliente construye el mensaje SIWE y pide al usuario que lo firme usando wagmi.',
            code: `import { SiweMessage } from 'siwe';

const message = new SiweMessage({
  domain: window.location.host,
  address: walletAddress,
  statement: 'Sign in to Sovereign Whale Terminal.',
  uri: window.location.origin,
  version: '1',
  chainId: 1,
  nonce,
});

const signature = await signMessageAsync({ message: message.prepareMessage() });`
          },
          {
            icon: Key,
            title: '3. Verificación y JWT',
            desc: 'El servidor verifica matemáticamente la firma contra la dirección del wallet. Si es válida, emite un JWT encriptado en una cookie HttpOnly.',
            code: `const verifyRes = await fetch('/api/auth/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message, signature }),
});

// El middleware intercepta futuras peticiones usando la cookie 'human_session'`
          },
          {
            icon: LogOut,
            title: '4. Cierre de Sesión',
            desc: 'El cierre de sesión invalida las cookies en el cliente y en el servidor.',
            code: `await fetch('/api/auth/signout', { method: 'POST' });`
          }
        ].map((step, i) => (
          <div key={i}>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-black/5 dark:bg-white/5 rounded">
                <step.icon size={16} />
              </div>
              <h3 className="m-0 text-sm font-black uppercase tracking-wide">{step.title}</h3>
            </div>
            <p className="text-[13px] opacity-70 mb-3">{step.desc}</p>
            <div className="relative group">
              <pre>{step.code}</pre>
              <button
                onClick={() => copy(step.code, i)}
                className="absolute top-3 right-3 p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 transition-all"
              >
                {copied === i ? <Check size={13} className="text-[#00C076]" /> : <Copy size={13} />}
              </button>
            </div>
          </div>
        ))}
      </div>

      <h2>Gestión de Sesiones (Cookies)</h2>
      <p>El sistema utiliza dos cookies principales gestionadas por el middleware Edge:</p>
      <table>
        <thead>
          <tr><th>Cookie</th><th>Propósito</th><th>Atributos</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><code>human_session</code></td>
            <td>Contiene el JWT firmado con el perfil del usuario (address, tier, roles).</td>
            <td>HttpOnly, Secure, SameSite=Lax, TTL: 7 días</td>
          </tr>
          <tr>
            <td><code>sovereign_handshake</code></td>
            <td>Identificador de UX para el cliente (contiene la dirección raw).</td>
            <td>Secure, SameSite=Lax, TTL: Sesión</td>
          </tr>
        </tbody>
      </table>

      <h2>Seguridad del Middleware (The Iron Gate)</h2>
      <p>
        El archivo <code>middleware.ts</code> protege todas las rutas bajo <code>/api</code> y <code>/dashboard</code>.
        Implementa una filosofía <strong>Fail-Closed</strong>:
      </p>
      <ul>
        <li>Si la firma del JWT es inválida o ha expirado, rechaza inmediatamente con HTTP 401.</li>
        <li>Inyecta headers de seguridad: <code>Strict-Transport-Security</code>, <code>X-Content-Type-Options</code>, y un CSP estricto.</li>
        <li>Aplica rate limiting antes de que la petición alcance la lógica de negocio.</li>
      </ul>

      <h2>Siguientes Pasos</h2>
      <div className="flex flex-col gap-2 mt-8">
        {[
          { label: 'Integrar autenticación en el cliente (Quickstart)', href: '/docs/quickstart' },
          { label: 'Referencia del API REST', href: '/docs/developer/overview' },
          { label: 'Arquitectura de Plataforma', href: '/docs/platform/architecture' },
        ].map((lnk, i) => (
          <Link key={i} href={lnk.href}
            className="flex items-center gap-2 font-mono text-[12px] opacity-40 hover:opacity-100 hover:text-[#00C076] transition-all group py-1">
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            {lnk.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

// Dummy check icon missing from import above to prevent typescript error if not defined
function Check(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
}
function Copy(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>;
}
