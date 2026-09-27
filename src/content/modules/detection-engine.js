/**
 * AEGIS Detection Engine
 * Regex + context PII scanning, name heuristics, and custom patterns.
 *
 * This is the single source of truth for detection — loaded before
 * content.js in the manifest and required directly by tests.
 * (Keep this file framework-free so it runs in pages, workers, and Node.)
 */
(function (root) {
  'use strict';

  const PII_PATTERNS = {
    'SSN': /\b\d{3}-\d{2}-\d{4}\b/g,
    'Credit Card': /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
    'Email': /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    'Phone': /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    'IP Address': /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    'Date of Birth': /\b(?:born on|DOB:|birthday:?|Date of Birth:?)\s*(?:is\s+)?:?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b/gi,
    'Passport': /\b(?:passport|passport\s*#?)\s*:?\s*([A-Z]{1,2}\d{6,9})\b/gi,
    'Bank Account': /\b(?:bank\s+account|account|acct)\s+(?:is\s+)?:?\s*(\d{8,17})\b/gi,
    'Driver License': /\b(?:driver\s+license|driver'?s?\s+license|license|DL)\s*#?\s*:?\s*([A-Z]?\d{2,4}[-\s]?\d{2,4}[-\s]?\d{2,4})\b/gi,
    'Medical Record': /\b(?:MRN|medical\s*record)\s*-?\s*#?:?\s*(?:MRN\s+)?(\d{6,10})\b/gi
  };

  const CONTEXT_PATTERNS = [
    { type: 'MEDICAL', pattern: /(?:I have|I've been diagnosed with|I suffer from|I was diagnosed with|my diagnosis is|tengo|me diagnosticaron|sufro de|fui diagnosticado|j'ai|on m'a diagnostiqué|je souffre de|ich habe|mir wurde diagnostiziert|leide unter|eu tenho|fui diagnosticado|sofro de|mi è stato diagnosticato|soffro di|у меня|мне поставили диагноз|я страдаю от|我被诊断出|我患有|我有|لدي|تم تشخيصي بـ|أعاني من)\s+([a-zA-ZÀ-ÿа-яА-Я\u4e00-\u9fa5\u0600-\u06FF\s-]{2,50})/gi },
    { type: 'MEDICAL', pattern: /\b(?:pregnant|pregnancy|miscarriage|fertility|IVF|chemotherapy|radiation|dialysis|embarazada|embarazo|enceinte|schwanger|grávida|incinta|беременная|怀孕|حامل)\b/gi },
    { type: 'MEDICAL', pattern: /\b(?:diabetes|cancer|HIV|AIDS|hepatitis|tuberculosis|depression|anxiety|bipolar|schizophrenia|PTSD|addiction|alcoholism|opioid|diabète|diabete|depresión|dépression|depressa|депрессия|抑郁|اكتئاب|ansiedad|asthma|migraine|hypertension)\b/gi },
    { type: 'MEDICAL', pattern: /\b(?:I am taking|I'm taking|I take|taking my|I am on|I'm on|on my|using my|estoy tomando|tomo mi|je prends mon|ich nehme mein|eu tomo meu|prendo il mio|я принимаю|我在吃|أنا آخذ)\s+(?:metformin|insulin|lisinopril|adderall|xanax|oxycodone|vicodin|percocet|ambien|prozac|zoloft|lexapro|cetirizine|loratadine|ibuprofen|acetaminophen|aspirin|naproxen|omeprazole|atorvastatin|amlodipine|gabapentin|hydrocodone|tramadol|morphine|fentanyl|methadone|suboxone|klonopin|valium|ativan|restoril|sonata|lunesta|metformina|ibuprofeno|paracetamol|aspirina)\b/gi },
    { type: 'FINANCIAL', pattern: /(?:my salary is|I earn|I make|annual income|yearly income|mi salario es|gano|mi sueldo es|mon salaire est|je gagne|mein gehalt ist|ich verdiene|meu salário é|ganho|il mio stipendio è|guadagno|моя зарплата|я зарабатываю|我的工资是|我赚|我的年薪|راتبي هو|أكسب|دخلي السنوي)\s*[$€£₽¥₹ر.سR$]?\s*\d+(?:[.,]\d+)*/gi },
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

  const AEGIS_ENGINE = { PII_PATTERNS, CONTEXT_PATTERNS, parseCustomPatterns, scanWithRegex, scanWithContext, scanWithCustomPatterns, findNamesHeuristic, cleanText };
  root.AEGIS_ENGINE = AEGIS_ENGINE;
  if (typeof module !== 'undefined' && module.exports) module.exports = AEGIS_ENGINE;
})(typeof self !== 'undefined' ? self : globalThis);
