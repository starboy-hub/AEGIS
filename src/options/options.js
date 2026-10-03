document.addEventListener('DOMContentLoaded', () => {
  const toggles = ['toggleTheme', 'toggleRegex', 'toggleFakeData', 'toggleVaultRestore', 'toggleFamilyMode', 'toggleWebGPU'];
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
    if (s.webgpuAI) document.getElementById('toggleWebGPU').classList.add('active');
    if (s.familyMode) document.getElementById('toggleFamilyMode').classList.add('active');
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
        if (id === 'toggleFamilyMode') {
          s.familyMode = isActive;
          if (isActive) { s.sentinelEnabled = true; s.injectionFirewall = true; s.vaultRestore = true; }
        }
        if (id === 'toggleWebGPU') {
          s.webgpuAI = isActive;
          if (isActive) chrome.runtime.sendMessage({ type: 'WEBGPU_WARMUP' });
        }
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
        list.replaceChildren();
        const empty = document.createElement('div'); empty.className = 'vault-empty'; empty.textContent = 'Vault is empty — add your details above and AEGIS will consistently pseudonymize them.';
        list.appendChild(empty);
        return;
      }
      list.replaceChildren();
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

  // ==========================================
  // TRUST GRAPH
  // ==========================================
  function refreshTrustedList() {
    chrome.runtime.sendMessage({ type: 'VAULT_CORPUS' }, (res) => {
      const list = document.getElementById('trustedList');
      if (!list) return;
      const trusted = (res && res.trusted) || [];
      if (!trusted.length) {
        list.replaceChildren();
        const empty = document.createElement('div'); empty.className = 'vault-empty'; empty.textContent = 'Trust list is empty — add your bank, employer, and family contacts.';
        list.appendChild(empty);
        return;
      }
      list.replaceChildren();
      trusted.forEach(e => {
        const row = document.createElement('div');
        row.className = 'vault-item';
        const label = document.createElement('span');
        const kindSpan = document.createElement('span');
        kindSpan.className = 'kind';
        kindSpan.textContent = e.kind;
        label.appendChild(kindSpan);
        label.appendChild(document.createTextNode(e.value));
        const remove = document.createElement('button');
        remove.className = 'vault-remove';
        remove.textContent = '✕';
        remove.title = 'Remove';
        remove.addEventListener('click', () => {
          chrome.runtime.sendMessage({ type: 'VAULT_REMOVE_TRUSTED', id: e.id }, () => refreshTrustedList());
        });
        row.appendChild(label);
        row.appendChild(remove);
        list.appendChild(row);
      });
    });
  }

  document.getElementById('saveTrustedEntitiesBtn').addEventListener('click', () => {
    const adds = [];
    document.getElementById('trustedEntitiesInput').value.split('\n').forEach(line => {
      const v = line.trim();
      if (!v) return;
      adds.push({ kind: v.includes('@') ? 'contact' : 'org', value: v });
    });
    if (!adds.length) return;
    let pending = adds.length;
    adds.forEach(a => {
      chrome.runtime.sendMessage({ type: 'VAULT_ADD_TRUSTED', ...a }, () => {
        if (--pending === 0) {
          document.getElementById('trustedEntitiesInput').value = '';
          const btn = document.getElementById('saveTrustedEntitiesBtn');
          btn.textContent = 'Saved! ✅';
          setTimeout(() => btn.textContent = 'Save Trust List', 2000);
          refreshTrustedList();
        }
      });
    });
  });

  // ==========================================
  // SIGN & VERIFY (content provenance)
  // ==========================================
  document.getElementById('signBtn').addEventListener('click', () => {
    const text = document.getElementById('signInput').value;
    if (!text.trim()) return;
    chrome.runtime.sendMessage({ type: 'SIGN_SIGN', text }, (res) => {
      if (res && res.ok) document.getElementById('signOutput').value = res.block;
    });
  });

  document.getElementById('verifyBtn').addEventListener('click', () => {
    const blockText = document.getElementById('verifyInput').value;
    const out = document.getElementById('verifyResult');
    if (!blockText.trim()) { out.textContent = 'Paste a signed block first.'; out.style.color = '#999'; return; }
    chrome.runtime.sendMessage({ type: 'SIGN_VERIFY', blockText }, (res) => {
      if (res && res.valid) {
        out.textContent = '✅ Verified — this exact text was signed on ' + (res.ts || 'unknown date') + ' and has not been modified.';
        out.style.color = '#28a745';
      } else {
        out.textContent = '❌ FAILED verification — the content was tampered with, forged, or the signature is malformed.';
        out.style.color = '#dc3545';
      }
    });
  });

  // ==========================================
  // SWARM DEFENSE (threat signature packs)
  // ==========================================
  function refreshSwarmStatus() {
    chrome.runtime.sendMessage({ type: 'THREAT_COUNT' }, (res) => {
      document.getElementById('swarmStatus').textContent = (res && typeof res.count === 'number') ? res.count + ' signatures' : '';
    });
  }

  document.getElementById('exportPackBtn').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'THREAT_EXPORT' }, (res) => {
      if (!res || !res.pack) return;
      const blob = new Blob([JSON.stringify(res.pack, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aegis-threat-pack-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  });

  document.getElementById('importPackBtn').addEventListener('click', () => {
    document.getElementById('importPackFile').click();
  });

  document.getElementById('importPackFile').addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      let pack;
      try { pack = JSON.parse(reader.result); } catch (err) {
        document.getElementById('swarmStatus').textContent = 'Invalid pack file';
        return;
      }
      chrome.runtime.sendMessage({ type: 'THREAT_IMPORT', pack }, (res) => {
        document.getElementById('swarmStatus').textContent = (res && res.added) ? '+' + res.added + ' signatures imported' : 'No new signatures';
        // ==========================================
  // SWARM RELAY SYNC
  // ==========================================
  chrome.storage.sync.get(['settings'], (res) => {
    const s = res.settings || {};
    if (s.swarmRelayUrl) document.getElementById('relayUrlInput').value = s.swarmRelayUrl;
  });

  document.getElementById('syncRelayBtn').addEventListener('click', () => {
    const out = document.getElementById('syncResult');
    const url = document.getElementById('relayUrlInput').value.trim();
    if (!url) { out.textContent = 'Enter a relay URL first.'; out.style.color = '#999'; return; }
    out.textContent = 'Syncing…';
    chrome.storage.sync.get(['settings'], (res) => {
      const s = res.settings || {};
      s.swarmRelayUrl = url;
      chrome.storage.sync.set({ settings: s }, () => {
        chrome.runtime.sendMessage({ type: 'SWARM_SYNC' }, (r) => {
          if (r && r.ok) {
            out.textContent = '🐝 Synced — +' + (r.added || 0) + ' signatures (' + r.total + ' total)';
            out.style.color = '#28a745';
          } else {
            out.textContent = 'Sync failed: ' + ((r && (r.error || r.reason)) || 'relay unreachable');
            out.style.color = '#dc3545';
          }
        });
      });
    });
  });

  refreshSwarmStatus();
      });
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  refreshSwarmStatus();
  refreshTrustedList();
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
        ollamaStatus.textContent = '● Connected';
        ollamaStatus.classList.add('on');
      } else {
        ollamaStatus.textContent = '○ Not running';
        ollamaStatus.classList.remove('on');
      }
    })
    .catch(() => {
      ollamaStatus.textContent = '○ Not running';
      ollamaStatus.classList.remove('on');
    });
}

if (ollamaStatus) {
  checkOllamaStatus();
  setInterval(checkOllamaStatus, 5000); // Check every 5 seconds
}

// ==========================================
// VERSION (from the manifest — never stale)
// ==========================================
try {
  const v = 'v' + chrome.runtime.getManifest().version;
  const header = document.getElementById('versionText');
  const footer = document.getElementById('footerVersion');
  if (header) header.textContent = v;
  if (footer) footer.textContent = v;
} catch (e) {}


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

// ==========================================
// B2B SIEM Telemetry Export
// ==========================================
const exportSiemBtn = document.getElementById('exportSiemBtn');
if (exportSiemBtn) {
  exportSiemBtn.addEventListener('click', () => {
    chrome.storage.local.get(['history'], (res) => {
      const history = res.history || [];
      const fmt = (document.getElementById('siemFormatSelect') || {}).value || 'JSON';
      let outputText = '';
      let ext = 'json';
      let mime = 'application/json';

      if (fmt === 'CEF') {
        outputText = AEGIS_SIEM.formatCEF(history);
        ext = 'cef';
        mime = 'text/plain';
      } else if (fmt === 'OCSF') {
        outputText = JSON.stringify(AEGIS_SIEM.formatOCSF(history), null, 2);
        ext = 'json';
      } else {
        outputText = JSON.stringify(AEGIS_SIEM.formatJSON(history), null, 2);
        ext = 'json';
      }

      const blob = new Blob([outputText], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aegis-siem-audit-${fmt.toLowerCase()}-${Date.now()}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    });
  });
}
