/** Corrige les numéros Excel en notation scientifique (ex. 3.36123E+11). */
export function normalizeExcelPhone(value: string): string {
  let s = String(value ?? "").trim();
  if (!s) return "";

  if (/e[+-]?\d+/i.test(s)) {
    const n = Number(s);
    if (!Number.isNaN(n) && Number.isFinite(n)) {
      s = String(Math.round(n));
    }
  }

  return s.replace(/\D/g, "");
}

export function isValidPhone(phone: string): boolean {
  const digits = normalizeExcelPhone(phone);
  return digits.length >= 8 && digits.length <= 15;
}
