/**
 * XMTP E2E Chat Client — Axioma 233
 * ═══════════════════════════════════════════════════════════════
 * Wraps @xmtp/browser-sdk for sovereign encrypted messaging.
 * Zero server reads — all encryption is client-side.
 * Messages are E2E encrypted between wallet addresses.
 * ═══════════════════════════════════════════════════════════════
 */

'use client';

import { Client, type XmtpEnv } from '@xmtp/browser-sdk';

const XMTP_ENV: XmtpEnv = (process.env.NEXT_PUBLIC_XMTP_ENV as XmtpEnv) ?? 'production';

// ── Singleton client registry (one client per wallet) ─────────────────────────
const clientRegistry = new Map<string, Client>();

/**
 * Initialize or retrieve cached XMTP client for a wallet.
 * Requires the wallet signer from wagmi/viem.
 */
export async function getXMTPClient(signer: {
  getAddress: () => Promise<string>;
  signMessage: (message: string) => Promise<string>;
}): Promise<Client> {
  const address = (await signer.getAddress()).toLowerCase();

  if (clientRegistry.has(address)) {
    return clientRegistry.get(address)!;
  }

  const client = await Client.create(signer as any, { env: XMTP_ENV });
  clientRegistry.set(address, client);
  return client;
}

/** Destroy client (on wallet disconnect) */
export function destroyXMTPClient(address: string): void {
  clientRegistry.delete(address.toLowerCase());
}

/** Check if an address can receive XMTP messages */
export async function canReceiveMessages(
  client:  Client,
  address: string,
): Promise<boolean> {
  try {
    const res = await Client.canMessage([address as any], { env: XMTP_ENV }) as any;
    return res.get(address.toLowerCase()) ?? res.get(address) ?? false;
  } catch {
    return false;
  }
}

/** Send an E2E encrypted message to a wallet address */
export async function sendMessage(
  client:         Client,
  toAddress:      string,
  content:        string,
): Promise<void> {
  const conversation = await (client.conversations as any).newConversation(toAddress);
  await conversation.send(content);
}

/** List all conversations for a wallet */
export async function listConversations(client: Client) {
  return client.conversations.list();
}

/** Stream incoming messages (realtime) */
export async function* streamMessages(client: Client) {
  for await (const message of await client.conversations.streamAllMessages()) {
    yield message;
  }
}

/** Get messages from a specific conversation */
export async function getMessages(client: Client, peerAddress: string) {
  const conversation = await (client.conversations as any).newConversation(peerAddress);
  return conversation.messages();
}
