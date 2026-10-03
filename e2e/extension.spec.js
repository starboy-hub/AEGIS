/**
 * AEGIS E2E — real Chromium + the real built extension (dist/).
 * Fast mode: Runs tests as tabs inside a single persistent Chromium instance.
 */
const { test, chromium, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const EXT = path.join(__dirname, '..', 'dist');
const MOCK_HTML = fs.readFileSync(path.join(__dirname, 'fixtures', 'mock-chat.html'), 'utf8');
const GMAIL_HTML = fs.readFileSync(path.join(__dirname, 'fixtures', 'mock-gmail.html'), 'utf8');

test.describe.configure({ mode: 'serial' });

test.describe('AEGIS Extension Journeys (Fast Tab Reuse)', () => {
  let context, sw, extensionId;

  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${EXT}`,
        `--load-extension=${EXT}`
      ]
    });

    [sw] = context.serviceWorkers();
    if (!sw) sw = await context.waitForEvent('serviceworker', { timeout: 20000 });
    extensionId = new URL(sw.url()).host;

    // Seed onboarding flag once so extension runs in active state
    const seed = await context.newPage();
    await seed.goto(`chrome-extension://${extensionId}/popup.html`);
    await seed.evaluate(() => {
      localStorage.setItem('aegis_onboarding9', '1');
      return new Promise(resolve => {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({ onboarded: true, onboardingDismissed: true }, resolve);
        } else {
          resolve();
        }
      });
    });
    await seed.close();

    // Global route mocks for mock-chat and gmail
    await context.route('**://mock-chat.test/**', route => route.fulfill({ contentType: 'text/html', body: MOCK_HTML }));
    await context.route('**://mail.google.com/**', route => route.fulfill({ contentType: 'text/html', body: GMAIL_HTML }));
    await context.route('**://shadow-app.test/**', route => route.fulfill({
      contentType: 'text/html',
      body: `<!doctype html><html><body>
        <div id="host"></div>
        <script>
          const host = document.getElementById('host');
          const root = host.attachShadow({ mode: 'open' });
          root.innerHTML = '<textarea id="shadow-input" placeholder="type here"></textarea>';
        </script>
      </body></html>`
    }));
    await context.route('**://frame-host.test/**', route => route.fulfill({
      contentType: 'text/html',
      body: `<!doctype html><html><body><iframe src="https://frame-host.test/form" style="width:600px;height:300px"></iframe></body></html>`
    }));
    await context.route('**://frame-host.test/form', route => route.fulfill({
      contentType: 'text/html',
      body: `<!doctype html><html><body><form><input id="frame-input" placeholder="email"><button type="submit">Send</button></form></body></html>`
    }));
  });

  test.afterAll(async () => {
    if (context) await context.close();
  });

  async function openTestPage(url = 'https://mock-chat.test/') {
    const page = await context.newPage();
    if (url) await page.goto(url);
    return page;
  }

  test('extension loads: service worker starts and dashboard renders', async () => {
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    await expect(popup.locator('#totalProtected')).toBeVisible();
    await popup.click('[data-tab="history"]');
    await expect(popup.locator('#exportLogs')).toBeVisible();
    await popup.close();
  });

  test('outbound PII is detected and Protect swaps it for fake data', async () => {
    const page = await openTestPage();
    await page.fill('#chat-input', 'my email is jane.doe@gmail.com thanks');
    await page.waitForSelector('[data-aegis="unified-popup"]', { timeout: 20000 });
    await expect(page.locator('[data-aegis="unified-popup"]')).toContainText('Email', { timeout: 10000 });

    await page.click('[data-aegis-action^="protect-"]');
    const value = await page.inputValue('#chat-input');
    expect(value).not.toContain('jane.doe@gmail.com');
    expect(value).toMatch(/@(example|sample|test|demo|mock|fake)\.(com|net|org|io)/);
    await page.close();
  });

  test('submission guard blocks Enter with unprotected PII and Cancel keeps it', async () => {
    const page = await openTestPage();
    await page.fill('#chat-input', 'my SSN is 123-45-6789');
    await expect(page.locator('[data-aegis="unified-popup"]')).toContainText('SSN', { timeout: 15000 });
    await page.click('#chat-input');
    await page.keyboard.press('Enter');
    await page.waitForSelector('[data-aegis="submission-modal"]', { timeout: 10000 });
    await page.click('#aegis-modal-cancel');
    await expect(page.locator('[data-aegis="submission-modal"]')).toHaveCount(0);
    expect(await page.inputValue('#chat-input')).toContain('123-45-6789');
    await page.close();
  });

  test('vault: a taught name is detected and pseudonymized deterministically', async () => {
    const options = await context.newPage();
    await options.goto(`chrome-extension://${extensionId}/options.html`);
    await options.fill('#vaultNameInput', 'Sarah Mitchell');
    await options.click('#saveVaultBtn');
    await expect(options.locator('#vaultList .vault-item')).toHaveCount(1, { timeout: 10000 });
    await options.waitForTimeout(400);
    await options.close();

    const page = await openTestPage();
    await page.fill('#chat-input', 'hi, I am Sarah Mitchell');
    await page.dispatchEvent('#chat-input', 'input');
    await page.waitForSelector('[data-aegis="unified-popup"]', { timeout: 20000 });
    await expect(page.locator('[data-aegis="unified-popup"]')).toContainText('Vault Name', { timeout: 10000 });

    await page.click('[data-aegis-action^="protect-"]');
    const first = await page.inputValue('#chat-input');
    expect(first).not.toContain('Sarah Mitchell');

    await page.fill('#chat-input', 'hi, I am Sarah Mitchell again');
    await page.waitForTimeout(600);
    await page.click('[data-aegis-action^="protect-"]');
    const second = await page.inputValue('#chat-input');
    const fake1 = first.split(' ').find(w => w !== 'hi,' && w !== 'I' && w !== 'am');
    expect(second).toContain(fake1);
    await page.close();
  });

  test('sentinel: a scam message on the page triggers a quiet note', async () => {
    const page = await openTestPage();
    await page.waitForSelector('[data-aegis-note]:has-text("Sentinel")', { timeout: 30000 });
    await page.close();
  });

  test('injection firewall: hidden prompt-injection text triggers a note', async () => {
    const page = await openTestPage();
    await page.waitForSelector('[data-aegis-note]:has-text("Injection Firewall")', { timeout: 30000 });
    await page.close();
  });

  test('trust graph: a scam naming YOUR trusted organization escalates as impersonation', async () => {
    test.setTimeout(45000);
    const options = await context.newPage();
    await options.goto(`chrome-extension://${extensionId}/options.html`);
    await options.fill('#trustedEntitiesInput', 'Global Bank');
    await options.click('#saveTrustedEntitiesBtn');
    await expect(options.locator('#trustedList .vault-item')).toHaveCount(1, { timeout: 10000 });
    await options.close();

    const page = await openTestPage();
    await page.waitForSelector('[data-aegis-note]:has-text("Impersonates YOUR trusted organization")', { timeout: 30000 });
    await page.close();
  });

  test('webmail: a scam email in the gmail DOM triggers a sender note', async () => {
    const page = await openTestPage('https://mail.google.com/');
    await page.waitForSelector('[data-aegis-note]:has-text("Email: likely scam")', { timeout: 30000 });
    await expect(page.locator('[data-aegis-note]').first()).toContainText('global.bank.alert@gmail.com', { timeout: 10000 });
    await page.close();
  });

  test('agent honeytokens: planted decoys trigger a leak alert when echoed', async () => {
    const page = await openTestPage();
    await page.waitForSelector('[data-aegis="canary-decoy"]', { timeout: 20000 });
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
    await page.close();
  });

  test('inline popup: Undo restores the original text after Protect', async () => {
    const page = await openTestPage();
    await page.fill('#chat-input', 'my email is jane.doe@gmail.com thanks');
    await page.waitForSelector('[data-aegis="unified-popup"]', { timeout: 20000 });
    await page.click('[data-aegis-action^="protect-"]');
    expect(await page.inputValue('#chat-input')).not.toContain('jane.doe@gmail.com');
    await page.click('[data-aegis-action^="undo-"]');
    expect(await page.inputValue('#chat-input')).toContain('jane.doe@gmail.com');
    await page.close();
  });

  test('pause/resume stops and restarts detection', async () => {
    test.setTimeout(45000);
    const page = await openTestPage();
    await page.fill('#chat-input', 'my email is first@example.com thanks');
    await page.waitForSelector('[data-aegis="unified-popup"]', { timeout: 20000 });
    await page.click('[data-aegis-action^="pause-"]');
    await page.click('[data-aegis-action="minimize"]');
    await expect(page.locator('[data-aegis-part="minimized"]')).toContainText('⏸️', { timeout: 10000 });
    await page.click('[data-aegis-part="minimized"]');
    await page.click('[data-aegis-action="resume"]');
    await page.click('[data-aegis-action="minimize"]');
    await expect(page.locator('[data-aegis-part="minimized"]')).not.toContainText('⏸️', { timeout: 10000 });
    await page.close();
  });

  test('trust-site silences the site (minimized, no new alerts)', async () => {
    const page = await openTestPage();
    await page.fill('#chat-input', 'my email is trust@example.com now');
    await page.waitForSelector('[data-aegis="unified-popup"]', { timeout: 20000 });
    await page.click('[data-aegis-action="trust-site"]');
    await page.waitForSelector('[data-aegis-part="minimized"]', { timeout: 10000 });
    await page.fill('#chat-input', 'my email is quiet@example.com now');
    await page.waitForTimeout(1000);
    const state = await page.evaluate(() => document.querySelector('[data-aegis="unified-popup"]').textContent);
    expect(state).not.toContain('quiet@example');
    await page.close();
  });

  test('shadow DOM: an input inside a web component is scanned and Protect works', async () => {
    const page = await openTestPage('https://shadow-app.test/');
    await page.locator('#host >> textarea').fill('my email is jane.doe@gmail.com thanks');
    await page.waitForSelector('[data-aegis="unified-popup"]', { timeout: 20000 });
    await expect(page.locator('[data-aegis="unified-popup"]')).toContainText('Email', { timeout: 10000 });
    await page.click('[data-aegis-action^="protect-"]');
    const value = await page.locator('#host >> textarea').inputValue();
    expect(value).not.toContain('jane.doe@gmail.com');
    await page.close();
  });

  test('iframe: a form embedded in an iframe gets its own detection + guard', async () => {
    const page = await openTestPage('https://frame-host.test/');
    const frame = page.frames().find(f => f.url().includes('/form'));
    await frame.fill('#frame-input', 'my email is jane.doe@gmail.com thanks');
    const frameAlert = frame.locator('[data-aegis="unified-popup"]');
    await expect(frameAlert).toBeVisible({ timeout: 20000 });
    await expect(frameAlert).toContainText('Email', { timeout: 10000 });
    await page.close();
  });
});
