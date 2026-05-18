"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getContactFieldValue } from "@/lib/contacts";
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
import { Button } from "@/components/ui/button";
import { Loader2, Pencil, Trash2 } from "lucide-react";

interface ContactsDirectoryTableProps {
  contacts: Contact[];
  customKeys: string[];
  deletingId: string | null;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
}

export function ContactsDirectoryTable({
  contacts,
  customKeys,
  deletingId,
  onEdit,
  onDelete,
}: ContactsDirectoryTableProps) {
  return (
    <Card className="card-futurist overflow-hidden">
      <ScrollArea className="max-h-[calc(100vh-280px)]">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="font-semibold sticky left-0 bg-muted/40 z-10">
                Nom
              </TableHead>
              <TableHead className="font-semibold">Téléphone</TableHead>
              {customKeys.map((key) => (
                <TableHead key={key} className="font-semibold min-w-[100px]">
                  {key}
                </TableHead>
              ))}
              <TableHead className="font-semibold">Ajouté le</TableHead>
              <TableHead className="font-semibold text-right w-[100px]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact) => (
              <TableRow key={contact.id} className="hover:bg-muted/20">
                <TableCell className="font-medium sticky left-0 bg-card z-10">
                  {contact.name ?? "—"}
                </TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {contact.phone}
                </TableCell>
                {customKeys.map((key) => {
                  const value = getContactFieldValue(contact, key);
                  return (
                    <TableCell key={key} className="text-sm max-w-[140px]">
                      <span className="line-clamp-2" title={value}>
                        {value || "—"}
                      </span>
                    </TableCell>
                  );
                })}
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {format(new Date(contact.created_at), "dd MMM yyyy", {
                    locale: fr,
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
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
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </Card>
  );
}
