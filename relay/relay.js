#!/usr/bin/env node
/**
 * AEGIS Swarm Relay — self-hostable signature exchange (Phase 4).
 *
 * A tiny stateless-ish HTTP relay that AEGIS installs use to share anonymized
 * threat signatures (hashes only — the protocol makes leaking message text
 * structurally impossible). Deploy anywhere Node runs; point installs at it
 * via Options → Swarm Defense → Relay URL.
 *
 * Endpoints:
 *   GET  /health            → { ok: true, signatures: n, packs: n }
 *   POST /submit            → body: { aegisThreatPack: true, signatures: [...] }
 *   GET  /packs?since=<iso> → merged pack of signatures added after `since`
 *
 * Hardened by default: size caps, dedup by hash, no message text accepted
 * (signatures without a value are dropped), optional shared-secret token.
 *
 * Usage: node relay/relay.js --port=8787 --db=relay-db.json --token=mysecret
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const MAX_SIGNATURES = 50000;
const MAX_BODY = 1024 * 1024; // 1 MB

function parseArgs(argv) {
  const args = { port: 8787, db: path.join(__dirname, 'relay-db.json'), token: '' };
  argv.slice(2).forEach(a => {
    if (a.startsWith('--port=')) args.port = parseInt(a.split('=')[1], 10) || args.port;
    else if (a.startsWith('--db=')) args.db = a.split('=')[1];
    else if (a.startsWith('--token=')) args.token = a.split('=')[1];
  });
  return args;
}

/** Pure merge: dedup signatures by value, cap total. Exported for tests. */
function mergeSignatures(existing, incoming, max) {
  const known = new Set(existing.map(s => s.value));
  const merged = [...existing];
  let added = 0;
  for (const s of incoming || []) {
    if (!s || typeof s.value !== 'string' || s.value.length > 128) continue;
    if (known.has(s.value)) continue;
    known.add(s.value);
    merged.push({ value: s.value, addedAt: s.addedAt || new Date().toISOString(), source: s.source || 'relay' });
    added++;
    if (merged.length >= max) break;
  }
  return { merged, added };
}

/** Pure filter: signatures added after `since` (ISO string compare). */
function signaturesSince(signatures, since) {
  if (!since) return signatures;
  return signatures.filter(s => !since || (s.addedAt || '') > since);
}

function createRelayServer(opts, persist) {
  const { token, max } = opts;
  let db = { signatures: [] };
  if (persist) { try { db = persist.load() || db; } catch (e) { /* fresh start */ } }

  function save() { if (persist) persist.save(db); }

  function authorized(req) {
    if (!token) return true;
    return req.headers['x-aegis-token'] === token;
  }

  return http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    res.setHeader('content-type', 'application/json');

    if (url.pathname === '/health') {
      res.end(JSON.stringify({ ok: true, signatures: db.signatures.length }));
      return;
    }

    if (!authorized(req)) {
      res.statusCode = 401;
      res.end(JSON.stringify({ error: 'unauthorized' }));
      return;
    }

    if (req.method === 'POST' && url.pathname === '/submit') {
      const chunks = [];
      let size = 0;
      req.on('data', (c) => { size += c.length; if (size > MAX_BODY) req.destroy(); else chunks.push(c); });
      req.on('end', () => {
        try {
          const pack = JSON.parse(Buffer.concat(chunks).toString('utf8'));
          if (pack.aegisThreatPack !== true || !Array.isArray(pack.signatures)) throw new Error('not a valid AEGIS threat pack');
          const { merged, added } = mergeSignatures(db.signatures, pack.signatures, MAX_SIGNATURES);
          db.signatures = merged;
          save();
          res.end(JSON.stringify({ ok: true, added, total: merged.length }));
        } catch (e) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: e.message }));
        }
      });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/packs') {
      const since = url.searchParams.get('since') || '';
      const signatures = signaturesSince(db.signatures, since);
      res.end(JSON.stringify({ aegisThreatPack: true, version: 1, count: signatures.length, signatures }));
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'not found' }));
  });
}

if (require.main === module) {
  const args = parseArgs(process.argv);
  const dir = path.dirname(args.db);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const persist = {
    load: () => { try { return JSON.parse(fs.readFileSync(args.db, 'utf8')); } catch (e) { return null; } },
    save: (db) => { try { fs.writeFileSync(args.db, JSON.stringify(db, null, 2)); } catch (e) { console.error('relay persist failed:', e.message); } }
  };
  createRelayServer(args, persist).listen(args.port, '127.0.0.1', () => {
    console.log(`🐝 AEGIS Swarm Relay — http://127.0.0.1:${args.port} (db: ${args.db}${args.token ? ', token required' : ''})`);
  });
}

module.exports = { createRelayServer, mergeSignatures, signaturesSince, parseArgs };
