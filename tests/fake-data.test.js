/**
 * Tests for AEGIS Fake Data Generator
 */

const { getFakeData } = require('../src/content/modules/fake-data.js');

describe('Fake Data Generator', () => {
  describe('getFakeData', () => {
    test('should generate fake names', () => {
      const name = getFakeData('NAME');
      expect(name.length).toBeGreaterThan(3);
      expect(name.split(' ').length).toBeGreaterThanOrEqual(2);
    });

    test('should generate fake emails', () => {
      const email = getFakeData('Email');
      expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });

    test('should generate fake phone numbers', () => {
      const phone = getFakeData('Phone');
      expect(phone).toMatch(/\d{3}-\d{4}-\d{4}/);
    });

    test('should generate fake SSNs', () => {
      const ssn = getFakeData('SSN');
      expect(ssn).toMatch(/^\d{3}-\d{2}-\d{4}$/);
    });

    test('should generate fake credit cards', () => {
      const cc = getFakeData('Credit Card');
      expect(cc).toMatch(/^\d{4}-\d{4}-\d{4}-\d{4}$/);
    });

    test('should generate fake IP addresses', () => {
      const ip = getFakeData('IP Address');
      expect(ip).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/);
    });

    test('should return redacted placeholder for unknown types', () => {
      const result = getFakeData('UNKNOWN_TYPE');
      expect(result).toMatch(/\[REDACTED-.*\]/);
    });

    test('should handle empty original text', () => {
      const name = getFakeData('NAME', '');
      expect(name).toBeTruthy();
    });
  });
});
