document.addEventListener('DOMContentLoaded', async () => {
  const enabledToggle = document.getElementById('enabledToggle');
  const regexToggle = document.getElementById('regexToggle');
  const aiToggle = document.getElementById('aiToggle');
  const blockCount = document.getElementById('blockCount');
  const statusMsg = document.getElementById('statusMsg');
  const optionsBtn = document.getElementById('optionsBtn');

  // Load settings
  try {
    const res = await chrome.runtime.sendMessage({ action: 'getSettings' });
    if (res && res.settings) {
      enabledToggle.checked = res.settings.enabled !== false;
      regexToggle.checked = res.settings.regexEnabled !== false;
      aiToggle.checked = res.settings.aiEnabled === true;
      blockCount.textContent = res.settings.blockCount || 0;
    }
  } catch (e) {
    console.error('Error loading settings:', e);
    statusMsg.textContent = 'Error loading settings';
    statusMsg.style.color = 'var(--danger)';
  }

  // Save settings helper
  const saveSetting = async (key, value) => {
    try {
      await chrome.runtime.sendMessage({ action: 'updateSetting', key, value });
      statusMsg.textContent = 'Saved!';
      setTimeout(() => statusMsg.textContent = '', 1500);
    } catch (e) {
      console.error('Error saving:', e);
    }
  };

  enabledToggle.addEventListener('change', (e) => saveSetting('enabled', e.target.checked));
  regexToggle.addEventListener('change', (e) => saveSetting('regexEnabled', e.target.checked));
  aiToggle.addEventListener('change', (e) => saveSetting('aiEnabled', e.target.checked));

  optionsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
});
