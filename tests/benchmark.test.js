/**
 * Regression guard for the Sentinel benchmark.
 * The corpus measures COVERAGE OF KNOWN SCAM CATEGORIES, not real-world
 * generalization (corpus and patterns are co-developed, so scores run high).
 * These thresholds only guarantee the engine does not regress from here.
 */
const fs = require('fs');
const path = require('path');
const AEGIS_SENTINEL = require('../src/content/modules/sentinel-engine.js');

const CORPUS = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'evaluation', 'corpus', 'messages.json'), 'utf8')).messages;

function run() {
  let tp = 0, fn = 0, fp = 0;
  for (const m of CORPUS) {
    const r = AEGIS_SENTINEL.analyzeMessage(m.text);
    const warned = r.level === 'suspicious' || r.level === 'dangerous';
    if (m.label === 'scam' && warned) tp++;
    else if (m.label === 'scam') fn++;
    else if (warned) fp++;
  }
  const precision = tp / (tp + fp) || 0;
  const recall = tp / (tp + fn) || 0;
  const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0;
  return { tp, fn, fp, precision, recall, f1 };
}

describe('Sentinel benchmark regression guard', () => {
  const r = run();

  test('no false alarms on the legitimate corpus', () => {
    expect(r.fp).toBe(0);
  });

  test('recall of known scam categories stays >= 95%', () => {
    expect(r.recall).toBeGreaterThanOrEqual(0.95);
  });

  test('precision stays >= 95%', () => {
    expect(r.precision).toBeGreaterThanOrEqual(0.95);
  });

  test('credential request signal requires request context (no education-page false positives)', () => {
    const r = AEGIS_SENTINEL.analyzeMessage('Password managers generate and store strong unique passwords for every site, so you only remember one master passphrase.');
    expect(r.level).toBe('none');
  });
});
