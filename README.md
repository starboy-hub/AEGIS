# 🛡️ AEGIS — Local-First Guardian Against AI-Era Threats

> **AI fights in both directions: it stops your data from leaking into AI systems, and it defends you from what AI-generated attacks deliver to your screen. 100% local. No account. No telemetry. No cloud.**

![Version](https://img.shields.io/badge/version-8.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Tests](https://img.shields.io/badge/tests-186%20passing-brightgreen.svg)
![E2E](https://img.shields.io/badge/E2E-37%20checks-blueviolet.svg)
![Privacy](https://img.shields.io/badge/privacy-100%25_local-red.svg)

AEGIS is a browser extension that acts as a **personal guardian running entirely on your machine**. It protects you in two directions against AI-era threats, with a family of engines that all run locally:

| Layer | What it defends against | How it works |
|---|---|---|
| 🛡️ **Shield** | Your data leaking into AI chats | Detects PII as you type (regex + 9-language context + your personal Vault) and swaps it with realistic fake data before anything is sent |
| 🔐 **Identity Vault** | Your real details typed plainly | Teach it your name/email/phone once (AES-256-GCM encrypted, device-local) — it detects them at any sensitivity and replaces them with **consistent per-site pseudonyms**, so AI conversations stay coherent. AI replies containing a pseudonym are restored to your real value on-screen |
| 🚨 **Sentinel** | AI-generated scams arriving at you | Scores every inbound message against weighted scam signals (credential requests, payment pressure, fake authority, too-good offers, emergency money requests…). Optional local-Ollama second opinion. **Trust Graph**: pressure messages naming *your* bank/employer escalate as impersonation |
| 🛑 **Injection Firewall** | Prompt-injection hidden in pages | Detects instruction-override text, fake role markers, and **invisible injection payloads** (transparent, off-screen, 1px text) designed to hijack AI agents that read the web |
| 🧬 **Reality Check** | Synthetic media | Right-click any image → scans its bytes for AI-provenance metadata (C2PA content credentials, generator signatures, diffusion parameters) |
| 👨‍👩‍👧 **Family Guardian** | Scams targeting loved ones | One switch: all layers armed, strictest thresholds |
| ✍️ **Sign & Verify** | Forged content claiming to be from you | Device-local ECDSA signing; portable signed blocks anyone with AEGIS can verify — forged signatures fail loudly |
| 🐝 **Swarm Defense** | Repeat scams across installs | Anonymized threat-signature packs (hashes only, never message text) — export/import between installs today, federatable tomorrow |
| 📧 **Webmail Shield** | Scams in your Gmail/Outlook inbox | Sender forensics on webmail: corporate-name spoofing from free providers, lookalike/typosquat domains, sent-mail skip |
| 🤖 **Agent Firewall** | AI agents leaking your data | Local loopback proxy (companion tool): scans agent HTTP traffic, tokenizes protected values, blocks injection payloads |
| 🗣️ **Voice Canary** | Voice-clone call fraud | Challenge-response caller verification — clones can't answer questions that were never public |

---

## 🧪 Measured, not promised

Sentinel is scored against a labeled corpus of 154 messages (scams *and* tricky legitimate messages — salary talk, real bank notices, urgent-but-honest requests). The benchmark runs on every change:

```
corpus: 154 labeled messages · warn threshold: suspicious+dangerous
precision: 100% · recall: 100% · f1: 1.000   (baseline locked, CI-enforced ≥95%)
```

**Honest read of these numbers:** the corpus is co-developed with the patterns, so it measures *coverage of known scam categories*, not real-world generalization. Real-world recall will be lower — novel scam wording is the eternal arms race. The corpus and the guard exist so the engine can never silently regress, and so every future improvement is measured. Run it yourself: `npm run benchmark`.

## ⚠️ Honest limitations

No tool — and no app from any vendor — protects against "AI" as a whole. AEGIS defends a specific, growing slice:

- It sees **browser content only** — not email apps, SMS, or phone calls (webmail like Gmail/Outlook *is* covered, because it renders in the browser).
- Its scam and injection detection is **heuristic + optional local LLM**. Novel wording can get through; that is why the benchmark and corpus exist and must grow.
- **Reality Check reads metadata.** AI images with stripped metadata will show "no AI metadata found" — which is *not* proof of authenticity.
- It does nothing about account takeover, malware, platform surveillance, or systemic AI risks. Those need OS hygiene, institutions, and law.
- The vault protects your values at rest on this device (AES-256-GCM, local key) — not against an attacker with full disk access.

For the future desktop layer (real-time call screening, agent-traffic firewall), see [companion/DESIGN.md](companion/DESIGN.md) — designed, not yet built.

## 🚀 Quick Start

### From a release

1. Download the extension zip from [Releases](https://github.com/starboy-hub/AEGIS/releases), unzip it.
2. Open `chrome://extensions/` (or Edge/Brave equivalents), enable **Developer mode**, click **Load unpacked**, select the unzipped folder.
3. Click the 🛡️ icon — the dashboard shows your status. Optional: install [Ollama](https://ollama.com) locally for AI second opinions.

### From source

```bash
git clone https://github.com/starboy-hub/AEGIS.git
cd AEGIS
npm install
npm run build        # dist/ appears — load it as above
npm test             # 128 unit tests
npm run test:e2e     # 7 Playwright journeys (real Chromium)
npm run benchmark    # Sentinel detection benchmark
npm run pack         # store-ready zip in releases/
```

### First 5 minutes with AEGIS

1. **Vault** (Options → Identity Vault): add your real name and email.
2. Open any AI chat and type "hi, I'm *your name* and my email is *your email*".
3. Watch the Vault flag them at any sensitivity → click Protect → consistent pseudonyms replace them.
4. When the AI's reply mentions your pseudonym, you'll see your real name again — the server never did.
5. Optional: add your bank to the **Trust Graph** — scam messages naming it now escalate as impersonation.

## 🧠 How detection works

Layered, local, and measured — full developer reference in [docs/detection-layer.md](docs/detection-layer.md):

- **Regex layer** — PII shapes (SSN, cards with Luhn pre-check, emails, phones, IPs, passport, bank, license, MRN)
- **Context layer** — 9-language semantic patterns ("I was diagnosed with…", "my salary is…")
- **Vault layer** — your taught values, matched case/format-insensitively
- **Sentinel layer** — weighted scam signals on inbound text, with trust-graph escalation
- **Injection layer** — prompt-injection patterns + invisible-text forensics
- **Model layer (optional)** — local Ollama classification with a few-shot protocol as a second opinion

Replacements use format-preserving fake data with safety guarantees (fake cards fail Luhn, fake SSNs use never-issued ranges) and are **reversible only by you** via the Vault mapping.

## 🗂️ Repository map

```
src/shared/          storage keys, settings, shared helpers (UMD)
src/content/         content script + detection/sentinel/injection/webmail engines
src/background/      service worker: settings, vault, signing, threats, reality, offscreen AI
src/popup/           guardian dashboard UI
src/options/         settings UI (7 grouped sections)
companion/           desktop tools: agent firewall proxy + voice canary (+ DESIGN.md)
evaluation/          labeled corpus + benchmark harness
tests/               186 unit tests (jest)
e2e/                 37 Playwright checks against real Chromium
store/               Web Store listing + privacy policy
docs/                developer reference
```

## 🗺️ Roadmap (honest)

- [x] Shield, Vault, pseudonyms, un-masking
- [x] Sentinel + benchmark harness
- [x] Injection Firewall incl. hidden-text forensics
- [x] Reality Check (metadata forensics)
- [x] Trust Graph + Family Mode
- [x] Content signing + swarm-ready signature packs
- [ ] Grow the corpus to 1,000+ messages with real-world submissions
- [ ] Web Store publication (listing prepared in [`store/`](store/LISTING.md))
- [x] Webmail Shield (Gmail/Outlook sender forensics)
- [x] Agent Firewall + Voice Canary companion tools
- [ ] Companion GUI (firewall + canary have working CLI tools)
- [ ] Firefox/Edge ports
- [ ] Federated swarm relay (needs a user base first)

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Good first contributions: corpus messages (real scam patterns you've seen, with personal data removed), new detection signals with benchmark evidence, translations.

## 📄 License

MIT — see [LICENSE](LICENSE).
