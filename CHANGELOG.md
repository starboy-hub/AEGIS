# Changelog

All notable changes to AEGIS will be documented in this file.

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
