/**
 * AEGIS E2E — real Chromium + the real built extension (dist/).
 * Covers the core user journeys: load, outbound detection + Protect,
 * submission guard, Vault pseudonyms, Sentinel inbound warning.
 */
const { test, chromium, expect } = require('@playwright/test');
const path = require('path');

const EXT = path.join(__dirname, '..', 'dist');
  const MOCK_HTML = require('fs').readFileSync(
    path.join(__dirname, 'fixtures', 'mock-chat.html'), 'utf8');
  const GMAIL_HTML = require('fs').readFileSync(
    path.join(__dirname, 'fixtures', 'mock-gmail.html'), 'utf8');

async function launchWithExtension(opts = {}) {
  const seedOnboarding = opts.seedOnboarding !== false;
  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium',
    // Extensions require headed Chromium in this Playwright version;
    // CI runs under xvfb (see workflow)
    headless: false,
    args: [
      `--disable-extensions-except=${EXT}`,
      `--load-extension=${EXT}`
    ]
  });
  let [sw] = context.serviceWorkers();
  if (!sw) sw = await context.waitForEvent('serviceworker', { timeout: 20000 });
  const extensionId = new URL(sw.url()).host;
  if (seedOnboarding) {
    const seed = await context.newPage();
    await seed.goto(`chrome-extension://${extensionId}/popup.html`);
    await seed.evaluate(() => localStorage.setItem('aegis_onboarding9', '1'));
    await seed.close();
  }

  const page = await context.newPage();
  await context.route('**://mock-chat.test/**', route => route.fulfill({ contentType: 'text/html', body: MOCK_HTML }));
  await context.route('**://mail.google.com/**', route => route.fulfill({ contentType: 'text/html', body: GMAIL_HTML }));
  await page.goto('https://mock-chat.test/');
  return { context, page, extensionId, sw };
}

async function swCall(sw, fn) {
  // Service workers get suspended — race every SW call against a timeout so
  // a hung evaluate can never stall the suite
  return Promise.race([
    sw.evaluate(fn),
    new Promise((res) => setTimeout(() => res({ err: 'sw-timeout' }), 10000))
  ]);
}

test('extension loads: service worker starts and dashboard renders', async () => {
  const { context, extensionId } = await launchWithExtension();
  const popup = await context.newPage();
  await popup.goto(`chrome-extension://${extensionId}/popup.html`);
  await expect(popup.locator('#totalProtected')).toBeVisible();
  await popup.click('[data-tab="history"]');
  await expect(popup.locator('#exportLogs')).toBeVisible();
  await context.close();
});

test('outbound PII is detected and Protect swaps it for fake data', async () => {
  const { context, page } = await launchWithExtension();
  await page.fill('#chat-input', 'my email is jane.doe@gmail.com thanks');
  await page.waitForSelector('[data-aegis="unified-popup"]', { timeout: 20000 });
  await expect(page.locator('[data-aegis="unified-popup"]')).toContainText('Email', { timeout: 10000 });

  await page.click('[data-aegis-action^="protect-"]');
  const value = await page.inputValue('#chat-input');
  expect(value).not.toContain('jane.doe@gmail.com');
  expect(value).toMatch(/@(example|sample|test|demo|mock|fake)\.(com|net|org|io)/);
  await context.close();
});

test('submission guard blocks Enter with unprotected PII and Cancel keeps it', async () => {
  const { context, page } = await launchWithExtension();
  await page.fill('#chat-input', 'my SSN is 123-45-6789');
  // Wait for detection to complete (300ms debounce + scan) before sending
  await expect(page.locator('[data-aegis="unified-popup"]')).toContainText('SSN', { timeout: 15000 });
  await page.click('#chat-input');
  await page.keyboard.press('Enter');
  await page.waitForSelector('[data-aegis="submission-modal"]', { timeout: 10000 });
  await page.click('#aegis-modal-cancel');
  await expect(page.locator('[data-aegis="submission-modal"]')).toHaveCount(0);
  expect(await page.inputValue('#chat-input')).toContain('123-45-6789');
  await context.close();
});

test('vault: a taught name is detected and pseudonymized deterministically', async () => {
  const { context, page, extensionId } = await launchWithExtension();

  // Teach the vault via the options page
  const options = await context.newPage();
  await options.goto(`chrome-extension://${extensionId}/options.html`);
  await options.fill('#vaultNameInput', 'Sarah Mitchell');
  await options.click('#saveVaultBtn');
  await expect(options.locator('.vault-item')).toHaveCount(1, { timeout: 10000 });
  await options.close();

  // Type the plain name — vault detection must fire at any sensitivity
  await page.fill('#chat-input', 'hi, I am Sarah Mitchell');
  await page.waitForSelector('[data-aegis="unified-popup"]', { timeout: 20000 });
  await expect(page.locator('[data-aegis="unified-popup"]')).toContainText('Vault Name', { timeout: 10000 });

  await page.click('[data-aegis-action^="protect-"]');
  const first = await page.inputValue('#chat-input');
  expect(first).not.toContain('Sarah Mitchell');

  // Same name again -> the SAME pseudonym (deterministic, per site)
  await page.fill('#chat-input', 'hi, I am Sarah Mitchell again');
  await page.waitForSelector('[data-aegis-action^="protect-"]', { timeout: 20000 });
  await page.click('[data-aegis-action^="protect-"]');
  const second = await page.inputValue('#chat-input');
  const fake1 = first.split(' ').find(w => w !== 'hi,' && w !== 'I' && w !== 'am');
  expect(second).toContain(fake1);
  await context.close();
});

test('sentinel: a scam message on the page triggers a quiet note', async () => {
  const { context, page } = await launchWithExtension();
  await page.waitForSelector('[data-aegis-note]:has-text("Sentinel")', { timeout: 30000 });
  await context.close();
});

test('injection firewall: hidden prompt-injection text triggers a note', async () => {
  const { context, page } = await launchWithExtension();
  await page.waitForSelector('[data-aegis-note]:has-text("Injection Firewall")', { timeout: 30000 });
  await context.close();
});

test('trust graph: a scam naming YOUR trusted organization escalates as impersonation', async () => {
  test.setTimeout(45000); // cold local-model first inference can be slow
  const { context, page, extensionId } = await launchWithExtension();

  // Teach the trust graph: Global Bank is the user's real bank
  const options = await context.newPage();
  await options.goto(`chrome-extension://${extensionId}/options.html`);
  await options.fill('#trustedEntitiesInput', 'Global Bank');
  await options.click('#saveTrustedEntitiesBtn');
  await expect(options.locator('.vault-item')).toHaveCount(1, { timeout: 10000 });
  await options.close();

  // The page's scam message names Global Bank -> impersonation escalation
  await page.waitForSelector('[data-aegis-note]:has-text("Impersonates YOUR trusted organization")', { timeout: 30000 });
  await context.close();
});

test('webmail: a scam email in the gmail DOM triggers a sender note, legit mail stays quiet', async () => {
  const { context, page } = await launchWithExtension();
  await page.goto('https://mail.google.com/');
  await page.waitForSelector('[data-aegis-note]:has-text("Email: likely scam")', { timeout: 30000 });
  await expect(page.locator('[data-aegis-note]').first()).toContainText('global.bank.alert@gmail.com', { timeout: 10000 });
  await context.close();
});

test('agent honeytokens: planted decoys trigger a leak alert when echoed', async () => {
  const { context, page } = await launchWithExtension();
  // The content script plants invisible decoy credentials on the page
  await page.waitForSelector('[data-aegis="canary-decoy"]', { timeout: 20000 });
  // Simulate an AI agent scraping the decoys and echoing them into visible chat content
  await page.evaluate(() => {
    const decoy = document.querySelector('[data-aegis="canary-decoy"]').textContent;
    const email = decoy.match(/login (\S+@\S+?) /)[1];
    const code = decoy.match(/access key (\S+)/)[1];
    const msg = document.createElement('div');
    msg.className = 'msg ai';
    msg.textContent = 'Summary of this page: internal credentials found — ' + email + ' / ' + code;
    document.getElementById('messages').appendChild(msg);
  });
  await page.waitForSelector('[data-aegis-note]:has-text("Honeytoken triggered")', { timeout: 30000 });
  await expect(page.locator('[data-aegis-note]').first()).toContainText('decoy credentials', { timeout: 10000 });
  await context.close();
});

test('inline popup: Undo restores the original text after Protect', async () => {
  const { context, page } = await launchWithExtension();
  await page.fill('#chat-input', 'my email is jane.doe@gmail.com thanks');
  await page.waitForSelector('[data-aegis="unified-popup"]', { timeout: 20000 });
  await page.click('[data-aegis-action^="protect-"]');
  expect(await page.inputValue('#chat-input')).not.toContain('jane.doe@gmail.com');
  await page.click('[data-aegis-action^="undo-"]');
  expect(await page.inputValue('#chat-input')).toContain('jane.doe@gmail.com');
  await context.close();
});

test('pause/resume stops and restarts detection', async () => {
  test.setTimeout(45000);
  const { context, page } = await launchWithExtension();
  await page.fill('#chat-input', 'my email is first@example.com thanks');
  await page.waitForSelector('[data-aegis="unified-popup"]', { timeout: 20000 });
  // Pause from the popup footer, then minimize to the bubble
  await page.click('[data-aegis-action^="pause-"]');
  await page.click('[data-aegis-action="minimize"]');
  await expect(page.locator('[data-aegis-part="minimized"]')).toContainText('⏸️', { timeout: 10000 });
  // Resume from the bubble: expand, then the popup footer offers resume
  await page.click('[data-aegis-part="minimized"]');
  await page.click('[data-aegis-action="resume"]');
  await page.click('[data-aegis-action="minimize"]');
  await expect(page.locator('[data-aegis-part="minimized"]')).not.toContainText('⏸️', { timeout: 10000 });
  await context.close();
});

test('trust-site silences the site (minimized, no new alerts)', async () => {
  const { context, page, sw } = await launchWithExtension();
  await page.fill('#chat-input', 'my email is trust@example.com now');
  await page.waitForSelector('[data-aegis="unified-popup"]', { timeout: 20000 });
  await page.click('[data-aegis-action="trust-site"]');
  await page.waitForSelector('[data-aegis-part="minimized"]', { timeout: 10000 });
  await page.fill('#chat-input', 'my email is quiet@example.com now');
  await page.waitForTimeout(3500);
  const state = await page.evaluate(() => document.querySelector('[data-aegis="unified-popup"]').textContent);
  expect(state).not.toContain('quiet@example');
  const saved = await swCall(sw, () => new Promise((res) => chrome.storage.sync.get(['settings'], (g) => res((g.settings || {}).trustedSites || []))));
  expect(saved).toContain('mock-chat.test');
  await context.close();
});

test('first-run onboarding walks through and dismisses', async () => {
  test.setTimeout(45000);
  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium', headless: false,
    args: [`--disable-extensions-except=${EXT}`, `--load-extension=${EXT}`]
  });
  let [sw] = context.serviceWorkers();
  if (!sw) sw = await context.waitForEvent('serviceworker', { timeout: 20000 });
  const extensionId = new URL(sw.url()).host;
  const popup = await context.newPage();
  await popup.goto(`chrome-extension://${extensionId}/popup.html`);
  await expect(popup.locator('#onboard')).toBeVisible({ timeout: 10000 });
  await popup.click('#onboardNext');
  await popup.click('#onboardNext');
  await popup.click('#onboardNext'); // finish on step 3
  await expect(popup.locator('#onboard')).toBeHidden();
  await expect(popup.locator('#totalProtected')).toBeVisible();
  // flag persists — reload does not re-show
  await popup.reload();
  await expect(popup.locator('#onboard')).toBeHidden();
  await context.close();
});
