/** Types MIME acceptés pour les campagnes (WhatsApp Web). */
export const ACCEPTED_ATTACHMENT_TYPES: Record<string, string[]> = {
  images: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  pdf: ["application/pdf"],
  presentations: [
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ],
  audio: [
    "audio/mpeg",
    "audio/mp3",
    "audio/mp4",
    "audio/ogg",
    "audio/wav",
    "audio/webm",
    "audio/aac",
    "audio/x-m4a",
  ],
};

export const ACCEPTED_MIME_TYPES = Object.values(
  ACCEPTED_ATTACHMENT_TYPES
).flat();

export const ACCEPTED_FILE_EXTENSIONS =
  ".jpg,.jpeg,.png,.webp,.gif,.pdf,.ppt,.pptx,.mp3,.mpeg,.mp4,.m4a,.ogg,.wav,.webm,.aac";

export const MAX_ATTACHMENTS = 10;
export const MAX_ATTACHMENT_BYTES = 16 * 1024 * 1024; // 16 Mo / fichier

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function getAttachmentKind(
  mimeType: string
): "image" | "pdf" | "presentation" | "audio" | "other" {
  if (ACCEPTED_ATTACHMENT_TYPES.images.includes(mimeType)) return "image";
  if (ACCEPTED_ATTACHMENT_TYPES.pdf.includes(mimeType)) return "pdf";
  if (ACCEPTED_ATTACHMENT_TYPES.presentations.includes(mimeType))
    return "presentation";
  if (ACCEPTED_ATTACHMENT_TYPES.audio.includes(mimeType)) return "audio";
  return "other";
}

export function validateAttachmentFile(file: File): string | null {
  if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
    return `Type non supporté : ${file.name} (${file.type || "inconnu"})`;
  }
  if (file.size > MAX_ATTACHMENT_BYTES) {
    return `Fichier trop volumineux (max ${formatFileSize(MAX_ATTACHMENT_BYTES)}) : ${file.name}`;
  }
  return null;
}
