/** Normalise un numéro pour wa.me (chiffres uniquement, sans +). */
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

/** Génère l'URL wa.me avec message encodé. */
export function buildWhatsAppUrl(phone: string, message: string): string {
  const numero = normalizePhone(phone);
  const text = encodeURIComponent(message);
  return `https://wa.me/${numero}?text=${text}`;
}

export function buildWhatsAppWebUrl(phone: string, message: string): string {
  const numero = normalizePhone(phone);
  const text = encodeURIComponent(message);
  return `https://web.whatsapp.com/send?phone=${numero}&text=${text}`;
}

/** Ouvre WhatsApp (Web si pièces jointes, sinon wa.me). */
export function openWhatsApp(
  phone: string,
  message: string,
  options?: { useWeb?: boolean }
): void {
  const url = options?.useWeb
    ? buildWhatsAppWebUrl(phone, message)
    : buildWhatsAppUrl(phone, message);
  window.open(url, "_blank", "noopener,noreferrer");
}
