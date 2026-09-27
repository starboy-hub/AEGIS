# 🛡️ AEGIS: Universal AI Privacy Shield

> **Stop feeding your sensitive data to AI.**

![Version](https://img.shields.io/badge/version-6.1.1-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Languages](https://img.shields.io/badge/languages-9-orange.svg)
![Privacy](https://img.shields.io/badge/privacy-100%25_local-red.svg)
![Ollama](https://img.shields.io/badge/Ollama-optional-purple.svg)

[🚀 Quick Start](#-quick-start) • [✨ Features](#-features) • [📸 Screenshots](#-screenshots) • [🤝 Contributing](#-contributing) • [📄 License](#-license)

---

## 🎯 The Problem

Every day, millions of users inadvertently paste sensitive information into AI platforms:

* 🔑 Passwords and API keys
* 💳 Credit card numbers
* 🏥 Medical records and prescriptions
* 📊 Financial statements and salaries
* 🆔 Social Security numbers
* 🏢 Proprietary enterprise data

Once submitted to ChatGPT, Claude, or Copilot, this data is out of your control. It may be logged, stored, reviewed by human evaluators, or used to train future foundation models.

---

## 🛡️ The Solution

**AEGIS** is an open-source, endpoint Data Loss Prevention (DLP) browser extension that intercepts, redacts, and protects Personally Identifiable Information (PII) before it ever leaves your client environment.

When AEGIS detects sensitive data, it dynamically swaps it with realistic synthetic data — allowing you to leverage AI models at full capacity without compromising privacy.

---

## 🎬 See It In Action

```text
You type:    "My SSN is 123-45-6789 and I work at TechCorp"
                ↓
AEGIS sees:  🔴 PII DETECTED (SSN, Company Name)
                ↓
You click:   🛡️ Protect
                ↓
AI receives: "My SSN is 073-64-2918 and I work at Nexus Industries"
```

> **100% Local.** Zero data ever leaves your machine.

---

## ✨ Features

### 🔍 4-Layer Detection Engine

| Layer | What It Catches | Examples |
| :--- | :--- | :--- |
| **Regex** | Standard PII formats | SSN, Credit Cards, Emails, Phone Numbers, IPs |
| **Context** | Semantic meaning | `"I was diagnosed with..."`, `"My salary is..."` |
| **Heuristics** | Names & entities | `"John Smith"`, `"Attorney Johnson"` |
| **AI (Optional)** | Deep semantic analysis | Complex, ambiguous PII via local LLMs |

---

### 📋 Supported PII Types

#### Standard PII
* ✅ Social Security Numbers (SSN)
* ✅ Email addresses
* ✅ Phone numbers
* ✅ Credit card numbers
* ✅ IP addresses

#### Extended PII
* ✅ Dates of birth
* ✅ Passport numbers
* ✅ Driver's licenses
* ✅ Bank account numbers
* ✅ Medical record numbers (MRN)

#### Contextual PII
* ✅ Medical conditions & prescriptions
* ✅ Financial information (salaries, net worth, bankruptcy)
* ✅ Legal proceedings (litigation, legal counsel)
* ✅ Credentials (passwords, tokens, API keys)
* ✅ Employment history & internal roles
* ✅ Personal situations (divorce, custody, family data)

#### Custom PII
* ✅ User-defined regex patterns tailored to company-specific identifiers

---

### 🌍 9-Language Support

AEGIS provides native contextual parsing across multiple languages:

| Language | Example Detection |
| :--- | :--- |
| 🇺🇸 **English** | `"My SSN is 123-45-6789"` |
| 🇪🇸 **Spanish** | `"Mi salario es $60,000"` |
| 🇫🇷 **French** | `"Je gagne 55000 euros"` |
| 🇩🇪 **German** | `"Ich verdiene 70000 Euro"` |
| 🇧🇷 **Portuguese** | `"Meu salário é 6000 reais"` |
| 🇮🇹 **Italian** | `"Guadagno 48000 euro"` |
| 🇷🇺 **Russian** | `"Моя зарплата 180000 рублей"` |
| 🇨🇳 **Chinese** | `"我的工资是60000元"` |
| 🇸🇦 **Arabic** | `"راتبي هو 25000 دولار"` |

---

### 💰 Currency-Aware Fake Data

Replaces financial figures with contextually appropriate synthetic values preserving format:

| Original | Synthetic Replacement |
| :--- | :--- |
| `$95,000` | `$75,000` |
| `€60,000` | `€75,000` |
| `₽150,000` | `₽200,000` |
| `¥50,000` | `¥80,000` |
| `R$5,000` | `R$8,000` |

---

### 🛡️ Universal Submission Guard

Monitors and intercepts outbound vectors across the DOM:

* ✅ Button clicks (`Send`, `Submit`, custom triggers)
* ✅ `Enter` key form submissions
* ✅ Standard `<form>` payloads
* ✅ `window.fetch` API requests
* ✅ `XMLHttpRequest` (XHR) calls
* ✅ `FormData` serialization

> If unprotected PII is about to be sent, AEGIS halts the event loop and prompts for confirmation.

---

### 📎 Multi-Layer Attachment Guard

Scans file payloads across 6 browser-level interception points:

1. `File` constructor
2. `FormData.append`
3. `XMLHttpRequest.prototype.send`
4. `window.fetch` requests
5. File input `change` events
6. Drag-and-drop dropzones

**Proactive Upload Warnings:**
* 📸 **Images:** OCR & visual leak hazards
* 📄 **Documents:** Sensitive naming conventions (`*confidential*`, `*payroll*`)
* 📋 **Text/Code:** Files embedding credential patterns or PII strings

---

### 🎯 Sensitivity Control

Customize detection thresholds per workflow:

* **Low:** Regex only (maximum performance, lowest false-positive rate)
* **Medium:** Regex + Contextual markers (recommended daily default)
* **High:** All layers enabled, including heuristic classification

---

### 🔧 Custom Regex Patterns

Define project- or organization-specific patterns inside settings:

```text
EMPLOYEE_ID : /EMP-\d{5}/g
PROJECT_CODE : /PROJ-[A-Z]{3}-\d{4}/gi
CLIENT_REF   : /CL-[A-Z0-9]{8}/
```

---

### 🤝 Trust Site Management

* **Instant Allowlist:** Single-click trust action from alert popups.
* **Domain Whitelist:** Configurable domain lists via Settings.
* **Session Memory:** Temporary suppressions for trusted workflow runs.
* **Bi-directional Sync:** Automatic state alignment between popup and options storage.

---

### 📊 Summary Catalogue

Post-redaction review modal includes:
* Detailed replacement badges
* Word-by-word diff comparisons
* `Original ➔ Synthetic` mapping tables
* Color-coded category tags

---

### 🎨 Premium UX

* 🌙 Real-time dark mode
* 🖱️ Draggable, non-blocking UI overlay
* 🚦 High-contrast state indications (Red = PII Detected, Green = Secured)
* ⌨️ Keyboard-first workflows (`⌘+Enter` / `Ctrl+Enter` to quick-protect, `Esc` to dismiss)
* 📤 Audit history export (JSON / CSV formats)
* 📈 Local privacy metrics and interception counters

---

## 📸 Screenshots

| View | Description |
| :--- | :--- |
| **Real-Time Detection** | Dynamic input underline highlighting sensitive entities. |
| **One-Click Protection** | Instant substitution with synthetic test values. |
| **Summary Catalogue** | Comprehensive audit log of all redacted inputs. |
| **Attachment Guard** | Pre-flight prompt on file drag-and-drop operations. |
| **Settings Panel** | Complete control over layers, regex rules, and allowlists. |

---

## 🚀 Quick Start

### Method 1: Direct Download (Recommended)

1. Navigate to [Releases](https://github.com/starboy-hub/AEGIS/releases).
2. Download `aegis-extension-v5.5.0.zip` and unzip it.
3. Open your Chromium-based browser (`chrome://extensions/`, `edge://extensions/`, or `brave://extensions/`).
4. Enable **Developer mode** (toggle in the upper right corner).
5. Click **Load unpacked** and select the unzipped `dist` folder.
6. The 🛡️ shield icon will now appear in your browser.

---

### Method 2: Clone from GitHub

```bash
# Clone the repository
git clone https://github.com/starboy-hub/AEGIS.git
cd AEGIS

# Build the extension (requires Node.js 18+)
npm install
npm run build

# Load into your browser:
# 1. Open chrome://extensions/
# 2. Toggle "Developer mode" ON
# 3. Click "Load unpacked"
# 4. Choose the 'dist' directory
```

---

### Method 3: Installation Scripts

**Windows:**
```cmd
:: Double-click install-windows.bat inside the dist folder
dist\install-windows.bat
```

**macOS / Linux:**
```bash
chmod +x install-mac.sh
./install-mac.sh
```

---

## 📖 How to Use

### Basic Workflow

1. Open your AI service of choice (ChatGPT, Claude, Gemini, Copilot, Perplexity, etc.).
2. Type your prompt normally into the input field.
3. When sensitive data is entered:
   * Text receives a red indicator.
   * An AEGIS badge appears near the active input.
4. Click **🛡️ Protect** (or press `⌘+Enter` / `Ctrl+Enter`).
5. All sensitive tokens are substituted with safe mock data.
6. Submit your prompt safely.

---

### Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `⌘ + Enter` *(Mac)* / `Ctrl + Enter` *(Win)* | Quick-protect latest detection |
| `Esc` | Dismiss active alert banner |

---

### Settings & Configuration

Click the ⚙️ gear icon to manage:

* **Dark Mode:** System / Dark / Light theme toggles.
* **Regex Engine:** Enable or isolate pattern sets.
* **Sensitivity Profile:** Low / Medium / High heuristics.
* **Substitution Strategy:** Synthetic fake generation vs. standard `[REDACTED]` tokens.
* **Interface Language:** Active display language.
* **Custom Regex Engine:** User-supplied token expressions.
* **Trusted Domains:** Whitelisted target hosts.

---

## 🤖 Optional: Ollama Integration

AEGIS operates self-contained without external dependencies. If you require deep semantic inference for highly unstructured payloads, you can optionally connect a local Ollama instance.

### Setup

1. Install Ollama via [ollama.com](https://ollama.com).
2. Pull a lightweight model:
   ```bash
   ollama pull llama3
   ```
3. Restart AEGIS or reload your browser tabs.

### Detection Mechanism

* AEGIS pings `http://localhost:11434` via background service workers.
* **Found:** Displays `🟢 Active` in settings and routes ambiguous strings to the local model.
* **Not Found:** Displays `⚪ Disabled` and defaults to standard heuristic and regex pipelines.
* **Privacy Assurance:** Model inference executes strictly on `localhost`.

---

## 🔒 Privacy First

### Our Guarantees

* ✅ **100% Local Execution:** Computation stays inside browser sandboxes.
* ✅ **Zero Analytics:** No diagnostic beacons, telemetry, or remote hooks.
* ✅ **No External Cloud Dependencies:** Fully functional in air-gapped environments.
* ✅ **Open Source:** Permissively licensed under MIT for complete code transparency.

### Architectural Boundary

| What AEGIS Does NOT Do | What AEGIS Does |
| :--- | :--- |
| ❌ Transmit text to external validation servers | ✅ Parse DOM events in-browser |
| ❌ Log URLs or browsing activity | ✅ Swap sensitive strings with local mock dictionaries |
| ❌ Require third-party logins or telemetry | ✅ Preserve local audit tables via `chrome.storage.local` |
| ❌ Dispatch remote telemetry queries | ✅ Provide offline-first privacy controls |

---

## 🛠️ Technical Details

### Tech Stack

* **Core:** Vanilla JavaScript (ES6+ Modules)
* **Standard:** Manifest V3 (MV3 compliant)
* **Storage Layer:** `chrome.storage.local` & `chrome.storage.sync`
* **Local AI Hook:** Ollama Local REST API (`127.0.0.1:11434`)
* **Dependencies:** Zero runtime dependencies

### Browser Compatibility

| Browser | Compatibility |
| :--- | :--- |
| Google Chrome | ✅ Version 88+ |
| Brave Browser | ✅ Supported |
| Microsoft Edge | ✅ Version 88+ |
| Arc Browser | ✅ Supported |
| Mozilla Firefox | ⚠️ In progress (Manifest translation) |
| Apple Safari | ⚠️ In roadmap |

---

### Project Structure

```text
AEGIS/
├── dist/                    # Production-ready extension artifacts
│   ├── manifest.json       # MV3 metadata configuration
│   ├── background.js       # Background service worker
│   ├── content.js          # Core DOM interception engine
│   ├── popup.html          # Extension action popup
│   ├── popup.js            # Overlay view logic
│   ├── options.html        # Settings dashboard
│   ├── options.js          # Configuration persistence logic
│   ├── install-windows.bat # Windows setup helper
│   └── install-mac.sh      # macOS/Linux setup helper
├── assets/
│   └── screenshots/        # Media assets
├── README.md               # Main project documentation
├── LICENSE                 # MIT License details
├── CONTRIBUTING.md         # Contribution standards
├── CODE_OF_CONDUCT.md      # Community conduct guidelines
├── CHANGELOG.md            # Release version history
└── .gitignore             # Git ignore patterns
```

---

## 🧪 Testing

### Quick Manual Test

Copy and paste this test string into your target AI prompt box:

```text
My name is John Smith, my SSN is 123-45-6789, and I work at TechCorp 
where my salary is $95,000. I was recently diagnosed with diabetes 
and take metformin daily.
```

**Expected Results:**
1. Detection highlight activates over SSN, employer, salary, and medical condition.
2. AEGIS notification card lists all detected categories.
3. Clicking **🛡️ Protect** replaces entries with randomized, semantically valid equivalents.
4. Submission executes without standard security prompts.

*(See `TESTING.md` for full automated and multi-language verification routines).*

---

## 🤝 Contributing

Contributions are welcome! Please check out [`CONTRIBUTING.md`](CONTRIBUTING.md) to review development workflows.

```bash
# Fork & clone your repository
git clone https://github.com/starboy-hub/AEGIS.git
cd AEGIS

# Load unpacked from the 'dist' directory in developer mode
# Make your edits, verify functionality, and open a Pull Request!
```

---

## ❓ FAQ

**Does AEGIS require an active internet connection?**  
No. All core pattern matching and contextual rules execute entirely client-side. The optional Ollama engine also runs on your local system loopback.

**Will this degrade browser performance?**  
No. DOM listeners are debounced and memory-bounded to maintain sub-millisecond input handling.

**Is commercial usage permitted?**  
Yes. AEGIS is distributed under the MIT license and is free to use across both personal and enterprise environments.

**Which AI platforms are supported?**  
AEGIS hooks into universal DOM input controls, making it compatible with ChatGPT, Claude, Google Gemini, Microsoft Copilot, Perplexity, and custom internal chat interfaces.

---

## 🗺️ Roadmap

- [x] Chromium Manifest V3 baseline engine
- [x] Multi-language semantic rules (9 languages)
- [x] Local Ollama integration hook
- [ ] Native Firefox Gecko extension port
- [ ] Safari Web Extension conversion
- [ ] Bi-directional context restoration (unmasking AI responses locally)
- [ ] Enterprise group policy (GPO) deployment templates

---

## 📄 License

Distributed under the **MIT License**. Refer to [`LICENSE`](LICENSE) for complete terms.

---

## 🌟 Show Your Support

If you find AEGIS useful, consider supporting the project:

* ⭐ [Star the repository on GitHub](https://github.com/starboy-hub/AEGIS)
* 🐛 [Submit an Issue](https://github.com/starboy-hub/AEGIS/issues)
* 💡 [Suggest a Feature](https://github.com/starboy-hub/AEGIS/issues/new)
* 📢 Share with your colleagues and community!
