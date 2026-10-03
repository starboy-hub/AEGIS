/**
 * AEGIS Developer Secret & Code Sanitizer Module
 * Detects API keys, tokens, database connection strings, and private keys.
 */
(function (root) {
  'use strict';

  const SECRET_PATTERNS = [
    { type: 'API_KEY', label: 'AWS Access Key ID', pattern: /\b(AKIA[0-9A-Z]{16})\b/g },
    { type: 'API_KEY', label: 'GitHub Access Token', pattern: /\b(ghp_[A-Za-z0-9_]{36}|github_pat_[A-Za-z0-9_]{82}|gho_[A-Za-z0-9_]{36}|ghu_[A-Za-z0-9_]{36}|ghs_[A-Za-z0-9_]{36}|ghr_[A-Za-z0-9_]{36})\b/g },
    { type: 'API_KEY', label: 'OpenAI / Anthropic API Key', pattern: /\b(sk-(?:proj-)?[A-Za-z0-9_-]{32,64}|sk-ant-[A-Za-z0-9_-]{32,64})\b/g },
    { type: 'API_KEY', label: 'Stripe Secret Key', pattern: /\b(sk_live_[0-9a-zA-Z]{24,34})\b/g },
    { type: 'CREDENTIALS', label: 'JWT Bearer Token', pattern: /\b(eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,})\b/g },
    { type: 'PRIVATE_KEY', label: 'Private RSA / SSH Key', pattern: /-----BEGIN\s+(?:RSA|OPENSSH|EC|DSA|PGP)\s+PRIVATE\s+KEY-----[\s\S]*?-----END\s+(?:RSA|OPENSSH|EC|DSA|PGP)\s+PRIVATE\s+KEY-----/gi },
    { type: 'DATABASE_URI', label: 'Database Connection String', pattern: /\b((?:mongodb(?:\+srv)?|postgres|postgresql|mysql|redis):\/\/[^\s"'<>]+)\b/gi }
  ];

  function scanSecrets(text) {
    if (!text || text.length < 15) return { alerts: [], redactions: [] };
    const alerts = [], redactions = [], seen = new Set();
    SECRET_PATTERNS.forEach(rule => {
      const re = new RegExp(rule.pattern.source, rule.pattern.flags);
      let m;
      while ((m = re.exec(text)) !== null) {
        if (!m[0]) { re.lastIndex++; continue; }
        const matched = m[1] || m[0];
        if (!seen.has(matched)) {
          seen.add(matched);
          alerts.push({ type: rule.type, label: rule.label, source: 'secret-engine', severity: 'critical' });
          redactions.push({ text: matched, type: rule.type, label: rule.label, context: matched.slice(0, 40) });
        }
      }
    });
    return { alerts, redactions };
  }

  const AEGIS_SECRETS = {
    SECRET_PATTERNS,
    scanSecrets
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = AEGIS_SECRETS;
  else root.AEGIS_SECRETS = AEGIS_SECRETS;
})(typeof self !== 'undefined' ? self : this);
