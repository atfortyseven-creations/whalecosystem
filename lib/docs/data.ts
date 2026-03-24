export const docContent: Record<string, { title: string; category: string; content: string }> = {
  'intro': {
    title: 'Introduction to Whale Alert',
    category: 'Guides',
    content: `
# Introduction to Whale Alert Corporation

Whale Alert Corporation™ is the definitive institutional platform for on-chain data surveillance. 
Our protocol enables the secure tracking of massive capital movements with absolute precision.

## The Network Intelligence Layer
Unlike generic block explorers, the Whale Alert Protocol utilizes a proprietary **Neural Handshake** system to synchronize telemetry across decentralized nodes. 

### Core Pillars
* **Data Sovereignty**: Your terminal sessions remain private through ZK-proof verification.
* **Institutional Speed**: 120Hz refresh rates with sub-millisecond settlement visualization.
* **Global Protocol**: Unified access to the world's most liquid dark pools and institutional vaults.
    `
  },
  'quickstart': {
    title: 'Quickstart (API)',
    category: 'Guides',
    content: `
# Quickstart (API)

Follow these steps to integrate the Whale Alert API into your custom institutional dashboard.

## 1. Authentication
Obtain your corporate access token from the Network Portal and initialize the secure client.

\`\`\`typescript
import { WhaleCorporation } from '@whale-alert/sdk';

const client = new WhaleCorporation({
  apiKey: 'YOUR_CORPORATE_TOKEN',
  network: 'mainnet'
});
\`\`\`

## 2. Real-Time Subscription
Listen for capital movements exceeding $1B USD with zero-latency synchronization.

\`\`\`typescript
client.on('flow.tx.massive', (tx) => {
  console.log('🚨 WHALE ALERT:', tx.usdValue);
});
\`\`\`
    `
  },
  'get-started': {
    title: 'Get Started with Whale Alert',
    category: 'Guides',
    content: `
# Get Started

Welcome to the official technical repository. This guide will help you initialize your institutional terminal and synchronize with the Whale Alert Protocol.

## Prerequisites
* **Corporate Access Token**: Obtain this from your account manager.
* **Neural Handshake Link**: Ensure your PC and Mobile devices are linked via the Titanium Gate.

## Installation
The Whale Code SDK is the primary interface for terminal orchestration.

\`\`\`bash
npm install @whale-alert/corporation-sdk
\`\`\`
    `
  },
  'core-concepts': {
    title: 'Core Concepts',
    category: 'Guides',
    content: `
# Core Concepts

Understanding the underlying architecture of the Whale Alert Protocol is essential for high-frequency flow analysis.

## 1. Zero-Knowledge Settlement
Every capital movement detected is verified through a decentralized ZK-sharding process. This ensures that while the source and destination are public, the **strategic telemetry** of the monitoring agent remains private.

## 2. Kinetic Flow Visualization
Data is not just tracked; it is visualized as a kinetic pulse. The Whale Alert Protocol converts hexadecimal raw data into 120Hz kinetic streams.

## 3. Sovereign Subagents
Agents are the building blocks of the network. Each subagent operates with its own localized memory and execution context.
    `
  },
  'api/usage': {
    title: 'Using the Whale Alert API',
    category: 'API Reference',
    content: `
# Using the API

The Whale Alert REST and WebSocket APIs provide low-latency access to the global network telemetry.

## Base URL
The production environment operates on the sovereign endpoint:
\`https://api.whalealert.pro/v2\`

## Authentication
All requests must include the \`X-Whale-Token\` header.

\`\`\`bash
curl -H "X-Whale-Token: YOUR_TOKEN" \\
     https://api.whalealert.pro/v2/flows/massive
\`\`\`
    `
  },
  'whale-code/overview': {
    title: 'Whale Code Overview',
    category: 'Whale Code',
    content: `
# Whale Code™ Overview

Whale Code is the proprietary domain-specific language (DSL) for programmable data surveillance.

## Why Whale Code?
Standard scripting environments lack the kinetic precision required for institutional flow analysis. 
Whale Code bridges pure blockchain telemetry with autonomous agent logic.

### Key Features
* **Stateful Subagents**: Agents with persistent ZK-memory layers.
* **Auto-Looping Protocols**: Continuous state re-evaluation at the execution node level.
* **Deep Hooks**: Direct integration with dark pool settlement systems.
    `
  }
};
