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
      let address = await wagmiSigner.getAddress();
      try {
        const { getAddress } = await import('viem');
        address = getAddress(address);
      } catch {}
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
 *
 * OPTIMIZATION: If a deterministic seed is provided, a StaticSigner is used
 * which handles all signatures internally, requiring ZERO wallet interaction.
 */
export async function getXMTPClient(
  wagmiSigner: {
    getAddress: () => Promise<string>;
    signMessage: (message: string | Uint8Array) => Promise<string>;
  },
  seed?: string
): Promise<Client> {
  const address = (await wagmiSigner.getAddress()).toLowerCase();

  if (clientRegistry.has(address)) {
    return clientRegistry.get(address)!;
  }

  let signer;
  if (seed) {
    // ── Use Deterministic Static Signer ──────────────────────────────────────
    // This signer uses a derived private key to sign XMTP requests silently.
    signer = buildDeterministicSigner(address, seed);
  } else {
    // ── Use Standard Wallet Signer ───────────────────────────────────────────
    signer = buildXmtpSigner(wagmiSigner);
  }

  // Client.create(signer, options) — v5.3.0 signature
  const client = await Client.create(signer, { env: XMTP_ENV });

  clientRegistry.set(address, client);
  return client;
}

/**
 * Build a deterministic XMTP signer from a seed (hex string).
 * Allows silent re-authentication without wallet prompts.
 */
function buildDeterministicSigner(address: string, seed: string) {
  // We use the seed directly as a private key for the XMTP identity.
  // Note: We use a dynamic import for 'ethers' or 'viem' to keep the bundle lean if possible.
  // Since we already have viem-like logic in the project, we'll use a simple implementation.
  return {
    type: 'EOA' as const,
    getIdentifier: async (): Promise<XmtpIdentifier> => {
      let normAddr = address;
      try {
        const { getAddress } = await import('viem');
        normAddr = getAddress(address);
      } catch {}
      return {
        identifier: normAddr,
        identifierKind: 'Ethereum',
      };
    },
    signMessage: async (message: string): Promise<Uint8Array> => {
      // In a real implementation, we would use the private key to sign.
      // For now, we'll implement a simple signer using the provided seed.
      // Since XMTP v3 is highly specific about its signatures, we'll use 
      // the wagmiSigner for the VERY FIRST TIME to get the seed, then
      // we need a way to sign without it.
      
      // IMPLEMENTATION DETAIL: To sign without a wallet, we need a library.
      // We'll use the 'viem' account if available.
      try {
        const { privateKeyToAccount } = await import('viem/accounts');
        const account = privateKeyToAccount(seed as `0x${string}`);
        const sig = await account.signMessage({ message });
        return hexToBytes(sig);
      } catch (e) {
        console.error('[XMTP] Deterministic sign failed:', e);
        throw e;
      }
    },
  };
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
 * FIX v3 — Dual-perspective DM discovery:
 *  The core problem: XMTP DMs are asymmetric at creation time.
 *  - SENDER calls newDmWithIdentifier(peer) → creates a DM object locally.
 *  - RECEIVER never created that DM locally — they need conversations.sync()
 *    to pull it from the network, then listDms() to find it by member address.
 *
 * Strategy (in order of reliability):
 *  1. conversations.sync() — pulls ALL new DMs from the p2p network (critical for receiver)
 *  2. listDms() → find by peer Ethereum address in dm.members[] — works for both parties
 *  3. listDms() → find by peerInboxId() — slower but covers edge cases
 *  4. newDmWithIdentifier() fallback — creates/reuses via identifier (sender path)
 *
 * Each found DM is individually sync()d before messages() to guarantee
 * the latest messages are returned, not a stale local snapshot.
 */
export async function getMessages(client: Client, peerAddress: string): Promise<any[]> {
  const normalizedPeer = peerAddress.toLowerCase();

  // ── Step 1: Global sync — CRITICAL for receiver discovery ────────────────
  // Without this, the receiver's client never knows about DMs created by the sender.
  try {
    await client.conversations.sync();
  } catch (e) {
    console.warn('[XMTP] conversations.sync() failed:', e);
  }

  // ── Step 2: Search by Ethereum address in dm.members (fastest, most reliable) ──
  try {
    const dms = await client.conversations.listDms();
    let targetDm: any = null;

    for (const dm of dms) {
      try {
        // v5.3.0: dm.members can be a function or a property depending on the specific implementation/version
        const rawMembers = (dm as any).members;
        const members: any[] = typeof rawMembers === 'function' ? await rawMembers() : (rawMembers ?? []);
        
        const hasPeer = members.some((m: any) => {
          const addrs: string[] = m.accountAddresses ?? m.addresses ?? [];
          return addrs.some((a: string) => a.toLowerCase() === normalizedPeer);
        });
        if (hasPeer) {
          targetDm = dm;
          break;
        }
      } catch {}
    }

    if (targetDm) {
      // Individual DM sync — pulls latest messages for this specific conversation
      try { await targetDm.sync(); } catch {}
      const msgs = await targetDm.messages();
      return msgs ?? [];
    }
  } catch (e) {
    console.warn('[XMTP] Member-address DM search failed:', e);
  }

  // ── Step 3: Search by peerInboxId() — covers identity-key-only DMs ─────────
  try {
    const dms = await client.conversations.listDms();

    for (const dm of dms) {
      try {
        const rawPeerInboxId = (dm as any).peerInboxId;
        const peerInboxId: string = await (typeof rawPeerInboxId === 'function'
          ? rawPeerInboxId()
          : (rawPeerInboxId ?? ''));

        if (!peerInboxId) continue;

        // Cross-reference: resolve peer address → inboxId via canMessage
        const identifier: XmtpIdentifier = {
          identifier: peerAddress,
          identifierKind: 'Ethereum',
        };
        // v5.3.0: Use getInboxIdForAddress for reliable resolution
        let resolvedInboxId: string | null = null;
        // v5.3.0: In some versions, it's on the client, in others it's getInboxIdByAddress
        try {
          resolvedInboxId = await (client as any).getInboxIdForAddress?.(peerAddress) ?? 
                            await (client as any).getInboxIdByAddress?.(peerAddress);
        } catch {
          // Fallback to canMessage check if specific inbox methods fail
          const result = await Client.canMessage([identifier], XMTP_ENV);
          if (result instanceof Map) {
            const entry = Array.from(result.entries()).find(([k]) => k.toLowerCase() === normalizedPeer);
            // If canMessage returns a boolean, we can't use it as an inboxId.
            // But if it returns the inboxId in some versions, we handle it.
            if (entry && typeof entry[1] === 'string') resolvedInboxId = entry[1];
          }
        }

        if (resolvedInboxId && peerInboxId.toLowerCase() === resolvedInboxId.toLowerCase()) {
          try { await dm.sync(); } catch {}
          const msgs = await dm.messages();
          return msgs ?? [];
        }
      } catch {}
    }
  } catch (e) {
    console.warn('[XMTP] peerInboxId DM search failed:', e);
  }

  // ── Step 4: Fallback — newDmWithIdentifier (creates/reuses, sender path) ────
  try {
    const identifier: XmtpIdentifier = {
      identifier: peerAddress,
      identifierKind: 'Ethereum',
    };
    const dm = await client.conversations.newDmWithIdentifier(identifier);
    try { await dm.sync(); } catch {}
    const msgs = await dm.messages();
    return msgs ?? [];
  } catch (e) {
    console.warn('[XMTP] newDmWithIdentifier fallback failed:', e);
    return [];
  }
}

/**
 * Discover all DMs from the network and return new peer addresses
 * not yet present in the known set. Used by WhaleChat global sync loop.
 */
export async function discoverNewPeers(
  client: Client,
  selfAddress: string,
  knownPeers: Set<string>,
): Promise<string[]> {
  try {
    await client.conversations.sync();
    const dms: any[] = await client.conversations.listDms();
    const newPeers: string[] = [];
    const selfNorm = selfAddress.toLowerCase();

    for (const dm of dms) {
      try {
        const rawMembers = (dm as any).members;
        const members: any[] = typeof rawMembers === 'function' ? await rawMembers() : (rawMembers ?? []);
        for (const m of members) {
          const addrs: string[] = m.accountAddresses ?? m.addresses ?? [];
          for (const addr of addrs) {
            const norm = addr.toLowerCase();
            if (
              /^0x[a-fA-F0-9]{40}$/i.test(norm) &&
              norm !== selfNorm &&
              !knownPeers.has(norm)
            ) {
              newPeers.push(addr);
              knownPeers.add(norm);
            }
          }
        }
      } catch {}
    }
    return newPeers;
  } catch (e) {
    console.warn('[XMTP] discoverNewPeers failed:', e);
    return [];
  }
}

/** Async generator streaming all incoming messages in real time */
export async function* streamMessages(client: Client) {
  const stream = await client.conversations.streamAllMessages();
  for await (const message of stream as any) {
    yield message;
  }
}
