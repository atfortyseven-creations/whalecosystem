/**
 * XMTP E2E Chat Client
 * ═══════════════════════════════════════════════════════════════
 * Wraps @xmtp/browser-sdk v5 for encrypted wallet-to-wallet messaging.
 *
 * browser-sdk v5 Signer contract:
 *   type          : "EOA" | "SCW"
 *   getIdentifier : () => Promise<{ identifier: string; identifierKind: "Ethereum" }>
 *   signMessage   : (msg: string | Uint8Array) => Promise<Uint8Array>
 * ═══════════════════════════════════════════════════════════════
 */

'use client';

import { Buffer } from 'buffer';

if (typeof window !== 'undefined' && !window.Buffer) {
  window.Buffer = Buffer;
}

import { Client, type XmtpEnv, type Identifier } from '@xmtp/browser-sdk';

const XMTP_ENV: XmtpEnv = (process.env.NEXT_PUBLIC_XMTP_ENV as XmtpEnv) ?? 'production';

// ── Singleton client registry (one client per wallet) ─────────────────────────
const clientRegistry = new Map<string, Client>();

// ── Hex → Uint8Array helper ───────────────────────────────────────────────────
function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * Build an XMTP v5-compatible signer from a wagmi/viem EOA wallet.
 *
 * Key differences from browser-sdk v2:
 *  - Must declare `type: "EOA"`
 *  - `getIdentifier()` replaces `getAddress()`
 *  - `signMessage()` receives `string | Uint8Array` and must return `Uint8Array`
 */
function buildXmtpSigner(wagmiSigner: {
  getAddress: () => Promise<string>;
  signMessage: (message: string | Uint8Array) => Promise<string>;
}) {
  return {
    type: 'EOA' as const,

    getIdentifier: async (): Promise<Identifier> => {
      const address = await wagmiSigner.getAddress();
      return { identifier: address, identifierKind: 'Ethereum' };
    },

    // SDK v5 passes string | Uint8Array and expects raw Uint8Array back
    signMessage: async (message: string | Uint8Array): Promise<Uint8Array> => {
      const hexSig = await wagmiSigner.signMessage(message);
      return hexToBytes(hexSig);
    },
  };
}

/**
 * Initialize or retrieve a cached XMTP client for a wallet.
 */
export async function getXMTPClient(wagmiSigner: {
  getAddress: () => Promise<string>;
  signMessage: (message: string | Uint8Array) => Promise<string>;
}): Promise<Client> {
  const address = (await wagmiSigner.getAddress()).toLowerCase();

  if (clientRegistry.has(address)) {
    return clientRegistry.get(address)!;
  }

  const signer = buildXmtpSigner(wagmiSigner);
  const client = await Client.create(signer, { env: XMTP_ENV });
  clientRegistry.set(address, client);
  return client;
}

/** Destroy client (on wallet disconnect) */
export function destroyXMTPClient(address: string): void {
  clientRegistry.delete(address.toLowerCase());
}

/** Check if an address can receive XMTP messages */
export async function canReceiveMessages(
  _client: Client,
  address: string,
): Promise<boolean> {
  try {
    const identifier: Identifier = { identifier: address, identifierKind: 'Ethereum' };
    const res = await Client.canMessage([identifier], XMTP_ENV) as unknown as Map<string, boolean>;
    return res.get(address.toLowerCase()) ?? res.get(address) ?? false;
  } catch {
    return false;
  }
}

/** Send an E2E encrypted message to a wallet address */
export async function sendMessage(
  client:    Client,
  toAddress: string,
  content:   string,
): Promise<void> {
  const identifier: Identifier = { identifier: toAddress, identifierKind: 'Ethereum' };
  // v5 uses newDm(); graceful fallback for edge builds
  const dm = typeof (client.conversations as any).newDm === 'function'
    ? await (client.conversations as any).newDm(identifier)
    : await (client.conversations as any).newConversation(toAddress);
  await dm.send(content);
}

/** List all conversations for the wallet */
export async function listConversations(client: Client) {
  return client.conversations.list();
}

/** Stream all incoming messages in real-time */
export async function* streamMessages(client: Client) {
  for await (const message of await client.conversations.streamAllMessages()) {
    yield message;
  }
}

/** Get messages from a specific conversation */
export async function getMessages(client: Client, peerAddress: string) {
  const identifier: Identifier = { identifier: peerAddress, identifierKind: 'Ethereum' };
  const dm = typeof (client.conversations as any).newDm === 'function'
    ? await (client.conversations as any).newDm(identifier)
    : await (client.conversations as any).newConversation(peerAddress);
  return dm.messages();
}
