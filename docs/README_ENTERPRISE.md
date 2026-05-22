# Humanity Ledger  Enterprise Edition
## Absolute Zero-Trust Systemty Framework

[![eIDAS 2.0 Ready](https://img.shields.io/badge/eIDAS_2.0-ARF_v2.4_Aligned-blue.svg)](#)
[![NIST SP 800-207](https://img.shields.io/badge/NIST-Zero_Trust_Architecture-success.svg)](#)
[![Coverage](https://img.shields.io/badge/Coverage-%3E92%25-brightgreen.svg)](#)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](#)

Humanity Ledger is an institutional-grade, Zero-Trust on-chain analytics platform. It provides mathematically proven, non-repudiable entity tracking across EVM and non-EVM networks, secured by a cryptographic audit trail and eIDAS 2.0-aligned identity protocols.

---

##  Institutional Guarantees

This Enterprise Edition enforces the **System Network Architecture v3**, which guarantees:

1. **Absolute Zero-Trust (TitaniumGate)**: No implicit trust. Every request is verified via EIP-191 ECDSA signatures. Passwords do not exist.
2. **Zero-Simulation Mandate**: The entity graph (`Memory Grid` / Neo4j) contains exactly 0 synthetic nodes. All relationships are proven by cryptographic on-chain links.
3. **Immutable Non-Repudiation**: Every security event (auth, rate limits, honeypot hits) is chained using HMAC-SHA256, proving the exact state of the system for external auditors.
4. **Thermodynamic EVM Analysis**: Capital flows are evaluated using statistical mechanics (Z-Scores, Boltzmann distribution analogues) rather than raw volume, eliminating MEV noise.

---

##  Security Architecture

### TitaniumGate Middleware
Our Edge Runtime middleware processes all inbound traffic globally within 50ms:
- **EIP-191 Verification**: Formal validation with EIP-2 low-s enforcement and `timingSafeEqual`.
- **Distributed Rate Limiting**: Upstash-backed sliding window DDoS protection, tiered by user level.
- **WAF & Honeypots**: Instant termination of automated scanners.

### eIDAS 2.0 Alignment
Designed for compliance with the European Digital Identity Framework (ARF v2.4):
- **Level of Assurance (LoA)**: Substantial (via cryptographic key possession).
- **Selective Disclosure**: Groth16 ZK-SNARK integration for Golden Ticket verification without PII exposure.

---

##  Deployment (Enterprise/On-Premise)

### Prerequisites
- Node.js 22.x (required by native bindings)
- PostgreSQL 16+
- Redis 7+
- Neo4j 5.x Enterprise (optional, falls back to Memory Grid)

### Environment Configuration
Critical secrets required for deployment (see `SECURITY.md` for rotation policies):
```bash
# Cryptography
JWT_SECRET="es256-private-key-for-session"
AUDIT_SECRET="256-bit-hmac-key"
NEXTAUTH_SECRET="32-byte-random-string"

# Resilience
UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."
```

### Build & Run
```bash
npm install
npx prisma db push --accept-data-loss
npm run build
npm run start
```

---

##  Deep Health Metrics
Enterprise operators can monitor the `CLOSED/OPEN/HALF_OPEN` state of all internal circuit breakers via the authenticated deep health endpoint:
```bash
curl -H "X-Health-Secret: $HEALTH_CHECK_SECRET" "https://api.humanityledger.io/v1/health-check?deep=1"
```

---

##  Documentation Directory
- [Formal Threat Model (STRIDE)](./docs/THREAT_MODEL_v2.1.md)
- [eIDAS 2.0 Compliance Report](./docs/eIDAS2_ALIGNMENT_REPORT_v1.0.md)
- [Security Audit Brief](./docs/SECURITY_AUDIT_BRIEF_v2.1.md)
- [OpenAPI 3.1 Spec](./docs/openapi.yaml)

---
*© 2026 Humanity Ledger SL. All Rights Reserved. Proprietary and Confidential.*
