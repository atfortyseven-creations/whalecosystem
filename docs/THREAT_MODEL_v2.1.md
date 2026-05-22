# SOVEREIGN THREAT MODEL  Formal Security Analysis
## Humanity Ledger | Zero-Trust Architecture v2.1
### Classification: Public Technical Distribution | April 2026

---

## 1. System Overview

The Humanity Ledger (Whale Alert Network) is a system, Zero-Trust on-chain analytics platform comprising:

- **TitaniumGate**  Next.js Edge middleware enforcing ECDSA-based authentication
- **Whale Worker**  Multi-chain RPC daemon (ETH/BASE/BSC/SOL/BTC) with WebSocket subscriptions
- **Neo4j Graph**  Entity relationship grid with Memory Grid fallback
- **Redis/BullMQ**  Distributed job queue and session state
- **PostgreSQL/Prisma**  Relational store with append-only audit log
- **System Forum**  EIP-191 signed, non-repudiable communication layer

**Trust Boundary:** The system operates under the assumption that **all external inputs are adversarial** until cryptographically proven otherwise (NIST SP 800-207 §2.1).

---

## 2. Threat Actors

| Actor | Capability | Motivation |
|---|---|---|
| **T1  Automated Scanner** | Low (script kiddie tools) | Credential harvesting, data exfiltration |
| **T2  Targeted Attacker** | Medium (custom tooling) | Bypass authentication, access whale analytics |
| **T3  State-Level Actor** | High (nation-state resources) | Surveillance, infrastructure disruption |
| **T4  Malicious Insider** | High (system access) | Data theft, log tampering |
| **T5  Supply Chain Attacker** | Medium-High (dependency poisoning) | Backdoor insertion via npm packages |
| **T6  RPC Provider Compromise** | Medium (upstream control) | Data fabrication, DoS |

---

## 3. Assets Under Protection

| Asset | Confidentiality | Integrity | Availability |
|---|---|---|---|
| Whale analytics data (on-chain signals) | HIGH | CRITICAL | HIGH |
| User wallet addresses + session tokens | HIGH | CRITICAL | MEDIUM |
| EVM Thermodynamics algorithm parameters | CRITICAL | HIGH | LOW |
| Neo4j graph topology + Cypher queries | CRITICAL | HIGH | LOW |
| API keys (Alchemy, Infura, GetBlock) | CRITICAL | CRITICAL | HIGH |
| Audit trail (HMAC chain) | MEDIUM | CRITICAL | HIGH |
| Forum posts + ECDSA signatures | LOW | CRITICAL | MEDIUM |

---

## 4. Threat Catalog (STRIDE Model)

### 4.1 Spoofing

| ID | Threat | Attack Vector | Mitigation | Status |
|---|---|---|---|---|
| S1 | Session token forgery | Craft fake `system_handshake` cookie | JWT + ECDSA claim verification (`jose.jwtVerify` + `0x` address check) |  MITIGATED |
| S2 | Wallet address spoofing | Submit signature from different wallet | EIP-191 ECDSA recovery + `crypto.timingSafeEqual` |  MITIGATED |
| S3 | KYC token forgery | Craft `kyc_token` with `status=APPROVED` | JWT verification with KYC_SECRET + claim validation |  MITIGATED |
| S4 | IP address spoofing | Forge `X-Forwarded-For` header | Trust only first IP in chain; Cloudflare/Railway sets real IP | ️ PARTIAL |

### 4.2 Tampering

| ID | Threat | Attack Vector | Mitigation | Status |
|---|---|---|---|---|
| T1 | Forum post modification | Admin modifies content post-publication | ECDSA signature stored alongside content; any modification invalidates signature |  MITIGATED |
| T2 | Audit log deletion | Insider deletes incriminating entries | HMAC-SHA256 chain: deletion breaks prev_hash chain, detectable by `verifyAuditTrailIntegrity()` |  MITIGATED |
| T3 | Redis queue poisoning | Inject malicious job payload | HMAC-SHA256 signatures on all queue payloads |  MITIGATED |
| T4 | On-chain data fabrication | Return fake RPC responses | `entity-graph-miner` Zero-Simulation Mandate: no synthetic data; all signals verified against block explorers |  MITIGATED |
| T5 | Dependency tampering | npm package substitution | `package-lock.json` pinned hashes; Snyk scan in CI; `.npmrc` strict mode | ️ PARTIAL |

### 4.3 Repudiation

| ID | Threat | Attack Vector | Mitigation | Status |
|---|---|---|---|---|
| R1 | User denies forum post authorship | Claim signature was forged | Non-repudiation: `{ content_hash, ecdsa_signature, signer_address }` stored immutably |  MITIGATED |
| R2 | System denies security event | No audit record of honeypot hit or rate limit | `appendAuditEntry()` called on all SECURITY_* events in middleware |  MITIGATED |
| R3 | Operator denies configuration change | No record of settings mutation | `AuditLog` records all WATCH_WALLET_ADDED / SETTINGS_UPDATED events |  MITIGATED |

### 4.4 Information Disclosure

| ID | Threat | Attack Vector | Mitigation | Status |
|---|---|---|---|---|
| I1 | API key exfiltration | XSS  read env vars from `window.__ENV__` | Env vars server-side only; CSP eliminates XSS vector via nonce-based policy |  MITIGATED |
| I2 | Session token leakage via Referer | Token in URL parameter | Tokens only in `HttpOnly; SameSite=Lax; Secure` cookies |  MITIGATED |
| I3 | Watched address exposure | Vendor observes query patterns | Local-first architecture: all filtering on operator hardware; no external query logging |  MITIGATED |
| I4 | Route enumeration | Probe protected routes | Honeypot returns 404 for all scanner patterns; protected routes masked as 404 |  MITIGATED |
| I5 | Error message leakage | Detailed errors expose stack traces | All errors return generic messages; full details logged server-side only |  MITIGATED |
| I6 | IP address disclosure to analytics | Google Analytics / GTM | CSP `connect-src` restricts analytics endpoints; no wallet address sent to GA | ️ REVIEW |

### 4.5 Denial of Service

| ID | Threat | Attack Vector | Mitigation | Status |
|---|---|---|---|---|
| D1 | HTTP flood (Layer 7) | Overwhelm API routes | Upstash sliding window rate limiter (tier-aware) + Cloudflare DDoS protection |  MITIGATED |
| D2 | RPC provider exhaustion | Flood Alchemy/Infura quota | Circuit breaker (3-failure threshold) + ResilientProvider failover |  MITIGATED |
| D3 | WebSocket connection exhaustion | Open thousands of WS connections | Singleton WebSocket + Reference Counting: N clients = 1 upstream connection |  MITIGATED |
| D4 | Redis queue poisoning / flood | Enqueue millions of jobs | HMAC validation on queue payloads; BullMQ job TTL and concurrency limits |  MITIGATED |
| D5 | Neo4j query amplification | Expensive N-hop Cypher traversal | `LIMIT 50` on all traversal queries; circuit breaker  Memory Grid fallback |  MITIGATED |
| D6 | SSE stream exhaustion | Open unlimited SSE connections | EventSource reconnect with exponential backoff (1s  30s); max connections per IP | ️ PARTIAL |

### 4.6 Elevation of Privilege

| ID | Threat | Attack Vector | Mitigation | Status |
|---|---|---|---|---|
| E1 | Unauthenticated access to protected routes | Skip authentication cookie | TitaniumGate: all protected patterns require valid JWT; fails to 404 not 401 |  MITIGATED |
| E2 | KYC bypass to access `/trade` | Forge `kyc_token` or skip check | JWT + `status=APPROVED` claim verification with `KYC_SECRET` |  MITIGATED |
| E3 | Admin route access | Enumerate `/api/admin/*` paths | Honeypot: all `/api/admin/*` paths return 404 instantly |  MITIGATED |
| E4 | Smart contract re-entrancy | Call `withdraw()` before state update | CEI pattern enforced; amount zeroed before transfer in all contract functions |  MITIGATED |
| E5 | Prisma injection via user input | Craft malicious Prisma query via API | Prisma type-safe API prevents raw SQL injection; all inputs validated with Zod |  MITIGATED |

---

## 5. Residual Risks (Open Items)

| ID | Description | Severity | Recommended Action |
|---|---|---|---|
| RR1 | S4: First-IP-in-chain trust | LOW | Validate against Cloudflare CF-Connecting-IP header in production |
| RR2 | T5: Supply chain (npm) | MEDIUM | Add `npm ci` in CI + Snyk in GitHub Actions + lockfile hash verification |
| RR3 | I6: Analytics IP disclosure | LOW | Review GA/GTM data retention settings; consider self-hosted analytics (Plausible) |
| RR4 | D6: SSE connection limit | LOW | Implement per-IP SSE connection counter in Redis |
| RR5 | ZK integration incomplete | MEDIUM | Complete ZK-SNARK integration for Golden Ticket verification (Phase 1 roadmap) |
| RR6 | Distributed replay protection | MEDIUM | Migrate `replayMap` from in-memory to Redis with TTL for multi-instance deployments |

---

## 6. Security Controls Summary (NIST SP 800-53 Alignment)

| Control Family | Control | Implementation |
|---|---|---|
| AC  Access Control | AC-3 (Access Enforcement) | TitaniumGate middleware; KYC check for `/trade` |
| AU  Audit & Accountability | AU-2, AU-9 | SystemAuditLog HMAC chain; immutable append-only |
| IA  Identification & Authentication | IA-2, IA-5 | EIP-191 ECDSA + JWT; no password-based auth |
| SC  System & Communications | SC-8 (Transmission Confidentiality) | HSTS 2 years; all cookies Secure+HttpOnly |
| SI  System & Information Integrity | SI-3 (Malicious Code Protection) | WAF engine; honeypot traps; CSP nonce-based |
| RA  Risk Assessment | RA-5 (Vulnerability Scanning) | npm audit + Snyk + Semgrep + Trivy in pipeline |
| SA  System & Services Acquisition | SA-15 (Development Process) | Zero-Simulation Mandate; peer review policy |

---

## 7. Cryptographic Standards Compliance

| Algorithm | Usage | Standard | Key Size | Status |
|---|---|---|---|---|
| ECDSA secp256k1 | Authentication signatures (EIP-191) | FIPS 186-5 | 256-bit |  |
| Keccak-256 | Message hashing (EIP-191 prefix) | Ethereum Yellow Paper | 256-bit |  |
| HMAC-SHA256 | Audit trail integrity | FIPS 198-1 | 256-bit key |  |
| SHA-256 | Payload hashing (audit chain) | FIPS 180-4 | 256-bit output |  |
| JWT (HS256) | Session tokens | RFC 7519 | 256-bit secret |  |
| AES-256-GCM | (Reserved for future ZK layer) | FIPS 197 | 256-bit |  Planned |
| ZK-SNARK (Groth16) | Golden Ticket verification |  |  | ️ Partial |

---

## 8. eIDAS 2.0 Alignment

| eIDAS 2.0 Requirement | Current Implementation | Gap | Priority |
|---|---|---|---|
| Level of Assurance (LoA) High | ECDSA wallet signature (something you have + something you know) | Missing biometric factor for LoA High | MEDIUM |
| Verifiable Credentials (W3C VC) | `human_session` JWT (non-VC format) | Migrate to W3C VC format | HIGH |
| Selective Disclosure | Not implemented | Add SD-JWT or BBS+ signatures | HIGH |
| Non-repudiation |  ECDSA signatures + HMAC audit trail |  | COMPLETE |
| Person Identification Data (PID) | WorldID ZK proof (partial) | Full PID schema alignment needed | MEDIUM |
| Privacy by Design | Local-first architecture; no query logging | DPIA documentation pending | HIGH |

---

*Document Version: 2.1 | April 2026*
*Classification: Public Technical Distribution*
*Next review: Prior to external audit engagement*
