export type CampaignLogStatus = "pending" | "sent" | "failed";

export interface Contact {
  id: string;
  phone: string;
  name: string | null;
  custom_data: Record<string, string>;
  created_at: string;
}

export interface Campaign {
  id: string;
  name: string;
  template_message: string;
  scheduled_date: string | null;
  created_at: string;
}

export interface CampaignLog {
  id: string;
  campaign_id: string;
  contact_id: string;
  status: CampaignLogStatus;
  sent_at: string | null;
}

export interface ImportedRow {
  [key: string]: string;
}

export interface CampaignContactRow {
  contact: Contact;
  log: CampaignLog;
  rowData: Record<string, string>;
}

export interface CreateCampaignInput {
  name: string;
  template_message: string;
  scheduled_date?: string | null;
  importedRows: ImportedRow[];
  columnHeaders: string[];
}

export interface UpdateContactInput {
  name?: string | null;
  phone?: string;
  custom_data?: Record<string, string>;
}
