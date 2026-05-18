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

/** Lit une cellule en privilégiant le texte affiché (conserve les 0 initiaux). */
function readExcelCell(sheet: XLSX.WorkSheet, row: number, col: number): string {
  const ref = XLSX.utils.encode_cell({ r: row, c: col });
  const cell = sheet[ref];
  if (!cell) return "";

  if (cell.w != null && String(cell.w).trim() !== "") {
    return String(cell.w).trim();
  }

  const v = cell.v;
  if (v == null) return "";
  if (typeof v === "number" && Number.isFinite(v)) {
    return normalizeExcelPhone(String(Math.round(v)));
  }
  return String(v).trim();
}

/** Extraction ligne à ligne pour ne pas perdre les zéros des colonnes téléphone. */
function extractSheetRows(sheet: XLSX.WorkSheet): {
  headers: string[];
  rows: ImportedRow[];
} {
  const ref = sheet["!ref"];
  if (!ref) return { headers: [], rows: [] };

  const range = XLSX.utils.decode_range(ref);
  const headerRow = range.s.r;
  const headers: string[] = [];

  for (let c = range.s.c; c <= range.e.c; c++) {
    const h = readExcelCell(sheet, headerRow, c).trim();
    headers.push(h || `Colonne ${c + 1}`);
  }

  const cleanHeaders = headers.map((h, i) => h || `Colonne ${i + 1}`);
  const rows: ImportedRow[] = [];

  for (let r = headerRow + 1; r <= range.e.r; r++) {
    const entry: ImportedRow = {};
    let hasData = false;

    for (let c = range.s.c; c <= range.e.c; c++) {
      const h = cleanHeaders[c - range.s.c];
      if (!h) continue;
      let value = readExcelCell(sheet, r, c);
      if (isPhoneColumnKey(h)) {
        value = normalizeExcelPhone(value);
      }
      if (value) hasData = true;
      entry[h] = value;
    }

    if (hasData) rows.push(entry);
  }

  return { headers: cleanHeaders, rows };
}

export interface ExcelParseResult {
  headers: string[];
  rows: ImportedRow[];
  /** Lignes brutes avant filtrage (pour changer de pays). */
  rawRows: ImportedRow[];
  meta: {
    totalInFile: number;
    imported: number;
    skippedNoPhone: number;
    skippedDuplicate: number;
  };
}

/** Parse un fichier Excel et retourne lignes + en-têtes. */
export async function parseExcelFile(
  file: File,
  countryDialCode?: string
): Promise<ExcelParseResult> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array", cellText: true });
  const sheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  const { headers, rows: allRows } = extractSheetRows(sheet);

  if (headers.length === 0 || allRows.length === 0) {
    return {
      headers: [],
      rows: [],
      rawRows: [],
      meta: {
        totalInFile: 0,
        imported: 0,
        skippedNoPhone: 0,
        skippedDuplicate: 0,
      },
    };
  }

  const rows = allRows.filter((row) =>
    headers.some((h) => String(row[h] ?? "").trim().length > 0)
  );

  const { rows: prepared, skippedNoPhone, skippedDuplicate } = prepareImportRows(
    headers,
    rows,
    countryDialCode
  );

  return {
    headers,
    rows: prepared,
    rawRows: allRows,
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
