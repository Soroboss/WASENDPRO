import { getDefaultCountryDialCode } from "@/lib/country-settings";

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
 * Format international pour WhatsApp (sans +).
 * Ne supprime jamais un 0 situé juste après l'indicatif pays :
 * ex. 221 07…, 225 07… (le 0 fait partie du numéro national).
 */
export function normalizePhoneForWhatsApp(
  phone: string,
  countryDialCode?: string
): string {
  const dial = (countryDialCode ?? getDefaultCountryDialCode()).replace(/\D/g, "");
  let digits = normalizeExcelPhone(phone);
  if (!digits || !dial) return "";

  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  // Déjà international : ne retirer aucun chiffre (y compris 0 après l'indicatif)
  if (digits.startsWith(dial)) {
    return digits;
  }

  // Numéro déjà long sans indicatif explicite (ex. 33612345678, 2210777123456)
  if (digits.length >= 11) {
    return digits;
  }

  // Format national avec 0 initial : garder le 0 après l'indicatif
  if (digits.startsWith("0")) {
    return `${dial}${digits}`;
  }

  // Numéro national court sans 0 initial
  if (digits.length >= 8 && digits.length <= 10) {
    return `${dial}${digits}`;
  }

  return digits;
}

export function isValidPhone(
  phone: string,
  countryDialCode?: string
): boolean {
  const digits = normalizePhoneForWhatsApp(phone, countryDialCode);
  return digits.length >= 10 && digits.length <= 15;
}

/** Choisit le numéro normalisé le plus complet parmi plusieurs sources. */
export function pickBestNormalizedPhone(
  candidates: string[],
  countryDialCodes?: string[]
): string {
  const dials = Array.from(
    new Set(
      (countryDialCodes?.length
        ? countryDialCodes
        : [getDefaultCountryDialCode()]
      )
        .map((d) => d.replace(/\D/g, ""))
        .filter(Boolean)
    )
  );

  let best = "";
  for (const raw of candidates) {
    if (!String(raw ?? "").trim()) continue;
    for (const dial of dials) {
      const n = normalizePhoneForWhatsApp(raw, dial);
      if (!isValidPhone(n, dial)) continue;
      if (n.length > best.length) best = n;
    }
  }
  return best;
}
