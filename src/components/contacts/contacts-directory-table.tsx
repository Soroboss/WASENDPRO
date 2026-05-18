"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getDisplayCellValue } from "@/lib/contacts";
import { detectDialFromPhone } from "@/lib/contact-filters";
import { COUNTRIES, formatDialDisplay } from "@/lib/countries";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import type { Contact } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink, Loader2, Pencil, Trash2 } from "lucide-react";

interface ContactsDirectoryTableProps {
  contacts: Contact[];
  customKeys: string[];
  deletingId: string | null;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  allSelected: boolean;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
}

function ContactAvatar({ name }: { name?: string | null }) {
  const initials = name?.trim()
    ? name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "•";
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neon/20 bg-neon/10 text-xs font-semibold text-neon">
      {initials.slice(0, 2)}
    </span>
  );
}

function CountryBadge({ phone }: { phone: string }) {
  const dial = detectDialFromPhone(phone);
  const country = dial ? COUNTRIES.find((c) => c.dialCode === dial) : null;
  if (!country) return null;
  return (
    <Badge
      variant="outline"
      className="rounded-md text-[10px] font-normal border-border/60"
    >
      {country.flag} {formatDialDisplay(country.dialCode)}
    </Badge>
  );
}

const COL = {
  check: "w-11",
  contact: "w-[min(220px,28%)]",
  phone: "w-[min(200px,24%)]",
  custom: "min-w-[100px]",
  date: "w-[110px]",
  actions: "w-[116px]",
} as const;

export function ContactsDirectoryTable({
  contacts,
  customKeys,
  deletingId,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  allSelected,
  onEdit,
  onDelete,
}: ContactsDirectoryTableProps) {
  const displayKeys = customKeys.slice(0, 4);

  const copyPhone = async (phone: string) => {
    try {
      await navigator.clipboard.writeText(phone);
    } catch {
      /* ignore */
    }
  };

  return (
    <Card className="card-futurist overflow-hidden border-neon/10">
      <div className="overflow-x-auto max-h-[calc(100vh-420px)]">
        <Table className="table-fixed w-full min-w-[720px]">
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border/60">
              <TableHead className={cn(COL.check, "pl-4")}>
                <input
                  type="checkbox"
                  checked={allSelected && contacts.length > 0}
                  onChange={onToggleSelectAll}
                  className="h-4 w-4 rounded border-border accent-[hsl(var(--neon))] cursor-pointer"
                  aria-label="Sélectionner tout"
                />
              </TableHead>
              <TableHead className={cn(COL.contact, "font-semibold")}>
                Contact
              </TableHead>
              <TableHead className={cn(COL.phone, "font-semibold")}>
                Téléphone
              </TableHead>
              {displayKeys.map((key) => (
                <TableHead
                  key={key}
                  className={cn(COL.custom, "font-semibold hidden md:table-cell")}
                >
                  <span className="block truncate" title={key}>
                    {key}
                  </span>
                </TableHead>
              ))}
              <TableHead
                className={cn(COL.date, "font-semibold hidden sm:table-cell")}
              >
                Ajouté
              </TableHead>
              <TableHead
                className={cn(COL.actions, "font-semibold text-right pr-4")}
              >
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact, i) => {
              const selected = selectedIds.has(contact.id);
              const displayName = contact.name?.trim();

              return (
                <TableRow
                  key={contact.id}
                  className={cn(
                    "border-border/30",
                    i % 2 === 1 && "bg-muted/10",
                    selected && "bg-neon/5"
                  )}
                >
                  <TableCell className={cn(COL.check, "pl-4 align-middle")}>
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => onToggleSelect(contact.id)}
                      className="h-4 w-4 rounded border-border accent-[hsl(var(--neon))] cursor-pointer"
                      aria-label={`Sélectionner ${displayName || contact.phone}`}
                    />
                  </TableCell>
                  <TableCell className={cn(COL.contact, "align-middle")}>
                    <div className="flex items-center gap-3 min-w-0">
                      <ContactAvatar name={contact.name} />
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="font-medium truncate leading-tight">
                          {displayName || (
                            <span className="text-muted-foreground italic font-normal">
                              Sans nom
                            </span>
                          )}
                        </p>
                        <CountryBadge phone={contact.phone} />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className={cn(COL.phone, "align-middle")}>
                    <div className="flex items-center gap-1 min-w-0">
                      <code className="font-mono text-sm truncate bg-muted/40 px-2 py-0.5 rounded-md">
                        {contact.phone}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 rounded-md"
                        onClick={() => copyPhone(contact.phone)}
                        title="Copier le numéro"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                  {displayKeys.map((key) => {
                    const value = getDisplayCellValue(contact, key);
                    return (
                      <TableCell
                        key={key}
                        className={cn(
                          COL.custom,
                          "align-middle hidden md:table-cell"
                        )}
                      >
                        <span
                          className="block text-sm text-muted-foreground truncate"
                          title={value}
                        >
                          {value || "—"}
                        </span>
                      </TableCell>
                    );
                  })}
                  <TableCell
                    className={cn(
                      COL.date,
                      "align-middle text-sm text-muted-foreground hidden sm:table-cell"
                    )}
                  >
                    {format(new Date(contact.created_at), "dd MMM yyyy", {
                      locale: fr,
                    })}
                  </TableCell>
                  <TableCell
                    className={cn(COL.actions, "align-middle text-right pr-4")}
                  >
                    <div className="inline-flex items-center justify-end gap-0.5">
                      <a
                        href={buildWhatsAppUrl(contact.phone, "")}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Ouvrir WhatsApp"
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "icon" }),
                          "h-8 w-8 rounded-lg hover:text-[hsl(152,76%,45%)]"
                        )}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg hover:text-neon"
                        onClick={() => onEdit(contact)}
                        title="Modifier"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg hover:text-destructive"
                        onClick={() => onDelete(contact)}
                        disabled={deletingId === contact.id}
                        title="Supprimer"
                      >
                        {deletingId === contact.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      {contacts.length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Aucun contact ne correspond aux filtres.
        </p>
      )}
    </Card>
  );
}
