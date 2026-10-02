# Changelog

All notable changes to AEGIS will be documented in this file.

## [9.4.0] - 2026-10-02

### Added — 🤝 Companion: streaming re-hydration + agent wrapper

The agent firewall closes the loop: your values leave pseudonymized and
come back readable — to you, never to the AI.

- **Stable token mapping**: a protected value now always maps to the same
  `[AEGIS-n]` token (position-derived), making bidirectional rewriting
  possible across requests and responses
- **SSE re-hydration** (`companion/sse-rewrite.js`): streamed AI responses
  are rewritten inside `data:` events — a token split across network chunks
  or across two events is carried and re-assembled before the user sees it;
  JSON payloads that match nothing stay byte-identical
- **Buffered response re-hydration**: non-streaming responses get the same
  treatment (bounded at 8 MB, content-length fixed, transfer-encoding
  corrected)
- **CONNECT tunneling**: HTTPS traffic is tunneled (not inspected) so
  wrapped agents work against https:// endpoints — body inspection of TLS
  traffic remains a deliberate future decision
- **`companion/aegis-wrap.js`**: `aegis-wrap --mode=guard
  --protect='["..."]' -- <command>` starts the firewall, launches any CLI
  agent with proxy env vars set, and tears down on exit
- Fixed a latent crash (undefined `mode` in the no-body log path)
- 25 companion tests (232 total)

### Honest limits
HTTPS bodies are tunneled, not read — full inspection needs a locally
trusted CA (Phase C decision). Plain HTTP (e.g. local Ollama) is fully
inspected end to end.
## [9.3.0] - 2026-10-02

### Added — 🎓 Fine-tuned classifier: the model is finally ours

The fine-tune sprint lands: AEGIS now ships its own trained classifier.

- **Bundled fine-tuned model** (`src/offscreen-model`, 26 MB quantized
  MobileBERT, 3-class legit/scam/injection): trained on 193 hand-curated
  seeds in Colab, exported through an in-session verification gate that
  compares the ONNX graph against the live PyTorch model sentence-by-sentence
  and refuses to package drift. No Hugging Face download — fully offline,
  fully ours.
- **Measured on the held-out corpora** (never seen in training, through the
  real runtime bundle): **injection 7/7 recall, 0 false alarms** — solving
  what zero-shot provably could not — and **adversarial scam recall 50%**
  (7/14), up from 21% zero-shot and 0% heuristics-only.
- **Tiered severity**: the scam head trips on ~21% of ordinary-but-scam-shaped
  messages, so a model-only catch (no heuristic signal at all) warns at
  "suspicious" and never escalates to "dangerous" on its own. Confirmed weak
  warnings still escalate fully.
- **Injection consults re-enabled in-browser** (zero-shot was measured
  unreliable; the fine-tuned head is not): the Injection Firewall now gets a
  semantic second opinion from the bundled model with no Ollama needed.
- **Training pipeline in-repo** (`evaluation/training/`): 193 seeds + author
  source + automated Ollama scaler + Colab notebook; **measurement tool**
  `evaluation/measure-ft.js`.
- Runtime cost dropped: one 128-token forward pass per consulted text
  (previously seven hypothesis forwards).

### Honesty notes

- Scam recall 50% misses the 60% sprint goal on this corpus — the misses are
  implied-ask attacks ("stuck with the hotel till Monday"); more and harder
  seeds are the path.
- The scam head false-alarms on scam-shaped-but-honest messages (urgent
  plumbers, bank callbacks); the tiered severity is the designed containment.
## [9.2.0] - 2026-10-01

### Added — 🧠 Semantic layer: the model now sees what heuristics miss

Priority #5 continued — the runtime gap that made adversarial recall 0% even
WITH a model connected is closed.

- **Consult-on-nothing**: with an AI backend connected, Sentinel now consults
  the model on texts the heuristics scored `none` (and `low`) — not just
  gray-zone ones. Keyword-free adversarial scams never reached the model at
  all before this. Capped at 8 consults/page; behavior without a backend is
  byte-for-byte unchanged.
- **Semantic engine** (`src/content/modules/semantic-engine.js`): per-fact
  zero-shot NLI for scams (minimal single-fact hypotheses — disjunctions kill
  entailment — scored as entail−contradict, decided on the sum of positive
  facts) plus the decision scaffold for injection.
- **In-browser model upgrade**: offscreen now runs the raw NLI head
  (per-hypothesis probabilities + entailment logits) instead of the zero-shot
  pipeline, with a load-time sanity check (catches the transformers v4
  `text_pair` trap, where a second positional string is silently ignored).
- **Measurement tooling**: `evaluation/capture-scores.js` +
  `evaluation/semantic-eval.js` run the exact shipped model bundle over all
  corpora and grid-search the decision thresholds (resumable, local-only —
  `npm run eval:semantic`).

### Measured (the honest part)

- **Scam: adversarial recall 0% → 21.4% (3/14) at 100% adversarial
  precision**, 3 false alarms on 154 core messages. Heuristics stay the
  instant first line; the model adds the keyword-free slice.
- **Injection: every zero-shot frame measured INVERTED** on ordinary pages
  (negatives outscore reworded attacks). In-browser injection verdicts are
  disabled by measurement; injection consults require Ollama.
- The zero-shot ceiling is documented; the ≥60% adversarial-recall goal moves
  to the fine-tuned-classifier sprint.

## [7.5.0] - 2026-09-30

### Added — 🎯 Adversarial benchmark: the generalization measurement

Priority #1 of the saviour roadmap: measure what the old corpus could not.

- **Adversarial corpora** (`evaluation/corpus/adversarial.json`,
  `injection-adversarial.json`): 26 messages engineered with zero keyword
  overlap against current signals — indirect payment requests, invented
  procedures, casual authority framings, reworded prompt injections — plus
  hard-negative legit messages sharing structural features with scams
- **Benchmark rewritten** to score both splits: core (known-category
  coverage) and adversarial (generalization). Results JSON carries both
- **Regression guards**: core ≥95% precision/recall (unchanged); adversarial
  recall/precision never drop below the recorded baseline
- Baselines recorded: core 100/100; **adversarial 0/0** — the engine detects
  what it was built to detect and nothing else yet. This number is the
  success metric for the semantic classifier work ahead

### Why this matters
A 100% score on a co-developed corpus says nothing about reworded attacks.
The adversarial split now quantifies that gap: every AI-rewritten scam in
the set evades current detection. Closing this gap (fine-tuned semantic
classifier) is the next sprint — with a baseline to prove it.

## [7.4.1] - 2026-09-29

### Changed — 🧠 One model, three engines

The in-browser/Ollama model is no longer scam-only. A unified `aiClassify`
router (Ollama first, in-browser model second) now serves **three consult
sites**, with per-kind hypotheses and prompts:

- **Sentinel**: scam-vs-normal on gray-zone messages (as before)
- **Injection Firewall**: manipulation-vs-normal second opinion on
  suspicious pattern findings — catches reworded injections the patterns
  miss (kind-aware few-shot prompt in the background)
- **Webmail**: model verdicts on flagged emails before the note shows

### Fixed
- Orphaned code fragment after the webmail pass (leftover from a prior
  edit) — never executed, but removed
- Shared LLM call budget across all three engines (8/page) prevents model
  flooding

## [7.4.0] - 2026-09-29

### Added — 📧 Phase 2: Webmail Shield + 🤖🗣️ Phase 4: companion tools

**Webmail Shield (Gmail/Outlook):**
- `webmail-profile.js`: DOM extraction of sender + subject per message
  (Gmail `span[email]` rows, Outlook `aria-label` list items), with graceful
  degradation when the webmail DOM changes
- Email-specific sender forensics: corporate display names writing from free
  providers (spoofing signal), lookalike/typosquat domains of 21 major brands
  (Levenshtein distance ≤2 on 8+ char roots, gated by a corporate-ish display
  name so job boards never trip it)
- **Sent-mail skip**: the user's own outgoing mail is never scanned
- Findings fold into Sentinel scoring (`applySignals`), notes name the
  sender, history records the sender address (no body text)
- E2E journey 8: mock-Gmail page → scam email flagged with the sender shown,
  legit mail stays quiet

**Agent Firewall (companion tool, working CLI):**
- `companion/aegis-agent-firewall.js`: local loopback HTTP proxy for AI
  agents — monitor / guard / lock modes; scans outbound bodies with the same
  detection + injection engines; guard mode tokenizes configured sensitive
  values with stable tokens; lock mode blocks injection payloads and
  untokenized PII; verified with a live two-server roundtrip test

**Voice Canary (companion tool, working CLI):**
- `companion/aegis-canary.js`: challenge-response caller verification — the
  anti-deepfake core. Generates personal/generic challenges a cloned voice
  cannot answer, with the trust rules printed alongside
- Full audio analysis remains future work (see companion/DESIGN.md)

### Fixed
- Agent firewall: rewritten bodies no longer carry the original
  content-length (upstream hang); decision scoping bug
- Webmail typosquats: 2-edit distances on long roots (rnicrosoft) now caught,
  gated against false positives on legitimate similar domains

### Stats
- 143 unit tests (was 125), 8 E2E journeys (was 7), all green
- NEW: e2e/ui.spec.js — 26 UI functional checks (every popup + options control: toggles, selects, vault, trust, sign/verify incl. tamper rejection, swarm export/import, export masking, validation gate) + service-worker engineering checks (reality forensics, vault encryption-at-rest, malicious-message rejection)
- Companion tools verified live: voice canary challenge output; agent firewall guard-mode roundtrip (SSN + name tokenized, logged)

## [7.3.0] - 2026-09-28

### Added — 🌐 Phase 1.5: in-browser AI model (no Ollama required)

The Sentinel model chain is now: **Ollama → in-browser model → heuristics**.
Every user can have an AI classifier, with or without a local server.

- transformers.js runs `Xenova/mobilebert-uncased-mnli` (quantized, ~25 MB)
  in a Chrome **offscreen document** — zero page jank, WebGPU when available,
  WASM fallback
- **Opt-in with honest cost**: the Options toggle explains the one-time ~25 MB
  download from the Hugging Face Hub; after that, classification is fully
  offline and message text never leaves the device
- Same semantics as the Ollama model: scam verdicts escalate weak warnings,
  confident legit verdicts suppress false positives
- New `offscreen` permission and `wasm-unsafe-eval` CSP entry (the sanctioned
  way to run ONNX Runtime); runtime vendored into `dist/vendor/` by the build
- verify-dist.js validates the offscreen page and the vendored runtime

## [7.2.0] - 2026-09-28

### Fixed — 🧠 The local model is now the primary classifier (real AI vs AI)

- **Critical discovery**: the background hardcoded `model: 'llama3'`. On a
  machine where Ollama runs a different model, every AI call 404'd and
  silently fell back to "unclear" — the AI layer never executed despite
  Ollama running. The installed model is now **auto-detected** via
  `/api/tags` (preference: llama3.2/3.1/3/2 → mistral → gemma → qwen → phi →
  first available) and used for both classification calls
- Popup "Local AI analysis" row shows the real state: "Connected ·
  llama3.2:3b" or install guidance; startup log includes the model
- **Model-primary classification**: with a local AI connected, the model has
  final say on gray-zone and weak-signal messages — it escalates
  keyword-free scams to dangerous (with confidence) and can suppress weak
  heuristic false positives (legit verdict, ≥60% confidence). Heuristics
  remain the instant defense without a model
- Per-page LLM call cap (8) prevents model flooding; verdicts outside the
  allowlist are ignored

### Removed
- Dead TOGGLE/PAUSE/RESUME_AEGIS message handlers (unused since the popup
  rewrite)

*(v7.1.1 was a version bump carrying the v7.1.1 hardening commit; no
separate entry.)*

## [7.1.0] - 2026-09-28

### Changed — 🔇 The Quiet Guardian (UX overhaul)

The audit found eight interrupt surfaces, four colliding full-width banners,
and no alert memory — uninstall-grade UX. This release replaces all of it
with a single, calm notification system.

**One notification surface.** The four banner systems (Sentinel, Injection,
Reality, Signature) are gone. One compact toast appears bottom-right, queued
one-at-a-time with the most severe first, auto-dismissing (6s, dangerous
12s). Details live in the popup, not stacked over the page.

**Severity ladder.** Low findings are badge-only — never a toast. Dangerous
toasts turn the shield red. The submission modal remains the only blocking
surface (by design).

**Dismissals are honored.** Every toast offers "Ignore on this site" and
"Never warn about this" (per-signal mute, persisted in settings). Site mutes
silence Sentinel/Injection passes on that host.

**The bubble earns its place.** New setting (default: "when there's
something to say"): the floating shield is hidden until a finding, alert, or
Family mode makes it relevant. No more permanent furniture.

**Signal hygiene at the source.** Weak signals (urgency wording, link
pressure, AI-directed language) can never produce more than a low note
alone. Quoted/code/blockquote framing is excluded from injection scanning
(articles *about* injection are not attacks). One note per page per engine.

**Popup: three tabs.** Overview (status, layers, stats) / **Alerts** (this
page's findings with per-item Ignore, via new GET/DISMISS_PAGE_ALERT
messages) / History (last 10 + export/clear).

**Options: advanced tools collapsed.** Custom patterns, Sign & Verify, and
Swarm packs moved into collapsible sections — the default view is the
guardian essentials.

### Fixed
- Injection pass now excludes quoted/blockquote/code framing (articles about
  prompt injection no longer trigger the firewall)
- Bubble hidden/reshown state is consistent after every render

### Tests
- E2E updated to the note surface (7/7 green); unit suite unchanged (125)
- Bubble visibility patched through popup.render so state stays consistent

## [7.0.1] - 2026-09-28

### Added — Security & community hardening (from external audit triage)

- **Message validation**: every inbound background message is shape-checked
  (`validateMessage`) before a handler runs — malformed internal calls get
  rejected instead of reaching storage
- **Security model documented**: `docs/SECURITY-MODEL.md` (vault key
  lifecycle, trust boundaries, honest limitations) and
  `docs/ARCHITECTURE.md` (entry points, message flow, storage model)
- **SECURITY.md** (private vulnerability reporting) and
  **CODE_OF_CONDUCT.md** (Contributor Covenant 2.1)
- **Release automation**: `release.yml` — tagging `v*` builds, verifies,
  packages and publishes a GitHub Release with the store zip
- **Supply chain**: Dependabot (npm + actions, weekly) and `npm audit
  --audit-level=critical` in CI
- Thresholds extracted to constants in the Sentinel/Injection engines;
  example comments on the highest-weight scam signals
- `private: true` in package.json (prevents accidental npm publishing)

## [7.0.0] - 2026-09-28

### Added — Measured defense: benchmark, model protocol, distribution prep

**Phase 0 — benchmark harness (the honest baseline):**
- `evaluation/corpus/messages.json`: 154 labeled original messages — 12 scam
  categories (lottery, bank phishing, tech support, crypto, romance, job,
  delivery, invoice, charity, government, account alerts, subtle AI-written)
  and legit halves including hard negatives (salary talk, real bank notices,
  urgent-but-honest requests)
- `evaluation/benchmark.js` + `npm run benchmark`: precision/recall/F1 at the
  warn threshold, per-category breakdown, miss/false-alarm lists,
  `--update-baseline` locking
- First honest baseline: **precision 93.3%, recall 63.6%** — then engine
  tuning (new signals: investment pressure, emergency money requests, job
  scams, delivery/customs fees, invoice fraud, account-lock threats, tech
  support; request-context credential matching to kill false alarms) brought
  it to **precision 100% / recall 100% / F1 1.000 on the corpus**
- Regression guard test enforces ≥95% precision and recall; the corpus
  measures known-category coverage, not real-world generalization (documented)

**Phase 1 — model-based defense protocol:**
- SENTINEL_LLM upgraded to a few-shot classification protocol with explicit
  scam/not-scam guidance, strict JSON, verdict allowlist, and confidence —
  served with `format: json` to the local model

**Phase 3 — distribution prep:**
- `store/LISTING.md` (store copy, permission justifications, screenshot plan),
  `store/PRIVACY-POLICY.md`, `scripts/pack.js` + `npm run pack` → store-ready
  zip

**Phase 4/5 — designed and documented:**
- `companion/DESIGN.md`: desktop companion blueprint (voice-canary call
  screening, agent-traffic firewall, unified report) — design only
- `docs/detection-layer.md`: developer reference for reusing the engines

**README:** full rewrite — guardian-stack presentation, measured benchmark
section, honest limitations, repository map, honest roadmap.

**Stats:** 128 unit tests (was 120), 7 E2E journeys, 154-message corpus.

## [6.9.0] - 2026-09-28

### Changed — 🎨 Front-end redesign (popup + options)

One cohesive design system across both surfaces: brand gradient
(#667eea→#764ba2), card layout, real toggle switches, dark mode throughout.

**Toolbar popup — now a guardian dashboard:**
- Status pill showing per-site state ("Active on this site" / "Trusted site —
  paused here" / "Standby")
- Protection-layers panel: Shield, Sentinel, Injection Firewall, Local AI,
  Family Guardian — every layer visible and toggleable from the popup
- Family-mode badge; sensitivity selector; dark-mode and settings buttons
  in the hero
- Recent-activity feed (last 3 protections, color-coded by type)
- Hero stat ("protected today") with all-time/sites row; destructive
  Clear-stats demoted to a text link; Export stays primary
- Version now read from the manifest at runtime — never stale again

**Options page — grouped cards instead of one long list:**
- Sticky gradient header with live version chip; seven sections: Detection,
  Guardian, Identity Vault, Trust Graph, Trusted Sites, Sign & Verify,
  Swarm Defense
- Ollama status as a proper chip ("● Connected" / "○ Not running")
- Consistent toggle switches, inputs, list items; dark mode everywhere

**Tooling:**
- verify-dist.js now also validates every stylesheet/script referenced by
  the HTML pages (the redesign's failure class can never ship silently)
- No logic changes; all element IDs preserved — 120 unit + 7 E2E journeys
  green against the new UI

## [6.8.0] - 2026-09-27

### Added — ✍️ Content Signing + 🐝 Swarm Defense (swarm-ready)

**Content signing — prove text is yours, unmodified:**

- Every AEGIS install now has a device-local ECDSA P-256 signing keypair
  (JWK in chrome.storage.local, generated on first use)
- Options → **Sign & Verify**: sign any text into a portable
  `-----BEGIN AEGIS SIGNED MESSAGE-----` block; anyone with AEGIS can
  verify it — the exact text, signed on the exact date, unmodified
- Content script: signed blocks found on pages are verified live — a
  **failed** signature (tampered or forged content) triggers a red warning
  banner; this is what makes AI-forged "signed" impersonations detectable

**Swarm defense — swarm-ready threat signatures:**

- Dangerous messages flagged by Sentinel are recorded as anonymized
  normalized-text hashes (never the message text) in a local threat store
- Sentinel checks every inbound message against known signatures first —
  known scams get a "🐝 known scam signature" tag on the banner
- Options → **Swarm Defense**: export/import threat packs (JSON, hashes
  only by construction) — hand-carry immunity between AEGIS installs today
  (e.g. parent → grandparent), federate via a relay when there are users
- Signature normalization defeats trivial variation (case, whitespace,
  punctuation); packs deduplicate on import and are size-capped

### Technical
- `signing-engine.js`: `createSigner(storage, crypto)` — ES256 sign/verify,
  portable block format, tamper detection; `threat-store.js`:
  `createThreatStore` with pack export/import; 120 unit tests (was 112)

## [6.7.0] - 2026-09-27

### Added — 🏦 Trust Graph + 👨‍👩‍👧 Family Guardian Mode

**Trust Graph.** The Vault now also holds your real organizations and
contacts (encrypted like identity values, used for matching — never masked):

- When a pressure message (suspicious or worse) names one of YOUR trusted
  organizations, Sentinel escalates it to **dangerous** with the signal
  "Impersonates YOUR trusted organization" — knowing which bank is *yours*
  turns generic scam detection into personal scam detection
- Manage the trust list in Options (orgs and contact addresses, encrypted at
  rest, independent of identity entries)
- Verified: benign mentions of trusted names never escalate (pressure
  patterns required); no duplicate escalation

**Family Guardian Mode.** One toggle (Options) for protecting loved ones:

- Arms every layer (Sentinel, Injection Firewall, Vault restore)
- Strictest Sentinel thresholds — warns even on mild ("low") pressure
  patterns, banners marked "Family Guardian"
- New E2E journey: teach "Global Bank" → the planted scam message naming it
  escalates with the impersonation signal. 112 unit tests (was 105), 7 E2E
  journeys (was 6)

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
