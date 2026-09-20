const DEFAULT_SETTINGS = {
  aiEnabled: true, 
  regexEnabled: true, 
  useFakeData: true,
  sensitivity: 'medium', 
  customPatterns: '', 
  trustedSites: [],
  monitorClipboard: true, 
  theme: 'light',
  notificationSize: 'standard'
};

// Track pending responses to avoid port errors
let ollamaCheckPending = false;

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
        sendResponse({ available: false, reason: 'timeout' });
      }, 3000);
      
      fetch('http://localhost:11434/api/tags', { 
        method: 'GET',
        signal: AbortSignal.timeout(2500)
      })
        .then(r => {
          clearTimeout(timeoutId);
          ollamaCheckPending = false;
          sendResponse({ available: r.ok });
        })
        .catch(() => {
          clearTimeout(timeoutId);
          ollamaCheckPending = false;
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
          model: 'llama3',
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
    
    sendResponse({ error: 'unknown_request_type' });
    return false;
  } catch (error) {
    console.error('🛡️ AEGIS Background Error:', error);
    sendResponse({ error: error.message });
    return false;
  }
});
