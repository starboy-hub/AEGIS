/**
 * AEGIS Webmail Profiles
 * Gmail / Outlook DOM extraction: sender + subject per message, email-specific
 * sender checks (display-name spoofing, lookalike domains), and sent-mail
 * skipping. Pure DOM functions — defensive by design, webmail DOMs change
 * often, so every extraction degrades to "no data" instead of throwing.
 */
(function (root) {
  'use strict';

  const WEBMAIL_HOSTS = {
    'mail.google.com': 'gmail',
    'outlook.office.com': 'outlook',
    'outlook.live.com': 'outlook',
    'outlook.office365.com': 'outlook'
  };

  // Domains scammers commonly impersonate with typosquats
  const PROTECTED_DOMAINS = [
    'paypal.com', 'google.com', 'microsoft.com', 'apple.com', 'amazon.com',
    'netflix.com', 'facebook.com', 'instagram.com', 'whatsapp.com',
    'binance.com', 'coinbase.com', 'chase.com', 'wellsfargo.com',
    'bankofamerica.com', 'hsbc.com', 'dhl.com', 'fedex.com', 'ups.com',
    'gmail.com', 'outlook.com', 'icloud.com'
  ];

  function detectWebmail(host) {
    const h = String(host || '').toLowerCase();
    return WEBMAIL_HOSTS[h] || null;
  }

  // ---- DOM extraction ----

  function extractGmail(doc) {
    const messages = [];
    // Gmail exposes participant emails on span[email]; each message (list row
    // or conversation block) contains at least one
    doc.querySelectorAll('span[email]').forEach(el => {
      const email = (el.getAttribute('email') || '').toLowerCase();
      if (!email) return;
      const container = el.closest('[data-thread-id], tr, [role="listitem"]') || el.parentElement;
      if (!container || container.hasAttribute('data-aegis-webmail')) return;
      const name = (el.textContent || '').trim();
      const subjectEl = container.querySelector('[data-thread-id] .hP, .bog, .y6, .bqe, span.bqe');
      messages.push({
        el: container,
        senderName: name === 'me' ? '' : name,
        senderEmail: email,
        subject: subjectEl ? subjectEl.textContent.trim() : ''
      });
    });
    return messages;
  }

  function extractOutlook(doc) {
    const messages = [];
    // Outlook list rows: role="option" with aria-label "Sender, subject, ..."
    doc.querySelectorAll('div[role="option"][aria-label], div[role="listitem"][aria-label]').forEach(el => {
      if (el.hasAttribute('data-aegis-webmail')) return;
      const label = el.getAttribute('aria-label') || '';
      const firstComma = label.indexOf(',');
      if (firstComma === -1) return;
      const sender = label.slice(0, firstComma).trim();
      if (!sender || sender.toLowerCase() === 'me') return;
      messages.push({
        el,
        senderName: sender,
        senderEmail: (el.querySelector('span[email], a[email]')?.getAttribute('email') || '').toLowerCase(),
        subject: label.slice(firstComma + 1).split(',')[0].trim()
      });
    });
    return messages;
  }

  function extractMessages(doc, kind) {
    try {
      return kind === 'gmail' ? extractGmail(doc) : extractOutlook(doc);
    } catch (e) {
      return [];
    }
  }

  // ---- Email-specific checks (pure) ----

  function levenshtein(a, b) {
    if (Math.abs(a.length - b.length) > 2) return 99;
    const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
    for (let j = 1; j <= b.length; j++) dp[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
        );
      }
    }
    return dp[a.length][b.length];
  }

  /**
   * Sender-focused signals for one message.
   * @returns {Array<{id, label, weight}>}
   */
  function analyzeSender(senderName, senderEmail) {
    const signals = [];
    if (!senderEmail || senderEmail.indexOf('@') === -1) return signals;
    const domain = senderEmail.split('@')[1];
    const freeProviders = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'aol.com', 'proton.me', 'icloud.com'];

    // Display-name spoofing: "Global Bank" writing from gmail.com
    if (senderName && freeProviders.includes(domain)) {
      const corporateish = /(bank|pay|security|support|service|admin|official|team|help|invoice|billing|finance|irs|tax|customs|delivery)/i;
      if (corporateish.test(senderName)) {
        signals.push({ id: 'display_spoof', label: 'Corporate name writing from a free email provider', weight: 40 });
      }
    }

    // Lookalike domains: typosquats of well-known brands. rn→m in
    // "rnicrosoft.com" is a 2-edit change, so longer roots allow distance 2;
    // requires a corporate-ish display name so job boards (apply.com) and
    // personal mail never trip it.
    const root = domain.replace(/\.(com|net|org|co|io|xyz|info|online|shop)$/i, '');
    const corporateish = /(bank|pay|security|support|service|admin|official|team|help|invoice|billing|finance|irs|tax|customs|delivery|no[-.]?reply)/i;
    for (const target of PROTECTED_DOMAINS) {
      const tRoot = target.replace(/\.(com|net|org|co|io|xyz|info|online|shop)$/i, '');
      if (root === tRoot) break; // exact match: legitimate
      if (root.length >= 4 && tRoot.length >= 4) {
        const maxDist = root.length >= 8 ? 2 : 1;
        if (levenshtein(root, tRoot) <= maxDist && (!senderName || corporateish.test(senderName))) {
          signals.push({ id: 'lookalike_domain', label: 'Lookalike domain (typosquat of ' + target + ')', weight: 45 });
          break;
        }
      }
    }
    return signals;
  }

  /**
   * Should this message be skipped? Sent mail must not be scanned — it is the
   * user's own outbound content.
   */
  function isSentMail(msg, userEmails, locationHash) {
    const hash = String(locationHash || '').toLowerCase();
    if (hash.includes('sent') || hash.includes('sentitems') || hash.includes('#sent')) return true;
    const sender = (msg.senderEmail || '').toLowerCase();
    const name = (msg.senderName || '').toLowerCase();
    if (sender === 'me' || name === 'me') return true;
    return (userEmails || []).some(u => u.toLowerCase() === sender);
  }

  const AEGIS_WEBMAIL = { detectWebmail, extractMessages, analyzeSender, isSentMail, PROTECTED_DOMAINS };
  root.AEGIS_WEBMAIL = AEGIS_WEBMAIL;
  if (typeof module !== 'undefined' && module.exports) module.exports = AEGIS_WEBMAIL;
})(typeof self !== 'undefined' ? self : globalThis);
