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

    test('redacts only the VALUE for labeled PII, preserving labels (context kept for fake-data)', () => {
      const { redactions } = engine.scanWithRegex('My Date of Birth is 04/15/1990 and passport: X1234567 and bank account is 12345678');
      const dob = redactions.find(r => r.type === 'Date of Birth');
      const pass = redactions.find(r => r.type === 'Passport');
      const bank = redactions.find(r => r.type === 'Bank Account');
      expect(dob.text).toBe('04/15/1990');
      expect(dob.context).toContain('Date of Birth');
      expect(pass.text).toBe('X1234567');
      expect(pass.context).toContain('passport');
      expect(bank.text).toBe('12345678');
      expect(bank.context).toContain('bank account');
    });

    test('value-only redaction for groupless patterns (SSN, card, email)', () => {
      const { redactions } = engine.scanWithRegex('SSN 123-45-6789 card 4532-8871-2934-1150 mail me@x.com ok');
      const ssn = redactions.find(r => r.type === 'SSN');
      expect(ssn.text).toBe('123-45-6789');
      expect(ssn.context).toBe('123-45-6789');
      expect(redactions.find(r => r.type === 'Credit Card').text).toBe('4532-8871-2934-1150');
      expect(redactions.find(r => r.type === 'Email').text).toBe('me@x.com');
    });

    test('returns empty for short/safe text', () => {
      expect(engine.scanWithRegex('hi').alerts).toEqual([]);
      expect(engine.scanWithRegex('Hello, how are you today?').alerts).toEqual([]);
    });

    test('regression: the full manual-test text — every detection redactable in RAW text', () => {
      const shared = require('../src/shared/aegis-shared.js');
      const raw = [
        'Hi! I need help writing a secure note. Here are my details:',
        '- My email is john.doe@example.com',
        '- My phone number is 555-123-4567',
        '- My SSN is 123-45-6789',
        '- My credit card is 4532 8871 2934 1150, expires 12/27, CVV 123',
        '- My IP address is 192.168.1.100',
        '- My Date of Birth is 04/15/1990',
        '- My passport: X1234567',
        '- My bank account is 12345678',
        '- My driver license: D12345678',
        '- My medical record MRN 84739201',
        '- I was diagnosed with type 2 diabetes last year',
        '- I am taking metformin daily',
        '- my salary is $150,000 per year',
        '- My password is hunter2secret',
        '- I work at TechCorp in Seattle',
        '- My friend Sarah Mitchell recommended this'
      ].join('\n');
      const cleaned = engine.cleanText(raw);
      const regex = engine.scanWithRegex(cleaned);
      const ctx = engine.scanWithContext(cleaned);
      const all = [...regex.redactions, ...ctx.redactions];

      // All 10 regex types detected
      ['SSN','Credit Card','Email','Phone','IP Address','Date of Birth','Passport',
       'Bank Account','Driver License','Medical Record'].forEach(t =>
        expect(all.some(r => r.type === t)).toBe(true));
      // Context types detected (incl. the one that silently failed before)
      expect(ctx.alerts.some(a => a.type === 'EMPLOYMENT')).toBe(true);
      expect(ctx.alerts.some(a => a.type === 'FINANCIAL')).toBe(true);
      // The secret is covered
      expect(all.some(r => r.text.toLowerCase().includes('hunter2secret'))).toBe(true);
      // Every redaction must be matchable in the RAW text via flexible whitespace
      all.forEach(r => expect(shared.flexiblePattern(r.text).test(raw)).toBe(true));
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

    test('detects credentials and redacts the SECRET, not just the phrase', () => {
      const { alerts, redactions } = engine.scanWithContext('My password is hunter2secret');
      expect(alerts.some(a => a.type === 'CREDENTIALS')).toBe(true);
      expect(redactions.some(r => r.text.toLowerCase().includes('hunter2secret'))).toBe(true);
    });

    test('credentials: catches API keys and logins with values', () => {
      const { redactions } = engine.scanWithContext('API key: sk-abc123def and login: alice42');
      expect(redactions.some(r => r.text.includes('sk-abc123def'))).toBe(true);
      expect(redactions.some(r => r.text.includes('alice42'))).toBe(true);
    });

    test('credentials: does not flag innocent uses of the word password', () => {
      const { alerts } = engine.scanWithContext('I forgot my password manager and use the password field');
      expect(alerts).toEqual([]);
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
