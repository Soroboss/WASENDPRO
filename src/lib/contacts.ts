import { isValidPhone, normalizePhoneForWhatsApp } from "@/lib/phone";
import type { Contact, ImportedRow } from "@/types";

/** Colonnes du modèle Excel (variables disponibles pour les messages). */
export const TEMPLATE_HEADERS = [
  "Nom",
  "Prénom",
  "Téléphone",
  "Entreprise",
  "Ville",
  "Email",
  "Offre",
  "Date RDV",
  "Notes",
] as const;

const PHONE_KEYS = [
  "téléphone",
  "telephone",
  "phone",
  "tel",
  "mobile",
  "numero",
  "numéro",
];

const NAME_KEYS = ["nom", "name", "prénom", "prenom"];

export function isPhoneColumnKey(key: string): boolean {
  return PHONE_KEYS.includes(key.toLowerCase().trim());
}

export function isNameColumnKey(key: string): boolean {
  return NAME_KEYS.includes(key.toLowerCase().trim());
}

/** Colonnes utilisables comme variables {…} dans le message. */
export function getMessageVariables(headers: string[]): string[] {
  return headers.filter((h) => h.trim().length > 0);
}

/** Toutes les clés personnalisées présentes dans l'annuaire (hors téléphone / nom). */
export function getCustomFieldKeys(contacts: Contact[]): string[] {
  const keys = new Set<string>();
  for (const contact of contacts) {
    for (const key of Object.keys(contact.custom_data ?? {})) {
      const k = key.trim();
      if (k && !isPhoneColumnKey(k) && !isNameColumnKey(k)) {
        keys.add(key);
      }
    }
  }
  return Array.from(keys).sort((a, b) => a.localeCompare(b, "fr"));
}

/** Colonnes à afficher : exclut celles qui recopient le nom ou le téléphone. */
export function getDisplayCustomKeys(contacts: Contact[]): string[] {
  return getCustomFieldKeys(contacts).filter((key) =>
    contacts.some((c) => {
      const v = (getContactFieldValue(c, key) ?? "").trim();
      if (!v) return false;
      const phoneDigits = c.phone.replace(/\D/g, "");
      if (phoneDigits && v.replace(/\D/g, "") === phoneDigits) return false;
      if (c.name?.trim() && v === c.name.trim()) return false;
      return true;
    })
  );
}

/** Valeur cellule sans répéter nom / téléphone déjà affichés ailleurs. */
export function getDisplayCellValue(contact: Contact, key: string): string {
  const value = (getContactFieldValue(contact, key) ?? "").trim();
  if (!value) return "";
  const phoneDigits = contact.phone.replace(/\D/g, "");
  if (phoneDigits && value.replace(/\D/g, "") === phoneDigits) return "";
  if (contact.name?.trim() && value === contact.name.trim()) return "";
  return value;
}

/** Un seul contact par numéro (garde le plus complet / le plus récent). */
export function deduplicateContactsByPhone(contacts: Contact[]): Contact[] {
  const byPhone = new Map<string, Contact>();

  for (const contact of contacts) {
    const phone = contact.phone.replace(/\D/g, "");
    if (!phone) continue;

    const existing = byPhone.get(phone);
    if (!existing) {
      byPhone.set(phone, contact);
      continue;
    }

    const score = (c: Contact) =>
      (c.name?.trim() ? 2 : 0) +
      (Object.keys(c.custom_data ?? {}).length > 0 ? 1 : 0);

    const keep =
      score(contact) > score(existing) ||
      (score(contact) === score(existing) &&
        new Date(contact.created_at) > new Date(existing.created_at))
        ? contact
        : existing;

    byPhone.set(phone, keep);
  }

  return Array.from(byPhone.values()).sort((a, b) =>
    a.phone.localeCompare(b.phone, undefined, { numeric: true })
  );
}

export function getContactFieldValue(
  contact: Contact,
  key: string
): string {
  if (isPhoneColumnKey(key)) return contact.phone;
  if (key === "Nom" || key.toLowerCase() === "nom") {
    return contact.name ?? contact.custom_data?.[key] ?? "";
  }
  return contact.custom_data?.[key] ?? "";
}

export function buildCustomDataFromForm(
  fields: { key: string; value: string }[],
  headersHint: string[]
): Record<string, string> {
  const data: Record<string, string> = {};
  for (const h of headersHint) {
    data[h] = "";
  }
  for (const { key, value } of fields) {
    const k = key.trim();
    if (k) data[k] = value;
  }
  return data;
}

export function contactToFormFields(
  contact: Contact,
  extraKeys: string[] = []
): { key: string; value: string }[] {
  const keys = new Set([
    ...Object.keys(contact.custom_data ?? {}),
    ...extraKeys,
  ]);
  keys.delete("Téléphone");
  return Array.from(keys)
    .sort((a, b) => a.localeCompare(b, "fr"))
    .map((key) => ({
      key,
      value: contact.custom_data?.[key] ?? "",
    }));
}

export function findPhoneFromRow(
  headers: string[],
  row: ImportedRow,
  countryDialCode?: string
): string {
  for (const h of headers) {
    if (isPhoneColumnKey(h)) {
      return normalizePhoneForWhatsApp(row[h] ?? "", countryDialCode);
    }
  }
  for (const h of headers) {
    const digits = normalizePhoneForWhatsApp(row[h] ?? "", countryDialCode);
    if (isValidPhone(digits, countryDialCode)) return digits;
  }
  return "";
}

/** Filtre les lignes importables et déduplique par numéro (1ère occurrence). */
export function prepareImportRows(
  headers: string[],
  rows: ImportedRow[],
  countryDialCode?: string
): {
  rows: ImportedRow[];
  skippedNoPhone: number;
  skippedDuplicate: number;
} {
  const seen = new Set<string>();
  const prepared: ImportedRow[] = [];
  let skippedNoPhone = 0;
  let skippedDuplicate = 0;

  for (const row of rows) {
    const phone = findPhoneFromRow(headers, row, countryDialCode);
    if (!isValidPhone(phone, countryDialCode)) {
      skippedNoPhone++;
      continue;
    }
    if (seen.has(phone)) {
      skippedDuplicate++;
      continue;
    }
    seen.add(phone);
    prepared.push(row);
  }

  return { rows: prepared, skippedNoPhone, skippedDuplicate };
}

export function rowToSnapshot(
  headers: string[],
  row: ImportedRow,
  countryDialCode?: string
): Record<string, string> {
  const data: Record<string, string> = {};
  for (const h of headers) {
    const key = h.trim();
    if (!key) continue;
    let value = String(row[h] ?? "").trim();
    if (isPhoneColumnKey(key)) {
      value = normalizePhoneForWhatsApp(value, countryDialCode);
    }
    data[key] = value;
  }
  return data;
}

export function findNameFromRow(
  headers: string[],
  row: ImportedRow
): string | null {
  for (const h of headers) {
    if (isNameColumnKey(h)) {
      const v = (row[h] ?? "").trim();
      if (v) return v;
    }
  }
  return null;
}
