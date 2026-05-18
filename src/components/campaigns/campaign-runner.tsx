"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
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
import { PageHeader } from "@/components/ui/page-header";
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
  ArrowLeft,
  Megaphone,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

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
      <div className="flex justify-center py-24">
        <Loader2 className="h-9 w-9 animate-spin text-muted-foreground/60" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <p className="text-muted-foreground text-center py-24">
        Campagne introuvable.
      </p>
    );
  }

  const sentCount = logs.filter((l) => l.status === "sent").length;
  const progress = logs.length > 0 ? Math.round((sentCount / logs.length) * 100) : 0;

  return (
    <div className="space-y-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors -mb-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux campagnes
      </Link>

      <PageHeader
        title={campaign.name}
        icon={Megaphone}
        description={
          <>
            {sentCount}/{logs.length} envoyés
            {campaign.scheduled_date && (
              <>
                {" "}
                · Programmée le{" "}
                {format(new Date(campaign.scheduled_date), "dd MMM yyyy HH:mm", {
                  locale: fr,
                })}
              </>
            )}
          </>
        }
        action={
          <Button variant="outline" className="rounded-xl" onClick={handleExport}>
            <FileDown className="h-4 w-4 mr-2" />
            Exporter le rapport
          </Button>
        }
      />

      <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Progression</span>
          <span className="font-semibold text-[hsl(142,70%,38%)]">{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-whatsapp to-whatsapp-dark transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Card className="card-elevated">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-[hsl(142,70%,38%)]" />
            Modèle de message
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm font-mono bg-muted/40 rounded-xl p-4 whitespace-pre-wrap leading-relaxed border border-border/40">
            {campaign.template_message}
          </p>
        </CardContent>
      </Card>

      <Card className="card-elevated overflow-hidden">
        <ScrollArea className="max-h-[520px]">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="font-semibold">Contact</TableHead>
                <TableHead className="font-semibold">Téléphone</TableHead>
                <TableHead className="font-semibold">Aperçu</TableHead>
                <TableHead className="font-semibold">Statut</TableHead>
                <TableHead className="text-right font-semibold">Action</TableHead>
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
                  <TableRow
                    key={log.id}
                    className={cn(
                      "transition-colors",
                      isSent && "bg-muted/20"
                    )}
                  >
                    <TableCell className="font-medium">
                      {log.contact.name ?? rowData["Nom"] ?? "—"}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {log.contact.phone}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {compiled}
                      </p>
                    </TableCell>
                    <TableCell>
                      {isSent ? (
                        <Badge className="bg-[hsl(142,70%,45%)]/10 text-[hsl(152,76%,32%)] border-[hsl(142,70%,45%)]/25 rounded-md">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Envoyé
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="rounded-md">
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
                        className={cn(
                          "rounded-lg min-w-[100px]",
                          !isSent && "btn-whatsapp"
                        )}
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
      </Card>
    </div>
  );
}
