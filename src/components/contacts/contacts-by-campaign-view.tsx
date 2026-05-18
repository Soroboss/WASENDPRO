"use client";

import { motion } from "framer-motion";
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
import { cn } from "@/lib/utils";
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
  return (
    <ScrollArea className="max-h-[calc(100vh-420px)] pr-1">
      <div className="space-y-5 pb-4">
        {groups.map(({ campaign, entries }) => {
          const sent = entries.filter((e) => e.log.status === "sent").length;
          const progress =
            entries.length > 0 ? Math.round((sent / entries.length) * 100) : 0;

          return (
            <Card
              key={campaign.id}
              className="card-futurist overflow-hidden border-neon/10"
            >
              <CardHeader className="pb-4 border-b border-border/40 bg-gradient-to-r from-muted/30 to-transparent">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2 min-w-0 flex-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-neon/25 bg-neon/10">
                        <Megaphone className="h-4 w-4 text-neon shrink-0" />
                      </span>
                      <span className="truncate">{campaign.name}</span>
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>
                        {format(new Date(campaign.created_at), "dd MMM yyyy", {
                          locale: fr,
                        })}
                      </span>
                      <span>·</span>
                      <span>
                        {entries.length} contact
                        {entries.length > 1 ? "s" : ""}
                      </span>
                      <Badge
                        variant="outline"
                        className="rounded-md text-[10px] border-[hsl(142,70%,45%)]/30 text-[hsl(152,76%,40%)]"
                      >
                        {sent} envoyé{sent > 1 ? "s" : ""}
                      </Badge>
                    </div>
                    <motion.div className="max-w-xs space-y-1.5 pt-1">
                      <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wider">
                        <span>Progression</span>
                        <span className="font-mono">{progress}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-neon to-cyan-neon transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </motion.div>
                  </div>
                  <Link href={`/dashboard/campaigns/${campaign.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg btn-neon-outline shrink-0"
                    >
                      Ouvrir
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="font-semibold">Nom</TableHead>
                      <TableHead className="font-semibold">Téléphone</TableHead>
                      <TableHead className="font-semibold">Statut</TableHead>
                      <TableHead className="font-semibold text-right w-[100px]">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map(({ contact, log, rowData }, i) => (
                      <TableRow
                        key={log.id}
                        className={cn(
                          "hover:bg-muted/20",
                          i % 2 === 1 && "bg-muted/10"
                        )}
                      >
                        <TableCell className="font-medium">
                          {contact.name ?? rowData?.["Nom"] ?? (
                            <span className="text-muted-foreground italic font-normal">
                              Sans nom
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <code className="font-mono text-sm text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-md">
                            {contact.phone}
                          </code>
                        </TableCell>
                        <TableCell>
                          {log.status === "sent" ? (
                            <Badge className="bg-[hsl(142,70%,45%)]/10 text-[hsl(152,76%,32%)] border-[hsl(142,70%,45%)]/25 rounded-md text-xs">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Envoyé
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="rounded-md text-xs"
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              En attente
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-0.5">
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
