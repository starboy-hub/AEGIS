/**
 * Tests for AEGIS PII Detection Module
 */

const { scanTextForPII, containsPII, getSeverityCount } = require('../src/content/modules/detection.js');

describe('PII Detection', () => {
  describe('scanTextForPII', () => {
    test('should detect SSN', () => {
      const text = 'My SSN is 123-45-6789';
      const { alerts } = scanTextForPII(text);
      expect(alerts.some(a => a.type === 'SSN')).toBe(true);
      expect(alerts.find(a => a.type === 'SSN')?.severity).toBe('critical');
    });

    test('should detect sensitive keywords', () => {
      const text = 'My password is secret123';
      const { alerts } = scanTextForPII(text);
      expect(alerts.some(a => a.type === 'KEYWORD')).toBe(true);
    });

    test('should return empty array for safe text', () => {
      const text = 'Hello, how are you today?';
      const { alerts } = scanTextForPII(text);
      expect(alerts.length).toBe(0);
    });

    test('should detect multiple PII types in one text', () => {
      const text = 'John Doe, SSN: 123-45-6789';
      const { alerts } = scanTextForPII(text);
      expect(alerts.length).toBeGreaterThan(0);
    });

    test('should handle empty text', () => {
      const { alerts } = scanTextForPII('');
      expect(alerts.length).toBe(0);
    });

    test('should handle short text (less than 5 chars)', () => {
      const { alerts } = scanTextForPII('abc');
      expect(alerts.length).toBe(0);
    });
  });

  describe('containsPII', () => {
    test('should return true for text with PII', () => {
      expect(containsPII('SSN: 123-45-6789')).toBe(true);
    });

    test('should return false for text without PII', () => {
      expect(containsPII('Hello world')).toBe(false);
    });
  });

  describe('getSeverityCount', () => {
    test('should count alerts by severity', () => {
      const alerts = [
        { type: 'SSN', severity: 'critical' },
        { type: 'EMAIL', severity: 'medium' },
        { type: 'PHONE', severity: 'high' },
        { type: 'NAME', severity: 'low' }
      ];
      const counts = getSeverityCount(alerts);
      expect(counts.critical).toBe(1);
      expect(counts.high).toBe(1);
      expect(counts.medium).toBe(1);
      expect(counts.low).toBe(1);
    });

    test('should handle empty array', () => {
      const counts = getSeverityCount([]);
      expect(counts.critical).toBe(0);
      expect(counts.high).toBe(0);
      expect(counts.medium).toBe(0);
      expect(counts.low).toBe(0);
    });
  });
});
