// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('AEGIS Data Cloak installed');
  
  // Set default settings
  chrome.storage.sync.set({
    enabled: true,
    blockedCount: 0
  });
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'CHECK_PII') {
    const result = checkForPII(request.text);
    sendResponse(result);
    return true;
  }
});

// PII Detection Logic
function checkForPII(text) {
  const patterns = {
    ssn: /\b\d{3}-\d{2}-\d{4}\b/,
    creditCard: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/,
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
    phone: /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/
  };
  
  const detected = [];
  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(text)) {
      detected.push(type);
    }
  }
  
  return {
    hasPII: detected.length > 0,
    types: detected
  };
}