# AEGIS Security Model

What the security design guarantees, how the keys work, and where the honest
boundaries are.

## Key lifecycles

### Identity Vault key (AES-256-GCM)

1. On first vault write, `crypto.subtle.generateKey({ name: 'AES-GCM',
   length: 256 })` creates the key (CSPRNG-backed).
2. The key is exported (`exportKey('raw')`) and stored **as JWK in
   `chrome.storage.local`** under `vault_key`. The encrypted entries live
   next to it under `vault_data` (fresh random 12-byte IV per save).
3. Consequence: the vault is protected against plaintext inspection (sync
   leakage, casual storage reads) but **an attacker with code execution in
   the extension's context, or full disk access, can decrypt it**. A
   passphrase-derived key (PBKDF2/Argon2 from a user secret) is the roadmap
   answer and would make ciphertext undecryptable without the passphrase —
   at the cost of a forgotten-passphrase-is-data-loss trade-off.

### Content signing key (ECDSA P-256)

1. Generated once on first use, stored as a JWK pair in `chrome.storage.local`.
2. Signs arbitrary text (ES256 / SHA-256); the **public** key is embedded in
   every signed block, so any AEGIS install can verify without sharing
   secrets.
3. The private key never leaves the device; there is no revocation
   infrastructure in v1 — treat signatures as "signed by the holder of that
   key on that date", not as an identity system.

## Trust boundaries

| Boundary | Guarantee |
|---|---|
| Web page → content script | Isolated worlds: pages cannot read extension variables or `chrome.storage`. |
| Web page → background | Pages **cannot** send `runtime.sendMessage` to us (`externally_connectable` is not declared). All inbound messages originate from our own contexts; every message is shape-validated (`validateMessage`). |
| Content script ↔ background | Same extension, same trust level. A compromised content script is equivalent to a compromised extension — it can read storage directly. Mitigation is scope minimization (no broad APIs) and code audit, not message filtering. |
| Other extensions | `chrome.storage` is per-extension; `externally_connectable` is off. They cannot reach AEGIS data. |
| Ollama bridge | Fetch to `http://localhost:11434` only, user-initiated setting, off by default in effect (requires local Ollama). Only safe because it is loopback; never point the bridge at a network host. |

## Known limitations (by design, documented)

- Full-disk / physical access defeats the vault (see key lifecycle above).
- Metadata forensics can be evaded by stripped files; hidden-text forensics
  by canvas-rendered text. Every verdict is a *signal with an explanation*,
  never an automated truth.
- Heuristic detection trades recall against false positives; the benchmark
  corpus measures known-category coverage, not generalization.
