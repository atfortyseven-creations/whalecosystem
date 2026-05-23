export type PrivacyArchitectureSection = {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
  diagram?: { chart: string; caption: string };
  callout?: { title: string; body: string; href?: string; hrefLabel?: string };
};

export const PRIVACY_ARCHITECTURE_SECTIONS: PrivacyArchitectureSection[] = [
  {
    id: 'overview',
    title: 'What this page explains',
    paragraphs: [
      'Humanity Ledger (Whale Alert Network) is a wallet-connected web app: you sign in with an Ethereum address, use a dashboard for on-chain analytics, and can chat with other users over encrypted messaging. Private balances and transfers on Aztec are a separate layer on top of public Ethereum activity.',
      'This guide walks through how each part connects—on your phone, in the browser, and on our servers—so you can see what stays on your device and what we actually store.',
    ],
    bullets: [
      'No passwords or email required for core access—your wallet address is your identity.',
      'Sessions are short-lived signed tokens in HTTP-only cookies, plus a readable cookie so the UI knows you are linked.',
      'Direct messages use XMTP end-to-end encryption; we do not hold decryption keys for chat.',
    ],
    callout: {
      title: 'Legal privacy policy',
      body: 'For data retention, cookies, and regulatory wording, see the formal Privacy Policy.',
      href: '/legal/privacy',
      hrefLabel: 'Legal privacy policy',
    },
  },
  {
    id: 'wallet-connect',
    title: 'Connecting your wallet',
    paragraphs: [
      'You can use the app on a phone (iOS or Android, including installed as a home-screen PWA) or on a desktop browser. The connect flow is the same idea everywhere: pick a wallet, approve the connection in the wallet app or extension, then the site registers your address with our API.',
      'On mobile, WalletConnect / Reown AppKit opens your wallet app (MetaMask, Coinbase Wallet, Rainbow, etc.). When you return to the browser tab, Wagmi restores the connection from local storage and we call the verify endpoint with your address.',
      'On desktop at /connect, you can use a browser extension directly, or open the mobile wallet list if you prefer phone-based signing. Extension users go straight to session verification after connect; QR mode is described in the cross-device section below.',
    ],
    diagram: {
      caption: 'Wallet connect and session registration',
      chart: `flowchart TB
  subgraph mobile["Mobile browser or PWA"]
    M1["Open site"]
    M2["WalletConnect / AppKit"]
    M3["Wallet app approves"]
    M4["Address available in browser"]
  end
  subgraph desktop["Desktop at /connect"]
    D1["Extension wallet OR QR for phone"]
    D2["Wagmi connected address"]
  end
  subgraph api["Humanity Ledger API"]
    V["POST /api/auth/system-verify"]
    C["Session cookies set"]
  end
  M1 --> M2 --> M3 --> M4 --> V
  D1 --> D2 --> V
  V --> C
  C --> App["Dashboard and protected routes"]`,
    },
    bullets: [
      'MobileLanding and ConnectPage both call system-verify after a wallet address is known.',
      'If verify-session already returns authenticated, we skip a new registration (returning users).',
      'Signing a custom message is optional in the current build; trust is placed on the connected wallet address from Wagmi.',
    ],
  },
  {
    id: 'auth-cookies',
    title: 'Sessions, cookies, and API verification',
    paragraphs: [
      'After your address is accepted, the server mints a JSON Web Token (JWT) and stores it in secure cookies. Middleware and API routes read these cookies to decide if you can load the dashboard, forum, or admin tools.',
      'Three cookies work together: whale_session and human_session are HTTP-only (JavaScript cannot read them)—they carry the JWT. system_handshake is readable by JavaScript and holds your wallet address so the UI can show “linked” state without another round trip, including on iOS where back-navigation cache was causing re-login loops.',
      'The hook useSystemAccount resolves “who is logged in” in this order: local in-memory wallet (if unlocked), sessionStorage restore, Wagmi connection, then the handshake cookie. Protected pages use the same priority so QR-linked desktop users still see their address.',
    ],
    diagram: {
      caption: 'system-verify and cookie layout',
      chart: `sequenceDiagram
  participant Browser
  participant Verify as POST system-verify
  participant DB as User database
  participant MW as Middleware / APIs
  Browser->>Verify: wallet address JSON body
  Verify->>DB: upsert user by address
  Verify->>Browser: Set whale_session httpOnly JWT
  Verify->>Browser: Set human_session httpOnly JWT
  Verify->>Browser: Set system_handshake address readable
  Browser->>MW: Requests include cookies
  MW->>Browser: 200 if JWT valid else 401`,
    },
    bullets: [
      'verify-session checks human_session first for “already logged in” on page load.',
      'Cookies use SameSite=Lax, Secure in production, 7-day max age.',
      'Sign-out clears handshake, JWT cookies, Wagmi storage, and local session keys.',
    ],
  },
  {
    id: 'qr-sync',
    title: 'QR code: linking phone and desktop',
    paragraphs: [
      'When you are on a desktop at /connect, the page generates a QR code containing a one-time session id, an X25519 public key, and an expiry time (about five minutes). Your phone scans it with the universal scanner (session-only mode on /connect, or the wallet QR scanner elsewhere) or the connect flow scanner.',
      'The phone parses the QR, creates its own ephemeral key pair, and either encrypts an existing JWT with the shared secret or asks the server to mint one (qr-mobile-link). The payload is stored in Redis under the session id. The desktop polls /api/auth/qr-poll once per second until it receives the encrypted bundle or a server JWT.',
      'The desktop decrypts when possible, then calls /api/auth/qr-hydrate to write the same cookie set as a normal login. Optionally, an encrypted XMTP identity seed can sync so chat works on mobile without signing again. A separate qr-sync endpoint supports re-linking with a signed message RE-CONNECT-WHALE-SESSION-{token}.',
    ],
    diagram: {
      caption: 'Desktop ↔ mobile QR session bridge',
      chart: `sequenceDiagram
  participant Desktop as Desktop /connect
  participant QR as QR code
  participant Phone as Mobile scanner
  participant API as Auth APIs
  participant Redis as Short-lived store
  Desktop->>Desktop: X25519 keypair + uuid
  Desktop->>QR: Encode uuid pub exp
  Phone->>QR: Camera scan
  Phone->>Phone: Mobile keypair + shared secret
  Phone->>API: POST qr-mobile-link
  API->>Redis: Store JWT payload for uuid
  loop Every 1 second
    Desktop->>API: GET qr-poll
    API->>Redis: Read payload
    API->>Desktop: encrypted JWT or serverJwt
  end
  Desktop->>API: POST qr-hydrate
  API->>Desktop: whale_session human_session handshake`,
    },
  },
  {
    id: 'whale-chat',
    title: 'Whale Chat and XMTP',
    paragraphs: [
      'Whale Chat (SystemChat) sends direct messages through XMTP v5. When you first open chat, your wallet signs an install message; the XMTP client is cached in the browser per address. Messages are encrypted for the recipient’s inbox id; only participants can decrypt.',
      'Conversation lists, contact nicknames, block lists, and chat settings live in your browser’s localStorage—not on our servers. Exporting a chat downloads a plain-text file you trigger locally.',
      'A PIN gate (WhaleChatPINGate) can lock the chat UI; wiping XMTP deletes IndexedDB databases whose names contain “xmtp” on this device. QR sync can copy an encrypted seed from desktop to phone so both devices share the same XMTP identity after scanning.',
    ],
    diagram: {
      caption: 'XMTP message path (end-to-end encrypted)',
      chart: `flowchart LR
  subgraph you["Your browser"]
    W["Wallet signs XMTP install"]
    C["XMTP Client singleton"]
    IDB["IndexedDB message store"]
  end
  subgraph xmtp["XMTP network"]
    N["Encrypted envelopes"]
  end
  subgraph peer["Other user"]
    P["Their wallet + XMTP client"]
  end
  W --> C
  C --> N
  N --> P
  C --> IDB`,
    },
    bullets: [
      'Environment: NEXT_PUBLIC_XMTP_ENV (default production).',
      'Stealth privacy mode in chat only masks display in the UI—it does not change XMTP ciphertext.',
      'We do not operate a central chat database with message bodies.',
    ],
    callout: {
      title: 'Open chat',
      body: 'After linking your wallet, open Whale Chat from the dashboard or /chat.',
      href: '/chat',
      hrefLabel: 'Go to chat',
    },
  },
  {
    id: 'data-boundaries',
    title: 'What stays on your device vs our servers',
    paragraphs: [
      'We designed the product so sensitive material defaults to your machine. Wallet private keys and seed phrases never leave your wallet app or local vault unlock flow. ZK witnesses for Aztec actions are built with Barretenberg in the browser when you use those features.',
      'Our servers see your wallet address (for account rows), tier metadata, forum content you post, API usage, and short-lived QR bridge tokens in Redis (expiring in about a minute). Session JWTs prove identity but are not a copy of your on-chain portfolio.',
      'Analytics workers may process public chain data (mempool, blocks) in backend services—that is network-wide data, not a dump of your local vault. Telegram or alert features only see what you configure to send.',
    ],
    diagram: {
      caption: 'Data boundary overview',
      chart: `flowchart TB
  subgraph device["On your device"]
    KEYS["Wallet keys / local vault unlock"]
    XMTP["XMTP IndexedDB"]
    CHAT["Chat contacts blocks settings"]
    ZK["ZK proof inputs Barretenberg"]
    WC["WalletConnect session storage"]
  end
  subgraph server["Humanity Ledger servers"]
    USER["User row address tier activity"]
    SESS["JWT session cookies"]
    POSTS["Forum and API content you submit"]
    QRSTORE["QR bridge tokens Redis TTL"]
  end
  subgraph notstored["Not stored by us"]
    N1["Private keys or seed phrases"]
    N2["Decrypted XMTP message archive"]
    N3["Your local portfolio vault ciphertext"]
  end`,
    },
  },
  {
    id: 'product-scan',
    title: 'Product labels and universal scan',
    paragraphs: [
      'On mobile, Scan label opens a universal camera that reads more than desktop session QRs. The same scanner can link your phone to the desktop session, open a wallet address in Whale Chat, show a product passport page, or resolve a GS1 Digital Link when we have a matching record.',
      'After you connect your wallet on mobile, Try Studio Provenance Beta opens the same Provenance Studio flow as desktop: create a passport, export a QR label, and optionally anchor on chain.',
      'Product passports are public read records stored in our database. Issuers create them in Provenance Studio (wallet required). Optional on-chain anchoring reuses Core Ledger transferWithReceipt with memo PASSPORT:{slug} and stores the Core Entropy value plus transaction hash on the passport.',
      'Passport pages work without a wallet—anyone with the link or QR can view published fields (origin, batch, certifications, carbon figures). Private selective disclosure via Aztec is planned for a later phase; today’s passports are explicitly public.',
    ],
    diagram: {
      caption: 'Universal mobile scan router',
      chart: `flowchart TD
  cam[Mobile camera or gallery]
  router[Scan router]
  session[Desktop session QR]
  wallet[Wallet address QR]
  passport[humanidfi.com/passport slug]
  gs1[GS1 Digital Link]
  cam --> router
  router --> session
  router --> wallet
  router --> passport
  router --> gs1
  session --> link[POST qr-mobile-link]
  wallet --> chat[Whale Chat peer]
  passport --> view[Passport page]
  gs1 --> resolve[GET api passport resolve]
  resolve --> view`,
    },
    bullets: [
      'Open QR Scanner on the connected mobile screen still prioritises desktop session codes.',
      'Scan label accepts product URLs, GS1 links, wallet codes, and session QRs in one flow.',
      'Try Studio Provenance Beta on the connected mobile home screen links to /studio/provenance.',
      'Unknown codes show a plain error with a link back to this section.',
    ],
    callout: {
      title: 'Create a passport',
      body: 'Desktop users with a linked wallet can open Provenance Studio to publish a label and export a QR.',
      href: '/studio/provenance',
      hrefLabel: 'Provenance Studio',
    },
  },
  {
    id: 'aztec-private',
    title: 'Aztec private state (high level)',
    paragraphs: [
      'Public Ethereum shows every transfer to everyone. Aztec adds a private execution layer: balances and transfers can live as encrypted “notes” in a shielded pool, while the chain only sees that a valid zero-knowledge proof was submitted.',
      'Humanity Ledger uses Noir to describe rules (for example, token transfers or membership checks) and Barretenberg (@aztec/bb.js) to generate proofs in your browser. The rollup verifies proofs in batches and posts a compact commitment to Ethereum L1 for security.',
      'You can think of it as: you prove “this transaction follows the rules” without publishing the amounts or counterparty on a public ledger. Shielding moves assets into the private pool; unshielding moves them back to public ERC-20 when you choose.',
    ],
    diagram: {
      caption: 'Client-side proving to Aztec and Ethereum',
      chart: `flowchart LR
  subgraph client["Your browser"]
    WIT["Build witness from your keys"]
    PROV["Barretenberg proof"]
  end
  subgraph aztec["Aztec rollup"]
    VER["Verify proof batch"]
    STATE["Private state tree updates"]
  end
  subgraph l1["Ethereum L1"]
    ROOT["Anchored state root"]
  end
  WIT --> PROV
  PROV -->|"proof only"| VER
  VER --> STATE
  STATE --> ROOT`,
    },
    bullets: [
      'Private notes use commitments and nullifiers so each note is spent once without revealing which note.',
      'QDs and other protocol tokens follow the same shielded transfer model described in the whitepaper.',
      'Selective disclosure lets you prove a fact (for example eligibility) without exporting your full history.',
    ],
    callout: {
      title: 'Technical depth',
      body: 'For circuit design, tokenomics, and security audits, read the whitepaper and security pages.',
      href: '/whitepaper',
      hrefLabel: 'Whitepaper',
    },
  },
];

export const PRIVACY_TOC = PRIVACY_ARCHITECTURE_SECTIONS.map((s) => ({
  id: s.id,
  label: s.title,
}));
