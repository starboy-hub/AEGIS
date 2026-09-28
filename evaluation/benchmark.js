#!/usr/bin/env node
/**
 * AEGIS Sentinel Benchmark (Phase 0 — measure honestly)
 *
 * Runs the real detection engine over the labeled corpus and reports
 * precision / recall / F1 at the "warn" threshold (suspicious + dangerous),
 * a confusion breakdown, and per-category misses. Writes results JSON so
 * changes to the engine can be compared over time.
 *
 * Usage: npm run benchmark [-- --update-baseline]
 */
const fs = require('fs');
const path = require('path');
const AEGIS_SENTINEL = require('../src/content/modules/sentinel-engine.js');

const CORPUS = JSON.parse(fs.readFileSync(path.join(__dirname, 'corpus', 'messages.json'), 'utf8')).messages;
const BASELINE = path.join(__dirname, 'baseline.json');
const RESULTS = path.join(__dirname, 'results.json');

const counts = { tp: 0, fp: 0, tn: 0, fn: 0 };
const misses = [];
const falseAlarms = [];
const perCategory = {};

for (const m of CORPUS) {
  const r = AEGIS_SENTINEL.analyzeMessage(m.text);
  const warned = r.level === 'suspicious' || r.level === 'dangerous';
  perCategory[m.category] = perCategory[m.category] || { total: 0, flagged: 0 };
  perCategory[m.category].total++;
  if (warned) perCategory[m.category].flagged++;

  if (m.label === 'scam') {
    if (warned) counts.tp++;
    else {
      counts.fn++;
      misses.push({ category: m.category, level: r.level, text: m.text.slice(0, 90) });
    }
  } else if (warned) {
    counts.fp++;
    falseAlarms.push({ category: m.category, level: r.level, signals: AEGIS_SENTINEL.topSignals(r, 2), text: m.text.slice(0, 90) });
  } else {
    counts.tn++;
  }
}

const precision = counts.tp / (counts.tp + counts.fp) || 0;
const recall = counts.tp / (counts.tp + counts.fn) || 0;
const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0;
const results = {
  generated: new Date().toISOString(),
  corpusSize: CORPUS.length,
  warnThreshold: 'suspicious + dangerous',
  counts,
  precision: +precision.toFixed(3),
  recall: +recall.toFixed(3),
  f1: +f1.toFixed(3),
  perCategory,
  misses,
  falseAlarms
};

console.log('════════════════════════════════════════════');
console.log(' AEGIS Sentinel Benchmark');
console.log('════════════════════════════════════════════');
console.log(` corpus:      ${CORPUS.length} labeled messages`);
console.log(` true pos:    ${counts.tp}   false neg: ${counts.fn}`);
console.log(` false pos:   ${counts.fp}   true neg:  ${counts.tn}`);
console.log(` precision:   ${(precision * 100).toFixed(1)}%  (of flagged, how many were scams)`);
console.log(` recall:      ${(recall * 100).toFixed(1)}%  (of scams, how many were flagged)`);
console.log(` f1:          ${f1.toFixed(3)}`);
console.log('');
if (misses.length) {
  console.log(' MISSED SCAMS (false negatives):');
  misses.forEach(m => console.log(`  [${m.category}/${m.level}] ${m.text}`));
}
if (falseAlarms.length) {
  console.log(' FALSE ALARMS (flagged legit):');
  falseAlarms.forEach(f => console.log(`  [${f.category}/${f.level}] ${f.signals.join(' + ')} :: ${f.text}`));
}

const baseline = fs.existsSync(BASELINE) ? JSON.parse(fs.readFileSync(BASELINE, 'utf8')) : null;
if (baseline && process.argv.includes('--compare')) {
  console.log('');
  console.log(' vs baseline:');
  console.log(`  precision ${baseline.precision} -> ${results.precision}   recall ${baseline.recall} -> ${results.recall}   f1 ${baseline.f1} -> ${results.f1}`);
}

if (process.argv.includes('--update-baseline')) {
  fs.writeFileSync(BASELINE, JSON.stringify({ precision: results.precision, recall: results.recall, f1: results.f1, counts: results.counts }, null, 2));
  console.log('\n baseline updated');
}
fs.writeFileSync(RESULTS, JSON.stringify(results, null, 2));
console.log(`\n full report: evaluation/results.json`);
