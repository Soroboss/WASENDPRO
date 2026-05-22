/** Clés sessionStorage utilisées par l'app (hors données métier localStorage). */
const SESSION_KEYS = ["biswasendpro_phone_repair_v2"] as const;

const CACHE_TTL_MS = 60_000;

type CacheEntry<T> = { data: T; at: number };

let contactsCache: CacheEntry<unknown> | null = null;
let campaignsCache: CacheEntry<unknown> | null = null;
const campaignLogsCache = new Map<string, CacheEntry<unknown>>();

let contactsInFlight: Promise<unknown> | null = null;
let campaignsInFlight: Promise<unknown> | null = null;
const campaignLogsInFlight = new Map<string, Promise<unknown>>();

export function invalidateDataCache(): void {
  contactsCache = null;
  campaignsCache = null;
  campaignLogsCache.clear();
  contactsInFlight = null;
  campaignsInFlight = null;
  campaignLogsInFlight.clear();
}

export function invalidateCampaignLogsCache(campaignId?: string): void {
  if (campaignId) {
    campaignLogsCache.delete(campaignId);
    campaignLogsInFlight.delete(campaignId);
  } else {
    campaignLogsCache.clear();
    campaignLogsInFlight.clear();
  }
}

function readCache<T>(entry: CacheEntry<unknown> | null | undefined): T | null {
  if (entry && Date.now() - entry.at < CACHE_TTL_MS) {
    return entry.data as T;
  }
  return null;
}

export function getCachedContacts<T>(factory: () => Promise<T>): Promise<T> {
  const hit = readCache<T>(contactsCache);
  if (hit) return Promise.resolve(hit);
  if (contactsInFlight) return contactsInFlight as Promise<T>;

  contactsInFlight = factory().then((data) => {
    contactsCache = { data, at: Date.now() };
    contactsInFlight = null;
    return data;
  });
  return contactsInFlight as Promise<T>;
}

export function getCachedCampaigns<T>(factory: () => Promise<T>): Promise<T> {
  const hit = readCache<T>(campaignsCache);
  if (hit) return Promise.resolve(hit);
  if (campaignsInFlight) return campaignsInFlight as Promise<T>;

  campaignsInFlight = factory().then((data) => {
    campaignsCache = { data, at: Date.now() };
    campaignsInFlight = null;
    return data;
  });
  return campaignsInFlight as Promise<T>;
}

export function getCachedCampaignLogs<T>(
  campaignId: string,
  factory: () => Promise<T>
): Promise<T> {
  const hit = readCache<T>(campaignLogsCache.get(campaignId));
  if (hit) return Promise.resolve(hit);

  const inflight = campaignLogsInFlight.get(campaignId);
  if (inflight) return inflight as Promise<T>;

  const promise = factory().then((data) => {
    campaignLogsCache.set(campaignId, { data, at: Date.now() });
    campaignLogsInFlight.delete(campaignId);
    return data;
  });
  campaignLogsInFlight.set(campaignId, promise);
  return promise as Promise<T>;
}

/** Vide le cache session et les caches mémoire (données InsForge / localStorage intactes). */
export function clearAppSessionCache(): void {
  if (typeof window === "undefined") return;
  for (const key of SESSION_KEYS) {
    sessionStorage.removeItem(key);
  }
  invalidateDataCache();
}
