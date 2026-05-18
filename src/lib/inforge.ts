import { createClient } from "@insforge/sdk";
import type {
  Campaign,
  CampaignLog,
  CampaignLogStatus,
  Contact,
  CreateCampaignInput,
  ImportedRow,
} from "@/types";

const STORAGE_KEY = "biswasendpro_data";
const LEGACY_STORAGE_KEY = "wasendpro_data";

interface LocalStore {
  contacts: Contact[];
  campaigns: Campaign[];
  campaign_logs: CampaignLog[];
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function isInsforgeConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_INSFORGE_URL &&
      process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY
  );
}

export function getInsforgeClient() {
  if (!isInsforgeConfigured()) return null;
  return createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
  });
}

function readLocalStore(): LocalStore {
  if (typeof window === "undefined") {
    return { contacts: [], campaigns: [], campaign_logs: [] };
  }
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      raw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (raw) {
        localStorage.setItem(STORAGE_KEY, raw);
        localStorage.removeItem(LEGACY_STORAGE_KEY);
      }
    }
    if (!raw) return { contacts: [], campaigns: [], campaign_logs: [] };
    return JSON.parse(raw) as LocalStore;
  } catch {
    return { contacts: [], campaigns: [], campaign_logs: [] };
  }
}

function writeLocalStore(store: LocalStore): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function findPhoneColumn(headers: string[], row: ImportedRow): string {
  const phoneKeys = ["téléphone", "telephone", "phone", "tel", "mobile", "numero", "numéro"];
  for (const h of headers) {
    if (phoneKeys.includes(h.toLowerCase().trim())) {
      return row[h] ?? "";
    }
  }
  return row[headers[1]] ?? row[headers[0]] ?? "";
}

function findNameColumn(headers: string[], row: ImportedRow): string {
  const nameKeys = ["nom", "name", "prénom", "prenom"];
  for (const h of headers) {
    if (nameKeys.includes(h.toLowerCase().trim())) {
      return row[h] ?? "";
    }
  }
  return row[headers[0]] ?? "";
}

// ——— Contacts ———

export async function getContacts(): Promise<Contact[]> {
  const client = getInsforgeClient();
  if (client) {
    const { data, error } = await client.database
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Contact[];
  }
  return readLocalStore().contacts;
}

export async function upsertContactFromRow(
  row: ImportedRow,
  headers: string[]
): Promise<Contact> {
  const phone = findPhoneColumn(headers, row).replace(/\D/g, "");
  if (!phone) throw new Error("Numéro de téléphone manquant");

  const name = findNameColumn(headers, row) || null;
  const custom_data: Record<string, string> = {};
  for (const h of headers) {
    custom_data[h] = row[h] ?? "";
  }

  const client = getInsforgeClient();
  if (client) {
    const { data: existing } = await client.database
      .from("contacts")
      .select("*")
      .eq("phone", phone)
      .maybeSingle();

    if (existing) {
      const { data, error } = await client.database
        .from("contacts")
        .update({ name, custom_data })
        .eq("phone", phone)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as Contact;
    }

    const { data, error } = await client.database
      .from("contacts")
      .insert([{ phone, name, custom_data }])
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Contact;
  }

  const store = readLocalStore();
  let contact = store.contacts.find((c) => c.phone === phone);
  if (contact) {
    contact = { ...contact, name, custom_data };
    store.contacts = store.contacts.map((c) =>
      c.phone === phone ? contact! : c
    );
  } else {
    contact = {
      id: generateId(),
      phone,
      name,
      custom_data,
      created_at: new Date().toISOString(),
    };
    store.contacts.push(contact);
  }
  writeLocalStore(store);
  return contact;
}

// ——— Campaigns ———

export async function getCampaigns(): Promise<Campaign[]> {
  const client = getInsforgeClient();
  if (client) {
    const { data, error } = await client.database
      .from("campaigns")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Campaign[];
  }
  return readLocalStore().campaigns;
}

export async function getCampaign(id: string): Promise<Campaign | null> {
  const client = getInsforgeClient();
  if (client) {
    const { data, error } = await client.database
      .from("campaigns")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data as Campaign | null;
  }
  return readLocalStore().campaigns.find((c) => c.id === id) ?? null;
}

export async function createCampaign(
  input: CreateCampaignInput
): Promise<Campaign> {
  const client = getInsforgeClient();

  if (client) {
    const { data: campaign, error } = await client.database
      .from("campaigns")
      .insert([
        {
          name: input.name,
          template_message: input.template_message,
          scheduled_date: input.scheduled_date ?? null,
        },
      ])
      .select()
      .single();
    if (error) throw new Error(error.message);

    for (const row of input.importedRows) {
      const contact = await upsertContactFromRow(row, input.columnHeaders);
      await client.database.from("campaign_logs").insert([
        {
          campaign_id: campaign.id,
          contact_id: contact.id,
          status: "pending",
        },
      ]);
    }
    return campaign as Campaign;
  }

  const store = readLocalStore();
  const campaign: Campaign = {
    id: generateId(),
    name: input.name,
    template_message: input.template_message,
    scheduled_date: input.scheduled_date ?? null,
    created_at: new Date().toISOString(),
  };
  store.campaigns.push(campaign);

  for (const row of input.importedRows) {
    const contact = await upsertContactFromRow(row, input.columnHeaders);
    store.campaign_logs.push({
      id: generateId(),
      campaign_id: campaign.id,
      contact_id: contact.id,
      status: "pending",
      sent_at: null,
    });
  }
  writeLocalStore(store);
  return campaign;
}

export async function deleteCampaign(id: string): Promise<void> {
  const client = getInsforgeClient();
  if (client) {
    await client.database.from("campaign_logs").delete().eq("campaign_id", id);
    const { error } = await client.database.from("campaigns").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  const store = readLocalStore();
  store.campaigns = store.campaigns.filter((c) => c.id !== id);
  store.campaign_logs = store.campaign_logs.filter((l) => l.campaign_id !== id);
  writeLocalStore(store);
}

// ——— Campaign logs ———

export async function getCampaignLogs(
  campaignId: string
): Promise<(CampaignLog & { contact: Contact })[]> {
  const client = getInsforgeClient();
  if (client) {
    const { data, error } = await client.database
      .from("campaign_logs")
      .select("*, contact:contacts(*)")
      .eq("campaign_id", campaignId);
    if (error) throw new Error(error.message);
    return (data ?? []).map((row: Record<string, unknown>) => ({
      ...(row as unknown as CampaignLog),
      contact: (row as { contact: Contact }).contact,
    }));
  }

  const store = readLocalStore();
  return store.campaign_logs
    .filter((l) => l.campaign_id === campaignId)
    .map((log) => {
      const contact = store.contacts.find((c) => c.id === log.contact_id)!;
      return { ...log, contact };
    });
}

export async function markContactAsSent(
  campaignId: string,
  contactId: string
): Promise<CampaignLog> {
  const client = getInsforgeClient();
  const now = new Date().toISOString();

  if (client) {
    const { data, error } = await client.database
      .from("campaign_logs")
      .update({ status: "sent" as CampaignLogStatus, sent_at: now })
      .eq("campaign_id", campaignId)
      .eq("contact_id", contactId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as CampaignLog;
  }

  const store = readLocalStore();
  const idx = store.campaign_logs.findIndex(
    (l) => l.campaign_id === campaignId && l.contact_id === contactId
  );
  if (idx === -1) throw new Error("Log introuvable");
  store.campaign_logs[idx] = {
    ...store.campaign_logs[idx],
    status: "sent",
    sent_at: now,
  };
  writeLocalStore(store);
  return store.campaign_logs[idx];
}

export function isUsingLocalStorage(): boolean {
  return !isInsforgeConfigured();
}
