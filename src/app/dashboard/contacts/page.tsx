"use client";

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getContacts } from "@/lib/inforge";
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
import { PageHeader } from "@/components/ui/page-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookUser, Loader2, Users } from "lucide-react";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-8">
      <PageHeader
        title="Annuaire"
        description="Tous vos contacts importés, regroupés au même endroit"
        icon={BookUser}
        action={
          <Badge
            variant="secondary"
            className="rounded-lg px-3 py-1.5 text-sm font-medium gap-1.5"
          >
            <Users className="h-3.5 w-3.5" />
            {contacts.length} contact{contacts.length !== 1 ? "s" : ""}
          </Badge>
        }
      />

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-9 w-9 animate-spin text-muted-foreground/60" />
        </div>
      ) : contacts.length === 0 ? (
        <Card className="card-elevated border-dashed">
          <CardContent className="py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent mx-auto mb-5">
              <BookUser className="h-8 w-8 text-[hsl(142,70%,38%)]" />
            </div>
            <p className="font-semibold">Aucun contact</p>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
              Importez un fichier Excel lors de la création d&apos;une campagne.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="card-elevated overflow-hidden">
          <ScrollArea className="max-h-[calc(100vh-220px)]">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="font-semibold">Nom</TableHead>
                  <TableHead className="font-semibold">Téléphone</TableHead>
                  <TableHead className="font-semibold">Infos</TableHead>
                  <TableHead className="font-semibold">Ajouté le</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">
                      {contact.name ?? "—"}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {contact.phone}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5 max-w-md">
                        {Object.entries(contact.custom_data ?? {})
                          .filter(([k]) => !["Nom", "Téléphone"].includes(k))
                          .slice(0, 3)
                          .map(([k, v]) => (
                            <Badge
                              key={k}
                              variant="outline"
                              className="text-xs font-normal rounded-md bg-background"
                            >
                              {k}: {v}
                            </Badge>
                          ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(contact.created_at), "dd MMM yyyy", {
                        locale: fr,
                      })}
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
