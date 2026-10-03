# 🛡️ AEGIS Extension

> **Local-First Privacy & Security Engine Against AI Data Leaks and Cyber Threats.**  
> *100% On-Device. Zero Cloud. Zero Account Required. Zero Telemetry.*

[![Version](https://img.shields.io/badge/version-9.7.1-blue.svg)](https://github.com/starboy-hub/AEGIS)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Unit Tests](https://img.shields.io/badge/tests-242%20passing-brightgreen.svg)](tests/)
[![E2E Tests](https://img.shields.io/badge/E2E-45%20passing-purple.svg)](e2e/)
[![Privacy](https://img.shields.io/badge/privacy-100%25_local-red.svg)](#-privacy--architecture)

---

## 🌟 Overview

**AEGIS** is a high-performance browser extension designed to protect your privacy and security in the AI era. It operates bidirectionally:

1. **Outbound Protection:** Prevents Personally Identifiable Information (PII), credentials, and sensitive data from leaking into public AI models (ChatGPT, Gemini, Claude, etc.).
2. **Inbound Threat Defense:** Shields you against prompt injections, AI-generated scams, impersonation attacks, and synthetic media.

---

## 🚀 Core Features

### 🛡️ Outbound Privacy & Data Protection
* **Identity Vault & Pseudonymization:** Teaches AEGIS your sensitive details once (AES-256-GCM encrypted locally). Data is automatically swapped with consistent per-site pseudonyms so AI chats stay coherent without leaking your real identity. When the AI responds using a pseudonym, AEGIS restores your real values on-screen.
* **Smart Paste Guardian:** Intercepts clipboard paste events into AI input boxes and sanitizes sensitive data before it enters the DOM.
* **Universal RTE Native Adapter:** Seamlessly works with complex Rich Text Editors (Notion, ProseMirror, Slate, Lexical) using native `execCommand` and input event dispatching.
* **Contextual & Regex Detection:** Scans text in real time using 9-language semantic context and high-accuracy regex (Luhn-verified cards, SSA-valid SSNs, emails, phones, credentials).

### 🚨 Inbound Threat Defense & Forensics
* **Sentinel Engine:** Scores incoming web content against weighted scam signals (urgency, credential harvesting, fake authority, payment demands). Uses a Trust Graph where messages impersonating *your* bank or employer trigger critical alerts.
* **Injection Firewall:** Detects prompt-injection payloads, instruction overrides, and hidden/concealed text (1px, transparent, off-screen text) engineered to hijack web-browsing AI agents.
* **Webmail Shield:** Performs real-time sender forensics on Gmail and Outlook to detect corporate name spoofing and typosquatting domains.
* **Reality Check:** Right-click image analysis scanning raw bytes for AI provenance metadata (C2PA content credentials, Stable Diffusion parameters, IPTC tags).
* **ECDSA Sign & Verify:** Sign content locally with device keys; verify portable signed blocks to detect tampering or forgery.

### 🤖 Desktop & Agent Companion Tools
* **Agent Firewall Proxy:** Local loopback proxy that tokenizes sensitive values in outgoing AI agent HTTP traffic and re-hydrates them in streamed responses.
* **Voice Canary:** Challenge-response verification tool to defeat voice-clone phone scams using private non-public questions.

---

## 🔍 Deep DOM & Network Coverage

Standard extensions fail on modern web applications. AEGIS includes complete structural coverage:

| Target Surface | Protection Mechanism |
| :--- | :--- |
| **Web Components & Shadow DOM** | Recursive Shadow Root discovery + traversal across sentinel, injection, and canary passes. |
| **Embedded IFrames** | Executed in all frames (`all_frames: true`) with independent isolation. |
| **Network Traffic (Fetch / XHR)** | Monitored and analyzed for background PII transmission. |
| **DOM Replacement** | Safe DOM `TreeWalker` text-node replacement preventing XSS vulnerabilities. |

---

## ⚡ Quick Start

### Installation (Pre-built Release)
1. Download the latest release `.zip` from [Releases](https://github.com/starboy-hub/AEGIS/releases) and extract it.
2. Open `chrome://extensions/` in Chrome, Edge, or Brave.
3. Enable **Developer Mode** (top right toggle).
4. Click **Load unpacked** and select the extracted folder.

### Build From Source
```bash
# 1. Clone repository
git clone https://github.com/starboy-hub/AEGIS.git
cd AEGIS

# 2. Install dependencies & build extension
npm install
npm run build         # Compiles output into dist/

# 3. Execute tests & benchmarks
npm test              # Run 242 unit tests (Jest)
npm run test:e2e      # Run 45 Playwright E2E browser tests
npm run benchmark     # Run Sentinel detection benchmark suite
npm run pack          # Package extension into releases/
```

---

## 📊 Measured Benchmark & AI Classifier

AEGIS is continuously evaluated against a baseline benchmark suite (`npm run benchmark`):

* **Core Scam Corpus (154 messages):** 100% Precision · 100% Recall · F1-Score 1.000.
* **Multilingual AI Classifier (Bundled):** Ships with an on-device 118 MB quantized XLM-R MiniLM model fine-tuned across 9 languages (*en, es, hi, fr, de, pt, ru, zh, ar*). Runs fully offline in an offscreen document without remote API dependencies.

---

## 🗂️ Repository Structure

```
├── src/
│   ├── background/      # Manifest V3 Service Worker (Vault, Threat Store, Offscreen AI)
│   ├── content/         # Content scripts (DOM Scanner, Sentinel, Injection, Webmail)
│   │   └── modules/     # Modular detection engines (Detection, Fake-Data, Sentinel)
│   ├── options/         # Full Extension Settings UI & Identity Vault Manager
│   ├── popup/           # Floating Shield Header & Quick Dashboard UI
│   ├── shared/          # Encryption, SHA-256 integrity, shared helpers
│   └── offscreen-model/ # Bundled on-device ONNX AI Classifier
├── companion/           # Desktop Agent Firewall Proxy & Voice Canary CLI tools
├── evaluation/          # Labeled benchmark corpus & measurement scripts
├── tests/               # 242 Jest unit and integration tests
├── e2e/                 # 45 Playwright E2E browser automation tests
├── store/               # Web Store publication assets & listing
└── scripts/             # Build, packaging, and dist verification scripts
```

---

## 🗺️ Roadmap & Status

- [x] Identity Vault, per-site pseudonyms, and automatic un-masking
- [x] Sentinel Engine & benchmark evaluation harness
- [x] Injection Firewall & invisible text forensics
- [x] Synthetic Media Reality Check (C2PA / IPTC metadata)
- [x] Webmail Sender Forensics (Gmail & Outlook)
- [x] Shadow DOM, Nested IFrame, and Network Body Scanning
- [x] Universal Rich Text Editor Native Adapter (ProseMirror, Lexical, Slate)
- [x] Chrome MV3 Side Panel Integration (`chrome.sidePanel`)
- [ ] Chrome Web Store Publication ([`store/LISTING.md`](store/LISTING.md))
- [ ] Expanded Corpus (1,000+ benchmark entries)
- [ ] Desktop GUI wrapper for Companion Proxy Tools

---

## 🤝 Contributing & License

Contributions are welcome! Please review [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on submitting pattern improvements, benchmark samples, or code updates.

Distributed under the **MIT License**. See [LICENSE](LICENSE) for details.
