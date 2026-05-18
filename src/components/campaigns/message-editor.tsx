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
import { insertAtCursor } from "@/lib/message";
import { Braces } from "lucide-react";

interface MessageEditorProps {
  value: string;
  onChange: (value: string) => void;
  variables: string[];
  placeholder?: string;
}

export function MessageEditor({
  value,
  onChange,
  variables,
  placeholder = "Bonjour {Nom}, nous vous contactons depuis {Entreprise}...",
}: MessageEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selection, setSelection] = useState({ start: 0, end: 0 });

  const syncSelection = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    setSelection({ start: el.selectionStart, end: el.selectionEnd });
  }, []);

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
      onChange(newValue);

      requestAnimationFrame(() => {
        if (el) {
          el.focus();
          el.setSelectionRange(newCursor, newCursor);
          setSelection({ start: newCursor, end: newCursor });
        }
      });
    },
    [value, onChange, selection]
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="message" className="section-label">
          Message
        </Label>
        {variables.length > 0 && (
          <Select onValueChange={(v) => v && insertVariable(String(v))}>
            <SelectTrigger className="w-[200px] h-8 text-xs">
              <SelectValue placeholder="Insérer variable" />
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

      <Textarea
        id="message"
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onMouseUp={syncSelection}
        onKeyUp={syncSelection}
        onSelect={syncSelection}
        placeholder={placeholder}
        rows={6}
        className="resize-y font-mono text-sm input-soft min-h-[140px]"
      />

      {variables.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Braces className="h-3 w-3" />
            Cliquez pour insérer, ou surlignez du texte puis cliquez pour
            remplacer
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
    </div>
  );
}
