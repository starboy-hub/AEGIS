// AEGIS Popup — guardian dashboard
// State-first UI: site status, protection layers, stats, recent activity.
// All settings live in chrome.storage.sync under AEGIS.KEYS.SETTINGS; stats
// and history come from the same keys the content script writes.
document.addEventListener('DOMContentLoaded', async () => {
  const $ = (id) => document.getElementById(id);

  // Version from the manifest — the UI can never show a stale version again
  $('versionText').textContent = 'v' + chrome.runtime.getManifest().version;

  async function updateSettings(patch) {
    try {
      const stored = await chrome.storage.sync.get(AEGIS.KEYS.SETTINGS);
      const merged = Object.assign(AEGIS.mergeSettings(stored[AEGIS.KEYS.SETTINGS]), patch);
      await chrome.storage.sync.set({ [AEGIS.KEYS.SETTINGS]: merged });
      return merged;
    } catch (err) {
      console.error('AEGIS popup: error saving settings:', err);
      return null;
    }
  }

  // ---- Load state ----
  let settings;
  try {
    const synced = await chrome.storage.sync.get([AEGIS.KEYS.THEME, AEGIS.KEYS.SETTINGS]);
    settings = AEGIS.mergeSettings(synced[AEGIS.KEYS.SETTINGS]);
    const theme = synced[AEGIS.KEYS.THEME] || settings.theme;
    $('themeToggle').checked = theme === 'dark';
    if (theme === 'dark') document.body.classList.add('dark-mode');

    $('shieldToggle').checked = settings.regexEnabled !== false;
    $('sentinelToggle').checked = settings.sentinelEnabled !== false;
    $('firewallToggle').checked = settings.injectionFirewall !== false;
    $('ollamaToggle').checked = settings.aiEnabled !== false;
    $('familyToggle').checked = !!settings.familyMode;
    $('sensitivity').value = settings.sensitivity || 'medium';
    $('familyBadge').hidden = !settings.familyMode;
  } catch (e) {
    console.error('AEGIS popup: error loading settings:', e);
  }

  // ---- Site status pill ----
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url && /^https?:/.test(tab.url)) {
      const host = new URL(tab.url).hostname.toLowerCase();
      const trusted = (settings.trustedSites || []).some(t => host === t || host.endsWith('.' + t));
      if (trusted) {
        $('statusPill').classList.add('trusted');
        $('statusText').textContent = 'Trusted site — paused here';
      } else {
        $('statusText').textContent = 'Active on this site';
      }
    } else {
      $('statusText').textContent = 'Standby';
    }
  } catch (e) { /* non-tab context */ }

  // ---- Controls ----
  $('themeToggle').addEventListener('change', async (e) => {
    const isDark = e.target.checked;
    document.body.classList.toggle('dark-mode', isDark);
    try { await chrome.storage.sync.set({ [AEGIS.KEYS.THEME]: isDark ? 'dark' : 'light' }); } catch (err) { console.error(err); }
  });

  $('openOptions').addEventListener('click', () => {
    try { chrome.runtime.sendMessage({ type: 'OPEN_OPTIONS' }); } catch (e) { chrome.runtime.openOptionsPage(); }
  });

  $('shieldToggle').addEventListener('change', (e) => updateSettings({ regexEnabled: e.target.checked }));
  $('sentinelToggle').addEventListener('change', (e) => updateSettings({ sentinelEnabled: e.target.checked }));
  $('firewallToggle').addEventListener('change', (e) => updateSettings({ injectionFirewall: e.target.checked }));
  $('ollamaToggle').addEventListener('change', (e) => updateSettings({ aiEnabled: e.target.checked }));

  $('familyToggle').addEventListener('change', async (e) => {
    const on = e.target.checked;
    $('familyBadge').hidden = !on;
    if (on) {
      // Family mode arms every layer
      settings = await updateSettings({ familyMode: true, sentinelEnabled: true, injectionFirewall: true, vaultRestore: true }) || settings;
      $('sentinelToggle').checked = true;
      $('firewallToggle').checked = true;
    } else {
      await updateSettings({ familyMode: false });
    }
  });

  $('sensitivity').addEventListener('change', (e) => updateSettings({ sensitivity: e.target.value }));

  // ---- Stats + recent activity (same keys the content script writes) ----
  const TYPE_COLORS = { SENTINEL: '#f59e0b', INJECTION: '#8b5cf6', 'Vault Name': '#667eea', 'Vault Email': '#667eea', 'Vault Phone': '#667eea' };

  async function renderStats() {
    try {
      const local = await chrome.storage.local.get([AEGIS.KEYS.HISTORY, AEGIS.KEYS.HISTORY_SUMMARY]);
      const stats = AEGIS.statsFromHistory(local[AEGIS.KEYS.HISTORY], local[AEGIS.KEYS.HISTORY_SUMMARY]);
      $('totalProtected').textContent = stats.totalProtected;
      $('todayProtected').textContent = stats.todayProtected;
      $('sitesVisited').textContent = stats.sitesVisited;

      const history = (local[AEGIS.KEYS.HISTORY] || []).slice(-3).reverse();
      const el = $('recentActivity');
      if (!history.length) {
        el.innerHTML = '<div class="activity-empty">Nothing yet — your protections will appear here</div>';
      } else {
        el.innerHTML = '';
        history.forEach(h => {
          const row = document.createElement('div');
          row.className = 'activity-item';
          const dot = document.createElement('span');
          dot.className = 'activity-dot';
          dot.style.background = TYPE_COLORS[h.type] || '#10b981';
          const type = document.createElement('span');
          type.className = 'activity-type';
          type.textContent = h.type;
          const site = document.createElement('span');
          site.className = 'activity-site';
          site.textContent = h.site || '';
          const time = document.createElement('span');
          time.className = 'activity-time';
          try { time.textContent = new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch (err) { time.textContent = ''; }
          row.appendChild(dot); row.appendChild(type); row.appendChild(site); row.appendChild(time);
          el.appendChild(row);
        });
      }
    } catch (e) {
      console.error('AEGIS popup: error loading stats:', e);
    }
  }
  await renderStats();

  $('clearStats').addEventListener('click', async () => {
    try {
      await chrome.storage.local.set({
        [AEGIS.KEYS.HISTORY]: [],
        [AEGIS.KEYS.HISTORY_SUMMARY]: { allTime: 0, lastUpdated: new Date().toISOString() }
      });
      await renderStats();
    } catch (err) {
      console.error('AEGIS popup: error clearing stats:', err);
    }
  });

  // ---- Audit-log export (originals masked — an audit file must never
  // leak the secrets it helped protect) ----
  $('exportLogs').addEventListener('click', async () => {
    try {
      const local = await chrome.storage.local.get([AEGIS.KEYS.HISTORY, AEGIS.KEYS.HISTORY_SUMMARY]);
      const history = local[AEGIS.KEYS.HISTORY] || [];
      const payload = {
        exported: new Date().toISOString(),
        summary: local[AEGIS.KEYS.HISTORY_SUMMARY] || { allTime: 0 },
        items: history.map(h => ({
          timestamp: h.timestamp,
          type: h.type,
          site: h.site,
          original: AEGIS.maskSensitive(h.original),
          fake: h.fake
        }))
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aegis-audit-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('AEGIS popup: export failed:', err);
    }
  });
});
