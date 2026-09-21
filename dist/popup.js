// AEGIS Popup Script - v6.0 Enterprise
document.addEventListener('DOMContentLoaded', async () => {
  // Load saved theme
  const themeToggle = document.getElementById('themeToggle');
  const ollamaToggle = document.getElementById('ollamaToggle');
  const sensitivitySelect = document.getElementById('sensitivity');
  
  // Load settings from storage
  try {
    const result = await chrome.storage.local.get(['theme', 'ollamaEnabled', 'sensitivity']);
    themeToggle.checked = result.theme === 'dark';
    ollamaToggle.checked = result.ollamaEnabled !== false;
    sensitivitySelect.value = result.sensitivity || 'medium';
    
    // Apply theme immediately
    if (result.theme === 'dark') {
      document.body.classList.add('dark-mode');
    }
  } catch (e) {
    console.error('Error loading settings:', e);
  }

  // Theme toggle listener
  themeToggle.addEventListener('change', async (e) => {
    const isDark = e.target.checked;
    document.body.classList.toggle('dark-mode', isDark);
    try {
      await chrome.storage.local.set({ theme: isDark ? 'dark' : 'light' });
      // Notify content script about theme change
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        chrome.tabs.sendMessage(tab.id, { action: 'themeChange', theme: isDark ? 'dark' : 'light' });
      }
    } catch (err) {
      console.error('Error saving theme:', err);
    }
  });

  // Ollama toggle listener
  ollamaToggle.addEventListener('change', async (e) => {
    try {
      await chrome.storage.local.set({ ollamaEnabled: e.target.checked });
    } catch (err) {
      console.error('Error saving ollama setting:', err);
    }
  });

  // Sensitivity listener
  sensitivitySelect.addEventListener('change', async (e) => {
    try {
      await chrome.storage.local.set({ sensitivity: e.target.value });
    } catch (err) {
      console.error('Error saving sensitivity:', err);
    }
  });

  // Load stats
  try {
    const stats = await chrome.storage.local.get(['totalProtected', 'todayProtected', 'sitesVisited']);
    document.getElementById('totalProtected').textContent = stats.totalProtected || 0;
    document.getElementById('todayProtected').textContent = stats.todayProtected || 0;
    document.getElementById('sitesVisited').textContent = stats.sitesVisited || 0;
  } catch (e) {
    console.error('Error loading stats:', e);
  }

  // Clear stats button
  document.getElementById('clearStats').addEventListener('click', async () => {
    try {
      await chrome.storage.local.set({ totalProtected: 0, todayProtected: 0, sitesVisited: 0 });
      document.getElementById('totalProtected').textContent = '0';
      document.getElementById('todayProtected').textContent = '0';
      document.getElementById('sitesVisited').textContent = '0';
    } catch (err) {
      console.error('Error clearing stats:', err);
    }
  });

  // Export logs button
  document.getElementById('exportLogs').addEventListener('click', () => {
    alert('Audit logs export feature coming soon in v6.1!');
  });
});