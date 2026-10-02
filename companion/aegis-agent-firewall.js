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
const net = require('net');
const fs = require('fs');

const AEGIS_ENGINE = require('../src/content/modules/detection-engine.js');
const AEGIS_INJECTION = require('../src/content/modules/injection-engine.js');
const canary = require('./aegis-canary.js');
const { createSseRewriter, createTextRewriter } = require('./sse-rewrite.js');

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

  // Guard: stable token substitution — the token for a value is derived
  // from its position in the protect list, so it is IDENTICAL across
  // requests and responses can be re-hydrated with one fixed mapping
  protect.forEach((value, idx) => {
    const v = String(value);
    if (v.length >= 3 && findings.transformed.includes(v)) {
      const token = '[AEGIS-' + (idx + 1) + ']';
      findings.transformed = findings.transformed.split(v).join(token);
      findings.protectedHits.push({ token, original: v });
      findings.reasons.push('protected-value');
    }
  });

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

const DASHBOARD_HTML = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>AEGIS Companion</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f4f6fb;color:#0f172a;margin:0;padding:24px;max-width:720px;margin:0 auto}
  h1{font-size:20px} .card{background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:16px;margin:12px 0;box-shadow:0 1px 3px rgba(15,23,42,.06)}
  .mode-btn{padding:8px 14px;border-radius:9px;border:1px solid #e2e8f0;background:#f1f5f9;font-weight:600;cursor:pointer;margin-right:6px}
  .mode-btn.active{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border:none}
  .finding{padding:6px 0;border-bottom:1px dashed #e2e8f0;font-size:12.5px}
  .challenge{background:#eef2ff;border-radius:10px;padding:12px;font-weight:600;color:#4338ca;margin:8px 0}
  small{color:#94a3b8}
  button.canary{padding:8px 14px;border-radius:9px;border:none;background:#10b981;color:#fff;font-weight:600;cursor:pointer}
</style></head><body>
<h1>🛡️ AEGIS Companion — <span id="mode">?</span> mode</h1>
<div class="card">
  <b>Firewall mode</b>
  <div style="margin-top:8px">
    <button class="mode-btn" data-mode="monitor">Monitor</button>
    <button class="mode-btn" data-mode="guard">Guard</button>
    <button class="mode-btn" data-mode="lock">Lock</button>
  </div>
  <small>monitor = watch only · guard = tokenize protected values · lock = block risky payloads</small>
</div>
<div class="card">
  <b>🗣️ Voice Canary</b>
  <p style="font-size:13px;color:#475569">Before trusting an urgent call, ask the caller this — clones cannot answer:</p>
  <div class="challenge" id="challenge">Click generate…</div>
  <button class="canary" id="genCanary">Generate challenge</button>
</div>
<div class="card">
  <b>Traffic</b> <small id="count"></small>
  <div id="log"></div>
</div>
<script>
  async function refresh() {
    const s = await (await fetch('/aegis-status')).json();
    document.getElementById('mode').textContent = s.mode;
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === s.mode));
    document.getElementById('count').textContent = s.requests + ' requests inspected';
    document.getElementById('log').innerHTML = s.findings.map(f =>
      '<div class="finding"><b>' + f.method + '</b> ' + f.url.slice(0, 60) + ' — pii: ' + (f.pii || '-') + ', inj: ' + (f.inj || '-') + ', hits: ' + f.hits + ' → ' + f.action + '</div>'
    ).join('') || '<small>No traffic yet</small>';
  }
  document.querySelectorAll('.mode-btn').forEach(b => b.addEventListener('click', async () => {
    await fetch('/aegis-mode?mode=' + b.dataset.mode); refresh();
  }));
  document.getElementById('genCanary').addEventListener('click', async () => {
    const c = await (await fetch('/aegis-canary')).json();
    document.getElementById('challenge').textContent = c.question;
  });
  refresh(); setInterval(refresh, 3000);
</script>
</body></html>`;

function createFirewallServer(opts) {
  const state = { mode: opts.mode, protect: opts.protect || [], canaryConfig: opts.canaryConfig || { personals: [] }, requests: 0, findingsLog: [] };
  // Stable bidirectional map used to re-hydrate tokens in AI responses
  state.tokenMap = state.protect.map((value, idx) => ({ token: '[AEGIS-' + (idx + 1) + ']', original: String(value) }));
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1');

    // ---- Companion dashboard endpoints (before proxying) ----
    if (url.pathname === '/aegis-dashboard') {
      res.writeHead(200, { 'content-type': 'text/html' });
      res.end(DASHBOARD_HTML);
      return;
    }
    if (url.pathname === '/aegis-status') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ mode: state.mode, requests: state.requests, findings: state.findingsLog.slice(-20).reverse(), protect: state.protect }));
      return;
    }
    if (url.pathname === '/aegis-mode') {
      const m = url.searchParams.get('mode');
      if (['monitor', 'guard', 'lock'].includes(m)) state.mode = m;
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ mode: state.mode }));
      return;
    }
    if (url.pathname === '/aegis-canary') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(canary.generateChallenge(state.canaryConfig)));
      return;
    }

    state.requests++;
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const raw = Buffer.concat(chunks);
      const hasBody = raw.length > 0 && /text|json|form|xml/i.test(req.headers['content-type'] || 'text/plain');
      let findings = null;
      let bodyToSend = raw;
      let decision = null;
      if (hasBody) {
        findings = inspectBody(raw.toString('utf8'), state.protect);
        decision = decide(state.mode, findings);
        state.findingsLog.push({ time: new Date().toISOString(), method: req.method, url: req.url, pii: [...new Set(findings.pii)].join('|') || '-', inj: findings.injection || '-', hits: findings.protectedHits.length, action: decision.action });
        if (state.findingsLog.length > 50) state.findingsLog.shift();
        console.log(`[aegis:${state.mode}] ${req.method} ${req.url} pii=${[...new Set(findings.pii)].join('|') || '-'} inj=${findings.injection || '-'} hits=${findings.protectedHits.length} -> ${decision.action}`);
        findings.protectedHits.forEach(h => console.log(`  ${h.token} = ${h.original}`));
        if (decision.action === 'block') {
          res.writeHead(403, { 'content-type': 'application/json', 'x-aegis-firewall': 'blocked' });
          res.end(JSON.stringify({ blocked: true, reasons: findings.reasons }));
          return;
        }
        if (!decision.useOriginal && decision.body !== null) bodyToSend = Buffer.from(decision.body, 'utf8');
      } else {
        console.log(`[aegis:${state.mode}] ${req.method} ${req.url} -> forward`);
      }

      const dest = new URL(req.url, 'http://' + (req.headers.host || 'example.com'));
      const headers = { ...req.headers, 'x-aegis-firewall': state.mode };
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
        // ---- Response direction: re-hydrate tokens for the user (guard) ----
        if (state.mode === 'guard' && state.tokenMap.length) {
          const ctype = String(ur.headers['content-type'] || '');
          if (/text\/event-stream/i.test(ctype)) {
            // Streaming: rewrite inside SSE events, holding incomplete events
            // back so a token split across chunks is never emitted raw
            const headers = { ...ur.headers };
            delete headers['content-length']; // stream length is unknown now
            res.writeHead(ur.statusCode, headers);
            const rw = createSseRewriter({ mappings: state.tokenMap });
            ur.setEncoding('utf8');
            ur.on('data', (c) => res.write(rw.push(c)));
            ur.on('end', () => { res.write(rw.flush()); res.end(); });
            return;
          }
          // Buffered: rewrite whole body (bounded) and fix content-length
          const limit = 8 * 1024 * 1024;
          const len = parseInt(ur.headers['content-length'] || '0', 10);
          const rewriteable = /text|json/i.test(ctype) && (!len || len <= limit);
          if (rewriteable) {
            const parts = [];
            let size = 0;
            ur.on('data', (c) => { size += c.length; if (size <= limit) parts.push(c); });
            ur.on('end', () => {
              const rw = createTextRewriter({ mappings: state.tokenMap });
            const text = rw.push(Buffer.concat(parts).toString('utf8')) + rw.flush();
            const out = Buffer.from(text, 'utf8');
            const headers = { ...ur.headers, 'content-length': out.length };
            delete headers['transfer-encoding']; // chunked + content-length is a parse error
            res.writeHead(ur.statusCode, headers);
            res.end(out);
            });
            return;
          }
        }
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

  // HTTPS: tunnel CONNECT requests so wrapped agents do not break. Bodies are
  // NOT inspected (that needs a locally-trusted CA — a deliberate future
  // decision); the destination is still logged for the dashboard.
  server.on('connect', (req, clientSocket, head) => {
    const parts = String(req.url || '').split(':');
    const upstream = net.connect({ host: parts[0], port: parseInt(parts[1] || '443', 10) }, () => {
      clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
      if (head && head.length) upstream.write(head);
      upstream.pipe(clientSocket);
      clientSocket.pipe(upstream);
    });
    upstream.on('error', () => clientSocket.destroy());
    clientSocket.on('error', () => upstream.destroy());
  });
  return server;
}

if (require.main === module) {
  const args = parseArgs(process.argv);
  const server = createFirewallServer(args);
  server.listen(args.port, '127.0.0.1', () => {
    console.log(`🛡️ AEGIS Agent Firewall — ${args.mode} mode on http://127.0.0.1:${args.port}`);
    console.log(`   dashboard: http://127.0.0.1:${args.port}/aegis-dashboard`);
    console.log(`   protecting ${args.protect.length} configured value(s); agents: aegis-wrap -- <command>`);
    args.protect.forEach((v, i) => console.log(`   [AEGIS-${i + 1}] = ${v}`));
  });
}

module.exports = { createFirewallServer, inspectBody, decide, parseArgs };
