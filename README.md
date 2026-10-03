# 🛡️ AEGIS Extension

> **Local-First Privacy & Security Engine Against AI Data Leaks and Cyber Threats.**  
> *100% On-Device. Zero Cloud. Zero Account Required. Zero Telemetry.*

[![Version](https://img.shields.io/badge/version-10.0.0--beast-blue.svg)](https://github.com/starboy-hub/AEGIS)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Unit Tests](https://img.shields.io/badge/tests-255%20passing-brightgreen.svg)](tests/)
[![E2E Tests](https://img.shields.io/badge/E2E-44%20passing-purple.svg)](e2e/)
[![Privacy](https://img.shields.io/badge/privacy-100%25_local-red.svg)](#-privacy--architecture)

---

## 🌟 Overview

**AEGIS** is a high-performance browser extension designed to protect your privacy and security in the AI era. It operates bidirectionally:

1. **Outbound Protection:** Prevents Personally Identifiable Information (PII), developer secrets, credentials, and sensitive data from leaking into public AI models (ChatGPT, Gemini, Claude, etc.).
2. **Inbound Threat Defense:** Shields you against prompt injections, AI-generated scams, impersonation attacks, and synthetic media.

---

## 🚀 Core Features (v10.0 Beast Mode & Enterprise)

### 🛡️ Outbound Privacy & Data Protection
* **Developer Secret & Code Sanitizer:** Real-time scanning and auto-redaction of AWS Access Keys, GitHub PATs, OpenAI/Anthropic Keys, Stripe Keys, JWTs, SSH Private Keys, and Database Connection Strings before submission to any AI model.
* **Context Menu Right-Click Shortcuts:** Native context menus (`chrome.contextMenus`) to instantly sanitize selected text/code (`🛡️ AEGIS: Sanitize Selected Code/Text`) or inspect image metadata (`🔍 AEGIS: Check Image Provenance`).
* **Identity Vault & Pseudonymization:** Teaches AEGIS your sensitive details once (AES-256-GCM encrypted locally). Data is automatically swapped with consistent per-site pseudonyms so AI chats stay coherent without leaking your real identity. When the AI responds using a pseudonym, AEGIS restores your real values on-screen.
* **Smart Paste Guardian:** Intercepts clipboard paste events into AI input boxes and sanitizes sensitive data before it enters the DOM.
* **Universal RTE Native Adapter:** Seamlessly works with complex Rich Text Editors (Notion, ProseMirror, Slate, Lexical) using native `execCommand` and input event dispatching.

### 🏢 Enterprise & B2B Governance
* **Chrome Enterprise Policy Engine (`chrome.storage.managed`):** Group Policy / Google Admin Console integration allowing IT admins to push pre-configured Vault entries, domain whitelists, and mandatory enforcement presets across corporate laptops.
* **B2B Telemetry & SIEM Exporter:** 1-click audit log exports formatted for enterprise SOC platforms in **CEF** (ArcSight), **OCSF v1.1.0** (AWS Security Lake / Datadog), and **Enterprise JSON** (Splunk / Microsoft Sentinel) with zero raw PII exposed.

### 🚨 Inbound Threat Defense & Forensics
* **Multi-Modal Vision & Canvas Injection Firewall:** Inspects Canvas elements, base64 data URLs, and embedded visual graphic layers for concealed visual prompt injection payloads designed to hijack AI agents.
* **Decentralized P2P Swarm Defense:** Zero-Knowledge threat signature exchange using WebRTC DataChannels, anonymously broadcasting cryptographic threat hashes across peer nodes without any central server.
* **Sentinel Engine:** Scores incoming web content against weighted scam signals (urgency, credential harvesting, fake authority, payment demands). Uses a Trust Graph where messages impersonating *your* bank or employer trigger critical alerts.
* **Webmail Shield:** Performs real-time sender forensics on Gmail and Outlook to detect corporate name spoofing and typosquatting domains.
* **Reality Check & ECDSA Verification:** Right-click image analysis for C2PA/IPTC AI provenance metadata + device-local cryptographic signing.

### 🤖 WebGPU Acceleration & Audio Canary Tools
* **WebGPU Hardware Accelerator Engine:** Hardware-accelerated tensor compute engine (`navigator.gpu`) providing up to 40+ tokens/sec local neural inference on Apple Silicon / NVIDIA GPUs with WASM SIMD fallback.
* **Voice Clone Audio Spectral Canary:** Analyzes FFT audio spectrums for synthetic vocoder artifacts, unnatural pitch variance, and high-frequency jitter typical of AI voice clones.

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
npm test              # Run 255 unit tests (Jest)
npm run test:e2e      # Run 44 Playwright E2E browser tests
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
│   ├── background/      # Manifest V3 Service Worker (Vault, Threat Store, Offscreen AI, Enterprise Policy)
│   ├── content/         # Content scripts (DOM Scanner, Sentinel, Injection, Webmail)
│   │   └── modules/     # Modular detection engines (Detection, Fake-Data, Sentinel, Secrets, Vision)
│   ├── options/         # Full Extension Settings UI & Identity Vault Manager
│   ├── popup/           # Floating Shield Header & Quick Dashboard UI
│   ├── shared/          # SIEM Telemetry Exporter, Encryption, SHA-256 integrity, shared helpers
│   └── offscreen-model/ # Bundled on-device ONNX AI Classifier
├── companion/           # Desktop Agent Firewall Proxy & Voice Canary CLI tools
├── evaluation/          # Labeled benchmark corpus & measurement scripts
├── tests/               # 255 Jest unit and integration tests
├── e2e/                 # 44 Playwright E2E browser automation tests
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
- [x] Chrome Enterprise Managed Policy Engine (`chrome.storage.managed`)
- [x] B2B Telemetry & SIEM Exporter (CEF / OCSF / Enterprise JSON)
- [ ] Chrome Web Store Publication ([`store/LISTING.md`](store/LISTING.md))
- [ ] Expanded Corpus (1,000+ benchmark entries)
- [ ] Desktop GUI wrapper for Companion Proxy Tools

---

## 🤝 Contributing & License

Contributions are welcome! Please review [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on submitting pattern improvements, benchmark samples, or code updates.

Distributed under the **MIT License**. See [LICENSE](LICENSE) for details.
