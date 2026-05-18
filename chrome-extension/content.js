const STORAGE_KEY = "wasendpro_pending_import";
const WHATSAPP_QUEUE_KEY = "wasendpro_whatsapp_queue";
const EVENT_NAME = "wasendpro:import-excel";
const WHATSAPP_SEND_EVENT = "wasendpro:whatsapp-send";

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

window.addEventListener(WHATSAPP_SEND_EVENT, (e) => {
  const detail = e.detail;
  if (!detail?.attachments?.length) return;
  chrome.storage.local.set({ [WHATSAPP_QUEUE_KEY]: detail });
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", flushPending);
} else {
  flushPending();
}
