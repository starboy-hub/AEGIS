/**
 * AEGIS Shared Module — single source of truth for storage keys, default
 * settings, and pure helpers used by every context.
 *
 * Loading order per context:
 *   - popup page:      <script src="aegis-shared.js"> before popup.js
 *   - content script:  manifest content_scripts: ["aegis-shared.js", "content.js"]
 *   - service worker:  importScripts('aegis-shared.js') at the top of background.js
 *   - tests:           require('../src/shared/aegis-shared.js') (CommonJS export)
 */
(function (root) {
  'use strict';

  const KEYS = {
    // chrome.storage.sync — user preferences (roam across devices)
    SETTINGS: 'settings',
    THEME: 'theme',                     // 'light' | 'dark'
    MANUAL_LANGUAGE: 'manualLanguage',
    // chrome.storage.local — per-device data written by the content script
    HISTORY: 'aegis_history',           // [{ timestamp, site, type, original, fake }]
    HISTORY_SUMMARY: 'aegis_summary',   // { allTime, lastUpdated }
    ONBOARDED: 'onboarded',
    POPUP_POSITION: 'popupPosition',
    // Vault (background-owned; encrypted blob + plaintext pseudonym map)
    VAULT_KEY: 'vault_key',
    VAULT_DATA: 'vault_data',
    VAULT_VERSION: 'vault_version',
    PSEUDO_MAP: 'aegis_pseudo_map',
    // Signing + swarm defense
    SIGNING_KEY: 'signing_key',
    THREAT_SIGS: 'threat_signatures'
  };

  const DEFAULT_SETTINGS = {
    aiEnabled: true,
    regexEnabled: true,
    useFakeData: true,
    sensitivity: 'medium',
    customPatterns: '',
    trustedSites: [],
    monitorClipboard: true,
    theme: 'light',
    notificationSize: 'standard',
    vaultRestore: true,
    sentinelEnabled: true,
    injectionFirewall: true,
    familyMode: false
  };

  function mergeSettings(stored) {
    return Object.assign({}, DEFAULT_SETTINGS, stored || {});
  }

  function isSameDay(isoTimestamp, date) {
    const d = date || new Date();
    return new Date(isoTimestamp).toDateString() === d.toDateString();
  }

  /**
   * Dashboard stats derived from the history the content script writes.
   * @param {Array}  history - KEYS.HISTORY entries
   * @param {Object} summary - KEYS.HISTORY_SUMMARY ({ allTime })
   * @returns {{totalProtected: number, todayProtected: number, sitesVisited: number}}
   */
  function statsFromHistory(history, summary) {
    const items = Array.isArray(history) ? history : [];
    const sites = new Set();
    let todayProtected = 0;
    items.forEach(h => {
      if (h && h.timestamp && isSameDay(h.timestamp)) todayProtected++;
      if (h && h.site) sites.add(h.site);
    });
    const allTime = (summary && typeof summary.allTime === 'number')
      ? summary.allTime
      : items.length;
    return { totalProtected: allTime, todayProtected, sitesVisited: sites.size };
  }

  /**
   * Build a whitespace-tolerant RegExp from a literal text snippet.
   * Detections are computed on text with normalized whitespace (cleanText
   * collapses newlines), but replacement runs on the raw element value —
   * so every literal space must match any whitespace run, or matches that
   * spanned line breaks would silently fail to redact.
   */
  function flexiblePattern(text, flags) {
    const escaped = String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(escaped.replace(/ /g, '\\s+'), flags || 'g');
  }

  /**
   * Mask a sensitive value for audit exports: keep a 2-char prefix so the
   * entry is recognizable, never the full secret.
   */
  function maskSensitive(value) {
    const s = String(value == null ? '' : value);
    if (!s) return '';
    return s.slice(0, 2) + '•'.repeat(Math.min(Math.max(s.length - 2, 4), 8));
  }

  /**
   * FNV-1a 32-bit string hash — used for deterministic pseudonym picks
   * (same entry + same site must always produce the same fake).
   */
  function strHash(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  /**
   * Normalize text for threat-signature hashing: defeats trivial variation
   * (case, whitespace, punctuation) while keeping the wording identifiable.
   */
  function normalizeForSignature(text) {
    return String(text || '')
      .toLowerCase()
      .replace(/[^\w\s@.]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  const AEGIS = { KEYS, DEFAULT_SETTINGS, mergeSettings, statsFromHistory, isSameDay, flexiblePattern, maskSensitive, strHash, normalizeForSignature };
  root.AEGIS = AEGIS;
  if (typeof module !== 'undefined' && module.exports) module.exports = AEGIS;
})(typeof self !== 'undefined' ? self : globalThis);
