"use client";

import { motion } from "framer-motion";
import { COUNTRIES } from "@/lib/countries";
import type { ContactSort, HasNameFilter } from "@/lib/contact-filters";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ArrowDownAZ,
  CheckSquare,
  ChevronDown,
  Copy,
  Download,
  Phone,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";

interface ContactsToolbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  dialCode: string;
  onDialCodeChange: (v: string) => void;
  sort: ContactSort;
  onSortChange: (v: ContactSort) => void;
  hasName: HasNameFilter;
  onHasNameChange: (v: HasNameFilter) => void;
  dialCounts: Map<string, number>;
  filteredCount: number;
  totalCount: number;
  selectedCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  allVisibleSelected: boolean;
  onBulkDelete: () => void;
  onBulkCopy: () => void;
  onBulkExport: () => void;
  bulkBusy?: boolean;
  className?: string;
}

export function ContactsToolbar({
  search,
  onSearchChange,
  dialCode,
  onDialCodeChange,
  sort,
  onSortChange,
  hasName,
  onHasNameChange,
  dialCounts,
  filteredCount,
  totalCount,
  selectedCount,
  onSelectAll,
  onClearSelection,
  allVisibleSelected,
  onBulkDelete,
  onBulkCopy,
  onBulkExport,
  bulkBusy,
  className,
}: ContactsToolbarProps) {
  const hasFilters =
    search.trim() !== "" || dialCode !== "" || hasName !== "all";

  return (
    <motion.div
      className={cn(
        "glass-panel rounded-xl border border-white/5 overflow-hidden",
        className
      )}
    >
      <div className="flex flex-col gap-3 p-4">
        <motion.div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <motion.div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher nom, téléphone, entreprise…"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-10 rounded-lg bg-background/60 border-border/60"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Effacer la recherche"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </motion.div>

          <motion.div className="flex flex-wrap items-center gap-2">
            <Select
              value={dialCode || "all"}
              onValueChange={(v) =>
                onDialCodeChange(!v || v === "all" ? "" : v)
              }
            >
              <SelectTrigger className="h-10 w-[160px] rounded-lg bg-background/60 border-border/60">
                <Phone className="h-3.5 w-3.5 mr-2 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Pays" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les pays</SelectItem>
                {COUNTRIES.filter((c) => dialCounts.has(c.dialCode)).map((c) => (
                    <SelectItem key={c.iso} value={c.dialCode}>
                      {c.flag} +{c.dialCode}
                      {dialCounts.get(c.dialCode)
                        ? ` (${dialCounts.get(c.dialCode)})`
                        : ""}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <Select
              value={hasName}
              onValueChange={(v) => onHasNameChange(v as HasNameFilter)}
            >
              <SelectTrigger className="h-10 w-[140px] rounded-lg bg-background/60 border-border/60">
                <SlidersHorizontal className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="yes">Avec nom</SelectItem>
                <SelectItem value="no">Sans nom</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sort}
              onValueChange={(v) => onSortChange(v as ContactSort)}
            >
              <SelectTrigger className="h-10 w-[150px] rounded-lg bg-background/60 border-border/60">
                <ArrowDownAZ className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="phone">Trier par numéro</SelectItem>
                <SelectItem value="name">Trier par nom</SelectItem>
                <SelectItem value="date-desc">Plus récents</SelectItem>
                <SelectItem value="date-asc">Plus anciens</SelectItem>
              </SelectContent>
            </Select>

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="h-10 rounded-lg text-muted-foreground"
                onClick={() => {
                  onSearchChange("");
                  onDialCodeChange("");
                  onHasNameChange("all");
                }}
              >
                Réinitialiser
              </Button>
            )}
          </motion.div>
        </motion.div>

        <motion.div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/40">
          <motion.div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline" className="rounded-md font-normal tabular-nums">
              {filteredCount} sur {totalCount} contact
              {totalCount !== 1 ? "s" : ""}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 rounded-lg gap-1.5 text-xs"
              onClick={allVisibleSelected ? onClearSelection : onSelectAll}
            >
              <CheckSquare className="h-3.5 w-3.5" />
              {allVisibleSelected ? "Tout désélectionner" : "Tout sélectionner"}
            </Button>
          </motion.div>

          {selectedCount > 0 && (
            <motion.div className="flex flex-wrap items-center gap-2">
              <Badge className="rounded-md bg-neon/15 text-neon border-neon/30">
                {selectedCount} sélectionné{selectedCount > 1 ? "s" : ""}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger
                  disabled={bulkBusy}
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "h-8 rounded-lg btn-neon-outline gap-1"
                  )}
                >
                  Actions groupées
                  <ChevronDown className="h-3.5 w-3.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem onClick={onBulkCopy} className="gap-2">
                    <Copy className="h-4 w-4" />
                    Copier les numéros
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onBulkExport} className="gap-2">
                    <Download className="h-4 w-4" />
                    Exporter en Excel
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={onBulkDelete}
                    className="gap-2 text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Supprimer la sélection
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg"
                onClick={onClearSelection}
                title="Annuler la sélection"
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

