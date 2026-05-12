"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function PrerequisitesPage() {
  return (
    <div className="doc-content">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-25 mb-8">Operator / Prerequisites</p>
      <h1>Prerequisites</h1>
      <p>
        This guide covers the hardware, software, and network requirements to run any node type
        on the Whale Alert Network. Complete these steps before proceeding to node setup.
      </p>

      <h2>Operating System</h2>
      <p>Node software runs on any Unix system released after 2020:</p>
      <ul style={{listStyle:'none',paddingLeft:'1.25rem',position:'relative'}}>
        <li>Linux (Ubuntu 22.04 LTS, Debian 12 recommended)</li>
        <li>macOS (ARM and Intel)</li>
      </ul>

      <h2>Docker & Docker Compose</h2>
      <p>All nodes run in Docker containers managed by Docker Compose. Required for every node type.</p>

      <h3>Install on Linux</h3>
      <pre>{`# Install Docker Engine
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group (no sudo required)
sudo groupadd docker
sudo usermod -aG docker $USER
newgrp docker

# Verify
docker run hello-world`}</pre>

      <h3>Install on macOS</h3>
      <p>Install <strong>Docker Desktop</strong> — it includes both Docker and Docker Compose.</p>

      <h2>Whale Alert CLI Toolchain</h2>
      <p>
        The CLI provides utilities for key generation, node registration, and operational tasks.
        Not required for running nodes (which use Docker Compose), but needed for:
      </p>
      <ul style={{listStyle:'none',paddingLeft:'1.25rem'}}>
        <li>Generating validator keystores</li>
        <li>Registering sequencers on L1</li>
        <li>Managing keystore entries</li>
      </ul>
      <pre>{`# Install CLI (replace VERSION as needed)
VERSION=2.0.0 bash -i <(curl -sL https://install.whale-alert.network/$VERSION)

# Verify
whale-cli --version`}</pre>

      <h2>L1 Ethereum Node Access</h2>
      <p>All nodes require access to Ethereum L1 endpoints:</p>
      <ul style={{listStyle:'none',paddingLeft:'1.25rem'}}>
        <li>Execution client (Geth, Nethermind, Besu, Erigon)</li>
        <li>Consensus client (Prysm, Lighthouse, Teku, Nimbus)</li>
      </ul>

      <div className="callout">
        <p>
          <strong>Recommended:</strong> Run your own L1 node for best performance, lower latency,
          and no rate limiting. Alternatively, use GetBlock RPC — see the{' '}
          <Link href="/docs/integrations/getblock" className="underline opacity-80 hover:opacity-100">GetBlock integration guide</Link>.
        </p>
      </div>

      <h2>Port Forwarding & Connectivity</h2>
      <p>Nodes participating in P2P (full nodes, sequencers, provers) require correct port configuration:</p>

      <table>
        <thead><tr><th>Port</th><th>Protocol</th><th>Purpose</th></tr></thead>
        <tbody>
          <tr><td><code>40400</code></td><td>TCP + UDP</td><td>P2P peer discovery and communication</td></tr>
          <tr><td><code>8080</code></td><td>TCP</td><td>HTTP API (public)</td></tr>
          <tr><td><code>8880</code></td><td>TCP</td><td>Admin API (internal only, never expose)</td></tr>
        </tbody>
      </table>

      <pre>{`# Find your public IP
curl ipv4.icanhazip.com

# Verify TCP P2P port
nc -zv [YOUR_EXTERNAL_IP] 40400

# Verify UDP P2P port
nc -zuv [YOUR_EXTERNAL_IP] 40400`}</pre>

      <div className="callout">
        <p>Set the <code>P2P_IP</code> environment variable to your external IP address. If port forwarding is not configured, your node cannot participate in P2P duties.</p>
      </div>

      <h2>Minimum Hardware Requirements</h2>
      <table>
        <thead><tr><th>Component</th><th>Full Node</th><th>Sequencer</th><th>Prover</th></tr></thead>
        <tbody>
          <tr><td>CPU</td><td>8-core / 16 vCPU</td><td>16-core</td><td>32-core</td></tr>
          <tr><td>RAM</td><td>16 GB</td><td>32 GB ECC</td><td>64 GB ECC</td></tr>
          <tr><td>Storage</td><td>1 TB NVMe SSD</td><td>2 TB NVMe SSD</td><td>2 TB NVMe SSD</td></tr>
          <tr><td>Network</td><td>25 Mbps</td><td>100 Mbps</td><td>1 Gbps</td></tr>
        </tbody>
      </table>

      <h2>Next Steps</h2>
      <div className="flex flex-col gap-2 mt-4">
        {[
          { label: 'Run a Full Node', href: '/docs/operator/setup/node' },
          { label: 'Run a Sequencer', href: '/docs/operator/setup/sequencer' },
          { label: 'Run a Prover', href: '/docs/operator/setup/prover' },
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
