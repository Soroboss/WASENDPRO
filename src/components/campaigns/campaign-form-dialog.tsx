"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageEditor } from "./message-editor";
import { getMessageVariables } from "@/lib/contacts";
import { downloadExcelTemplate, parseExcelFile } from "@/lib/excel";
import { createCampaign } from "@/lib/inforge";
import { compileMessage } from "@/lib/message";
import type { ExtensionImportPayload } from "@/lib/extension-bridge";
import type { ImportedRow } from "@/types";
import {
  FileSpreadsheet,
  Download,
  Upload,
  Loader2,
  Users,
  Sparkles,
  Braces,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CampaignFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
  /** Données pré-remplies par l’extension Chrome */
  extensionImport?: ExtensionImportPayload | null;
  onExtensionImportConsumed?: () => void;
}

export function CampaignFormDialog({
  open,
  onOpenChange,
  onCreated,
  extensionImport,
  onExtensionImportConsumed,
}: CampaignFormDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [message, setMessage] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<ImportedRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setName("");
    setScheduledDate("");
    setMessage("");
    setHeaders([]);
    setRows([]);
    setError(null);
  };

  useEffect(() => {
    if (!open || !extensionImport) return;
    setHeaders(extensionImport.headers);
    setRows(extensionImport.rows);
    setError(null);
    if (extensionImport.fileName) {
      const base = extensionImport.fileName.replace(/\.[^.]+$/, "");
      setName((prev) => prev.trim() || `Campagne ${base}`);
    }
    onExtensionImportConsumed?.();
  }, [open, extensionImport, onExtensionImportConsumed]);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { headers: h, rows: r } = await parseExcelFile(file);
      if (r.length === 0) {
        setError("Le fichier Excel est vide.");
        return;
      }
      setHeaders(h);
      setRows(r);
      setError(null);
    } catch {
      setError("Impossible de lire le fichier Excel.");
    }
    e.target.value = "";
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Le nom de la campagne est requis.");
      return;
    }
    if (!message.trim()) {
      setError("Le message est requis.");
      return;
    }
    if (rows.length === 0) {
      setError("Importez au moins un contact via Excel.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await createCampaign({
        name: name.trim(),
        template_message: message,
        scheduled_date: scheduledDate || null,
        importedRows: rows,
        columnHeaders: headers,
      });
      reset();
      onOpenChange(false);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="dialog-premium max-h-[92vh] sm:max-w-2xl" showCloseButton>
        <DialogHeader className="dialog-premium-header">
          <DialogTitle className="flex items-center gap-3 text-lg">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
              <FileSpreadsheet className="h-5 w-5 text-[hsl(142,70%,38%)]" />
            </span>
            Nouvelle campagne
          </DialogTitle>
          <p className="text-sm text-muted-foreground font-normal">
            Importez vos contacts et personnalisez votre message
          </p>
        </DialogHeader>

        <div className="dialog-premium-body">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="campaign-name" className="section-label">
                Nom
              </Label>
              <Input
                id="campaign-name"
                className="input-soft h-10"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Promo été 2026"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduled" className="section-label">
                Programmation
              </Label>
              <Input
                id="scheduled"
                type="datetime-local"
                className="input-soft h-10"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-xl border border-dashed border-border/80 bg-muted/30 p-4 space-y-3">
            <p className="section-label">Contacts</p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-lg bg-background"
                onClick={() => downloadExcelTemplate()}
              >
                <Download className="h-4 w-4 mr-2" />
                Modèle Excel
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-lg bg-background"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Importer
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleImport}
              />
              {rows.length > 0 && (
                <Badge className="gap-1.5 bg-neon/10 text-neon border border-neon/25">
                  <Users className="h-3.5 w-3.5" />
                  {rows.length} contact{rows.length > 1 ? "s" : ""}
                </Badge>
              )}
            </div>

            {headers.length > 0 && (
              <div className="rounded-lg border border-white/10 bg-black/20 p-3 space-y-2">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Braces className="h-3 w-3 shrink-0" />
                  Colonnes disponibles comme variables dans le message :
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {getMessageVariables(headers).map((v) => (
                    <Badge
                      key={v}
                      variant="outline"
                      className="font-mono text-[10px] rounded-md border-neon/20"
                    >
                      {`{${v}}`}
                    </Badge>
                  ))}
                </div>
                {rows[0] && message.trim() && (
                  <p className="text-xs text-muted-foreground border-t border-white/10 pt-2">
                    <span className="section-label block mb-1">Aperçu (1er contact)</span>
                    <span className="font-mono line-clamp-3 block">
                      {compileMessage(message, rows[0])}
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>

          <MessageEditor
            value={message}
            onChange={setMessage}
            variables={headers}
          />

          {error && (
            <p className="text-sm text-destructive rounded-lg bg-destructive/10 px-3 py-2">
              {error}
            </p>
          )}
        </div>

        <div className="dialog-premium-footer">
          <Button
            variant="outline"
            className="rounded-lg"
            onClick={() => onOpenChange(false)}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className={cn("btn-whatsapp rounded-lg min-w-[140px]")}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Créer la campagne
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
