"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CampaignManualContacts } from "@/components/campaigns/campaign-manual-contacts";
import {
  contactsToImportedRows,
  logsToImportedRows,
  relanceFilterLabel,
  type CampaignRelanceFilter,
} from "@/lib/campaign-sources";
import { deduplicateContactsByPhone } from "@/lib/contacts";
import { formatDialDisplay } from "@/lib/countries";
import {
  getCampaignLogs,
  getCampaigns,
  getContacts,
} from "@/lib/inforge";
import type { Campaign, ImportedRow } from "@/types";
import {
  BookUser,
  Download,
  FileSpreadsheet,
  Loader2,
  Megaphone,
  RefreshCw,
  Upload,
  UserPlus,
} from "lucide-react";

export type CampaignSourceMode = "excel" | "annuaire" | "relance" | "manuel";

interface CampaignSourcePanelProps {
  mode: CampaignSourceMode;
  onModeChange: (mode: CampaignSourceMode) => void;
  dialCode: string;
  headers: string[];
  rows: ImportedRow[];
  onDataLoaded: (headers: string[], rows: ImportedRow[], meta: string) => void;
  onExcelImportClick: () => void;
  onDownloadTemplate: () => void;
  importMeta: string | null;
  /** Charge le message (et optionnellement le pays) depuis une campagne source. */
  onMessageFromCampaign?: (campaign: Campaign) => void;
}

export function CampaignSourcePanel({
  mode,
  onModeChange,
  dialCode,
  rows,
  onDataLoaded,
  onExcelImportClick,
  onDownloadTemplate,
  importMeta,
  onMessageFromCampaign,
}: CampaignSourcePanelProps) {
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [sourceCampaignId, setSourceCampaignId] = useState("");
  const [relanceFilter, setRelanceFilter] =
    useState<CampaignRelanceFilter>("pending");
  const [reuseMessage, setReuseMessage] = useState(true);

  const loadAnnuaire = useCallback(async () => {
    setLoading(true);
    try {
      const list = deduplicateContactsByPhone(await getContacts());
      const { headers: h, rows: r } = contactsToImportedRows(list);
      onDataLoaded(
        h,
        r,
        `${r.length} contact(s) depuis l'annuaire · ${formatDialDisplay(dialCode)}`
      );
    } finally {
      setLoading(false);
    }
  }, [dialCode, onDataLoaded]);

  const loadRelance = useCallback(async () => {
    if (!sourceCampaignId) return;
    setLoading(true);
    try {
      const logs = await getCampaignLogs(sourceCampaignId);
      const { headers: h, rows: r } = logsToImportedRows(
        logs.map((l) => ({
          contact: l.contact,
          status: l.status,
          row_data: l.row_data,
        })),
        relanceFilter
      );
      const campaign = campaigns.find((c) => c.id === sourceCampaignId);
      if (campaign && reuseMessage) {
        onMessageFromCampaign?.(campaign);
      }
      onDataLoaded(
        h,
        r,
        r.length === 0
          ? `Aucun contact (${relanceFilterLabel(relanceFilter)})`
          : `${r.length} contact(s) · ${campaign?.name ?? "campagne"} · ${relanceFilterLabel(relanceFilter)}`
      );
    } finally {
      setLoading(false);
    }
  }, [
    sourceCampaignId,
    relanceFilter,
    campaigns,
    onDataLoaded,
    reuseMessage,
    onMessageFromCampaign,
  ]);

  useEffect(() => {
    if (mode !== "relance" && mode !== "excel") return;
    void getCampaigns().then(setCampaigns);
  }, [mode]);

  useEffect(() => {
    if (mode === "annuaire" && rows.length === 0) void loadAnnuaire();
  }, [mode, loadAnnuaire, rows.length]);

  useEffect(() => {
    if (mode === "relance" && sourceCampaignId) void loadRelance();
  }, [mode, sourceCampaignId, relanceFilter, loadRelance]);

  useEffect(() => {
    if (mode !== "relance" || !sourceCampaignId || !reuseMessage) return;
    const campaign = campaigns.find((c) => c.id === sourceCampaignId);
    if (campaign) onMessageFromCampaign?.(campaign);
  }, [mode, sourceCampaignId, reuseMessage, campaigns, onMessageFromCampaign]);

  return (
    <Tabs
      value={mode}
      onValueChange={(v) => onModeChange(v as CampaignSourceMode)}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto min-h-10 p-1 rounded-lg bg-muted/40 gap-1">
        <TabsTrigger value="excel" className="rounded-md text-xs gap-1 px-2">
          <FileSpreadsheet className="h-3.5 w-3.5 shrink-0" />
          Excel
        </TabsTrigger>
        <TabsTrigger value="manuel" className="rounded-md text-xs gap-1 px-2">
          <UserPlus className="h-3.5 w-3.5 shrink-0" />
          Manuel
        </TabsTrigger>
        <TabsTrigger value="annuaire" className="rounded-md text-xs gap-1 px-2">
          <BookUser className="h-3.5 w-3.5 shrink-0" />
          Annuaire
        </TabsTrigger>
        <TabsTrigger value="relance" className="rounded-md text-xs gap-1 px-2">
          <Megaphone className="h-3.5 w-3.5 shrink-0" />
          Relance
        </TabsTrigger>
      </TabsList>

      <TabsContent value="excel" className="mt-3 space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-lg"
            onClick={onDownloadTemplate}
          >
            <Download className="h-4 w-4 mr-2" />
            Modèle
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-lg"
            onClick={onExcelImportClick}
          >
            <Upload className="h-4 w-4 mr-2" />
            Importer un fichier
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="manuel" className="mt-3">
        <CampaignManualContacts
          dialCode={dialCode}
          onApply={(h, r, meta) => onDataLoaded(h, r, meta)}
        />
      </TabsContent>

      <TabsContent value="annuaire" className="mt-3 space-y-3">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Réutilise tous les numéros déjà enregistrés dans l&apos;annuaire (sans
          re-importer Excel).
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-lg"
          disabled={loading}
          onClick={() => void loadAnnuaire()}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Actualiser depuis l&apos;annuaire
        </Button>
      </TabsContent>

      <TabsContent value="relance" className="mt-3 space-y-3">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Nouvelle campagne à partir d&apos;une campagne existante : contacts +
          message modifiable.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="section-label">Campagne source</Label>
            <Select
              value={sourceCampaignId || "none"}
              onValueChange={(v) =>
                setSourceCampaignId(!v || v === "none" ? "" : v)
              }
            >
              <SelectTrigger className="h-10 rounded-lg">
                <SelectValue placeholder="Choisir…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sélectionner…</SelectItem>
                {campaigns.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="section-label">Contacts à reprendre</Label>
            <Select
              value={relanceFilter}
              onValueChange={(v) =>
                setRelanceFilter(v as CampaignRelanceFilter)
              }
            >
              <SelectTrigger className="h-10 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Non envoyés seulement</SelectItem>
                <SelectItem value="sent">Déjà envoyés (relance)</SelectItem>
                <SelectItem value="all">Tous</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            className="rounded border-border"
            checked={reuseMessage}
            onChange={(e) => setReuseMessage(e.target.checked)}
          />
          <span>Reprendre aussi le message de la campagne (modifiable ensuite)</span>
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-lg"
          disabled={loading || !sourceCampaignId}
          onClick={() => void loadRelance()}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Charger contacts et message
        </Button>
      </TabsContent>

      {(importMeta || rows.length > 0) && (
        <div className="rounded-lg border border-neon/20 bg-neon/5 px-3 py-2 flex flex-wrap items-center gap-2 mt-3">
          {importMeta && (
            <p className="text-xs text-muted-foreground flex-1 min-w-[200px]">
              {importMeta}
            </p>
          )}
          {rows.length > 0 && (
            <Badge className="bg-neon/10 text-neon border-neon/25 shrink-0">
              {rows.length} contact{rows.length > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
      )}
    </Tabs>
  );
}
