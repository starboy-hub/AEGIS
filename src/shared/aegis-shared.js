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
    POPUP_POSITION: 'popupPosition'
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
    notificationSize: 'standard'
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

  const AEGIS = { KEYS, DEFAULT_SETTINGS, mergeSettings, statsFromHistory, isSameDay };
  root.AEGIS = AEGIS;
  if (typeof module !== 'undefined' && module.exports) module.exports = AEGIS;
})(typeof self !== 'undefined' ? self : globalThis);
