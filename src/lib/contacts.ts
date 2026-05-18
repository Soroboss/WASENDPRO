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

/** Toutes les clés personnalisées présentes dans l'annuaire (hors téléphone). */
export function getCustomFieldKeys(contacts: Contact[]): string[] {
  const keys = new Set<string>();
  for (const contact of contacts) {
    for (const key of Object.keys(contact.custom_data ?? {})) {
      if (!isPhoneColumnKey(key) && !isNameColumnKey(key)) {
        keys.add(key);
      }
    }
  }
  return Array.from(keys).sort((a, b) => a.localeCompare(b, "fr"));
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
  row: ImportedRow
): string {
  for (const h of headers) {
    if (isPhoneColumnKey(h)) {
      return (row[h] ?? "").replace(/\D/g, "");
    }
  }
  return (row[headers[1]] ?? row[headers[0]] ?? "").replace(/\D/g, "");
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
