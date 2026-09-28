importScripts('aegis-shared.js');
importScripts('aegis-vault.js');
importScripts('reality-engine.js');
importScripts('signing-engine.js');
importScripts('threat-store.js');

const DEFAULT_SETTINGS = AEGIS.DEFAULT_SETTINGS;

// Identity Vault: encrypted storage + per-site pseudonym map
const vaultStorage = {
  get: (keys) => new Promise((res) => chrome.storage.local.get(keys, res)),
  set: (obj) => new Promise((res) => chrome.storage.local.set(obj, res)),
  remove: (keys) => new Promise((res) => chrome.storage.local.remove(keys, res))
};
const vault = AEGIS_VAULT.createVault(vaultStorage, crypto);
const signer = AEGIS_SIGNING.createSigner(vaultStorage, crypto);
const threats = AEGIS_THREATS.createThreatStore(vaultStorage, AEGIS);

// ---- Message validation: every inbound message is shape-checked before a
// handler touches storage. Runtime messages can only originate from this
// extension's own contexts (no externally_connectable), so this is internal
// hygiene that prevents corruption from malformed internal calls.
const VAULT_KINDS = ['name', 'email', 'phone', 'custom'];
const TRUST_KINDS = ['org', 'contact'];
const isStr = (v, max) => typeof v === 'string' && v.length > 0 && v.length <= max;

function validateMessage(request) {
  if (typeof request !== 'object' || request === null || typeof request.type !== 'string') return false;
  switch (request.type) {
    case 'GET_SETTINGS': case 'CHECK_OLLAMA': case 'OPEN_OPTIONS': case 'THREAT_EXPORT':
    case 'THREAT_COUNT': case 'VAULT_LIST': case 'VAULT_CORPUS': case 'VAULT_CLEAR':
      return true;
    case 'SAVE_TRUSTED_SITES':
      return Array.isArray(request.sites) && request.sites.length <= 500 &&
        request.sites.every(s => isStr(s, 200));
    case 'CLASSIFY_TEXT': case 'SENTINEL_LLM': case 'SIGN_SIGN':
      return isStr(request.text, 20000);
    case 'SIGN_VERIFY':
      return isStr(request.blockText, 50000);
    case 'VAULT_ADD':
      return isStr(request.value, 1000) && VAULT_KINDS.includes(request.kind);
    case 'VAULT_ADD_TRUSTED':
      return isStr(request.value, 1000) && TRUST_KINDS.includes(request.kind);
    case 'VAULT_REMOVE': case 'VAULT_REMOVE_TRUSTED':
      return isStr(request.id, 64);
    case 'PSEUDO_RECORD':
      return isStr(request.entryId, 64) && isStr(request.site, 200) && isStr(request.fake, 200);
    case 'PSEUDO_GET_MAP':
      return isStr(request.site, 200);
    case 'THREAT_CHECK': case 'THREAT_RECORD':
      return isStr(request.hash, 128);
    case 'THREAT_IMPORT':
      return typeof request.pack === 'object' && request.pack !== null;
    default:
      return false;
  }
}

// ---- Reality Check: right-click image -> scan bytes for AI provenance ----
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'aegis-reality-check',
      title: '🛡️ AEGIS Reality Check this image',
      contexts: ['image']
    });
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== 'aegis-reality-check' || !info.srcUrl || !tab || !tab.id) return;
  let findings;
  try {
    const resp = await fetch(info.srcUrl);
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    findings = AEGIS_REALITY.analyzeImageBytes(new Uint8Array(await resp.arrayBuffer()));
  } catch (e) {
    findings = { verdict: 'unknown', generator: null, signals: [], disclaimer: 'Could not fetch the image bytes (' + (e.message || 'blocked') + '). Try saving the image first.' };
  }
  try { chrome.tabs.sendMessage(tab.id, { type: 'REALITY_RESULT', findings }); } catch (e) {}
});

// Track pending responses to avoid port errors
let ollamaCheckPending = false;
// Last known Ollama availability, updated by CHECK_OLLAMA so CLASSIFY_TEXT
// can trust it instead of referencing an undefined variable
let ollamaAvailable = false;
// Auto-detected model name — the user may have any model pulled, so we
// never hardcode one (a hardcoded name silently kills the AI layer)
let ollamaModel = null;

const MODEL_PREFERENCES = ['llama3.2', 'llama3.1', 'llama3', 'llama2', 'mistral', 'gemma', 'qwen', 'phi'];

function pickModel(models) {
  const names = (models || []).map(m => m.name || m.model).filter(Boolean);
  for (const pref of MODEL_PREFERENCES) {
    const hit = names.find(n => n === pref || n.startsWith(pref + ':'));
    if (hit) return hit;
  }
  return names[0] || null;
}

async function detectOllamaModel() {
  try {
    const resp = await fetch('http://localhost:11434/api/tags', { signal: AbortSignal.timeout(2000) });
    if (!resp.ok) { ollamaModel = null; return null; }
    const data = await resp.json();
    ollamaModel = pickModel(data.models);
    return ollamaModel;
  } catch (e) {
    ollamaModel = null;
    return null;
  }
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['settings'], (result) => {
    if (!result.settings) {
      chrome.storage.sync.set({ settings: DEFAULT_SETTINGS });
    } else {
      // Merge with defaults for any missing fields
      const merged = { ...DEFAULT_SETTINGS, ...result.settings };
      chrome.storage.sync.set({ settings: merged });
    }
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    if (!validateMessage(request)) {
      sendResponse({ error: 'invalid_message' });
      return false;
    }
    if (request.type === 'GET_SETTINGS') {
      chrome.storage.sync.get(['settings'], (result) => {
        const settings = result.settings ? { ...DEFAULT_SETTINGS, ...result.settings } : DEFAULT_SETTINGS;
        sendResponse({ settings });
      });
      return true;
    }
    
    if (request.type === 'SAVE_TRUSTED_SITES') {
      chrome.storage.sync.get(['settings'], (result) => {
        const settings = result.settings ? { ...DEFAULT_SETTINGS, ...result.settings } : DEFAULT_SETTINGS;
        settings.trustedSites = request.sites || [];
        chrome.storage.sync.set({ settings }, () => {
          if (chrome.runtime.lastError) {
            sendResponse({ success: false, error: chrome.runtime.lastError.message });
          } else {
            sendResponse({ success: true });
          }
        });
      });
      return true;
    }
    
    if (request.type === 'CHECK_OLLAMA') {
      // Prevent multiple concurrent checks
      if (ollamaCheckPending) {
        sendResponse({ available: false, reason: 'check_pending' });
        return false;
      }
      
      ollamaCheckPending = true;
      const timeoutId = setTimeout(() => {
        ollamaCheckPending = false;
        ollamaAvailable = false;
        sendResponse({ available: false, reason: 'timeout' });
      }, 3000);
      
      fetch('http://localhost:11434/api/tags', { 
        method: 'GET',
        signal: AbortSignal.timeout(2500)
      })
        .then(async r => {
          clearTimeout(timeoutId);
          ollamaCheckPending = false;
          ollamaAvailable = r.ok;
          if (r.ok) await detectOllamaModel(); else ollamaModel = null;
          sendResponse({ available: r.ok, model: ollamaModel });
        })
        .catch(() => {
          clearTimeout(timeoutId);
          ollamaCheckPending = false;
          ollamaAvailable = false;
          ollamaModel = null;
          sendResponse({ available: false, reason: 'unreachable' });
        });
      return true;
    }
    
    if (request.type === 'CLASSIFY_TEXT') {
      if (!ollamaAvailable || !request.text) {
        sendResponse({ categories: [], redactions: [] });
        return false;
      }
      
      const timeoutId = setTimeout(() => {
        sendResponse({ categories: [], redactions: [], error: 'timeout' });
      }, 5000);
      
      fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: ollamaModel || 'llama3',
          prompt: `Analyze this text for sensitive information. Return ONLY valid JSON in this exact format: {"categories":["TYPE1","TYPE2"],"redactions":[{"text":"found_text","type":"TYPE"}]}. Text: ${request.text.substring(0, 500)}`,
          stream: false
        }),
        signal: AbortSignal.timeout(4500)
      })
        .then(r => r.json())
        .then(data => {
          clearTimeout(timeoutId);
          try {
            const response = JSON.parse(data.response || '{}');
            sendResponse({ 
              categories: response.categories || [], 
              redactions: response.redactions || [] 
            });
          } catch (e) {
            sendResponse({ categories: [], redactions: [], error: 'parse_failed' });
          }
        })
        .catch(() => {
          clearTimeout(timeoutId);
          sendResponse({ categories: [], redactions: [], error: 'fetch_failed' });
        });
      return true;
    }
    
    if (request.type === 'OPEN_OPTIONS') {
      chrome.runtime.openOptionsPage();
      sendResponse({ success: true });
      return false;
    }

    // ---- Identity Vault ----
    if (request.type === 'VAULT_CORPUS') {
      Promise.all([vault.listEntries(), vault.listTrusted()])
        .then(([entries, trusted]) => sendResponse({ entries, trusted }));
      return true;
    }
    if (request.type === 'VAULT_LIST') {
      vault.listEntries().then((entries) => sendResponse({ entries }));
      return true;
    }
    if (request.type === 'VAULT_ADD') {
      vault.addEntry(request.kind, request.value)
        .then((entry) => sendResponse({ ok: !!entry, entry }))
        .catch((e) => sendResponse({ ok: false, error: e.message }));
      return true;
    }
    if (request.type === 'VAULT_REMOVE') {
      vault.removeEntry(request.id)
        .then(() => sendResponse({ ok: true }))
        .catch((e) => sendResponse({ ok: false, error: e.message }));
      return true;
    }
    if (request.type === 'VAULT_ADD_TRUSTED') {
      vault.addTrusted(request.kind, request.value)
        .then((entry) => sendResponse({ ok: !!entry, entry }))
        .catch((e) => sendResponse({ ok: false, error: e.message }));
      return true;
    }
    if (request.type === 'VAULT_REMOVE_TRUSTED') {
      vault.removeTrusted(request.id)
        .then(() => sendResponse({ ok: true }))
        .catch((e) => sendResponse({ ok: false, error: e.message }));
      return true;
    }
    if (request.type === 'VAULT_CLEAR') {
      vault.clearAll()
        .then(() => sendResponse({ ok: true }))
        .catch((e) => sendResponse({ ok: false, error: e.message }));
      return true;
    }
    if (request.type === 'PSEUDO_RECORD') {
      vault.recordPseudo(request.entryId, request.site, request.fake)
        .then(() => sendResponse({ ok: true }))
        .catch((e) => sendResponse({ ok: false, error: e.message }));
      return true;
    }
    if (request.type === 'PSEUDO_GET_MAP') {
      vault.getPseudoMap()
        .then((map) => sendResponse({ map: map[request.site] || {} }))
        .catch(() => sendResponse({ map: {} }));
      return true;
    }
    if (request.type === 'SENTINEL_LLM') {
      // AI-vs-AI second opinion: local model classifies a gray-zone message
      // with a few-shot protocol; heuristics stay the fast first pass
      if (!ollamaAvailable) { sendResponse({ verdict: 'unclear', reason: 'Ollama unavailable' }); return false; }
      const prompt = [
        'You are a scam-detection classifier. Classify the message as "scam", "legit" or "unclear".',
        'Scam signals: requests for passwords/codes/card details, urgent payment demands (gift cards, crypto, wire transfers), fake prize or lottery claims, authority impersonation with threats, too-good investment returns, emergency money requests from strangers, hidden manipulation.',
        'Not scams: ordinary conversations, routine service notifications without requests, technical discussions, personal news, legitimate payment reminders without unusual pressure.',
        'Reply with ONLY this JSON, nothing else: {"verdict":"scam|legit|unclear","confidence":0-100,"reason":"max 15 words"}',
        '',
        'Examples:',
        'Message: "Your account will be suspended, verify your password now" -> {"verdict":"scam","confidence":95,"reason":"credential phishing with urgency"}',
        'Message: "Lunch tomorrow at the usual place?" -> {"verdict":"legit","confidence":99,"reason":"ordinary personal message"}',
        'Message: "Your invoice for March is available in the app" -> {"verdict":"legit","confidence":90,"reason":"routine notification, no requests"}',
        '',
        'Message to classify:\n' + String(request.text || '').substring(0, 800)
      ].join('\n');
      fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: ollamaModel || 'llama3',
          stream: false,
          prompt,
          format: 'json'
        }),
        signal: AbortSignal.timeout(8000)
      })
        .then((r) => r.json())
        .then((data) => {
          try {
            const m = (data.response || '').match(/\{[\s\S]*\}/);
            const j = m ? JSON.parse(m[0]) : {};
            const verdict = ['scam', 'legit', 'unclear'].includes(j.verdict) ? j.verdict : 'unclear';
            sendResponse({ verdict, confidence: +j.confidence || 0, reason: j.reason || '' });
          } catch (e) { sendResponse({ verdict: 'unclear', reason: 'parse' }); }
        })
        .catch(() => sendResponse({ verdict: 'unclear', reason: 'timeout' }));
      return true;
    }

    // ---- Signing (content provenance) ----
    if (request.type === 'SIGN_SIGN') {
      signer.signText(request.text)
        .then(async (block) => sendResponse({ ok: true, block: AEGIS_SIGNING.formatSignedMessage(request.text, block) }))
        .catch((e) => sendResponse({ ok: false, error: e.message }));
      return true;
    }
    if (request.type === 'SIGN_VERIFY') {
      signer.verifySignedMessage(request.blockText)
        .then((result) => sendResponse(result))
        .catch((e) => sendResponse({ valid: false, reason: e.message }));
      return true;
    }

    // ---- Swarm defense (threat signature store) ----
    if (request.type === 'THREAT_CHECK') {
      threats.isKnown(request.hash)
        .then((known) => sendResponse({ known }))
        .catch(() => sendResponse({ known: false }));
      return true;
    }
    if (request.type === 'THREAT_RECORD') {
      threats.record(request.hash)
        .then(() => sendResponse({ ok: true }))
        .catch(() => sendResponse({ ok: false }));
      return true;
    }
    if (request.type === 'THREAT_EXPORT') {
      threats.exportPack()
        .then((pack) => sendResponse({ pack }))
        .catch((e) => sendResponse({ error: e.message }));
      return true;
    }
    if (request.type === 'THREAT_IMPORT') {
      threats.importPack(request.pack)
        .then((result) => sendResponse(result))
        .catch((e) => sendResponse({ added: 0, error: e.message }));
      return true;
    }
    if (request.type === 'THREAT_COUNT') {
      threats.count().then((count) => sendResponse({ count }));
      return true;
    }

    sendResponse({ error: 'unknown_request_type' });
    return false;
  } catch (error) {
    console.error('🛡️ AEGIS Background Error:', error);
    sendResponse({ error: error.message });
    return false;
  }
});
