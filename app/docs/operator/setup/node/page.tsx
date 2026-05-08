"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Terminal } from 'lucide-react';

export default function NodeSetupPage() {
  return (
    <div className="doc-content">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-25 mb-8">Operator / Setup / Node</p>
      <h1>Running a Full Node</h1>
      
      <p>
        This guide covers the steps required to run a full node on the Whale Alert Network using Docker Compose.
        A full node allows you to connect and interact with the network, providing an interface to send and receive 
        transactions and state updates without relying on third parties.
      </p>

      <p>
        You should run your own full node if you want to interact with the network in the most privacy-preserving way, 
        or if you intend to run a Sequencer or Prover node in the future.
      </p>

      <div className="callout">
        <p>
          <strong>Prerequisites:</strong> Ensure you have reviewed and met the requirements outlined in the{' '}
          <Link href="/docs/operator/prerequisites" className="underline opacity-80 hover:opacity-100">Prerequisites</Link> guide.
        </p>
      </div>

      <h2>Step 1: Directory Structure</h2>
      <p>Create the directory structure for your node data and environment configuration:</p>
      <pre>{`mkdir -p whale-node/data
cd whale-node
touch .env
touch docker-compose.yml`}</pre>

      <h2>Step 2: Environment Variables</h2>
      <p>Add the following configuration to your <code>.env</code> file:</p>
      <pre>{`# .env
DATA_DIRECTORY=./data
LOG_LEVEL=info

# L1 Ethereum Node Endpoints
ETHEREUM_HOSTS=[your L1 execution endpoint]
L1_CONSENSUS_HOST_URLS=[your L1 consensus endpoint]

# P2P Configuration
P2P_IP=[your external IP address]
P2P_PORT=40400

# API Ports
API_PORT=8080
ADMIN_PORT=8880`}</pre>
      
      <p>Find your public IP address using: <code>curl ipv4.icanhazip.com</code></p>

      <h2>Step 3: Docker Compose File</h2>
      <p>Add the following to your <code>docker-compose.yml</code> file:</p>
      
      <pre>{`services:
  whale-node:
    image: "atfortyseven/whale-node:v2.0"
    container_name: "whale-node"
    ports:
      - "\${API_PORT}:\${API_PORT}"
      - "\${P2P_PORT}:\${P2P_PORT}"
      - "\${P2P_PORT}:\${P2P_PORT}/udp"
    volumes:
      - "\${DATA_DIRECTORY}:/var/lib/data"
    environment:
      DATA_DIRECTORY: /var/lib/data
      LOG_LEVEL: \${LOG_LEVEL}
      ETHEREUM_HOSTS: \${ETHEREUM_HOSTS}
      L1_CONSENSUS_HOST_URLS: \${L1_CONSENSUS_HOST_URLS}
      P2P_IP: \${P2P_IP}
      P2P_PORT: \${P2P_PORT}
      API_PORT: \${API_PORT}
      ADMIN_PORT: \${ADMIN_PORT}
    restart: always
    networks:
      - whale-net

networks:
  whale-net:
    name: whale-net`}</pre>

      <div className="callout">
        <p>
          <strong>Security Note:</strong> The admin port (<code>8880</code>) is intentionally NOT exposed to the host machine. 
          The admin API provides sensitive operations like configuration changes and database rollbacks that should never be 
          accessible from outside the container.
        </p>
      </div>

      <h2>Step 4: Start the Node</h2>
      <p>Initialize and start the container in detached mode:</p>
      <pre>{`docker compose up -d`}</pre>

      <h2>Verification</h2>
      <p>Once your node is running, verify it's working correctly.</p>

      <h3>Check Node Status</h3>
      <pre>{`curl http://localhost:8080/status`}</pre>

      <h3>Check Sync Progress</h3>
      <p>Query the node's current L2 tip and compare it with the block explorer:</p>
      <pre>{`curl -s -X POST -H 'Content-Type: application/json' \\
  -d '{"jsonrpc":"2.0","method":"node_getL2Tips","params":[],"id":1}' \\
  http://localhost:8080 | jq -r ".result.proven.number"`}</pre>

      <h3>View Logs</h3>
      <p>Follow the live logs to ensure there are no startup errors:</p>
      <pre>{`docker compose logs -f whale-node`}</pre>

      <h2>Troubleshooting</h2>
      <ul style={{listStyle:'none',paddingLeft:'1.25rem',position:'relative'}}>
        <li>
          <strong>Port forwarding not working:</strong> If your node cannot connect to peers, verify that <code>P2P_IP</code> matches your external IP and check your router's firewall rules for port <code>40400</code> (TCP/UDP).
        </li>
        <li>
          <strong>Node not syncing:</strong> Verify your L1 endpoint connectivity. Ensure both execution and consensus clients are fully synced.
        </li>
      </ul>

      <h2>Next Steps</h2>
      <div className="flex flex-col gap-2 mt-4">
        {[
          { label: 'Set up Monitoring', href: '/docs/operator/monitoring' },
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
