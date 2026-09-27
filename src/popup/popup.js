// AEGIS Popup — v6.0
// All settings live in chrome.storage.sync under AEGIS.KEYS.SETTINGS;
// theme lives under AEGIS.KEYS.THEME so content scripts pick it up live
// via storage.onChanged. Stats come from the same history keys the
// content script's HistoryStore writes — no more parallel storage.
document.addEventListener('DOMContentLoaded', async () => {
  const themeToggle = document.getElementById('themeToggle');
  const ollamaToggle = document.getElementById('ollamaToggle');
  const sensitivitySelect = document.getElementById('sensitivity');

  async function updateSettings(patch) {
    try {
      const stored = await chrome.storage.sync.get(AEGIS.KEYS.SETTINGS);
      const merged = Object.assign(AEGIS.mergeSettings(stored[AEGIS.KEYS.SETTINGS]), patch);
      await chrome.storage.sync.set({ [AEGIS.KEYS.SETTINGS]: merged });
    } catch (err) {
      console.error('AEGIS popup: error saving settings:', err);
    }
  }

  // Load current state
  try {
    const synced = await chrome.storage.sync.get([AEGIS.KEYS.THEME, AEGIS.KEYS.SETTINGS]);
    const settings = AEGIS.mergeSettings(synced[AEGIS.KEYS.SETTINGS]);
    const theme = synced[AEGIS.KEYS.THEME] || settings.theme;
    themeToggle.checked = theme === 'dark';
    ollamaToggle.checked = settings.aiEnabled !== false;
    sensitivitySelect.value = settings.sensitivity || 'medium';
    if (theme === 'dark') document.body.classList.add('dark-mode');
  } catch (e) {
    console.error('AEGIS popup: error loading settings:', e);
  }

  // Theme: the content scripts watch storage.onChanged on this key and
  // restyle themselves — no per-tab messaging needed.
  themeToggle.addEventListener('change', async (e) => {
    const isDark = e.target.checked;
    document.body.classList.toggle('dark-mode', isDark);
    try {
      await chrome.storage.sync.set({ [AEGIS.KEYS.THEME]: isDark ? 'dark' : 'light' });
    } catch (err) {
      console.error('AEGIS popup: error saving theme:', err);
    }
  });

  // Ollama AI Detection toggle -> settings.aiEnabled
  ollamaToggle.addEventListener('change', (e) => updateSettings({ aiEnabled: e.target.checked }));

  // Sensitivity -> settings.sensitivity (read by the content script via GET_SETTINGS)
  sensitivitySelect.addEventListener('change', (e) => updateSettings({ sensitivity: e.target.value }));

  // Dashboard stats — same keys the content script writes
  async function renderStats() {
    try {
      const local = await chrome.storage.local.get([AEGIS.KEYS.HISTORY, AEGIS.KEYS.HISTORY_SUMMARY]);
      const stats = AEGIS.statsFromHistory(local[AEGIS.KEYS.HISTORY], local[AEGIS.KEYS.HISTORY_SUMMARY]);
      document.getElementById('totalProtected').textContent = stats.totalProtected;
      document.getElementById('todayProtected').textContent = stats.todayProtected;
      document.getElementById('sitesVisited').textContent = stats.sitesVisited;
    } catch (e) {
      console.error('AEGIS popup: error loading stats:', e);
    }
  }
  await renderStats();

  document.getElementById('clearStats').addEventListener('click', async () => {
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

  document.getElementById('exportLogs').addEventListener('click', () => {
    alert('Audit logs export feature coming soon in v6.1!');
  });
});
