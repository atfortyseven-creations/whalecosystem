"use client";

import React from 'react';

export default function APICompendiumPage() {
  return (
    <div className="doc-content">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-25 mb-8">Developer / API Compendium</p>
      <h1>API Compendium</h1>

      <p>
        Referencia exhaustiva de los endpoints REST de Whale Alert Network. Todas las peticiones
        deben incluir la cookie <code>human_session</code>. Los datos se devuelven en formato JSON
        con la estructura estándar: <code>{`{ success: boolean, data: any, timestamp: number }`}</code>.
      </p>

      <h2>1. Inteligencia On-Chain (Whales)</h2>

      <div className="endpoint-block mb-8">
        <h3><code>GET /api/whale/alerts</code></h3>
        <p>Obtiene las alertas más recientes generadas por el motor Z-Score.</p>
        <h4>Parámetros Query:</h4>
        <ul>
          <li><code>chain</code> (opcional): Filtra por red (e.g., <code>ethereum</code>, <code>base</code>, <code>solana</code>).</li>
          <li><code>minUsd</code> (opcional): Valor mínimo en dólares (default: 500000).</li>
          <li><code>tier</code> (opcional): Filtra por anomalía (<code>PROBE</code>, <code>HIGH_CONVICTION</code>, <code>MEGA_EVENT</code>).</li>
          <li><code>limit</code> (opcional): Máximo de resultados (default: 50, max: 200).</li>
        </ul>
        <h4>Respuesta de ejemplo (200 OK):</h4>
        <pre>{`{
  "success": true,
  "data": [
    {
      "hash": "0x123...abc",
      "chain": "ethereum",
      "from": "0xSource...",
      "to": "0xDest...",
      "valueUsd": 2500000,
      "token": "USDC",
      "zScore": 3.4,
      "tier": "HIGH_CONVICTION",
      "timestamp": 1715600000000
    }
  ]
}`}</pre>
      </div>

      <div className="endpoint-block mb-8">
        <h3><code>GET /api/intel/institutional</code> <span className="text-[10px] bg-green-500/10 text-green-600 px-2 py-0.5 rounded ml-2">STANDARD</span></h3>
        <p>Devuelve flujos de capital asociados a entidades institucionales conocidas (etiquetadas en Neo4j).</p>
        <h4>Parámetros Query:</h4>
        <ul>
          <li><code>entity</code> (opcional): Filtra por nombre (e.g., <code>Binance</code>, <code>Wintermute</code>).</li>
          <li><code>timeframe</code> (opcional): Ventana de tiempo (<code>24h</code>, <code>7d</code>, <code>30d</code>).</li>
        </ul>
      </div>

      <h2>2. Mercados y DeFi</h2>

      <div className="endpoint-block mb-8">
        <h3><code>GET /api/market/top</code></h3>
        <p>Los 50 activos con mayor volumen de transacciones on-chain en las últimas 24 horas.</p>
        <h4>Respuesta de ejemplo (200 OK):</h4>
        <pre>{`{
  "success": true,
  "data": [
    {
      "symbol": "WETH",
      "volume24h": 1250000000,
      "priceChange24h": 2.5,
      "currentPrice": 3100.50
    }
  ]
}`}</pre>
      </div>

      <div className="endpoint-block mb-8">
        <h3><code>GET /api/defi/morpho</code></h3>
        <p>Datos de TVL y APY de los pools (vaults) de Morpho Blue en la red Base.</p>
      </div>

      <h2>3. Entidades y Wallets</h2>

      <div className="endpoint-block mb-8">
        <h3><code>GET /api/wallet/:address</code></h3>
        <p>Perfil completo de un wallet, incluyendo etiquetas heurísticas y balance nativo.</p>
        <h4>Respuesta de ejemplo (200 OK):</h4>
        <pre>{`{
  "success": true,
  "data": {
    "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    "balance": "145.2",
    "txCount": 15420,
    "labels": ["Vitalik", "Ethereum Foundation", "Early Adopter"],
    "isContract": false
  }
}`}</pre>
      </div>

      <h2>4. Autenticación y Perfil</h2>

      <div className="endpoint-block mb-8">
        <h3><code>GET /api/auth/session</code></h3>
        <p>Devuelve el estado de la sesión actual verificando el JWT de la cookie.</p>
        <h4>Respuesta de ejemplo (200 OK):</h4>
        <pre>{`{
  "success": true,
  "data": {
    "userId": "usr_12345",
    "address": "0xTuWallet...",
    "tier": "ELITE",
    "subscriptionStatus": "active"
  }
}`}</pre>
      </div>

      <div className="endpoint-block mb-8">
        <h3><code>POST /api/payment/stripe/checkout</code></h3>
        <p>Inicia el flujo de Stripe Checkout para comprar o mejorar una suscripción.</p>
        <h4>Cuerpo (JSON):</h4>
        <pre>{`{
  "planId": "price_1Nx...",
  "successUrl": "https://humanidfi.com/dashboard/billing",
  "cancelUrl": "https://humanidfi.com/dashboard/billing"
}`}</pre>
      </div>

    </div>
  );
}
