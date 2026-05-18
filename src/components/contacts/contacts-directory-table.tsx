"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getContactFieldValue } from "@/lib/contacts";
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
import { ScrollArea } from "@/components/ui/scroll-area";
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

function ContactAvatar({ name, phone }: { name?: string | null; phone: string }) {
  const label = (name?.trim() || phone).slice(0, 2).toUpperCase();
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neon/20 bg-neon/10 text-xs font-semibold text-neon">
      {label}
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
      className="rounded-md text-[10px] font-normal border-border/60 shrink-0"
    >
      {country.flag} {formatDialDisplay(country.dialCode)}
    </Badge>
  );
}

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
  const copyPhone = async (phone: string) => {
    try {
      await navigator.clipboard.writeText(phone);
    } catch {
      /* ignore */
    }
  };

  return (
    <Card className="card-futurist overflow-hidden border-neon/10">
      <ScrollArea className="max-h-[calc(100vh-420px)] min-h-[200px]">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border/60">
              <TableHead className="w-10 pl-4">
                <input
                  type="checkbox"
                  checked={allSelected && contacts.length > 0}
                  onChange={onToggleSelectAll}
                  className="h-4 w-4 rounded border-border accent-[hsl(var(--neon))] cursor-pointer"
                  aria-label="Sélectionner tout"
                />
              </TableHead>
              <TableHead className="font-semibold">Contact</TableHead>
              <TableHead className="font-semibold">Téléphone</TableHead>
              {customKeys.slice(0, 4).map((key) => (
                <TableHead key={key} className="font-semibold min-w-[100px] hidden md:table-cell">
                  {key}
                </TableHead>
              ))}
              {customKeys.length > 4 && (
                <TableHead className="font-semibold hidden lg:table-cell">
                  +{customKeys.length - 4} champs
                </TableHead>
              )}
              <TableHead className="font-semibold hidden sm:table-cell">Ajouté</TableHead>
              <TableHead className="font-semibold text-right w-[120px] pr-4">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact, i) => {
              const selected = selectedIds.has(contact.id);
              return (
                <TableRow
                  key={contact.id}
                  className={cn(
                    "transition-colors border-border/30",
                    i % 2 === 0 ? "bg-transparent" : "bg-muted/15",
                    selected && "bg-neon/5 hover:bg-neon/8"
                  )}
                >
                  <TableCell className="pl-4">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => onToggleSelect(contact.id)}
                      className="h-4 w-4 rounded border-border accent-[hsl(var(--neon))] cursor-pointer"
                      aria-label={`Sélectionner ${contact.name || contact.phone}`}
                    />
                  </TableCell>
                  <TableCell>
                    <motion.div className="flex items-center gap-3 min-w-[140px]">
                      <ContactAvatar name={contact.name} phone={contact.phone} />
                      <motion.div className="min-w-0">
                        <p className="font-medium truncate">
                          {contact.name?.trim() || (
                            <span className="text-muted-foreground italic font-normal">
                              Sans nom
                            </span>
                          )}
                        </p>
                        <CountryBadge phone={contact.phone} />
                      </motion.div>
                    </motion.div>
                  </TableCell>
                  <TableCell>
                    <motion.div className="flex items-center gap-1.5">
                      <code className="font-mono text-sm text-foreground/90 bg-muted/40 px-2 py-0.5 rounded-md">
                        {contact.phone}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-md shrink-0"
                        onClick={() => copyPhone(contact.phone)}
                        title="Copier"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </motion.div>
                  </TableCell>
                  {customKeys.slice(0, 4).map((key) => {
                    const value = getContactFieldValue(contact, key);
                    return (
                      <TableCell key={key} className="text-sm max-w-[140px] hidden md:table-cell">
                        <span className="line-clamp-2 text-muted-foreground" title={value}>
                          {value || "—"}
                        </span>
                      </TableCell>
                    );
                  })}
                  {customKeys.length > 4 && (
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                      …
                    </TableCell>
                  )}
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap hidden sm:table-cell">
                    {format(new Date(contact.created_at), "dd MMM yyyy", {
                      locale: fr,
                    })}
                  </TableCell>
                  <TableCell className="text-right pr-4">
                    <motion.div className="flex justify-end gap-0.5">
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
                    </motion.div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ScrollArea>
      {contacts.length === 0 && (
        <motion.p className="py-12 text-center text-sm text-muted-foreground">
          Aucun contact ne correspond aux filtres.
        </motion.p>
      )}
    </Card>
  );
}
