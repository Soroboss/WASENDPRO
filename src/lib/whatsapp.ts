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

/** Ouvre WhatsApp dans un nouvel onglet. */
export function openWhatsApp(phone: string, message: string): void {
  const url = buildWhatsAppUrl(phone, message);
  window.open(url, "_blank", "noopener,noreferrer");
}
