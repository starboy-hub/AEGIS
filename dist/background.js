const DEFAULT_SETTINGS = {
  aiEnabled: true, regexEnabled: true, useFakeData: true,
  sensitivity: 'medium', customPatterns: '', trustedSites: [],
  monitorClipboard: true, theme: 'light'
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['settings'], (result) => {
    if (!result.settings) chrome.storage.sync.set({ settings: DEFAULT_SETTINGS });
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_SETTINGS') {
    chrome.storage.sync.get(['settings'], (result) => {
      sendResponse({ settings: result.settings || DEFAULT_SETTINGS });
    });
    return true;
  }
  if (request.type === 'SAVE_TRUSTED_SITES') {
    chrome.storage.sync.get(['settings'], (result) => {
      const settings = result.settings || DEFAULT_SETTINGS;
      settings.trustedSites = request.sites || [];
      chrome.storage.sync.set({ settings }, () => sendResponse({ success: true }));
    });
    return true;
  }
  if (request.type === 'CHECK_OLLAMA') {
    fetch('http://localhost:11434/api/tags', { method: 'GET' })
      .then(r => sendResponse({ available: r.ok }))
      .catch(() => sendResponse({ available: false }));
    return true;
  }
  if (request.type === 'OPEN_OPTIONS') {
    chrome.runtime.openOptionsPage();
  }
});
