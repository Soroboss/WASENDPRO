"use client";

import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageEditor } from "./message-editor";
import { downloadExcelTemplate, parseExcelFile } from "@/lib/excel";
import { createCampaign } from "@/lib/inforge";
import type { ImportedRow } from "@/types";
import {
  FileSpreadsheet,
  Download,
  Upload,
  Loader2,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CampaignFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function CampaignFormDialog({
  open,
  onOpenChange,
  onCreated,
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-whatsapp" />
            Nouvelle campagne
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="campaign-name">Nom de la campagne</Label>
              <Input
                id="campaign-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Promo été 2026"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduled">Programmation (optionnel)</Label>
              <Input
                id="scheduled"
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => downloadExcelTemplate()}
            >
              <Download className="h-4 w-4 mr-2" />
              Télécharger le modèle Excel
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Importer Excel
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleImport}
            />
            {rows.length > 0 && (
              <Badge variant="secondary" className="gap-1">
                <Users className="h-3 w-3" />
                {rows.length} contact{rows.length > 1 ? "s" : ""}
              </Badge>
            )}
          </div>

          <MessageEditor
            value={message}
            onChange={setMessage}
            variables={headers}
          />

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Créer la campagne
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
