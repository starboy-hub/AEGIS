/**
 * Tests for the AEGIS shared module (storage keys, defaults, stats)
 */
const { KEYS, DEFAULT_SETTINGS, mergeSettings, statsFromHistory, isSameDay } = require('../src/shared/aegis-shared.js');

describe('AEGIS shared module', () => {
  describe('mergeSettings', () => {
    test('returns defaults when nothing stored', () => {
      expect(mergeSettings(undefined)).toEqual(DEFAULT_SETTINGS);
    });

    test('stored values win over defaults, missing keys filled in', () => {
      const merged = mergeSettings({ sensitivity: 'high' });
      expect(merged.sensitivity).toBe('high');
      expect(merged.regexEnabled).toBe(true);
      expect(merged.trustedSites).toEqual([]);
    });

    test('never mutates DEFAULT_SETTINGS', () => {
      mergeSettings({ sensitivity: 'high' });
      expect(DEFAULT_SETTINGS.sensitivity).toBe('medium');
    });
  });

  describe('statsFromHistory', () => {
    const today = new Date();
    const iso = (d) => d.toISOString();

    test('counts today protections and distinct sites', () => {
      const history = [
        { timestamp: iso(today), site: 'chat.openai.com', type: 'SSN' },
        { timestamp: iso(today), site: 'chat.openai.com', type: 'Email' },
        { timestamp: iso(new Date(Date.now() - 86400000 * 3)), site: 'claude.ai', type: 'SSN' }
      ];
      const stats = statsFromHistory(history, { allTime: 3 });
      expect(stats.todayProtected).toBe(2);
      expect(stats.totalProtected).toBe(3);
      expect(stats.sitesVisited).toBe(2);
    });

    test('falls back to history length when summary missing', () => {
      const history = [{ timestamp: iso(today), site: 'x.com' }];
      const stats = statsFromHistory(history, undefined);
      expect(stats.totalProtected).toBe(1);
    });

    test('handles empty/missing history', () => {
      expect(statsFromHistory([], { allTime: 0 })).toEqual({ totalProtected: 0, todayProtected: 0, sitesVisited: 0 });
      expect(statsFromHistory(undefined, undefined).totalProtected).toBe(0);
    });

    test('isSameDay boundaries', () => {
      const now = new Date();
      expect(isSameDay(iso(now), now)).toBe(true);
      expect(isSameDay(iso(new Date(0)), now)).toBe(false);
    });
  });

  describe('storage key contract', () => {
    test('content script history keys match the shared constants', () => {
      const fs = require('fs');
      const path = require('path');
      const contentSrc = fs.readFileSync(
        path.join(__dirname, '..', 'src', 'content', 'content.js'), 'utf8');
      expect(contentSrc).toContain('AEGIS.KEYS.HISTORY');
      expect(contentSrc).not.toContain("'aegis_history'"); // no hardcoded key left
    });
  });
});
