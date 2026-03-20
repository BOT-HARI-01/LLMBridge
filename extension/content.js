const IS_GEMINI = window.location.hostname.includes('gemini.google.com');

const CONFIG = IS_GEMINI ? {
  inputSelector: '.ql-editor.textarea.new-input-ui',
  sendButtonSelector: 'button.send-button',
  responseSelector: 'structured-content-container.model-response-text',
  // thinkingSelector: 'button[data-test-id="thoughts-header-button"]'
} : {
  inputSelector: '#prompt-textarea',
  sendButtonSelector: 'button[data-testid="send-button"]',
  responseSelector: '[data-message-author-role="assistant"]'
};

function setInputText(el, text) {
  if (IS_GEMINI) {
    while (el.firstChild) el.removeChild(el.firstChild);
    el.appendChild(document.createTextNode(text));
    el.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true, inputType: 'insertText', data: text }));
  } else {
    el.innerHTML = `<p>${text}</p>`;
    el.dispatchEvent(new InputEvent('input', { data: text, bubbles: true, cancelable: true, composed: true }));
  }
}

async function waitForStableResponse() {
  let lastText = '';
  let stableCount = 0;

  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 1000));
    
    // if (IS_GEMINI && CONFIG.thinkingSelector) {
    //   document.querySelectorAll(CONFIG.thinkingSelector).forEach(btn => btn.click());
    // }

    const msgs = document.querySelectorAll(CONFIG.responseSelector);
    const last = msgs[msgs.length - 1];
    if (!last) continue;

    const text = last.innerText.trim();
    if (!text) continue;

    if (text === lastText) {
      stableCount++;
    } else {
      stableCount = 0;
      lastText = text;
    }

    if (stableCount >= 2) return text;
  }
  return lastText;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'PROMPT') {
    (async () => {
      const input = document.querySelector(CONFIG.inputSelector);
      if (!input) return sendResponse({ ok: false, error: 'Input box not found' });

      input.focus();
      setInputText(input, msg.prompt);
      
      await new Promise(r => setTimeout(r, 500));
      const btn = document.querySelector(CONFIG.sendButtonSelector);
      if (btn) btn.click();

      try {
        const res = await waitForStableResponse();
        sendResponse({ ok: true, data: res });
      } catch (err) {
        sendResponse({ ok: false, error: err.message });
      }
    })();
    return true;
  }
});