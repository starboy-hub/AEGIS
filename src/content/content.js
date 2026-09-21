// AEGIS v6.0 - Enterprise Build with Global Dark Mode
(function() {
  'use strict';

  // --- Configuration & State ---
  let CONFIG = {
    theme: 'light',
    sensitivity: 'medium',
    ollamaEnabled: true,
    language: 'en'
  };

  // --- Global Style Injection (The Fix) ---
  function injectGlobalStyles() {
    const styleId = 'aegis-global-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      :root[data-theme="dark"] {
        --aegis-bg: #2d2d2d;
        --aegis-text: #ffffff;
        --aegis-border: #444444;
        --aegis-highlight: #ff4444;
        --aegis-protected: #44ff44;
        --aegis-tooltip-bg: #2d2d2d;
        --aegis-tooltip-text: #ffffff;
      }
      :root[data-theme="light"] {
        --aegis-bg: #ffffff;
        --aegis-text: #000000;
        --aegis-border: #cccccc;
        --aegis-highlight: #ff0000;
        --aegis-protected: #00aa00;
        --aegis-tooltip-bg: #ffffff;
        --aegis-tooltip-text: #000000;
      }
      .aegis-tooltip {
        background-color: var(--aegis-tooltip-bg) !important;
        color: var(--aegis-tooltip-text) !important;
        border: 1px solid var(--aegis-border) !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        z-index: 2147483647 !important;
        padding: 8px 12px !important;
        border-radius: 6px !important;
        font-size: 13px !important;
        position: absolute !important;
        pointer-events: auto !important;
        transition: all 0.2s ease !important;
      }
      .aegis-highlight {
        background-color: rgba(255, 0, 0, 0.2) !important;
        border-bottom: 2px solid var(--aegis-highlight) !important;
        cursor: pointer !important;
      }
      .aegis-protected {
        background-color: rgba(0, 255, 0, 0.2) !important;
        border-bottom: 2px solid var(--aegis-protected) !important;
        color: #006400 !important;
      }
    `;
    document.documentElement.appendChild(style);
    
    // Apply current theme immediately
    const currentTheme = CONFIG.theme || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
  }

  // --- Core Logic ---
  function loadConfig() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['theme', 'sensitivity', 'ollamaEnabled', 'language'], (result) => {
        CONFIG = { ...CONFIG, ...result };
        resolve(CONFIG);
      });
    });
  }

  function updateTheme() {
    const theme = CONFIG.theme || 'light';
    document.documentElement.setAttribute('data-theme', theme);
  }

  async function init() {
    console.log('🛡️ AEGIS v6.0: Enterprise Build Loaded');
    injectGlobalStyles();
    await loadConfig();
    updateTheme();
    
    // Listen for config changes (e.g., theme toggle)
    chrome.storage.onChanged((changes, namespace) => {
      if (namespace === 'local' && changes.theme) {
        CONFIG.theme = changes.theme.newValue;
        updateTheme();
        console.log(`🛡️ AEGIS: Theme updated to ${CONFIG.theme}`);
      }
    });

    console.log(`🛡️ AEGIS: Language = ${CONFIG.language} | Theme = ${CONFIG.theme}`);
    console.log(`🛡️ AEGIS: Ollama = ${CONFIG.ollamaEnabled}`);
  }

  // Start
  init();
})();
