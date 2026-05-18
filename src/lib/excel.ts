import * as XLSX from "xlsx";
import type { ImportedRow } from "@/types";

const TEMPLATE_HEADERS = ["Nom", "Téléphone", "Entreprise"];

/** Télécharge un modèle Excel vierge. */
export function downloadExcelTemplate(filename = "modele_contacts.xlsx"): void {
  const ws = XLSX.utils.aoa_to_sheet([
    TEMPLATE_HEADERS,
    ["Jean Dupont", "33612345678", "Acme Corp"],
    ["Marie Martin", "33698765432", "Tech SA"],
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Contacts");
  XLSX.writeFile(wb, filename);
}

/** Parse un fichier Excel et retourne lignes + en-têtes. */
export async function parseExcelFile(
  file: File
): Promise<{ headers: string[]; rows: ImportedRow[] }> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });
  const sheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });

  if (raw.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = Object.keys(raw[0]);
  const rows: ImportedRow[] = raw.map((row) => {
    const entry: ImportedRow = {};
    for (const h of headers) {
      entry[h] = String(row[h] ?? "").trim();
    }
    return entry;
  });

  return { headers, rows };
}

/** Exporte un rapport de campagne en Excel. */
export function exportCampaignReport(
  data: {
    name: string;
    phone: string;
    message: string;
    status: string;
    sentAt: string;
  }[],
  filename = "rapport_campagne.xlsx"
): void {
  const ws = XLSX.utils.json_to_sheet(
    data.map((r) => ({
      Nom: r.name,
      Téléphone: r.phone,
      Message: r.message,
      Statut: r.status,
      "Envoyé le": r.sentAt,
    }))
  );
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Rapport");
  XLSX.writeFile(wb, filename);
}

export { TEMPLATE_HEADERS };
