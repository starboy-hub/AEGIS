/**
 * Tests for the AEGIS Detection Engine — the module that actually ships
 * (loaded by the manifest before content.js).
 */
const engine = require('../src/content/modules/detection-engine.js');

describe('AEGIS Detection Engine', () => {
  describe('scanWithRegex — standard PII', () => {
    test('detects SSN', () => {
      const { alerts, redactions } = engine.scanWithRegex('My SSN is 123-45-6789');
      expect(alerts.some(a => a.type === 'SSN')).toBe(true);
      expect(redactions.some(r => r.text === '123-45-6789')).toBe(true);
    });

    test('detects credit card (with dashes)', () => {
      const { alerts, redactions } = engine.scanWithRegex('card 4532-8871-2934-1150 please');
      expect(alerts.some(a => a.type === 'Credit Card')).toBe(true);
      expect(redactions[0].text).toBe('4532-8871-2934-1150');
    });

    test('detects credit card (with spaces)', () => {
      const { redactions } = engine.scanWithRegex('card 4532 8871 2934 1150 please');
      expect(redactions.some(r => r.text === '4532 8871 2934 1150')).toBe(true);
    });

    test('detects email', () => {
      const { redactions } = engine.scanWithRegex('reach me at john.doe@example.com ok');
      expect(redactions.some(r => r.text === 'john.doe@example.com')).toBe(true);
    });

    test('detects US phone number', () => {
      const { redactions } = engine.scanWithRegex('call 555-123-4567 today');
      expect(redactions.some(r => r.text === '555-123-4567')).toBe(true);
    });

    test('detects IP address', () => {
      const { redactions } = engine.scanWithRegex('server at 192.168.1.100 down');
      expect(redactions.some(r => r.text === '192.168.1.100')).toBe(true);
    });

    test('detects passport, bank account, DOB in context', () => {
      const { redactions } = engine.scanWithRegex('passport AB1234567 and account 12345678 born on 01/02/1990');
      expect(redactions.some(r => r.type === 'Passport' && r.text.includes('AB1234567'))).toBe(true);
      expect(redactions.some(r => r.type === 'Bank Account' && r.text.includes('12345678'))).toBe(true);
      expect(redactions.some(r => r.type === 'Date of Birth')).toBe(true);
    });

    test('returns empty for short/safe text', () => {
      expect(engine.scanWithRegex('hi').alerts).toEqual([]);
      expect(engine.scanWithRegex('Hello, how are you today?').alerts).toEqual([]);
    });
  });

  describe('scanWithContext — semantic PII', () => {
    test('detects medical context in English', () => {
      const { alerts, redactions } = engine.scanWithContext('I was diagnosed with diabetes last year');
      expect(alerts.some(a => a.type === 'MEDICAL')).toBe(true);
      expect(redactions.length).toBeGreaterThan(0);
    });

    test('detects medical context in Spanish', () => {
      const { alerts } = engine.scanWithContext('me diagnosticaron diabetes');
      expect(alerts.some(a => a.type === 'MEDICAL')).toBe(true);
    });

    test('detects financial context (salary)', () => {
      const { alerts } = engine.scanWithContext('my salary is $150,000 per year');
      expect(alerts.some(a => a.type === 'FINANCIAL')).toBe(true);
    });

    test('detects credentials', () => {
      const { alerts } = engine.scanWithContext('my password is hunter2 dont share');
      expect(alerts.some(a => a.type === 'CREDENTIALS')).toBe(true);
    });

    test('detects legal context', () => {
      const { alerts } = engine.scanWithContext('I am suing my former employer');
      expect(alerts.some(a => a.type === 'LEGAL')).toBe(true);
    });

    test('does not flag innocent text', () => {
      const { alerts } = engine.scanWithContext('the weather is nice today, let us go outside');
      expect(alerts).toEqual([]);
    });
  });

  describe('findNamesHeuristic', () => {
    test('finds explicit name introductions', () => {
      const names = engine.findNamesHeuristic('my name is Johnathon and this is Smith');
      expect(names).toContain('Johnathon');
    });

    test('skips common non-name capitalized words', () => {
      const names = engine.findNamesHeuristic('my name is Please');
      expect(names).not.toContain('Please');
    });
  });

  describe('parseCustomPatterns', () => {
    test('parses valid custom patterns', () => {
      const parsed = engine.parseCustomPatterns('EMPLOYEE_ID:/EMP-[0-9]{6}/g');
      expect(parsed).toHaveLength(1);
      expect(parsed[0].type).toBe('EMPLOYEE_ID');
      expect('my badge EMP-123456'.match(parsed[0].pattern)).toBeTruthy();
    });

    test('ignores malformed lines instead of throwing', () => {
      expect(engine.parseCustomPatterns('not a pattern\nALSO_BAD:/[unclosed/')).toEqual([]);
    });

    test('returns empty for empty input', () => {
      expect(engine.parseCustomPatterns('')).toEqual([]);
      expect(engine.parseCustomPatterns(null)).toEqual([]);
    });
  });

  describe('cleanText', () => {
    test('strips template braces, UUIDs, and collapses whitespace', () => {
      const out = engine.cleanText('hello {secret} world  550e8400-e29b-41d4-a716-446655440000   end');
      expect(out).toBe('hello world end');
    });
  });

  describe('scanWithCustomPatterns', () => {
    test('finds matches for parsed custom patterns', () => {
      const patterns = engine.parseCustomPatterns('TICKET:/TKT-[0-9]+/g');
      const { alerts, redactions } = engine.scanWithCustomPatterns('see TKT-12345', patterns);
      expect(alerts.some(a => a.type === 'TICKET')).toBe(true);
      expect(redactions.some(r => r.text === 'TKT-12345')).toBe(true);
    });
  });
});
