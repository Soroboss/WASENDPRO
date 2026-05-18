"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { deleteContact, getContacts } from "@/lib/inforge";
import { downloadExcelTemplate } from "@/lib/excel";
import { getContactFieldValue, getCustomFieldKeys } from "@/lib/contacts";
import type { Contact } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContactFormDialog } from "@/components/contacts/contact-form-dialog";
import {
  BookUser,
  Download,
  Loader2,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getContacts();
      setContacts(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const customKeys = useMemo(() => getCustomFieldKeys(contacts), [contacts]);

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setEditOpen(true);
  };

  const handleDelete = async (contact: Contact) => {
    const label = contact.name || contact.phone;
    if (
      !confirm(
        `Supprimer ${label} ?\nLes entrées de campagne liées seront aussi retirées.`
      )
    ) {
      return;
    }
    setDeletingId(contact.id);
    try {
      await deleteContact(contact.id);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Suppression impossible.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Annuaire"
        description="Gérez vos contacts et leurs variables personnalisées"
        icon={BookUser}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg btn-neon-outline"
              onClick={() => downloadExcelTemplate()}
            >
              <Download className="h-4 w-4 mr-2" />
              Modèle Excel
            </Button>
            <Badge
              variant="secondary"
              className="rounded-lg px-3 py-1.5 text-sm font-medium gap-1.5"
            >
              <Users className="h-3.5 w-3.5" />
              {contacts.length} contact{contacts.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        }
      />

      <ContactFormDialog
        contact={editingContact}
        fieldKeys={customKeys}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={load}
      />

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-9 w-9 animate-spin text-neon/60" />
        </div>
      ) : contacts.length === 0 ? (
        <Card className="card-futurist border-dashed border-neon/20">
          <CardContent className="py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-neon/25 bg-neon/10 mx-auto mb-5 shadow-glow">
              <BookUser className="h-8 w-8 text-neon" />
            </div>
            <p className="font-semibold">Aucun contact</p>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
              Importez un fichier Excel lors de la création d&apos;une campagne,
              ou téléchargez le modèle avec plusieurs variables.
            </p>
            <Button
              className="mt-6 btn-whatsapp rounded-lg"
              onClick={() => downloadExcelTemplate()}
            >
              <Download className="h-4 w-4 mr-2" />
              Télécharger le modèle
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="card-futurist overflow-hidden">
          <ScrollArea className="max-h-[calc(100vh-220px)]">
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
                          onClick={() => handleEdit(contact)}
                          title="Modifier"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg hover:text-destructive"
                          onClick={() => handleDelete(contact)}
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
      )}
    </div>
  );
}
