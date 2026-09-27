document.addEventListener('DOMContentLoaded', () => {
  const toggles = ['toggleTheme', 'toggleRegex', 'toggleFakeData'];
  const langSelect = document.getElementById('selectLanguage');
  const sensitivitySelect = document.getElementById('selectSensitivity');
  const customInput = document.getElementById('customPatternsInput');
  const trustedInput = document.getElementById('trustedSitesInput');

  chrome.storage.sync.get(['settings', 'manualLanguage', 'theme'], (result) => {
    const s = result.settings || {};
    const theme = result.theme || s.theme;
    if (theme === 'dark') { document.body.classList.add('dark'); document.getElementById('toggleTheme').classList.add('active'); }
    if (s.regexEnabled !== false) document.getElementById('toggleRegex').classList.add('active');
    if (s.useFakeData !== false) document.getElementById('toggleFakeData').classList.add('active');
    if (langSelect) langSelect.value = result.manualLanguage || 'auto';
    if (sensitivitySelect) sensitivitySelect.value = s.sensitivity || 'medium';
    if (customInput && s.customPatterns) customInput.value = s.customPatterns;
    if (trustedInput && s.trustedSites) trustedInput.value = s.trustedSites.join('\n');
  });

  toggles.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', () => {
      el.classList.toggle('active');
      const isActive = el.classList.contains('active');
      chrome.storage.sync.get(['settings'], (result) => {
        const s = result.settings || {};
        if (id === 'toggleTheme') { s.theme = isActive ? 'dark' : 'light'; if (isActive) document.body.classList.add('dark'); else document.body.classList.remove('dark'); chrome.storage.sync.set({ theme: s.theme }); }
        if (id === 'toggleRegex') s.regexEnabled = isActive;
        if (id === 'toggleFakeData') s.useFakeData = isActive;
        chrome.storage.sync.set({ settings: s });
      });
    });
  });

  if (langSelect) langSelect.addEventListener('change', (e) => chrome.storage.sync.set({ manualLanguage: e.target.value }));
  if (sensitivitySelect) sensitivitySelect.addEventListener('change', () => {
    chrome.storage.sync.get(['settings'], (result) => {
      const s = result.settings || {};
      s.sensitivity = sensitivitySelect.value;
      chrome.storage.sync.set({ settings: s });
    });
  });

  document.getElementById('saveCustomPatternsBtn').addEventListener('click', () => {
    chrome.storage.sync.get(['settings'], (result) => {
      const s = result.settings || {};
      s.customPatterns = customInput.value;
      chrome.storage.sync.set({ settings: s }, () => {
        const btn = document.getElementById('saveCustomPatternsBtn');
        btn.textContent = 'Saved! ✅';
        setTimeout(() => btn.textContent = 'Save', 2000);
      });
    });
  });

  document.getElementById('saveTrustedSitesBtn').addEventListener('click', () => {
    const sites = trustedInput.value.split(/[\n,]+/).map(s => s.trim().toLowerCase()).filter(s => s.length > 0);
    chrome.storage.sync.get(['settings'], (result) => {
      const s = result.settings || {};
      s.trustedSites = sites;
      chrome.storage.sync.set({ settings: s }, () => {
        const btn = document.getElementById('saveTrustedSitesBtn');
        btn.textContent = 'Saved! ✅';
        setTimeout(() => btn.textContent = 'Save', 2000);
      });
    });
  });
});


// ==========================================
// OLLAMA STATUS CHECK
// ==========================================
const ollamaStatus = document.getElementById('ollamaStatus');

function checkOllamaStatus() {
  fetch('http://localhost:11434/api/tags', { method: 'GET' })
    .then(response => {
      if (response.ok) {
        ollamaStatus.textContent = '🟢 Active';
        ollamaStatus.style.background = '#d4edda';
        ollamaStatus.style.color = '#155724';
      } else {
        ollamaStatus.textContent = '⚪ Disabled';
        ollamaStatus.style.background = '#f8f9fa';
        ollamaStatus.style.color = '#666';
      }
    })
    .catch(() => {
      ollamaStatus.textContent = '⚪ Disabled';
      ollamaStatus.style.background = '#f8f9fa';
      ollamaStatus.style.color = '#666';
    });
}

if (ollamaStatus) {
  checkOllamaStatus();
  setInterval(checkOllamaStatus, 5000); // Check every 5 seconds
}


// ==========================================
// LIVE UPDATE: Refresh textarea when trusted sites change
// ==========================================
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.settings) {
    const newSettings = changes.settings.newValue || {};
    const trustedInput = document.getElementById('trustedSitesInput');
    if (trustedInput && newSettings.trustedSites) {
      trustedInput.value = newSettings.trustedSites.join('\n');
      
      // Show a brief visual confirmation
      const btn = document.getElementById('saveTrustedSitesBtn');
      if (btn) {
        const originalText = btn.textContent;
        btn.textContent = '✅ Site added!';
        btn.style.background = '#28a745';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
        }, 2000);
      }
    }
  }
});
