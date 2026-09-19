console.log('🛡️ AEGIS v5.5: Complete Final Build Loaded');

const TRANSLATIONS = {
  en: { sensitiveDetected: "Sensitive Data Detected", proceed: "Are you sure you want to proceed?", cancel: "Cancel", sendAnyway: "Send Anyway", protectTip: "Tip: Click Protect in the AEGIS popup to replace sensitive data first", imageUpload: "Image Upload Detected", aiCanRead: "AI can read text and faces in images. Does this file contain IDs or sensitive info?", privacyRisk: "Privacy Risk: Once uploaded, you cannot control who accesses this file.", cancelUpload: "Cancel Upload", uploadAnyway: "Upload Anyway", sensitiveFilename: "Sensitive Filename", containsKeywords: "contains sensitive keywords.", welcome: "Welcome to AEGIS!", welcomeText: "I'll protect your sensitive data as you type.", quickProtect: "Tip: Press ⌘+Enter to quick-protect", gotIt: "Got it!" },
  es: { sensitiveDetected: "Datos Sensibles Detectados", proceed: "¿Estás seguro?", cancel: "Cancelar", sendAnyway: "Enviar", protectTip: "Consejo: Haz clic en Proteger", imageUpload: "Imagen Detectada", aiCanRead: "La IA puede leer texto.", privacyRisk: "Riesgo de Privacidad.", cancelUpload: "Cancelar", uploadAnyway: "Subir", sensitiveFilename: "Nombre Sensible", containsKeywords: "contiene palabras clave.", welcome: "¡Bienvenido!", welcomeText: "Protegeré tus datos.", quickProtect: "Presiona ⌘+Enter", gotIt: "¡Entendido!" },
  fr: { sensitiveDetected: "Données Sensibles", proceed: "Êtes-vous sûr?", cancel: "Annuler", sendAnyway: "Envoyer", protectTip: "Astuce: Cliquez sur Protéger", imageUpload: "Image Détectée", aiCanRead: "L'IA peut lire le texte.", privacyRisk: "Risque de Confidentialité.", cancelUpload: "Annuler", uploadAnyway: "Télécharger", sensitiveFilename: "Nom Sensible", containsKeywords: "contient des mots-clés.", welcome: "Bienvenue!", welcomeText: "Je protège vos données.", quickProtect: "Appuyez sur ⌘+Entrée", gotIt: "Compris!" },
  de: { sensitiveDetected: "Sensible Daten", proceed: "Sind Sie sicher?", cancel: "Abbrechen", sendAnyway: "Senden", protectTip: "Tipp: Klicken Sie auf Schützen", imageUpload: "Bild Erkannt", aiCanRead: "KI kann Text lesen.", privacyRisk: "Datenschutzrisiko.", cancelUpload: "Abbrechen", uploadAnyway: "Hochladen", sensitiveFilename: "Sensibler Name", containsKeywords: "enthält Schlüsselwörter.", welcome: "Willkommen!", welcomeText: "Ich schütze Ihre Daten.", quickProtect: "Drücken Sie ⌘+Enter", gotIt: "Verstanden!" },
  pt: { sensitiveDetected: "Dados Sensíveis", proceed: "Tem certeza?", cancel: "Cancelar", sendAnyway: "Enviar", protectTip: "Dica: Clique em Proteger", imageUpload: "Imagem Detectada", aiCanRead: "A IA pode ler texto.", privacyRisk: "Risco de Privacidade.", cancelUpload: "Cancelar", uploadAnyway: "Enviar", sensitiveFilename: "Nome Sensível", containsKeywords: "contém palavras-chave.", welcome: "Bem-vindo!", welcomeText: "Protegerei seus dados.", quickProtect: "Pressione ⌘+Enter", gotIt: "Entendi!" },
  it: { sensitiveDetected: "Dati Sensibili", proceed: "Sei sicuro?", cancel: "Annulla", sendAnyway: "Invia", protectTip: "Suggerimento: Clicca su Proteggi", imageUpload: "Immagine Rilevata", aiCanRead: "L'IA può leggere testo.", privacyRisk: "Rischio Privacy.", cancelUpload: "Annulla", uploadAnyway: "Carica", sensitiveFilename: "Nome Sensibile", containsKeywords: "contiene parole chiave.", welcome: "Benvenuto!", welcomeText: "Proteggerò i tuoi dati.", quickProtect: "Premi ⌘+Invio", gotIt: "Capito!" },
  ru: { sensitiveDetected: "Конфиденциальные данные", proceed: "Вы уверены?", cancel: "Отмена", sendAnyway: "Отправить", protectTip: "Совет: Нажмите 'Защитить'", imageUpload: "Обнаружено изображение", aiCanRead: "ИИ может читать текст.", privacyRisk: "Риск конфиденциальности.", cancelUpload: "Отмена", uploadAnyway: "Загрузить", sensitiveFilename: "Конфиденциальное имя", containsKeywords: "содержит ключевые слова.", welcome: "Добро пожаловать!", welcomeText: "Я защищу ваши данные.", quickProtect: "Нажмите ⌘+Enter", gotIt: "Понятно!" },
  zh: { sensitiveDetected: "检测到敏感数据", proceed: "您确定要继续吗？", cancel: "取消", sendAnyway: "仍然发送", protectTip: "提示：点击保护", imageUpload: "检测到图像", aiCanRead: "人工智能可以读取文本。", privacyRisk: "隐私风险。", cancelUpload: "取消上传", uploadAnyway: "仍然上传", sensitiveFilename: "敏感文件名", containsKeywords: "包含敏感关键字。", welcome: "欢迎使用 AEGIS！", welcomeText: "我会保护您的数据。", quickProtect: "按 ⌘+Enter", gotIt: "明白了！" },
  ar: { sensitiveDetected: "بيانات حساسة", proceed: "هل أنت متأكد؟", cancel: "إلغاء", sendAnyway: "إرسال", protectTip: "نصيحة: انقر فوق حماية", imageUpload: "تم اكتشاف صورة", aiCanRead: "يمكن للذكاء الاصطناعي القراءة.", privacyRisk: "مخاطر الخصوصية.", cancelUpload: "إلغاء", uploadAnyway: "تحميل", sensitiveFilename: "اسم حساس", containsKeywords: "يحتوي على كلمات.", welcome: "مرحبًا بك!", welcomeText: "سأحمي بياناتك.", quickProtect: "اضغط ⌘+Enter", gotIt: "فهمت!" }
};
let currentLang = 'en';
function t(key) { return TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS.en[key]; }

const FAKE_DATA = {
  names: ['James Wilson', 'Sarah Chen', 'Michael Brown', 'Emily Davis', 'Robert Taylor', 'Lisa Anderson', 'Carlos García', 'María Rodríguez', 'Jean Dupont', 'Marie Laurent', 'Hans Müller', 'Anna Schmidt', 'João Silva', 'Ana Costa', 'Marco Rossi', 'Giulia Bianchi', 'Ivan Ivanov', 'Maria Petrova', 'Wei Zhang', 'Li Wang', 'Mohammed Al-Sayed', 'Fatima Hassan', 'Yuki Tanaka', 'Kenji Sato', 'Olga Sokolova', 'Dmitry Volkov', 'Ahmed Ali', 'Layla Mansour', 'Chen Wei', 'Liu Yang', 'Sofia Popov', 'Andrei Novak', 'Elena Rossi', 'Lucas Silva', 'Isabella Costa', 'Noah Williams', 'Emma Johnson', 'David Kim', 'Priya Patel', 'Omar Hassan'],
  emails: ['user_8f7a2@example.com', 'contact_3k9x1@sample.net', 'info_5m2p4@test.org', 'hello_7j6n8@demo.io', 'admin_9b2c3@mock.com', 'support_1a4d5@fake.net', 'dev_6e8f9@test.io', 'team_2x5y7@sample.org', 'hello_4k8m1@demo.com', 'info_9p3q2@mock.net', 'contact_7h3j9@example.org', 'user_2m5n8@sample.io', 'mail_3b7c1@test.com', 'dev_8x2y4@mock.io', 'info_5k9m2@sample.net'],
  phones: ['555-0147-8234', '555-0183-9472', '555-0129-6358', '555-0164-2791', '555-0192-3847', '555-0156-7293', '555-0138-4920', '555-0174-8392', '555-0111-2233', '555-0144-5566', '555-0177-8899', '555-0100-1122'],
  ssns: ['073-64-2918', '557-16-2417', '219-48-7362', '482-91-5634', '128-39-4756', '647-28-1935', '935-71-2846', '384-62-9175', '519-83-4726', '274-91-5836', '836-42-1957', '691-53-2847'],
  creditCards: ['6011-1111-1111-1117', '4916-3389-0472-1158', '5425-2334-8876-9921', '4532-8871-2934-1156', '5193-7742-9918-3345', '6011-4429-8817-2234', '4916-1122-3344-5566', '5425-7788-9900-1122'],
  ips: ['10.20.30.40', '192.168.99.99', '172.16.0.1', '10.0.0.99', '192.0.2.1', '198.51.100.1', '203.0.113.1'],
  medicals: ['seasonal allergies', 'mild asthma', 'common cold', 'myopia', 'hypertension', 'migraines', 'vitamin D deficiency', 'mild anxiety', 'seasonal depression'],
  meds: ['famotidine', 'loratadine', 'ibuprofen', 'acetaminophen', 'omeprazole', 'cetirizine', 'amoxicillin', 'metformin', 'lisinopril'],
  companies: ['Acme Corp', 'Global Solutions Inc', 'Tech Innovations LLC', 'Prime Services Ltd', 'Nexus Industries', 'Apex Dynamics', 'Stellar Systems', 'Quantum Labs'],
  salaries: ['$75,000', '€60,000', '£55,000', '₽150,000', '¥50,000', 'ر.س 20,000', 'R$5,000', '$85,000', '€70,000', '¥80,000', 'R$8,000'],
  medicalRecords: ['MRN 84739201', 'MRN 92837465', 'MRN 10293847', 'MRN 56473829'],
  passports: ['A93847562', 'B10293847', 'C83746592', 'D92837465'],
  driverLicenses: ['DL-8374-9201', 'DL-1029-3847', 'DL-5647-3829', 'DL-9283-7465'],
  bankAccounts: ['9384756201', '1029384756', '8374659201', '9283746501'],
  datesOfBirth: ['03/14/1988', '11/22/1992', '07/08/1985', '09/30/1995']
};

function getFakeData(type, originalText) {
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const t = originalText ? originalText.toLowerCase() : '';
  switch (type) {
    case 'NAME': return pick(FAKE_DATA.names);
    case 'Email': return pick(FAKE_DATA.emails);
    case 'Phone': return pick(FAKE_DATA.phones);
    case 'SSN': return pick(FAKE_DATA.ssns);
    case 'Credit Card': return pick(FAKE_DATA.creditCards);
    case 'IP Address': return pick(FAKE_DATA.ips);
    case 'FINANCIAL':
      if (t.includes('₽') || t.includes('рублей') || t.includes('зарплата')) return pick(['₽150,000', '₽200,000']);
      if (t.includes('¥') || t.includes('元') || t.includes('工资')) return pick(['¥50,000', '¥80,000']);
      if (t.includes('ر.س') || t.includes('ريال') || t.includes('راتبي')) return pick(['ر.س 20,000', '$20,000']);
      if (t.includes('r$') || t.includes('reais') || t.includes('salário')) return pick(['R$5,000', 'R$8,000']);
      if (t.includes('£') || t.includes('libras')) return pick(['£55,000', '£65,000']);
      if (t.includes('€') || t.includes('euro') || t.includes('euros') || t.includes('gagne') || t.includes('guadagno') || t.includes('verdiene') || t.includes('stipendio')) return pick(['€60,000', '€75,000']);
      if (t.includes('$') || t.includes('salary') || t.includes('salario') || t.includes('gano') || t.includes('earn')) return pick(['$75,000', '$85,000']);
      return '[REDACTED-FINANCIAL]';
    case 'MEDICAL': 
      const conditions = ['diagnosed', 'diabetes', 'cancer', 'tengo', 'sufro', 'leide', 'soffro', 'ansiedad', 'asthma', 'migraine', 'hypertension', 'depression', 'depresión', 'dépression', 'depressa', 'диабет', '抑郁', 'اكتئاب'];
      if (conditions.some(c => t.includes(c))) return pick(FAKE_DATA.medicals);
      return pick(FAKE_DATA.meds);
    case 'EMPLOYMENT': 
      const companyKeywords = ['corp', 'inc', 'ltd', 'llc', 'company', 'solutions', 'industries'];
      if (companyKeywords.some(k => t.includes(k))) return pick(FAKE_DATA.companies);
      return '[REDACTED-EMPLOYMENT]';
    case 'Medical Record': return pick(FAKE_DATA.medicalRecords);
    case 'Passport': return pick(FAKE_DATA.passports);
    case 'Driver License': return pick(FAKE_DATA.driverLicenses);
    case 'Bank Account': return pick(FAKE_DATA.bankAccounts);
    case 'Date of Birth': return pick(FAKE_DATA.datesOfBirth);
    default: return '[REDACTED-' + type + ']';
  }
}

const PII_PATTERNS = {
  'SSN': /\b\d{3}-\d{2}-\d{4}\b/g,
  'Credit Card': /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
  'Email': /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  'Phone': /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
  'IP Address': /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
  'Date of Birth': /\b(?:born on|DOB:|birthday:?|Date of Birth:?)\s*(?:is\s+)?\:?\s*(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})\b/gi,
  'Passport': /\b(?:passport|passport\s*#?)\s*\:?\s*([A-Z]{1,2}\d{6,9})\b/gi,
  'Bank Account': /\b(?:bank\s+account|account|acct)\s+(?:is\s+)?\:?\s*(\d{8,17})\b/gi,
  'Driver License': /\b(?:driver\s+license|driver'?s?\s+license|license|DL)\s*#?\s*\:?\s*([A-Z]?\d{2,4}[-\s]?\d{2,4}[-\s]?\d{2,4})\b/gi,
  'Medical Record': /\b(?:MRN|medical\s*record)\s*-?\s*#?\:?\s*(?:MRN\s+)?(\d{6,10})\b/gi
};

const CONTEXT_PATTERNS = [
  { type: 'MEDICAL', pattern: /(?:I have|I've been diagnosed with|I suffer from|I was diagnosed with|my diagnosis is|tengo|me diagnosticaron|sufro de|fui diagnosticado|j'ai|on m'a diagnostiqué|je souffre de|ich habe|mir wurde diagnostiziert|leide unter|eu tenho|fui diagnosticado|sofro de|mi è stato diagnosticato|soffro di|у меня|мне поставили диагноз|я страдаю от|我被诊断出|我患有|我有|لدي|تم تشخيصي بـ|أعاني من)\s+([a-zA-ZÀ-ÿа-яА-Я\u4e00-\u9fa5\u0600-\u06FF\s-]{2,50})/gi },
  { type: 'MEDICAL', pattern: /\b(?:pregnant|pregnancy|miscarriage|fertility|IVF|chemotherapy|radiation|dialysis|embarazada|embarazo|enceinte|schwanger|grávida|incinta|беременная|怀孕|حامل)\b/gi },
  { type: 'MEDICAL', pattern: /\b(?:diabetes|cancer|HIV|AIDS|hepatitis|tuberculosis|depression|anxiety|bipolar|schizophrenia|PTSD|addiction|alcoholism|opioid|diabète|diabete|depresión|dépression|depressa|депрессия|抑郁|اكتئاب|ansiedad|asthma|migraine|hypertension)\b/gi },
  { type: 'MEDICAL', pattern: /\b(?:I am taking|I'm taking|I take|taking my|I am on|I'm on|on my|using my|estoy tomando|tomo mi|je prends mon|ich nehme mein|eu tomo meu|prendo il mio|я принимаю|我在吃|أنا آخذ)\s+(?:metformin|insulin|lisinopril|adderall|xanax|oxycodone|vicodin|percocet|ambien|prozac|zoloft|lexapro|cetirizine|loratadine|ibuprofen|acetaminophen|aspirin|naproxen|omeprazole|atorvastatin|amlodipine|gabapentin|hydrocodone|tramadol|morphine|fentanyl|methadone|suboxone|klonopin|valium|ativan|restoril|sonata|lunesta|metformina|ibuprofeno|paracetamol|aspirina)\b/gi },
  { type: 'FINANCIAL', pattern: /(?:my salary is|I earn|I make|annual income|yearly income|mi salario es|gano|mi sueldo es|mon salaire est|je gagne|mein gehalt ist|ich verdiene|meu salário é|ganho|il mio stipendio è|guadagno|моя зарплата|я зарабатываю|我的工资是|我赚|我的年薪|راتبي هو|أكسب|دخلي السنوي)\s*[\$€£₽¥₹ر.سR$]?\s*\d+(?:[.,]\d+)*/gi },
  { type: 'FINANCIAL', pattern: /\b(?:filed for bankruptcy|declared bankruptcy|foreclosure|evicted|defaulted on|debt collector|credit score is|bad credit)\b/gi },
  { type: 'LEGAL', pattern: /\b(?:my lawyer|my attorney|suing|lawsuit|arrested|charged with|convicted|parole|probation|court case|divorce proceedings)\b/gi },
  { type: 'CREDENTIALS', pattern: /\b(?:my password is|password:?\s*\S+|login:?\s*\S+|secret key|API key|private key)\b/gi },
  { type: 'PERSONAL', pattern: /\b(?:getting divorced|cheating|affair|domestic violence|abuse|custody battle)\b/gi },
  { type: 'EMPLOYMENT', pattern: /\b(?:I work at|I work for|employed at|employed by|my employer is|my boss)\s+([A-Z][a-zA-Z\s-]+?)(?:\.|,|and|but|as|et|und|。|，|و|أو|$)/g },
  { type: 'EMPLOYMENT', pattern: /\b(?:fired|laid off|let go|terminated|quit my job|resigned)\b/gi }
];

function parseCustomPatterns(patternsString) {
  if (!patternsString || patternsString.trim() === '') return [];
  const lines = patternsString.split('\n').filter(l => l.trim() !== '');
  const parsed = [];
  lines.forEach(line => {
    const match = line.match(/^([A-Z_]+):\/(.+)\/([gim]*)$/);
    if (match) {
      const [, type, pattern, flags] = match;
      try { parsed.push({ type, pattern: new RegExp(pattern, flags) }); }
      catch (e) { console.warn('🛡️ AEGIS: Invalid custom pattern:', line); }
    }
  });
  return parsed;
}

function scanWithRegex(text) {
  if (!text || text.length < 5) return { alerts: [], redactions: [] };
  const alerts = [], redactions = [];
  for (const [name, pattern] of Object.entries(PII_PATTERNS)) {
    const matches = text.match(pattern);
    if (matches) { alerts.push({ type: name, source: 'regex', severity: 'high' }); matches.forEach(m => redactions.push({ text: m, type: name })); }
  }
  return { alerts, redactions };
}

function scanWithContext(text) {
  if (!text || text.length < 5) return { alerts: [], redactions: [] };
  const alerts = [], redactions = [], seen = new Set();
  CONTEXT_PATTERNS.forEach(({ type, pattern }) => {
    const regex = new RegExp(pattern.source, pattern.flags);
    let match;
    while ((match = regex.exec(text)) !== null) {
      const t = match[0]; if (seen.has(t)) continue; seen.add(t);
      alerts.push({ type, source: 'context', severity: 'medium' }); redactions.push({ text: t, type });
    }
  });
  return { alerts, redactions };
}

function scanWithCustomPatterns(text, customPatterns) {
  if (!text || text.length < 5 || !customPatterns || customPatterns.length === 0) return { alerts: [], redactions: [] };
  const alerts = [], redactions = [];
  customPatterns.forEach(({ type, pattern }) => {
    const regex = new RegExp(pattern.source, pattern.flags);
    const matches = text.match(regex);
    if (matches) { alerts.push({ type, source: 'custom', severity: 'medium' }); matches.forEach(m => redactions.push({ text: m, type })); }
  });
  return { alerts, redactions };
}

function findNamesHeuristic(text) {
  const names = new Set();
  const skip = new Set(['The','This','That','What','When','Where','How','Why','Can','Could','Would','Should','ChatGPT','Chat','GPT','My','Your','His','Her','Our','Their','I','A','An','It','He','She','We','They','You','But','And','Or','If','Then','So','Not','Yes','No','Please','Thanks','Thank','Hello','Hi','Hey','Good','Morning','Afternoon','Evening','Today','Tomorrow','Yesterday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday','January','February','March','April','May','June','July','August','September','October','November','December','Dr','Mr','Mrs','Ms','Miss','Prof','Senior','Software','Engineer','Manager','Director','Analyst','Developer','Coordinator','Specialist','Academy','University','College','School','Institute','Hospital','General','Terrace','Street','Avenue','Road','Lane','Drive','Court','Boulevard','Way','Place','Plaza','Park','Social','Security','Driver','License','Medical','Record','API','Key','Bank','Account','Credit','Card']);
  const multi = /\b([A-Z][a-z]+(?:[\s-]+[A-Z][a-z]+){1,2})\b/g;
  let m;
  while ((m = multi.exec(text)) !== null) { const c = m[1]; if (c.split(/[\s-]+/).some(w => skip.has(w))) continue; if (c.split(/[\s-]+/).length >= 2) names.add(c); }
  [/\b(?:I'm|I am)\s+([A-Z][a-z]+)\b/g,/\bmy name is\s+([A-Z][a-z]+)\b/gi,/\bcall me\s+([A-Z][a-z]+)\b/gi,/\bthis is\s+([A-Z][a-z]+)\b/g,/\bname:\s*([A-Z][a-z]+)\b/gi,/\b(?:Mr|Mrs|Ms|Miss|Dr|Prof)\.?\s+([A-Z][a-z]+)\b/g].forEach(p => {
    let mm; while ((mm = p.exec(text)) !== null) { const c = mm[1]; if (!skip.has(c) && c.length >= 2) names.add(c); }
  });
  return Array.from(names);
}

function cleanText(t) { return t.replace(/\{[^}]*\}/g,'').replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/g,'').replace(/\s+/g,' ').trim(); }

let ollamaAvailable = false;
let settings = { aiEnabled: true, regexEnabled: true, useFakeData: true, sensitivity: 'medium', customPatterns: '', trustedSites: [], monitorClipboard: true, notificationSize: 'standard' };
let isWhitelisted = false, isPaused = false, pauseTimer = null, protectionHistory = [], totalProtected = 0, allTimeProtected = 0, ignoredTexts = new Set(), currentTheme = 'light';
function tc(light, dark) { return currentTheme === 'dark' ? dark : light; }
function loadTheme() { return new Promise((resolve) => { chrome.storage.sync.get(['theme'], (r) => { currentTheme = r.theme || 'light'; resolve(currentTheme); }); }); }

chrome.storage.onChanged.addListener((changes, ns) => {
  if (ns === 'sync') {
    if (changes.theme) { currentTheme = changes.theme.newValue || 'light'; if (popup) popup.render(); }
    if (changes.manualLanguage) {
      const newLang = changes.manualLanguage.newValue || 'auto';
      if (newLang !== 'auto' && TRANSLATIONS[newLang]) currentLang = newLang;
      else { const browserLang = navigator.language.split('-')[0].toLowerCase(); currentLang = TRANSLATIONS[browserLang] ? browserLang : 'en'; }
      if (popup) popup.render();
    }
  }
});

class HistoryStore {
  constructor() { this.MAX_ITEMS = 500; this.STORAGE_KEY = 'aegis_history'; this.SUMMARY_KEY = 'aegis_summary'; }
  async load() { return new Promise((resolve) => { chrome.storage.local.get([this.STORAGE_KEY, this.SUMMARY_KEY], (result) => { protectionHistory = result[this.STORAGE_KEY] || []; const summary = result[this.SUMMARY_KEY] || { allTime: 0 }; allTimeProtected = summary.allTime || 0; totalProtected = protectionHistory.filter(h => new Date(h.timestamp).toDateString() === new Date().toDateString()).length; resolve(); }); }); }
  async save() { if (protectionHistory.length > this.MAX_ITEMS) protectionHistory = protectionHistory.slice(-this.MAX_ITEMS); const summary = { allTime: allTimeProtected, lastUpdated: new Date().toISOString() }; return new Promise((resolve) => { chrome.storage.local.set({ [this.STORAGE_KEY]: protectionHistory, [this.SUMMARY_KEY]: summary }, resolve); }); }
  add(item) { item.timestamp = item.timestamp || new Date().toISOString(); protectionHistory.push(item); allTimeProtected++; totalProtected = protectionHistory.filter(h => new Date(h.timestamp).toDateString() === new Date().toDateString()).length; this.save(); }
  async clear() { protectionHistory = []; allTimeProtected = 0; totalProtected = 0; await this.save(); }
  exportJSON() { const data = JSON.stringify({ exported: new Date().toISOString(), total: protectionHistory.length, items: protectionHistory }, null, 2); const blob = new Blob([data], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `aegis-history-${new Date().toISOString().split('T')[0]}.json`; a.click(); URL.revokeObjectURL(url); }
  exportCSV() { if (protectionHistory.length === 0) return; let csv = 'Timestamp,Type,Original,Fake,Site\n'; protectionHistory.forEach(h => { csv += `"${h.timestamp}","${h.type}","${(h.original||'').replace(/"/g,'""')}","${(h.fake||'').replace(/"/g,'""')}","${h.site||''}"\n`; }); const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `aegis-history-${new Date().toISOString().split('T')[0]}.csv`; a.click(); URL.revokeObjectURL(url); }
}
const historyStore = new HistoryStore();

async function loadSettings() { return new Promise((resolve) => { chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, (response) => { if (response && response.settings) { settings = response.settings; if (!settings.trustedSites) settings.trustedSites = []; if (settings.useFakeData === undefined) settings.useFakeData = true; if (settings.monitorClipboard === undefined) settings.monitorClipboard = true; if (settings.notificationSize === undefined) settings.notificationSize = 'standard'; if (settings.sensitivity === undefined) settings.sensitivity = 'medium'; if (settings.customPatterns === undefined) settings.customPatterns = ''; const host = window.location.hostname.toLowerCase(); isWhitelisted = settings.trustedSites.some(t => host === t || host.endsWith('.' + t)); } resolve(settings); }); }); }
async function checkOllama() { return new Promise((resolve) => { chrome.runtime.sendMessage({ type: 'CHECK_OLLAMA' }, (response) => { ollamaAvailable = response && response.available; resolve(ollamaAvailable); }); }); }
async function classifyWithAI(text) { if (!ollamaAvailable || !settings.aiEnabled) return { categories: [], redactions: [] }; const ct = cleanText(text); if (ct.length < 15 || ct.length > 300) return { categories: [], redactions: [] }; return new Promise((resolve) => { chrome.runtime.sendMessage({ type: 'CLASSIFY_TEXT', text: ct }, (response) => { resolve(response || { categories: [], redactions: [] }); }); }); }

async function scanText(text) {
  const ct = cleanText(text); const alerts = [], redactions = [], seen = new Set();
  const sensitivity = settings.sensitivity || 'medium';
  if (settings.regexEnabled) { const r = scanWithRegex(ct); alerts.push(...r.alerts); r.redactions.forEach(x => { redactions.push(x); seen.add(x.text); }); }
  if (sensitivity === 'medium' || sensitivity === 'high') {
    const ctx = scanWithContext(ct); ctx.alerts.forEach(a => { if (!alerts.find(x => x.type === a.type && x.source === 'context') && !ignoredTexts.has(a.text)) alerts.push(a); }); ctx.redactions.forEach(r => { if (!seen.has(r.text) && !ignoredTexts.has(r.text)) { redactions.push(r); seen.add(r.text); } });
  }
  if (sensitivity === 'high') {
    findNamesHeuristic(ct).forEach(n => { if (!seen.has(n) && !ignoredTexts.has(n)) { alerts.push({ type: 'NAME', source: 'heuristic', severity: 'medium' }); redactions.push({ text: n, type: 'NAME' }); seen.add(n); } });
  }
  if (settings.customPatterns) {
    const customPatterns = parseCustomPatterns(settings.customPatterns);
    const custom = scanWithCustomPatterns(ct, customPatterns);
    custom.alerts.forEach(a => { if (!alerts.find(x => x.type === a.type && x.source === 'custom') && !ignoredTexts.has(a.text)) alerts.push(a); });
    custom.redactions.forEach(r => { if (!seen.has(r.text) && !ignoredTexts.has(r.text)) { redactions.push(r); seen.add(r.text); } });
  }
  const hasHighSeverity = alerts.some(a => a.severity === 'high');
  if (ollamaAvailable && settings.aiEnabled && !hasHighSeverity) { const ai = await classifyWithAI(text); ai.categories.forEach(c => { if (!alerts.find(a => a.type === c)) alerts.push({ type: c, source: 'ai', severity: 'medium' }); }); ai.redactions.forEach(r => { if (!seen.has(r.text) && ct.includes(r.text) && !ignoredTexts.has(r.text)) { redactions.push(r); seen.add(r.text); } }); }
  return { alerts, redactions };
}

function highlightSensitive(element, redactions) {
  if (!element) return; removeInlineIndicator(element);
  if (element.getAttribute('contenteditable') === 'true') {
    let html = element.innerHTML;
    redactions.forEach(r => { if (r.text && r.text.length > 0) { const escaped = r.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); html = html.replace(new RegExp(escaped, 'g'), `<span class="aegis-sensitive" style="color:#ff4444!important;font-weight:600;text-decoration:wavy underline #ff4444;">${r.text}</span>`); } });
    element.innerHTML = html;
  } else { element.style.transition = 'all 0.3s ease'; element.style.color = '#ff4444'; element.style.borderLeft = '4px solid #ff4444'; showInlineIndicator(element, ' PII detected', '#ff4444'); }
}
function highlightProtected(element, replacements) {
  if (!element) return; removeInlineIndicator(element);
  element.style.transition = 'all 0.3s ease'; element.style.color = '#28a745'; element.style.borderLeft = '4px solid #28a745';
  showInlineIndicator(element, '🛡️ Protected', '#28a745');
}
function clearHighlights(element) { if (!element) return; removeInlineIndicator(element); if (element.getAttribute('contenteditable') === 'true') { element.querySelectorAll('.aegis-sensitive, .aegis-protected').forEach(span => { span.replaceWith(document.createTextNode(span.textContent)); }); } else { element.style.borderLeft = ''; element.style.color = ''; } }
function showInlineIndicator(element, text, color) { const rect = element.getBoundingClientRect(); const indicator = document.createElement('div'); indicator.className = 'aegis-inline-indicator'; indicator.textContent = text; indicator.style.cssText = `position:absolute!important;top:${rect.top - 28}px!important;left:${rect.left}px!important;background:${color}!important;color:white!important;padding:4px 10px!important;border-radius:4px!important;font-size:11px!important;font-weight:600!important;z-index:2147483645!important;font-family:-apple-system,sans-serif!important;box-shadow:0 2px 8px rgba(0,0,0,0.2)!important;pointer-events:none!important;`; document.body.appendChild(indicator); }
function removeInlineIndicator() { document.querySelectorAll('.aegis-inline-indicator').forEach(el => el.remove()); }

function performRedaction(element, redactions) {
  if (!redactions || redactions.length === 0) return { originalText: null, replacements: [] };
  const cur = element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' ? element.value : (element.innerText || '');
  const orig = cur; let txt = cur; const reps = [];
  [...redactions].sort((a,b) => b.text.length - a.text.length).forEach(r => { if (r.text && r.text.length > 0 && txt.includes(r.text)) { const rep = settings.useFakeData ? getFakeData(r.type, r.text) : '[REDACTED-' + r.type + ']'; reps.push({ original: r.text, fake: rep, type: r.type, timestamp: new Date().toISOString() }); txt = txt.split(r.text).join(rep); } });
  if (txt !== orig) {
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set || Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
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
  showAlert(alerts, redactions, element, originalText, replacements = null, source = 'input') { const filteredAlerts = alerts.filter(a => !a.text || !ignoredTexts.has(a.text)); const filteredRedactions = redactions.filter(r => !ignoredTexts.has(r.text)); if (filteredAlerts.length === 0) return; const newAlert = { id: Date.now() + Math.random(), alerts: filteredAlerts, redactions: filteredRedactions, timestamp: new Date(), replacements: replacements || [], source, element, originalText }; this.activeAlerts = this.activeAlerts.filter(a => a.source !== source); this.activeAlerts.push(newAlert); if (this.activeAlerts.length > 10) this.activeAlerts.shift(); this.state = 'alert'; this.render(); }
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
    const snoozeButtons = isPaused ? `<button data-aegis-action="resume" style="flex:2;padding:6px;background:#28a745;color:white;border:none;border-radius:6px;cursor:pointer;font-size:11px;font-weight:600;">▶️ Resume</button>` : `<div style="flex:2;display:flex;gap:4px;"><button data-aegis-action="pause-5" style="flex:1;padding:6px;background:${snoozeBtnBg};color:${snoozeBtnText};border:none;border-radius:6px;cursor:pointer;font-size:10px;font-weight:600;" title="Pause 5 min">5m</button><button data-aegis-action="pause-60" style="flex:1;padding:6px;background:${snoozeBtnBg};color:${snoozeBtnText};border:none;border-radius:6px;cursor:pointer;font-size:10px;font-weight:600;" title="Pause 1 hour">1h</button><button data-aegis-action="pause-refresh" style="flex:1;padding:6px;background:${snoozeBtnBg};color:${snoozeBtnText};border:none;border-radius:6px;cursor:pointer;font-size:10px;font-weight:600;" title="Pause until refresh">↻</button></div>`;
    const footer = `<div style="padding:12px 16px;background:${footerBg};border-top:1px solid ${footerBorder};display:flex;gap:8px;align-items:center;flex-shrink:0;">${snoozeButtons}<div style="flex:1;"></div><div style="display:flex;gap:10px;align-items:center;"><button data-aegis-action="trust-site" style="background:transparent;color:#667eea;border:2px solid #667eea;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;font-weight:bold;transition:all 0.15s ease;" title="Trust this site" aria-label="Trust this site" onmouseover="this.style.background='#667eea';this.style.color='white'" onmouseout="this.style.background='transparent';this.style.color='#667eea'">🤝</button><button data-aegis-action="export" style="background:transparent;color:#667eea;border:2px solid #667eea;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;font-weight:bold;transition:all 0.15s ease;" title="Export JSON" aria-label="Export history as JSON" onmouseover="this.style.background='#667eea';this.style.color='white'" onmouseout="this.style.background='transparent';this.style.color='#667eea'">📤</button><button data-aegis-action="export-csv" style="background:transparent;color:#667eea;border:2px solid #667eea;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;font-weight:bold;transition:all 0.15s ease;" title="Export CSV" aria-label="Export history as CSV" onmouseover="this.style.background='#667eea';this.style.color='white'" onmouseout="this.style.background='transparent';this.style.color='#667eea'">📊</button><button data-aegis-action="settings" style="background:transparent;color:#667eea;border:2px solid #667eea;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;font-weight:bold;transition:all 0.15s ease;" title="Settings" aria-label="Open settings" onmouseover="this.style.background='#667eea';this.style.color='white'" onmouseout="this.style.background='transparent';this.style.color='#667eea'">⚙️</button></div></div>`;
    const popupWidth = this.isMaximized ? 'calc(100vw - 40px)' : this.getPopupWidth(); const popupHeight = this.isMaximized ? 'calc(100vh - 40px)' : this.getMaxHeight(); const popupRadius = this.isMaximized ? '0' : '14px';
    this.container.innerHTML = `<div data-aegis-part="full" style="width:${popupWidth};height:${popupHeight};max-height:${popupHeight};background:${popupBg};border-radius:${popupRadius};box-shadow:0 12px 40px rgba(0,0,0,0.4);overflow:hidden;border:1px solid ${popupBorder};display:flex;flex-direction:column;"><div data-aegis-part="header" style="background:${headerColor};color:white;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;cursor:grab;flex-shrink:0;"><div style="display:flex;align-items:center;gap:8px;"><span style="font-size:18px;">${headerIcon}</span><span style="font-size:14px;font-weight:600;">${headerTitle}</span></div><div style="display:flex;gap:10px;align-items:center;"><button data-aegis-action="minimize" style="background:transparent;color:white;border:2px solid white;width:22px;height:22px;border-radius:50%;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;font-weight:bold;transition:all 0.15s ease;" title="Minimize" onmouseover="this.style.background='white';this.style.color='#333'" onmouseout="this.style.background='transparent';this.style.color='white'">−</button><button data-aegis-action="${this.isMaximized ? 'restore' : 'maximize'}" style="background:transparent;color:white;border:2px solid white;width:22px;height:22px;border-radius:50%;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;font-weight:bold;transition:all 0.15s ease;" title="${this.isMaximized ? 'Restore' : 'Maximize'}" onmouseover="this.style.background='white';this.style.color='#333'" onmouseout="this.style.background='transparent';this.style.color='white'">${this.isMaximized ? '−' : '+'}</button></div></div>${body}${footer}</div>`;
    if (this.isMaximized) { this.container.style.cssText = `position:fixed!important;z-index:2147483647!important;top:20px!important;left:20px!important;right:20px!important;bottom:20px!important;`; } else { this.container.style.cssText = `position:fixed!important;z-index:2147483647!important;right:${this.position.right}px!important;bottom:${this.position.bottom}px!important;left:auto!important;top:auto!important;`; }
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
    if (action.startsWith('ignore-')) { const id = parseFloat(action.substring(7)); const alert = this.activeAlerts.find(a => a.id === id); if (alert && alert.redactions) { alert.redactions.forEach(r => ignoredTexts.add(r.text)); if (alert.element) clearHighlights(alert.element); this.dismissAlert(id); } return; }
    if (action.startsWith('undo-')) { const id = parseFloat(action.substring(5)); const alert = this.activeAlerts.find(a => a.id === id); if (alert && alert.element && alert.originalText) { if (alert.element.tagName === 'INPUT' || alert.element.tagName === 'TEXTAREA') alert.element.value = alert.originalText; else if (alert.element.innerText !== undefined) alert.element.innerText = alert.originalText; clearHighlights(alert.element); this.dismissAlert(id); } return; }
    if (action.startsWith('dismiss-')) { this.dismissAlert(parseFloat(action.substring(8))); return; }
    if (action.startsWith('clear-clipboard-')) { try { await navigator.clipboard.writeText('[CLEARED BY AEGIS]'); this.dismissAlert(parseFloat(action.substring(16))); } catch (e) {} return; }
    if (action.startsWith('pause-')) { const duration = action.substring(6); let ms = 0; if (duration === '5') ms = 5 * 60 * 1000; else if (duration === '60') ms = 60 * 60 * 1000; chrome.runtime.sendMessage({ type: 'PAUSE_AEGIS', duration: ms }); isPaused = true; this.render(); return; }
    switch (action) {
      case 'minimize': this.minimize(); break; case 'maximize': this.maximize(); break; case 'restore': this.restore(); break;
      case 'resume': chrome.runtime.sendMessage({ type: 'RESUME_AEGIS' }); isPaused = false; this.render(); break;
      case 'settings': chrome.runtime.sendMessage({ type: 'OPEN_OPTIONS' }); break;
      case 'export': historyStore.exportJSON(); break; case 'export-csv': historyStore.exportCSV(); break;
      case 'trust-site': 
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
        break;
    }
  }
}
let popup;

function setupPasteListener() { document.addEventListener('paste', async (e) => { try { let pastedText = ''; if (e.clipboardData && e.clipboardData.getData) pastedText = e.clipboardData.getData('text/plain') || ''; if (!pastedText || pastedText.length < 5) return; const { alerts, redactions } = await scanText(pastedText); if (alerts.length > 0) { const markedAlerts = alerts.map(a => ({ ...a, source: 'clipboard:' + a.source })); popup.showAlert(markedAlerts, redactions, null, null, null, 'clipboard'); } } catch (error) {} }, true); }
async function monitorClipboard() { setupPasteListener(); }
let lastScannedText = '', scanDebounce = null, scanInterval = null;
function getActiveInputElement() { const active = document.activeElement; if (!active) return null; if (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA') return active; if (active.getAttribute('contenteditable') === 'true') return active; const chatInput = document.querySelector('textarea[placeholder], div[contenteditable="true"], textarea'); return chatInput; }
async function performScan() {
  if (isWhitelisted || isPaused) return; const element = getActiveInputElement(); if (!element) return;
  const text = element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' ? (element.value || '') : (element.innerText || '');
  if (text === lastScannedText || text.length < 5) return; if (/\[REDACTED-|user_[a-z0-9]+@example\.com|555-01\d{2}-\d{4}/.test(text)) { lastScannedText = text; return; }
  lastScannedText = text; try { const { alerts, redactions } = await scanText(text); if (alerts.length > 0) { highlightSensitive(element, redactions); popup.showAlert(alerts, redactions, element, text, null, 'input'); chrome.runtime.sendMessage({ type: 'UPDATE_STATS', alerts, site: window.location.hostname }); } else { clearHighlights(element); } } catch (err) { console.warn('🛡️ AEGIS: Scan error:', err.message); }
}
function handleInputEvent() { clearTimeout(scanDebounce); scanDebounce = setTimeout(performScan, 300); }
function setupKeyboardShortcuts() { document.addEventListener('keydown', (e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { if (popup && popup.activeAlerts.length > 0) { const latestAlert = popup.activeAlerts[popup.activeAlerts.length - 1]; popup.handleAction(`protect-${latestAlert.id}`); e.preventDefault(); } } if (e.key === 'Escape') { if (popup && popup.activeAlerts.length > 0) { const latestAlert = popup.activeAlerts[popup.activeAlerts.length - 1]; popup.dismissAlert(latestAlert.id); e.preventDefault(); } } }); }
function showOnboarding() { chrome.storage.local.get(['onboarded'], (result) => { if (result.onboarded) return; const tooltip = document.createElement('div'); tooltip.setAttribute('data-aegis', 'onboarding'); tooltip.style.cssText = 'position:fixed!important;bottom:90px!important;right:20px!important;background:white!important;color:#333!important;padding:16px 20px!important;border-radius:12px!important;font-size:13px!important;z-index:2147483647!important;font-family:-apple-system,sans-serif!important;box-shadow:0 8px 24px rgba(0,0,0,0.2)!important;max-width:280px!important;border:2px solid #667eea!important;'; tooltip.innerHTML = `<div style="font-weight:600;margin-bottom:8px;color:#667eea;"> ${t('welcome')}</div><div style="line-height:1.5;margin-bottom:12px;">${t('welcomeText')}</div><div style="font-size:11px;color:#999;margin-bottom:12px;"> ${t('quickProtect')}</div><button id="aegis-dismiss-onboarding" style="width:100%;padding:8px;background:#667eea;color:white;border:none;border-radius:6px;cursor:pointer;font-weight:600;font-size:12px;">${t('gotIt')}</button>`; document.body.appendChild(tooltip); tooltip.addEventListener('click', (e) => e.stopPropagation()); document.getElementById('aegis-dismiss-onboarding').addEventListener('click', (e) => { e.stopPropagation(); e.preventDefault(); tooltip.remove(); chrome.storage.local.set({ onboarded: true }); }); }); }

let submissionGuardEnabled = true, pendingSubmission = null, hasUserInteracted = false;
document.addEventListener('mousedown', () => { hasUserInteracted = true; }, { once: true }); document.addEventListener('keydown', () => { hasUserInteracted = true; }, { once: true });
function setupSubmissionGuard() {
  document.addEventListener('click', (e) => { const target = e.target; if (target.id === 'aegis-modal-cancel' || target.closest('#aegis-modal-cancel')) { e.preventDefault(); e.stopPropagation(); const modal = document.querySelector('[data-aegis="submission-modal"]'); if (modal) modal.remove(); pendingSubmission = null; return; } if (target.id === 'aegis-modal-confirm' || target.closest('#aegis-modal-confirm')) { e.preventDefault(); e.stopPropagation(); const modal = document.querySelector('[data-aegis="submission-modal"]'); if (modal) modal.remove(); if (pendingSubmission) { submissionGuardEnabled = false; setTimeout(() => { if (pendingSubmission.type === 'button') pendingSubmission.element.click(); else if (pendingSubmission.type === 'enter') { const evt = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: false, bubbles: true, cancelable: true }); pendingSubmission.element.dispatchEvent(evt); } else if (pendingSubmission.type === 'form') pendingSubmission.element.submit(); pendingSubmission = null; setTimeout(() => { submissionGuardEnabled = true; }, 1000); }, 100); } return; } if (target.getAttribute('data-aegis') === 'submission-modal') { target.remove(); pendingSubmission = null; return; } }, true);
  document.addEventListener('click', (e) => { if (!submissionGuardEnabled || !hasUserInteracted) return; if (e.target.closest('[data-aegis]')) return; const target = e.target; const button = target.closest('button'); if (button && button.closest('[data-aegis="unified-popup"]')) return; if (target.id === 'aegis-modal-cancel' || target.id === 'aegis-modal-confirm') return; const isSendButton = button && (button.getAttribute('data-testid') === 'send-button' || button.type === 'submit' || /send|submit/i.test(button.textContent || button.getAttribute('aria-label') || '')); if (isSendButton && hasUnprotectedPII()) { e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); pendingSubmission = { type: 'button', element: button }; showSubmissionConfirmation(); } }, true);
  document.addEventListener('keydown', (e) => { if (!submissionGuardEnabled || !hasUserInteracted) return; if ((e.key === 'Enter' && !e.shiftKey) || ((e.metaKey || e.ctrlKey) && e.key === 'Enter')) { const target = e.target; if ((target.tagName === 'TEXTAREA' || target.tagName === 'INPUT' || target.getAttribute('contenteditable') === 'true') && hasUnprotectedPII()) { e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); pendingSubmission = { type: 'enter', element: target }; showSubmissionConfirmation(); } } }, true);
  document.addEventListener('submit', (e) => { if (!submissionGuardEnabled || !hasUserInteracted) return; if (hasUnprotectedPII()) { e.preventDefault(); e.stopPropagation(); pendingSubmission = { type: 'form', element: e.target }; showSubmissionConfirmation(); } }, true);
  console.log('️ AEGIS: ✅ Universal submission guard active');
}
function hasUnprotectedPII() { return popup && popup.activeAlerts && popup.activeAlerts.some(a => !a.isProtected); }
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
  const OriginalXHR = window.XMLHttpRequest; const originalSend = OriginalXHR.prototype.send; OriginalXHR.prototype.send = function(body) { if (body && (body instanceof File || body instanceof Blob || body instanceof FormData)) { if (body instanceof FormData) { body.forEach((value, key) => { if (value instanceof File) checkFileForUpload(value, 'XHR FormData', value.name); }); } else { checkFileForUpload(body, 'XHR send', body.name); } } return originalSend.apply(this, arguments); };
  const originalFetch = window.fetch; window.fetch = function(input, init) { if (init && init.body) { if (init.body instanceof FormData) { init.body.forEach((value, key) => { if (value instanceof File) checkFileForUpload(value, 'fetch FormData', value.name); }); } else if (init.body instanceof File || init.body instanceof Blob) { checkFileForUpload(init.body, 'fetch body', init.body.name); } } return originalFetch.apply(this, arguments); };
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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'TOGGLE_AEGIS') { isPaused = !isPaused; if (popup) popup.render(); sendResponse({ paused: isPaused }); }
  if (request.type === 'PAUSE_AEGIS') { isPaused = true; if (pauseTimer) clearTimeout(pauseTimer); if (request.duration > 0) { pauseTimer = setTimeout(() => { isPaused = false; if (popup) popup.render(); }, request.duration); } if (popup) popup.render(); sendResponse({ paused: true }); }
  if (request.type === 'RESUME_AEGIS') { isPaused = false; if (pauseTimer) clearTimeout(pauseTimer); if (popup) popup.render(); sendResponse({ paused: false }); }
});

async function init() {
  console.log('🛡️ AEGIS v5.5: Complete Final Build starting...');
  await historyStore.load(); await loadSettings(); await loadTheme();
  chrome.storage.sync.get(['manualLanguage'], (result) => {
    const manualLang = result.manualLanguage || 'auto';
    if (manualLang !== 'auto' && TRANSLATIONS[manualLang]) { currentLang = manualLang; }
    else { const browserLang = navigator.language.split('-')[0].toLowerCase(); if (TRANSLATIONS[browserLang]) currentLang = browserLang; if (navigator.language.toLowerCase().startsWith('zh')) currentLang = 'zh'; }
    console.log('🛡️ AEGIS: Language =', currentLang, '| Theme =', currentTheme);
    if (popup) popup.render();
  });
  popup = new AEGISPopup();
  document.addEventListener('input', handleInputEvent, true); document.addEventListener('keyup', handleInputEvent, true);
  scanInterval = setInterval(performScan, 2000);
  document.addEventListener('mousemove', (e) => popup.onDrag(e)); document.addEventListener('mouseup', () => popup.endDrag());
  setupKeyboardShortcuts(); setupSubmissionGuard(); setupAttachmentGuard();
  if (isWhitelisted) { popup.minimize(); return; }
  const hasOllama = await checkOllama(); console.log('️ AEGIS: Ollama =', hasOllama);
  if (settings.monitorClipboard) monitorClipboard();
  showOnboarding();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
