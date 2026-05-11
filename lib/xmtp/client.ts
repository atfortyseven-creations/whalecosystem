/**
 * XMTP E2E Encrypted Chat Client
 * ═══════════════════════════════════════════════════════════════════════════════
 * Wraps @xmtp/browser-sdk v5 for sovereign wallet-to-wallet encrypted messaging.
 *
 * @xmtp/browser-sdk v5 Signer contract (mandatory shape):
 *   type          : "EOA" | "SCW"
 *   getIdentifier : () => Promise<Identifier>
 *                   where Identifier = { identifier: string; identifierKind: IdentifierKind }
 *                   and   IdentifierKind = "Ethereum" (string literal union)
 *   signMessage   : (msg: string | Uint8Array) => Promise<Uint8Array>
 *
 * Critical: identifierKind MUST be the exact string "Ethereum" (not a variable
 * that happens to hold it), as the SDK performs strict equality checks internally.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use client';

import { Buffer } from 'buffer';

if (typeof window !== 'undefined' && !window.Buffer) {
  (window as any).Buffer = Buffer;
}

import { Client, type XmtpEnv } from '@xmtp/browser-sdk';

// ── Type definitions matching browser-sdk v5.2 exactly ───────────────────────
type IdentifierKind = 'Ethereum';
interface XmtpIdentifier {
  identifier: string;
  identifierKind: IdentifierKind;
}

const XMTP_ENV: XmtpEnv =
  (process.env.NEXT_PUBLIC_XMTP_ENV as XmtpEnv) ?? 'production';

// ── Singleton client registry (one client per lowercase address) ──────────────
const clientRegistry = new Map<string, Client>();

// ── Hex string → Uint8Array ───────────────────────────────────────────────────
function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  if (clean.length % 2 !== 0) throw new Error('[XMTP] Malformed hex signature');
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * Build an XMTP v5-compatible signer from a wagmi/viem EOA wallet client.
 *
 * The returned object satisfies the browser-sdk v5 Signer interface exactly:
 *  - `type`          → "EOA" literal
 *  - `getIdentifier` → returns { identifier: checksumAddress, identifierKind: "Ethereum" }
 *  - `signMessage`   → accepts string | Uint8Array, returns raw Uint8Array (not hex)
 */
function buildXmtpSigner(wagmiSigner: {
  getAddress: () => Promise<string>;
  signMessage: (message: string | Uint8Array) => Promise<string>;
}) {
  return {
    type: 'EOA' as const,

    // ── CRITICAL: getIdentifier must be a function returning the exact shape ──
    getIdentifier: async (): Promise<XmtpIdentifier> => {
      const address = await wagmiSigner.getAddress();
      return {
        identifier: address,
        identifierKind: 'Ethereum' as IdentifierKind,
      };
    },

    // ── signMessage receives string | Uint8Array; must return Uint8Array ──────
    signMessage: async (message: string | Uint8Array): Promise<Uint8Array> => {
      const hexSig = await wagmiSigner.signMessage(message);
      return hexToBytes(hexSig);
    },
  };
}

/**
 * Initialize or retrieve a cached XMTP client for a wallet address.
 * If a client for this address already exists in the registry (IndexedDB-backed),
 * it is returned immediately without re-prompting the user to sign.
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

  // Client.create accepts the signer directly; env is passed as a ClientOptions field
  const client = await Client.create(signer, { env: XMTP_ENV });

  clientRegistry.set(address, client);
  return client;
}

/** Remove a client from the registry (call on wallet disconnect) */
export function destroyXMTPClient(address: string): void {
  clientRegistry.delete(address.toLowerCase());
}

/**
 * Check if a given Ethereum address has an active XMTP identity.
 * Uses the static Client.canMessage() method which requires no client instance.
 */
export async function canReceiveMessages(
  _client: Client,
  address: string,
): Promise<boolean> {
  try {
    const identifier: XmtpIdentifier = {
      identifier: address,
      identifierKind: 'Ethereum',
    };

    // canMessage returns Map<string, boolean> keyed by lowercase address
    const result = await (Client as any).canMessage([identifier], XMTP_ENV);

    if (result instanceof Map) {
      return result.get(address.toLowerCase()) ?? result.get(address) ?? false;
    }

    // Fallback: plain object response
    if (result && typeof result === 'object') {
      return (
        result[address.toLowerCase()] ??
        result[address] ??
        false
      );
    }

    return false;
  } catch (err) {
    console.warn('[XMTP] canReceiveMessages error:', err);
    return false;
  }
}

/**
 * Send an end-to-end encrypted message to a wallet address.
 * Uses newDm() (v5 API) with fallback to newConversation() for edge builds.
 */
export async function sendMessage(
  client: Client,
  toAddress: string,
  content: string,
): Promise<void> {
  const identifier: XmtpIdentifier = {
    identifier: toAddress,
    identifierKind: 'Ethereum',
  };
  const convos = client.conversations as any;
  const dm =
    typeof convos.newDm === 'function'
      ? await convos.newDm(identifier)
      : await convos.newConversation(toAddress);
  await dm.send(content);
}

/** List all conversations for the current identity */
export async function listConversations(client: Client) {
  return client.conversations.list();
}

/** Async generator streaming all incoming messages in real time */
export async function* streamMessages(client: Client) {
  for await (const message of await client.conversations.streamAllMessages()) {
    yield message;
  }
}

/**
 * Retrieve the message history for a specific peer conversation.
 * Creates the DM if it does not yet exist (XMTP DMs are idempotent).
 */
export async function getMessages(client: Client, peerAddress: string) {
  const identifier: XmtpIdentifier = {
    identifier: peerAddress,
    identifierKind: 'Ethereum',
  };
  const convos = client.conversations as any;
  const dm =
    typeof convos.newDm === 'function'
      ? await convos.newDm(identifier)
      : await convos.newConversation(peerAddress);
  return dm.messages();
}
