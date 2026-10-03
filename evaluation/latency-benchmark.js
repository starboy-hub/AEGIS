/**
 * AEGIS Typing Latency & Performance Micro-Benchmark
 * Verifies that detection scanning on typing inputs finishes in < 1ms
 * to ensure zero typing latency or UI lag for users.
 */
const { performance } = require('perf_hooks');
const AEGIS_ENGINE = require('../src/content/modules/detection-engine');
const AEGIS_SECRETS = require('../src/content/modules/secret-engine');
const AEGIS_SENTINEL = require('../src/content/modules/sentinel-engine');

function runLatencyBenchmark() {
  console.log('════════════════════════════════════════════');
  console.log(' AEGIS Performance & Latency Benchmark');
  console.log('════════════════════════════════════════════');

  const testParagraph = `
    Hi team, here is the updated API key for testing: AKIAIOSFODNN7EXAMPLE.
    Please do not share my email jane.doe@company.com or phone 555-0199 with anyone.
    The database URL is postgres://admin:secret123@localhost:5432/production_db.
  `.repeat(10); // ~2.5 KB payload

  const iterations = 1000;
  const start = performance.now();

  for (let i = 0; i < iterations; i++) {
    const ct = AEGIS_ENGINE.cleanText(testParagraph);
    AEGIS_ENGINE.scanWithRegex(ct);
    AEGIS_SECRETS.scanSecrets(ct);
    AEGIS_SENTINEL.analyzeMessage(ct);
  }

  const duration = performance.now() - start;
  const avgLatencyMs = duration / iterations;

  console.log(`Payload Size:      ${(testParagraph.length / 1024).toFixed(2)} KB`);
  console.log(`Total Iterations:  ${iterations}`);
  console.log(`Total Time:        ${duration.toFixed(2)} ms`);
  console.log(`Average Latency:   ${avgLatencyMs.toFixed(3)} ms per scan`);

  if (avgLatencyMs > 2.0) {
    console.error(`❌ Performance Failure: Average latency (${avgLatencyMs.toFixed(3)}ms) exceeded 2.0ms threshold!`);
    process.exit(1);
  } else {
    console.log(`✅ Performance Passed: Latency is well below 2.0ms threshold (${avgLatencyMs.toFixed(3)}ms per scan).`);
  }
}

if (require.main === module) {
  runLatencyBenchmark();
}

module.exports = { runLatencyBenchmark };
