"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
import { getMessageVariables, prepareImportRows } from "@/lib/contacts";
import { formatDialDisplay } from "@/lib/countries";
import { CountrySelector } from "@/components/settings/country-selector";
import { useCountryDial } from "@/hooks/use-country-dial";
import { downloadExcelTemplate, parseExcelFile } from "@/lib/excel";
import { createCampaign } from "@/lib/inforge";
import { compileMessage } from "@/lib/message";
import { uploadCampaignAttachments } from "@/lib/upload-campaign-attachments";
import { CampaignAttachmentsField } from "@/components/campaigns/campaign-attachments-field";
import {
  CampaignSourcePanel,
  type CampaignSourceMode,
} from "@/components/campaigns/campaign-source-panel";
import type { ExtensionImportPayload } from "@/lib/extension-bridge";
import type { CampaignFormPrefill, ImportedRow } from "@/types";
import {
  FileSpreadsheet,
  Loader2,
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
  /** Relance, annuaire ou duplication de campagne */
  prefill?: CampaignFormPrefill | null;
}

export function CampaignFormDialog({
  open,
  onOpenChange,
  onCreated,
  extensionImport,
  onExtensionImportConsumed,
  prefill,
}: CampaignFormDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { dialCode } = useCountryDial();
  const [rawRows, setRawRows] = useState<ImportedRow[]>([]);
  const [name, setName] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [message, setMessage] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<ImportedRow[]>([]);
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [importMeta, setImportMeta] = useState<string | null>(null);
  const [sourceMode, setSourceMode] = useState<CampaignSourceMode>("excel");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setName("");
    setScheduledDate("");
    setMessage("");
    setHeaders([]);
    setRows([]);
    setRawRows([]);
    setAttachmentFiles([]);
    setImportMeta(null);
    setSourceMode("excel");
    setError(null);
  };

  useEffect(() => {
    if (!open || !extensionImport) return;
    setHeaders(extensionImport.headers);
    setRawRows(extensionImport.rows);
    setRows(extensionImport.rows);
    setError(null);
    if (extensionImport.fileName) {
      const base = extensionImport.fileName.replace(/\.[^.]+$/, "");
      setName((prev) => prev.trim() || `Campagne ${base}`);
    }
    onExtensionImportConsumed?.();
  }, [open, extensionImport, onExtensionImportConsumed]);

  const applyRowsWithCountry = useCallback(
    (h: string[], raw: ImportedRow[], dial: string) => {
      const { rows: prepared, skippedNoPhone, skippedDuplicate } =
        prepareImportRows(h, raw, dial);
      setRows(prepared);
      const warnings: string[] = [];
      if (skippedNoPhone > 0) {
        warnings.push(`${skippedNoPhone} sans numéro valide`);
      }
      if (skippedDuplicate > 0) {
        warnings.push(`${skippedDuplicate} doublon(s) ignoré(s)`);
      }
      setImportMeta(
        prepared.length === 0
          ? `Aucun contact avec l'indicatif ${formatDialDisplay(dial)}`
          : warnings.length > 0
            ? `${prepared.length} contact(s) · indicatif ${formatDialDisplay(dial)} · ${warnings.join(" · ")}`
            : `${prepared.length} contact(s) · indicatif ${formatDialDisplay(dial)}`
      );
    },
    []
  );

  useEffect(() => {
    if (headers.length > 0 && rawRows.length > 0) {
      applyRowsWithCountry(headers, rawRows, dialCode);
    }
  }, [dialCode, headers, rawRows, applyRowsWithCountry]);

  const applyPrefill = useCallback(
    (data: CampaignFormPrefill) => {
      if (data.name) setName(data.name);
      if (data.template_message) setMessage(data.template_message);
      if (data.scheduled_date !== undefined) {
        setScheduledDate(data.scheduled_date ?? "");
      }
      if (data.importedRows && data.columnHeaders) {
        setHeaders(data.columnHeaders);
        setRawRows(data.importedRows);
        applyRowsWithCountry(
          data.columnHeaders,
          data.importedRows,
          data.countryDialCode ?? dialCode
        );
        setSourceMode(data.sourceCampaignId ? "relance" : "annuaire");
      }
    },
    [applyRowsWithCountry, dialCode]
  );

  useEffect(() => {
    if (!open || !prefill) return;
    applyPrefill(prefill);
  }, [open, prefill, applyPrefill]);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { headers: h, rawRows: raw, meta } = await parseExcelFile(
        file,
        dialCode
      );
      if (raw.length === 0) {
        setError("Le fichier Excel est vide.");
        return;
      }
      setHeaders(h);
      setRawRows(raw);
      applyRowsWithCountry(h, raw, dialCode);
      if (meta.imported === 0) {
        setError(
          `Aucun numéro valide avec l'indicatif ${formatDialDisplay(dialCode)}. Changez de pays ou corrigez la colonne Téléphone.`
        );
      } else {
        setError(null);
      }
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
      setError(
        "Ajoutez au moins un contact (Excel, annuaire ou campagne existante)."
      );
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const attachments =
        attachmentFiles.length > 0
          ? await uploadCampaignAttachments(attachmentFiles)
          : [];

      await createCampaign({
        name: name.trim(),
        template_message: message,
        scheduled_date: scheduledDate || null,
        importedRows: rows,
        columnHeaders: headers,
        attachments,
        countryDialCode: dialCode,
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

          <CountrySelector compact showHint />

          <div className="rounded-xl border border-dashed border-border/80 bg-muted/30 p-4 space-y-3">
            <p className="section-label">Source des contacts</p>
            <CampaignSourcePanel
              mode={sourceMode}
              onModeChange={setSourceMode}
              dialCode={dialCode}
              headers={headers}
              rows={rows}
              importMeta={importMeta}
              onDownloadTemplate={() => downloadExcelTemplate()}
              onExcelImportClick={() => fileInputRef.current?.click()}
              onDataLoaded={(h, r, meta) => {
                setHeaders(h);
                setRawRows(r);
                applyRowsWithCountry(h, r, dialCode);
                setImportMeta(meta);
                setError(r.length === 0 ? meta : null);
              }}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleImport}
            />

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
              </div>
            )}
          </div>

          <CampaignAttachmentsField
            files={attachmentFiles}
            onChange={setAttachmentFiles}
            onError={setError}
          />

          <MessageEditor
            value={message}
            onChange={setMessage}
            variables={headers}
            previewMessage={
              rows[0] && message.trim()
                ? compileMessage(message, rows[0])
                : undefined
            }
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
