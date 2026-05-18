import { DEFAULT_COUNTRY_DIAL } from "@/lib/countries";

const STORAGE_KEY = "biswasendpro_country_dial";
export const COUNTRY_CHANGE_EVENT = "biswasendpro:country-change";

export function getDefaultCountryDialCode(): string {
  if (typeof window === "undefined") return DEFAULT_COUNTRY_DIAL;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && /^\d{1,4}$/.test(stored)) return stored;
  } catch {
    /* ignore */
  }
  return DEFAULT_COUNTRY_DIAL;
}

export function setDefaultCountryDialCode(dialCode: string): void {
  const clean = dialCode.replace(/\D/g, "");
  if (!clean) return;
  localStorage.setItem(STORAGE_KEY, clean);
  window.dispatchEvent(
    new CustomEvent(COUNTRY_CHANGE_EVENT, { detail: { dialCode: clean } })
  );
}
