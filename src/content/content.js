// 🛡️ AEGIS v6.0 - Fixed Storage Issue
(function() {
  'use strict';
  let currentTheme = 'light';

  function injectGlobalStyles() {
    if (document.getElementById('aegis-global-styles')) return;
    const style = document.createElement('style');
    style.id = 'aegis-global-styles';
    style.textContent = `
      :root[data-theme="dark"] { --aegis-bg:#2d2d2d; --aegis-text:#fff; --aegis-border:#555; --aegis-btn-bg:#4a90e2; --aegis-btn-text:#fff; }
      :root[data-theme="light"] { --aegis-bg:#fff; --aegis-text:#000; --aegis-border:#d1d1d1; --aegis-btn-bg:#007aff; --aegis-btn-text:#fff; }
      .aegis-tooltip { position:absolute; z-index:2147483647; background:var(--aegis-bg); color:var(--aegis-text); border:1px solid var(--aegis-border); padding:10px; border-radius:8px; font-family:sans-serif; font-size:13px; box-shadow:0 4px 12px rgba(0,0,0,0.2); display:flex; flex-direction:column; gap:8px; pointer-events:auto; }
      .aegis-tooltip button { background:var(--aegis-btn-bg); color:var(--aegis-btn-text); border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:12px; align-self:flex-start; }
      .aegis-highlight-sensitive { background-color:rgba(255,0,0,0.2); }
      .aegis-highlight-protected { background-color:rgba(0,255,0,0.2); color:green; }
    `;
    document.documentElement.appendChild(style);
  }

  async function init() {
    try {
      // FIXED: Only get storage, do NOT listen to changes (content scripts can't listen)
      const result = await chrome.storage.local.get(["theme"]);
      currentTheme = result.theme || "light";
      document.documentElement.setAttribute("data-theme", currentTheme);
      console.log(`🛡️ AEGIS: Theme=${currentTheme}`);
      
      injectGlobalStyles();
      attachListeners();
    } catch (e) { console.error("AEGIS Init Error:", e); }
  }

  function attachListeners() {
    document.addEventListener('input', (e) => {
      const t = e.target;
      if (t.tagName !== 'INPUT' && t.tagName !== 'TEXTAREA' && !t.isContentEditable) return;
      clearTimeout(t._aegisTimer);
      t._aegisTimer = setTimeout(() => scan(t), 300);
    }, true);
  }

  let tooltip = null;
  function scan(el) {
    const txt = el.value || el.innerText;
    if (!txt || txt.length < 5) { removeTooltip(); el.classList.remove('aegis-highlight-sensitive'); return; }
    
    const hasEmail = /[^\s@]+@[^\s@]+\.[^\s@]+/.test(txt);
    if (hasEmail) {
      el.classList.add('aegis-highlight-sensitive');
      showTooltip(el, "Email Detected");
    } else {
      removeTooltip(); el.classList.remove('aegis-highlight-sensitive');
    }
  }

  function showTooltip(el, msg) {
    removeTooltip();
    const r = el.getBoundingClientRect();
    tooltip = document.createElement('div');
    tooltip.className = 'aegis-tooltip';
    tooltip.innerHTML = `<strong>⚠️ ${msg}</strong><button id="aegis-protect">🛡️ Protect</button>`;
    tooltip.style.top = (r.bottom + window.scrollY + 5) + 'px';
    tooltip.style.left = (r.left + window.scrollX) + 'px';
    
    tooltip.querySelector('#aegis-protect').onclick = (e) => {
      e.stopPropagation();
      el.value = el.value.replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, "user@example.com");
      el.classList.remove('aegis-highlight-sensitive');
      el.classList.add('aegis-highlight-protected');
      removeTooltip();
    };
    document.body.appendChild(tooltip);
  }

  function removeTooltip() { if (tooltip) { tooltip.remove(); tooltip = null; } }

  init();
})();
