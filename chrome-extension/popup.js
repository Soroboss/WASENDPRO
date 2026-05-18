const DASHBOARD_URL = "https://wasendpro.vercel.app/dashboard";
const STORAGE_KEY = "wasendpro_pending_import";

function setStatus(text, type = "") {
  const el = document.getElementById("status");
  el.textContent = text;
  el.className = type;
}

function parseExcelBuffer(buffer) {
  const wb = XLSX.read(buffer, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  if (!raw.length) {
    throw new Error("Fichier vide");
  }

  const headers = Object.keys(raw[0]).map((h) => String(h).trim());
  const rows = raw.map((row) => {
    const out = {};
    for (const h of headers) {
      const v = row[h];
      out[h] = v == null ? "" : String(v).trim();
    }
    return out;
  });

  return { headers, rows, fileName: "import-extension.xlsx" };
}

async function sendToDashboard(payload) {
  await chrome.storage.local.set({ [STORAGE_KEY]: payload });

  const tabs = await chrome.tabs.query({
    url: [
      "https://wasendpro.vercel.app/dashboard*",
      "http://localhost:3000/dashboard*",
      "http://127.0.0.1:3000/dashboard*",
    ],
  });

  if (tabs.length > 0) {
    const tab = tabs[0];
    await chrome.tabs.update(tab.id, { active: true });
    await chrome.windows.update(tab.windowId, { focused: true });
    try {
      await chrome.tabs.sendMessage(tab.id, { type: "WASENDPRO_IMPORT", payload });
    } catch {
      /* content script pas encore prêt — storage lu au chargement */
    }
    return;
  }

  await chrome.tabs.create({ url: DASHBOARD_URL });
}

document.getElementById("file").addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setStatus("Lecture du fichier…");

  try {
    const buffer = await file.arrayBuffer();
    const { headers, rows } = parseExcelBuffer(buffer);

    const payload = {
      headers,
      rows,
      fileName: file.name,
      importedAt: Date.now(),
    };

    await sendToDashboard(payload);
    setStatus(
      `✓ ${rows.length} contact(s) envoyé(s). Ouvrez « Nouvelle campagne » sur le tableau de bord.`,
      "ok"
    );
  } catch (err) {
    setStatus(err instanceof Error ? err.message : "Erreur de lecture", "err");
  }

  e.target.value = "";
});
