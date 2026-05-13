"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function PrerequisitesPage() {
  return (
    <div className="doc-content">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-25 mb-8">Operator / Requisitos Previos</p>
      <h1>Requisitos Previos</h1>
      <p>
        Esta guía cubre todos los requisitos de hardware, software y configuración necesarios
        para desplegar Whale Alert Network en cualquier entorno, desde desarrollo local hasta
        infraestructura de producción.
      </p>

      <h2>1. Node.js y npm</h2>
      <p>La aplicación requiere <strong>Node.js ≥ 20.0.0</strong> (LTS recomendado). Node 18 no es compatible con algunas dependencias de React 19.</p>
      <pre>{`# Verificar versión instalada
node --version   # Debe ser v20.x.x o superior
npm --version    # Debe ser 10.x.x o superior

# Instalar con nvm (recomendado para gestionar versiones)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
nvm install 20
nvm use 20`}</pre>

      <h2>2. Docker y Docker Compose</h2>
      <p>Necesario si usas el despliegue basado en contenedores. El archivo <code>docker-compose.yml</code> en la raíz del proyecto define todos los servicios.</p>
      <pre>{`# Ubuntu 22.04 / Debian 12
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Añadir usuario al grupo docker (sin sudo)
sudo usermod -aG docker $USER
newgrp docker

# Verificar
docker run hello-world
docker compose version   # Debe ser v2.x`}</pre>

      <h2>3. PostgreSQL</h2>
      <p>
        Base de datos relacional principal gestionada con Prisma 6. En producción, Railway provee
        una instancia PostgreSQL gestionada. En desarrollo local:
      </p>
      <pre>{`# Docker (recomendado para desarrollo local)
docker run -d \
  --name whale-postgres \
  -e POSTGRES_DB=whale_alert \
  -e POSTGRES_USER=whale \
  -e POSTGRES_PASSWORD=supersecure \
  -p 5432:5432 \
  postgres:16-alpine

# URL de conexión resultante:
# DATABASE_URL="postgresql://[REDACTED_DB_USER]:[REDACTED_DB_PASS]@localhost:5432/whale_alert"

# Inicializar el esquema
npx prisma migrate deploy    # Producción
npx prisma db push           # Desarrollo (aplica el schema sin migración)`}</pre>

      <h2>4. Redis</h2>
      <p>
        Utilizado para PubSub (Socket.io), caché de sesiones, y rate limiting. En producción,
        se usa <strong>Upstash Redis</strong> (serverless, compatible con Edge Runtime).
        En desarrollo local, una instancia Redis estándar:
      </p>
      <pre>{`# Docker (desarrollo local)
docker run -d \
  --name whale-redis \
  -p 6379:6379 \
  redis:7-alpine

# Verificar
redis-cli ping   # Debe responder PONG

# Variables requeridas (configurar en .env.local)
REDIS_URL="redis://localhost:6379"
UPSTASH_REDIS_REST_URL="https://xxxx.upstash.io"   # Para Edge Runtime
UPSTASH_REDIS_REST_TOKEN="AXxx..."                  # Para Edge Runtime`}</pre>

      <h2>5. Neo4j (Opcional)</h2>
      <p>
        Requerido solo si activas las funciones de análisis de grafo (rastreo de capital entre wallets,
        clustering de entidades). Si no configuras Neo4j, estas funciones devuelven arrays vacíos
        sin romper el resto de la aplicación.
      </p>
      <pre>{`# Docker
docker run -d \
  --name whale-neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/tu_password \
  -e NEO4J_PLUGINS='["apoc"]' \
  neo4j:5.18-community

# Variables
NEO4J_URI="bolt://localhost:7687"
NEO4J_USERNAME="neo4j"
NEO4J_PASSWORD="tu_password"`}</pre>

      <h2>6. Variables de Entorno</h2>
      <p>
        Copia el archivo <code>.env.example</code> como <code>.env.local</code> para desarrollo.
        En Railway, configura las variables en el panel "Variables" del proyecto.
      </p>
      <pre>{`cp .env.example .env.local
# Editar .env.local con tus valores reales`}</pre>

      <div className="callout my-6">
        <p>
          <strong>Seguridad:</strong> Las variables con datos sensibles (<code>JWT_SECRET</code>,{' '}
          <code>DATABASE_URL</code>, <code>ALCHEMY_API_KEY</code>, <code>STRIPE_SECRET_KEY</code>)
          nunca deben commitearse al repositorio ni incluir el prefijo <code>NEXT_PUBLIC_</code>.
          Genera los secretos JWT con: <code>openssl rand -hex 64</code>
        </p>
      </div>

      <h2>7. Claves de API Externas Requeridas</h2>
      <table>
        <thead><tr><th>Servicio</th><th>Variable de Entorno</th><th>Obtención</th><th>Gratuito</th></tr></thead>
        <tbody>
          {[
            ['Alchemy (RPC)', 'ALCHEMY_API_KEY', 'dashboard.alchemy.com', 'Sí (300M compute units/mes)'],
            ['Reown (WalletConnect)', 'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID', 'cloud.reown.com', 'Sí'],
            ['Upstash Redis', 'UPSTASH_REDIS_REST_URL + TOKEN', 'upstash.com', 'Sí (10K req/día)'],
            ['Resend (Email)', 'RESEND_API_KEY', 'resend.com', 'Sí (100 emails/día)'],
            ['Stripe (Pagos)', 'STRIPE_SECRET_KEY', 'dashboard.stripe.com', 'No (comisión por transacción)'],
            ['Sumsub (KYC)', 'SUMSUB_APP_TOKEN', 'sumsub.com', 'No'],
            ['GetBlock (RPC fallback)', 'GETBLOCK_API_KEY', 'getblock.io', 'Sí (40K req/día)'],
          ].map(([svc, env, url, free], i) => (
            <tr key={i}>
              <td><strong>{svc}</strong></td>
              <td><code>{env}</code></td>
              <td><a href={`https://${url}`} target="_blank" rel="noopener noreferrer" className="underline opacity-70 hover:opacity-100">{url}</a></td>
              <td>{free}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>8. Inicializar el Proyecto</h2>
      <pre>{`# 1. Clonar el repositorio
git clone https://github.com/atfortyseven-creations/whale-alert-network.git
cd whale-alert-network

# 2. Instalar dependencias
npm install

# 3. Configurar entorno
cp .env.example .env.local
# Editar .env.local con tus claves

# 4. Generar cliente Prisma
npx prisma generate

# 5. Aplicar esquema de base de datos
npx prisma db push        # Desarrollo
# o
npx prisma migrate deploy  # Producción

# 6. Iniciar en modo desarrollo
npm run dev               # Solo Next.js (puerto 3000)
# o
npm run start:all         # Next.js + Socket.io concurrentemente`}</pre>

      <h2>9. Verificación de Salud</h2>
      <pre>{`# Comprobar que la aplicación está operativa
curl http://localhost:3000/api/health
# Respuesta esperada: { "status": "ok", "timestamp": "..." }

# Comprobar que Prisma conecta con PostgreSQL
npx prisma db pull

# Comprobar Redis
redis-cli -u $REDIS_URL ping`}</pre>

      <h2>Siguientes Pasos</h2>
      <div className="flex flex-col gap-2">
        {[
          { label: 'Monitorización y logs en producción', href: '/docs/operator/monitoring' },
          { label: 'Referencia de API para desarrolladores', href: '/docs/developer/overview' },
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
