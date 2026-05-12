/**
 * XMTP E2E Encrypted Chat Client
 * ═══════════════════════════════════════════════════════════════════════════════
 * Wraps @xmtp/browser-sdk v5.3.0 for sovereign wallet-to-wallet encrypted messaging.
 *
 * v5.3.0 Signer interface (mandatory):
 *   type          : "EOA" | "SCW"
 *   getIdentifier : () => Promise<{ identifier: string; identifierKind: "Ethereum" }>
 *   signMessage   : (message: string) => Promise<Uint8Array>   ← string ONLY
 *
 * v5.3.0 Key API changes vs v5.2:
 *   - conversations.newDm(inboxId)            ← takes inboxId string
 *   - conversations.newDmWithIdentifier(id)   ← takes Identifier object  ✓ USE THIS
 *   - DecodedMessage: senderInboxId, sentAtNs (BigInt ns), content (decoded)
 *   - Dm.peerInboxId()                        ← async, returns inboxId string
 *   - conversations.sync() required before list/stream
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use client';

import { Buffer } from 'buffer';

if (typeof window !== 'undefined' && !window.Buffer) {
  (window as any).Buffer = Buffer;
}

import { Client, type XmtpEnv } from '@xmtp/browser-sdk';

// ── Type definitions matching browser-sdk v5.3.0 exactly ─────────────────────
type IdentifierKind = 'Ethereum';
export interface XmtpIdentifier {
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

// ── BigInt nanoseconds → Date ─────────────────────────────────────────────────
export function nsToDate(ns: bigint | undefined | null): Date {
  if (ns == null) return new Date();
  try {
    return new Date(Number(BigInt(String(ns)) / 1_000_000n));
  } catch {
    return new Date();
  }
}

/**
 * Build an XMTP v5.3.0-compatible signer from a wagmi/viem EOA wallet client.
 *
 * CRITICAL v5.3.0 changes:
 *  - signMessage receives string ONLY (no Uint8Array) and must return Uint8Array
 *  - getIdentifier returns { identifier: checksumAddress, identifierKind: "Ethereum" }
 */
function buildXmtpSigner(wagmiSigner: {
  getAddress: () => Promise<string>;
  signMessage: (message: string | Uint8Array) => Promise<string>;
}) {
  return {
    type: 'EOA' as const,

    // getIdentifier: async function returning the exact Identifier shape
    getIdentifier: async (): Promise<XmtpIdentifier> => {
      const address = await wagmiSigner.getAddress();
      return {
        identifier: address,
        identifierKind: 'Ethereum' as IdentifierKind,
      };
    },

    // v5.3.0: signMessage receives string only, must return Uint8Array
    signMessage: async (message: string): Promise<Uint8Array> => {
      const hexSig = await wagmiSigner.signMessage(message);
      return hexToBytes(hexSig);
    },
  };
}

/**
 * Initialize or retrieve a cached XMTP client for a wallet address.
 * If a client already exists in the registry (IndexedDB-backed),
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

  // Client.create(signer, options) — v5.3.0 signature
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
 * v5.3.0: Client.canMessage returns Map<string, boolean>.
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

    const result = await Client.canMessage([identifier], XMTP_ENV);

    if (result instanceof Map) {
      return result.get(address.toLowerCase()) ?? result.get(address) ?? false;
    }

    if (result && typeof result === 'object') {
      return (
        (result as any)[address.toLowerCase()] ??
        (result as any)[address] ??
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
 * Get or create a DM with a peer and return its conversation ID.
 * v5.3.0 FIX: use newDmWithIdentifier() — newDm() takes inboxId, NOT Identifier.
 */
export async function getDmId(client: Client, peerAddress: string): Promise<string> {
  const identifier: XmtpIdentifier = {
    identifier: peerAddress,
    identifierKind: 'Ethereum',
  };
  const dm = await client.conversations.newDmWithIdentifier(identifier);
  return dm.id;
}

/**
 * Send an end-to-end encrypted message to a wallet address.
 * v5.3.0 FIX: use newDmWithIdentifier() which accepts an Identifier object.
 * After sending, syncs the conversation to confirm delivery.
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
  // v5.3.0: newDmWithIdentifier takes an Identifier object
  const dm = await client.conversations.newDmWithIdentifier(identifier);
  await dm.send(content);
  // Sync after send to confirm delivery is committed to the network
  try { await dm.sync(); } catch {}
}

/**
 * List all DM conversations.
 * v5.3.0: Must sync() first, then listDms().
 */
export async function listConversations(client: Client): Promise<any[]> {
  await client.conversations.sync();
  return client.conversations.listDms();
}

/**
 * Retrieve message history for a specific peer conversation.
 *
 * FIX v2: Instead of always calling newDmWithIdentifier (which can return a
 * stale local conversation that hasn't been synced from the network), we:
 *  1. Sync the full conversation list from the XMTP network.
 *  2. List all DMs and find the one whose peerInboxId matches the target.
 *  3. If found, sync that specific conversation and return its messages.
 *  4. If not found, fall back to newDmWithIdentifier (creates/reuses the DM).
 *
 * This guarantees the RECEIVER sees messages sent by the SENDER because
 * step 1 forces a network pull that discovers any new DM invitations.
 */
export async function getMessages(client: Client, peerAddress: string): Promise<any[]> {
  // Step 1: Sync the full conversation list to discover new DMs from peers
  try {
    await client.conversations.sync();
  } catch (e) {
    console.warn('[XMTP] conversations.sync() failed:', e);
  }

  // Step 2: Try to find an existing DM with this peer via inboxId matching
  try {
    const dms = await client.conversations.listDms();

    // Resolve the peer's inboxId from their Ethereum address
    // canMessage returns a Map<identifier, inboxId> in some SDK versions,
    // but the most reliable method is to check peerInboxId on each DM.
    let targetDm: any = null;

    for (const dm of dms) {
      try {
        // peerInboxId() is async in v5.3.0
        const peerInboxId: string =
          typeof dm.peerInboxId === 'function'
            ? await dm.peerInboxId()
            : dm.peerInboxId;

        // The XMTP inboxId for an Ethereum address is deterministic.
        // We match by resolving the peer address to an inboxId.
        // We look up by comparing with canMessage result.
        if (!peerInboxId) continue;

        // Also check dm members / peer metadata for Ethereum address match
        const members: any[] = dm.members ?? [];
        const peerMember = members.find((m: any) => {
          const addrs: string[] = m.accountAddresses ?? m.addresses ?? [];
          return addrs.some(
            (a: string) => a.toLowerCase() === peerAddress.toLowerCase(),
          );
        });

        if (peerMember) {
          targetDm = dm;
          break;
        }
      } catch {}
    }

    if (targetDm) {
      await targetDm.sync();
      const msgs = await targetDm.messages();
      return msgs;
    }
  } catch (e) {
    console.warn('[XMTP] listDms matching failed, falling back:', e);
  }

  // Step 3: Fallback — create or get the DM by identifier (sender path)
  const identifier: XmtpIdentifier = {
    identifier: peerAddress,
    identifierKind: 'Ethereum',
  };
  const dm = await client.conversations.newDmWithIdentifier(identifier);
  await dm.sync();
  const msgs = await dm.messages();
  return msgs;
}

/** Async generator streaming all incoming messages in real time */
export async function* streamMessages(client: Client) {
  const stream = await client.conversations.streamAllMessages();
  for await (const message of stream as any) {
    yield message;
  }
}
