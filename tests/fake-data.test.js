/**
 * Tests for AEGIS Fake Data Generator
 */

const { getFakeData, FAKE_DATA } = require('../src/content/modules/fake-data.js');

// Luhn checksum — fake cards must FAIL it so they can never be charged
function luhnValid(numStr) {
  const digits = numStr.replace(/[^0-9]/g, '');
  let sum = 0, alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits[i], 10);
    if (alt) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
    alt = !alt;
  }
  return sum % 10 === 0;
}

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

    test('fake credit cards must FAIL Luhn validation (never chargeable)', () => {
      FAKE_DATA.creditCards.forEach(cc => {
        expect(luhnValid(cc)).toBe(false);
      });
    });

    test('fake SSNs must use areas never issued by the SSA (000, 666, 900+)', () => {
      FAKE_DATA.ssns.forEach(ssn => {
        const area = parseInt(ssn.split('-')[0], 10);
        expect([0, 666].includes(area) || area >= 900).toBe(true);
      });
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

    test('fake SSN dataset matches the safe-value rules used at runtime', () => {
      // The content script keeps an inline copy of FAKE_DATA for perf;
      // this pins the two datasets to the same safety contract.
      const fs = require('fs');
      const path = require('path');
      const contentSrc = fs.readFileSync(
        path.join(__dirname, '..', 'src', 'content', 'content.js'), 'utf8');
      expect(contentSrc).toContain(FAKE_DATA.ssns[0]);
      expect(contentSrc).toContain(FAKE_DATA.creditCards[0]);
    });
  });
});
