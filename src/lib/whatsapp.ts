import {
  isValidPhone,
  normalizePhoneForWhatsApp,
} from "@/lib/phone";

const MAX_MESSAGE_CHARS = 1500;
const MAX_URL_LENGTH = 2048;

/** Nettoie le message avant encodage URL. */
export function sanitizeWhatsAppMessage(message: string): string {
  return message
    .replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u2069\uFEFF\u00AD]/g, "")
    .replace(/\r\n/g, "\n")
    .trim();
}

function truncateEncodedMessage(
  encoded: string,
  phoneDigits: string,
  useWeb: boolean
): string {
  const base = useWeb
    ? `https://web.whatsapp.com/send?phone=${phoneDigits}&text=`
    : `https://api.whatsapp.com/send?phone=${phoneDigits}&text=`;

  if (base.length + encoded.length <= MAX_URL_LENGTH) {
    return encoded;
  }

  let low = 0;
  let high = encoded.length;
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    if (base.length + mid <= MAX_URL_LENGTH) {
      low = mid;
    } else {
      high = mid - 1;
    }
  }
  return encoded.slice(0, Math.max(0, high));
}

/** Génère l'URL api.whatsapp.com (plus fiable que wa.me sur desktop). */
export function buildWhatsAppUrl(phone: string, message: string): string {
  const numero = normalizePhoneForWhatsApp(phone);
  const clean = sanitizeWhatsAppMessage(message).slice(0, MAX_MESSAGE_CHARS);
  let text = encodeURIComponent(clean);
  text = truncateEncodedMessage(text, numero, false);
  return `https://api.whatsapp.com/send?phone=${numero}&text=${text}`;
}

export function buildWhatsAppWebUrl(phone: string, message: string): string {
  const numero = normalizePhoneForWhatsApp(phone);
  const clean = sanitizeWhatsAppMessage(message).slice(0, MAX_MESSAGE_CHARS);
  let text = encodeURIComponent(clean);
  text = truncateEncodedMessage(text, numero, true);
  return `https://web.whatsapp.com/send?phone=${numero}&text=${text}`;
}

/** Ouvre WhatsApp (Web si pièces jointes, sinon api.whatsapp.com). */
export function openWhatsApp(
  phone: string,
  message: string,
  options?: { useWeb?: boolean }
): boolean {
  const numero = normalizePhoneForWhatsApp(phone);
  if (!isValidPhone(numero)) return false;

  const url = options?.useWeb
    ? buildWhatsAppWebUrl(phone, message)
    : buildWhatsAppUrl(phone, message);

  const popup = window.open(url, "_blank", "noopener,noreferrer");
  if (popup) return true;

  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  link.remove();
  return true;
}

export function getWhatsAppPhoneError(
  phone: string,
  countryDialCode?: string
): string | null {
  const normalized = normalizePhoneForWhatsApp(phone, countryDialCode);
  if (!normalized) {
    return "Numéro vide. Utilisez le format international (ex. 33612345678 ou 221771234567).";
  }
  if (!isValidPhone(normalized, countryDialCode)) {
    return `Numéro invalide : « ${phone} » → « ${normalized} ». Vérifiez le format international sans +.`;
  }
  return null;
}
