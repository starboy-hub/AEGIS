/**
 * Tests for the AEGIS Sentinel engine — inbound scam/phishing analysis
 */
const AEGIS_SENTINEL = require('../src/content/modules/sentinel-engine.js');
const { analyzeMessage, topSignals } = AEGIS_SENTINEL;

describe('AEGIS Sentinel engine', () => {
  test('classic lottery/advance-fee scam -> dangerous', () => {
    const r = analyzeMessage('Congratulations, you have won our international lottery prize! To release your unclaimed funds you must send money via wire transfer and pay the processing fee within 24 hours.');
    expect(r.level).toBe('dangerous');
    expect(r.signals.some(s => s.id === 'payment_pressure')).toBe(true);
    expect(r.signals.some(s => s.id === 'too_good')).toBe(true);
    expect(r.advice).toContain('Do not reply');
  });

  test('credential harvesting -> dangerous regardless of score', () => {
    const r = analyzeMessage('Your account will be suspended today. Please verify your password and provide your verification code immediately.');
    expect(r.level).toBe('dangerous');
    expect(r.signals.some(s => s.id === 'credential_request')).toBe(true);
  });

  test('authority + urgency pressure -> suspicious', () => {
    const r = analyzeMessage('This is the tax department. Urgent: your account will be suspended today, act now to avoid legal action.');
    expect(r.level).toBe('suspicious');
    expect(r.signals.some(s => s.id === 'authority_threat')).toBe(true);
  });

  test('secrecy + off-platform shift -> suspicious', () => {
    const r = analyzeMessage('Please keep this confidential between us. Do not tell anyone. Contact me on WhatsApp to continue this matter.');
    expect(r.level).toBe('suspicious');
    expect(r.signals.some(s => s.id === 'secrecy')).toBe(true);
    expect(r.signals.some(s => s.id === 'channel_shift')).toBe(true);
  });

  test('mild urgency alone -> low, not suspicious', () => {
    const r = analyzeMessage('Friendly reminder that the survey closes soon, so please act now if you want to take part. Thanks!');
    expect(r.level).toBe('low');
  });

  test('ordinary conversation -> none', () => {
    const r = analyzeMessage('Hey, thanks for the recipe! I tried the pasta last night and it turned out great. See you at dinner on Friday?');
    expect(r.level).toBe('none');
    expect(r.score).toBe(0);
  });

  test('short text is skipped entirely', () => {
    expect(analyzeMessage('send money now').level).toBe('none');
    expect(analyzeMessage('').level).toBe('none');
  });

  test('crypto "guaranteed returns" pitch -> dangerous', () => {
    const r = analyzeMessage('Exclusive investment opportunity: double your money in 7 days with our guaranteed profit crypto wallet. No risk, act now!');
    expect(r.level).toBe('dangerous');
  });

  test('topSignals ranks by weight, limited to n', () => {
    const r = analyzeMessage('You have won a prize! Send money via wire transfer immediately and confirm your password.');
    const top = topSignals(r, 2);
    expect(top).toHaveLength(2);
    expect(top[0]).toBe('Requests credentials or codes'); // weight 40, ties with payment
  });

  describe('trust-graph escalation', () => {
    test('suspicious message naming YOUR org escalates to dangerous', () => {
      const base = analyzeMessage('Urgent: your account will be suspended today, act now to avoid legal action.');
      expect(base.level).toBe('suspicious');
      const escalated = AEGIS_SENTINEL.escalateForTrust(base, ['Global Bank']);
      expect(escalated.level).toBe('dangerous');
      expect(escalated.signals.some(s => s.id === 'trusted_impersonation')).toBe(true);
    });

    test('no escalation without pressure patterns', () => {
      const base = analyzeMessage('Global Bank announces a new branch opening downtown next month.');
      expect(AEGIS_SENTINEL.escalateForTrust(base, ['Global Bank']).level).toBe('none');
    });

    test('no escalation without trust hits', () => {
      const base = analyzeMessage('Urgent: your account will be suspended today, act now to avoid legal action.');
      expect(AEGIS_SENTINEL.escalateForTrust(base, []).level).toBe('suspicious');
    });

    test('no duplicate escalation', () => {
      const base = { level: 'suspicious', score: 40, signals: [{ id: 'x', label: 'x', weight: 40 }] };
      const once = AEGIS_SENTINEL.escalateForTrust(base, ['Global Bank']);
      const twice = AEGIS_SENTINEL.escalateForTrust(once, ['Global Bank']);
      expect(twice.signals.filter(s => s.id === 'trusted_impersonation')).toHaveLength(1);
    });
  });

  describe('shouldWarn (Family Guardian thresholds)', () => {
    test('normal mode: warns on suspicious/dangerous only', () => {
      expect(AEGIS_SENTINEL.shouldWarn('low', false)).toBe(false);
      expect(AEGIS_SENTINEL.shouldWarn('suspicious', false)).toBe(true);
      expect(AEGIS_SENTINEL.shouldWarn('dangerous', false)).toBe(true);
      expect(AEGIS_SENTINEL.shouldWarn('none', false)).toBe(false);
    });

    test('family mode: warns on low too', () => {
      expect(AEGIS_SENTINEL.shouldWarn('low', true)).toBe(true);
      expect(AEGIS_SENTINEL.shouldWarn('none', true)).toBe(false);
    });
  });
});
