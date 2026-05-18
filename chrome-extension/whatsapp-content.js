const QUEUE_KEY = "wasendpro_whatsapp_queue";
const MAX_ATTEMPTS = 40;
const POLL_MS = 500;

function base64ToFile({ name, mimeType, base64 }) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new File([bytes], name, { type: mimeType });
}

function isImage(mimeType) {
  return mimeType.startsWith("image/");
}

function setFilesOnInput(input, files) {
  const dt = new DataTransfer();
  files.forEach((f) => dt.items.add(f));
  input.files = dt.files;
  input.dispatchEvent(new Event("change", { bubbles: true }));
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

function findFileInputs() {
  return Array.from(document.querySelectorAll('input[type="file"]'));
}

function clickAttachMenu(preferDocument) {
  const clip =
    document.querySelector('[data-icon="clip"]')?.closest("button") ||
    document.querySelector('[data-icon="attach-menu-plus"]')?.closest("button") ||
    document.querySelector('span[data-icon="plus"]')?.closest("button");

  if (clip) {
    clip.click();
    return true;
  }
  return false;
}

function clickMenuItem(labels) {
  const items = document.querySelectorAll('[role="button"], li, div[tabindex="0"]');
  for (const el of items) {
    const text = (el.textContent || "").toLowerCase();
    if (labels.some((l) => text.includes(l))) {
      el.click();
      return true;
    }
  }
  return false;
}

async function attachFiles(files) {
  const images = files.filter((f) => isImage(f.type));
  const documents = files.filter((f) => !isImage(f.type));
  let attached = 0;

  if (images.length > 0) {
    clickAttachMenu(false);
    await sleep(400);
    clickMenuItem(["photos", "photo", "galerie", "gallery"]);
    await sleep(400);
    const inputs = findFileInputs();
    const photoInput =
      inputs.find((i) => (i.accept || "").includes("image")) || inputs[0];
    if (photoInput) {
      setFilesOnInput(photoInput, images);
      attached += images.length;
      await sleep(800);
    }
  }

  if (documents.length > 0) {
    clickAttachMenu(true);
    await sleep(400);
    clickMenuItem(["document", "fichier", "file"]);
    await sleep(400);
    const inputs = findFileInputs();
    const docInput =
      inputs.find((i) => !(i.accept || "").match(/^image/)) ||
      inputs[inputs.length - 1];
    if (docInput) {
      setFilesOnInput(docInput, documents);
      attached += documents.length;
    }
  }

  return attached > 0;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function showBanner(text) {
  let el = document.getElementById("wasendpro-banner");
  if (!el) {
    el = document.createElement("div");
    el.id = "wasendpro-banner";
    el.style.cssText =
      "position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:99999;" +
      "background:#0f2912;color:#4ade80;padding:10px 16px;border-radius:10px;" +
      "font:600 13px system-ui,sans-serif;box-shadow:0 4px 20px #0008;border:1px solid #4ade8044;";
    document.body.appendChild(el);
  }
  el.textContent = text;
}

async function processQueue(payload) {
  const files = payload.attachments.map(base64ToFile);
  showBanner(`BISWasend Pro : ajout de ${files.length} fichier(s)…`);

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const compose =
      document.querySelector('[contenteditable="true"][data-tab="10"]') ||
      document.querySelector('div[contenteditable="true"][role="textbox"]');
    if (compose) {
      const ok = await attachFiles(files);
      showBanner(
        ok
          ? "BISWasend Pro : pièces jointes ajoutées — vérifiez puis envoyez."
          : "BISWasend Pro : ouvrez le trombone 📎 pour joindre les fichiers manuellement."
      );
      setTimeout(() => {
        const b = document.getElementById("wasendpro-banner");
        if (b) b.remove();
      }, 8000);
      return;
    }
    await sleep(POLL_MS);
  }

  showBanner("BISWasend Pro : conversation non prête — réessayez après chargement.");
}

chrome.storage.local.get(QUEUE_KEY, (result) => {
  const payload = result[QUEUE_KEY];
  if (payload?.attachments?.length) {
    chrome.storage.local.remove(QUEUE_KEY);
    processQueue(payload);
  }
});
