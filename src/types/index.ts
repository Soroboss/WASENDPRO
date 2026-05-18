export type CampaignLogStatus = "pending" | "sent" | "failed";

export interface Contact {
  id: string;
  phone: string;
  name: string | null;
  custom_data: Record<string, string>;
  created_at: string;
}

export interface CampaignAttachment {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  url?: string;
  storageKey?: string;
}

export interface Campaign {
  id: string;
  name: string;
  template_message: string;
  scheduled_date: string | null;
  attachments: CampaignAttachment[];
  /** Indicatif pays pour les numéros (ex. 33, 221). */
  country_dial: string;
  created_at: string;
}

export interface CampaignLog {
  id: string;
  campaign_id: string;
  contact_id: string;
  status: CampaignLogStatus;
  sent_at: string | null;
  /** Données Excel de la ligne au moment de l’import (message personnalisé). */
  row_data?: Record<string, string>;
}

export interface ImportedRow {
  [key: string]: string;
}

export interface CampaignContactRow {
  contact: Contact;
  log: CampaignLog;
  rowData: Record<string, string>;
}

/** Contacts regroupés sous une campagne (annuaire par campagne). */
export interface CampaignContactGroup {
  campaign: Campaign;
  entries: CampaignContactRow[];
}

export interface CreateCampaignInput {
  name: string;
  template_message: string;
  scheduled_date?: string | null;
  importedRows: ImportedRow[];
  columnHeaders: string[];
  attachments?: CampaignAttachment[];
  countryDialCode: string;
}

export interface UpdateContactInput {
  name?: string | null;
  phone?: string;
  custom_data?: Record<string, string>;
}
