import type { ImportedRow } from "@/types";

export const EXTENSION_IMPORT_EVENT = "wasendpro:import-excel";

export interface ExtensionImportPayload {
  headers: string[];
  rows: ImportedRow[];
  fileName?: string;
  importedAt?: number;
}

export function isExtensionImportPayload(
  value: unknown
): value is ExtensionImportPayload {
  if (!value || typeof value !== "object") return false;
  const p = value as ExtensionImportPayload;
  return (
    Array.isArray(p.headers) &&
    Array.isArray(p.rows) &&
    p.headers.every((h) => typeof h === "string") &&
    p.rows.every((r) => typeof r === "object" && r !== null)
  );
}
