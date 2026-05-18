const STORAGE_KEY = "wasendpro_pending_import";
const EVENT_NAME = "wasendpro:import-excel";

function dispatchImport(payload) {
  window.dispatchEvent(
    new CustomEvent(EVENT_NAME, { detail: payload })
  );
}

function flushPending() {
  chrome.storage.local.get(STORAGE_KEY, (result) => {
    const data = result[STORAGE_KEY];
    if (!data) return;
    dispatchImport(data);
    chrome.storage.local.remove(STORAGE_KEY);
  });
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "WASENDPRO_IMPORT" && message.payload) {
    dispatchImport(message.payload);
    chrome.storage.local.remove(STORAGE_KEY);
    sendResponse({ ok: true });
  }
  return true;
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", flushPending);
} else {
  flushPending();
}
