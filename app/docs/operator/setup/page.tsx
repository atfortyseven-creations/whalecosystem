"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Server, Database, Zap } from 'lucide-react';

export default function OperatorSetupPage() {
  return (
    <div className="doc-content">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-25 mb-8">Operator / Node Setup</p>
      <h1>Node Setup & Deployment</h1>

      <p>
        Whale Alert Network soporta tres modalidades de despliegue principales. Selecciona
        la que mejor se adapte a tus requisitos de soberanía, escalabilidad y latencia.
      </p>

      <h2>1. Railway (Recomendado para Producción)</h2>
      <p>
        Railway abstrae la gestión de infraestructura y proporciona un entorno de ejecución
        Edge (Next.js) con bases de datos PostgreSQL y Redis integradas en la misma red privada.
      </p>
      <div className="p-4 border border-black/8 dark:border-white/8 mb-6">
        <ol className="space-y-3 m-0 pl-4">
          <li>Crea un nuevo proyecto en <a href="https://railway.app" className="underline">Railway</a>.</li>
          <li>Añade el plugin <strong>PostgreSQL</strong> y el plugin <strong>Redis</strong>.</li>
          <li>Añade un nuevo servicio conectando tu repositorio de GitHub.</li>
          <li>En las variables de entorno del servicio Next.js, copia todas las variables de tu <code>.env.local</code>. Usa la sintaxis de Railway para referenciar las bases de datos (e.g., <code>{`\${{Postgres.DATABASE_URL}}`}</code>).</li>
          <li>El comando de build (<code>npm run build</code>) ejecutará automáticamente <code>prisma generate</code>.</li>
          <li>En la configuración de inicio, asegúrate de que el Start Command sea <code>npm run start:all</code> para lanzar tanto Next.js como Socket.io.</li>
        </ol>
      </div>

      <h2>2. Docker Compose (Infraestructura Soberana)</h2>
      <p>
        Para un control absoluto (paradigma Sovereign Vault), puedes desplegar la plataforma en
        tu propio servidor (bare-metal o VPS). El archivo <code>docker-compose.yml</code> orquesta
        todos los contenedores necesarios.
      </p>
      <pre>{`# 1. Clonar y configurar
git clone https://github.com/atfortyseven-creations/whale-alert-network.git
cd whale-alert-network
cp .env.example .env

# 2. Configurar la base de datos (se hace desde el contenedor web)
# Docker Compose expone el puerto 5432, puedes ejecutar Prisma localmente:
npm install
npx prisma migrate deploy

# 3. Levantar los servicios en segundo plano
docker compose up -d

# 4. Verificar logs
docker compose logs -f next-app`}</pre>
      <p>
        <strong>Nota de Arquitectura:</strong> El <code>docker-compose.yml</code> incluye:
        <code>postgres</code>, <code>redis</code>, <code>next-app</code> (puerto 3000), y
        <code>socket-worker</code> (puerto 3001). Asegúrate de configurar un proxy inverso
        (como Nginx o Traefik) con certificados SSL para enrutar el tráfico HTTP/WSS.
      </p>

      <h2>3. PM2 (Clustering Node.js)</h2>
      <p>
        Para despliegues directos sobre el sistema operativo (Ubuntu/Debian) maximizando el uso de CPU.
      </p>
      <pre>{`# Instalar dependencias globales
npm install -g pm2
npm install

# Construir la aplicación
npm run build
npx prisma migrate deploy

# Iniciar procesos usando el archivo ecosystem.config.json
pm2 start ecosystem.config.json

# Guardar estado para auto-reinicio
pm2 save
pm2 startup`}</pre>

      <h2>Siguientes Pasos</h2>
      <div className="flex flex-col gap-2 mt-8">
        {[
          { label: 'Monitorización y Logs', href: '/docs/operator/monitoring' },
          { label: 'Requisitos Previos', href: '/docs/operator/prerequisites' },
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
