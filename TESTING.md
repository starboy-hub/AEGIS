# AEGIS Testing Guide

## Running Tests

```bash
npm test
```

## Manual Testing Checklist

### Core Functionality
- [ ] PII detection in text inputs (SSN, email, phone, credit card)
- [ ] Context-aware detection (medical conditions, salary info)
- [ ] Fake data replacement when "Protect" is clicked
- [ ] Warning dialog appears on sensitive data detection
- [ ] Image upload warning shows for file inputs

### Multi-language Support
- [ ] English translations work correctly
- [ ] Spanish, French, German, Portuguese, Italian, Russian, Chinese, Arabic translations display properly

### Browser Compatibility
- [ ] Chrome/Edge extension loads without errors
- [ ] Extension icon appears in toolbar
- [ ] Popup opens and shows settings
- [ ] Options page is accessible

### Privacy Features
- [ ] No data leaves the browser (check Network tab)
- [ ] Clipboard read permission works only when triggered by user
- [ ] Settings persist across browser sessions

## Automated Test Structure (Future)

```
tests/
├── unit/
│   ├── detection.test.js
│   ├── fake-data.test.js
│   └── ui-overlay.test.js
├── integration/
│   └── content-script.test.js
└── e2e/
    └── extension-flow.test.js
```

## Debugging Tips

1. Open Chrome DevTools on the extension page: `chrome://extensions` → "Inspect views"
2. Check console logs for "🛡️ AEGIS" messages
3. Use the popup to toggle protection on/off
4. Test with sample PII data from the README
