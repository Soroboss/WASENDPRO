"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCampaigns } from "@/lib/inforge";
import type { Campaign } from "@/types";
import { Loader2, MessageSquare } from "lucide-react";

interface CampaignMessageReuseProps {
  onLoadMessage: (message: string, campaign: Campaign) => void;
  loadedFromId?: string | null;
}

export function CampaignMessageReuse({
  onLoadMessage,
  loadedFromId,
}: CampaignMessageReuseProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void getCampaigns()
      .then((list) => {
        if (!cancelled) setCampaigns(list);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = campaigns.find((c) => c.id === selectedId);

  const handleLoad = () => {
    if (!selected) return;
    onLoadMessage(selected.template_message, selected);
    setSelectedId(selected.id);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Chargement des campagnes…
      </div>
    );
  }

  if (campaigns.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-3">
      <p className="section-label flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-[hsl(142,70%,38%)]" />
        Message d&apos;une campagne existante
      </p>
      <p className="text-xs text-muted-foreground leading-relaxed">
        Reprenez le texte d&apos;une campagne déjà enregistrée, puis modifiez-le
        librement dans l&apos;éditeur ci-dessous.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-2">
          <Label className="text-xs text-muted-foreground">Campagne</Label>
          <Select
            value={selectedId || "none"}
            onValueChange={(v) => setSelectedId(!v || v === "none" ? "" : v)}
          >
            <SelectTrigger className="h-10 rounded-lg bg-background/60">
              <SelectValue placeholder="Choisir une campagne…" />
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
        <Button
          type="button"
          variant="outline"
          className="rounded-lg shrink-0"
          disabled={!selectedId}
          onClick={handleLoad}
        >
          Charger le message
        </Button>
      </div>
      {loadedFromId && selected?.id === loadedFromId && (
        <p className="text-xs text-[hsl(152,76%,32%)]">
          Message chargé depuis « {selected.name} » — vous pouvez le modifier.
        </p>
      )}
    </div>
  );
}
