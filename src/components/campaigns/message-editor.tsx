"use client";

import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WhatsAppMessagePreview } from "@/components/campaigns/whatsapp-message-preview";
import { insertAtCursor } from "@/lib/message";
import {
  wrapWithWhatsAppFormat,
  type FormatWrapper,
} from "@/lib/whatsapp-format";
import {
  Bold,
  Braces,
  Code,
  Italic,
  Strikethrough,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageEditorProps {
  value: string;
  onChange: (value: string) => void;
  variables: string[];
  /** Message compilé (1er contact) pour l’aperçu WhatsApp */
  previewMessage?: string;
  placeholder?: string;
}

export function MessageEditor({
  value,
  onChange,
  variables,
  previewMessage,
  placeholder = "Bonjour {Nom},\n\nVotre *offre* est prête…",
}: MessageEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selection, setSelection] = useState({ start: 0, end: 0 });

  const syncSelection = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    setSelection({ start: el.selectionStart, end: el.selectionEnd });
  }, []);

  const applyChange = useCallback(
    (newValue: string, newCursor: number) => {
      onChange(newValue);
      requestAnimationFrame(() => {
        const el = textareaRef.current;
        if (el) {
          el.focus();
          el.setSelectionRange(newCursor, newCursor);
          setSelection({ start: newCursor, end: newCursor });
        }
      });
    },
    [onChange]
  );

  const insertVariable = useCallback(
    (varName: string) => {
      const token = `{${varName}}`;
      const el = textareaRef.current;
      const start = el?.selectionStart ?? selection.start;
      const end = el?.selectionEnd ?? selection.end;
      const hasSelection = start !== end;

      const { newValue, newCursor } = insertAtCursor(
        value,
        token,
        start,
        end,
        hasSelection
      );
      applyChange(newValue, newCursor);
    },
    [value, applyChange, selection]
  );

  const applyFormat = useCallback(
    (format: FormatWrapper) => {
      const el = textareaRef.current;
      const start = el?.selectionStart ?? selection.start;
      const end = el?.selectionEnd ?? selection.end;
      const { newValue, newCursor } = wrapWithWhatsAppFormat(
        value,
        start,
        end,
        format
      );
      applyChange(newValue, newCursor);
    },
    [value, applyChange, selection]
  );

  const displayPreview = (previewMessage ?? value).trim();

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label htmlFor="message" className="section-label">
          Message
        </Label>
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[10px] text-muted-foreground mr-1 hidden sm:inline">
            Mise en forme :
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg"
            title="Gras (*texte*)"
            onClick={() => applyFormat("bold")}
          >
            <Bold className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg"
            title="Italique (_texte_)"
            onClick={() => applyFormat("italic")}
          >
            <Italic className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg"
            title="Barré (~texte~)"
            onClick={() => applyFormat("strike")}
          >
            <Strikethrough className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg"
            title="Code (```texte```)"
            onClick={() => applyFormat("code")}
          >
            <Code className="h-3.5 w-3.5" />
          </Button>
          {variables.length > 0 && (
            <Select onValueChange={(v) => v && insertVariable(String(v))}>
              <SelectTrigger className="w-[160px] h-8 text-xs ml-1">
                <SelectValue placeholder="Variable" />
              </SelectTrigger>
              <SelectContent>
                {variables.map((v) => (
                  <SelectItem key={v} value={v}>
                    {`{${v}}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground -mt-1">
        WhatsApp : *gras* · _italique_ · ~barré~ · ```code``` — les retours à la
        ligne sont conservés à l&apos;envoi.
      </p>

      <Textarea
        id="message"
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onMouseUp={syncSelection}
        onKeyUp={syncSelection}
        onSelect={syncSelection}
        placeholder={placeholder}
        rows={8}
        className={cn(
          "resize-y text-sm input-soft min-h-[160px]",
          "leading-relaxed whitespace-pre-wrap"
        )}
      />

      {variables.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Braces className="h-3 w-3" />
            Variables — cliquez pour insérer
          </p>
          <div className="flex flex-wrap gap-2">
            {variables.map((v) => (
              <Button
                key={v}
                type="button"
                variant="secondary"
                size="sm"
                className="h-7 text-xs font-mono rounded-md bg-accent/80 hover:bg-accent border-0"
                onClick={() => insertVariable(v)}
              >
                {`{${v}}`}
              </Button>
            ))}
          </div>
        </div>
      )}

      {displayPreview && (
        <div className="rounded-xl border border-white/10 bg-muted/20 p-4">
          <WhatsAppMessagePreview
            text={displayPreview}
            label={
              previewMessage
                ? "Aperçu avant envoi (1er contact)"
                : "Aperçu du message"
            }
          />
        </div>
      )}
    </div>
  );
}
