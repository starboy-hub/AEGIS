# AEGIS Architecture

How the extension is put together: entry points, message flow, storage model,
and trust boundaries.

## Entry points

| Context | File(s) | Runs when | Responsibilities |
|---|---|---|---|
| **Background service worker** | `background.js` (imports `aegis-vault.js`, `reality-engine.js`, `signing-engine.js`, `threat-store.js`, `aegis-shared.js`) | Extension events; wakes on messages | Settings source of truth, Vault/signing/threat stores, Ollama bridge, Reality Check context menu, image-byte fetching |
| **Content script** | `content.js` + engine modules | Injected at `document_end` on `<all_urls>` | All page-facing work: scans, inline popup UI, submission/attachment guards, restore pass, banners |
| **Popup** | `popup.html/.js/.css` | Toolbar icon click | Guardian dashboard: status, layer toggles, stats, activity, audit export |
| **Options** | `options.html/.js/.css` | Settings page | Vault/Trust management, all settings, Sign & Verify, Swarm packs |

All shared logic lives in UMD modules (browser globals + Node exports — see
[docs/detection-layer.md](detection-layer.md)).

## Message flow

```
Content script ──runtime.sendMessage──► Background service worker
     ▲                                        │
     └────────tabs.sendMessage────────────────┘

Pages never participate: chrome.runtime.onMessage only accepts messages from
this extension's own contexts (no externally_connectable is declared).
```

### Content → Background messages

| Type | Payload | Purpose |
|---|---|---|
| `GET_SETTINGS` | — | merged settings (defaults + stored) |
| `SAVE_TRUSTED_SITES` | `sites[]` | trusted-site list write |
| `CHECK_OLLAMA` / `CLASSIFY_TEXT` / `SENTINEL_LLM` | — / `text` | local-AI bridge |
| `VAULT_CORPUS` / `VAULT_ADD` / `VAULT_REMOVE` / `VAULT_CLEAR` | identity entries | encrypted vault ops |
| `VAULT_ADD_TRUSTED` / `VAULT_REMOVE_TRUSTED` | trust entries | trust graph |
| `PSEUDO_RECORD` / `PSEUDO_GET_MAP` | per-site pseudonyms | deterministic fakes |
| `SIGN_SIGN` / `SIGN_VERIFY` | text / signed block | content provenance |
| `THREAT_CHECK` / `THREAT_RECORD` / `THREAT_EXPORT` / `THREAT_IMPORT` / `THREAT_COUNT` | signature hashes | swarm defense |
| `OPEN_OPTIONS` | — | open settings page |

Every handler validates message shape (`validateMessage` in background.js)
before processing; malformed messages get `{ error: 'invalid_message' }`.

### Background → Content messages

| Type | Payload | Purpose |
|---|---|---|
| `REALITY_RESULT` | verdict + signals | Reality Check banner after a context-menu scan |

Theme/setting changes need **no** messages: content scripts watch
`chrome.storage.onChanged` and react live.

## Storage model

| Area | Key | Contents | Sensitivity |
|---|---|---|---|
| `sync` | `settings` | toggles, sensitivity, trusted sites, family mode | none |
| `sync` | `theme`, `manualLanguage` | UI preferences | none |
| `local` | `vault_key` | AES-256-GCM key (JWK) — device-local | **critical** |
| `local` | `vault_data` | encrypted identity + trust entries | ciphertext |
| `local` | `aegis_pseudo_map` | per-site pseudonyms (fakes only) | none |
| `local` | `aegis_history` / `aegis_summary` | audit history (originals kept for undo) | personal |
| `local` | `signing_key` | ECDSA P-256 keypair (JWK) | **critical** |
| `local` | `threat_signatures` | anonymized scam hashes | none |
| `local` | `vault_version` | change counter for live refresh | none |

`chrome.storage.local` is isolated **per extension** — web pages and other
extensions cannot read it. See [SECURITY-MODEL.md](SECURITY-MODEL.md) for the
key lifecycle and the full trust-boundary analysis.
