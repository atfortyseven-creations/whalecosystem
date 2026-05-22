# Whale Identity Protocol

Whale Alert Network does not store passwords, email addresses, or any personally identifiable information linked to on-chain identities. Authentication is entirely cryptographic, built on three interlocking layers of the **Whale Security Mesh**.

---

## Layer 1  Wallet Connection (EIP-6963 + WalletConnect)

The entry point is a standard Web3 wallet connection. The platform supports every EIP-6963-compatible browser extension and any WalletConnect v2-compatible mobile wallet.

### Supported Wallets

**Browser extensions (EIP-6963 auto-detected):**
- MetaMask
- Coinbase Wallet
- Rainbow
- Brave Wallet
- Frame
- Any wallet that injects `window.ethereum` with EIP-6963 provider announcement

**Mobile (WalletConnect QR / deep-link):**
- MetaMask Mobile
- Trust Wallet
- Coinbase Wallet Mobile
- Rainbow Mobile
- Phantom
- Any WalletConnect v2 wallet

### Connection Flow

```
User clicks "CONNECT WALLET"
        
        
EIP-6963 detection: is a wallet extension present?
        
   YES    NO
            WalletPickerModal opens
                   User selects wallet
                        WalletConnect QR generated
                             Deep-link to mobile wallet
        
wagmi `connect()` called with matched connector
        
        
Wallet returns: connected address + chain ID
        
        
Session state written to cookie-based wagmi storage (SSR-safe)
```

---

## Layer 2  Whale Handshake (EIP-191)

After connecting a wallet, sensitive actions (vault access, QR synchronization, trading route entry) require a **Whale signature**  not a transaction. This proves ownership of the address without any gas cost and without broadcasting anything to the blockchain.

### Message Signed

```
Allow Access to Whale Vault
```

This is a static, human-readable message. No dynamic nonces are included in this message  the uniqueness guarantee is provided by the encryption salt (see Layer 3).

### Signature Verification

The signature is verified against the claimed address using ECDSA:

```
v · G = r · G + hash(message) · publicKey
```

Where:
- `G` = secp256k1 generator point
- `r, s` = signature components (standard ECDSA output)
- `hash` = keccak256 of the EIP-191 prefixed message

In code, this is performed by `ethers.verifyMessage(message, signature)` which returns the recovered address. If it matches the connected wallet address, authentication succeeds.

### QR Synchronization (Desktop-to-Mobile)

For the desktop-to-mobile QR sync flow (connecting a mobile wallet to a desktop terminal session):

1. Desktop generates a UUID session token and encodes it as `WHALE_HANDSHAKE:{token}` in a QR code
2. Mobile scans the QR via the built-in camera scanner (`Html5Qrcode`)
3. Mobile POSTs `{ token, address }` to `/api/auth/qr-sync`
4. Server validates the token against Redis and sets the `whale_handshake` session cookie
5. Desktop terminal detects the cookie and elevates the session

---

## Layer 3  Whale Vault Encryption (AES-GCM-256 + PBKDF2)

Sensitive user data (portfolio snapshots, private notes, trading configurations) is encrypted client-side before leaving the browser. The server never receives the plaintext.

### Key Derivation

```typescript
key = PBKDF2(
  password: walletSignature,   // EIP-191 signature (64 bytes)
  salt:     randomBytes(16),   // Fresh 128-bit random salt per encryption call
  iterations: 210_000,         // OWASP 2024 minimum for PBKDF2-SHA256
  hash:     'SHA-256',
  keyLength: 256               // AES-256
)
```

The **210,000 iterations** mean that brute-forcing the key requires approximately 210,000 SHA-256 operations per guess.

### Encryption

```typescript
encryptedData = AES-GCM-256(
  plaintext: JSON.stringify(data),
  key:       derived_key,
  iv:        randomBytes(12)   // 96-bit random IV per encryption call
)
```

AES-GCM provides both **confidentiality** (encryption) and **authenticity** (GHASH authentication tag).

### Storage Format

The encrypted vault stores three components alongside the ciphertext:

| Field | Size | Purpose |
|---|---|---|
| `encryptedData` | Variable | AES-GCM ciphertext + 128-bit auth tag |
| `iv` | 12 bytes | Initialization vector |
| `salt` | 16 bytes | PBKDF2 salt |

The wallet signature is **never stored**  the user must sign again to decrypt. This means even full server compromise cannot decrypt vault contents.

---

## Layer 4  KYC JWT (Regulated Routes)

Access to trading routes (`/trade/*`) requires a KYC approval token in addition to wallet authentication.

### Token Structure

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "walletAddress": "0xAbC...1234",
    "status": "APPROVED",
    "verifiedAt": "2026-03-30T18:00:00Z",
    "expiresAt": "2026-06-30T18:00:00Z",
    "tier": "WHALE_PRO"
  }
}
```

### Verification

All KYC tokens are verified in the Edge middleware using `jose.jwtVerify()` with the deployment's `KYC_SECRET`.

---

## Session Architecture

The platform supports four concurrent authentication signals, any one of which establishes an authenticated session:

| Signal | Cookie Name | Source |
|---|---|---|
| Clerk managed session | `__session` | Clerk Auth |
| Whale handshake | `whale_handshake` | QR sync flow |
| NextAuth session | `next-auth.session-token` | NextAuth.js |
| Whale session | `whale_session` | Custom identity flow |

All cookies are `HttpOnly`, `Secure`, and `SameSite=Strict`.
