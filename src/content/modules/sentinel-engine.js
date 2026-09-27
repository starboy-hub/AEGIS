/**
 * AEGIS Sentinel Engine
 * Inbound scam/phishing analysis for AI-generated and AI-delivered messages.
 * Pure and offline: weighted signal detection -> risk score -> level + advice.
 * The LLM second opinion (optional) runs separately in the content layer.
 */
(function (root) {
  'use strict';

  const SENTINEL_SIGNALS = [
    { id: 'credential_request', label: 'Requests credentials or codes', weight: 40, re: /\b(?:password|passcode|otp\b|one[-\s]?time (?:code|password)|verification code|security code|\bpin\b|\bcvv\b|card number|seed phrase|recovery phrase|private key|social security number|\bssn\b)/i },
    { id: 'payment_pressure', label: 'Demands urgent payment', weight: 40, re: /\b(?:wire transfer|wire the (?:money|funds)|gift card|itunes card|bitcoin|crypto(?:currency)? wallet|\busdt\b|western union|send (?:money|us|me) (?:\$|\d)|processing fee|unclaimed funds|release fee)/i },
    { id: 'personal_info_fishing', label: 'Fishes for personal details', weight: 30, re: /\b(?:confirm|verify|provide|update) your (?:full name|date of birth|address|phone|bank|billing|identity|details|information)|mother'?s maiden name/i },
    { id: 'authority_threat', label: 'Impersonates authority or threatens', weight: 25, re: /\b(?:\birs\b|tax (?:office|department)|police(?: department)?|\bfbi\b|government (?:agency|official)|account (?:will be )?(?:suspended|closed|terminated|frozen)|legal action|lawsuit|arrest warrant|deportation|immigration (?:check|status))/i },
    { id: 'too_good', label: 'Too-good-to-be-true offer', weight: 25, re: /\b(?:you(?:'ve| have) won|you are (?:our )?winner|prize|lottery|jackpot|claim your|free (?:money|iphone|gift card)|guaranteed (?:returns?|profit)|double your (?:money|crypto|income)|\d{3,4}% (?:return|profit)|investment opportunity|risk[-\s]?free (?:investment|profit))/i },
    { id: 'secrecy', label: 'Asks for secrecy', weight: 25, re: /\b(?:don'?t tell|do not tell|keep this (?:confidential|secret|between us)|confidential (?:transaction|matter)|not (?:tell|inform) (?:your|anyone|the))/i },
    { id: 'channel_shift', label: 'Moves you off-platform', weight: 20, re: /\b(?:whatsapp|telegram|\bsignal\b|dm me|text me|whatsapp me|call me (?:back )?at|contact me on|continue (?:this )?(?:on|via) (?:whatsapp|telegram|signal|email))/i },
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
