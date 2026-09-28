# AEGIS Privacy Policy

_Last updated: 2026-09-28_

**The short version: AEGIS does not collect, transmit, or sell any of your data. All processing happens locally in your browser. There is no server, no account, no telemetry, and no analytics.**

## What AEGIS stores on your device

- **Settings** (toggles, sensitivity, theme) — stored in `chrome.storage.sync`, synced by your browser across your own signed-in browsers. Contains no personal data.
- **Identity Vault** — the identity values and trusted organizations/contacts you choose to save. Encrypted at rest with AES-256-GCM using a key generated on your device and never uploaded. Stored in `chrome.storage.local`.
- **Audit history** — a local record of protection events (type, site, timestamp). Original sensitive values are stored only so you can undo a redaction; exports mask them by design.
- **Pseudonym map** — the fake values assigned per site. Fakes are not personal data.
- **Signing key & threat signatures** — a device-local ECDSA keypair for content signing, and anonymized hashes of flagged scam messages.

## What AEGIS does NOT do

- It does not send your browsing history, page content, vault contents, or audit data to any server — there is no server.
- It does not include analytics, tracking, or third-party scripts.
- It does not modify or transmit anything to the AI services you use; it only changes text inside input fields on your screen, with your click.

## One optional network connection

If you enable "Local AI analysis" and have Ollama installed, AEGIS sends the text of a *suspicious* message to **localhost:11434** — your own machine — for classification. This never leaves your computer and can be turned off in settings.

## Data deletion

Removing the extension deletes all of the above (stored extension data is removed by the browser). You can also clear the Vault and audit history from the options page at any time.

## Contact

Open an issue at https://github.com/starboy-hub/AEGIS/issues
