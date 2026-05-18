import { findPhoneFromRow, TEMPLATE_HEADERS } from "@/lib/contacts";
import type { CampaignLogStatus, Contact, ImportedRow } from "@/types";

export type CampaignRelanceFilter = "all" | "pending" | "sent";

export interface LogWithContactForSource {
  contact: Contact;
  status: CampaignLogStatus;
  row_data?: Record<string, string>;
}

/** En-têtes Excel déduits des contacts (Téléphone + Nom en premier). */
export function buildHeadersFromContacts(contacts: Contact[]): string[] {
  const keys = new Set<string>([...TEMPLATE_HEADERS]);
  for (const c of contacts) {
    for (const k of Object.keys(c.custom_data ?? {})) {
      if (k.trim()) keys.add(k.trim());
    }
  }
  const priority = ["Nom", "Prénom", "Téléphone"];
  const rest = Array.from(keys)
    .filter((k) => !priority.includes(k))
    .sort((a, b) => a.localeCompare(b, "fr"));
  return [...priority.filter((k) => keys.has(k)), ...rest];
}

export function contactToImportedRow(contact: Contact): ImportedRow {
  const row: ImportedRow = { ...(contact.custom_data ?? {}) };
  row["Téléphone"] = contact.phone;
  if (contact.name?.trim()) {
    row["Nom"] = contact.name.trim();
  }
  return row;
}

export function contactsToImportedRows(contacts: Contact[]): {
  headers: string[];
  rows: ImportedRow[];
} {
  const headers = buildHeadersFromContacts(contacts);
  const rows = contacts.map(contactToImportedRow);
  return { headers, rows };
}

export function logsToImportedRows(
  logs: LogWithContactForSource[],
  filter: CampaignRelanceFilter = "all"
): { headers: string[]; rows: ImportedRow[] } {
  const filtered = logs.filter((log) => {
    if (filter === "pending") return log.status !== "sent";
    if (filter === "sent") return log.status === "sent";
    return true;
  });

  const contacts = filtered.map((l) => l.contact);
  const headers = buildHeadersFromContacts(contacts);

  const rows = filtered.map((log) => {
    const base = { ...(log.row_data ?? log.contact.custom_data ?? {}) };
    base["Téléphone"] = log.contact.phone;
    const name =
      log.contact.name?.trim() ||
      base["Nom"]?.trim() ||
      base["Prénom"]?.trim() ||
      "";
    if (name) base["Nom"] = name;
    for (const h of headers) {
      if (base[h] === undefined) base[h] = "";
    }
    return base;
  });

  return { headers, rows };
}

/** Fusionne des lignes importées en dédupliquant par téléphone. */
export function mergeImportedRows(
  headers: string[],
  rows: ImportedRow[],
  countryDialCode: string
): ImportedRow[] {
  const seen = new Set<string>();
  const out: ImportedRow[] = [];
  for (const row of rows) {
    const phone = findPhoneFromRow(headers, row, countryDialCode);
    if (!phone || seen.has(phone)) continue;
    seen.add(phone);
    out.push(row);
  }
  return out;
}

export function relanceFilterLabel(filter: CampaignRelanceFilter): string {
  switch (filter) {
    case "pending":
      return "Non envoyés uniquement";
    case "sent":
      return "Déjà envoyés (relance)";
    default:
      return "Tous les contacts";
  }
}
