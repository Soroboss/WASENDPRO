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
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookUser, Loader2, Phone } from "lucide-react";

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BookUser className="h-6 w-6" />
          Annuaire Global
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Tous les numéros uniques rencontrés lors des imports de campagnes
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="secondary">
          <Phone className="h-3 w-3 mr-1" />
          {contacts.length} contact{contacts.length !== 1 ? "s" : ""} unique
          {contacts.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : contacts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center text-muted-foreground">
            <BookUser className="h-12 w-12 mx-auto mb-4 opacity-40" />
            <p>Aucun contact pour le moment.</p>
            <p className="text-sm mt-1">
              Importez un fichier Excel lors de la création d&apos;une campagne.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Données personnalisées</TableHead>
                <TableHead>Ajouté le</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell className="font-medium">
                    {contact.name ?? "—"}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {contact.phone}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-md">
                      {Object.entries(contact.custom_data ?? {})
                        .filter(([k]) => !["Nom", "Téléphone"].includes(k))
                        .slice(0, 3)
                        .map(([k, v]) => (
                          <Badge
                            key={k}
                            variant="outline"
                            className="text-xs font-normal"
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
      )}
    </div>
  );
}
