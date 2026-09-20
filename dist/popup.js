// AEGIS Popup Controller - Complete Implementation
let settings = { regexEnabled: true, aiEnabled: true, useFakeData: true, sensitivity: 'medium', theme: 'light' };
let isPaused = false;
let historySummary = { allTime: 0, today: 0, sites: 0 };

// DOM Elements
const elements = {};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  cacheElements();
  await loadSettings();
  await loadHistory();
  renderUI();
  setupEventListeners();
  checkOllamaStatus();
});

// Cache DOM elements for performance
function cacheElements() {
  elements.toggleRegex = document.getElementById('toggleRegex');
  elements.toggleAI = document.getElementById('toggleAI');
  elements.toggleFake = document.getElementById('toggleFake');
  elements.sensitivityBtns = document.querySelectorAll('.sensitivity-btn');
  elements.todayCount = document.getElementById('todayCount');
  elements.allTimeCount = document.getElementById('allTimeCount');
  elements.sitesCount = document.getElementById('sitesCount');
  elements.btnPause = document.getElementById('btnPause');
  elements.pauseIcon = document.getElementById('pauseIcon');
  elements.pauseText = document.getElementById('pauseText');
  elements.btnOptions = document.getElementById('btnOptions');
  elements.btnTrust = document.getElementById('btnTrust');
  elements.btnClear = document.getElementById('btnClear');
  elements.linkHelp = document.getElementById('linkHelp');
  elements.linkReport = document.getElementById('linkReport');
  elements.statusDot = document.getElementById('statusDot');
  elements.statusText = document.getElementById('statusText');
  elements.toast = document.getElementById('toast');
}

// Load settings from storage
async function loadSettings() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, (response) => {
      if (response && response.settings) {
        settings = { ...settings, ...response.settings };
      }
      resolve();
    });
  });
}

// Load history statistics
async function loadHistory() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['aegis_history', 'aegis_summary'], (result) => {
      const history = result.aegis_history || [];
      const summary = result.aegis_summary || { allTime: 0 };
      
      const today = new Date().toDateString();
      const todayItems = history.filter(h => new Date(h.timestamp).toDateString() === today);
      const uniqueSites = new Set(history.map(h => h.site).filter(Boolean));
      
      historySummary = {
        allTime: summary.allTime || history.length,
        today: todayItems.length,
        sites: uniqueSites.size
      };
      resolve();
    });
  });
}

// Check Ollama availability
function checkOllamaStatus() {
  chrome.runtime.sendMessage({ type: 'CHECK_OLLAMA' }, (response) => {
    if (response && response.available) {
      elements.statusDot.style.background = '#4ade80';
      elements.statusText.textContent = 'Active + AI';
    } else {
      elements.statusDot.style.background = '#ffc107';
      elements.statusText.textContent = 'Active (AI unavailable)';
    }
  });
}

// Render UI based on current state
function renderUI() {
  // Update stats
  if (elements.todayCount) elements.todayCount.textContent = historySummary.today;
  if (elements.allTimeCount) elements.allTimeCount.textContent = historySummary.allTime;
  if (elements.sitesCount) elements.sitesCount.textContent = historySummary.sites;
  
  // Update toggles
  if (elements.toggleRegex) {
    elements.toggleRegex.classList.toggle('active', settings.regexEnabled);
  }
  if (elements.toggleAI) {
    elements.toggleAI.classList.toggle('active', settings.aiEnabled);
  }
  if (elements.toggleFake) {
    elements.toggleFake.classList.toggle('active', settings.useFakeData);
  }
  
  // Update sensitivity buttons
  if (elements.sensitivityBtns) {
    elements.sensitivityBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.level === settings.sensitivity);
    });
  }
  
  // Update pause button
  if (elements.btnPause) {
    if (isPaused) {
      elements.pauseIcon.textContent = '▶️';
      elements.pauseText.textContent = 'Resume';
      elements.btnPause.style.background = '#28a745';
      elements.btnPause.style.color = '#fff';
    } else {
      elements.pauseIcon.textContent = '⏸️';
      elements.pauseText.textContent = 'Pause';
      elements.btnPause.style.background = '';
      elements.btnPause.style.color = '';
    }
  }
}

// Setup event listeners
function setupEventListeners() {
  // Toggle switches
  elements.toggleRegex?.addEventListener('click', () => toggleSetting('regexEnabled'));
  elements.toggleAI?.addEventListener('click', () => toggleSetting('aiEnabled'));
  elements.toggleFake?.addEventListener('click', () => toggleSetting('useFakeData'));
  
  // Sensitivity buttons
  elements.sensitivityBtns?.forEach(btn => {
    btn.addEventListener('click', () => setSensitivity(btn.dataset.level));
  });
  
  // Action buttons
  elements.btnPause?.addEventListener('click', togglePause);
  elements.btnOptions?.addEventListener('click', openOptions);
  elements.btnTrust?.addEventListener('click', trustCurrentSite);
  elements.btnClear?.addEventListener('click', clearHistory);
  
  // Footer links
  elements.linkHelp?.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://github.com/aegis-extension/docs' });
  });
  elements.linkReport?.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://github.com/aegis-extension/issues' });
  });
}

// Toggle a boolean setting
function toggleSetting(key) {
  settings[key] = !settings[key];
  saveSettings();
  renderUI();
  showToast(`${key.replace(/([A-Z])/g, ' $1').trim()} ${settings[key] ? 'Enabled' : 'Disabled'}`);
  
  // Notify content scripts
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'SETTINGS_UPDATED', settings });
    }
  });
}

// Set sensitivity level
function setSensitivity(level) {
  settings.sensitivity = level;
  saveSettings();
  renderUI();
  showToast(`Sensitivity: ${level.charAt(0).toUpperCase() + level.slice(1)}`);
  
  // Notify content scripts
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'SETTINGS_UPDATED', settings });
    }
  });
}

// Save settings to storage
function saveSettings() {
  chrome.storage.sync.set({ settings });
}

// Toggle pause state
function togglePause() {
  isPaused = !isPaused;
  
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, { 
        type: isPaused ? 'PAUSE_AEGIS' : 'RESUME_AEGIS',
        duration: isPaused ? 0 : 0
      });
    }
  });
  
  renderUI();
  showToast(isPaused ? 'AEGIS Paused' : 'AEGIS Resumed');
}

// Open options page
function openOptions() {
  chrome.runtime.openOptionsPage();
}

// Trust current site
function trustCurrentSite() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]?.url) return;
    
    try {
      const url = new URL(tabs[0].url);
      const host = url.hostname;
      
      chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, (response) => {
        const currentSettings = response?.settings || {};
        const trustedSites = currentSettings.trustedSites || [];
        
        if (!trustedSites.includes(host)) {
          trustedSites.push(host);
          chrome.runtime.sendMessage({ 
            type: 'SAVE_TRUSTED_SITES', 
            sites: trustedSites 
          }, () => {
            showToast(`Trusted: ${host}`);
          });
        } else {
          showToast('Site already trusted');
        }
      });
    } catch (e) {
      showToast('Cannot trust this page');
    }
  });
}

// Clear history
function clearHistory() {
  if (confirm('Are you sure you want to clear all protection history?')) {
    chrome.storage.local.remove(['aegis_history', 'aegis_summary'], () => {
      historySummary = { allTime: 0, today: 0, sites: 0 };
      renderUI();
      showToast('History cleared');
    });
  }
}

// Show toast notification
function showToast(message) {
  if (!elements.toast) return;
  elements.toast.textContent = message;
  elements.toast.classList.add('show');
  setTimeout(() => elements.toast.classList.remove('show'), 2000);
}
