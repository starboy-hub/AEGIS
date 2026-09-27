/**
 * Tests for the AEGIS Identity Vault (crypto, persistence, matchers, pseudonyms)
 */
require('../src/shared/aegis-shared.js');
const { createVault, buildMatchers } = require('../src/background/aegis-vault.js');
const AEGIS = require('../src/shared/aegis-shared.js');

const cryptoObj = require('crypto').webcrypto;

function makeStorage() {
  const mem = new Map();
  return {
    mem,
    async get(keys) {
      const out = {};
      (Array.isArray(keys) ? keys : [keys]).forEach(k => { if (mem.has(k)) out[k] = mem.get(k); });
      return out;
    },
    async set(obj) { Object.entries(obj).forEach(([k, v]) => mem.set(k, v)); },
    async remove(keys) { (Array.isArray(keys) ? keys : [keys]).forEach(k => mem.delete(k)); }
  };
}

function makeVault() { return createVault(makeStorage(), cryptoObj); }

describe('AEGIS Identity Vault', () => {
  test('add + list roundtrip; values are encrypted at rest', async () => {
    const storage = makeStorage();
    const vault = createVault(storage, cryptoObj);
    const entry = await vault.addEntry('name', 'Sarah Mitchell');
    expect(entry.kind).toBe('name');
    expect(entry.value).toBe('Sarah Mitchell');

    const list = await vault.listEntries();
    expect(list).toHaveLength(1);

    // The raw storage must not contain plaintext
    const raw = JSON.stringify([...storage.mem.values()]);
    expect(raw).not.toContain('Sarah Mitchell');
  });

  test('add is idempotent per kind+value', async () => {
    const vault = makeVault();
    await vault.addEntry('email', 'me@x.com');
    await vault.addEntry('email', 'ME@X.com');
    expect(await vault.listEntries()).toHaveLength(1);
  });

  test('remove and clearAll wipe the vault', async () => {
    const vault = makeVault();
    const a = await vault.addEntry('name', 'Sarah Mitchell');
    await vault.addEntry('phone', '555 123 4567');
    await vault.removeEntry(a.id);
    expect(await vault.listEntries()).toHaveLength(1);
    await vault.clearAll();
    expect(await vault.listEntries()).toHaveLength(0);
  });

  test('encryptJson/decryptJson roundtrip', async () => {
    const vault = makeVault();
    const secret = { entries: [{ id: 'x', value: 'top secret' }] };
    const blob = await vault.encryptJson(secret);
    expect(JSON.stringify(blob)).not.toContain('top secret');
    expect(await vault.decryptJson(blob)).toEqual(secret);
  });

  test('pseudonym map is per-site and persistent', async () => {
    const vault = makeVault();
    await vault.recordPseudo('entry1', 'chat.openai.com', 'James Wilson');
    await vault.recordPseudo('entry1', 'claude.ai', 'Ana Costa');
    expect(await vault.getPseudoFor('entry1', 'chat.openai.com')).toBe('James Wilson');
    expect(await vault.getPseudoFor('entry1', 'claude.ai')).toBe('Ana Costa');
    expect(await vault.getPseudoFor('entry1', 'gemini.google.com')).toBeNull();
  });

  test('trusted entities: roundtrip, encrypted at rest, independent of identity entries', async () => {
    const storage = makeStorage();
    const vault = createVault(storage, cryptoObj);
    await vault.addEntry('name', 'Sarah Mitchell');
    await vault.addTrusted('org', 'Global Bank');
    await vault.addTrusted('contact', 'john@family.com');

    const trusted = await vault.listTrusted();
    expect(trusted).toHaveLength(2);
    expect(trusted.map(t => t.kind).sort()).toEqual(['contact', 'org']);
    expect((await vault.listEntries())).toHaveLength(1); // identity entries untouched

    // encrypted at rest
    const raw = JSON.stringify([...storage.mem.values()]);
    expect(raw).not.toContain('Global Bank');

    // dedup by value
    await vault.addTrusted('org', 'global bank');
    expect(await vault.listTrusted()).toHaveLength(2);

    await vault.removeTrusted(trusted[0].id);
    expect((await vault.listTrusted()).some(t => t.value === 'Global Bank')).toBe(false);
  });
});

describe('Vault matchers', () => {
  test('names match case-insensitively with word bounds and flexible spaces', () => {
    const [m] = buildMatchers([{ id: '1', kind: 'name', value: 'Sarah Mitchell' }]);
    expect('hi, I am sarah mitchell!'.match(m.regex)).toBeTruthy();
    expect('sarah  mitchell'.match(m.regex)).toBeTruthy();
    expect('SarahMitchell'.match(m.regex)).toBe(null);
    expect('Sarah Mitchellson'.match(m.regex)).toBe(null);
  });

  test('phone matcher accepts any common formatting', () => {
    const [m] = buildMatchers([{ id: '2', kind: 'phone', value: '555-123-4567' }]);
    expect('call 555-123-4567 now'.match(m.regex)).toBeTruthy();
    expect('call (555) 123 4567 now'.match(m.regex)).toBeTruthy();
    expect('call 5551234567 now'.match(m.regex)).toBeTruthy();
    expect('call 15551234567 now'.match(m.regex)).toBe(null); // different number
  });

  test('email and custom matchers work literally and case-insensitively', () => {
    const [email] = buildMatchers([{ id: '3', kind: 'email', value: 'sarah@work.com' }]);
    expect('write to SARAH@WORK.COM ok'.match(email.regex)).toBeTruthy();
    const [custom] = buildMatchers([{ id: '4', kind: 'custom', value: '12 Ocean Avenue' }]);
    expect('I live at 12  ocean avenue now'.match(custom.regex)).toBeTruthy();
  });

  test('short phone values are rejected (too noisy)', () => {
    expect(buildMatchers([{ id: '5', kind: 'phone', value: '123' }])).toHaveLength(0);
  });
});

describe('deterministic pseudonym picking (shared.strHash)', () => {
  test('same seed -> same index, different seed -> (almost surely) different', () => {
    const pool = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const h1 = AEGIS.strHash('entry1|chat.openai.com');
    expect(pool[h1 % pool.length]).toBe(pool[h1 % pool.length]);
    let differing = 0;
    for (let i = 1; i <= 20; i++) {
      if (AEGIS.strHash('entry1|site' + i) !== h1) differing++;
    }
    expect(differing).toBeGreaterThan(15);
  });
});
