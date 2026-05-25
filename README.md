# Humanity Ledger (Powered by Aztec Network)

> The first institutional-grade, fully shielded social and economic ledger built on Aztec Network's zero-knowledge rollup.

Humanity Ledger separates the act of participating from the act of revealing it. By utilizing Aztec's L2 zkRollup and Noir circuits, we ensure that your identity, portfolio, and strategic operations remain strictly confidential while settling securely on Ethereum.

## Core Capabilities

1. **Private Core Dots (QDs):** A natively private token operating on an Aztec Token Contract. Balances are encrypted UTXOs; only the total network supply is public.
2. **ZK Proof of Reputation:** Users generate recursive proofs of their past positive interactions to access shielded forums without revealing *what* those interactions were or *who* they are.
3. **Biometric Shielding:** Zero-knowledge liveness proofs prevent sybil attacks without centralizing biometric data. We rejected Worldcoin to build a truly Enterprise, trustless alternative.
4. **Institutional Tunnels:** E2E encrypted, secure communication channels that run locally on the client's device, ensuring that metadata is never leaked to sequencers.

## Technology Stack

- **L2 Framework:** Aztec Network (Privacy-First zkRollup)
- **Circuit Logic:** Noir (Rust-based DSL for ZK proofs)
- **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS
- **State Management:** Encrypted UTXO models
- **Proving:** Client-side Noir Prover (WASM)

## Architecture

Our architecture is designed as a *Zero-Trust Protocol*:
- **Private Functions:** Client-side execution of logic guarantees parameters remain confidential.
- **Public Functions:** Used exclusively for liquidity pool synchronization where global state is necessary.
- **Atomic Composability:** Seamlessly bridge private UTXO state and public transparent state in a single transaction.

## Quickstart

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Visit `http://localhost:3000` to interact with the shielded UI.

## Security Model

Humanity Ledger employs a rigorous security model combining distributed rate limiting, WebAuthn passkeys, and an advanced Content Security Policy. See [SECURITY.md](./SECURITY.md) for detailed information on our Timelock policies, Bug Bounty, and threat models.

## License

MIT License. See `LICENSE` for more information.
