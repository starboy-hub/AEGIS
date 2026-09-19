// Monitor all text inputs and textareas
function monitorInputs() {
  const inputs = document.querySelectorAll('input[type="text"], textarea, [contenteditable="true"]');
  
  inputs.forEach(input => {
    // Remove existing listeners to avoid duplicates
    input.removeEventListener('input', handleInput);
    input.removeEventListener('paste', handlePaste);
    
    // Add listeners
    input.addEventListener('input', handleInput);
    input.addEventListener('paste', handlePaste);
  });
}

function handleInput(event) {
  const text = event.target.value;
  checkForPII(text, event.target);
}

function handlePaste(event) {
  setTimeout(() => {
    const text = event.target.value;
    checkForPII(text, event.target);
  }, 100);
}

async function checkForPII(text, element) {
  if (text.length < 10) return; // Skip very short text
  
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'CHECK_PII',
      text: text
    });
    
    if (response.hasPII) {
      showWarning(element, response.types);
    } else {
      hideWarning(element);
    }
  } catch (error) {
    console.error('PII check failed:', error);
  }
}

function showWarning(element, types) {
  // Remove existing warning
  hideWarning(element);
  
  // Create warning badge
  const warning = document.createElement('div');
  warning.className = 'aegis-warning';
  warning.style.cssText = `
    position: absolute;
    top: -35px;
    right: 0;
    background: #ff4444;
    color: white;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: bold;
    z-index: 999999;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  warning.innerHTML = `⚠️ AEGIS: Sensitive data detected (${types.join(', ')})`;
  
  // Position relative to input
  const parent = element.parentNode;
  if (parent.style.position === '') {
    parent.style.position = 'relative';
  }
  parent.appendChild(warning);
}

function hideWarning(element) {
  const parent = element.parentNode;
  const existing = parent.querySelector('.aegis-warning');
  if (existing) existing.remove();
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', monitorInputs);
} else {
  monitorInputs();
}

// Also monitor dynamically added inputs (for single-page apps like ChatGPT)
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length) {
      monitorInputs();
    }
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});