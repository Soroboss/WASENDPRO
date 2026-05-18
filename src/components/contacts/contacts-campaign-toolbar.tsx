"use client";

import { motion } from "framer-motion";
import type { CampaignContactGroup } from "@/types";
import type { CampaignStatusFilter } from "@/lib/contact-filters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, Megaphone, Search, X } from "lucide-react";

interface ContactsCampaignToolbarProps {
  groups: CampaignContactGroup[];
  search: string;
  onSearchChange: (v: string) => void;
  campaignId: string;
  onCampaignIdChange: (v: string) => void;
  status: CampaignStatusFilter;
  onStatusChange: (v: CampaignStatusFilter) => void;
  visibleCount: number;
  className?: string;
}

export function ContactsCampaignToolbar({
  groups,
  search,
  onSearchChange,
  campaignId,
  onCampaignIdChange,
  status,
  onStatusChange,
  visibleCount,
  className,
}: ContactsCampaignToolbarProps) {
  const hasFilters =
    search.trim() !== "" || campaignId !== "" || status !== "all";

  return (
    <motion.div
      className={cn(
        "glass-panel rounded-xl border border-white/5 p-4 space-y-3",
        className
      )}
    >
      <motion.div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <motion.div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filtrer par nom ou numéro…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-10 rounded-lg bg-background/60 border-border/60"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </motion.div>

        <motion.div className="flex flex-wrap gap-2">
          <Select
            value={campaignId || "all"}
            onValueChange={(v) =>
              onCampaignIdChange(!v || v === "all" ? "" : v)
            }
          >
            <SelectTrigger className="h-10 min-w-[180px] rounded-lg bg-background/60">
              <Megaphone className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Campagne" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les campagnes</SelectItem>
              {groups.map((g) => (
                <SelectItem key={g.campaign.id} value={g.campaign.id}>
                  {g.campaign.name} ({g.entries.length})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={status}
            onValueChange={(v) => onStatusChange(v as CampaignStatusFilter)}
          >
            <SelectTrigger className="h-10 w-[150px] rounded-lg bg-background/60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous statuts</SelectItem>
              <SelectItem value="sent">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[hsl(152,76%,45%)]" />
                  Envoyés
                </span>
              </SelectItem>
              <SelectItem value="pending">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  En attente
                </span>
              </SelectItem>
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-10 rounded-lg"
              onClick={() => {
                onSearchChange("");
                onCampaignIdChange("");
                onStatusChange("all");
              }}
            >
              Réinitialiser
            </Button>
          )}
        </motion.div>
      </motion.div>

      <Badge variant="outline" className="rounded-md font-normal">
        {visibleCount} entrée{visibleCount !== 1 ? "s" : ""} affichée
        {visibleCount !== 1 ? "s" : ""}
      </Badge>
    </motion.div>
  );
}
