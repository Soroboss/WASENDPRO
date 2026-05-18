/** Caractères invisibles (Excel, copier-coller) qui cassent les liens wa.me. */
const INVISIBLE_CHARS =
  /[\u200B-\u200F\u202A-\u202E\u2060-\u2069\uFEFF\u00AD]/g;

/** Corrige les numéros Excel en notation scientifique (ex. 3.36123E+11). */
export function normalizeExcelPhone(value: string): string {
  let s = String(value ?? "")
    .trim()
    .replace(INVISIBLE_CHARS, "");
  if (!s) return "";

  if (/e[+-]?\d+/i.test(s)) {
    const n = Number(s);
    if (!Number.isNaN(n) && Number.isFinite(n)) {
      s = String(Math.round(n));
    }
  }

  return s.replace(/\D/g, "");
}

/**
 * Format international pour wa.me / api.whatsapp.com (sans +, sans 00).
 * Gère 06… → 33…, 7x… (Sénégal) → 221…, etc.
 */
export function normalizePhoneForWhatsApp(phone: string): string {
  let digits = normalizeExcelPhone(phone);
  if (!digits) return "";

  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  // Déjà au format international (33…, 221…, 1…)
  if (digits.length >= 11) {
    return digits;
  }

  // France : 06 12 34 56 78 (10 chiffres avec 0 initial)
  if (digits.length === 10 && digits.startsWith("0")) {
    return `33${digits.slice(1)}`;
  }

  // France : 6/7 XX XX XX XX (9 chiffres, mobile sans 0)
  if (digits.length === 9 && /^[67]/.test(digits)) {
    return `33${digits}`;
  }

  // Sénégal : 77 XXX XX XX (9 chiffres, commence par 7)
  if (digits.length === 9 && /^7[678]/.test(digits)) {
    return `221${digits}`;
  }

  return digits;
}

export function isValidPhone(phone: string): boolean {
  const digits = normalizePhoneForWhatsApp(phone);
  return digits.length >= 10 && digits.length <= 15;
}
