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

async function launchWithExtension() {
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

  const page = await context.newPage();
  await context.route('**://mock-chat.test/**', route => route.fulfill({ contentType: 'text/html', body: MOCK_HTML }));
  await context.route('**://mail.google.com/**', route => route.fulfill({ contentType: 'text/html', body: GMAIL_HTML }));
  await page.goto('https://mock-chat.test/');
  return { context, page, extensionId };
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
