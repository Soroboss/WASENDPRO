import type { ImportedRow } from "@/types";

export const MANUAL_CONTACT_SLOTS = 4;

export const MANUAL_CONTACT_HEADERS = ["Nom", "Prénom", "Téléphone"] as const;

export interface ManualContactEntry {
  nom: string;
  prenom: string;
  phone: string;
}

export function emptyManualSlots(): ManualContactEntry[] {
  return Array.from({ length: MANUAL_CONTACT_SLOTS }, () => ({
    nom: "",
    prenom: "",
    phone: "",
  }));
}

/** Convertit les lignes remplies (1 à 4) en lignes importables. */
export function manualEntriesToImportedRows(entries: ManualContactEntry[]): {
  headers: string[];
  rows: ImportedRow[];
} {
  const rows: ImportedRow[] = [];
  for (const e of entries) {
    const phone = e.phone.trim();
    if (!phone) continue;
    const row: ImportedRow = {
      Nom: e.nom.trim(),
      Prénom: e.prenom.trim(),
      Téléphone: phone,
    };
    rows.push(row);
  }
  return { headers: [...MANUAL_CONTACT_HEADERS], rows };
}

export function countFilledManualEntries(entries: ManualContactEntry[]): number {
  return entries.filter((e) => e.phone.trim()).length;
}
