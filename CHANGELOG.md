# Changelog

All notable changes to AEGIS will be documented in this file.

## [6.6.0] - 2026-09-27

### Added — 🧬 Reality Check: synthetic-media provenance

- Right-click any image → **"AEGIS Reality Check this image"** — the
  background fetches the image bytes and scans them for AI-provenance
  metadata: C2PA/JUMBF content-credential manifests, IPTC
  digital-source-type labels (trainedAlgorithmicMedia), generator software
  signatures (Stable Diffusion, Midjourney, DALL·E, Firefly, Imagen, Flux,
  "Made with AI"…), and diffusion-model parameter blocks (Steps/Sampler)
- Verdict banner with the detected generator name and an honest disclaimer:
  metadata proves AI origin when present; its absence does NOT prove an
  image is real (metadata is often stripped)
- Editor-only software tags (Photoshop/GIMP) are reported as informational
  and never escalate to "AI-generated"
- New `contextMenus` permission (image context menu only); engine is a pure
  module with byte-fixture tests. 105 tests passing (was 98)

## [6.5.0] - 2026-09-27

### Added — 🛡️ Injection Firewall: prompt-injection detection

AEGIS now detects content crafted to hijack AI systems — the attack surface
of the agentic-AI era.

- **Injection engine** (`src/content/modules/injection-engine.js`): weighted
  detection of instruction-override phrases, fake system/role markers
  (`System:`, `[INST]`, `<|im_start|>`), system-prompt extraction attempts,
  data-exfiltration instructions, safety-bypass phrases, encoded-payload
  tricks, and AI-directed language — scored like Sentinel
- **Hidden-text detection — the signature capability**: injection payloads
  are typically invisible to humans (transparent color, white-on-white,
  1px fonts, `text-indent: -9999px`, off-screen positioning, `display:none`)
  but fully readable by AI scrapers and agents. AEGIS compares DOM text
  against rendered styles and flags invisible instruction text; legitimate
  screen-reader text stays whitelisted (it must carry injection patterns or
  be substantial AI-directed text to flag)
- **Page banner** (stacks with the Sentinel banner), audit-history recording
  (message text never stored), and a dedicated `injectionFirewall` setting
  (default on)
- False-positive guards verified: ordinary phrases ("You are now leaving our
  website", "send the data to the server", recipe instructions) do not flag
- **6th E2E journey**: planted hidden injection text in the mock page must
  trigger the banner; `npm run test:e2e` now rebuilds dist first (E2E always
  tests the current build). 98 unit tests passing (was 87)

## [6.4.1] - 2026-09-27

### Added — 🧪 E2E test net (Playwright)

- Five end-to-end tests driving the *real built extension* in real Chromium
  against a mock AI-chat page (`e2e/`): extension load + dashboard, outbound
  PII detection + Protect swap, submission-guard block/cancel, the full Vault
  journey (teach via Options → detect plain name → deterministic pseudonym),
  and the Sentinel scam banner
- `npm run test:e2e` (Playwright 1.44, pinned for macOS 12 support);
  extensions require headed Chromium, so CI runs the suite under xvfb as a
  dedicated job
- 87 unit tests unchanged and green

## [6.4.0] - 2026-09-27

### Added — 🚨 Sentinel: inbound scam defense (AI vs AI)

AEGIS now watches the *other* direction: what AI-generated content delivers
to you.

- **Sentinel engine** (`src/content/modules/sentinel-engine.js`): weighted
  scam-signal analysis of inbound messages — credential/OTP requests, payment
  pressure (gift cards, crypto, wires), authority impersonation, too-good
  offers, personal-info fishing, off-platform shifts, secrecy demands,
  artificial urgency, link pressure. Scored → none / low / suspicious /
  dangerous, with plain-language advice
- **Page banner**: when a scanned message crosses the threshold, AEGIS shows
  a dismissible warning naming the strongest signals and what to do
- **AI-vs-AI second opinion**: gray-zone ("suspicious") messages are sent to
  the local Ollama model for a scam/legit/unclear verdict — a scam verdict
  escalates the warning (new SENTINEL_LLM background message)
- Analyzed messages are hashed and deduplicated; detections record in the
  audit history (type SENTINEL, message text never stored)
- Toggle: settings.sentinelEnabled (default on)

## [6.3.1] - 2026-09-27

### Fixed
- Vault was unavailable on pages: aegis-vault.js was missing from the content
  script list in the manifest (background loaded it, pages did not) —
  "AEGIS_VAULT is not defined" at startup, vault detection and restore
  silently disabled. Now loaded before content.js
- Options page crashed rendering the vault list: aegis-shared.js was never
  loaded there (AEGIS.maskSensitive undefined)

## [6.3.0] - 2026-09-27

### Added — 🔐 The Identity Vault

AEGIS now knows who to protect. You teach it your real details once; from
then on it catches, pseudonymizes, and un-masks them — all locally.

- **Encrypted local vault** (Options → Identity Vault): store your name,
  email, phone, and any custom values (address, employer, IDs). Encrypted at
  rest with AES-256-GCM using a device-local key — plaintext never touches
  storage, and the vault never syncs or leaves the machine
- **Vault-aware detection**: user-taught values are detected in typed text at
  any sensitivity — plain names, any phone formatting, flexible whitespace —
  closing the biggest gap in pattern-only detection
- **Deterministic pseudonyms**: each vault value gets one stable fake per
  site (persisted), so "Sarah Mitchell" is always the same person within a
  conversation and the AI's answers stay coherent
- **Reversibility**: when an AI response contains one of your pseudonyms,
  AEGIS restores your real value in the displayed text (toggle: "Un-mask in
  responses"). Sendable fields are never touched, so restore cannot leak
  anything outbound
- Vault values are flagged `critical` and recorded in the audit history;
  exports still mask originals

### Technical
- `src/background/aegis-vault.js`: `createVault(storage, crypto)` factory
  (AES-GCM, WebCrypto) + `buildMatchers` — fully unit-tested with in-memory
  storage, including encryption-at-rest assertions
- New background message API: VAULT_LIST/ADD/REMOVE/CLEAR/CORPUS,
  PSEUDO_RECORD/GET_MAP
- `aegis-shared.strHash` (FNV-1a) for deterministic pool picks; new
  `vaultRestore` setting (default on)

## [6.2.1] - 2026-09-27

### Fixed
- Context matches consumed trailing whitespace when the capture allowed it
  (the diagnosis pattern's class includes \s), so "diagnosed with type 2
  diabetes" redacted to "migraines2 seasonal depression" — the space before
  the next word vanished. Matches are now trimmed before redaction;
  spacing around replacements is preserved exactly

### Note
- Credit-card detection requires a valid Luhn checksum (v6.2.0), so the old
  demo card number is intentionally ignored — test with 4111 1111 1111 1111

## [6.2.0] - 2026-09-27

Polish sprint — the popup's "coming soon" era ends.

### Added
- **Real audit-log export** from the toolbar popup: downloads the protection
  history as `aegis-audit-<date>.json` (summary + every entry with type,
  site, timestamp). Originals are masked to a 2-character prefix — an audit
  file must never leak the secrets it helped protect
- **Luhn pre-check on credit-card detection**: a 16-digit number is only
  flagged when it passes the checksum, so order IDs and tracking codes stop
  triggering critical alerts. `luhnValid` is exported for reuse/testing
- **`redactText`** in fake-data.js: the Protect path (longest-first,
  whitespace-tolerant replacement with recorded swaps) is now a pure,
  unit-tested function; content.js `performRedaction` delegates to it

### Changed
- In-page JSON/CSV exports now mask originals too (previously dumped raw
  secrets to file)
- Dropped unused dependencies (React, Vite, TypeScript, ts-jest and friends)
  — installs are dramatically smaller; jest config simplified to plain JS

### Note
- With Luhn pre-check, test/demo card numbers must be checksum-valid —
  e.g. `4111 1111 1111 1111`. The old sample card intentionally fails Luhn
  and is (correctly) no longer flagged

## [6.1.3] - 2026-09-27

From the third manual test pass (all v6.1.2 fixes verified working):

### Fixed
- Credentials redaction ate its own label ("My password is" was consumed
  along with the secret, leaving a naked generated password). The
  CREDENTIALS pattern is now value-only like the other sub-value patterns:
  "My password is hunter2secret" → "My password is Vq7#…" — label kept,
  secret swapped. Also handles "password is: x" and "pwd=x" forms

## [6.1.2] - 2026-09-27

Refinements from the second manual test pass:

### Changed
- **Credentials now get a realistic random password** instead of the
  `[REDACTED-CREDENTIALS]` placeholder (14+ chars, mixed case, digits, symbols)
- **Value-only redaction extended to context patterns** where the sensitive
  part is a sub-value, keeping sentences readable:
  - "I am taking metformin daily" → "I am taking loratadine daily" (was
    "loratadine daily")
  - "my salary is $150,000 per year" → "my salary is $75,000 per year" (was
    "$75,000 per year")
  - "I work at TechCorp in Seattle" → "I work at Acme Corp in Seattle"
- **Employment capture is bounded** — stops at the company name instead of
  greedily consuming the rest of the message (previously swallowed trailing
  sentences like "- My friend Sarah Mitchell recommended this" into the
  replacement)

### Fixed
- Double "MRN MRN" in redacted medical records — the fake pool carried its
  own "MRN" prefix while value-only redaction already preserves the label;
  pool values are now bare digits

### Added
- Tests: valueGroup semantics (drug/amount/employer), bounded employment
  capture, random password shape, bare MRN fakes — 55 passing (was 51)

## [6.1.1] - 2026-09-27

Fixes found by the first full manual test pass (paste of a 16-line sample
message into a real AI chat):

### Fixed
- **Credentials leaked their secret**: the CREDENTIALS pattern matched the
  phrase ("My password is") but not the value after it — passwords/API keys
  survived Protect. The pattern now consumes the secret too, and ignores
  innocent phrases like "I forgot my password manager"
- **Matches spanning line breaks were silently not redacted**: detections are
  computed on whitespace-normalized text, but replacement ran on the raw
  value — a match like the EMPLOYMENT one crossing a newline never matched
  again and was skipped without error. Replacement is now whitespace-tolerant
  (`AEGIS.flexiblePattern`)
- **Sensitivity changes did not reach open pages**: the content script only
  watched theme/language changes, so setting Sensitivity to High never armed
  name detection on already-loaded tabs. Settings changes now propagate live
- **Labeled PII lost its label when redacted** ("My Date of Birth is
  04/15/1990" became "My 07/08/1985"). Value-carrying patterns (DOB,
  passport, bank account, driver license, medical record) now redact only the
  captured value, keeping the label; the full match is passed as context so
  currency-aware fake data still works

### Added
- Regression test replays the exact manual-test text end-to-end: all 10 regex
  types detected, context types detected, every redaction matchable in raw
  text, secret covered. 51 tests passing (was 43)

## [6.1.0] - 2026-09-27

### Added
- Real test coverage of the shipped engine: detection patterns, context
  scanning, name heuristics, custom patterns, and fake-data safety moved into
  `src/content/modules/detection-engine.js` and `fake-data.js` (UMD modules
  loaded by the manifest and required by tests) — the content script no longer
  carries inline copies
- GitHub Actions CI: lint, test, build, and a dist-completeness check on every
  push and pull request
- ESLint config repaired (invalid `chrome-extension` env made lint unrunnable);
  codebase now lints clean

### Changed
- Manifest version is stamped from package.json at build time — versions can
  no longer drift between the two
- Idle scanning now skips hidden tabs (battery/CPU win) and rescans instantly
  when an input is focused or a hidden tab becomes visible

### Removed
- Orphaned `modules/detection.js` and `modules/ui-overlay.js` (never imported
  by any shipped code) and their stale tests

## [6.0.0] - 2026-09-27

### Fixed
- Unified `src/` and `dist/` into one codebase: the full detection/redaction engine
  (popup UI, submission guard, attachment guard, history) now lives in
  `src/content/content.js`; `npm run build` no longer overwrites it with a stub
- Restored the Ollama AI detection layer: `background.js` referenced an undefined
  `ollamaAvailable` variable, crashing every CLASSIFY_TEXT request
- Popup dashboard now shows real stats — it read `totalProtected`/`todayProtected`/
  `sitesVisited` keys that nothing ever wrote; it now derives them from the same
  history the content script records
- Dark mode: popup toggle wrote `chrome.storage.local.theme` while content scripts
  read `chrome.storage.sync.theme`; all contexts now share one theme key and pick
  changes up live via `storage.onChanged`
- "Protect" crashed with `Illegal invocation` on `<input>` elements (native value
  setter was always taken from `HTMLTextAreaElement`)
- Pause/Resume buttons no longer send messages the background script never handled;
  the pause timer is now managed directly in the content script
- Settings defaults single-sourced in `src/shared/aegis-shared.js`

### Changed
- Fake credit cards now deliberately FAIL the Luhn checksum — they can never be
  mistaken for chargeable cards
- Fake SSNs use only areas the SSA never issues (000, 666, 900–999)
- Version aligned at 6.0.0 across package.json and manifest.json
- Removed unused `clipboardRead` permission
- Removed stale root `manifest.json`, `temp.js`, and tracked `.DS_Store` files
- `.gitignore` repaired (was wrapped in markdown fences) and now also ignores
  `coverage/`

### Added
- `src/shared/aegis-shared.js`: one source of truth for storage keys, default
  settings, and dashboard stats, loaded in popup, content, background, and tests
- Tests: Luhn-invalid card guarantee, never-issued SSN guarantee, shared stats
  logic, and a pin keeping the inline fake-data copy in sync

## [5.5.0] - 2024-XX-XX

### Added
- Multi-language support (EN, ES, FR, DE, PT, IT, RU, ZH, AR)
- Context-aware PII detection for medical, financial, and employment data
- Image upload warning dialogs
- Custom user-defined pattern support
- Dark mode overlay theme support

### Changed
- Refactored content.js into modular structure
- Improved build process to copy all required files
- Updated manifest to use src/manifest.json as single source of truth

### Fixed
- Missing options.html and options.js in dist folder
- Icon generation during build
- Theme color application to overlay elements

## [5.4.0] - Previous Release
- Initial PII detection implementation
- Basic fake data replacement
- Chrome extension manifest V3 support
