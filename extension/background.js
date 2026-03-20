let port = null;
let pingInterval = null;

function connectNative() {
  if (port) return port;

  port = chrome.runtime.connectNative('com.unc.agent');

  pingInterval = setInterval(() => {
    if (port) {
      try {
        port.postMessage({ type: 'PING' });
      } catch (e) {}
    }
  }, 5000);

  port.onMessage.addListener((msg) => {
    const queryOptions = {
      url: ['*://chatgpt.com/*', '*://gemini.google.com/*'],
    };
    chrome.tabs.query(queryOptions, (tabs) => {
      if (!tabs.length) {
        port.postMessage({
          ok: false,
          error: 'No AI tabs open. Please open ChatGPT or Gemini.',
        });
        return;
      }
      const activeLLMTab = tabs.find((t) => t.active);
      const targetTabId = activeLLMTab ? activeLLMTab.id : tabs[0].id;
      chrome.tabs.sendMessage(
        targetTabId,
        { type: 'PROMPT', prompt: msg.prompt },
        (response) => {
          if (chrome.runtime.lastError) {
            port.postMessage({
              ok: false,
              error: 'Tab connection lost. Please refresh the page.',
            });
            return;
          }
          port.postMessage(response);
        },
      );
    });
  });

  port.onDisconnect.addListener(() => {
    if (chrome.runtime.lastError) {
      console.error('Chrome disconnected:', chrome.runtime.lastError.message);
    }
    clearInterval(pingInterval);
    port = null;
  });

  return port;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'CONNECT_NATIVE') {
    const p = connectNative();
    sendResponse({ ok: !!p });
    return true;
  }
  if (msg.type === 'DISCONNECT_NATIVE') {
    if (port) {
      port.disconnect();
      port = null;
    }
    sendResponse({ ok: true });
    return true;
  }

  if (msg.type === 'GET_STATUS') {
    sendResponse({ connected: !!port });
    return true;
  }
});
