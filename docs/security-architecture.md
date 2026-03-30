# Security Architecture

This document describes the complete security stack of Whale Alert Network, from the network edge to the cryptographic vault. Every component described here is active in production.

---

## Overview — Defense in Depth

```
INTERNET
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 0 — HSTS Preload                                         │
│  max-age=63072000; includeSubDomains; preload                   │
│  Forces HTTPS for all connections. Eliminates SSL stripping.    │
└────────────────────────────────┬────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────┐
│  LAYER 1 — WhaleFortress WAF v6 (Edge Runtime)                  │
│  OWASP Core Rule Set v3.3 — Anomaly Scoring Engine              │
└────────────────────────────────┬────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────┐
│  LAYER 2 — Geofencing (CFTC / OFAC)                             │
│  Blocks: US, CU, IR, KP, SY at network edge                     │
└────────────────────────────────┬────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────┐
│  LAYER 3 — Honeypot Routes                                       │
│  /wp-admin, /.env, /phpmyadmin, /admin, /config → 404 silence   │
└────────────────────────────────┬────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────┐
│  LAYER 4 — Rate Limiting (Bicapa)                               │
│  In-memory sliding window (WAF) + Redis atomic Lua (middleware)  │
└────────────────────────────────┬────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────┐
│  LAYER 5 — Identity Verification                                 │
│  Clerk Auth + Sovereign Handshake + KYC JWT                     │
└────────────────────────────────┬────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────┐
│  LAYER 6 — Content Security Policy (Nonce-based)                │
│  strict-dynamic, unsafe-eval only on wallet routes              │
└────────────────────────────────┬────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────┐
│  LAYER 7 — Client-Side Vault Encryption                         │
│  AES-GCM-256 + PBKDF2-SHA256 (210,000 iterations)              │
└─────────────────────────────────────────────────────────────────┘
```

---

## WAF — WhaleFortress v6

The Web Application Firewall runs in Next.js Edge Runtime — before any application code, before any database query, before any authentication check.

### Anomaly Scoring Vectors

Requests accumulate an anomaly score across 6 independent detection vectors:

| Vector | Score Weight | Detection |
|---|---|---|
| Missing / malicious User-Agent | +5 / +10 | Empty UA, or matches 15 known attack tools |
| Injection patterns in URL | +8 | SQLi, XSS, path traversal, template injection, null byte |
| Suspicious header injection | +5 per header | `x-forwarded-host`, `x-original-url`, `x-rewrite-url`, `x-custom-ip-authorization` |
| Invalid HTTP method | +10 | Any method outside GET/POST/PUT/PATCH/DELETE/OPTIONS/HEAD |
| Oversized body on sensitive routes | +8 | Content-Length > 1MB on `/api/auth`, `/api/defi`, `/api/verify-human` |
| Host header anomaly | +3 | Host not in expected production/preview domain list |

**Thresholds:**
- Score ≥ 5: `CHALLENGE` — logged, monitored, adaptive limit applied
- Score ≥ 10: `BLOCK` — immediate HTTP 403, `X-WAF-Block: true` header

### Bot UA Fingerprinting

The following tool signatures are blocked at score +10:

```
sqlmap, nikto, nmap, masscan, zgrab, dirbuster, gobuster,
wfuzz, nuclei, burpsuite, acunetix, nessus, openvas,
metasploit, hydra, medusa, libwww-perl, lwp-request,
go-http-client/1.0, curl/7.[0-4].x, python-requests/2.[0-1].x
```

### Injection Detection Patterns

```regexp
(\.\.[\\/\\]){2,}           # Path traversal: ../../
<script[\s>]                # XSS
javascript:                 # JS protocol injection
\bunion\b.*\bselect\b       # SQL injection (UNION SELECT)
\bselect\b.*\bfrom\b        # SQL injection (SELECT FROM)
\$\{.*\}                    # Template injection: ${...}
\beval\b\s*\(              # Eval injection
%00                         # Null byte
%2e%2e                      # URL-encoded path traversal
```

---

## Rate Limiting — Bicapa Architecture

### Layer A: In-Memory (WAF, zero latency)

A per-endpoint sliding window runs in the Edge worker's memory. It is the first line of defense and adds zero network overhead.

Per-endpoint limits enforced at this layer:

| Endpoint | Max | Window |
|---|---|---|
| `/api/user/nuke` | 2 | 24 hours |
| `/api/verify-human` | 10 | 1 hour |
| `/api/defi/copy-trading` | 30 | 1 minute |
| `/api/defi/deposit` | 20 | 1 minute |
| `/api/polymarket` | 100 | 1 minute |
| `/api/auth` | 20 | 1 minute |
| All `/api/*` | 300 | 1 minute |

**Memory management:** The in-memory map is garbage collected every 500 requests to prevent unbounded growth in long-lived Edge workers.

### Layer B: Redis Atomic (Middleware, distributed)

The second layer enforces per-API-key daily quotas using an atomic Lua script:

```lua
local current = redis.call('INCR', KEYS[1])
if current == 1 then
    redis.call('EXPIRE', KEYS[1], ARGV[1])
end
return current
```

This single atomic operation eliminates the INCR→EXPIRE race condition that would otherwise allow quota bypass under high concurrency. Keys expire at midnight UTC, resetting the daily quota.

**Adaptive limits:** Authenticated users are rate-limited according to their plan tier (FREE/STANDARD/STARTER/PRO/ELITE). ELITE keys receive `limit: -1` (unlimited) and bypass the Redis quota check entirely.

---

## Content Security Policy

The CSP is generated per-request with a cryptographically random nonce (128-bit, base64-encoded). Every legitimate inline script must carry this nonce attribute — injected scripts without it are blocked by the browser.

### Policy Structure

```
default-src 'self';
script-src  'self' 'nonce-{RANDOM}' 'strict-dynamic' [unsafe-eval on wallet routes only];
style-src   'self' 'unsafe-inline' https://fonts.googleapis.com;
img-src     'self' blob: data: https://*.clerk.com https://*.walletconnect.com ...;
connect-src 'self' wss://*.reown.com https://*.walletconnect.com https://*.alchemy.com ...;
frame-src   'self' https://verify.walletconnect.com https://verify.reown.com ...;
object-src  'none';
base-uri    'self';
form-action 'self';
upgrade-insecure-requests;
```

### `unsafe-eval` Scope

`unsafe-eval` is required by AppKit and WalletConnect for WebAssembly evaluation. It is **scoped only to wallet-related routes** (`/` and `/api/wallet/*`). All other routes — dashboard, API, admin — run with `unsafe-eval` removed, providing full XSS resistance via CSP.

---

## HTTP Security Headers

| Header | Value | Purpose |
|---|---|---|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Force HTTPS for 2 years |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-Frame-Options` | `SAMEORIGIN` | Prevent clickjacking (SAMEORIGIN for AppKit modal frames) |
| `X-XSS-Protection` | `1; mode=block` | Legacy XSS filter for older browsers |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limit referrer data leakage |
| `Permissions-Policy` | `camera=(self), microphone=(), geolocation=(), payment=(self)` | Restrict browser API access |
| `X-Nonce` | `{random}` | Forwards CSP nonce to SSR layer |
| `X-Robots-Tag` | `noindex, nofollow` | Only on protected + API routes |

---

## Cryptographic Vault

See [Sovereign Identity → Layer 3](./sovereign-identity.md#layer-3--vault-encryption-aes-gcm-256--pbkdf2) for the complete vault encryption specification.

### Key Security Properties

- **Key non-exportability:** `extractable: false` is set on all derived CryptoKey objects. The key cannot be serialized or extracted from the Web Crypto context.
- **Forward secrecy:** Each encryption generates a fresh random salt. Compromise of one encrypted blob does not weaken others.
- **Authentication:** AES-GCM's 128-bit GHASH tag detects any ciphertext tampering before decryption.
- **Work factor:** 210,000 PBKDF2 iterations per OWASP 2024 guidelines — approximately 21× more expensive than the previous 10,000-iteration standard.

---

## Threat Model — What We Protect Against

| Threat | Defense |
|---|---|
| Automated vulnerability scanning | WAF bot UA fingerprinting + honeypot routes |
| SQL injection | WAF injection pattern detection + Prisma parameterized queries |
| XSS | Nonce-based CSP + `X-XSS-Protection` |
| Clickjacking | `X-Frame-Options: SAMEORIGIN` |
| CSRF | `SameSite=Strict` cookies + form-action CSP |
| KYC bypass via token forgery | JWT secret in env-only var, no fallback possible |
| Credential stuffing | Rate limiting on auth routes (20 req/min) + Clerk bot protection |
| API key abuse | Redis daily quota + per-endpoint WAF limits |
| Vault data exfiltration | Client-side AES-GCM encryption, plaintext never leaves browser |
| Man-in-the-middle | HSTS preload + certificate pinning (recommended for mobile) |
| Geolocation bypass via VPN | Country header from both Vercel (`x-vercel-ip-country`) and Cloudflare (`cf-ipcountry`) |

---

## Incident Response

If you discover a security vulnerability, report it privately to:

- **Security channel:** Available to verified ELITE plan holders via the dashboard
- **X / Twitter:** [@whalecosystem](https://x.com/whalecosystem) (DMs open for security reports)

We follow a 90-day responsible disclosure policy. Critical vulnerabilities are patched within 24 hours of confirmed report.
