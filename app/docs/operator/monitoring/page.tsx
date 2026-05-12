"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Activity } from 'lucide-react';

export default function MonitoringPage() {
  return (
    <div className="doc-content">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-25 mb-8">Operator / Operation / Monitoring</p>
      <h1>Monitoring & Observability</h1>

      <p>
        This guide shows you how to set up monitoring and observability for your Whale Alert node using OpenTelemetry, Prometheus, and Grafana. 
        Monitoring helps you maintain healthy node operations, diagnose issues quickly, and track performance over time.
      </p>

      <h2>Architecture</h2>
      <p>The monitoring stack uses three components working together:</p>
      <ul style={{listStyle:'none',paddingLeft:'1.25rem',position:'relative'}}>
        <li><strong>OpenTelemetry Collector:</strong> Receives metrics from your node via the OTLP protocol.</li>
        <li><strong>Prometheus:</strong> Stores and queries time-series metrics data.</li>
        <li><strong>Grafana:</strong> Visualizes metrics with dashboards and handles alerting.</li>
      </ul>
      <p>
        Your node exports metrics to the OpenTelemetry Collector, which processes and exposes them in a format Prometheus can scrape. 
        Prometheus stores the metrics as time-series data, and Grafana queries Prometheus to create visualizations and alerts.
      </p>

      <h2>Available Metrics Overview</h2>
      <p>
        Your node exposes metrics through OpenTelemetry to help you monitor performance and health. 
        The metrics available depend on your node type (full node, sequencer, or prover) and version.
      </p>

      <h3>Metric Categories</h3>
      <ul style={{listStyle:'none',paddingLeft:'1.25rem',position:'relative'}}>
        <li><strong>Node Metrics:</strong> Block height, sync status, peer count, and transaction processing.</li>
        <li><strong>Sequencer Metrics:</strong> Attestation activity, block proposals, and committee participation (sequencer nodes only).</li>
        <li><strong>Prover Metrics:</strong> Job queue, proof generation latency, and agent utilization (prover nodes only).</li>
        <li><strong>System Metrics:</strong> CPU, memory, disk I/O, and network bandwidth (via node exporter).</li>
      </ul>

      <h2>Quick Setup (Docker Compose)</h2>
      <p>Add the monitoring stack to your existing <code>docker-compose.yml</code> file:</p>

      <pre>{`services:
  # ... your existing whale-node service ...

  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    ports:
      - "9090:9090"
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3000:3000"
    volumes:
      - grafana-data:/var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    depends_on:
      - prometheus

  otel-collector:
    image: otel/opentelemetry-collector:latest
    container_name: otel-collector
    command: ["--config=/etc/otel-collector-config.yaml"]
    volumes:
      - ./otel-collector-config.yaml:/etc/otel-collector-config.yaml
    ports:
      - "4317:4317" # OTLP gRPC receiver
      - "4318:4318" # OTLP http receiver

volumes:
  prometheus-data:
  grafana-data:`}</pre>

      <div className="callout">
        <p>
          <strong>Note:</strong> Ensure you configure your <code>whale-node</code> to export metrics to the <code>otel-collector</code> endpoint 
          by setting the appropriate environment variables (e.g., <code>OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318</code>).
        </p>
      </div>

      <h2>Next Steps</h2>
      <p>Once your monitoring stack is running:</p>
      <ul style={{listStyle:'none',paddingLeft:'1.25rem',position:'relative'}}>
        <li>Set up alerting rules in Prometheus for critical conditions (e.g., node out of sync, peer count drops).</li>
        <li>Create custom dashboards tailored to your operational needs in Grafana.</li>
        <li>Configure notification channels (Slack, PagerDuty, email) in Grafana.</li>
      </ul>

      <div className="flex flex-col gap-2 mt-8">
        {[
          { label: 'Keystore Management', href: '/docs/operator/keystore' },
          { label: 'FAQs & Common Issues', href: '/docs/operator/faq' },
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
