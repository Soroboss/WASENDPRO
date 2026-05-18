export interface CountryOption {
  iso: string;
  name: string;
  dialCode: string;
  flag: string;
}

/** Pays courants pour les campagnes WhatsApp (indicatif sans +). */
export const COUNTRIES: CountryOption[] = [
  { iso: "FR", name: "France", dialCode: "33", flag: "🇫🇷" },
  { iso: "SN", name: "Sénégal", dialCode: "221", flag: "🇸🇳" },
  { iso: "CI", name: "Côte d'Ivoire", dialCode: "225", flag: "🇨🇮" },
  { iso: "ML", name: "Mali", dialCode: "223", flag: "🇲🇱" },
  { iso: "BF", name: "Burkina Faso", dialCode: "226", flag: "🇧🇫" },
  { iso: "GN", name: "Guinée", dialCode: "224", flag: "🇬🇳" },
  { iso: "CM", name: "Cameroun", dialCode: "237", flag: "🇨🇲" },
  { iso: "MA", name: "Maroc", dialCode: "212", flag: "🇲🇦" },
  { iso: "TN", name: "Tunisie", dialCode: "216", flag: "🇹🇳" },
  { iso: "DZ", name: "Algérie", dialCode: "213", flag: "🇩🇿" },
  { iso: "BE", name: "Belgique", dialCode: "32", flag: "🇧🇪" },
  { iso: "CH", name: "Suisse", dialCode: "41", flag: "🇨🇭" },
  { iso: "CA", name: "Canada", dialCode: "1", flag: "🇨🇦" },
  { iso: "US", name: "États-Unis", dialCode: "1", flag: "🇺🇸" },
  { iso: "GB", name: "Royaume-Uni", dialCode: "44", flag: "🇬🇧" },
  { iso: "DE", name: "Allemagne", dialCode: "49", flag: "🇩🇪" },
  { iso: "ES", name: "Espagne", dialCode: "34", flag: "🇪🇸" },
  { iso: "IT", name: "Italie", dialCode: "39", flag: "🇮🇹" },
  { iso: "PT", name: "Portugal", dialCode: "351", flag: "🇵🇹" },
  { iso: "NL", name: "Pays-Bas", dialCode: "31", flag: "🇳🇱" },
  { iso: "CD", name: "RD Congo", dialCode: "243", flag: "🇨🇩" },
  { iso: "GA", name: "Gabon", dialCode: "241", flag: "🇬🇦" },
  { iso: "BJ", name: "Bénin", dialCode: "229", flag: "🇧🇯" },
  { iso: "TG", name: "Togo", dialCode: "228", flag: "🇹🇬" },
  { iso: "NE", name: "Niger", dialCode: "227", flag: "🇳🇪" },
  { iso: "MG", name: "Madagascar", dialCode: "261", flag: "🇲🇬" },
  { iso: "HT", name: "Haïti", dialCode: "509", flag: "🇭🇹" },
];

export const DEFAULT_COUNTRY_DIAL = "33";

export function getCountryByDial(dialCode: string): CountryOption | undefined {
  const d = dialCode.replace(/\D/g, "");
  return COUNTRIES.find((c) => c.dialCode === d);
}

export function formatDialDisplay(dialCode: string): string {
  return `+${dialCode.replace(/\D/g, "")}`;
}
