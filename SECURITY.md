# Security Policy

## Proprietary Software — Security Vulnerability Disclosure

**Whale Alert Network — Institutional On-Chain Intelligence Terminal**  
© 2024–2026 atfortyseven-creations. All Rights Reserved.

---

## ⚠️ IMPORTANT LEGAL NOTICE

This is **proprietary software**. Unauthorized access, penetration testing,
vulnerability scanning, reverse engineering, or any security research on
this system **without prior written authorization** from atfortyseven-creations
is **strictly prohibited** and constitutes:

- Unauthorized Computer Access under applicable law (CFAA, Computer Misuse Act, etc.)
- A violation of this software's proprietary license
- Potential criminal conduct subject to prosecution

---

## Responsible Disclosure Policy

If you have discovered a genuine security vulnerability in our platform, we
encourage responsible disclosure. We will **never pursue legal action** against
researchers who follow this policy in good faith.

### How to Report

**Contact:** legal@humanidfi.com  
**Subject Line:** `[SECURITY] Vulnerability Report — Whale Alert Network`

### What to Include

- Type and severity of the vulnerability
- Affected component and URL/endpoint
- Step-by-step reproduction instructions
- Potential impact assessment
- Your contact information (for coordination)

### Our Commitments

- We will acknowledge your report within **72 hours**
- We will investigate and provide a status update within **14 days**
- We will credit researchers who responsibly disclose (if desired)
- We will not pursue legal action for good-faith research under this policy

### Out of Scope

The following are **explicitly excluded** from this policy and will be treated
as unauthorized access:

- Automated vulnerability scanning without prior authorization
- Denial of service (DoS/DDoS) testing
- Social engineering attacks against team members
- Physical security attacks
- Testing on behalf of a third party or competitor
- Any action that accesses, modifies, or deletes user data

---

## Supported Versions

| Version | Supported |
|---------|-----------|
| Current Production | ✅ Active |
| All Previous | ❌ Not Supported |

---

## Security Architecture

This platform implements multiple layers of security by design:

- **SIWE Authentication**: Sign-In with Ethereum — zero password, pure cryptographic identity
- **Sovereign Handshake Cookie**: HttpOnly-bound session tokens
- **Zero-Custody Architecture**: Private keys never leave the user's wallet
- **ECDSA Signature Verification**: On-chain identity verification
- **Database**: Ful parameterized queries via Prisma ORM — zero SQL injection surface
- **API Rate Limiting**: All endpoints are protected against enumeration
- **No Third-Party Auth**: No Clerk, Auth0, or Firebase — reduces third-party attack surface

---

*© 2024–2026 atfortyseven-creations — Proprietary & Confidential*
