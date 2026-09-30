/**
 * AEGIS Identity Vault
 * Stores the user's own identity values encrypted at rest (AES-256-GCM with a
 * device-local key) and manages per-site pseudonym mappings so the same real
 * value always becomes the same fake on the same site — conversations stay
 * coherent, and the mapping lets AEGIS restore real values in AI responses.
 *
 * Threat model: the key lives in chrome.storage.local on this device. This
 * protects the vault from being read as plaintext (sync leakage, casual
 * inspection, other extensions reading storage) — not from an attacker with
 * full disk access. A passphrase-hardened mode is future work.
 *
 * Runs in the background service worker; tests drive it via createVault()
 * with an in-memory storage adapter.
 */
(function (root) {
  'use strict';

  function b64encode(buf) {
    const bytes = new Uint8Array(buf);
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }
  function b64decode(str) {
    const bin = atob(str);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }
  function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  // TextEncoder/TextDecoder exist in service workers and browsers; Node
  // exposes them via util (needed for jest jsdom runs)
  const TextEncoderCls = typeof TextEncoder !== 'undefined' ? TextEncoder : require('util').TextEncoder;
  const TextDecoderCls = typeof TextDecoder !== 'undefined' ? TextDecoder : require('util').TextDecoder;

  function createVault(storage, cryptoObj) {
    const KEYS = root.AEGIS ? root.AEGIS.KEYS : require('../shared/aegis-shared.js').KEYS;
    const subtle = cryptoObj.subtle;
    let cachedKey = null;
    let cachedVault = null;

    async function ensureKey() {
      if (cachedKey) return cachedKey;
      const stored = await storage.get(KEYS.VAULT_KEY);
      if (stored[KEYS.VAULT_KEY]) {
        cachedKey = await subtle.importKey('raw', b64decode(stored[KEYS.VAULT_KEY]), 'AES-GCM', true, ['encrypt', 'decrypt']);
      } else {
        cachedKey = await subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
        const raw = await subtle.exportKey('raw', cachedKey);
        await storage.set({ [KEYS.VAULT_KEY]: b64encode(raw) });
      }
      return cachedKey;
    }

    async function encryptJson(obj) {
      const key = await ensureKey();
      const iv = cryptoObj.getRandomValues(new Uint8Array(12));
      const data = await subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoderCls().encode(JSON.stringify(obj)));
      return { iv: b64encode(iv), data: b64encode(data) };
    }

    async function decryptJson(blob) {
      const key = await ensureKey();
      const plain = await subtle.decrypt({ name: 'AES-GCM', iv: b64decode(blob.iv) }, key, b64decode(blob.data));
      return JSON.parse(new TextDecoderCls().decode(plain));
    }

    async function loadVault() {
      if (cachedVault) return cachedVault;
      const stored = await storage.get(KEYS.VAULT_DATA);
      const blob = stored[KEYS.VAULT_DATA] ? await decryptJson(stored[KEYS.VAULT_DATA]) : { entries: [], trusted: [] };
      // Backward compatibility: blobs from before the trust graph lack `trusted`
      cachedVault = { entries: blob.entries || [], trusted: blob.trusted || [] };
      return cachedVault;
    }

    async function saveVault(v) {
      cachedVault = v;
      await storage.set({ [KEYS.VAULT_DATA]: await encryptJson(v), [KEYS.VAULT_VERSION]: Date.now() });
    }

    async function listEntries() {
      return (await loadVault()).entries;
    }

    async function addEntry(kind, value) {
      const v = String(value || '').trim();
      if (!v) return null;
      const vlt = await loadVault();
      const existing = vlt.entries.find(e => e.kind === kind && e.value.toLowerCase() === v.toLowerCase());
      if (existing) return existing;
      const entry = { id: b64encode(cryptoObj.getRandomValues(new Uint8Array(6))), kind, value: v };
      await saveVault({ entries: [...vlt.entries, entry], trusted: vlt.trusted });
      return entry;
    }

    async function removeEntry(id) {
      const vlt = await loadVault();
      await saveVault({ entries: vlt.entries.filter(e => e.id !== id), trusted: vlt.trusted });
    }

    // ---- trusted organizations / contacts (matched, never masked) ----

    async function listTrusted() {
      return (await loadVault()).trusted;
    }

    async function addTrusted(kind, value) {
      const v = String(value || '').trim();
      if (!v) return null;
      const vlt = await loadVault();
      const existing = vlt.trusted.find(e => e.value.toLowerCase() === v.toLowerCase());
      if (existing) return existing;
      const entry = { id: b64encode(cryptoObj.getRandomValues(new Uint8Array(6))), kind, value: v };
      await saveVault({ entries: vlt.entries, trusted: [...vlt.trusted, entry] });
      return entry;
    }

    async function removeTrusted(id) {
      const vlt = await loadVault();
      await saveVault({ entries: vlt.entries, trusted: vlt.trusted.filter(e => e.id !== id) });
    }

    async function clearAll() {
      cachedVault = null;
      await storage.remove([KEYS.VAULT_DATA, KEYS.PSEUDO_MAP]);
      await storage.set({ [KEYS.VAULT_VERSION]: Date.now() });
    }

    // ---- pseudonym map (plaintext: fakes are not secrets) ----

    async function getPseudoMap() {
      const stored = await storage.get(KEYS.PSEUDO_MAP);
      return stored[KEYS.PSEUDO_MAP] || {};
    }

    async function recordPseudo(entryId, site, fake) {
      const map = await getPseudoMap();
      (map[site] = map[site] || {})[entryId] = fake;
      await storage.set({ [KEYS.PSEUDO_MAP]: map });
    }

    async function getPseudoFor(entryId, site) {
      const map = await getPseudoMap();
      return (map[site] || {})[entryId] || null;
    }

    return { addEntry, removeEntry, listEntries, listTrusted, addTrusted, removeTrusted, clearAll, encryptJson, decryptJson, getPseudoMap, recordPseudo, getPseudoFor };
  }

  /**
   * Build case-insensitive matchers for vault entries. Names and custom
   * values match with word boundaries and flexible inner whitespace; phone
   * numbers match in any common formatting (digits joined by optional
   * separators); emails match literally.
   */
  function buildMatchers(entries) {
    return (entries || []).filter(e => e && typeof e.value === 'string' && e.value.trim()).map(e => {
      let re;
      if (e.kind === 'phone') {
        const digits = e.value.replace(/\D/g, '');
        if (digits.length < 7) return null;
        re = new RegExp('(?<!\\d)' + digits.split('').join('[-.\\s()]*') + '(?!\\d)', 'gi');
      } else if (e.kind === 'email') {
        re = new RegExp('\\b' + escapeRe(e.value) + '\\b', 'gi');
      } else {
        re = new RegExp('\\b' + escapeRe(e.value).replace(/ /g, '\\s+') + '\\b', 'gi');
      }
      return { entryId: e.id, kind: e.kind, value: e.value, regex: re };
    }).filter(Boolean);
  }

  const AEGIS_VAULT = { createVault, buildMatchers };
  root.AEGIS_VAULT = AEGIS_VAULT;
  if (typeof module !== 'undefined' && module.exports) module.exports = AEGIS_VAULT;
})(typeof self !== 'undefined' ? self : globalThis);
