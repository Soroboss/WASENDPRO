import { getAttachmentBlob } from "@/lib/attachment-store";
import {
  WHATSAPP_SEND_EVENT,
  type WhatsAppSendPayload,
} from "@/lib/extension-bridge";
import type { CampaignAttachment } from "@/types";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] ?? "";
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Prépare les pièces jointes pour l’extension Chrome (WhatsApp Web). */
export async function queueWhatsAppAttachments(
  phone: string,
  message: string,
  attachments: CampaignAttachment[]
): Promise<boolean> {
  if (attachments.length === 0) return false;

  const files: WhatsAppSendPayload["attachments"] = [];

  for (const att of attachments) {
    const file = await getAttachmentBlob(att.id);
    if (!file) continue;
    const base64 = await fileToBase64(file);
    files.push({
      name: att.name,
      mimeType: att.mimeType,
      base64,
    });
  }

  if (files.length === 0) return false;

  window.dispatchEvent(
    new CustomEvent(WHATSAPP_SEND_EVENT, {
      detail: { phone, message, attachments: files } satisfies WhatsAppSendPayload,
    })
  );
  return true;
}
