/** Clés sessionStorage utilisées par l'app (hors données métier localStorage). */
const SESSION_KEYS = ["biswasendpro_phone_repair_v2"] as const;

let contactsCache: { data: unknown; at: number } | null = null;
let campaignsCache: { data: unknown; at: number } | null = null;

const CACHE_TTL_MS = 45_000;

export function invalidateDataCache(): void {
  contactsCache = null;
  campaignsCache = null;
}

export function getCachedContacts<T>(factory: () => Promise<T>): Promise<T> {
  if (
    contactsCache &&
    Date.now() - contactsCache.at < CACHE_TTL_MS
  ) {
    return Promise.resolve(contactsCache.data as T);
  }
  return factory().then((data) => {
    contactsCache = { data, at: Date.now() };
    return data;
  });
}

export function getCachedCampaigns<T>(factory: () => Promise<T>): Promise<T> {
  if (
    campaignsCache &&
    Date.now() - campaignsCache.at < CACHE_TTL_MS
  ) {
    return Promise.resolve(campaignsCache.data as T);
  }
  return factory().then((data) => {
    campaignsCache = { data, at: Date.now() };
    return data;
  });
}

/** Vide le cache session et les caches mémoire (données InsForge / localStorage intactes). */
export function clearAppSessionCache(): void {
  if (typeof window === "undefined") return;
  for (const key of SESSION_KEYS) {
    sessionStorage.removeItem(key);
  }
  invalidateDataCache();
}
