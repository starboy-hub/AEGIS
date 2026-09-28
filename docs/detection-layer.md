# AEGIS Detection Layer — Developer Reference

How the local detection stack works and how to reuse it in your own project.
Everything here runs client-side with zero network calls.

## Module map

| Module | Path | Loads in | Purpose |
|---|---|---|---|
| `aegis-shared.js` | `src/shared/` | popup, options, content, background, tests | Storage keys, settings defaults, `strHash`, `flexiblePattern`, `maskSensitive`, `normalizeForSignature` |
| `detection-engine.js` | `src/content/modules/` | content, tests | Regex PII + context patterns, name heuristics, custom patterns, Luhn check, `cleanText` |
| `sentinel-engine.js` | `src/content/modules/` | content, tests | Inbound scam scoring: signals → level + advice, trust escalation, `shouldWarn` |
| `injection-engine.js` | `src/content/modules/` | content, tests | Prompt-injection pattern scoring |
| `fake-data.js` | `src/content/modules/` | content, tests | `FAKE_DATA` pools, `getFakeData`, `redactText` (the Protect path) |
| `aegis-vault.js` | `src/background/` | background, tests | Encrypted identity vault + trust list, per-site pseudonym map, `buildMatchers` |
| `signing-engine.js` | `src/background/` | background, tests | ECDSA P-256 content signing/verification |
| `threat-store.js` | `src/background/` | background, tests | Swarm signature store, pack export/import |
| `reality-engine.js` | `src/background/` | background, tests | Image-byte provenance forensics |

## Design rules

1. **UMD everywhere.** Each module is an IIFE assigning to `self` (browser)
   and `module.exports` (Node), so the same file runs as a content script and
   as a test require. Follow this pattern for new engines.
2. **Pure cores.** Scoring/redaction logic never touches the DOM or chrome.*
   APIs — that lives in the thin content-script glue. This is what makes the
   engines unit-testable.
3. **Redactions carry `context`.** Patterns emit `{ text: <value to swap>,
   type, context: <full match> }` so fake-data stays currency/keyword-aware
   while only the sensitive value is replaced.
4. **Value-only redaction.** Patterns whose sensitive part is a sub-match
   use capture group 1 (optionally flagged `valueGroup` for context
   patterns) so labels survive ("Date of Birth is 07/08/1985").
5. **Whitespace-tolerant replacement.** Detections run on normalized text;
   replacement uses `AEGIS.flexiblePattern(text)` so matches spanning line
   breaks still apply to the raw value.

## The scan pipeline (content script)

```
input/keyup/focusin → debounce 300ms → scanText(text)
  ├─ regex scan (vault matchers consulted separately)
  ├─ context scan (medium+)
  ├─ name heuristics (high)
  ├─ vault scan (any sensitivity — user-taught)
  ├─ custom patterns
  └─ optional Ollama classify (no high-severity hit yet)
→ popup.showAlert → user clicks Protect → performRedaction
  → redactText (longest-first, flexible) → history
```

Background passes every 2s (hidden tabs skipped):
`performScan` · `restoreVaultInResponses` · `sentinelPass` · `injectionPass`

## Adding a detection signal

1. Add to `SENTINEL_SIGNALS` (or `PII_PATTERNS`/`CONTEXT_PATTERNS`) with an
   id, human label, and weight.
2. Add corpus entries to `evaluation/corpus/messages.json` (both a scam that
   must match and a legit that must not).
3. Run `npm run benchmark` — confirm recall/precision improve without false
   alarms.
4. The regression test (`tests/benchmark.test.js`) enforces ≥95% both.

## Threat model of the detection layer itself

- Heuristics catch known shapes; novel attacks need the model layer.
- The engine cannot see encrypted, native, or non-browser channels.
- Injection hidden-text detection reads computed styles — it can be evaded
  by e.g. canvas-rendered text; treat every verdict as a signal, not truth.
