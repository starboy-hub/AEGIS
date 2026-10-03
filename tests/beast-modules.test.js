/**
 * AEGIS Beast Mode Modules Test Suite
 * Verifies secret scanner, vision firewall, swarm mesh, WebGPU engine, and voice spectral canary.
 */

const AEGIS_SECRETS = require('../src/content/modules/secret-engine.js');
const AEGIS_VISION = require('../src/content/modules/vision-firewall.js');
const AEGIS_SWARM_MESH = require('../src/background/swarm-mesh.js');
const AEGIS_WEBGPU = require('../src/background/webgpu-engine.js');
const AEGIS_VOICE_SPECTRAL = require('../companion/voice-spectral-canary.js');

describe('AEGIS Beast Mode Modules', () => {

  describe('Developer Secret & Code Sanitizer (AEGIS_SECRETS)', () => {
    test('detects AWS Access Key ID', () => {
      const res = AEGIS_SECRETS.scanSecrets('my aws key is AKIA1234567890ABCDEF in config');
      expect(res.alerts.some(a => a.type === 'API_KEY')).toBe(true);
      expect(res.redactions.some(r => r.text === 'AKIA1234567890ABCDEF')).toBe(true);
    });

    test('detects GitHub Personal Access Token', () => {
      const res = AEGIS_SECRETS.scanSecrets('token: ghp_1234567890abcdefghijklmnopqrstuvwxyz');
      expect(res.alerts.some(a => a.type === 'API_KEY')).toBe(true);
      expect(res.redactions.some(r => r.text.startsWith('ghp_'))).toBe(true);
    });

    test('detects OpenAI / Anthropic API Key', () => {
      const res = AEGIS_SECRETS.scanSecrets('sk-proj-' + '1234567890abcdefghijklmnopqrstuvwxyz1234567890abcdef');
      expect(res.alerts.some(a => a.type === 'API_KEY')).toBe(true);
    });

    test('detects Stripe Live Key', () => {
      const res = AEGIS_SECRETS.scanSecrets('sk_' + 'live_000000000000000000000000');
      expect(res.alerts.some(a => a.type === 'API_KEY')).toBe(true);
    });

    test('detects Database Connection Strings', () => {
      const res = AEGIS_SECRETS.scanSecrets('mongodb://user:pass@localhost:27017/db');
      expect(res.alerts.some(a => a.type === 'DATABASE_URI')).toBe(true);
    });
  });

  describe('Multi-Modal Vision & Canvas Firewall (AEGIS_VISION)', () => {
    test('handles empty or non-canvas elements safely', () => {
      expect(AEGIS_VISION.inspectCanvasElement(null)).toBeNull();
    });
  });

  describe('P2P Swarm Threat Mesh (AEGIS_SWARM_MESH)', () => {
    test('broadcasts and receives threat signature hashes', () => {
      const ok = AEGIS_SWARM_MESH.broadcastThreat('hash-abc-123');
      expect(ok).toBe(true);
      expect(AEGIS_SWARM_MESH.knownHashes.has('hash-abc-123')).toBe(true);
    });
  });

  describe('WebGPU Neural Engine (AEGIS_WEBGPU)', () => {
    test('initializes and reports hardware status', async () => {
      const ok = await AEGIS_WEBGPU.init();
      expect(typeof ok).toBe('boolean');
    });
  });

  describe('Voice Clone Spectral Canary (AEGIS_VOICE_SPECTRAL)', () => {
    test('analyzes FFT frequency buffers without crashing', () => {
      const dummyFreq = new Uint8Array(256).fill(128);
      const res = AEGIS_VOICE_SPECTRAL.analyzeAudioSpectrum(dummyFreq);
      expect(res).toHaveProperty('isSynthetic');
      expect(res).toHaveProperty('score');
    });
  });

});
