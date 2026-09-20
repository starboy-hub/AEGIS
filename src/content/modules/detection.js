/**
 * AEGIS PII Detection Module
 * Contains regex patterns and context detection for PII
 */

const PII_PATTERNS = {
  'SSN': /\b\d{3}-\d{2}-\d{4}\b/g,
  'Credit Card': /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
  'Email': /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  'Phone': /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
  'IP Address': /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
  'Date of Birth': /\b(?:born on|DOB:|birthday:?|Date of Birth:?)\s*(?:is\s+)?\:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/gi,
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
  { type: 'EMPLOYMENT', pattern: /\b(?:I work at|I work for|employed at|employed by|my employer is|my boss)\s+([A-Z][a-zA-Z\s-]+?)(?:\.|,|and|but|as|et|und|。|،|و|أو|$)/g },
  { type: 'EMPLOYMENT', pattern: /\b(?:fired|laid off|let go|terminated|quit my job|resigned)\b/gi }
];

const SENSITIVE_KEYWORDS = [
  'ssn', 'social security', 'passport', 'credit card', 'debit card',
  'bank account', 'routing number', 'password', 'secret', 'confidential',
  'medical record', 'diagnosis', 'prescription', 'salary', 'income',
  'tax id', 'ein', 'driver license', 'date of birth', 'dob'
];

function getSeverityForType(type) {
  const severityMap = {
    'SSN': 'critical', 'Credit Card': 'critical', 'Passport': 'critical',
    'Driver License': 'critical', 'Medical Record': 'critical',
    'Phone': 'high', 'Bank Account': 'high', 'Date of Birth': 'high',
    'Email': 'medium', 'IP Address': 'medium', 'KEYWORD': 'medium',
    'MEDICAL': 'high', 'FINANCIAL': 'high', 'LEGAL': 'high',
    'CREDENTIALS': 'critical', 'PERSONAL': 'medium', 'EMPLOYMENT': 'low'
  };
  return severityMap[type] || 'low';
}

function scanTextForPII(text) {
  const alerts = [];
  const redactions = [];
  if (!text || text.length < 5) return { alerts, redactions };

  const textLower = text.toLowerCase();
  SENSITIVE_KEYWORDS.forEach(keyword => {
    if (textLower.includes(keyword)) {
      alerts.push({ type: 'KEYWORD', source: `Keyword: ${keyword}`, severity: 'medium', originalText: keyword, isProtected: false });
    }
  });

  for (const [type, pattern] of Object.entries(PII_PATTERNS)) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(text)) !== null) {
      if (!alerts.some(a => a.originalText === match[0])) {
        alerts.push({ type, source: type, severity: getSeverityForType(type), originalText: match[0], isProtected: false });
        redactions.push({ type, original: match[0], start: match.index, end: match.index + match[0].length });
      }
    }
  }

  for (const ctx of CONTEXT_PATTERNS) {
    ctx.pattern.lastIndex = 0;
    let match;
    while ((match = ctx.pattern.exec(text)) !== null) {
      if (!alerts.some(a => a.originalText === match[0])) {
        alerts.push({ type: ctx.type, source: ctx.type, severity: getSeverityForType(ctx.type), originalText: match[0], isProtected: false });
      }
    }
  }

  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  return { alerts, redactions };
}

function containsPII(text) {
  const { alerts } = scanTextForPII(text);
  return alerts.length > 0;
}

function getSeverityCount(alerts) {
  return alerts.reduce((acc, alert) => {
    acc[alert.severity] = (acc[alert.severity] || 0) + 1;
    return acc;
  }, { critical: 0, high: 0, medium: 0, low: 0 });
}

module.exports = { scanTextForPII, containsPII, getSeverityCount, PII_PATTERNS, CONTEXT_PATTERNS };
