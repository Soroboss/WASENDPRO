"use client";

import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { CampaignContactGroup, Contact } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  Loader2,
  Megaphone,
  Pencil,
  Trash2,
} from "lucide-react";

interface ContactsByCampaignViewProps {
  groups: CampaignContactGroup[];
  deletingId: string | null;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
}

export function ContactsByCampaignView({
  groups,
  deletingId,
  onEdit,
  onDelete,
}: ContactsByCampaignViewProps) {
  if (groups.length === 0) {
    return (
      <Card className="card-futurist border-dashed border-neon/20">
        <CardContent className="py-16 text-center text-muted-foreground">
          Aucune campagne avec des contacts pour le moment.
        </CardContent>
      </Card>
    );
  }

  return (
    <ScrollArea className="max-h-[calc(100vh-280px)] pr-4">
      <div className="space-y-4 pb-4">
        {groups.map(({ campaign, entries }) => {
          const sent = entries.filter((e) => e.log.status === "sent").length;
          return (
            <Card key={campaign.id} className="card-futurist overflow-hidden">
              <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Megaphone className="h-4 w-4 text-neon shrink-0" />
                      {campaign.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(campaign.created_at), "dd MMM yyyy", {
                        locale: fr,
                      })}
                      {" · "}
                      {entries.length} contact{entries.length > 1 ? "s" : ""}{" "}
                      · {sent} envoyé{sent > 1 ? "s" : ""}
                    </p>
                  </div>
                  <Link href={`/dashboard/campaigns/${campaign.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg btn-neon-outline"
                    >
                      Ouvrir la campagne
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="font-semibold">Nom</TableHead>
                      <TableHead className="font-semibold">Téléphone</TableHead>
                      <TableHead className="font-semibold">Statut</TableHead>
                      <TableHead className="font-semibold text-right w-[100px]">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map(({ contact, log, rowData }) => (
                      <TableRow key={log.id} className="hover:bg-muted/15">
                        <TableCell className="font-medium">
                          {contact.name ?? rowData?.["Nom"] ?? "—"}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {contact.phone}
                        </TableCell>
                        <TableCell>
                          {log.status === "sent" ? (
                            <Badge className="bg-[hsl(142,70%,45%)]/10 text-[hsl(152,76%,32%)] border-[hsl(142,70%,45%)]/25 rounded-md text-xs">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Envoyé
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="rounded-md text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              En attente
                            </Badge>
                          )}
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
              </CardContent>
            </Card>
          );
        })}
      </div>
    </ScrollArea>
  );
}
