/**
 * AEGIS Sentinel Engine
 * Inbound scam/phishing analysis for AI-generated and AI-delivered messages.
 * Pure and offline: weighted signal detection -> risk score -> level + advice.
 * The LLM second opinion (optional) runs separately in the content layer.
 */
(function (root) {
  'use strict';

  const SENTINEL_SIGNALS = [
    { id: 'credential_request', label: 'Requests credentials or codes', weight: 40, re: /\b(?:send|provide|confirm|enter|give|share|reveal|import|update|verify|resend|submit|reply|collect|need)[^.\n]{0,30}\b(?:password|passcode|\botp\b|one[-\s]?time (?:code|password)|verification code|security code|\bpin\b|\bcvv\b|card number|card details|seed phrase|recovery phrase|private key|login (?:credentials|details)|account details|credentials|social security number|\bssn\b)\b|\b(?:your )?(?:password|passcode|verification code|seed phrase|private key)\b[^.\n]{0,20}(?:is|are|:)\s*\S+/i },
    { id: 'payment_pressure', label: 'Demands urgent payment', weight: 40, re: /\b(?:wire transfer|wire the (?:money|funds)|gift cards?|itunes card|bitcoin|crypto(?:currency)? wallet|\busdt\b|western union|money ?gram|send (?:money|us|me) (?:\$|\d)|(?:activation|processing|release|registration|administration|administrative|customs|delivery|redelivery|unpaid|recruitment) (?:charge|fee)|release the funds|unclaimed funds)\b/i },
    { id: 'personal_info_fishing', label: 'Fishes for personal details', weight: 30, re: /\b(?:confirm|verify|provide|update|need|send|give|share|enter)[^.\n]{0,15}\byour (?:full name|date of birth|address|phone|bank|billing|identity|details|information)\b|\b(?:give|provide|confirm|share|tell) (?:me )?(?:your )?mother'?s maiden name\b/i },
    { id: 'authority_threat', label: 'Impersonates authority or threatens', weight: 25, re: /\b(?:\birs\b|tax (?:office|department)|police(?: department)?|\bfbi\b|government (?:agency|official|grant)|social security administration|immigration (?:check|status|notice))\b|\baccount (?:will be |has been )?(?:suspended|closed|terminated|frozen|deleted)\b|\blegal action\b|\blawsuit\b|\barrest warrant\b|\bdeportation\b/i },
    { id: 'too_good', label: 'Too-good-to-be-true offer', weight: 25, re: /\b(?:you(?:'ve| have| are)? ?(?:been )?won|you are (?:our )?winner|prize|lottery|jackpot|sweepstak|lucky (?:dip|winner|draw)|claim your|entitled to [\d,.]+|\bfree (?:money|iphone|gift card)\b|double your (?:money|crypto|income)|risk[-\s]?free (?:investment|profit)|government (?:relief )?grant|pandemic relief grant)\b/i },
    { id: 'investment_scam', label: 'Investment/returns pressure', weight: 35, re: /\b(?:double|triple|x\d+) your (?:money|crypto|income|investment)|\bguaranteed (?:returns?|profit)\b|\bprofit guaranteed\b|\b\d{2,4}\s?(?:percent|%) (?:returns?|profit|weekly|daily)\b|\b(?:investment|trading) (?:opportunity|platform|group)\b|\b(?:crypto|token|coin) (?:presale|giveaway)\b|\breturns? (?:of )?\d/i },
    { id: 'emergency_money', label: 'Emergency money request', weight: 25, re: /\b(?:i am |im )?(?:stuck|stranded|robbed|mugged|held)[^.\n]{0,60}\b(?:fee|money|cash|funds|transfer|payment|western union)\b|\b(?:customs|embassy|hotel|airport|hospital|clinic)\b[^.\n]{0,60}\b(?:fee|release|costs?|payment|bill|transfer)\b|\btransfer fee\b|\brelease fee\b|\bwestern union\b|\bmoney ?gram\b|\b(?:never met|never seen) (?:each other|in person|you)\b/i },
    { id: 'relationship_pressure', label: 'Unmet-contact money pressure', weight: 20, re: /\b(?:i know|we have) (?:we have )?never (?:met|seen)\b|\b(?:online|internet) (?:relationship|romance|boyfriend|girlfriend)\b|\btreatment costs?\b/i },
    { id: 'job_scam', label: 'Too-good job offer with fees', weight: 30, re: /\b(?:earn|make|get paid)\b[^.\n]{0,40}\b(?:per (?:day|week|hour)|daily|weekly)\b|\b(?:work from home|remote) (?:job|opportunity|role)[^.\n]{0,60}(?:no experience|easy money|fee)\b|\b(?:registration|activation|background check) fee\b|\breceive payments? (?:from|into)\b/i },
    { id: 'delivery_scam', label: 'Fake delivery/customs fee', weight: 25, re: /\b(?:package|parcel|shipment|delivery)\b[^.\n]{0,70}\b(?:customs|redelivery|reschedule|delivery fee|shipping fee|customs charge|customs duty|unpaid)\b|\b(?:usps|dhl|fedex|ups)\b[^.\n]{0,60}\b(?:fee|charge|customs|redelivery|tracking problem)\b/i },
    { id: 'invoice_fraud', label: 'Fraudulent invoice/bank-change', weight: 30, re: /\b(?:overdue|unpaid) invoice\b|\binvoice\b[^.\n]{0,60}\b(?:overdue|unpaid|failed|declined|approve|settled?|process|attached)\b|\b(?:updated|new) bank details\b|\bsettle (?:the |your )?(?:outstanding|unpaid|invoice|balance)\b/i },
    { id: 'account_lock', label: 'Account lock/delete threat', weight: 25, re: /\b(?:account|mailbox|access|email)\b[^.\n]{0,40}\b(?:suspended|locked|frozen|deleted|terminated)\b|\blose (?:your )?access (?:forever|permanently)\b/i },
    { id: 'tech_support', label: 'Fake tech support', weight: 30, re: /\b(?:computer|pc|device|windows|mac)\b[^.\n]{0,40}\b(?:infected|at risk|viruses?|license (?:has )?expired)\b|\bcertified technicians?\b|\ballow remote (?:access|connection)\b|\bcall (?:the )?(?:toll ?free|helpline|support line)\b/i },
    { id: 'secrecy', label: 'Asks for secrecy', weight: 25, re: /\b(?:don'?t tell|do not tell|keep this (?:confidential|secret|between us)|confidential (?:transaction|matter)|not (?:tell|inform) (?:your|anyone|the))\b/i },
    { id: 'channel_shift', label: 'Moves you off-platform', weight: 20, re: /\b(?:whatsapp|telegram|\bsignal\b|dm me|text me|whatsapp me|call me (?:back )?at|contact me on|continue (?:this )?(?:on|via) (?:whatsapp|telegram|signal|email))\b/i },
    { id: 'urgency', label: 'Artificial urgency', weight: 15, re: /\b(?:act now|immediately|right away|within (?:24|48|12|2) hours?|expires? (?:today|tomorrow|in \d+ (?:hours?|minutes?|days?))|last (?:chance|warning)|final notice|don'?t (?:delay|wait)|time[-\s]sensitive|urgent(ly)?)\b/i },
    { id: 'link_pressure', label: 'Pushes a link or login page', weight: 10, re: /(?:click (?:the|this) (?:link|button)|verify via|log ?in at|bit\.ly\/|tinyurl\.com\/|https?:\/\/\S{0,40}(?:login|verify|secure|account[-_]update))/i }
  ];

  const LEVELS = {
    dangerous: { rank: 3, advice: 'Do not reply, click links, or send anything. Verify through a channel you trust (official app or the number on your card).' },
    suspicious: { rank: 2, advice: 'Be cautious. Verify the sender through a known channel before acting on anything here.' },
    low: { rank: 1, advice: 'Stay alert — some common pressure patterns appear in this text.' },
    none: { rank: 0, advice: '' }
  };

  /**
   * Analyze one message/text block for scam patterns.
   * @returns {{level: string, score: number, signals: Array<{id,label,weight}>, advice: string}}
   */
  function analyzeMessage(text) {
    if (!text || text.length < 25) return { level: 'none', score: 0, signals: [], advice: LEVELS.none.advice };
    let score = 0;
    const signals = [];
    for (const sig of SENTINEL_SIGNALS) {
      if (sig.re.test(text)) {
        score += sig.weight;
        signals.push({ id: sig.id, label: sig.label, weight: sig.weight });
      }
    }
    const has = id => signals.some(s => s.id === id);
    let level = 'none';
    if (score >= 60 || has('credential_request') || has('payment_pressure')) level = 'dangerous';
    else if (score >= 30) level = 'suspicious';
    else if (score >= 12) level = 'low';
    return { level, score, signals, advice: LEVELS[level].advice };
  }

  /** Human summary of the strongest matched signals, for UI display. */
  function topSignals(result, n) {
    return result.signals
      .slice()
      .sort((a, b) => b.weight - a.weight)
      .slice(0, n || 2)
      .map(s => s.label);
  }

  /**
   * Trust-graph escalation: a pressure message that names one of the user's
   * OWN trusted organizations is impersonation — escalate to dangerous.
   * @param {{level:string,score:number,signals:Array}} result - analyzeMessage output
   * @param {Array<{label:string}>} trustedHits - trusted org/contact labels found in the text
   */
  function escalateForTrust(result, trustedHits) {
    if (!trustedHits || !trustedHits.length) return result;
    if (result.level === 'none' || result.level === 'low') return result;
    if (result.signals.some(s => s.id === 'trusted_impersonation')) return result;
    return {
      ...result,
      level: 'dangerous',
      signals: [...result.signals, { id: 'trusted_impersonation', label: 'Impersonates YOUR trusted organization (' + trustedHits.join(', ') + ')', weight: 45 }]
    };
  }

  /**
   * Should this level surface a banner? Family Guardian mode warns even on
   * 'low' so loved ones see every pressure pattern.
   */
  function shouldWarn(level, familyMode) {
    if (familyMode) return level !== 'none';
    return level === 'suspicious' || level === 'dangerous';
  }

  const AEGIS_SENTINEL = { analyzeMessage, topSignals, escalateForTrust, shouldWarn, SENTINEL_SIGNALS, LEVELS };
  root.AEGIS_SENTINEL = AEGIS_SENTINEL;
  if (typeof module !== 'undefined' && module.exports) module.exports = AEGIS_SENTINEL;
})(typeof self !== 'undefined' ? self : globalThis);
