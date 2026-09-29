#!/usr/bin/env node
/**
 * AEGIS Agent Firewall — companion tool (Phase 4)
 *
 * A local loopback HTTP proxy that sits between AI agents/apps and the
 * internet. Outbound bodies are scanned with the same engines the extension
 * uses (detection, injection) and, in Guard mode, sensitive values you
 * configure are pseudonymized before leaving the machine.
 *
 * Usage:
 *   node companion/aegis-agent-firewall.js --mode=guard --protect=values.json
 *   point your agent at http://127.0.0.1:8765 (HTTP_PROXY)
 *
 * Modes:
 *   monitor — scan + log findings, forward untouched
 *   guard   — scan + replace configured sensitive values with stable tokens, forward
 *   lock    — block requests whose bodies contain injection patterns or PII
 *
 * Config (values.json): ["John Smith", "john@work.com", "444-55-6666"] —
 * or export the Identity Vault values you want protected.
 * Token mappings are printed to the console (you keep the translation).
 *
 * No dependencies. No network calls of its own. Everything stays local.
 */
const http = require('http');
const path = require('path');
const fs = require('fs');

const AEGIS_ENGINE = require('../src/content/modules/detection-engine.js');
const AEGIS_INJECTION = require('../src/content/modules/injection-engine.js');

const DEFAULT_PORT = 8765;

function parseArgs(argv) {
  const args = { mode: 'monitor', port: DEFAULT_PORT, protect: [] };
  for (const arg of argv.slice(2)) {
    if (arg.startsWith('--mode=')) args.mode = arg.split('=')[1];
    else if (arg.startsWith('--port=')) args.port = parseInt(arg.split('=')[1], 10) || DEFAULT_PORT;
    else if (arg.startsWith('--protect=')) {
      const p = arg.split('=')[1];
      try {
        const raw = p.endsWith('.json') && fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : p;
        const parsed = JSON.parse(raw);
        args.protect = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error('Invalid --protect value (must be JSON or a .json file)');
        process.exit(1);
      }
    }
  }
  if (!['monitor', 'guard', 'lock'].includes(args.mode)) {
    console.error('mode must be monitor | guard | lock');
    process.exit(1);
  }
  return args;
}

/**
 * Scan one outbound body. Returns findings + (guard) a transformed body.
 * Pure — exported for tests.
 */
function inspectBody(body, protect) {
  const text = String(body || '');
  const findings = { pii: [], injection: null, protectedHits: [], transformed: text, blocked: false, reasons: [] };

  const det = AEGIS_ENGINE.scanWithRegex(text);
  det.redactions.forEach(r => findings.pii.push(r.type));

  const inj = AEGIS_INJECTION.analyzeInjection(text);
  if (inj.level === 'dangerous' || inj.level === 'suspicious') {
    findings.injection = inj.level;
    findings.reasons.push('injection:' + AEGIS_INJECTION.topSignals(inj, 1).join(','));
  }

  // Guard: stable token substitution for configured values
  let i = 0;
  for (const value of protect) {
    const v = String(value);
    if (v.length >= 3 && findings.transformed.includes(v)) {
      const token = '[AEGIS-' + (++i) + ']';
      findings.transformed = findings.transformed.split(v).join(token);
      findings.protectedHits.push({ token, original: v });
      findings.reasons.push('protected-value');
    }
  }

  // Lock policy: dangerous injection or un-tokenized PII still present
  if (findings.injection === 'dangerous') findings.blocked = true;
  if (findings.pii.length && findings.transformed === text && findings.pii.length) {
    // PII present and not substituted (monitor keeps flowing; lock blocks)
    findings.reasons.push('pii:' + [...new Set(findings.pii)].join(','));
  }
  return findings;
}

function decide(mode, findings) {
  if (mode === 'monitor') return { action: 'forward', body: findings.transformed === undefined ? null : null, useOriginal: true };
  if (mode === 'guard') return { action: 'forward', useOriginal: false, body: findings.transformed };
  // lock
  if (findings.blocked || findings.protectedHits.length || findings.pii.length) {
    return { action: 'block' };
  }
  return { action: 'forward', useOriginal: true, body: null };
}

function createFirewallServer(opts) {
  const { mode, protect = [] } = opts;
  return http.createServer((req, res) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const raw = Buffer.concat(chunks);
      const hasBody = raw.length > 0 && /text|json|form|xml/i.test(req.headers['content-type'] || 'text/plain');
      let findings = null;
      let bodyToSend = raw;
      let decision = null;
      if (hasBody) {
        findings = inspectBody(raw.toString('utf8'), protect);
        decision = decide(mode, findings);
        console.log(`[aegis:${mode}] ${req.method} ${req.url} pii=${[...new Set(findings.pii)].join('|') || '-'} inj=${findings.injection || '-'} hits=${findings.protectedHits.length} -> ${decision.action}`);
        findings.protectedHits.forEach(h => console.log(`  ${h.token} = ${h.original}`));
        if (decision.action === 'block') {
          res.writeHead(403, { 'content-type': 'application/json', 'x-aegis-firewall': 'blocked' });
          res.end(JSON.stringify({ blocked: true, reasons: findings.reasons }));
          return;
        }
        if (!decision.useOriginal && decision.body !== null) bodyToSend = Buffer.from(decision.body, 'utf8');
      } else {
        console.log(`[aegis:${mode}] ${req.method} ${req.url} -> forward`);
      }

      const dest = new URL(req.url, 'http://' + (req.headers.host || 'example.com'));
      const headers = { ...req.headers, 'x-aegis-firewall': mode };
      // A rewritten body must not carry the original content-length or the
      // upstream server waits forever for bytes that never come
      if (decision && !decision.useOriginal && decision.body !== null) {
        headers['content-length'] = Buffer.byteLength(bodyToSend);
      }
      const upstream = http.request({
        hostname: dest.hostname,
        port: dest.port || 80,
        path: dest.pathname + dest.search,
        method: req.method,
        headers
      }, (ur) => {
        res.writeHead(ur.statusCode, ur.headers);
        ur.pipe(res);
      });
      upstream.on('error', (e) => {
        res.writeHead(502, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ error: 'upstream', detail: e.message }));
      });
      if (bodyToSend.length) upstream.write(bodyToSend);
      upstream.end();
    });
  });
}

if (require.main === module) {
  const args = parseArgs(process.argv);
  const server = createFirewallServer(args);
  server.listen(args.port, '127.0.0.1', () => {
    console.log(`🛡️ AEGIS Agent Firewall — ${args.mode} mode on http://127.0.0.1:${args.port}`);
    console.log(`   protecting ${args.protect.length} configured value(s); agents: HTTP_PROXY=http://127.0.0.1:${args.port}`);
  });
}

module.exports = { createFirewallServer, inspectBody, decide, parseArgs };
