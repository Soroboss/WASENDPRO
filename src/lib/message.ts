/** Compile un message en remplaçant {Variable} par les valeurs du contact. */
export function compileMessage(
  template: string,
  rowData: Record<string, string>
): string {
  return template.replace(/\{([^}]+)\}/g, (_, key: string) => {
    const trimmed = key.trim();
    const value = rowData[trimmed];
    return value !== undefined && value !== "" ? value : `{${trimmed}}`;
  });
}

/** Extrait les noms de variables depuis un template. */
export function extractVariables(template: string): string[] {
  const matches = Array.from(template.matchAll(/\{([^}]+)\}/g));
  const names = matches.map((m) => m[1].trim());
  return Array.from(new Set(names));
}

/** Insère ou remplace du texte dans un textarea. */
export function insertAtCursor(
  value: string,
  insertion: string,
  selectionStart: number,
  selectionEnd: number,
  replaceSelection: boolean
): { newValue: string; newCursor: number } {
  if (replaceSelection && selectionStart !== selectionEnd) {
    const newValue =
      value.slice(0, selectionStart) + insertion + value.slice(selectionEnd);
    const newCursor = selectionStart + insertion.length;
    return { newValue, newCursor };
  }
  const newValue =
    value.slice(0, selectionStart) + insertion + value.slice(selectionStart);
  const newCursor = selectionStart + insertion.length;
  return { newValue, newCursor };
}
