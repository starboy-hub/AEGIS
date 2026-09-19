# Contributing to AEGIS 🛡️

Thank you for your interest in contributing to **AEGIS**! Projects like this thrive because of contributors who care about data privacy and open-source security tools.

Please take a moment to review this document before submitting bug reports, proposing enhancements, or creating pull requests.

---

## 📜 Table of Contents

1. [Code of Conduct](#-code-of-conduct)
2. [Ways to Contribute](#-ways-to-contribute)
3. [Local Development Setup](#-local-development-setup)
4. [Development Guidelines](#-development-guidelines)
5. [Adding New Language Contexts](#-adding-new-language-contexts)
6. [Submitting Pull Requests](#-submitting-pull-requests)
7. [Reporting Bugs & Requesting Features](#-reporting-bugs--requesting-features)

---

## 🤝 Code of Conduct

This project is governed by the [Code of Conduct](CODE_OF_CONDUCT.md). By participating in discussions or submitting code, you are expected to uphold a welcoming, respectful, and inclusive environment.

---

## 💡 Ways to Contribute

You do not need to be a core JavaScript expert to contribute:

* 🐛 **Report Bugs:** Identify edge cases, broken DOM bindings, or uncaught PII formats.
* 💡 **Feature Requests:** Propose new detection heuristics, platform adapters, or workflows.
* 🌍 **Translations & Locales:** Add or refine multi-language contextual markers for your native language.
* 🧪 **Testing:** Verify performance and extension behavior across Chromium-based browsers (Brave, Edge, Arc, Chrome).
* 📝 **Documentation:** Clarify instructions, document architecture details, or fix typos in guides.

---

## 🛠️ Local Development Setup

AEGIS is built using standard **Vanilla JavaScript (ES6+)** and adheres to **Chrome Extension Manifest V3 (MV3)** specifications. There are no build frameworks, bundlers, or compilation steps required.

### 1. Clone Your Fork

```bash
git clone https://github.com/<your-username>/AEGIS.git
cd AEGIS
```

### 2. Load into Your Chromium Browser

1. Open your browser and navigate to the extension manager:
   * **Google Chrome:** `chrome://extensions/`
   * **Brave:** `brave://extensions/`
   * **Microsoft Edge:** `edge://extensions/`
2. Enable **Developer mode** via the toggle switch in the upper-right corner.
3. Click **Load unpacked**.
4. Select the `dist/` directory inside your cloned repository.
5. Whenever you edit files in `dist/`, click the 🔄 reload icon on the AEGIS card in `chrome://extensions/` to apply changes.

---

## 📐 Development Guidelines

To ensure compatibility, reliability, and auditability:

1. **Zero Runtime Dependencies:**
   * Do not introduce external npm dependencies or CDN bundles into runtime scripts (`content.js`, `background.js`, `popup.js`).
   * Keep the footprint lightweight to preserve sub-millisecond input performance.

2. **Privacy First & Local Isolation:**
   * Never introduce network requests or telemetry endpoints.
   * All analysis must execute within the browser sandbox or communicate with the user-hosted loopback (`localhost:11434` for Ollama).

3. **Performance & DOM Safety:**
   * Always debounce input event listeners attached to the DOM.
   * Ensure mutations to user-editable inputs (e.g., `contenteditable`, textareas) preserve the browser's native cursor placement and undo stack where possible.

4. **Code Quality:**
   * Write clean, readable ES6+ JavaScript.
   * Use descriptive variable names and comment complex regular expressions.

---

## 🌍 Adding New Language Contexts

AEGIS supports contextual PII detection across multiple languages. If you want to contribute support for a new language:

1. Locate the contextual dictionaries inside `dist/content.js`.
2. Add the language identifier ISO code (e.g., `ja`, `ko`, `it`).
3. Define relevant keyword triggers:
   * Salary & compensation markers
   * Medical diagnosis & prescription terms
   * Legal & governmental entity prefixes
4. Add corresponding localized fake-data generators in the synthetic substitution tables.
5. Provide test cases in `TESTING.md`.

---

## 🚀 Submitting Pull Requests

1. **Branching Strategy:**
   * Branch off `main`:
     ```bash
     git checkout -b feature/your-feature-name
     ```
   * Or for bug fixes:
     ```bash
     git checkout -b fix/issue-description
     ```

2. **Commit Messages:**
   * Keep commit messages descriptive:
     * `feat: add Italian contextual financial markers`
     * `fix: prevent race condition on contenteditable paste event`
     * `docs: update installation instructions for Brave`

3. **Pre-PR Checklist:**
   - [ ] Verified changes manually across at least one supported AI platform (e.g., ChatGPT, Claude).
   - [ ] No regression on existing regex patterns.
   - [ ] Ensured code formatting is uniform and free of dead debugging code (`console.log`).
   - [ ] Updated `README.md` or documentation if changing features or options.

4. **Open a PR:**
   * Push your branch to GitHub and open a Pull Request targeting `starboy-hub/AEGIS:main`.
   * Fill in the PR template detailing the problem, solution, and test steps.

---

## 🐛 Reporting Bugs & Requesting Features

* **Bug Reports:** Open an issue [here](https://github.com/starboy-hub/AEGIS/issues). Please include:
  * Operating System and Browser Version
  * Target site (e.g., chatgpt.com, claude.ai)
  * Expected vs. actual behavior
  * Sample input (anonymized/safe test text only)
* **Feature Suggestions:** Describe the motivation, architectural implications, and user experience.
