/**
 * AEGIS Signing Engine
 * Device-local ECDSA P-256 signing keys (stored as JWK in chrome.storage).
 * Sign arbitrary text into a portable AEGIS signed block; verify blocks
 * from any AEGIS user. This is the foundation for provenance verification:
 * AI-forged content claiming a signature fails verification loudly.
 */
(function (root) {
  'use strict';

  const TextEncoderCls = typeof TextEncoder !== 'undefined' ? TextEncoder : require('util').TextEncoder;

  function b64urlEncode(bytes) {
    let bin = '';
    new Uint8Array(bytes).forEach(b => { bin += String.fromCharCode(b); });
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function b64urlDecode(str) {
    const pad = str.length % 4 ? '='.repeat(4 - (str.length % 4)) : '';
    const bin = atob(str.replace(/-/g, '+').replace(/_/g, '/') + pad);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }

  const BEGIN_MSG = '-----BEGIN AEGIS SIGNED MESSAGE-----';
  const BEGIN_SIG = '-----BEGIN AEGIS SIGNATURE-----';
  const END_SIG = '-----END AEGIS SIGNATURE-----';

  /** Format a signed message as a portable text block. */
  function formatSignedMessage(text, block) {
    return BEGIN_MSG + '\n' + text + '\n' + BEGIN_SIG + '\n' + JSON.stringify(block) + '\n' + END_SIG;
  }

  /** Parse a portable block; returns {text, block} or null. */
  function parseSignedMessage(blockText) {
    if (typeof blockText !== 'string' || blockText.indexOf(BEGIN_MSG) === -1 || blockText.indexOf(BEGIN_SIG) === -1) return null;
    const bodyStart = blockText.indexOf(BEGIN_MSG) + BEGIN_MSG.length;
    const sigStart = blockText.indexOf(BEGIN_SIG, bodyStart);
    const end = blockText.indexOf(END_SIG, sigStart);
    if (sigStart === -1 || end === -1) return null;
    const text = blockText.slice(bodyStart, sigStart).replace(/^\r?\n/, '').replace(/\r?\n$/, '');
    let block;
    try { block = JSON.parse(blockText.slice(sigStart + BEGIN_SIG.length, end).trim()); } catch (e) { return null; }
    return { text, block };
  }

  function createSigner(storage, cryptoObj) {
    const KEYS = root.AEGIS ? root.AEGIS.KEYS : require('../shared/aegis-shared.js').KEYS;
    const subtle = cryptoObj.subtle;
    let cached = null;

    async function ensureKeys() {
      if (cached) return cached;
      const stored = await storage.get(KEYS.SIGNING_KEY);
      if (stored[KEYS.SIGNING_KEY]) {
        const jwk = stored[KEYS.SIGNING_KEY];
        cached = {
          privateKey: await subtle.importKey('jwk', jwk.privateKey, { name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign']),
          publicKey: await subtle.importKey('jwk', jwk.publicKey, { name: 'ECDSA', namedCurve: 'P-256' }, true, ['verify'])
        };
      } else {
        const kp = await subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
        await storage.set({
          [KEYS.SIGNING_KEY]: {
            privateKey: await subtle.exportKey('jwk', kp.privateKey),
            publicKey: await subtle.exportKey('jwk', kp.publicKey)
          }
        });
        cached = kp;
      }
      return cached;
    }

    /** Sign text; returns a portable signature block object. */
    async function signText(text) {
      const keys = await ensureKeys();
      const sig = await subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, keys.privateKey, new TextEncoderCls().encode(text));
      const rawPub = new Uint8Array(await subtle.exportKey('raw', keys.publicKey));
      return { alg: 'ES256', ts: new Date().toISOString(), pub: b64urlEncode(rawPub), sig: b64urlEncode(sig) };
    }

    /** Verify raw text against a signature block object. */
    async function verifySignature(text, block) {
      try {
        if (!block || block.alg !== 'ES256' || !block.pub || !block.sig) return false;
        const pub = await subtle.importKey('raw', b64urlDecode(block.pub), { name: 'ECDSA', namedCurve: 'P-256' }, true, ['verify']);
        return await subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, pub, b64urlDecode(block.sig), new TextEncoderCls().encode(text));
      } catch (e) {
        return false;
      }
    }

    /** Verify a full portable block (as produced by formatSignedMessage). */
    async function verifySignedMessage(blockText) {
      const parsed = parseSignedMessage(blockText);
      if (!parsed) return { valid: false, reason: 'no valid signature block' };
      const valid = await verifySignature(parsed.text, parsed.block);
      return { valid, text: parsed.text, ts: parsed.block.ts, reason: valid ? '' : 'signature does not match content' };
    }

    return { ensureKeys, signText, verifySignature, verifySignedMessage, formatSignedMessage, parseSignedMessage };
  }

  const AEGIS_SIGNING = { createSigner, formatSignedMessage, parseSignedMessage };
  root.AEGIS_SIGNING = AEGIS_SIGNING;
  if (typeof module !== 'undefined' && module.exports) module.exports = AEGIS_SIGNING;
})(typeof self !== 'undefined' ? self : globalThis);
