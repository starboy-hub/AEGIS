// AEGIS - AI Privacy Shield v6.0
// Wrapped in IIFE to prevent global scope pollution
(function() {
  'use strict';

console.log('🛡️ AEGIS: Content script loaded');

const TRANSLATIONS = {
  en: { sensitiveDetected: 'Sensitive Data Detected', proceed: 'Are you sure you want to proceed?', cancel: 'Cancel', sendAnyway: 'Send Anyway', protectTip: 'Tip: Click Protect in the AEGIS popup to replace sensitive data first', imageUpload: 'Image Upload Detected', aiCanRead: 'AI can read text and faces in images. Does this file contain IDs or sensitive info?', privacyRisk: 'Privacy Risk: Once uploaded, you cannot control who accesses this file.', cancelUpload: 'Cancel Upload', uploadAnyway: 'Upload Anyway', sensitiveFilename: 'Sensitive Filename', containsKeywords: 'contains sensitive keywords.', welcome: 'Welcome to AEGIS!', welcomeText: 'I\'ll protect your sensitive data as you type.', quickProtect: 'Tip: Press ⌘+Enter to quick-protect', gotIt: 'Got it!' },
  es: { sensitiveDetected: 'Datos Sensibles Detectados', proceed: '¿Estás seguro?', cancel: 'Cancelar', sendAnyway: 'Enviar', protectTip: 'Consejo: Haz clic en Proteger', imageUpload: 'Imagen Detectada', aiCanRead: 'La IA puede leer texto.', privacyRisk: 'Riesgo de Privacidad.', cancelUpload: 'Cancelar', uploadAnyway: 'Subir', sensitiveFilename: 'Nombre Sensible', containsKeywords: 'contiene palabras clave.', welcome: '¡Bienvenido!', welcomeText: 'Protegeré tus datos.', quickProtect: 'Presiona ⌘+Enter', gotIt: '¡Entendido!' },
  fr: { sensitiveDetected: 'Données Sensibles', proceed: 'Êtes-vous sûr?', cancel: 'Annuler', sendAnyway: 'Envoyer', protectTip: 'Astuce: Cliquez sur Protéger', imageUpload: 'Image Détectée', aiCanRead: 'L\'IA peut lire le texte.', privacyRisk: 'Risque de Confidentialité.', cancelUpload: 'Annuler', uploadAnyway: 'Télécharger', sensitiveFilename: 'Nom Sensible', containsKeywords: 'contient des mots-clés.', welcome: 'Bienvenue!', welcomeText: 'Je protège vos données.', quickProtect: 'Appuyez sur ⌘+Entrée', gotIt: 'Compris!' },
  de: { sensitiveDetected: 'Sensible Daten', proceed: 'Sind Sie sicher?', cancel: 'Abbrechen', sendAnyway: 'Senden', protectTip: 'Tipp: Klicken Sie auf Schützen', imageUpload: 'Bild Erkannt', aiCanRead: 'KI kann Text lesen.', privacyRisk: 'Datenschutzrisiko.', cancelUpload: 'Abbrechen', uploadAnyway: 'Hochladen', sensitiveFilename: 'Sensibler Name', containsKeywords: 'enthält Schlüsselwörter.', welcome: 'Willkommen!', welcomeText: 'Ich schütze Ihre Daten.', quickProtect: 'Drücken Sie ⌘+Enter', gotIt: 'Verstanden!' },
  pt: { sensitiveDetected: 'Dados Sensíveis', proceed: 'Tem certeza?', cancel: 'Cancelar', sendAnyway: 'Enviar', protectTip: 'Dica: Clique em Proteger', imageUpload: 'Imagem Detectada', aiCanRead: 'A IA pode ler texto.', privacyRisk: 'Risco de Privacidade.', cancelUpload: 'Cancelar', uploadAnyway: 'Enviar', sensitiveFilename: 'Nome Sensível', containsKeywords: 'contém palavras-chave.', welcome: 'Bem-vindo!', welcomeText: 'Protegerei seus dados.', quickProtect: 'Pressione ⌘+Enter', gotIt: 'Entendi!' },
  it: { sensitiveDetected: 'Dati Sensibili', proceed: 'Sei sicuro?', cancel: 'Annulla', sendAnyway: 'Invia', protectTip: 'Suggerimento: Clicca su Proteggi', imageUpload: 'Immagine Rilevata', aiCanRead: 'L\'IA può leggere testo.', privacyRisk: 'Rischio Privacy.', cancelUpload: 'Annulla', uploadAnyway: 'Carica', sensitiveFilename: 'Nome Sensibile', containsKeywords: 'contiene parole chiave.', welcome: 'Benvenuto!', welcomeText: 'Proteggerò i tuoi dati.', quickProtect: 'Premi ⌘+Invio', gotIt: 'Capito!' },
  ru: { sensitiveDetected: 'Конфиденциальные данные', proceed: 'Вы уверены?', cancel: 'Отмена', sendAnyway: 'Отправить', protectTip: 'Совет: Нажмите \'Защитить\'', imageUpload: 'Обнаружено изображение', aiCanRead: 'ИИ может читать текст.', privacyRisk: 'Риск конфиденциальности.', cancelUpload: 'Отмена', uploadAnyway: 'Загрузить', sensitiveFilename: 'Конфиденциальное имя', containsKeywords: 'содержит ключевые слова.', welcome: 'Добро пожаловать!', welcomeText: 'Я защищу ваши данные.', quickProtect: 'Нажмите ⌘+Enter', gotIt: 'Понятно!' },
  zh: { sensitiveDetected: '检测到敏感数据', proceed: '您确定要继续吗？', cancel: '取消', sendAnyway: '仍然发送', protectTip: '提示：点击保护', imageUpload: '检测到图像', aiCanRead: '人工智能可以读取文本。', privacyRisk: '隐私风险。', cancelUpload: '取消上传', uploadAnyway: '仍然上传', sensitiveFilename: '敏感文件名', containsKeywords: '包含敏感关键字。', welcome: '欢迎使用 AEGIS！', welcomeText: '我会保护您的数据。', quickProtect: '按 ⌘+Enter', gotIt: '明白了！' },
  ar: { sensitiveDetected: 'بيانات حساسة', proceed: 'هل أنت متأكد؟', cancel: 'إلغاء', sendAnyway: 'إرسال', protectTip: 'نصيحة: انقر فوق حماية', imageUpload: 'تم اكتشاف صورة', aiCanRead: 'يمكن للذكاء الاصطناعي القراءة.', privacyRisk: 'مخاطر الخصوصية.', cancelUpload: 'إلغاء', uploadAnyway: 'تحميل', sensitiveFilename: 'اسم حساس', containsKeywords: 'يحتوي على كلمات.', welcome: 'مرحبًا بك!', welcomeText: 'سأحمي بياناتك.', quickProtect: 'اضغط ⌘+Enter', gotIt: 'فهمت!' }
};
let currentLang = 'en';
function t(key) { return TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS.en[key]; }


let ollamaAvailable = false;
let vaultCorpus = [], vaultMatchers = [], vaultPseudos = {}, vaultById = {};
let trustMatchers = [];
let sessionGuard = null;
let ollamaModel = null;
let sentinelAnalyzed = new Set(), sentinelNoted = false, sentinelLLMCalls = 0;
let injectionSeen = new Set(), injectionNoted = false;
let settings = { aiEnabled: true, regexEnabled: true, useFakeData: true, sensitivity: 'medium', customPatterns: '', trustedSites: [], monitorClipboard: true, notificationSize: 'standard' };
let isWhitelisted = false, isPaused = false, pauseTimer = null, protectionHistory = [], totalProtected = 0, allTimeProtected = 0, ignoredTexts = new Map(), currentTheme = 'light';

// Ignored texts: per-SITE and time-limited (5 minutes). A global, session-long
// ignore list would silence a pattern even when it reappears in a malicious
// context on another site.
function ignoreText(text) {
  if (!text) return;
  const host = location.hostname;
  if (!isTextIgnored(host)) ignoredTexts.set(host, new Map());
  ignoredTexts.get(host).set(text, Date.now() + 5 * 60 * 1000);
}
function isTextIgnored(text) {
  if (!text) return false;
  const hostMap = ignoredTexts.get(location.hostname);
  if (!hostMap) return false;
  const expiry = hostMap.get(text);
  if (expiry === undefined) return false;
  if (Date.now() > expiry) { hostMap.delete(text); return false; }
  return true;
}

// Local-only detection analytics (verified external audit Claim 7): counts
// what was alerted, protected, ignored — the ignored ratio is the user-visible
// false-positive signal. Nothing leaves the device.
function trackAnalytics(event, types) {
  try {
    chrome.storage.local.get(['aegis_analytics'], (r) => {
      const a = r.aegis_analytics || { triggered: 0, protected: 0, ignored: 0, patternBreakdown: {}, siteBreakdown: {} };
      if (event === 'triggered') {
        a.triggered++;
        (types || []).forEach(t => { a.patternBreakdown[t] = (a.patternBreakdown[t] || 0) + 1; });
        a.siteBreakdown[location.hostname] = (a.siteBreakdown[location.hostname] || 0) + 1;
      }
      if (event === 'protected') a.protected++;
      if (event === 'ignored') a.ignored++;
      chrome.storage.local.set({ aegis_analytics: a });
    });
  } catch (e) {}
}
function tc(light, dark) { return (typeof currentTheme === 'undefined' || currentTheme === 'dark') ? dark : light; }
function loadTheme() { return new Promise((resolve) => { chrome.storage.sync.get([AEGIS.KEYS.THEME], (r) => { currentTheme = r[AEGIS.KEYS.THEME] || 'light'; resolve(currentTheme); }); }); }

chrome.storage.onChanged.addListener((changes, ns) => {
  if (ns === 'local') {
    if (changes[AEGIS.KEYS.VAULT_VERSION] || changes[AEGIS.KEYS.PSEUDO_MAP]) refreshVault();
  }
  if (ns === 'sync') {
    if (changes.settings) {
      settings = AEGIS.mergeSettings(changes.settings.newValue);
      if (!settings.trustedSites) settings.trustedSites = [];
      const host = window.location.hostname.toLowerCase();
      isWhitelisted = settings.trustedSites.some(t => host === t || host.endsWith('.' + t));
    }
    if (changes[AEGIS.KEYS.THEME]) { currentTheme = changes[AEGIS.KEYS.THEME].newValue || 'light'; if (typeof popup !== 'undefined' && popup) popup.render(); }
    if (changes.manualLanguage) {
      const newLang = changes.manualLanguage.newValue || 'auto';
      if (newLang !== 'auto' && TRANSLATIONS[newLang]) currentLang = newLang;
      else { const browserLang = navigator.language.split('-')[0].toLowerCase(); currentLang = TRANSLATIONS[browserLang] ? browserLang : 'en'; }
      if (typeof popup !== 'undefined' && popup) popup.render();
    }
  }
});

class HistoryStore {
  constructor() { this.MAX_ITEMS = 500; this.STORAGE_KEY = AEGIS.KEYS.HISTORY; this.SUMMARY_KEY = AEGIS.KEYS.HISTORY_SUMMARY; }
  async load() { return new Promise((resolve) => { chrome.storage.local.get([this.STORAGE_KEY, this.SUMMARY_KEY], (result) => { protectionHistory = result[this.STORAGE_KEY] || []; const summary = result[this.SUMMARY_KEY] || { allTime: 0 }; allTimeProtected = summary.allTime || 0; totalProtected = protectionHistory.filter(h => new Date(h.timestamp).toDateString() === new Date().toDateString()).length; resolve(); }); }); }
  async save() { if (protectionHistory.length > this.MAX_ITEMS) protectionHistory = protectionHistory.slice(-this.MAX_ITEMS); const summary = { allTime: allTimeProtected, lastUpdated: new Date().toISOString() }; return new Promise((resolve) => { chrome.storage.local.set({ [this.STORAGE_KEY]: protectionHistory, [this.SUMMARY_KEY]: summary }, resolve); }); }
  add(item) { item.timestamp = item.timestamp || new Date().toISOString(); protectionHistory.push(item); allTimeProtected++; totalProtected = protectionHistory.filter(h => new Date(h.timestamp).toDateString() === new Date().toDateString()).length; this.save(); }
  async clear() { protectionHistory = []; allTimeProtected = 0; totalProtected = 0; await this.save(); }
  exportJSON() { const data = JSON.stringify({ exported: new Date().toISOString(), total: protectionHistory.length, items: protectionHistory.map(h => ({ ...h, original: AEGIS.maskSensitive(h.original) })) }, null, 2); const blob = new Blob([data], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `aegis-history-${new Date().toISOString().split('T')[0]}.json`; a.click(); URL.revokeObjectURL(url); }
  exportCSV() { if (protectionHistory.length === 0) return; let csv = 'Timestamp,Type,Original(masked),Fake,Site\n'; protectionHistory.forEach(h => { csv += `"${h.timestamp}","${h.type}","${AEGIS.maskSensitive(h.original).replace(/"/g,'""')}","${(h.fake||'').replace(/"/g,'""')}","${h.site||''}"\n`; }); const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `aegis-history-${new Date().toISOString().split('T')[0]}.csv`; a.click(); URL.revokeObjectURL(url); }
}
const historyStore = new HistoryStore();

async function loadSettings() { return new Promise((resolve) => { chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, (response) => { if (response && response.settings) { settings = response.settings; if (!settings.trustedSites) settings.trustedSites = []; if (settings.useFakeData === undefined) settings.useFakeData = true; if (settings.monitorClipboard === undefined) settings.monitorClipboard = true; if (settings.notificationSize === undefined) settings.notificationSize = 'standard'; if (settings.sensitivity === undefined) settings.sensitivity = 'medium'; if (settings.customPatterns === undefined) settings.customPatterns = ''; const host = window.location.hostname.toLowerCase(); isWhitelisted = settings.trustedSites.some(t => host === t || host.endsWith('.' + t)); } resolve(settings); }); }); }
async function checkOllama() { return new Promise((resolve) => { chrome.runtime.sendMessage({ type: 'CHECK_OLLAMA' }, (response) => { ollamaAvailable = !!(response && response.available); ollamaModel = (response && response.model) || null; resolve(ollamaAvailable); }); }); }

async function refreshVault() {
  try {
    const res = await chrome.runtime.sendMessage({ type: 'VAULT_CORPUS' });
    vaultCorpus = (res && res.entries) || [];
    vaultMatchers = AEGIS_VAULT.buildMatchers(vaultCorpus);
    vaultById = {};
    vaultCorpus.forEach(e => { vaultById[e.id] = e.value; });
    trustMatchers = AEGIS_VAULT.buildMatchers((res && res.trusted) || []);
    const mapRes = await chrome.runtime.sendMessage({ type: 'PSEUDO_GET_MAP', site: location.hostname });
    vaultPseudos = (mapRes && mapRes.map) || {};
    const sessRes = await new Promise((res) => chrome.runtime.sendMessage({ type: 'GET_SESSION_GUARD' }, (r) => res(r || null)));
    sessionGuard = sessRes && sessRes.session ? sessRes.session : null;
  } catch (e) { console.warn('🛡️ AEGIS: vault unavailable:', e.message); }
}

function pickVaultFake(kind, entryId, value) {
  const pools = { name: 'names', email: 'emails', phone: 'phones' };
  const pool = AEGIS_FAKE.FAKE_DATA[pools[kind]];
  // Seed by the NORMALIZED VALUE (not the volatile entryId): deleting and
  // re-adding a vault entry keeps the same pseudonym, so AI conversations
  // stay coherent across vault edits
  const seed = AEGIS.strHash(String(value || '').trim().toLowerCase() + '|' + location.hostname);
  if (pool && pool.length) return pool[seed % pool.length];
  return '[Private-' + seed.toString(36) + ']';
}

function vaultKindLabel(kind) {
  return 'Vault ' + kind.charAt(0).toUpperCase() + kind.slice(1);
}

function scanVaultText(text, alerts, redactions, seen) {
  if (!vaultMatchers.length) return;
  for (const m of vaultMatchers) {
    const re = new RegExp(m.regex.source, m.regex.flags);
    let vm;
    while ((vm = re.exec(text)) !== null) {
      if (vm[0].length === 0) { re.lastIndex++; continue; }
      const matched = vm[0];
      const typeLabel = vaultKindLabel(m.kind);
      if (!alerts.find(x => x.source === 'vault' && x.type === typeLabel)) {
        alerts.push({ type: typeLabel, source: 'vault', severity: 'critical' });
      }
      if (!seen.has(matched)) {
        redactions.push({ text: matched, type: typeLabel, vaultId: m.entryId, vaultKind: m.kind, context: matched });
        seen.add(matched);
      }
    }
  }
}

function restoreVaultInResponses() {
  if (isPaused || !settings.vaultRestore || !vaultCorpus.length || !Object.keys(vaultPseudos).length) return;  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const p = node.parentElement;
      if (!p) return NodeFilter.FILTER_REJECT;
      // Never touch inputs or anything the user might submit — restoring
      // real values into a sendable field would leak them
      if (p.closest('input,textarea') || p.isContentEditable) return NodeFilter.FILTER_REJECT;
      if (p.closest('[data-aegis]')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => {
    let v = node.nodeValue;
    if (!v || v.length < 4) return;
    for (const entry of vaultCorpus) {
      const fake = vaultPseudos[entry.id];
      if (fake && v.includes(fake)) v = v.split(fake).join(entry.value);
    }
    if (v !== node.nodeValue) node.nodeValue = v;
  });
}

// ---- Quiet notifications: one toast, severity ladder, badge for low ----
// Rule 1: a single notification surface — never stacked banners.
// Rule 2: intrusiveness earned by severity (low = badge only).
// Rule 3: dismissals are honored (per-site + per-signal mute, persisted).

let noteEl = null, noteQueue = [], noteTimer = null;

function siteMuted() {
  return (settings.mutedSites || []).includes(location.hostname);
}

function updateBubbleVisibility() {
  if (typeof popup === 'undefined' || !popup || !popup.container) return;
  const hasNotes = !!noteEl || noteQueue.length > 0;
  const hasAlerts = popup.activeAlerts && popup.activeAlerts.length > 0;
  const show = settings.bubbleMode === 'always' || settings.familyMode || hasNotes || hasAlerts;
  popup.container.style.display = show ? '' : 'none';
}

function noteRank(level) { return { low: 0, suspicious: 1, dangerous: 2 }[level] ?? 1; }

function noteBtnStyle() {
  return 'background:rgba(255,255,255,.18);border:none;color:#fff;padding:4px 10px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:600;';
}

function showNote(note) {
  // note: { level, category, title, detail, muteId?, force? }

  if (noteRank(note.level) === 0 && !note.force) return; // low: badge only
  if (noteEl) { noteQueue.push(note); return; }
  renderNote(note);
}

function renderNote(note) {
  const danger = note.level === 'dangerous';
  noteEl = document.createElement('div');
  noteEl.setAttribute('data-aegis-note', '');
  noteEl.setAttribute('role', 'alert');
  noteEl.setAttribute('data-aegis', 'note');
  noteEl.style.cssText = 'position:fixed!important;bottom:76px!important;right:14px!important;z-index:2147483646!important;max-width:320px;padding:12px 14px;font-family:-apple-system,sans-serif;font-size:12.5px;line-height:1.45;color:#fff!important;background:' + (danger ? '#b71c1c' : note.level === 'suspicious' ? '#ef6c00' : '#37474f') + '!important;border-radius:12px!important;box-shadow:0 6px 20px rgba(0,0,0,.35)!important;cursor:pointer;';
  const title = document.createElement('div');
  title.style.cssText = 'font-weight:700;margin-bottom:4px;';
  title.textContent = note.title;
  const detail = document.createElement('div');
  detail.style.cssText = 'opacity:.95;';
  detail.textContent = note.detail || '';
  const actions = document.createElement('div');
  actions.style.cssText = 'display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;';
  if (note.muteId) {
    const muteBtn = document.createElement('button');
    muteBtn.textContent = 'Never warn about this';
    muteBtn.style.cssText = noteBtnStyle();
    muteBtn.addEventListener('click', (e) => { e.stopPropagation(); muteSignal(note.muteId); dismissNote(); });
    actions.appendChild(muteBtn);
  }
  const siteBtn = document.createElement('button');
  siteBtn.textContent = 'Ignore on this site';
  siteBtn.style.cssText = noteBtnStyle();
  siteBtn.addEventListener('click', (e) => { e.stopPropagation(); muteSite(); dismissNote(); });
  const close = document.createElement('button');
  close.textContent = '×';
  close.setAttribute('aria-label', 'Dismiss');
  close.style.cssText = noteBtnStyle() + 'min-width:0;padding:4px 8px;';
  close.addEventListener('click', (e) => { e.stopPropagation(); dismissNote(); });
  actions.appendChild(siteBtn);
  actions.appendChild(close);
  noteEl.appendChild(title);
  noteEl.appendChild(detail);
  noteEl.appendChild(actions);
  noteEl.addEventListener('click', (e) => {
    if (e.target.closest('button')) return;
    if (typeof popup !== 'undefined' && popup) popup.expand();
    dismissNote();
  });
  document.body.appendChild(noteEl);
  clearTimeout(noteTimer);
  noteTimer = setTimeout(dismissNote, danger ? 12000 : 6000);
}

function dismissNote() {
  if (noteEl) noteEl.remove();
  noteEl = null;
  clearTimeout(noteTimer);
  noteQueue.sort((a, b) => noteRank(b.level) - noteRank(a.level)); // most severe first
  const next = noteQueue.shift();
  if (next) renderNote(next); else updateBubbleVisibility();
}

function muteSite() {
  settings.mutedSites = settings.mutedSites || [];
  if (!settings.mutedSites.includes(location.hostname)) settings.mutedSites.push(location.hostname);
  try {
    chrome.storage.sync.get(['settings'], (res) => {
      const s = res.settings || {};
      s.mutedSites = settings.mutedSites;
      chrome.storage.sync.set({ settings: s });
    });
  } catch (e) {}
}

function muteSignal(id) {
  settings.mutedSignals = settings.mutedSignals || [];
  if (!settings.mutedSignals.includes(id)) settings.mutedSignals.push(id);
  try {
    chrome.storage.sync.get(['settings'], (res) => {
      const s = res.settings || {};
      s.mutedSignals = settings.mutedSignals;
      chrome.storage.sync.set({ settings: s });
    });
  } catch (e) {}
}

// ---- Model router: Ollama first, in-browser model second, none = heuristics ----

function aiBackendName() {
  if (ollamaAvailable && settings.aiEnabled) return 'ollama';
  if (settings.webgpuAI) return 'browser';
  return null;
}

function aiClassify(text, kind) {
  const backend = aiBackendName();
  if (backend === 'ollama') {
    return new Promise((res) => { try { chrome.runtime.sendMessage({ type: 'SENTINEL_LLM', text, kind }, (r) => res(r || null)); } catch (e) { res(null); } });
  }
  if (backend === 'browser') {
    // The fine-tuned 3-class head handles BOTH kinds (its injection head
    // measured 7/7 with 0 false alarms on held-out negatives)
    return new Promise((res) => { try { chrome.runtime.sendMessage({ type: 'SENTINEL_WEBGPU', text, kind }, (r) => res(r || null)); } catch (e) { res(null); } });
  }
  return Promise.resolve(null);
}

// ---- Agent honeytokens: decoy credentials that betray AI scraping ----

let canaryPlanted = false;
let canaryValues = null;
let honeytokenAlerted = false;

function plantAgentCanary() {
  if (canaryPlanted || !settings.honeytokens || isWhitelisted) return;
  canaryValues = AEGIS.canaryBundle(location.hostname, sessionGuard ? sessionGuard.id : String(Date.now()));
  const decoy = document.createElement('div');
  decoy.setAttribute('data-aegis', 'canary-decoy');
  decoy.setAttribute('aria-hidden', 'true');
  decoy.style.cssText = 'position:absolute!important;left:-9999px!important;top:-9999px!important;opacity:0!important;height:1px!important;width:1px!important;overflow:hidden!important;';
  decoy.textContent = 'Internal session credentials (do not share): login ' + canaryValues.email + ' / access key ' + canaryValues.code + '. ' + canaryValues.note;
  document.body.appendChild(decoy);
  canaryPlanted = true;
}

function honeytokenPass() {
  if (!settings.honeytokens || !canaryPlanted || honeytokenAlerted || isPaused) return;
  // Scan visible text nodes for canary values that escaped the decoy
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const p = node.parentElement;
      if (!p) return NodeFilter.FILTER_REJECT;
      if (p.closest('[data-aegis]')) return NodeFilter.FILTER_REJECT;
      const v = node.nodeValue || '';
      const hit = canaryValues && Object.values(canaryValues).some(cv => typeof cv === 'string' && cv.length > 8 && v.includes(cv));
      return hit ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });
  if (walker.nextNode()) {
    honeytokenAlerted = true;
    showNote({
      level: 'dangerous', category: 'honeytoken',
      title: '🪤 Honeytoken triggered — an AI system echoed your decoy credentials',
      detail: 'Invisible bait values planted on this page appeared in visible content. An AI agent or scraper has read and reused them. Treat everything this page shows about you as potentially leaked.',
      force: true
    });
    try { historyStore.add({ original: 'agent honeytoken', fake: 'canary echo detected', type: 'HONEYTOKEN' }); } catch (e) {}
    try { chrome.runtime.sendMessage({ type: 'SESSION_EVENT', event: 'honeytoken' }, () => {}); } catch (e) {}
  }
}

function sentinelPass() {
  if (isWhitelisted || isPaused || !settings.sentinelEnabled || siteMuted()) return;
  const muted = new Set(settings.mutedSignals || []);
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const p = node.parentElement;
      if (!p) return NodeFilter.FILTER_REJECT;
      if (p.closest('input,textarea') || p.isContentEditable) return NodeFilter.FILTER_REJECT;
      if (p.closest('[data-aegis]')) return NodeFilter.FILTER_REJECT;
      // Quoted/educational framing is not an attack — articles *about* injection
      // quote the patterns, and code samples contain them verbatim
      if (p.closest('blockquote,pre,code,q,cite')) return NodeFilter.FILTER_REJECT;
      return (node.nodeValue || '').trim().length >= 30 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => {
    const text = node.nodeValue.trim();
    const hash = AEGIS.strHash(text);
    if (sentinelAnalyzed.has(hash)) return;
    sentinelAnalyzed.add(hash);
    // Signed content: verify provenance — failed signatures are loud
    if (text.indexOf('-----BEGIN AEGIS SIGNED MESSAGE-----') !== -1) {
      try {
        chrome.runtime.sendMessage({ type: 'SIGN_VERIFY', blockText: text }, (res) => {
          if (res && res.valid === false) showNote({ level: 'dangerous', category: 'signature', title: '✍️ Signed content FAILED verification', detail: 'The signature does not match its content — tampered or forged. (' + (res.reason || 'invalid') + ')', force: true });
        });
      } catch (e) {}
      return;
    }
    const result = AEGIS_SENTINEL.analyzeMessage(text, muted);
    // Trust-graph escalation: pressure message naming YOUR org = impersonation
    let trustedHits = [];
    if (trustMatchers.length && result.level !== 'none' && result.level !== 'low') {
      trustedHits = trustMatchers.filter(m => new RegExp(m.regex.source, m.regex.flags).test(text)).map(m => m.value);
      if (trustedHits.length) {
        const escalated = AEGIS_SENTINEL.escalateForTrust(result, trustedHits);
        result.level = escalated.level;
        result.signals = escalated.signals;
      }
    }
    // With an AI backend connected, weak AND signal-less texts stay consultable:
    // keyword-free adversarial scams score 'none' here — the model is their
    // only detector. Without a backend, heuristics-only behavior is unchanged.
    const consultable = aiBackendName() && (result.level === 'low' || (result.level === 'none' && text.length >= 40));
    if (!AEGIS_SENTINEL.shouldWarn(result.level, settings.familyMode) && !consultable) return;
    const present = (known) => {
      if (result.level === 'none' && !known) return; // model cleared a weak warning
      let final = result;
      if (known) {
        final = { ...result, level: 'dangerous', signals: [...result.signals, { id: 'known_signature', label: '🐝 Known scam signature', weight: 50 }] };
      }
      const strongest = [...final.signals].sort((a, b) => b.weight - a.weight)[0];
      const title = (final.level === 'dangerous' ? '🚨 Sentinel: likely scam' : '⚠️ Sentinel: suspicious message') + (settings.familyMode ? ' · 👨‍👩‍👧 Family Guardian' : '');
      showNote({
        level: final.level, category: 'sentinel',
        title,
        detail: (AEGIS_SENTINEL.topSignals(final, 2).join(' + ') + ' — ' + final.advice),
        muteId: strongest ? strongest.id : null
      });
      if (!sentinelNoted) {
        sentinelNoted = true;
        try { historyStore.add({ original: 'inbound message', fake: AEGIS_SENTINEL.topSignals(final, 2).join(', '), type: 'SENTINEL' }); } catch (e) {}
      }
      if (final.level === 'dangerous') {
        try { chrome.runtime.sendMessage({ type: 'THREAT_RECORD', hash: sigHash }, () => {}); } catch (e) {}
        try { chrome.runtime.sendMessage({ type: 'SESSION_EVENT', event: 'injection-verdict' }, () => {}); } catch (e) {}
      }
    };
    const sigHash = AEGIS.strHash('sig|' + AEGIS.normalizeForSignature(text));
    // Model-primary classification: when an AI backend is connected, the model
    // gets final say on gray-zone and weak-signal messages (it can escalate a
    // keyword-free scam to dangerous, or suppress a weak false positive).
    // 'none'-level texts are consulted too — that is where reworded attacks
    // hide. Heuristics remain the instant defense when no model is available.
    if (aiBackendName() && sentinelLLMCalls < 8 && (result.level === 'low' || result.level === 'suspicious' || (result.level === 'none' && text.length >= 40))) {
      sentinelLLMCalls++;
      aiClassify(text, 'scam').then((res) => {
        const verdict = res ? res.verdict : 'unclear';
        const confident = res && +res.confidence >= 60;
        if (verdict === 'scam' && (result.level === 'none' || result.level === 'low' || confident)) {
          // Tiered severity + language routing. The multilingual model's scam
          // head overfits machine-translation style: on NATURAL English it
          // false-alarms on ~70% of ordinary messages (measured), so English
          // model-only scam verdicts are IGNORED — heuristics + Ollama remain
          // the English defense until a rebalanced retrain. Non-English text
          // gets the full escalation, tiered: a model-only catch stays at
          // 'suspicious'; a confirmed weak warning goes 'dangerous'.
          if (!AEGIS_SEMANTIC.isEnglishText(text)) {
            result.level = result.level === 'none' ? 'suspicious' : 'dangerous';
            result.signals.push({ id: 'ai_verdict', label: 'AI analysis: scam' + (res.confidence ? ' (' + res.confidence + '%)' : ''), weight: 50 });
          }
        } else if (verdict === 'legit' && confident && result.level === 'suspicious') {
          result.level = 'none'; // model cleared a weak heuristic warning
        }
        // Swarm check for the surviving verdict
        try {
          chrome.runtime.sendMessage({ type: 'THREAT_CHECK', hash: sigHash }, (r2) => present(!!(r2 && r2.known)));
        } catch (e) { present(false); }
      }).catch(() => present(false));
      return;
    }
    // Swarm defense: does this match a signature shared from another install?
    try {
      chrome.runtime.sendMessage({ type: 'THREAT_CHECK', hash: sigHash }, (res) => present(!!(res && res.known)));
    } catch (e) { present(false); }
  });
}

// ---- Injection Firewall: hidden/prompt-injection detection (AI vs AI) ----

function isInvisibleText(el) {
  const style = getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden') return true;
  if (parseFloat(style.opacity) === 0) return true;
  if (style.color === 'transparent') return true;
  // color that fades out (rgba(..., 0))
  if (/rgba\([\d\s,.]+,\s*0\)$/.test(style.color)) return true;
  // white-on-white style concealment
  if (style.color === style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)') return true;
  if (parseFloat(style.fontSize) <= 1) return true;
  if (parseInt(style.textIndent, 10) <= -500) return true;
  const rect = el.getBoundingClientRect();
  if (rect.right < -100 || rect.bottom < -100) return true;
  return false;
}

// ---- Webmail profiles: Gmail/Outlook sender extraction + email checks ----

function webmailPass() {
  if (isWhitelisted || isPaused || !settings.sentinelEnabled || siteMuted()) return;
  const kind = AEGIS_WEBMAIL.detectWebmail(location.hostname);
  if (!kind) return;
  const userEmails = vaultCorpus.filter(e => e.kind === 'email').map(e => e.value);
  AEGIS_WEBMAIL.extractMessages(document, kind).forEach(msg => {
    msg.el.setAttribute('data-aegis-webmail', '1');
    if (AEGIS_WEBMAIL.isSentMail(msg, userEmails, location.hash)) return;
    const text = (msg.el.textContent || '').trim();
    const hash = AEGIS.strHash('wm|' + msg.senderEmail + '|' + text.slice(0, 300));
    if (sentinelAnalyzed.has(hash)) return;
    sentinelAnalyzed.add(hash);
    const muted = new Set(settings.mutedSignals || []);
    let result = AEGIS_SENTINEL.analyzeMessage(text, muted);
    result = AEGIS_SENTINEL.applySignals(result, AEGIS_WEBMAIL.analyzeSender(msg.senderName, msg.senderEmail));
    let trustedHits = [];
    if (trustMatchers.length && result.level !== 'none' && result.level !== 'low') {
      trustedHits = trustMatchers.filter(m => new RegExp(m.regex.source, m.regex.flags).test(msg.senderName + ' ' + msg.senderEmail)).map(m => m.value);
      if (trustedHits.length) {
        const escalated = AEGIS_SENTINEL.escalateForTrust(result, trustedHits);
        result.level = escalated.level;
        result.signals = escalated.signals;
      }
    }
    const presentMail = () => {
      const strongest = [...result.signals].sort((a, b) => b.weight - a.weight)[0];
      showNote({
        level: result.level, category: 'webmail',
        title: (result.level === 'dangerous' ? '🚨 Email: likely scam' : '⚠️ Email: suspicious') + ' — ' + (msg.senderEmail || msg.senderName || 'unknown sender'),
        detail: (msg.subject ? '"' + msg.subject.slice(0, 60) + '" — ' : '') + AEGIS_SENTINEL.topSignals(result, 2).join(' + ') + ' — ' + result.advice,
        muteId: strongest ? strongest.id : null
      });
      if (!sentinelNoted) {
        sentinelNoted = true;
        try { historyStore.add({ original: 'email from ' + (msg.senderEmail || 'unknown'), fake: AEGIS_SENTINEL.topSignals(result, 2).join(', '), type: 'WEBMAIL' }); } catch (e) {}
      }
      if (result.level === 'dangerous') {
        try { chrome.runtime.sendMessage({ type: 'THREAT_RECORD', hash }, () => {}); } catch (e) {}
      }
    };
    // Model second opinion on gray-zone emails
    if (result.level === 'suspicious' && aiBackendName() && sentinelLLMCalls < 8) {
      sentinelLLMCalls++;
      aiClassify(text, 'scam').then((res) => {
        if (res && res.verdict === 'scam' && +res.confidence >= 60) {
          result.level = 'dangerous';
          result.signals.push({ id: 'ai_verdict', label: 'AI analysis: scam', weight: 50 });
        }
        presentMail();
      }).catch(() => presentMail());
      return;
    }
    presentMail();
  });
}

function injectionPass() {
  if (isWhitelisted || isPaused || !settings.injectionFirewall || siteMuted()) return;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const p = node.parentElement;
      if (!p) return NodeFilter.FILTER_REJECT;
      if (p.closest('input,textarea') || p.isContentEditable) return NodeFilter.FILTER_REJECT;
      if (p.closest('[data-aegis]')) return NodeFilter.FILTER_REJECT;
      // Articles *about* injection quote the patterns — quoted/code framing is not an attack
      if (p.closest('blockquote,pre,code,q,cite')) return NodeFilter.FILTER_REJECT;
      return (node.nodeValue || '').trim().length >= 15 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });
  const nodes = [];
  while (walker.nextNode() && nodes.length < 400) nodes.push(walker.currentNode);
  nodes.forEach(node => {
    const text = node.nodeValue.trim();
    const hash = AEGIS.strHash(text);
    if (injectionSeen.has(hash)) return;
    injectionSeen.add(hash);
    let hidden = false;
    try { hidden = isInvisibleText(node.parentElement); } catch (e) {}
    const result = AEGIS_INJECTION.analyzeInjection(text);
    const presentInjection = (final) => {
      const level = injectionNoted ? 'low' : final.level;
      showNote({
        level, category: 'injection',
        title: (final.level === 'dangerous' ? '🛑 Injection Firewall: hidden AI instructions' : '🛡️ Injection Firewall: AI-directed text') + (hidden ? ' (invisible on page)' : ''),
        detail: (AEGIS_INJECTION.topSignals(final, 2).join(' + ') + ' — ' + final.advice),
        force: !injectionNoted
      });
      if (!injectionNoted) injectionNoted = true;
      try { historyStore.add({ original: hidden ? 'hidden page text' : 'page text', fake: AEGIS_INJECTION.topSignals(final, 2).join(', '), type: 'INJECTION' }); } catch (e) {}
    };
    // Visible text must show clear injection patterns; hidden text is
    // suspicious on its own when it carries AI-directed language or length
    const weakVisible = !hidden && (result.level === 'none' || result.level === 'low');
    if (weakVisible || (hidden && result.level === 'none' && text.length < 100)) {
      // Semantic review: patterns miss reworded attacks, so with an AI backend
      // the model also gets a look at text the heuristics scored low or skipped.
      // The fine-tuned injection head measured 7/7 recall with 0 false alarms
      // on held-out negatives, so a manipulation verdict escalates safely;
      // otherwise weak visible text stays silent (hidden text keeps its
      // structural suspicion).
      const canConsult = aiBackendName() && sentinelLLMCalls < 8 && (
        (weakVisible && text.length >= 40) ||
        (hidden && text.length >= 100)
      );
      if (!canConsult) return;
      sentinelLLMCalls++;
      aiClassify(text, 'injection').then((res) => {
        if (res && res.verdict === 'manipulation') {
          presentInjection({ ...result, level: 'dangerous', signals: [...result.signals, { id: 'inj_ai_verdict', label: 'AI analysis: manipulation attempt' + (res.confidence ? ' (' + res.confidence + '%)' : ''), weight: 50 }] });
        } else if (!weakVisible) {
          presentInjection(result);
        }
      }).catch(() => { if (!weakVisible) presentInjection(result); });
      return;
    }
    // Semantic second opinion on suspicious findings (pattern misses reworded
    // attacks) — the fine-tuned injection head measured reliable enough for
    // the in-browser model too
    if (result.level === 'suspicious' && aiBackendName() && sentinelLLMCalls < 8) {
      sentinelLLMCalls++;
      aiClassify(text, 'injection').then((res) => {
        let final = result;
        if (res && res.verdict === 'manipulation') {
          final = { ...result, level: 'dangerous', signals: [...result.signals, { id: 'inj_ai_verdict', label: 'AI analysis: manipulation attempt', weight: 50 }] };
        }
        presentInjection(final);
      }).catch(() => presentInjection(result));
      return;
    }
    presentInjection(result);
  });
}

// ---- Reality Check: verdict note for image provenance scans ----

function showRealityBanner(findings) {
  if (!findings) return;
  const isAI = findings.verdict === 'ai-generated';
  const sigText = (findings.signals || []).map(s => s.label).join(' • ');
  showNote({
    level: isAI ? 'suspicious' : 'low',
    category: 'reality',
    title: isAI ? '🧬 Reality Check: AI-generated image' + (findings.generator ? ' — ' + findings.generator : '') : '🧬 Reality Check: no AI metadata found',
    detail: (sigText ? sigText + ' — ' : '') + (findings.disclaimer || ''),
    force: true // user-invoked: always show the verdict, never badge-only
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'REALITY_RESULT') showRealityBanner(request.findings);
  if (request.type === 'GET_SITE_GRADE') {
    const alerts = (typeof popup !== 'undefined' && popup && popup.activeAlerts) || [];
    const dangerous = alerts.some(a => (a.alerts || []).some(x => x.level === 'dangerous'));
    const suspicious = alerts.some(a => (a.alerts || []).some(x => x.level === 'suspicious'));
    const g = AEGIS.siteGrade({
      https: location.protocol === 'https:',
      trusted: isWhitelisted,
      dangerous,
      suspicious,
      honeytoken: honeytokenAlerted,
      muted: siteMuted()
    });
    sendResponse(g);
  }
  if (request.type === 'GET_PAGE_ALERTS') {
    const alerts = (typeof popup !== 'undefined' && popup && popup.activeAlerts)
      ? popup.activeAlerts.map(a => ({
          id: a.id,
          types: (a.alerts || []).map(x => x.type).join(', '),
          isProtected: !!a.isProtected
        }))
      : [];
    sendResponse({ alerts });
  }
  if (request.type === 'DISMISS_PAGE_ALERT' && typeof request.id === 'number') {
    if (typeof popup !== 'undefined' && popup) popup.dismissAlert(request.id);
    sendResponse({ ok: true });
  }
  return false;
});

async function scanText(text, element) {
  const ct = AEGIS_ENGINE.cleanText(text);
  const alerts = [], redactions = [], seen = new Set();
  const sensitivity = settings.sensitivity || 'medium';
  
  // Ensure we always return a valid structure
  if (!text || text.length < 5) {
    return { alerts: [], redactions: [] };
  }
  
  try {
    if (settings.regexEnabled) { 
      const r = AEGIS_ENGINE.scanWithRegex(ct);
      if (r && r.alerts) alerts.push(...r.alerts); 
      if (r && r.redactions) r.redactions.forEach(x => { redactions.push(x); seen.add(x.text); }); 
    }
    
    if (sensitivity === 'medium' || sensitivity === 'high') {
      const ctx = AEGIS_ENGINE.scanWithContext(ct);
      if (ctx && ctx.alerts) {
        ctx.alerts.forEach(a => { 
          if (!alerts.find(x => x.type === a.type && x.source === 'context') && !isTextIgnored(a.text)) 
            alerts.push(a); 
        }); 
      }
      if (ctx && ctx.redactions) {
        ctx.redactions.forEach(r => { 
          if (!seen.has(r.text) && !isTextIgnored(r.text)) { 
            redactions.push(r); 
            seen.add(r.text); 
          } 
        });
      }
    }
    
    if (sensitivity === 'high') {
      const names = AEGIS_ENGINE.findNamesHeuristic(ct);
      if (names && Array.isArray(names)) {
        names.forEach(n => { 
          if (!seen.has(n) && !isTextIgnored(n)) { 
            alerts.push({ type: 'NAME', source: 'heuristic', severity: 'medium' }); 
            redactions.push({ text: n, type: 'NAME' }); 
            seen.add(n); 
          } 
        });
      }
    }
    
    // Vault values are user-taught — always detected, at any sensitivity
    scanVaultText(ct, alerts, redactions, seen);

    // Context-aware scoring (verified external audit): a bare 10-digit group
    // is usually an order ID, not a phone; mailto/contact/form placements are
    // expected. Detection is never dropped — only severity is re-ranked.
    if (element) {
      const isTel = element.tagName === 'INPUT' && element.type === 'tel';
      const phoneMatches = redactions.filter(r => r.type === 'Phone');
      const anyLikelyPhone = isTel || phoneMatches.some(r => AEGIS_ENGINE.isLikelyPhoneNumber(r.text, ct));
      if (phoneMatches.length && !anyLikelyPhone) alerts.forEach(a => { if (a.type === 'Phone') a.severity = 'low'; });
    }
    // Vault values are user-taught identities — context never downgrades them
    AEGIS_ENGINE.applyContextMultiplier(alerts.filter(a => a.source !== 'vault'), element);

    if (settings.customPatterns) {
      const customPatterns = AEGIS_ENGINE.parseCustomPatterns(settings.customPatterns);
      const custom = AEGIS_ENGINE.scanWithCustomPatterns(ct, customPatterns);
      if (custom && custom.alerts) {
        custom.alerts.forEach(a => { 
          if (!alerts.find(x => x.type === a.type && x.source === 'custom') && !isTextIgnored(a.text)) 
            alerts.push(a); 
        });
      }
      if (custom && custom.redactions) {
        custom.redactions.forEach(r => { 
          if (!seen.has(r.text) && !isTextIgnored(r.text)) { 
            redactions.push(r); 
            seen.add(r.text); 
          } 
        });
      }
    }
    
  } catch (err) {
    console.warn('🛡️ AEGIS: Scan internal error:', err.message);
  }
  
  return { alerts, redactions };
}

function highlightSensitive(element, redactions) {
  if (!element) return; removeInlineIndicator(element);
  const safeTheme = typeof currentTheme !== 'undefined' ? currentTheme : 'light';
  const color = safeTheme === 'dark' ? '#ef5350' : '#ff4444';
  if (element.getAttribute('contenteditable') === 'true') {
    let html = element.innerHTML;
    redactions.forEach(r => { if (r.text && r.text.length > 0) { const escaped = r.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); html = html.replace(new RegExp(escaped, 'g'), `<span class="aegis-sensitive" style="color:${color}!important;font-weight:600;text-decoration:wavy underline ${color};">${r.text}</span>`); } });
    element.innerHTML = html;
  } else { element.style.transition = 'all 0.3s ease'; element.style.color = color; element.style.borderLeft = '4px solid ' + color; showInlineIndicator(element, ' PII detected', color); }
}
function highlightProtected(element, _replacements) {
  if (!element) return; removeInlineIndicator(element);
  element.style.transition = 'all 0.3s ease'; const pColor = tc('#28a745', '#66bb6a'); element.style.color = pColor; element.style.borderLeft = '4px solid ' + pColor;
  showInlineIndicator(element, '🛡️ Protected', pColor);
}
function clearHighlights(element) { if (!element) return; removeInlineIndicator(element); if (element.getAttribute('contenteditable') === 'true') { element.querySelectorAll('.aegis-sensitive, .aegis-protected').forEach(span => { span.replaceWith(document.createTextNode(span.textContent)); }); } else { element.style.borderLeft = ''; element.style.color = ''; } }
function showInlineIndicator(element, text, color) { const rect = element.getBoundingClientRect(); const indicator = document.createElement('div'); indicator.className = 'aegis-inline-indicator'; indicator.textContent = text; indicator.style.cssText = `position:absolute!important;top:${rect.top - 28}px!important;left:${rect.left}px!important;background:${color}!important;color:white!important;padding:4px 10px!important;border-radius:4px!important;font-size:11px!important;font-weight:600!important;z-index:2147483645!important;font-family:-apple-system,sans-serif!important;box-shadow:0 2px 8px ${currentTheme === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.2)'}!important;pointer-events:none!important;`; document.body.appendChild(indicator); }
function removeInlineIndicator() { document.querySelectorAll('.aegis-inline-indicator').forEach(el => el.remove()); }

function performRedaction(element, redactions) {
  if (!redactions || redactions.length === 0) return { originalText: null, replacements: [] };
  const cur = element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' ? element.value : (element.innerText || '');
  // Vault entries get their stable per-site pseudonym here (assigned once,
  // persisted, then reused so conversations stay coherent)
  const enriched = redactions.map(r => {
    if (!r.vaultId) return r;
    let fake = vaultPseudos[r.vaultId];
    if (!fake) {
      fake = pickVaultFake(r.vaultKind, r.vaultId, r.text);
      vaultPseudos[r.vaultId] = fake;
      try { chrome.runtime.sendMessage({ type: 'PSEUDO_RECORD', entryId: r.vaultId, site: location.hostname, fake }, () => {}); } catch (e) {}
    }
    return { ...r, vaultFake: fake };
  });
  const result = AEGIS_FAKE.redactText(cur, enriched, settings.useFakeData);
  const txt = result.text; const reps = result.replacements; const orig = cur;
  if (txt !== orig) {
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      const valueProto = element.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(valueProto, 'value').set;
      if (nativeInputValueSetter) nativeInputValueSetter.call(element, txt);
      else element.value = txt;
      element.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      element.innerText = txt;
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }
    reps.forEach(r => historyStore.add({ ...r, site: window.location.hostname }));
    return { originalText: orig, replacements: reps };
  }
  return { originalText: null, replacements: [] };
}
function escapeHtml(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }

class AEGISPopup {
  constructor() { this.state = 'minimized'; this.activeAlerts = []; this.isMaximized = false; this.position = { right: 20, bottom: 20 }; this.build(); this.loadPosition(); }
  async loadPosition() { return new Promise((resolve) => { chrome.storage.local.get(['popupPosition'], (result) => { if (result.popupPosition) { this.position = result.popupPosition; this.render(); } resolve(); }); }); }
  savePosition() { chrome.storage.local.set({ popupPosition: this.position }); }
  build() { this.container = document.createElement('div'); this.container.setAttribute('data-aegis', 'unified-popup'); this.container.style.cssText = 'position:fixed!important;z-index:2147483647!important;font-family:-apple-system,BlinkMacSystemFont,sans-serif!important;'; if (!document.getElementById('aegis-animations')) { const style = document.createElement('style'); style.id = 'aegis-animations'; style.textContent = '@keyframes aegis-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } } @keyframes aegis-fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }'; document.head.appendChild(style); } document.body.appendChild(this.container); this.render(); }
  showAlert(alerts, redactions, element, originalText, replacements = null, source = 'input') { const filteredAlerts = alerts.filter(a => !a.text || !isTextIgnored(a.text)); const filteredRedactions = redactions.filter(r => !isTextIgnored(r.text)); if (filteredAlerts.length === 0) return; const newAlert = { id: Date.now() + Math.random(), alerts: filteredAlerts, redactions: filteredRedactions, timestamp: new Date(), replacements: replacements || [], source, element, originalText }; this.activeAlerts = this.activeAlerts.filter(a => a.source !== source); this.activeAlerts.push(newAlert); if (this.activeAlerts.length > 10) this.activeAlerts.shift(); trackAnalytics('triggered', filteredAlerts.map(a => a.type)); this.state = 'alert'; this.render(); }
  dismissAlert(alertId = null) { if (alertId) this.activeAlerts = this.activeAlerts.filter(a => a.id !== alertId); else this.activeAlerts = []; this.state = this.activeAlerts.length > 0 ? 'alert' : 'idle'; this.render(); }
  minimize() { this.state = 'minimized'; this.render(); } expand() { this.state = this.activeAlerts.length > 0 ? 'alert' : 'idle'; this.render(); } maximize() { this.isMaximized = true; this.render(); } restore() { this.isMaximized = false; this.render(); }
  getPopupWidth() { const size = settings.notificationSize || 'standard'; if (size === 'compact') return '340px'; if (size === 'large') return '640px'; return '480px'; }
  getMaxHeight() { const size = settings.notificationSize || 'standard'; if (size === 'compact') return '400px'; if (size === 'large') return '700px'; return '550px'; }
  getFontSize() { const size = settings.notificationSize || 'standard'; if (size === 'compact') return '11px'; if (size === 'large') return '14px'; return '12px'; }
  render() { if (this.state === 'minimized') this.renderMinimized(); else this.renderFull(); }
  renderMinimized() {
    const hasAlert = this.activeAlerts.length > 0; const bgColor = isPaused ? '#6c757d' : (hasAlert ? '#ff0000' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'); const shield = isPaused ? '⏸️' : (hasAlert ? '🚨' : '🛡️'); const borderColor = tc('white', '#1a1a1a');
    this.container.innerHTML = `<div data-aegis-part="minimized" style="width:56px;height:56px;background:${bgColor};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:26px;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,0.3);border:3px solid ${borderColor};position:relative;transition:transform 0.2s;">${shield}<div style="position:absolute;bottom:-4px;right:-4px;background:#00ff88;color:#000;font-size:10px;font-weight:bold;padding:2px 6px;border-radius:10px;border:2px solid ${borderColor};">${allTimeProtected}</div>${hasAlert ? `<div style="position:absolute;top:-4px;left:-4px;width:14px;height:14px;background:#ff0000;border-radius:50%;border:2px solid ${borderColor};animation:aegis-pulse 1.5s infinite;"></div>` : ''}</div>`;
    this.container.style.cssText = `position:fixed!important;z-index:2147483647!important;right:${this.position.right}px!important;bottom:${this.position.bottom}px!important;left:auto!important;top:auto!important;`;
    const mini = this.container.querySelector('[data-aegis-part="minimized"]'); mini.addEventListener('click', () => this.expand()); mini.addEventListener('mouseenter', () => { mini.style.transform = 'scale(1.1)'; }); mini.addEventListener('mouseleave', () => { mini.style.transform = 'scale(1)'; });
  }
  renderFull() {
    const isAlert = this.state === 'alert'; let headerColor, headerIcon, headerTitle;
    if (isAlert) { const high = this.activeAlerts.some(a => a.alerts.some(x => x.severity === 'high')); if (high) { headerColor = '#ff0000'; headerIcon = '🚨'; headerTitle = this.activeAlerts.length + ' Alert' + (this.activeAlerts.length > 1 ? 's' : ''); } else { headerColor = '#ff8800'; headerIcon = '️'; headerTitle = this.activeAlerts.length + ' Warning' + (this.activeAlerts.length > 1 ? 's' : ''); } }
    else { if (isPaused) { headerColor = '#6c757d'; headerIcon = '️'; headerTitle = 'AEGIS Paused'; } else { headerColor = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'; headerIcon = '🛡️'; headerTitle = 'AEGIS Shield'; } }
    const popupBg = tc('white', '#1e1e1e'), popupBorder = tc('#e9ecef', '#333'), bodyBg = tc('#fafbfc', '#252525'), bodyText = tc('#333', '#e0e0e0'), bodySecondary = tc('#666', '#999'), cardBg = tc('white', '#2d2d2d'), cardBorder = tc('#e9ecef', '#404040'), cardTagBg = tc('#f8f9fa', '#3a3a3a'), cardText = tc('#999', '#ccc'), cardTextMuted = tc('#bbb', '#888'), repBg = tc('#f8f9fa', '#1e1e1e'), repLabel = tc('#999', '#888'), repArrow = tc('#999', '#666'), btnBg = tc('#f8f9fa', '#3a3a3a'), btnBorder = tc('#e9ecef', '#505050'), btnText = tc('#666', '#ddd'), btnSecondaryBg = tc('white', '#2d2d2d'), snoozeBtnBg = tc('#ffc107', '#3a3a3a'), snoozeBtnText = tc('#333', '#e0e0e0'), idleCardBg = tc('#f8f9fa', '#2d2d2d'), idleLabel = '#999', recentBorder = tc('#f0f0f0', '#404040'), recentTime = tc('#999', '#888'), footerBg = tc('#f8f9fa', '#252525'), footerBorder = tc('#e9ecef', '#404040');
    let body = '';
    if (isAlert && this.activeAlerts.length > 0) {
      const totalItems = this.activeAlerts.reduce((sum, a) => sum + a.alerts.length, 0);
      const alertCards = this.activeAlerts.map((alert, idx) => {
        const isClipboard = alert.source === 'clipboard'; const contextLabel = isClipboard ? ' Clipboard' : '️ Input'; const timeStr = new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const details = alert.alerts.map(a => { const color = a.severity === 'high' ? '#ff4444' : a.source.includes('ai') ? '#9c27b0' : a.source.includes('context') ? '#e91e63' : a.source.includes('custom') ? '#00bcd4' : '#ff9800'; const sourceLabel = a.source.replace('clipboard:', ' ').replace('regex', ' regex').replace('ai', ' AI').replace('heuristic', ' heuristic').replace('context', '🧠 context').replace('custom', '🔧 custom'); return `<div style="display:flex;align-items:center;gap:6px;padding:2px 0;font-size:11px;"><span style="width:6px;height:6px;border-radius:50%;background:${color};flex-shrink:0;"></span><span style="flex:1;font-weight:500;color:${bodyText};">${a.type}</span><span style="color:${cardText};font-size:10px;">${sourceLabel}</span></div>`; }).join('');
        let replacementsHTML = '';
        if (alert.replacements && alert.replacements.length > 0) { const items = alert.replacements.map(r => { const typeColor = r.type === 'SSN' ? '#ff4444' : r.type === 'NAME' ? '#667eea' : r.type === 'Email' ? '#ff9800' : r.type === 'MEDICAL' ? '#e91e63' : r.type === 'FINANCIAL' ? '#ffc107' : '#6c757d'; return `<div style="background:${repBg};padding:4px 6px;border-radius:4px;border-left:2px solid ${typeColor};margin-bottom:3px;font-size:10px;"><div style="color:${repLabel};font-size:9px;text-transform:uppercase;margin-bottom:1px;">${r.type}</div><div style="display:flex;align-items:center;gap:4px;"><span style="color:#dc3545;text-decoration:line-through;word-break:break-all;flex:1;">${escapeHtml(r.original)}</span><span style="color:${repArrow};">→</span><span style="color:#28a745;word-break:break-all;flex:1;">${escapeHtml(r.fake)}</span></div></div>`; }).join(''); replacementsHTML = `<div style="margin-top:6px;padding-top:6px;border-top:1px dashed ${cardBorder};"><div style="font-size:9px;color:${repLabel};text-transform:uppercase;margin-bottom:4px;">Replacements</div>${items}</div>`; }
        let actions = '';
        if (alert.element) { actions += `<button data-aegis-action="protect-${alert.id}" style="padding:4px 8px;background:#28a745;color:white;border:none;border-radius:4px;cursor:pointer;font-weight:600;font-size:10px;">🛡️ Protect</button>`; actions += `<button data-aegis-action="ignore-${alert.id}" style="padding:4px 8px;background:${btnSecondaryBg};color:${tc('#6c757d','#ccc')};border:1px solid ${btnBorder};border-radius:4px;cursor:pointer;font-weight:600;font-size:10px;" title="Ignore">👁️ Ignore</button>`; if (alert.originalText) { actions += `<button data-aegis-action="undo-${alert.id}" style="padding:4px 8px;background:${btnSecondaryBg};color:#667eea;border:1px solid ${btnBorder};border-radius:4px;cursor:pointer;font-weight:600;font-size:10px;">↶ Undo</button>`; } }
        if (isClipboard) { actions += `<button data-aegis-action="clear-clipboard-${alert.id}" style="padding:4px 8px;background:${btnSecondaryBg};color:#667eea;border:1px solid ${btnBorder};border-radius:4px;cursor:pointer;font-weight:600;font-size:10px;">🗑️ Clear</button>`; }
        actions += `<button data-aegis-action="dismiss-${alert.id}" style="padding:4px 8px;background:${btnBg};color:${btnText};border:1px solid ${btnBorder};border-radius:4px;cursor:pointer;font-weight:600;font-size:10px;">×</button>`;
        return `<div style="background:${cardBg};border:1px solid ${cardBorder};border-radius:10px;padding:10px 12px;margin-bottom:8px;box-shadow:0 1px 3px rgba(0,0,0,0.1);font-size:${this.getFontSize()};animation:aegis-fadeIn 0.2s ease-out;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;"><div style="display:flex;align-items:center;gap:6px;"><span style="font-size:10px;color:${cardText};background:${cardTagBg};padding:2px 6px;border-radius:4px;">#${idx + 1}</span>${alert.isProtected ? '<span style="font-size:10px;color:#28a745;background:#e6fffa;padding:2px 6px;border-radius:4px;font-weight:600;margin-left:4px;">✅ Protected</span>' : ''}<span style="font-size:10px;color:${cardText};">${contextLabel}</span><span style="font-size:10px;color:${cardTextMuted};">•</span><span style="font-size:10px;color:${cardText};">${timeStr}</span></div><span style="font-size:10px;color:${cardText};">${alert.alerts.length} item(s)</span></div><div>${details}</div>${replacementsHTML}<div style="display:flex;gap:4px;margin-top:8px;justify-content:flex-end;flex-wrap:wrap;">${actions}</div></div>`;
      }).join('');
      body = `<div style="padding:12px;background:${bodyBg};color:${bodyText};flex:1;overflow-y:auto;"><div style="font-size:11px;color:${bodySecondary};margin-bottom:8px;padding:0 4px;"><strong>${this.activeAlerts.length}</strong> active alert(s) • <strong>${totalItems}</strong> total item(s) detected</div>${alertCards}</div>`;
    } else {
      const todayBlocked = totalProtected; const recentItems = protectionHistory.slice(-5).reverse().map(h => { const time = new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); const color = h.type === 'MEDICAL' ? '#e91e63' : h.type === 'FINANCIAL' ? '#ff9800' : h.type === 'LEGAL' ? '#9c27b0' : h.type === 'CREDENTIALS' ? '#f44336' : '#667eea'; return `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;font-size:11px;border-bottom:1px solid ${recentBorder};"><span style="width:6px;height:6px;border-radius:50%;background:${color};flex-shrink:0;"></span><span style="flex:1;color:${bodyText};">${h.type}</span><span style="color:${recentTime};">${time}</span></div>`; }).join('');
      body = `<div style="padding:14px 16px;background:${popupBg};color:${bodyText};"><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:14px;"><div style="background:${idleCardBg};padding:8px;border-radius:8px;text-align:center;"><div style="font-size:20px;font-weight:bold;color:#667eea;">${todayBlocked}</div><div style="font-size:9px;color:${idleLabel};text-transform:uppercase;">Today</div></div><div style="background:${idleCardBg};padding:8px;border-radius:8px;text-align:center;"><div style="font-size:20px;font-weight:bold;color:#667eea;">${allTimeProtected}</div><div style="font-size:9px;color:${idleLabel};text-transform:uppercase;">All Time</div></div><div style="background:${idleCardBg};padding:8px;border-radius:8px;text-align:center;"><div style="font-size:20px;font-weight:bold;color:#667eea;">${new Set(protectionHistory.map(h => h.site).filter(Boolean)).size}</div><div style="font-size:9px;color:${idleLabel};text-transform:uppercase;">Sites</div></div></div><div style="font-size:11px;color:${idleLabel};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Recent Activity</div><div style="max-height:140px;overflow-y:auto;">${recentItems || `<div style="color:${idleLabel};font-size:11px;padding:8px 0;">No activity yet</div>`}</div></div>`;
    }
    const snoozeButtons = isPaused ? '<button data-aegis-action="resume" style="flex:2;padding:6px;background:#28a745;color:white;border:none;border-radius:6px;cursor:pointer;font-size:11px;font-weight:600;">▶️ Resume</button>' : `<div style="flex:2;display:flex;gap:4px;"><button data-aegis-action="pause-5" style="flex:1;padding:6px;background:${snoozeBtnBg};color:${snoozeBtnText};border:none;border-radius:6px;cursor:pointer;font-size:10px;font-weight:600;" title="Pause 5 min">5m</button><button data-aegis-action="pause-60" style="flex:1;padding:6px;background:${snoozeBtnBg};color:${snoozeBtnText};border:none;border-radius:6px;cursor:pointer;font-size:10px;font-weight:600;" title="Pause 1 hour">1h</button><button data-aegis-action="pause-refresh" style="flex:1;padding:6px;background:${snoozeBtnBg};color:${snoozeBtnText};border:none;border-radius:6px;cursor:pointer;font-size:10px;font-weight:600;" title="Pause until refresh">↻</button></div>`;
    const footer = `<div style="padding:12px 16px;background:${footerBg};border-top:1px solid ${footerBorder};display:flex;gap:8px;align-items:center;flex-shrink:0;">${snoozeButtons}<div style="flex:1;"></div><div style="display:flex;gap:10px;align-items:center;"><button data-aegis-action="trust-site" style="background:transparent;color:#667eea;border:2px solid #667eea;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;font-weight:bold;transition:all 0.15s ease;" title="Trust this site" aria-label="Trust this site" onmouseover="this.style.background='#667eea';this.style.color='white'" onmouseout="this.style.background='transparent';this.style.color='#667eea'">🤝</button><button data-aegis-action="export" style="background:transparent;color:#667eea;border:2px solid #667eea;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;font-weight:bold;transition:all 0.15s ease;" title="Export JSON" aria-label="Export history as JSON" onmouseover="this.style.background='#667eea';this.style.color='white'" onmouseout="this.style.background='transparent';this.style.color='#667eea'">📤</button><button data-aegis-action="export-csv" style="background:transparent;color:#667eea;border:2px solid #667eea;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;font-weight:bold;transition:all 0.15s ease;" title="Export CSV" aria-label="Export history as CSV" onmouseover="this.style.background='#667eea';this.style.color='white'" onmouseout="this.style.background='transparent';this.style.color='#667eea'">📊</button><button data-aegis-action="settings" style="background:transparent;color:#667eea;border:2px solid #667eea;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;font-weight:bold;transition:all 0.15s ease;" title="Settings" aria-label="Open settings" onmouseover="this.style.background='#667eea';this.style.color='white'" onmouseout="this.style.background='transparent';this.style.color='#667eea'">⚙️</button></div></div>`;
    const popupWidth = this.isMaximized ? 'calc(100vw - 40px)' : this.getPopupWidth(); const popupHeight = this.isMaximized ? 'calc(100vh - 40px)' : this.getMaxHeight(); const popupRadius = this.isMaximized ? '0' : '14px';
    this.container.innerHTML = `<div data-aegis-part="full" style="width:${popupWidth};height:${popupHeight};max-height:${popupHeight};background:${popupBg};border-radius:${popupRadius};box-shadow:0 12px 40px rgba(0,0,0,0.4);overflow:hidden;border:1px solid ${popupBorder};display:flex;flex-direction:column;"><div data-aegis-part="header" style="background:${headerColor};color:white;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;cursor:grab;flex-shrink:0;"><div style="display:flex;align-items:center;gap:8px;"><span style="font-size:18px;">${headerIcon}</span><span style="font-size:14px;font-weight:600;">${headerTitle}</span></div><div style="display:flex;gap:10px;align-items:center;"><button data-aegis-action="minimize" style="background:transparent;color:white;border:2px solid white;width:22px;height:22px;border-radius:50%;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;font-weight:bold;transition:all 0.15s ease;" title="Minimize" onmouseover="this.style.background='white';this.style.color='#333'" onmouseout="this.style.background='transparent';this.style.color='white'">−</button><button data-aegis-action="${this.isMaximized ? 'restore' : 'maximize'}" style="background:transparent;color:white;border:2px solid white;width:22px;height:22px;border-radius:50%;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;font-weight:bold;transition:all 0.15s ease;" title="${this.isMaximized ? 'Restore' : 'Maximize'}" onmouseover="this.style.background='white';this.style.color='#333'" onmouseout="this.style.background='transparent';this.style.color='white'">${this.isMaximized ? '−' : '+'}</button></div></div>${body}${footer}</div>`;
    if (this.isMaximized) { this.container.style.cssText = 'position:fixed!important;z-index:2147483647!important;top:20px!important;left:20px!important;right:20px!important;bottom:20px!important;'; } else { this.container.style.cssText = `position:fixed!important;z-index:2147483647!important;right:${this.position.right}px!important;bottom:${this.position.bottom}px!important;left:auto!important;top:auto!important;`; }
    this.attachHandlers();
  }
  attachHandlers() {
    const header = this.container.querySelector('[data-aegis-part="header"]'); if (header) { header.addEventListener('mousedown', (e) => { if (e.target.tagName === 'BUTTON') return; if (e.target.closest('[data-aegis-action]')) return; this.isDragging = true; const rect = this.container.getBoundingClientRect(); this.dragOffset = { x: e.clientX - rect.left, y: e.clientY - rect.top }; this.container.style.cursor = 'grabbing'; e.preventDefault(); }); }
    this.container.querySelectorAll('[data-aegis-action]').forEach(btn => { const action = btn.getAttribute('data-aegis-action'); btn.addEventListener('click', (e) => { e.stopPropagation(); this.handleAction(action); }); });
  }
  onDrag(e) { if (!this.isDragging) return; this.container.style.left = (e.clientX - this.dragOffset.x) + 'px'; this.container.style.top = (e.clientY - this.dragOffset.y) + 'px'; this.container.style.right = 'auto'; this.container.style.bottom = 'auto'; }
  endDrag() { if (this.isDragging) { this.isDragging = false; this.container.style.cursor = ''; const rect = this.container.getBoundingClientRect(); this.position = { right: window.innerWidth - rect.right, bottom: window.innerHeight - rect.bottom }; this.savePosition(); } }
  async handleAction(action) {
    if (action.startsWith('protect-')) {
      trackAnalytics('protected', []);
      const id = parseFloat(action.substring(8)); const alert = this.activeAlerts.find(a => a.id === id);
      if (alert && alert.element && alert.redactions) {
        const result = performRedaction(alert.element, alert.redactions);
        if (result && result.originalText) {
          highlightProtected(alert.element, result.replacements); alert.originalText = result.originalText; alert.replacements = result.replacements;
          alert.isProtected = true;
          const newText = alert.element.tagName === 'INPUT' || alert.element.tagName === 'TEXTAREA' ? alert.element.value : (alert.element.innerText || '');
          if (typeof lastScannedText !== 'undefined') lastScannedText = newText;
        }
      }
      this.render(); return;
    }
    if (action.startsWith('ignore-')) { trackAnalytics('ignored', []); const id = parseFloat(action.substring(7)); const alert = this.activeAlerts.find(a => a.id === id); if (alert && alert.redactions) { alert.redactions.forEach(r => ignoreText(r.text)); if (alert.element) clearHighlights(alert.element); this.dismissAlert(id); } return; }
    if (action.startsWith('undo-')) { const id = parseFloat(action.substring(5)); const alert = this.activeAlerts.find(a => a.id === id); if (alert && alert.element && alert.originalText) { if (alert.element.tagName === 'INPUT' || alert.element.tagName === 'TEXTAREA') alert.element.value = alert.originalText; else if (alert.element.innerText !== undefined) alert.element.innerText = alert.originalText; clearHighlights(alert.element); this.dismissAlert(id); } return; }
    if (action.startsWith('dismiss-')) { this.dismissAlert(parseFloat(action.substring(8))); return; }
    if (action.startsWith('clear-clipboard-')) { try { const a = this.activeAlerts.find(x => x.id === parseFloat(action.substring(16))); const fakes = a && a.replacements && a.replacements.length ? a.replacements.map(r => r.fake).join(', ') : '[CLEARED BY AEGIS]'; await navigator.clipboard.writeText(fakes); this.dismissAlert(parseFloat(action.substring(16))); } catch (e) {} return; }
    if (action.startsWith('pause-')) { const duration = action.substring(6); let ms = 0; if (duration === '5') ms = 5 * 60 * 1000; else if (duration === '60') ms = 60 * 60 * 1000; isPaused = true; if (pauseTimer) clearTimeout(pauseTimer); if (ms > 0) pauseTimer = setTimeout(() => { isPaused = false; if (popup) popup.render(); }, ms); this.render(); return; }
    switch (action) {
      case 'minimize': this.minimize(); break; case 'maximize': this.maximize(); break; case 'restore': this.restore(); break;
      case 'resume': isPaused = false; if (pauseTimer) clearTimeout(pauseTimer); this.render(); break;
      case 'settings': chrome.runtime.sendMessage({ type: 'OPEN_OPTIONS' }); break;
      case 'export': historyStore.exportJSON(); break; case 'export-csv': historyStore.exportCSV(); break;
      case 'trust-site': {
        const host = window.location.hostname;
        if (!settings.trustedSites.includes(host)) {
          settings.trustedSites.push(host);
          chrome.runtime.sendMessage({ type: 'SAVE_TRUSTED_SITES', sites: settings.trustedSites });
          
          // Show confirmation toast
          const toast = document.createElement('div');
          toast.style.cssText = 'position:fixed!important;bottom:100px!important;right:20px!important;background:#28a745!important;color:white!important;padding:12px 20px!important;border-radius:8px!important;font-size:13px!important;font-weight:600!important;z-index:2147483647!important;font-family:-apple-system,sans-serif!important;box-shadow:0 4px 12px rgba(0,0,0,0.3)!important;animation:aegis-fadeIn 0.3s ease-out!important;';
          toast.innerHTML = '🤝 ' + host + ' added to trusted sites';
          document.body.appendChild(toast);
          setTimeout(() => toast.remove(), 3000);
        }
        isWhitelisted = true;
        this.minimize();
        break; }
    }
  }
}
let popup;

function setupPasteListener() { document.addEventListener('paste', async (e) => { try { let pastedText = ''; if (e.clipboardData && e.clipboardData.getData) pastedText = e.clipboardData.getData('text/plain') || ''; if (!pastedText || pastedText.length < 5) return; const { alerts, redactions } = await scanText(pastedText); if (alerts.length > 0) { const markedAlerts = alerts.map(a => ({ ...a, source: 'clipboard:' + a.source })); popup.showAlert(markedAlerts, redactions, null, null, null, 'clipboard'); } } catch (error) {} }, true); }
async function monitorClipboard() { setupPasteListener(); }
let lastScannedText = '', scanDebounce = null, _scanInterval = null;
function getActiveInputElement() { const active = document.activeElement; if (!active) return null; if (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA') return active; if (active.getAttribute('contenteditable') === 'true') return active; const chatInput = document.querySelector('textarea[placeholder], div[contenteditable="true"], textarea'); return chatInput; }
async function performScan() {
  if (isWhitelisted || isPaused) return; const element = getActiveInputElement(); if (!element) return;
  const text = element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' ? (element.value || '') : (element.innerText || '');
  if (text === lastScannedText || text.length < 5) return; if (/\[REDACTED-|user_[a-z0-9]+@example\.com|555-01\d{2}-\d{4}/.test(text)) { lastScannedText = text; return; }
  lastScannedText = text; try { const { alerts, redactions } = await scanText(text, element); if (alerts.length > 0) { highlightSensitive(element, redactions); popup.showAlert(alerts, redactions, element, text, null, 'input'); chrome.runtime.sendMessage({ type: 'UPDATE_STATS', alerts, site: window.location.hostname }); } else { clearHighlights(element); } } catch (err) { console.warn('🛡️ AEGIS: Scan error:', err.message); }
}
function handleInputEvent() { clearTimeout(scanDebounce); scanDebounce = setTimeout(performScan, 300); }
function setupKeyboardShortcuts() { document.addEventListener('keydown', (e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { if (popup && popup.activeAlerts.length > 0) { const latestAlert = popup.activeAlerts[popup.activeAlerts.length - 1]; popup.handleAction(`protect-${latestAlert.id}`); e.preventDefault(); } } if (e.key === 'Escape') { if (popup && popup.activeAlerts.length > 0) { const latestAlert = popup.activeAlerts[popup.activeAlerts.length - 1]; popup.dismissAlert(latestAlert.id); e.preventDefault(); } } }); }
function showOnboarding() { chrome.storage.local.get(['onboarded'], (result) => { if (result.onboarded) return; const tooltip = document.createElement('div'); tooltip.setAttribute('data-aegis', 'onboarding'); tooltip.style.cssText = 'position:fixed!important;bottom:90px!important;right:20px!important;background:white!important;color:#333!important;padding:16px 20px!important;border-radius:12px!important;font-size:13px!important;z-index:2147483647!important;font-family:-apple-system,sans-serif!important;box-shadow:0 8px 24px rgba(0,0,0,0.2)!important;max-width:280px!important;border:2px solid #667eea!important;'; tooltip.innerHTML = `<div style="font-weight:600;margin-bottom:8px;color:#667eea;"> ${t('welcome')}</div><div style="line-height:1.5;margin-bottom:12px;">${t('welcomeText')}</div><div style="font-size:11px;color:#999;margin-bottom:12px;"> ${t('quickProtect')}</div><button id="aegis-dismiss-onboarding" style="width:100%;padding:8px;background:#667eea;color:white;border:none;border-radius:6px;cursor:pointer;font-weight:600;font-size:12px;">${t('gotIt')}</button>`; document.body.appendChild(tooltip); tooltip.addEventListener('click', (e) => e.stopPropagation()); document.getElementById('aegis-dismiss-onboarding').addEventListener('click', (e) => { e.stopPropagation(); e.preventDefault(); tooltip.remove(); chrome.storage.local.set({ onboarded: true }); }); }); }

let submissionGuardEnabled = true, pendingSubmission = null, hasUserInteracted = false;
document.addEventListener('mousedown', () => { hasUserInteracted = true; }, { once: true }); document.addEventListener('keydown', () => { hasUserInteracted = true; }, { once: true });
function setupSubmissionGuard() {
  document.addEventListener('click', (e) => { const target = e.target; if (target.id === 'aegis-modal-cancel' || target.closest('#aegis-modal-cancel')) { e.preventDefault(); e.stopPropagation(); const modal = document.querySelector('[data-aegis="submission-modal"]'); if (modal) modal.remove(); pendingSubmission = null; return; } if (target.id === 'aegis-modal-confirm' || target.closest('#aegis-modal-confirm')) { e.preventDefault(); e.stopPropagation(); const modal = document.querySelector('[data-aegis="submission-modal"]'); if (modal) modal.remove(); if (pendingSubmission) { submissionGuardEnabled = false; setTimeout(() => { if (pendingSubmission.type === 'button') pendingSubmission.element.click(); else if (pendingSubmission.type === 'enter') { const evt = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: false, bubbles: true, cancelable: true }); pendingSubmission.element.dispatchEvent(evt); } else if (pendingSubmission.type === 'form') pendingSubmission.element.submit(); pendingSubmission = null; setTimeout(() => { submissionGuardEnabled = true; }, 1000); }, 100); } return; } if (target.getAttribute('data-aegis') === 'submission-modal') { target.remove(); pendingSubmission = null; return; } }, true);
  document.addEventListener('click', (e) => { if (!submissionGuardEnabled || !hasUserInteracted) return; if (e.target.closest('[data-aegis]')) return; const target = e.target; const button = target.closest('button'); if (button && button.closest('[data-aegis="unified-popup"]')) return; if (target.id === 'aegis-modal-cancel' || target.id === 'aegis-modal-confirm') return; const isSendButton = button && (button.getAttribute('data-testid') === 'send-button' || button.type === 'submit' || /send|submit/i.test(button.textContent || button.getAttribute('aria-label') || '')); if (isSendButton && hasUnprotectedPII(button)) { e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); pendingSubmission = { type: 'button', element: button }; showSubmissionConfirmation(); } }, true);
  document.addEventListener('keydown', (e) => { if (!submissionGuardEnabled || !hasUserInteracted) return; if ((e.key === 'Enter' && !e.shiftKey) || ((e.metaKey || e.ctrlKey) && e.key === 'Enter')) { const target = e.target; if ((target.tagName === 'TEXTAREA' || target.tagName === 'INPUT' || target.getAttribute('contenteditable') === 'true') && hasUnprotectedPII(target)) { e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); pendingSubmission = { type: 'enter', element: target }; showSubmissionConfirmation(); } } }, true);
  document.addEventListener('submit', (e) => { if (!submissionGuardEnabled || !hasUserInteracted) return; if (hasUnprotectedPII()) { e.preventDefault(); e.stopPropagation(); pendingSubmission = { type: 'form', element: e.target }; showSubmissionConfirmation(); } }, true);
  console.log('️ AEGIS: ✅ Universal submission guard active');
}
function hasUnprotectedPII(target) {
  if (!popup || !popup.activeAlerts) return false;
  const unscoped = popup.activeAlerts.filter(a => !a.isProtected && a.element);
  if (!unscoped.length) return false;
  if (!target) return true;
  // An alert may only block an interaction it shares a composer with: walk
  // up from the clicked/typed element a few levels — if an alert's element
  // is found on that chain (or contains it), they belong to the same
  // editing surface. This handles chat UIs where the send button is a
  // SIBLING of the contenteditable editor, not inside it.
  let node = target;
  for (let depth = 0; node && depth < 8; depth++, node = node.parentElement) {
    if (unscoped.some(a => a.element === node || (a.element && a.element.contains(node)))) return true;
  }
  return false;
}
function showSubmissionConfirmation() {
  document.querySelectorAll('[data-aegis="submission-modal"]').forEach(el => el.remove());
  const modalBg = tc('white', '#1e1e1e'), modalText = tc('#333', '#e0e0e0'), modalBorder = tc('#e9ecef', '#404040'), secondaryText = tc('#666', '#999');
  const modal = document.createElement('div'); modal.setAttribute('data-aegis', 'submission-modal'); modal.style.cssText = 'position:fixed!important;top:0!important;left:0!important;width:100vw!important;height:100vh!important;background:rgba(0,0,0,0.7)!important;z-index:999999999!important;display:flex!important;align-items:center!important;justify-content:center!important;';
  const modalContent = document.createElement('div'); modalContent.style.cssText = `background:${modalBg};color:${modalText};padding:32px;border-radius:16px;max-width:480px;box-shadow:0 20px 60px rgba(0,0,0,0.5);border:1px solid ${modalBorder};text-align:center;`;
  modalContent.innerHTML = `<div style="font-size:48px;margin-bottom:16px;">⚠️</div><div style="font-size:20px;font-weight:700;margin-bottom:12px;">${t('sensitiveDetected')}</div><div style="font-size:14px;line-height:1.6;margin-bottom:24px;color:${secondaryText};">You're about to send information that contains PII.<br><strong>${t('proceed')}</strong></div><div style="display:flex;gap:12px;justify-content:center;"><button id="aegis-modal-cancel" style="padding:12px 24px;background:${tc('#f8f9fa','#2d2d2d')};color:${modalText};border:1px solid ${modalBorder};border-radius:8px;cursor:pointer;font-weight:600;font-size:14px;min-width:100px;" aria-label="Cancel submission">${t('cancel')}</button><button id="aegis-modal-confirm" style="padding:12px 24px;background:#ff4444;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;font-size:14px;min-width:100px;" aria-label="Send anyway">${t('sendAnyway')}</button></div><button id="aegis-modal-trust-sub" style="margin-top:16px;background:transparent;border:none;color:#667eea;cursor:pointer;font-size:12px;text-decoration:underline;display:flex;align-items:center;justify-content:center;gap:4px;width:100%;">🤝 Trust this site</button><div style="margin-top:8px;font-size:11px;color:${secondaryText};text-align:center;">💡 ${t('protectTip')}</div>`;
  modal.appendChild(modalContent); document.body.appendChild(modal);
  const cancelBtn = document.getElementById('aegis-modal-cancel'); const confirmBtn = document.getElementById('aegis-modal-confirm');
  cancelBtn.onclick = function(e) { e.preventDefault(); e.stopPropagation(); modal.remove(); pendingSubmission = null; return false; };
  confirmBtn.onclick = function(e) { e.preventDefault(); e.stopPropagation(); modal.remove(); submissionGuardEnabled = false; if (pendingSubmission) { if (pendingSubmission.type === 'button') setTimeout(() => pendingSubmission.element.click(), 100); else if (pendingSubmission.type === 'enter') setTimeout(() => { const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: false, bubbles: true }); pendingSubmission.element.dispatchEvent(enterEvent); }, 100); else if (pendingSubmission.type === 'form') setTimeout(() => pendingSubmission.element.submit(), 100); } pendingSubmission = null; setTimeout(() => { submissionGuardEnabled = true; }, 1000); return false; };
  const trustSubBtn = document.getElementById('aegis-modal-trust-sub'); if (trustSubBtn) { trustSubBtn.onclick = function(e) { e.preventDefault(); e.stopPropagation(); const host = window.location.hostname; if (!settings.trustedSites.includes(host)) settings.trustedSites.push(host); chrome.runtime.sendMessage({ type: 'SAVE_TRUSTED_SITES', sites: settings.trustedSites }); isWhitelisted = true; modal.remove(); if (popup) popup.minimize(); }; }
  modal.onclick = function(e) { if (e.target === modal) { modal.remove(); pendingSubmission = null; } };
}

let attachmentGuardEnabled = true;
const SENSITIVE_FILE_KEYWORDS = ['ssn', 'social security', 'tax', 'w2', '1099', 'passport', 'license', 'dl', 'drivers', 'bank', 'credit card', 'debit card', 'cvv', 'pin', 'password', 'secret', 'medical', 'health', 'diagnosis', 'prescription', 'insurance', 'claim', 'salary', 'payroll', 'income', 'financial', 'statement', 'contract', 'confidential', 'private', 'personal', 'id', 'identification', 'residence', 'permit', 'visa', 'immigration', 'green card', 'birth certificate', 'marriage certificate', 'divorce', 'utility bill', 'lease', 'rental', 'address proof'];
function setupAttachmentGuard() {
  const OriginalFile = window.File; window.File = function(fileBits, fileName, options) { const file = new OriginalFile(fileBits, fileName, options); checkFileForUpload(file, 'File constructor'); return file; }; window.File.prototype = OriginalFile.prototype;
  const OriginalFormData = window.FormData; const originalAppend = OriginalFormData.prototype.append; OriginalFormData.prototype.append = function(name, value, filename) { if (value instanceof File || value instanceof Blob) checkFileForUpload(value, 'FormData.append', filename); return originalAppend.apply(this, arguments); };
  const OriginalXHR = window.XMLHttpRequest; const originalSend = OriginalXHR.prototype.send; OriginalXHR.prototype.send = function(body) { if (body && (body instanceof File || body instanceof Blob || body instanceof FormData)) { if (body instanceof FormData) { body.forEach((value, _key) => { if (value instanceof File) checkFileForUpload(value, 'XHR FormData', value.name); }); } else { checkFileForUpload(body, 'XHR send', body.name); } } return originalSend.apply(this, arguments); };
  const originalFetch = window.fetch; window.fetch = function(input, init) { if (init && init.body) { if (init.body instanceof FormData) { init.body.forEach((value, _key) => { if (value instanceof File) checkFileForUpload(value, 'fetch FormData', value.name); }); } else if (init.body instanceof File || init.body instanceof Blob) { checkFileForUpload(init.body, 'fetch body', init.body.name); } } return originalFetch.apply(this, arguments); };
  document.addEventListener('change', (e) => { const target = e.target; if (target.tagName === 'INPUT' && target.type === 'file' && target.files) { Array.from(target.files).forEach(file => checkFileForUpload(file, 'file input')); } }, true);
  document.addEventListener('drop', (e) => { if (e.dataTransfer?.files) { Array.from(e.dataTransfer.files).forEach(file => checkFileForUpload(file, 'drag drop')); } }, true);
  console.log('️ AEGIS: ✅ Multi-layer attachment guard active');
}
function checkFileForUpload(file, source, overrideName) {
  if (!attachmentGuardEnabled) return; if (!file || !(file instanceof File || file instanceof Blob)) return;
  const fileName = overrideName || file.name || 'unknown'; const fileSize = (file.size / 1024 / 1024).toFixed(2); const fileType = file.type || 'unknown';
  console.log(`🛡️ AEGIS: File upload via ${source}: ${fileName} | ${fileSize}MB | ${fileType}`);
  const fileNameLower = fileName.toLowerCase(); const hasSensitiveName = SENSITIVE_FILE_KEYWORDS.some(keyword => fileNameLower.includes(keyword));
  const isImage = fileType.startsWith('image/') || ['.jpg','.jpeg','.png','.tiff','.tif','.bmp','.webp','.gif'].some(ext => fileNameLower.endsWith(ext));
  if (hasSensitiveName) { showAttachmentWarning('️ ' + t('sensitiveFilename'), `The file "<strong>${fileName}</strong>" ${t('containsKeywords')}`, fileName, fileSize, fileType); }
  else if (isImage) { if (window.aegisSkipImageWarnings) return; showAttachmentWarning('️ ' + t('imageUpload'), `${t('aiCanRead')} Does "<strong>${fileName}</strong>" contain IDs or sensitive info?`, fileName, fileSize, fileType); }
}
function showAttachmentWarning(title, message, fileName, fileSize, fileType) {
  document.querySelectorAll('[data-aegis="attachment-modal"]').forEach(el => el.remove());
  const modalBg = tc('white', '#1e1e1e'), modalText = tc('#333', '#e0e0e0'), modalBorder = tc('#e9ecef', '#404040'), secondaryText = tc('#666', '#999');
  const modal = document.createElement('div'); modal.setAttribute('data-aegis', 'attachment-modal'); modal.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.7);z-index:999999998;display:flex;align-items:center;justify-content:center;';
  modal.innerHTML = `<div style="background:${modalBg};color:${modalText};padding:32px;border-radius:16px;max-width:500px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.5);border:1px solid ${modalBorder};"><div style="font-size:48px;margin-bottom:16px;text-align:center;"></div><div style="font-size:20px;font-weight:700;margin-bottom:12px;text-align:center;">${title}</div><div style="font-size:14px;line-height:1.6;margin-bottom:20px;color:${secondaryText};text-align:center;">${message}</div><div style="background:${tc('#f8f9fa','#2d2d2d')};padding:12px;border-radius:8px;margin-bottom:20px;"><div style="font-weight:600;color:${modalText};">${fileName}</div><div style="font-size:12px;color:${secondaryText};">${fileSize} MB • ${fileType}</div></div><div style="background:${tc('#ffebee','#4a1f1f')};border-left:4px solid #ff4444;padding:12px;border-radius:6px;margin-bottom:24px;font-size:13px;"><strong>⚠️ ${t('privacyRisk')}</strong></div><div style="display:flex;gap:12px;justify-content:center;"><button id="aegis-attach-cancel" style="padding:12px 24px;background:${tc('#f8f9fa','#2d2d2d')};color:${modalText};border:1px solid ${modalBorder};border-radius:8px;cursor:pointer;font-weight:600;font-size:14px;min-width:140px;" aria-label="Cancel upload">${t('cancelUpload')}</button><button id="aegis-attach-confirm" style="padding:12px 24px;background:#28a745;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;font-size:14px;min-width:140px;" aria-label="Upload anyway">${t('uploadAnyway')}</button></div><button id="aegis-modal-trust-attach" style="margin-top:16px;background:transparent;border:none;color:#667eea;cursor:pointer;font-size:12px;text-decoration:underline;display:flex;align-items:center;justify-content:center;gap:4px;width:100%;">🤝 Trust this site</button><div style="margin-top:16px;display:flex;align-items:center;justify-content:center;gap:8px;font-size:12px;color:${secondaryText};"><input type="checkbox" id="aegis-dont-ask-again" style="cursor:pointer;"><label for="aegis-dont-ask-again" style="cursor:pointer;">Don't warn me about images for this session</label></div></div>`;
  document.body.appendChild(modal);
  const cancelBtn = document.getElementById('aegis-attach-cancel'); const confirmBtn = document.getElementById('aegis-attach-confirm');
  cancelBtn.onclick = function(e) { e.preventDefault(); e.stopPropagation(); modal.remove(); attachmentGuardEnabled = false; setTimeout(() => { attachmentGuardEnabled = true; }, 1000); };
  confirmBtn.onclick = function(e) { e.preventDefault(); e.stopPropagation(); const dontAsk = document.getElementById('aegis-dont-ask-again').checked; if (dontAsk) { window.aegisSkipImageWarnings = true; } modal.remove(); attachmentGuardEnabled = false; setTimeout(() => { attachmentGuardEnabled = true; }, 1000); };
  const trustAttachBtn = document.getElementById('aegis-modal-trust-attach'); if (trustAttachBtn) { trustAttachBtn.onclick = function(e) { e.preventDefault(); e.stopPropagation(); const host = window.location.hostname; if (!settings.trustedSites.includes(host)) settings.trustedSites.push(host); chrome.runtime.sendMessage({ type: 'SAVE_TRUSTED_SITES', sites: settings.trustedSites }); isWhitelisted = true; modal.remove(); if (popup) popup.minimize(); }; }
  modal.onclick = function(e) { if (e.target === modal) { modal.remove(); attachmentGuardEnabled = false; setTimeout(() => { attachmentGuardEnabled = true; }, 1000); } };
}

async function init() {
  console.log('🛡️ AEGIS: Complete Build starting...');
  await historyStore.load(); await loadSettings(); await loadTheme(); await refreshVault(); plantAgentCanary();
  chrome.storage.sync.get(['manualLanguage'], (result) => {
    const manualLang = result.manualLanguage || 'auto';
    if (manualLang !== 'auto' && TRANSLATIONS[manualLang]) { currentLang = manualLang; }
    else { const browserLang = navigator.language.split('-')[0].toLowerCase(); if (TRANSLATIONS[browserLang]) currentLang = browserLang; if (navigator.language.toLowerCase().startsWith('zh')) currentLang = 'zh'; }
    console.log('🛡️ AEGIS: Language =', currentLang, '| Theme =', currentTheme);
    if (popup) popup.render();
  });
  popup = new AEGISPopup();
    // Quiet guardian: the bubble only shows when there is something to say
    const originalRender = popup.render.bind(popup);
    popup.render = function () { originalRender(); updateBubbleVisibility(); };
  document.addEventListener('input', handleInputEvent, true); document.addEventListener('keyup', handleInputEvent, true);
  document.addEventListener('focusin', (e) => { const el = e.target; if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.getAttribute('contenteditable') === 'true')) handleInputEvent(); }, true);
  // Page passes are CHANGE-DRIVEN (verified external audit): a 2s full-page
  // poll burned CPU on complex pages. The MutationObserver runs the page
  // passes when content actually changes (throttled to 4s, debounced 800ms);
  // a 10s interval remains as a safety net. Typing is covered by the input/
  // keyup listeners above (300ms debounce).
  let pagePassPending = false, lastPagePass = 0;
  function runPagePasses() {
    if (document.hidden) return;
    restoreVaultInResponses(); sentinelPass(); webmailPass(); injectionPass(); honeytokenPass();
    try { chrome.storage.local.set({ aegis_last_scan: { nodes: (sentinelAnalyzed.size + injectionSeen.size), at: Date.now() } }); } catch (e) {}
    lastPagePass = Date.now();
  }
  const pageObserver = new MutationObserver((mutations) => {
    if (isWhitelisted || isPaused || pagePassPending) return;
    let pageChanged = false;
    for (const m of mutations) {
      if ((m.type === 'childList' && m.addedNodes.length) || m.type === 'characterData') { pageChanged = true; break; }
    }
    if (!pageChanged || Date.now() - lastPagePass < 4000) return;
    pagePassPending = true;
    setTimeout(() => { pagePassPending = false; runPagePasses(); }, 800);
  });
  pageObserver.observe(document.body, { childList: true, subtree: true, characterData: true });
  _scanInterval = setInterval(() => { if (!pagePassPending && Date.now() - lastPagePass >= 10000) runPagePasses(); }, 10000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && Date.now() - lastPagePass >= 4000) runPagePasses(); });
  document.addEventListener('mousemove', (e) => popup.onDrag(e)); document.addEventListener('mouseup', () => popup.endDrag());
  setupKeyboardShortcuts(); setupSubmissionGuard(); setupAttachmentGuard();
  if (isWhitelisted) { popup.minimize(); return; }
  const hasOllama = await checkOllama(); console.log('🛡️ AEGIS: Ollama =', hasOllama, '| model =', ollamaModel || 'none');
  if (settings.monitorClipboard) monitorClipboard();
  showOnboarding();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})(); // End IIFE wrapper
