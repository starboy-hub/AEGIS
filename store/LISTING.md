# Chrome Web Store Listing Materials

Everything needed for the store submission. Review carefully before publishing.

## Store listing

**Name:** AEGIS — AI Privacy & Scam Shield

**Summary (132 chars max):**
> Local-first guardian against AI-era threats: hides your data from AI chats, flags AI scams, catches hidden prompt injections. 100% offline.

**Category:** Privacy & Security
**Language:** English (9 interface languages supported)

**Description:**

Every day, millions of people leak personal data into AI chats — and AI-generated scams, phishing and fake media are aimed *at* them. AEGIS is a local-first guardian that fights both directions of the problem. Your data never leaves your device.

🛡️ SHIELD — Stop leaking data to AI
• Detects passwords, card numbers, SSNs, emails and more as you type
• Swaps them with realistic fake data before anything is sent
• Identity Vault: teach it your real name/email/phone once (AES-256-GCM encrypted) and it catches them even typed plainly — replacing them with consistent pseudonyms so AI conversations stay coherent
• Un-masking: when an AI reply contains your pseudonym, AEGIS restores your real value on-screen

🚨 SENTINEL — Inbound scam defense
• Analyzes incoming messages for AI-scam patterns: credential requests, payment pressure, fake authority, too-good offers, urgency manipulation
• Optional local-AI second opinion via Ollama
• Trust Graph: if a pressure message names YOUR bank or employer, it escalates as impersonation

🛑 INJECTION FIREWALL
• Detects prompt-injection text hidden in pages — including invisible text (transparent, off-screen, 1px) designed to hijack AI agents that read the web

🧬 REALITY CHECK
• Right-click any image to scan it for AI-provenance metadata (C2PA content credentials, generator signatures, diffusion parameters)

✍️ SIGN & VERIFY + 🐝 SWARM
• Sign any text with your device key; anyone with AEGIS can verify it
• Share anonymized scam signatures between installs (hashes only, never message text)

👨‍👩‍👧 FAMILY GUARDIAN MODE — one switch for maximum protection for loved ones.

**Permissions justification:**
- `storage` — settings, encrypted Identity Vault, and audit history are stored locally.
- `activeTab` — the popup reads the current tab's URL to show whether the site is trusted.
- `contextMenus` — the "Reality Check this image" entry in the image right-click menu.
- `host_permissions (<all_urls>)` — the content script must run on every page where you might type into an AI chat or encounter scam content. AEGIS never transmits page content anywhere: all analysis runs locally in your browser.

**Privacy policy:** see PRIVACY-POLICY.md in this repository.

**Screenshots to prepare (1280×800):**
1. Popup dashboard with a nonzero protection count.
2. In-page warning popup on an AI chat with PII typed.
3. Sentinel banner on a scam message.
4. Options page (Identity Vault section).
5. Reality Check verdict banner.

## Packaging

Run `npm run pack` — it creates `releases/aegis-v<version>.zip` from `dist/`,
ready for upload at https://chrome.google.com/webstore/devconsole (one-time
$5 developer registration required).

## Review checklist before submitting

- [ ] Privacy policy URL hosted (GitHub Pages or the repo itself)
- [ ] All text in the listing matches current behavior
- [ ] `dist/` built from a tagged release commit (CI green)
- [ ] Single-purpose statement prepared: "This extension has a single purpose: protecting users from AI-era privacy and scam threats, entirely locally."
