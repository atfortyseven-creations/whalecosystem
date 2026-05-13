"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Activity, ShieldAlert, Cpu } from 'lucide-react';

export default function OperatorMonitoringPage() {
  return (
    <div className="doc-content">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-25 mb-8">Operator / Monitoring</p>
      <h1>Monitoring & Logs</h1>

      <p>
        Para asegurar la alta disponibilidad de Whale Alert Network, es fundamental establecer
        una estrategia de observabilidad y monitorización. El sistema expone métricas y logs
        estructurados que pueden ser consumidos por herramientas estándar.
      </p>

      <h2>1. Healthcheck Endpoint</h2>
      <p>
        El endpoint <code>/api/health</code> es la principal sonda de disponibilidad. 
        Ignora el middleware WAF y el rate limit, devolviendo siempre el estado de los
        subsistemas internos.
      </p>
      <pre>{`GET https://humanidfi.com/api/health

{
  "status": "ok",
  "timestamp": "2026-05-13T10:00:00.000Z",
  "uptime": 345600,
  "database": "connected",
  "redis": "connected",
  "rpcLatency": 45
}`}</pre>

      <h2>2. Logs Estructurados</h2>
      <p>
        La aplicación emite logs por consola (<code>stdout</code>) utilizando prefijos unificados
        para facilitar su análisis en herramientas como Datadog, ELK o Railway Logs.
      </p>
      <table className="w-full text-left text-sm mb-8">
        <thead>
          <tr className="border-b border-black/10 dark:border-white/10">
            <th className="py-2">Prefijo</th>
            <th className="py-2">Descripción</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-black/5 dark:border-white/5">
            <td className="py-2"><code>[WAF]</code></td>
            <td className="py-2">Bloqueos de seguridad, rate limit excedido, firmas SIWE inválidas.</td>
          </tr>
          <tr className="border-b border-black/5 dark:border-white/5">
            <td className="py-2"><code>[Z-SCORE]</code></td>
            <td className="py-2">Anomalías detectadas (eventos Whale).</td>
          </tr>
          <tr className="border-b border-black/5 dark:border-white/5">
            <td className="py-2"><code>[RPC]</code></td>
            <td className="py-2">Errores de conexión Alchemy/GetBlock, failovers activados.</td>
          </tr>
          <tr>
            <td className="py-2"><code>[DB]</code></td>
            <td className="py-2">Tiempos de consulta Prisma, conexiones excedidas.</td>
          </tr>
        </tbody>
      </table>

      <h2>3. Monitorización en PM2</h2>
      <p>Si operas con PM2 en servidor propio, puedes monitorizar el cluster en tiempo real:</p>
      <pre>{`# Monitor en tiempo real (CPU, RAM, Event Loop)
pm2 monit

# Ver logs de todos los procesos de la aplicación
pm2 logs whale-alert

# Métricas en formato JSON (para Prometheus/Grafana)
pm2 jlist`}</pre>

      <h2>4. Alertas de Seguridad y Rate Limit</h2>
      <p>
        El middleware WAF (The Iron Gate) emite logs críticos cuando detecta tráfico malicioso.
        Si configuras <code>TELEGRAM_BOT_TOKEN</code> y <code>TELEGRAM_CHAT_ID</code>, el sistema
        enviará notificaciones push automáticas cuando ocurra un evento <code>[WAF] SEVERE</code>.
      </p>

      <h2>Siguientes Pasos</h2>
      <div className="flex flex-col gap-2 mt-8">
        <Link href="/docs/operator/overview" className="flex items-center gap-2 font-mono text-[12px] opacity-40 hover:opacity-100 hover:text-[#00C076] transition-all group py-1">
          <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
          Volver a Operator Overview
        </Link>
      </div>
    </div>
  );
}
