import { createClient } from "@insforge/sdk";
import {
  findNameFromRow,
  findPhoneFromRow,
  prepareImportRows,
  rowToSnapshot,
} from "@/lib/contacts";
import type {
  Campaign,
  CampaignAttachment,
  CampaignLog,
  CampaignLogStatus,
  Contact,
  CreateCampaignInput,
  ImportedRow,
  UpdateContactInput,
} from "@/types";

function normalizeCampaign(row: Record<string, unknown>): Campaign {
  const raw = row.attachments;
  let attachments: CampaignAttachment[] = [];
  if (Array.isArray(raw)) {
    attachments = raw as CampaignAttachment[];
  } else if (typeof raw === "string") {
    try {
      attachments = JSON.parse(raw) as CampaignAttachment[];
    } catch {
      attachments = [];
    }
  }
  return {
    ...(row as unknown as Campaign),
    attachments,
  };
}

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
  const phone = findPhoneFromRow(headers, row);
  if (!phone) throw new Error("Numéro de téléphone manquant");

  const name = findNameFromRow(headers, row);
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

export async function updateContact(
  id: string,
  input: UpdateContactInput
): Promise<Contact> {
  const phone = input.phone?.replace(/\D/g, "");
  if (phone !== undefined && !phone) {
    throw new Error("Le numéro de téléphone est requis.");
  }

  const client = getInsforgeClient();
  if (client) {
    const payload: Record<string, unknown> = {};
    if (input.name !== undefined) payload.name = input.name;
    if (phone !== undefined) payload.phone = phone;
    if (input.custom_data !== undefined) payload.custom_data = input.custom_data;

    const { data, error } = await client.database
      .from("contacts")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Contact;
  }

  const store = readLocalStore();
  const idx = store.contacts.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error("Contact introuvable");

  const updated: Contact = {
    ...store.contacts[idx],
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(phone !== undefined ? { phone } : {}),
    ...(input.custom_data !== undefined
      ? { custom_data: input.custom_data }
      : {}),
  };
  store.contacts[idx] = updated;
  writeLocalStore(store);
  return updated;
}

export async function deleteContact(id: string): Promise<void> {
  const client = getInsforgeClient();
  if (client) {
    await client.database.from("campaign_logs").delete().eq("contact_id", id);
    const { error } = await client.database.from("contacts").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }

  const store = readLocalStore();
  store.contacts = store.contacts.filter((c) => c.id !== id);
  store.campaign_logs = store.campaign_logs.filter((l) => l.contact_id !== id);
  writeLocalStore(store);
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
    return (data ?? []).map((row) =>
      normalizeCampaign(row as Record<string, unknown>)
    );
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
    return data
      ? normalizeCampaign(data as Record<string, unknown>)
      : null;
  }
  return readLocalStore().campaigns.find((c) => c.id === id) ?? null;
}

const LOGS_PAGE_SIZE = 1000;

async function insertCampaignLogsBatch(
  client: NonNullable<ReturnType<typeof getInsforgeClient>>,
  logs: {
    campaign_id: string;
    contact_id: string;
    status: string;
    row_data: Record<string, string>;
  }[]
): Promise<void> {
  const chunkSize = 200;
  let stripRowData = false;

  for (let i = 0; i < logs.length; i += chunkSize) {
    const slice = logs.slice(i, i + chunkSize);
    const chunk = stripRowData
      ? slice.map((log) => ({
          campaign_id: log.campaign_id,
          contact_id: log.contact_id,
          status: log.status,
        }))
      : slice;

    const { error } = await client.database.from("campaign_logs").insert(chunk);
    if (error) {
      const msg = error.message.toLowerCase();
      if (!stripRowData && msg.includes("row_data")) {
        stripRowData = true;
        i -= chunkSize;
        continue;
      }
      throw new Error(error.message);
    }
  }
}

export async function createCampaign(
  input: CreateCampaignInput
): Promise<Campaign> {
  const { rows, skippedNoPhone, skippedDuplicate } = prepareImportRows(
    input.columnHeaders,
    input.importedRows
  );

  if (rows.length === 0) {
    const parts: string[] = [];
    if (skippedNoPhone > 0) {
      parts.push(`${skippedNoPhone} ligne(s) sans numéro valide`);
    }
    if (skippedDuplicate > 0) {
      parts.push(`${skippedDuplicate} doublon(s)`);
    }
    throw new Error(
      parts.length > 0
        ? `Aucun contact importable : ${parts.join(", ")}.`
        : "Aucun contact valide dans le fichier."
    );
  }

  const client = getInsforgeClient();

  if (client) {
    const { data: campaign, error } = await client.database
      .from("campaigns")
      .insert([
        {
          name: input.name,
          template_message: input.template_message,
          scheduled_date: input.scheduled_date ?? null,
          attachments: input.attachments ?? [],
        },
      ])
      .select()
      .single();
    if (error) throw new Error(error.message);

    const logsToInsert: {
      campaign_id: string;
      contact_id: string;
      status: string;
      row_data: Record<string, string>;
    }[] = [];

    for (const row of rows) {
      const contact = await upsertContactFromRow(row, input.columnHeaders);
      logsToInsert.push({
        campaign_id: campaign.id,
        contact_id: contact.id,
        status: "pending",
        row_data: rowToSnapshot(input.columnHeaders, row),
      });
    }

    await insertCampaignLogsBatch(client, logsToInsert);
    return normalizeCampaign(campaign as Record<string, unknown>);
  }

  const store = readLocalStore();
  const campaign: Campaign = {
    id: generateId(),
    name: input.name,
    template_message: input.template_message,
    scheduled_date: input.scheduled_date ?? null,
    attachments: input.attachments ?? [],
    created_at: new Date().toISOString(),
  };
  store.campaigns.push(campaign);

  for (const row of rows) {
    const contact = await upsertContactFromRow(row, input.columnHeaders);
    store.campaign_logs.push({
      id: generateId(),
      campaign_id: campaign.id,
      contact_id: contact.id,
      status: "pending",
      sent_at: null,
      row_data: rowToSnapshot(input.columnHeaders, row),
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
    const all: (CampaignLog & { contact: Contact })[] = [];
    let from = 0;

    while (true) {
      const to = from + LOGS_PAGE_SIZE - 1;
      const { data, error } = await client.database
        .from("campaign_logs")
        .select("*, contact:contacts(*)")
        .eq("campaign_id", campaignId)
        .order("id", { ascending: true })
        .range(from, to);
      if (error) throw new Error(error.message);

      const page = (data ?? []).map((row: Record<string, unknown>) => {
        const log = row as unknown as CampaignLog & { contact: Contact };
        return {
          ...log,
          row_data:
            (log.row_data as Record<string, string> | undefined) ??
            log.contact?.custom_data ??
            {},
          contact: (row as { contact: Contact }).contact,
        };
      });

      all.push(...page);
      if (page.length < LOGS_PAGE_SIZE) break;
      from += LOGS_PAGE_SIZE;
    }

    return all;
  }

  const store = readLocalStore();
  return store.campaign_logs
    .filter((l) => l.campaign_id === campaignId)
    .map((log) => {
      const contact = store.contacts.find((c) => c.id === log.contact_id)!;
      return {
        ...log,
        row_data: log.row_data ?? contact.custom_data ?? {},
        contact,
      };
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
