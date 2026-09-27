/**
 * AEGIS Injection Firewall Engine
 * Detects prompt-injection patterns in page text: content crafted to hijack
 * an AI system (agent browsing the page, model reading pasted text) instead
 * of the human reader. Pure and offline; scoring mirrors the Sentinel engine.
 */
(function (root) {
  'use strict';

  const INJECTION_SIGNALS = [
    { id: 'override', label: 'Tries to override AI instructions', weight: 60, re: /\b(?:ignore|disregard|forget|override) (?:all |any |the |your |previous |prior |above |earlier |original )*?(?:previous |prior |above |earlier |original |system |developer |safety |content )?(?:instructions?|prompts?|rules?|guidelines?|guardrails?|training)\b/i },
    { id: 'safety_bypass', label: 'Attempts to bypass AI safety rules', weight: 55, re: /\b(?:bypass|disable|turn off|ignore) (?:all |your |the )?(?:safety|security|content) (?:filters?|rules?|policies?|guardrails?)\b|\bdeveloper mode\b|\bdo anything now\b/i },
    { id: 'prompt_extract', label: 'Tries to extract the system prompt', weight: 50, re: /\b(?:reveal|print|repeat|show|output|disclose|leak) (?:your |the |its )?(?:exact )?(?:system (?:prompt|message)|initial (?:instructions|prompt)|rules above|instructions above)\b/i },
    { id: 'exfiltration', label: 'Instructions to exfiltrate data', weight: 45, re: /\b(?:email|send|forward|upload|post|exfiltrate|copy|transmit)\b[^.\n]{0,30}\b(?:user|their|my|all)\b[^.\n]{0,30}\b(?:data|content|secrets?|credentials|tokens?|history|messages?)\b[^.\n]{0,30}\bto\b|\bappend (?:the )?following to your (?:response|reply|output)\b|\bwhen (?:the )?(?:user|asked)[^.\n]{0,40}(?:respond|reply|say) with\b/i },
    { id: 'role_hijack', label: 'Fake system/role markers', weight: 35, re: /(?:^|\n)\s*(?:system\s*:|assistant\s*:|###\s*system|<\|(?:im_start|system)\|>|\[\/?INST\]|<\|endoftext\|>)|\byou are now (?:a|an|my|the) \w|\bact as (?:my|the) /i },
    { id: 'encoded', label: 'Encoded payload instructions', weight: 30, re: /\b(?:decode|decipher|execute|run) (?:the |this |following )?(?:base64|rot13|hex|encoded) (?:text|string|payload|message|instructions?)\b/i },
    { id: 'obedience', label: 'Demands unconditional obedience', weight: 20, re: /\b(?:you must|you will) (?:now )?(?:obey|follow|comply with) (?:my|these|the) (?:instructions?|commands?|orders?)\b|\bfrom now on,? (?:always|you)\b/i },
    { id: 'ai_marker', label: 'Language directed at AI systems', weight: 10, re: /\b(?:dear ai|hey ai|attention ai|note to (?:the )?(?:ai|assistant|model|chatbot|scrapers?))\b/i }
  ];

  const LEVELS = {
    dangerous: { rank: 3, advice: 'This page contains text trying to manipulate AI systems. Do not paste it into an AI chat, and be careful letting AI agents read this page.' },
    suspicious: { rank: 2, advice: 'This page contains AI-directed instructions. Treat its content with suspicion before using it with any AI tool.' },
    low: { rank: 1, advice: 'Minor AI-directed language detected on this page.' },
    none: { rank: 0, advice: '' }
  };

  /**
   * Analyze a text block for prompt-injection patterns.
   * @returns {{level: string, score: number, signals: Array<{id,label,weight}>, advice: string}}
   */
  function analyzeInjection(text) {
    if (!text || text.length < 15) return { level: 'none', score: 0, signals: [], advice: LEVELS.none.advice };
    let score = 0;
    const signals = [];
    for (const sig of INJECTION_SIGNALS) {
      if (sig.re.test(text)) {
        score += sig.weight;
        signals.push({ id: sig.id, label: sig.label, weight: sig.weight });
      }
    }
    const has = id => signals.some(s => s.id === id);
    let level = 'none';
    if (score >= 55 || has('override') || has('safety_bypass') || has('prompt_extract')) level = 'dangerous';
    else if (score >= 30) level = 'suspicious';
    else if (score >= 12) level = 'low';
    return { level, score, signals, advice: LEVELS[level].advice };
  }

  function topSignals(result, n) {
    return result.signals
      .slice()
      .sort((a, b) => b.weight - a.weight)
      .slice(0, n || 2)
      .map(s => s.label);
  }

  const AEGIS_INJECTION = { analyzeInjection, topSignals, INJECTION_SIGNALS, LEVELS };
  root.AEGIS_INJECTION = AEGIS_INJECTION;
  if (typeof module !== 'undefined' && module.exports) module.exports = AEGIS_INJECTION;
})(typeof self !== 'undefined' ? self : globalThis);
