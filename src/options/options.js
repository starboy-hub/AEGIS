document.addEventListener('DOMContentLoaded', () => {
  const toggles = ['toggleTheme', 'toggleRegex', 'toggleFakeData', 'toggleVaultRestore'];
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
    if (s.vaultRestore !== false) document.getElementById('toggleVaultRestore').classList.add('active');
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
        if (id === 'toggleVaultRestore') s.vaultRestore = isActive;
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

  // ==========================================
  // IDENTITY VAULT
  // ==========================================
  function refreshVaultList() {
    chrome.runtime.sendMessage({ type: 'VAULT_LIST' }, (res) => {
      const list = document.getElementById('vaultList');
      if (!list) return;
      const entries = (res && res.entries) || [];
      if (!entries.length) {
        list.innerHTML = '<div class="vault-empty">Vault is empty — add your details above and AEGIS will consistently pseudonymize them.</div>';
        return;
      }
      list.innerHTML = '';
      entries.forEach(e => {
        const row = document.createElement('div');
        row.className = 'vault-item';
        const label = document.createElement('span');
        const kindSpan = document.createElement('span');
        kindSpan.className = 'kind';
        kindSpan.textContent = e.kind;
        label.appendChild(kindSpan);
        label.appendChild(document.createTextNode(AEGIS.maskSensitive(e.value)));
        const remove = document.createElement('button');
        remove.className = 'vault-remove';
        remove.textContent = '✕';
        remove.title = 'Remove from vault';
        remove.addEventListener('click', () => {
          chrome.runtime.sendMessage({ type: 'VAULT_REMOVE', id: e.id }, () => refreshVaultList());
        });
        row.appendChild(label);
        row.appendChild(remove);
        list.appendChild(row);
      });
    });
  }

  document.getElementById('saveVaultBtn').addEventListener('click', () => {
    const adds = [];
    const name = document.getElementById('vaultNameInput').value.trim();
    const email = document.getElementById('vaultEmailInput').value.trim();
    const phone = document.getElementById('vaultPhoneInput').value.trim();
    if (name) adds.push({ kind: 'name', value: name });
    if (email) adds.push({ kind: 'email', value: email });
    if (phone) adds.push({ kind: 'phone', value: phone });
    document.getElementById('vaultCustomInput').value.split('\n').forEach(line => {
      const v = line.trim();
      if (v) adds.push({ kind: 'custom', value: v });
    });
    if (!adds.length) return;
    let pending = adds.length;
    adds.forEach(a => {
      chrome.runtime.sendMessage({ type: 'VAULT_ADD', ...a }, () => {
        if (--pending === 0) {
          ['vaultNameInput', 'vaultEmailInput', 'vaultPhoneInput', 'vaultCustomInput'].forEach(id => { document.getElementById(id).value = ''; });
          const btn = document.getElementById('saveVaultBtn');
          btn.textContent = 'In the Vault! 🔐';
          setTimeout(() => btn.textContent = '🔐 Save to Vault', 2000);
          refreshVaultList();
        }
      });
    });
  });

  refreshVaultList();
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
