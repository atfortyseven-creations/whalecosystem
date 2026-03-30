# Audit & Compliance

This document describes the regulatory framework, compliance controls, audit logging architecture, and KYC flow of Whale Alert Network.

---

## Regulatory Framework

Whale Alert Network operates under the following regulatory constraints:

### CFTC Compliance
The Commodity Futures Trading Commission (CFTC) has asserted jurisdiction over prediction markets involving U.S. persons. Accordingly, all Polymarket data endpoints, trading routes, and signal feeds that could constitute prediction market access are geofenced against U.S.-based IP addresses.

**Blocked jurisdictions for regulated routes (`/api/polymarket/*`, `/trade/*`):**
- 🇺🇸 United States (`US`)
- 🇨🇺 Cuba (`CU`)
- 🇮🇷 Iran (`IR`)
- 🇰🇵 North Korea (`KP`)
- 🇸🇾 Syria (`SY`)

The geofence reads jurisdiction from two independent sources and applies the stricter result:
- `x-vercel-ip-country` (Vercel Edge Network)
- `cf-ipcountry` (Cloudflare, if applicable)

VPN detection is enforced at the WAF layer via host header anomaly scoring. Users accessing via known VPN exit nodes accumulate anomaly score and may be challenged.

### OFAC Compliance
Transactions from OFAC-sanctioned wallet addresses are blocked. The sanctions list is checked at session establishment using a curated on-chain blocklist maintained in our compliance database.

---

## KYC Flow

Trading routes are protected by a full Know Your Customer verification flow. The KYC process is designed to verify identity without storing personal documents on central servers.

### Flow Diagram

```
User navigates to /trade
        │
        ▼
Middleware: is kyc_token cookie present?
        │
   YES  │  NO
        │   └──→ Redirect to /verify-human
        ▼          │
JWT signature      ▼
verification    WorldID Proof submitted
        │          │
   VALID│          ▼
        │       Server verifies proof
        ▼          │
Access granted  APPROVED → JWT minted
                   │
                   ▼
               kyc_token cookie set
               (HttpOnly, Secure, SameSite=Strict)
                   │
                   ▼
               Redirect back to /trade
```

### JWT Token Specification

KYC approval is encoded as a JWT signed with HMAC-SHA256:

```json
{
  "header": { "alg": "HS256", "typ": "JWT" },
  "payload": {
    "walletAddress": "0x...",
    "status": "APPROVED",
    "verifiedAt": "2026-03-30T18:00:00Z",
    "expiresAt": "2026-06-30T18:00:00Z",
    "tier": "PRO",
    "humanScore": 95
  }
}
```

The signing key (`KYC_SECRET`) is:
- Never hardcoded in application code
- Stored exclusively as an environment variable in the deployment platform (Railway)
- Not accessible to the client tier under any circumstances

---

## Audit Log Architecture

All security-relevant events generate structured audit log entries. Logs are append-only and stored in two locations:

1. **Structured JSON logs** → collected by Railway's log aggregator
2. **Database AuditLog table** → PostgreSQL, retained for 7 years (regulatory requirement)

### AuditLog Schema

```prisma
model AuditLog {
  id          String   @id @default(cuid())
  eventType   String   // See event catalog below
  walletAddress String?
  ip          String
  country     String?
  userAgent   String?
  payload     Json     // Event-specific details
  severity    String   // INFO | WARN | ERROR | CRITICAL
  createdAt   DateTime @default(now())

  @@index([walletAddress])
  @@index([eventType, createdAt])
  @@index([ip, createdAt])
}
```

### Security Event Catalog

| Event Type | Severity | Trigger |
|---|---|---|
| `AUTH_SUCCESS` | INFO | Successful wallet connection |
| `AUTH_FAILURE` | WARN | Failed authentication attempt |
| `KYC_APPROVED` | INFO | KYC verification completed successfully |
| `KYC_REJECTED` | WARN | KYC verification failed |
| `KYC_SPOOF_ATTEMPT` | ERROR | Invalid/forged KYC JWT intercepted |
| `WAF_BLOCK` | ERROR | Request blocked by WAF anomaly scoring |
| `HONEYPOT_HIT` | WARN | Scanner hit a honeypot route |
| `GEO_BLOCK` | WARN | Request from restricted jurisdiction |
| `RATE_LIMIT_EXCEEDED` | WARN | API quota exceeded |
| `RATE_LIMIT_REDIS_FAILURE` | CRITICAL | Redis rate limiter offline |
| `QR_SYNC_SUCCESS` | INFO | Mobile-to-desktop QR handshake completed |
| `QR_SYNC_FAILURE` | WARN | Invalid or expired QR token submitted |
| `VAULT_ENCRYPT` | INFO | User encrypted a vault entry |
| `VAULT_DECRYPT` | INFO | User decrypted a vault entry |
| `VAULT_DECRYPT_FAILURE` | ERROR | Vault decryption failed (wrong signature/salt) |
| `ADMIN_ACTION` | CRITICAL | Any action on admin routes |

---

## Data Retention Policy

| Data Category | Retention Period | Legal Basis |
|---|---|---|
| Audit logs | 7 years | Financial regulatory requirement |
| KYC approval records | 5 years | AML/KYC regulations |
| API request logs | 90 days | Security investigation |
| WebSocket session logs | 30 days | Operational debugging |
| User vault data | Until user deletion | User data ownership |
| IP geolocation logs | 30 days | Security |

---

## Right to Deletion

Users may request complete data deletion via the **Settings → Privacy → Delete My Data** flow. Upon confirmation:

1. All Prisma database records linked to the wallet address are deleted
2. Redis session keys are purged immediately
3. Audit logs older than 30 days are anonymized (wallet address replaced with `DELETED_USER`)
4. Vault encrypted blobs are deleted (the server cannot decrypt them regardless)

Regulatory audit logs (KYC records, financial event logs) are retained in anonymized form for the legally required period even after deletion request.

---

## Penetration Testing

The Whale Alert Network platform undergoes security assessment continuously. The assessment covers:

- OWASP Top 10 vulnerabilities
- API security (OWASP API Security Top 10)
- Smart contract audit (for any on-chain contract interactions)
- Infrastructure security (Railway, Redis, PostgreSQL configuration)
- Dependency vulnerability scanning (via automated npm audit in CI/CD pipeline)

Security researchers who discover vulnerabilities are encouraged to report them responsibly. See [Security Architecture → Incident Response](./security-architecture.md#incident-response) for contact information.

---

## Disclaimer

Whale Alert Network provides market intelligence data for **educational and informational purposes only**. Nothing on this platform constitutes financial advice, investment recommendations, or solicitation to trade. Past signal performance does not guarantee future results. Users are responsible for understanding the regulatory requirements of their jurisdiction before accessing any feature of the platform.

**NO RELIANCE / EDUCATIONAL PURPOSES ONLY**
