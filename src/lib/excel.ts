import * as XLSX from "xlsx";
import type { ImportedRow } from "@/types";
import {
  isPhoneColumnKey,
  prepareImportRows,
  TEMPLATE_HEADERS,
} from "@/lib/contacts";
import { normalizeExcelPhone } from "@/lib/phone";

const EXAMPLE_ROWS: string[][] = [
  [
    "Jean Dupont",
    "Jean",
    "33612345678",
    "Acme Corp",
    "Paris",
    "jean@acme.fr",
    "-20%",
    "15/06/2026",
    "Client VIP",
  ],
  [
    "Marie Martin",
    "Marie",
    "33698765432",
    "Tech SA",
    "Lyon",
    "marie@tech.fr",
    "Pack Pro",
    "20/06/2026",
    "Relance devis",
  ],
  [
    "Paul Ndiaye",
    "Paul",
    "221771234567",
    "BIS Group",
    "Dakar",
    "paul@bisgroup.sn",
    "Essai gratuit",
    "01/07/2026",
    "Nouveau prospect",
  ],
];

/** Télécharge un modèle Excel avec plusieurs colonnes variables. */
export function downloadExcelTemplate(filename = "modele_contacts.xlsx"): void {
  const ws = XLSX.utils.aoa_to_sheet([
    [...TEMPLATE_HEADERS],
    ...EXAMPLE_ROWS,
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Contacts");
  XLSX.writeFile(wb, filename);
}

export interface ExcelParseResult {
  headers: string[];
  rows: ImportedRow[];
  meta: {
    totalInFile: number;
    imported: number;
    skippedNoPhone: number;
    skippedDuplicate: number;
  };
}

/** Parse un fichier Excel et retourne lignes + en-têtes. */
export async function parseExcelFile(file: File): Promise<ExcelParseResult> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });
  const sheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });

  if (raw.length === 0) {
    return {
      headers: [],
      rows: [],
      meta: {
        totalInFile: 0,
        imported: 0,
        skippedNoPhone: 0,
        skippedDuplicate: 0,
      },
    };
  }

  const headers = Object.keys(raw[0]).map((h) => h.trim()).filter(Boolean);
  const rows: ImportedRow[] = raw
    .map((row) => {
      const entry: ImportedRow = {};
      for (const h of headers) {
        let value = String(row[h] ?? "").trim();
        if (isPhoneColumnKey(h)) {
          value = normalizeExcelPhone(value);
        }
        entry[h] = value;
      }
      return entry;
    })
    .filter((row) =>
      headers.some((h) => String(row[h] ?? "").trim().length > 0)
    );

  const { rows: prepared, skippedNoPhone, skippedDuplicate } = prepareImportRows(
    headers,
    rows
  );

  return {
    headers,
    rows: prepared,
    meta: {
      totalInFile: rows.length,
      imported: prepared.length,
      skippedNoPhone,
      skippedDuplicate,
    },
  };
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
