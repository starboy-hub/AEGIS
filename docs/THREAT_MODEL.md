# 🛡️ AEGIS Threat Model & Security Boundaries (STRIDE Framework)

> **Document Version:** 1.0  
> **Target System:** AEGIS Universal AI Privacy Shield (Browser Extension v10.0)  
> **Security Philosophy:** Local-first, zero-telemetry, client-side cryptographic isolation.

---

## 1. System Overview & Security Perimeter

AEGIS is an open-source endpoint Data Loss Prevention (DLP) and threat protection browser extension. It intercepts outbound text/code before submission to AI models (ChatGPT, Gemini, Claude, etc.) and analyzes inbound web content for prompt injections, scams, and synthetic media.

### Security Perimeter Architecture:
```
┌────────────────────────────────────────────────────────────────────────┐
│ USER BROWSER CONTEXT                                                   │
│                                                                        │
│  ┌───────────────────────┐             ┌────────────────────────────┐  │
│  │ Web Page / DOM        │             │ AEGIS Manifest V3 Context  │  │
│  │ (ChatGPT / AI Models) │             │                            │  │
│  │                       │             │  ┌──────────────────────┐  │  │
│  │  [Content Scripts] ───┼──(Runtime)──┼─►│ Service Worker SW       │  │  │
│  │  - DOM TreeWalker     │             │  │ - Web Crypto AES-GCM   │  │  │
│  │  - Smart Paste        │             │  │ - Identity Vault       │  │  │
│  │  - RTE Adapter        │             │  └──────────┬───────────┘  │  │
│  └───────────────────────┘                        │             │  │
│                                                   ▼             │  │
│                                        ┌─────────────────────┐  │  │
│                                        │ Offscreen AI Document│  │  │
│                                        │ - Local ONNX Model  │  │  │
│                                        │ - WebGPU / WASM     │  │  │
│                                        └─────────────────────┘  │  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. STRIDE Threat Analysis

### 🎭 S — Spoofing (Identity & Message Authenticity)
- **Threat:** Malicious web pages impersonating AEGIS UI or forging signed AEGIS message blocks.
- **Mitigation:**
  - AEGIS signed messages use Web Crypto ECDSA (P-256) signatures with device-unique private keys stored in `chrome.storage.local`.
  - Content scripts render UI inside isolated Shadow DOM roots or unique `data-aegis` containers preventing host page styling overrides.
  - Webmail profile engine analyzes display names vs sender domains to detect free-provider spoofing (e.g. `PayPal Support <alert@gmail.com>`).

### 🔨 T — Tampering (Data Alteration)
- **Threat:** Page scripts modifying AEGIS redaction placeholders before network transmission.
- **Mitigation:**
  - AEGIS intercepts native form submit and `Enter` key events at the capture phase (`addEventListener(..., { capture: true })`).
  - Redaction replacements are applied directly to DOM node values (`HTMLInputElement.value`, `HTMLTextAreaElement.value`, or RTE Range selections).

### 🙅 R — Repudiation (Disavowal of Actions)
- **Threat:** Users or admins questioning whether a sensitive secret was sanitized.
- **Mitigation:**
  - Local audit history is stored in `chrome.storage.local` with timestamps, domain names, and masked incident types (zero raw PII).
  - Telemetry exports support standard B2B SIEM formats (**CEF**, **OCSF v1.1.0**, **JSON**).

### 🔓 I — Information Disclosure (Data Leakage)
- **Threat:** Unencrypted exposure of Vault identities (names, emails, phone numbers) on disk or via sync storage.
- **Mitigation:**
  - All Identity Vault entries are encrypted at rest using AES-256-GCM via the Web Crypto API.
  - Master keys are generated locally and never transmitted across network interfaces.
  - Stored pseudonyms are non-invertible hashes per domain (`strHash(salt + site + val)`).

### 💣 D — Denial of Service (Resource Exhaustion)
- **Threat:** Large web pages or infinite DOM mutations causing high CPU/memory usage during scanning.
- **Mitigation:**
  - MutationObserver callbacks are debounced (150ms delay).
  - Heavy sequence classification runs off-thread in `offscreen.html` via WebGPU/WASM SIMD, keeping main UI threads responsive (< 1ms typing overhead).

### 🚀 E — Elevation of Privilege (Context Hijacking)
- **Threat:** Web page content breaking out of DOM context to execute code inside the Extension Service Worker.
- **Mitigation:**
  - Content Security Policy (CSP) enforces `script-src 'self' 'wasm-unsafe-eval'; object-src 'self'`.
  - Message validation gate (`validateMessage`) enforces strict shape and type bounds on all inbound `chrome.runtime.onMessage` calls.

---

## 3. Security Boundaries & Out-of-Scope Risks

### Included in Security Boundary:
- Protection against accidental PII / developer secret pasting into AI platforms.
- Protection against prompt injection text overlays and adversarial scam lures.
- Device-local AES-256-GCM encryption of sensitive identity vault records.

### Explicitly Out-of-Scope:
1. **Host OS Compromise**: Keyloggers, rootkits, or memory scrapers operating at OS level.
2. **Malicious Browser Extensions**: Other extensions running with high-privilege Chrome extension permissions.
3. **Physical Device Access**: Unlocked physical access to the device where local browser profile storage is unencrypted at the OS user level.

---

## 4. Cryptographic Key Lifecycle

1. **Key Generation**: Device keypairs are generated using `crypto.subtle.generateKey` (ECDSA P-256 for signing, AES-GCM 256-bit for Vault).
2. **Key Storage**: Keys are stored in non-exportable form inside `chrome.storage.local`.
3. **Key Rotation**: Users can clear or re-initialize vault keys in 1 click from the Settings panel.
