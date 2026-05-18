"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ACCEPTED_FILE_EXTENSIONS,
  formatFileSize,
  getAttachmentKind,
  MAX_ATTACHMENTS,
  validateAttachmentFile,
} from "@/lib/attachments";
import {
  FileAudio,
  FileImage,
  FileText,
  Paperclip,
  Presentation,
  X,
} from "lucide-react";

function KindIcon({ mimeType }: { mimeType: string }) {
  const kind = getAttachmentKind(mimeType);
  if (kind === "image") return <FileImage className="h-3.5 w-3.5" />;
  if (kind === "pdf") return <FileText className="h-3.5 w-3.5" />;
  if (kind === "presentation")
    return <Presentation className="h-3.5 w-3.5" />;
  if (kind === "audio") return <FileAudio className="h-3.5 w-3.5" />;
  return <Paperclip className="h-3.5 w-3.5" />;
}

interface CampaignAttachmentsFieldProps {
  files: File[];
  onChange: (files: File[]) => void;
  onError: (message: string | null) => void;
}

export function CampaignAttachmentsField({
  files,
  onChange,
  onError,
}: CampaignAttachmentsFieldProps) {
  const attachInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (list: FileList | null) => {
    if (!list?.length) return;
    const next = [...files];
    for (const file of Array.from(list)) {
      if (next.length >= MAX_ATTACHMENTS) {
        onError(`Maximum ${MAX_ATTACHMENTS} pièces jointes.`);
        break;
      }
      const err = validateAttachmentFile(file);
      if (err) {
        onError(err);
        continue;
      }
      if (next.some((f) => f.name === file.name && f.size === file.size)) {
        continue;
      }
      next.push(file);
    }
    onChange(next);
    onError(null);
  };

  const remove = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="rounded-xl border border-dashed border-border/80 bg-muted/30 p-4 space-y-3">
      <div>
        <p className="section-label">Pièces jointes (optionnel)</p>
        <p className="text-xs text-muted-foreground mt-1">
          JPEG, PNG, PDF, PowerPoint, MP3, WAV… — envoyées via l&apos;extension
          sur WhatsApp Web (max {MAX_ATTACHMENTS} fichiers, 16 Mo chacun).
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-lg bg-background"
          onClick={() => attachInputRef.current?.click()}
        >
          <Paperclip className="h-4 w-4 mr-2" />
          Ajouter des fichiers
        </Button>
        <input
          ref={attachInputRef}
          type="file"
          multiple
          accept={ACCEPTED_FILE_EXTENSIONS}
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.size}-${index}`}
              className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm"
            >
              <span className="flex items-center gap-2 min-w-0">
                <KindIcon mimeType={file.type} />
                <span className="truncate">{file.name}</span>
                <Badge variant="outline" className="text-[10px] shrink-0">
                  {formatFileSize(file.size)}
                </Badge>
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={() => remove(index)}
                aria-label={`Retirer ${file.name}`}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
