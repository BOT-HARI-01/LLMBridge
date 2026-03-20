const connectBtn = document.getElementById('connect');
const stopBtn = document.getElementById('stop');
const statusText = document.getElementById('status-text');

function updateUI(isConnected) {
  statusText.innerText = `Status: ${isConnected ? 'Connected' : 'Disconnected'}`;
  connectBtn.disabled = isConnected;
  stopBtn.disabled = !isConnected;
}

chrome.runtime.sendMessage({ type: 'GET_STATUS' }, (res) => {
  updateUI(res?.connected);
});

connectBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'CONNECT_NATIVE' }, (res) => {
    updateUI(res?.ok);
  });
});

stopBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'DISCONNECT_NATIVE' }, (res) => {
    updateUI(false);
  });
});