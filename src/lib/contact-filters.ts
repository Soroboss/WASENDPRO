import { COUNTRIES } from "@/lib/countries";
import type { CampaignContactGroup, Contact } from "@/types";

export type ContactSort = "phone" | "name" | "date-desc" | "date-asc";
export type HasNameFilter = "all" | "yes" | "no";
export type CampaignStatusFilter = "all" | "sent" | "pending";

export interface ContactFilterState {
  search: string;
  dialCode: string;
  sort: ContactSort;
  hasName: HasNameFilter;
}

export function detectDialFromPhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  const sorted = [...COUNTRIES].sort(
    (a, b) => b.dialCode.length - a.dialCode.length
  );
  for (const c of sorted) {
    if (digits.startsWith(c.dialCode)) return c.dialCode;
  }
  return null;
}

export function filterAndSortContacts(
  contacts: Contact[],
  state: ContactFilterState
): Contact[] {
  let list = [...contacts];
  const q = state.search.trim().toLowerCase();

  if (q) {
    list = list.filter((c) => {
      if (c.phone.includes(q.replace(/\D/g, "")) || c.phone.includes(q))
        return true;
      if (c.name?.toLowerCase().includes(q)) return true;
      return Object.values(c.custom_data ?? {}).some((v) =>
        String(v).toLowerCase().includes(q)
      );
    });
  }

  if (state.dialCode) {
    list = list.filter((c) => c.phone.startsWith(state.dialCode));
  }

  if (state.hasName === "yes") {
    list = list.filter((c) => Boolean(c.name?.trim()));
  } else if (state.hasName === "no") {
    list = list.filter((c) => !c.name?.trim());
  }

  list.sort((a, b) => {
    switch (state.sort) {
      case "name":
        return (a.name ?? "").localeCompare(b.name ?? "", "fr");
      case "date-desc":
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case "date-asc":
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      case "phone":
      default:
        return a.phone.localeCompare(b.phone, undefined, { numeric: true });
    }
  });

  return list;
}

export function filterCampaignGroups(
  groups: CampaignContactGroup[],
  opts: {
    search: string;
    campaignId: string;
    status: CampaignStatusFilter;
  }
): CampaignContactGroup[] {
  const q = opts.search.trim().toLowerCase();

  return groups
    .filter((g) => !opts.campaignId || g.campaign.id === opts.campaignId)
    .map((g) => {
      let entries = g.entries;
      if (opts.status === "sent") {
        entries = entries.filter((e) => e.log.status === "sent");
      } else if (opts.status === "pending") {
        entries = entries.filter((e) => e.log.status !== "sent");
      }
      if (q) {
        entries = entries.filter((e) => {
          const name = e.contact.name ?? e.rowData?.["Nom"] ?? "";
          return (
            e.contact.phone.includes(q.replace(/\D/g, "")) ||
            e.contact.phone.includes(q) ||
            name.toLowerCase().includes(q)
          );
        });
      }
      return { ...g, entries };
    })
    .filter((g) => g.entries.length > 0);
}

export function getDialCounts(contacts: Contact[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const c of contacts) {
    const dial = detectDialFromPhone(c.phone);
    if (dial) counts.set(dial, (counts.get(dial) ?? 0) + 1);
  }
  return counts;
}
