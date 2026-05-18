import { getInsforgeClient } from "@/lib/inforge";
import { saveAttachmentBlob } from "@/lib/attachment-store";
import type { CampaignAttachment } from "@/types";

function generateAttachmentId(): string {
  return `att-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Enregistre les fichiers (cloud si possible + IndexedDB pour l’extension). */
export async function uploadCampaignAttachments(
  files: File[]
): Promise<CampaignAttachment[]> {
  const client = getInsforgeClient();
  const results: CampaignAttachment[] = [];

  for (const file of files) {
    const id = generateAttachmentId();
    await saveAttachmentBlob(id, file);

    const meta: CampaignAttachment = {
      id,
      name: file.name,
      mimeType: file.type,
      size: file.size,
    };

    if (client) {
      try {
        const path = `campaigns/${id}/${file.name}`;
        const { data, error } = await client.storage
          .from("campaign-attachments")
          .upload(path, file);

        if (!error && data?.url && data?.key) {
          meta.url = data.url;
          meta.storageKey = data.key;
        }
      } catch {
        /* bucket absent ou RLS — IndexedDB suffit pour l’extension */
      }
    }

    results.push(meta);
  }

  return results;
}
