"use client";

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { compileMessage } from "@/lib/message";
import { openWhatsApp } from "@/lib/whatsapp";
import { exportCampaignReport } from "@/lib/excel";
import {
  getCampaign,
  getCampaignLogs,
  markContactAsSent,
} from "@/lib/inforge";
import type { Campaign, CampaignLog, Contact } from "@/types";
import {
  Send,
  FileDown,
  CheckCircle2,
  Clock,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LogWithContact extends CampaignLog {
  contact: Contact;
}

interface CampaignRunnerProps {
  campaignId: string;
}

export function CampaignRunner({ campaignId }: CampaignRunnerProps) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [logs, setLogs] = useState<LogWithContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, l] = await Promise.all([
        getCampaign(campaignId),
        getCampaignLogs(campaignId),
      ]);
      setCampaign(c);
      setLogs(l as LogWithContact[]);
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    load();
  }, [load]);

  const getRowData = (contact: Contact): Record<string, string> => {
    return contact.custom_data ?? {};
  };

  const handleSend = async (log: LogWithContact) => {
    if (!campaign || log.status === "sent") return;
    const rowData = getRowData(log.contact);
    const compiled = compileMessage(campaign.template_message, rowData);
    const phone = log.contact.phone;

    setSendingId(log.contact_id);
    openWhatsApp(phone, compiled);

    try {
      await markContactAsSent(campaign.id, log.contact_id);
      setLogs((prev) =>
        prev.map((l) =>
          l.contact_id === log.contact_id
            ? { ...l, status: "sent" as const, sent_at: new Date().toISOString() }
            : l
        )
      );
    } finally {
      setSendingId(null);
    }
  };

  const handleExport = () => {
    if (!campaign) return;
    const report = logs.map((log) => {
      const rowData = getRowData(log.contact);
      const compiled = compileMessage(campaign.template_message, rowData);
      return {
        name: log.contact.name ?? rowData["Nom"] ?? "—",
        phone: log.contact.phone,
        message: compiled,
        status:
          log.status === "sent"
            ? "Envoyé"
            : log.status === "failed"
              ? "Échoué"
              : "En attente",
        sentAt: log.sent_at
          ? format(new Date(log.sent_at), "dd/MM/yyyy HH:mm", { locale: fr })
          : "—",
      };
    });
    exportCampaignReport(
      report,
      `rapport_${campaign.name.replace(/\s+/g, "_")}.xlsx`
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <p className="text-muted-foreground text-center py-20">
        Campagne introuvable.
      </p>
    );
  }

  const sentCount = logs.filter((l) => l.status === "sent").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{campaign.name}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {sentCount}/{logs.length} envoyés
            {campaign.scheduled_date && (
              <> · Programmée le{" "}
                {format(new Date(campaign.scheduled_date), "dd MMM yyyy HH:mm", {
                  locale: fr,
                })}
              </>
            )}
          </p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <FileDown className="h-4 w-4 mr-2" />
          Exporter le rapport
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Modèle de message
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm font-mono bg-muted/50 rounded-lg p-3 whitespace-pre-wrap">
            {campaign.template_message}
          </p>
        </CardContent>
      </Card>

      <ScrollArea className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contact</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Aperçu du message</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => {
              const rowData = getRowData(log.contact);
              const compiled = compileMessage(
                campaign.template_message,
                rowData
              );
              const isSent = log.status === "sent";
              const isSending = sendingId === log.contact_id;

              return (
                <TableRow key={log.id} className={isSent ? "opacity-60" : ""}>
                  <TableCell className="font-medium">
                    {log.contact.name ?? rowData["Nom"] ?? "—"}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {log.contact.phone}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {compiled}
                    </p>
                  </TableCell>
                  <TableCell>
                    {isSent ? (
                      <Badge className="bg-whatsapp/10 text-whatsapp-dark border-whatsapp/30">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Envoyé
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        En attente
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      disabled={isSent || isSending}
                      onClick={() => handleSend(log)}
                      className={
                        isSent
                          ? ""
                          : "bg-whatsapp hover:bg-whatsapp-dark text-white"
                      }
                    >
                      {isSending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-1" />
                          {isSent ? "Envoyé" : "Envoyer"}
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
